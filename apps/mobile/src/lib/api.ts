import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type {
  ApiResponse,
  AuthResult,
  AuthTokens,
  PublicUser,
  KycStatusResult,
  TravelRouteDto,
  DeliveryRequestDto,
  DeliveryRequestSummary,
  BidDto,
  OrderDto,
  OrderView,
  ConversationSummary,
  MessageDto,
  NotificationDto,
  RequestInsights,
  MarketplacePulse,
  Paginated,
  TrustProfile,
} from '@carrymate/shared';
import { API_BASE_URL } from '../config';
import { tokenStorage } from './storage';

const client: AxiosInstance = axios.create({ baseURL: API_BASE_URL, timeout: 15_000 });

let inMemoryAccess: string | null = null;
export function setAccessToken(token: string | null): void {
  inMemoryAccess = token;
}

/** Called when the session can no longer be refreshed (true expiry) — store wires sign-out. */
let onAuthExpired: (() => void) | null = null;
export function setOnAuthExpired(cb: () => void): void {
  onAuthExpired = cb;
}

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (!inMemoryAccess) inMemoryAccess = (await tokenStorage.get()).access;
  if (inMemoryAccess) config.headers.Authorization = `Bearer ${inMemoryAccess}`;
  return config;
});

/**
 * Single-flight refresh: exchange the (rotating) refresh token for a fresh pair.
 * Uses a bare axios call so it bypasses this client's interceptors (no recursion),
 * and persists the NEW refresh token since the backend rotates it on every use.
 */
let refreshing: Promise<string | null> | null = null;
async function refreshAccess(): Promise<string | null> {
  const { refresh } = await tokenStorage.get();
  if (!refresh) return null;
  try {
    const res = await axios.post<ApiResponse<AuthTokens>>(
      `${API_BASE_URL}/v1/auth/refresh`,
      { refreshToken: refresh },
      { timeout: 15_000 },
    );
    if (!res.data.success) return null;
    const tokens = res.data.data;
    await tokenStorage.set(tokens);
    inMemoryAccess = tokens.accessToken;
    return tokens.accessToken;
  } catch {
    return null;
  }
}

/** An error carrying the backend's coded message + field-level validation details. */
export interface ApiClientError extends Error {
  code?: string;
  details?: Record<string, string[]>;
  status?: number;
}

/**
 * Turn non-2xx responses into clean, readable errors. Without this, axios throws
 * a generic "Request failed with status code 400" and the backend's real message
 * (e.g. "Deadline must be at least 3 days away") + field errors are lost.
 */
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const code = error?.response?.data?.error?.code;
    const original = error?.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // Access token expired → transparently refresh once and retry the request.
    if (
      status === 401 &&
      code === 'TOKEN_EXPIRED' &&
      original &&
      !original._retry &&
      !original.url?.includes('/auth/refresh')
    ) {
      original._retry = true;
      if (!refreshing) refreshing = refreshAccess().finally(() => (refreshing = null));
      const newAccess = await refreshing;
      if (newAccess) {
        original.headers.Authorization = `Bearer ${newAccess}`;
        return client(original);
      }
      // Refresh failed → the session is genuinely over; sign the user out.
      await tokenStorage.clear();
      inMemoryAccess = null;
      onAuthExpired?.();
    }

    const data = error?.response?.data;
    if (data && data.success === false && data.error) {
      const err = new Error(data.error.message) as ApiClientError;
      err.code = data.error.code;
      err.details = data.error.details;
      err.status = status;
      return Promise.reject(err);
    }
    return Promise.reject(error);
  },
);

/** First human-readable field error from a validation failure, if any. */
export function firstFieldError(e: unknown): string | undefined {
  const details = (e as ApiClientError)?.details;
  if (!details) return undefined;
  for (const messages of Object.values(details)) {
    if (messages?.length) return messages[0];
  }
  return undefined;
}

/** Unwrap the {success,data|error} envelope; throw a coded error on failure. */
function unwrap<T>(body: ApiResponse<T>): T {
  if (!body.success) {
    const err = new Error(body.error.message) as Error & { code?: string };
    err.code = body.error.code;
    throw err;
  }
  return body.data;
}

async function post<T>(path: string, data?: unknown): Promise<T> {
  const res = await client.post<ApiResponse<T>>(path, data);
  return unwrap(res.data);
}
async function get<T>(path: string): Promise<T> {
  const res = await client.get<ApiResponse<T>>(path);
  return unwrap(res.data);
}
async function patch<T>(path: string, data?: unknown): Promise<T> {
  const res = await client.patch<ApiResponse<T>>(path, data);
  return unwrap(res.data);
}
async function del<T>(path: string): Promise<T> {
  const res = await client.delete<ApiResponse<T>>(path);
  return unwrap(res.data);
}

