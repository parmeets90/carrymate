import { Router } from 'express';
import { UserRole } from '@carrymate/shared';
import { authenticate, requireKyc, requireRole } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate';
import { createBidSchema } from './bids.validators';
import { postBid, getMyBids, postWithdrawBid } from './bids.controller';

export const bidsRouter = Router();

// Traveler-facing bid actions.
bidsRouter.use(authenticate, requireKyc, requireRole(UserRole.TRAVELER));

bidsRouter.post('/', validateBody(createBidSchema), postBid);
bidsRouter.get('/mine', getMyBids);
bidsRouter.post('/:bidId/withdraw', postWithdrawBid);
