import type { Order, DeliveryRequest, User, Dispute } from '@prisma/client';
import type { OrderView } from '@carrymate/shared';

type OrderWithRelations = Order & {
  request: DeliveryRequest;
  sender: User;
  traveler: User;
  dispute?: Dispute | null;
};

const CONTACT_VISIBLE = new Set(['ESCROW_HELD', 'PAYOUT_INITIATED', 'COMPLETED', 'DISPUTED']);

/** Build the participant view; reveals counterparty phone + OTP per state/role. */
export function toOrderView(order: OrderWithRelations, viewerId: string): OrderView {
  const isSender = order.senderId === viewerId;
  const counterparty = isSender ? order.traveler : order.sender;
  const contactVisible = CONTACT_VISIBLE.has(order.status);
  // OTP is the sender's to share with the recipient, only while the item is in transit.
  const otpVisible = isSender && order.request.status === 'IN_TRANSIT';

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
    requestStatus: order.request.status,
    openBoxDone: order.openBoxAt != null,
    deliveredAt: order.deliveredAt ? order.deliveredAt.toISOString() : null,
    autoConfirmAt: order.autoConfirmAt ? order.autoConfirmAt.toISOString() : null,
    hasDispute: order.dispute != null && ['OPEN', 'UNDER_REVIEW'].includes(order.dispute.status),
    deliveryOtp: otpVisible ? order.deliveryOtp : null,
  };
}