/** Upload a picked image via multipart → returns the stored object key. */
export async function uploadPhoto(
  purpose: string,
  asset: { uri: string; type?: string; fileName?: string },
): Promise<string> {
  const form = new FormData();
  form.append('purpose', purpose);
  form.append('file', {
    uri: asset.uri,
    type: asset.type ?? 'image/jpeg',
    name: asset.fileName ?? 'photo.jpg',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
  const res = await client.post<ApiResponse<{ key: string }>>('/v1/uploads', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap(res.data).key;
}

export const api = {
  uploadPhoto,
  sendOtp: (phone: string) =>
    post<{ phoneMasked: string; expiresInSeconds: number }>('/v1/auth/send-otp', { phone }),
  verifyOtp: (phone: string, code: string, fcmToken?: string) =>
    post<AuthResult>('/v1/auth/verify-otp', { phone, code, fcmToken }),
  googleAuth: (idToken: string, fcmToken?: string) =>
    post<AuthResult>('/v1/auth/google', { idToken, fcmToken }),
  // Attach + verify a phone on the logged-in account (profile flow).
  startPhoneVerify: (phone: string) =>
    post<{ phoneMasked: string; expiresInSeconds: number }>('/v1/auth/phone/start', { phone }),
  confirmPhoneVerify: (phone: string, code: string) =>
    post<PublicUser>('/v1/auth/phone/verify', { phone, code }),
  registerFcmToken: (token: string) => post<{ success: boolean }>('/v1/auth/fcm-token', { token }),
  refresh: (refreshToken: string) => post<AuthTokens>('/v1/auth/refresh', { refreshToken }),
  me: () => get<PublicUser>('/v1/auth/me'),
  updateProfile: (data: { fullName?: string; email?: string; role?: string }) =>
    patch<PublicUser>('/v1/auth/profile', data),

  // DPDP data rights
  exportMyData: () => get<Record<string, unknown>>('/v1/account/export'),
  deleteAccount: () => post<{ deleted: boolean }>('/v1/account/delete'),
  submitKyc: (data: { docType: string; fileKey?: string; docNumber?: string }) =>
    post<KycStatusResult>('/v1/kyc/submit', data),
  kycStatus: () => get<KycStatusResult>('/v1/kyc/status'),
  kycProvider: () => get<{ provider: 'didit' | 'manual' }>('/v1/kyc/provider'),
  startKycVerification: () => post<{ url: string }>('/v1/kyc/verify/start'),

  // Trips (traveler)
  createRoute: (data: Record<string, unknown>) => post<TravelRouteDto>('/v1/routes', data),
  updateRoute: (id: string, data: Record<string, unknown>) =>
    patch<TravelRouteDto>(`/v1/routes/${id}`, data),
  deleteRoute: (id: string) => del<{ success: boolean }>(`/v1/routes/${id}`),
  myRoutes: () => get<TravelRouteDto[]>('/v1/routes'),
  availableForRoute: (routeId: string) =>
    get<DeliveryRequestSummary[]>(`/v1/requests/available?routeId=${routeId}`),

  // Requests (sender)
  createRequest: (data: Record<string, unknown>) =>
    post<DeliveryRequestDto>('/v1/requests', data),
  updateRequest: (id: string, data: Record<string, unknown>) =>
    patch<DeliveryRequestDto>(`/v1/requests/${id}`, data),
  deleteRequest: (id: string) => del<{ success: boolean }>(`/v1/requests/${id}`),
  relistRequest: (id: string) => post<DeliveryRequestDto>(`/v1/requests/${id}/relist`),
  requestInsights: (id: string) => get<RequestInsights>(`/v1/requests/${id}/insights`),
  todayPulse: () => get<MarketplacePulse>('/v1/requests/stats/today'),
  myRequests: () => get<DeliveryRequestDto[]>('/v1/requests'),
  requestBids: (requestId: string) => get<BidDto[]>(`/v1/requests/${requestId}/bids`),
  acceptBid: (requestId: string, bidId: string) =>
    post<OrderDto>(`/v1/requests/${requestId}/bids/${bidId}/accept`),

  // Bids (traveler)
  createBid: (data: Record<string, unknown>) => post<BidDto>('/v1/bids', data),
  myBids: () => get<BidDto[]>('/v1/bids/mine'),

  // Orders / escrow
  myOrders: () => get<OrderView[]>('/v1/orders'),
  payOrder: (orderId: string) => post<OrderView>(`/v1/orders/${orderId}/pay`),
  releaseOrder: (orderId: string) => post<OrderView>(`/v1/orders/${orderId}/release`),

  // Fulfillment
  openBox: (orderId: string, data: Record<string, unknown>) =>
    post<OrderView>(`/v1/orders/${orderId}/open-box`, data),
  deliverOrder: (orderId: string, data: Record<string, unknown>) =>
    post<OrderView>(`/v1/orders/${orderId}/deliver`, data),
  disputeOrder: (orderId: string, data: Record<string, unknown>) =>
    post<{ id: string; status: string }>(`/v1/orders/${orderId}/dispute`, data),
  rateOrder: (orderId: string, data: Record<string, unknown>) =>
    post<{ success: boolean }>(`/v1/orders/${orderId}/rate`, data),

  // Chat (Phase 5)
  conversations: () => get<ConversationSummary[]>('/v1/chat/conversations'),
  conversationForOrder: (orderId: string) =>
    get<{ id: string; orderId: string }>(`/v1/chat/order/${orderId}`),
  messages: (conversationId: string) =>
    get<MessageDto[]>(`/v1/chat/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, body: string) =>
    post<MessageDto>(`/v1/chat/conversations/${conversationId}/messages`, { body }),

  // Notifications (Phase 5)
  notifications: (page = 1) =>
    get<Paginated<NotificationDto>>(`/v1/notifications?page=${page}`),
  unreadCount: () => get<{ count: number }>('/v1/notifications/unread-count'),
  markNotificationRead: (id: string) => post<{ ok: boolean }>(`/v1/notifications/${id}/read`),
  markAllNotificationsRead: () => post<{ count: number }>('/v1/notifications/read-all'),

  // Public trust profile (Phase 7) — vet a counterparty; no PII.
  userProfile: (userId: string) => get<TrustProfile>(`/v1/users/${userId}/profile`),
};
