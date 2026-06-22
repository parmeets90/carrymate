import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate';
import { submitKycSchema } from './kyc.validators';
import { postSubmitKyc, getKyc } from './kyc.controller';

export const kycRouter = Router();

kycRouter.use(authenticate);
kycRouter.post('/submit', validateBody(submitKycSchema), postSubmitKyc);
kycRouter.get('/status', getKyc);
