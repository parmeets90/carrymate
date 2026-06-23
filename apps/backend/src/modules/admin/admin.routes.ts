import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate';
import { rejectKycSchema, setStatusSchema, resolveDisputeSchema } from './admin.validators';
import {
  getPendingKyc,
  postApproveKyc,
  postRejectKyc,
  getUsers,
  getUser,
  postSetStatus,
  getRequests,
  postExpireRequest,
  postApproveReview,
  getOrders,
  postRefundOrder,
  getDisputes,
  postResolveDispute,
  getMetrics_,
  getQueue,
  getFraudQueue,
  postClearHold,
  getFailedPayouts,
  postRetryPayout,
} from './admin.controller';

export const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin);

adminRouter.get('/metrics', getMetrics_);
adminRouter.get('/queue', getQueue);
adminRouter.get('/fraud/queue', getFraudQueue);
adminRouter.post('/orders/:orderId/clear-hold', postClearHold);
adminRouter.get('/payouts/failed', getFailedPayouts);
adminRouter.post('/orders/:orderId/retry-payout', postRetryPayout);

adminRouter.get('/kyc/pending', getPendingKyc);
adminRouter.post('/kyc/:userId/approve', postApproveKyc);
adminRouter.post('/kyc/:userId/reject', validateBody(rejectKycSchema), postRejectKyc);

adminRouter.get('/users', getUsers);
adminRouter.get('/users/:userId', getUser);
adminRouter.post('/users/:userId/status', validateBody(setStatusSchema), postSetStatus);

adminRouter.get('/requests', getRequests);
adminRouter.post('/requests/:requestId/expire', postExpireRequest);
adminRouter.post('/requests/:requestId/approve-review', postApproveReview);

adminRouter.get('/orders', getOrders);
adminRouter.post('/orders/:orderId/refund', postRefundOrder);

adminRouter.get('/disputes', getDisputes);
adminRouter.post('/disputes/:disputeId/resolve', validateBody(resolveDisputeSchema), postResolveDispute);
