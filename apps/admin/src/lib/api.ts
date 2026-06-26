import type {
  ApiResponse,
  AuthResult,
  AuthTokens,
  HealthStatus,
  PublicUser,
  Paginated,
  AdminKycReviewItem,
  AdminMetrics,
  DeliveryRequestSummary,
  OrderView,
  DisputeView,
  FraudQueueItem,
  FailedPayoutItem,
  AdminQueueItem,
  PendingRouteItem,
  ScanRuleDto,
  ScanRuleKind,
  TestimonialDto,
  FounderDto,
  FaqItemDto,
  SiteSettingsDto,
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
  user: (userId: string) => authed<AdminKycReviewItem>(`/v1/admin/users/${userId}`),
  setUserStatus: (userId: string, status: 'ACTIVE' | 'SUSPENDED' | 'BANNED') =>
    authed<PublicUser>(`/v1/admin/users/${userId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
  deleteUser: (userId: string) =>
    authed<{ success: boolean }>(`/v1/admin/users/${userId}`, { method: 'DELETE' }),
  fileUrl: (key: string) =>
    authed<{ url: string }>(`/v1/admin/file?key=${encodeURIComponent(key)}`),
  requests: (status: string, page = 1) =>
    authed<Paginated<DeliveryRequestSummary>>(
      `/v1/admin/requests?page=${page}${status ? `&status=${status}` : ''}`,
    ),
  expireRequest: (requestId: string) =>
    authed<{ success: boolean }>(`/v1/admin/requests/${requestId}/expire`, { method: 'POST' }),
  approveReview: (requestId: string) =>
    authed<{ success: boolean }>(`/v1/admin/requests/${requestId}/approve-review`, { method: 'POST' }),
  orders: (page = 1) => authed<Paginated<AdminOrder>>(`/v1/admin/orders?page=${page}`),
  refundOrder: (orderId: string) =>
    authed<{ success: boolean }>(`/v1/admin/orders/${orderId}/refund`, { method: 'POST' }),
  disputes: () => authed<DisputeView[]>('/v1/admin/disputes'),
  resolveDispute: (id: string, decision: 'REFUND_SENDER' | 'RELEASE_TRAVELER', note: string) =>
    authed<{ success: boolean }>(`/v1/admin/disputes/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ decision, note }),
    }),

  // Phase 6 — safety & ops
  metrics: () => authed<AdminMetrics>('/v1/admin/metrics'),
  queue: () => authed<AdminQueueItem[]>('/v1/admin/queue'),
  pendingRoutes: () => authed<PendingRouteItem[]>('/v1/admin/routes/pending'),
  verifyRoute: (routeId: string) =>
    authed<{ success: boolean }>(`/v1/admin/routes/${routeId}/verify`, { method: 'POST' }),
  fraudQueue: () => authed<FraudQueueItem[]>('/v1/admin/fraud/queue'),
  clearHold: (orderId: string) =>
    authed<{ success: boolean }>(`/v1/admin/orders/${orderId}/clear-hold`, { method: 'POST' }),
  failedPayouts: () => authed<FailedPayoutItem[]>('/v1/admin/payouts/failed'),
  retryPayout: (orderId: string) =>
    authed<{ success: boolean }>(`/v1/admin/orders/${orderId}/retry-payout`, { method: 'POST' }),

  scanRules: () => authed<ScanRuleDto[]>('/v1/admin/scan-rules'),
  createScanRule: (input: ScanRuleInput) =>
    authed<ScanRuleDto>('/v1/admin/scan-rules', { method: 'POST', body: JSON.stringify(input) }),
  updateScanRule: (id: string, input: Partial<ScanRuleInput>) =>
    authed<ScanRuleDto>(`/v1/admin/scan-rules/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteScanRule: (id: string) =>
    authed<{ success: boolean }>(`/v1/admin/scan-rules/${id}`, { method: 'DELETE' }),

  // ----- Website CMS -----
  siteSettings: () => authed<SiteSettingsDto>('/v1/admin/site/settings'),
  updateSiteSettings: (input: Partial<SiteSettingsDto>) =>
    authed<SiteSettingsDto>('/v1/admin/site/settings', {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  testimonials: () => authed<TestimonialDto[]>('/v1/admin/site/testimonials'),
  createTestimonial: (input: TestimonialInput) =>
    authed<TestimonialDto>('/v1/admin/site/testimonials', { method: 'POST', body: JSON.stringify(input) }),
  updateTestimonial: (id: string, input: Partial<TestimonialInput>) =>
    authed<TestimonialDto>(`/v1/admin/site/testimonials/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteTestimonial: (id: string) =>
    authed<{ success: boolean }>(`/v1/admin/site/testimonials/${id}`, { method: 'DELETE' }),

  founders: () => authed<FounderDto[]>('/v1/admin/site/founders'),
  createFounder: (input: FounderInput) =>
    authed<FounderDto>('/v1/admin/site/founders', { method: 'POST', body: JSON.stringify(input) }),
  updateFounder: (id: string, input: Partial<FounderInput>) =>
    authed<FounderDto>(`/v1/admin/site/founders/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteFounder: (id: string) =>
    authed<{ success: boolean }>(`/v1/admin/site/founders/${id}`, { method: 'DELETE' }),

  faqs: () => authed<FaqItemDto[]>('/v1/admin/site/faqs'),
  createFaq: (input: FaqInput) =>
    authed<FaqItemDto>('/v1/admin/site/faqs', { method: 'POST', body: JSON.stringify(input) }),
  updateFaq: (id: string, input: Partial<FaqInput>) =>
    authed<FaqItemDto>(`/v1/admin/site/faqs/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteFaq: (id: string) =>
    authed<{ success: boolean }>(`/v1/admin/site/faqs/${id}`, { method: 'DELETE' }),
};

export type SiteAccentValue = 'gold' | 'mint' | 'sky' | 'ember';
export type TestimonialInput = {
  quote: string;
  name: string;
  role: string;
  rating?: number;
  accent?: SiteAccentValue;
  sortOrder?: number;
  active?: boolean;
};
export type FounderInput = {
  name: string;
  role: string;
  initials: string;
  imageUrl?: string;
  accent?: SiteAccentValue;
  sortOrder?: number;
  active?: boolean;
};
export type FaqInput = {
  question: string;
  answer: string;
  sortOrder?: number;
  active?: boolean;
};

export type ScanRuleInput = {
  label: string;
  kind: ScanRuleKind;
  category?: string | null;
  active?: boolean;
};

/** Fetch a short-lived signed URL for a private file key and open it in a new tab. */
export async function openFile(key: string): Promise<void> {
  try {
    const { url } = await api.fileUrl(key);
    window.open(url, '_blank', 'noopener');
  } catch (e) {
    window.alert(`Could not open file: ${(e as Error).message}`);
  }
}
