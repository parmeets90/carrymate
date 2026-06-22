import type { Order, DeliveryRequest, User } from '@prisma/client';
import type { OrderView } from '@carrymate/shared';

type OrderWithRelations = Order & {
  request: DeliveryRequest;
  sender: User;
  traveler: User;
};

const CONTACT_VISIBLE = new Set(['ESCROW_HELD', 'PAYOUT_INITIATED', 'COMPLETED', 'DISPUTED']);

/** Build the participant view; reveals counterparty phone only after escrow. */
export function toOrderView(order: OrderWithRelations, viewerId: string): OrderView {
  const isSender = order.senderId === viewerId;
  const counterparty = isSender ? order.traveler : order.sender;
  const contactVisible = CONTACT_VISIBLE.has(order.status);

  return {
    id: order.id,
    requestId: order.requestId,
    amountInr: order.amountInr,
    commissionInr: order.commissionInr,
    payoutInr: order.payoutInr,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    requestTitle: order.request.title,
    originCity: order.request.originCity,
    destinationCity: order.request.destinationCity,
    role: isSender ? 'SENDER' : 'TRAVELER',
    counterpartyName: counterparty.fullName,
    counterpartyPhone: contactVisible ? counterparty.phone : null,
    escrowHeldAt: order.escrowHeldAt ? order.escrowHeldAt.toISOString() : null,
    releasedAt: order.releasedAt ? order.releasedAt.toISOString() : null,
  };
}
