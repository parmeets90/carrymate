import type {
  ApiResponse,
  AuthResult,
  AuthTokens,
  HealthStatus,
  PublicUser,
  Paginated,
  AdminKycReviewItem,
  DeliveryRequestSummary,
  OrderView,
} from '@carrymate/shared';

type AdminOrder = OrderView & { senderName: string | null; travelerName: string | null };

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

const ACCESS_KEY = 'cm_admin_access';
const REFRESH_KEY = 'cm_admin_refresh';

export const tokenStore = {
  get access() {
    return localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  set(tokens: AuthTokens) {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

async function raw<T>(path: string, init: RequestInit, withAuth: boolean): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init.headers as Record<string, string>) ?? {}),
  };
  if (withAuth && tokenStore.access) headers.Authorization = `Bearer ${tokenStore.access}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  const body = (await res.json()) as ApiResponse<T>;
  if (!body.success) {
    const err = new Error(body.error.message) as Error & { code?: string };
    err.code = body.error.code;
    throw err;
  }
  return body.data;
}

/** Authenticated request with one transparent refresh-and-retry on token expiry. */
async function authed<T>(path: string, init: RequestInit = {}): Promise<T> {
  try {
    return await raw<T>(path, init, true);
  } catch (e) {
    const err = e as Error & { code?: string };
    if (err.code === 'TOKEN_EXPIRED' && tokenStore.refresh) {
      const tokens = await raw<AuthTokens>(
        '/v1/auth/refresh',
        { method: 'POST', body: JSON.stringify({ refreshToken: tokenStore.refresh }) },
        false,
      );
      tokenStore.set(tokens);
      return raw<T>(path, init, true);
    }
    throw err;
  }
}

export const api = {
  health: (): Promise<HealthStatus> => fetch(`${BASE_URL}/health`).then((r) => r.json()),

  adminLogin: (email: string, password: string) =>
    raw<AuthResult>(
      '/v1/auth/admin/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
      false,
    ),

  me: () => authed<PublicUser>('/v1/auth/me'),

  // Admin
  pendingKyc: () => authed<AdminKycReviewItem[]>('/v1/admin/kyc/pending'),
  approveKyc: (userId: string) =>
    authed<{ success: boolean }>(`/v1/admin/kyc/${userId}/approve`, { method: 'POST' }),
  rejectKyc: (userId: string, reason: string) =>
    authed<{ success: boolean }>(`/v1/admin/kyc/${userId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  users: (q: string, page = 1) =>
    authed<Paginated<PublicUser>>(`/v1/admin/users?q=${encodeURIComponent(q)}&page=${page}`),
  setUserStatus: (userId: string, status: 'ACTIVE' | 'SUSPENDED' | 'BANNED') =>
    authed<PublicUser>(`/v1/admin/users/${userId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
  requests: (status: string, page = 1) =>
    authed<Paginated<DeliveryRequestSummary>>(
      `/v1/admin/requests?page=${page}${status ? `&status=${status}` : ''}`,
    ),
  expireRequest: (requestId: string) =>
    authed<{ success: boolean }>(`/v1/admin/requests/${requestId}/expire`, { method: 'POST' }),
  orders: (page = 1) => authed<Paginated<AdminOrder>>(`/v1/admin/orders?page=${page}`),
  refundOrder: (orderId: string) =>
    authed<{ success: boolean }>(`/v1/admin/orders/${orderId}/refund`, { method: 'POST' }),
};
