import { Router } from 'express';
import { UserRole } from '@carrymate/shared';
import { authenticate, requireKyc, requireRole, requireVerifiedPhone } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate';
import {
  getMyOrders,
  getOrderById,
  postPay,
  postRelease,
  postOpenBox,
  postDeliver,
  postDispute,
  postRate,
} from './orders.controller';
import { openBoxSchema, deliverSchema, disputeSchema, rateSchema } from './orders.validators';

export const ordersRouter = Router();

ordersRouter.use(authenticate, requireKyc);

ordersRouter.get('/', getMyOrders);
ordersRouter.get('/:orderId', getOrderById);

// Sender: fund escrow, then release on receipt.
ordersRouter.post('/:orderId/pay', requireRole(UserRole.SENDER), requireVerifiedPhone, postPay);
ordersRouter.post('/:orderId/release', requireRole(UserRole.SENDER), postRelease);

// Traveler: open-box at pickup, then deliver with handover code + proof.
ordersRouter.post('/:orderId/open-box', requireRole(UserRole.TRAVELER), validateBody(openBoxSchema), postOpenBox);
ordersRouter.post('/:orderId/deliver', requireRole(UserRole.TRAVELER), validateBody(deliverSchema), postDeliver);

// Either participant: dispute (while escrow held) and rate (after completion).
ordersRouter.post('/:orderId/dispute', validateBody(disputeSchema), postDispute);
ordersRouter.post('/:orderId/rate', validateBody(rateSchema), postRate);
