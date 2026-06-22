import type { RequestHandler } from 'express';
import { ok } from '../../utils/response';
import { toPublicUser } from '../users/user.serializer';
import { sendLoginOtp, verifyLoginOtp, refreshSession, logout } from './auth.service';
import type { SendOtpInput, VerifyOtpInput, RefreshInput } from './auth.validators';

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
