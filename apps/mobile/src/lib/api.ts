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
} from '@carrymate/shared';
import { API_BASE_URL } from '../config';
import { tokenStorage } from './storage';

const client: AxiosInstance = axios.create({ baseURL: API_BASE_URL, timeout: 15_000 });

let inMemoryAccess: string | null = null;
export function setAccessToken(token: string | null): void {
  inMemoryAccess = token;
}

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (!inMemoryAccess) inMemoryAccess = (await tokenStorage.get()).access;
  if (inMemoryAccess) config.headers.Authorization = `Bearer ${inMemoryAccess}`;
  return config;
});

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

export const api = {
  sendOtp: (phone: string) =>
    post<{ phoneMasked: string; expiresInSeconds: number }>('/v1/auth/send-otp', { phone }),
  verifyOtp: (phone: string, code: string, fcmToken?: string) =>
    post<AuthResult>('/v1/auth/verify-otp', { phone, code, fcmToken }),
  refresh: (refreshToken: string) => post<AuthTokens>('/v1/auth/refresh', { refreshToken }),
  me: () => get<PublicUser>('/v1/auth/me'),
  updateProfile: (data: { fullName?: string; email?: string; role?: string }) =>
    patch<PublicUser>('/v1/auth/profile', data),
  submitKyc: (data: { docType: string; fileKey?: string; docNumber?: string }) =>
    post<KycStatusResult>('/v1/kyc/submit', data),
  kycStatus: () => get<KycStatusResult>('/v1/kyc/status'),

  // Trips (traveler)
  createRoute: (data: Record<string, unknown>) => post<TravelRouteDto>('/v1/routes', data),
  myRoutes: () => get<TravelRouteDto[]>('/v1/routes'),
  availableForRoute: (routeId: string) =>
    get<DeliveryRequestSummary[]>(`/v1/requests/available?routeId=${routeId}`),

  // Requests (sender)
  createRequest: (data: Record<string, unknown>) =>
    post<DeliveryRequestDto>('/v1/requests', data),
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
};
