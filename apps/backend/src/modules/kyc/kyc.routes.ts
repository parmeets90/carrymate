import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate';
import { submitKycSchema } from './kyc.validators';
import { postSubmitKyc, getKyc, postStartVerification, getKycProvider } from './kyc.controller';

export const kycRouter = Router();

kycRouter.use(authenticate);
kycRouter.get('/provider', getKycProvider);
kycRouter.post('/verify/start', postStartVerification);
kycRouter.post('/submit', validateBody(submitKycSchema), postSubmitKyc);
kycRouter.get('/status', getKyc);
