import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { verifyAccessToken } from '../modules/auth/token.service';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';

/**
 * Realtime chat transport (Socket.IO).
 *
 * Auth: the JWT access token is passed in the handshake (`auth.token`) and
 * verified the same way as HTTP requests. Each socket joins a private
 * `user:<id>` room; clients additionally join `conversation:<id>` rooms (only
 * after a membership check) so a message fans out to exactly the two parties.
 */
let io: Server | null = null;

export function initRealtime(server: HttpServer): Server {
  io = new Server(server, {
    cors: { origin: '*' },
    // Keep idle connections cheap; the client reconnects automatically.
    pingInterval: 25_000,
    pingTimeout: 20_000,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('UNAUTHORIZED'));
    try {
      const { sub } = verifyAccessToken(token);
      socket.data.userId = sub;
      next();
    } catch {
      next(new Error('UNAUTHORIZED'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user:${userId}`);

    // Join a conversation room — only if the user is actually a participant.
    socket.on('chat:join', async (conversationId: string) => {
      if (typeof conversationId !== 'string') return;
      const conv = await prisma.conversation
        .findUnique({ where: { id: conversationId }, select: { senderId: true, travelerId: true } })
        .catch(() => null);
      if (conv && (conv.senderId === userId || conv.travelerId === userId)) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    socket.on('chat:leave', (conversationId: string) => {
      if (typeof conversationId === 'string') socket.leave(`conversation:${conversationId}`);
    });
  });

  logger.info('🔌 Realtime (Socket.IO) initialised');
  return io;
}

/** Message wire format — perspective-neutral; the client derives `mine`. */
export interface ChatMessageEvent {
  conversationId: string;
  message: {
    id: string;
    conversationId: string;
    senderId: string;
    type: string;
    body: string;
    piiRedacted: boolean;
    createdAt: string;
  };
}

/**
 * Push a new message to both participants' open threads, and nudge the
 * recipient's inbox (conversation list / unread badge) even if their thread
 * isn't open. No-op if realtime isn't initialised (e.g. tests).
 */
export function emitChatMessage(recipientUserId: string, event: ChatMessageEvent): void {
  if (!io) return;
  io.to(`conversation:${event.conversationId}`).emit('chat:message', event);
  io.to(`user:${recipientUserId}`).emit('chat:inbox', { conversationId: event.conversationId });
}
