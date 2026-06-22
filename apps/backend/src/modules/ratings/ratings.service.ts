import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';

/** Rate the counterparty after a completed order; recomputes their average. */
export async function rateOrder(
  orderId: string,
  raterId: string,
  stars: number,
  comment?: string,
): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || (order.senderId !== raterId && order.travelerId !== raterId)) {
    throw AppError.notFound('Order not found');
  }
  if (order.status !== 'COMPLETED') {
    throw new AppError(409, 'NOT_RATABLE', 'You can rate only after the order is completed.');
  }
  const rateeId = order.senderId === raterId ? order.travelerId : order.senderId;

  await prisma.rating.upsert({
    where: { orderId_raterId: { orderId, raterId } },
    update: { stars, comment: comment ?? null },
    create: { orderId, raterId, rateeId, stars, comment: comment ?? null },
  });

  const agg = await prisma.rating.aggregate({
    where: { rateeId },
    _avg: { stars: true },
    _count: true,
  });
  await prisma.user.update({
    where: { id: rateeId },
    data: { ratingAvg: agg._avg.stars ?? 5, ratingCount: agg._count },
  });
}
