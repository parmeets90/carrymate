import type { RequestHandler } from 'express';
import { ok } from '../../utils/response';
import { toPublicUser } from '../users/user.serializer';
import {
  sendLoginOtp,
  verifyLoginOtp,
  refreshSession,
  logout,
  updateProfile,
  adminLogin,
  googleAuth,
  startPhoneVerification,
  confirmPhoneVerification,
} from './auth.service';
import type {
  SendOtpInput,
  VerifyOtpInput,
  RefreshInput,
  UpdateProfileInput,
  AdminLoginInput,
  GoogleAuthInput,
  StartPhoneInput,
  VerifyPhoneInput,
} from './auth.validators';

/** Mask a phone for display, keeping country code + last 2 digits. */
function maskPhone(phone: string): string {
  if (phone.length < 6) return phone;
  return `${phone.slice(0, 3)}${'*'.repeat(phone.length - 5)}${phone.slice(-2)}`;
}

export const postSendOtp: RequestHandler = async (req, res) => {
  const { phone } = req.body as SendOtpInput;
  const { expiresInSeconds } = await sendLoginOtp(phone);
  ok(res, { phoneMasked: maskPhone(phone), expiresInSeconds });
};

export const postVerifyOtp: RequestHandler = async (req, res) => {
  const { phone, code, fcmToken } = req.body as VerifyOtpInput;
  const result = await verifyLoginOtp(phone, code, fcmToken);
  ok(res, result);
};

export const postGoogleAuth: RequestHandler = async (req, res) => {
  const { idToken, fcmToken } = req.body as GoogleAuthInput;
  ok(res, await googleAuth(idToken, fcmToken));
};

export const postStartPhone: RequestHandler = async (req, res) => {
  const { phone } = req.body as StartPhoneInput;
  const { expiresInSeconds } = await startPhoneVerification(req.user!.id, phone);
  ok(res, { phoneMasked: maskPhone(phone), expiresInSeconds });
};

export const postVerifyPhone: RequestHandler = async (req, res) => {
  const { phone, code } = req.body as VerifyPhoneInput;
  ok(res, await confirmPhoneVerification(req.user!.id, phone, code));
};

export const postAdminLogin: RequestHandler = async (req, res) => {
  const { email, password } = req.body as AdminLoginInput;
  const result = await adminLogin(email, password);
  ok(res, result);
};

export const postRefresh: RequestHandler = async (req, res) => {
  const { refreshToken } = req.body as RefreshInput;
  const tokens = await refreshSession(refreshToken);
  ok(res, tokens);
};

export const postLogout: RequestHandler = async (req, res) => {
  const { refreshToken } = req.body as RefreshInput;
  await logout(refreshToken);
  ok(res, { success: true });
};

export const getMe: RequestHandler = (req, res) => {
  ok(res, toPublicUser(req.user!));
};

export const patchProfile: RequestHandler = async (req, res) => {
  const input = req.body as UpdateProfileInput;
  const user = await updateProfile(req.user!.id, input);
  ok(res, user);
};
