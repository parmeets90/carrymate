import type { ConversationSummary, MessageDto } from '@carrymate/shared';
import { NotificationType } from '@carrymate/shared';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
import { scrubPii } from '../../utils/pii';
import { createNotification } from '../notifications/notifications.service';
import { emitChatMessage } from '../../realtime/socket';

type Role = 'SENDER' | 'TRAVELER';

interface ConversationRow {
  id: string;
  orderId: string;
  senderId: string;
  travelerId: string;
  lastMessageAt: Date | null;
  senderLastReadAt: Date | null;
  travelerLastReadAt: Date | null;
}

function roleOf(conv: ConversationRow, userId: string): Role {
  if (conv.senderId === userId) return 'SENDER';
  if (conv.travelerId === userId) return 'TRAVELER';
  throw AppError.forbidden('You are not part of this conversation');
}

/**
 * Find (or lazily create) the chat thread for an order.
 * Chat unlocks only once escrow has been held — before payment, parties cannot
 * coordinate off-platform. After that, the thread persists through completion.
 */
async function ensureConversation(orderId: string, userId: string): Promise<ConversationRow> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || (order.senderId !== userId && order.travelerId !== userId)) {
    throw AppError.notFound('Order not found');
  }
  if (!order.escrowHeldAt) {
    throw new AppError(403, 'CHAT_LOCKED', 'Chat unlocks once payment is held in escrow.');
  }
  return prisma.conversation.upsert({
    where: { orderId },
    update: {},
    create: { orderId, senderId: order.senderId, travelerId: order.travelerId },
  });
}

function counterpartyId(conv: ConversationRow, userId: string): string {
  return conv.senderId === userId ? conv.travelerId : conv.senderId;
}

function myLastReadAt(conv: ConversationRow, role: Role): Date | null {
  return role === 'SENDER' ? conv.senderLastReadAt : conv.travelerLastReadAt;
}

async function unreadCountFor(conv: ConversationRow, userId: string, role: Role): Promise<number> {
  return prisma.message.count({
    where: {
      conversationId: conv.id,
      senderId: { not: userId },
      ...(myLastReadAt(conv, role) ? { createdAt: { gt: myLastReadAt(conv, role)! } } : {}),
    },
  });
}

function toMessageDto(
  m: { id: string; conversationId: string; senderId: string; type: string; body: string; piiRedacted: boolean; createdAt: Date },
  userId: string,
): MessageDto {
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    mine: m.senderId === userId,
    type: m.type as MessageDto['type'],
    body: m.body,
    piiRedacted: m.piiRedacted,
    createdAt: m.createdAt.toISOString(),
  };
}

/** List the user's chat threads, newest activity first, with unread counts. */
export async function listConversations(userId: string): Promise<ConversationSummary[]> {
  const convs = await prisma.conversation.findMany({
    where: { OR: [{ senderId: userId }, { travelerId: userId }] },
    include: {
      order: { include: { request: true, sender: true, traveler: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: [{ lastMessageAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
  });

  return Promise.all(
    convs.map(async (conv) => {
      const role = roleOf(conv, userId);
      const last = conv.messages[0];
      const counterparty = role === 'SENDER' ? conv.order.traveler : conv.order.sender;
      return {
        id: conv.id,
        orderId: conv.orderId,
        requestTitle: conv.order.request.title,
        counterpartyName: counterparty.fullName,
        role,
        orderStatus: conv.order.status,
        requestStatus: conv.order.request.status,
        lastMessage: last ? last.body : null,
        lastMessageAt: conv.lastMessageAt ? conv.lastMessageAt.toISOString() : null,
        unreadCount: await unreadCountFor(conv, userId, role),
      } satisfies ConversationSummary;
    }),
  );
}

/** Resolve (creating if needed) the conversation for an order — used to open chat from an order. */
export async function getConversationForOrder(
  orderId: string,
  userId: string,
): Promise<{ id: string; orderId: string }> {
  const conv = await ensureConversation(orderId, userId);
  return { id: conv.id, orderId: conv.orderId };
}

async function loadConversation(conversationId: string, userId: string): Promise<ConversationRow> {
  const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conv || (conv.senderId !== userId && conv.travelerId !== userId)) {
    throw AppError.notFound('Conversation not found');
  }
  return conv;
}

/** Return the thread's messages (oldest→newest) and mark them read for this user. */
export async function listMessages(
  conversationId: string,
  userId: string,
): Promise<MessageDto[]> {
  const conv = await loadConversation(conversationId, userId);
  const role = roleOf(conv, userId);
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: 200,
  });
  await prisma.conversation.update({
    where: { id: conversationId },
    data: role === 'SENDER' ? { senderLastReadAt: new Date() } : { travelerLastReadAt: new Date() },
  });
  return messages.map((m) => toMessageDto(m, userId));
}

/** Send a chat message. Body is PII-scrubbed server-side before storage/delivery. */
export async function sendMessage(
  conversationId: string,
  userId: string,
  rawBody: string,
): Promise<MessageDto> {
  const conv = await loadConversation(conversationId, userId);
  const role = roleOf(conv, userId);

  const text = rawBody.trim();
  if (!text) throw AppError.badRequest('Message cannot be empty.');
  if (text.length > 2000) throw AppError.badRequest('Message is too long (max 2000 chars).');

  const { clean, redacted } = scrubPii(text);
  if (!clean) {
    throw new AppError(422, 'MESSAGE_ALL_PII', 'Messages can’t contain only contact or payment details.');
  }

  const now = new Date();
  const message = await prisma.message.create({
    data: { conversationId, senderId: userId, type: 'TEXT', body: clean, piiRedacted: redacted },
  });
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: now,
      // sender has implicitly read up to their own message
      ...(role === 'SENDER' ? { senderLastReadAt: now } : { travelerLastReadAt: now }),
    },
  });

  const recipientId = counterpartyId(conv, userId);

  // Realtime: push to both open threads + the recipient's inbox badge.
  emitChatMessage(recipientId, {
    conversationId,
    message: {
      id: message.id,
      conversationId,
      senderId: message.senderId,
      type: message.type,
      body: message.body,
      piiRedacted: message.piiRedacted,
      createdAt: message.createdAt.toISOString(),
    },
  });

  // Notify the other party (best-effort, non-blocking inside createNotification).
  await createNotification({
    userId: recipientId,
    type: NotificationType.NEW_MESSAGE,
    title: 'New message',
    body: clean.length > 80 ? `${clean.slice(0, 77)}…` : clean,
    data: { conversationId, orderId: conv.orderId },
  });

  return toMessageDto(message, userId);
}
