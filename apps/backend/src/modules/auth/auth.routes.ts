import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validateBody } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth.middleware';
import {
  sendOtpSchema,
  verifyOtpSchema,
  refreshSchema,
  updateProfileSchema,
  adminLoginSchema,
} from './auth.validators';
import {
  postSendOtp,
  postVerifyOtp,
  postAdminLogin,
  postRefresh,
  postLogout,
  getMe,
  patchProfile,
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

const loginLimiter = rateLimit({
  windowMs: 10 * 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts' } },
});

authRouter.post('/admin/login', loginLimiter, validateBody(adminLoginSchema), postAdminLogin);
authRouter.post('/send-otp', otpLimiter, validateBody(sendOtpSchema), postSendOtp);
authRouter.post('/verify-otp', validateBody(verifyOtpSchema), postVerifyOtp);
authRouter.post('/refresh', validateBody(refreshSchema), postRefresh);
authRouter.post('/logout', validateBody(refreshSchema), postLogout);
authRouter.get('/me', authenticate, getMe);
authRouter.patch('/profile', authenticate, validateBody(updateProfileSchema), patchProfile);
