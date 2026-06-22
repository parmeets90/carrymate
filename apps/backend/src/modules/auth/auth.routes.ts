import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validateBody } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth.middleware';
import { sendOtpSchema, verifyOtpSchema, refreshSchema } from './auth.validators';
import {
  postSendOtp,
  postVerifyOtp,
  postRefresh,
  postLogout,
  getMe,
} from './auth.controller';

export const authRouter = Router();

// Tighter limit on OTP issuance (defense-in-depth alongside the per-phone DB limit).
const otpLimiter = rateLimit({
  windowMs: 10 * 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'OTP_RATE_LIMITED', message: 'Too many requests' } },
});

authRouter.post('/send-otp', otpLimiter, validateBody(sendOtpSchema), postSendOtp);
authRouter.post('/verify-otp', validateBody(verifyOtpSchema), postVerifyOtp);
authRouter.post('/refresh', validateBody(refreshSchema), postRefresh);
authRouter.post('/logout', validateBody(refreshSchema), postLogout);
authRouter.get('/me', authenticate, getMe);
