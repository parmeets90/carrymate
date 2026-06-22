import { Router } from 'express';
import { UserRole } from '@carrymate/shared';
import { authenticate, requireKyc, requireRole } from '../../middleware/auth.middleware';
import { getMyOrders, getOrderById, postPay, postRelease } from './orders.controller';

export const ordersRouter = Router();

ordersRouter.use(authenticate, requireKyc);

ordersRouter.get('/', getMyOrders);
ordersRouter.get('/:orderId', getOrderById);
// Sender funds escrow and later releases it on receipt.
ordersRouter.post('/:orderId/pay', requireRole(UserRole.SENDER), postPay);
ordersRouter.post('/:orderId/release', requireRole(UserRole.SENDER), postRelease);
