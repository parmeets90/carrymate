import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate';
import { rejectKycSchema, setStatusSchema } from './admin.validators';
import {
  getPendingKyc,
  postApproveKyc,
  postRejectKyc,
  getUsers,
  getUser,
  postSetStatus,
} from './admin.controller';

export const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin);

adminRouter.get('/kyc/pending', getPendingKyc);
adminRouter.post('/kyc/:userId/approve', postApproveKyc);
adminRouter.post('/kyc/:userId/reject', validateBody(rejectKycSchema), postRejectKyc);

adminRouter.get('/users', getUsers);
adminRouter.get('/users/:userId', getUser);
adminRouter.post('/users/:userId/status', validateBody(setStatusSchema), postSetStatus);
