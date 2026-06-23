import { Router } from 'express';
import { UserRole } from '@carrymate/shared';
import { authenticate, requireKyc, requireRole } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate';
import { createRequestSchema, updateRequestSchema } from './requests.validators';
import {
  postRequest,
  getMyRequests,
  getRequestById,
  postCancelRequest,
  patchRequest,
  deleteRequestHandler,
  postRelistRequest,
  getRequestInsightsHandler,
  getTodayPulseHandler,
  getAvailableRequests,
} from './requests.controller';
import { getRequestBids, postAcceptBid } from '../bids/bids.controller';

export const requestsRouter = Router();

requestsRouter.use(authenticate, requireKyc);

// Traveler: browse requests that match a route (declared before :requestId).
requestsRouter.get('/available', requireRole(UserRole.TRAVELER), getAvailableRequests);

// Marketplace pulse (any authed user) — static path before :requestId routes.
requestsRouter.get('/stats/today', getTodayPulseHandler);

// Sender: manage own requests.
requestsRouter.post('/', requireRole(UserRole.SENDER), validateBody(createRequestSchema), postRequest);
requestsRouter.get('/', requireRole(UserRole.SENDER), getMyRequests);
requestsRouter.get('/:requestId', requireRole(UserRole.SENDER), getRequestById);
requestsRouter.get('/:requestId/insights', requireRole(UserRole.SENDER), getRequestInsightsHandler);
requestsRouter.post('/:requestId/relist', requireRole(UserRole.SENDER), postRelistRequest);
requestsRouter.patch('/:requestId', requireRole(UserRole.SENDER), validateBody(updateRequestSchema), patchRequest);
requestsRouter.delete('/:requestId', requireRole(UserRole.SENDER), deleteRequestHandler);
requestsRouter.post('/:requestId/cancel', requireRole(UserRole.SENDER), postCancelRequest);

// Sender: view bids on a request and accept one.
requestsRouter.get('/:requestId/bids', requireRole(UserRole.SENDER), getRequestBids);
requestsRouter.post(
  '/:requestId/bids/:bidId/accept',
  requireRole(UserRole.SENDER),
  postAcceptBid,
);
