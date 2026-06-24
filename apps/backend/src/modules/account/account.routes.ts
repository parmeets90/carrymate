import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { getExport, postDelete, postConsent } from './account.controller';

export const accountRouter = Router();

// Self-service data rights — any authenticated user, no KYC gate.
accountRouter.use(authenticate);

accountRouter.get('/export', getExport);
accountRouter.post('/delete', postDelete);
accountRouter.post('/consent', postConsent);
