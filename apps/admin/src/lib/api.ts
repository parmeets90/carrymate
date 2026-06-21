import type { ApiResponse, HealthStatus } from '@carrymate/shared';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

/** Thin fetch wrapper that unwraps the standard API envelope. */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  const body = (await res.json()) as ApiResponse<T>;
  if (!body.success) throw new Error(body.error.message);
  return body.data;
}

export const api = {
  health: (): Promise<HealthStatus> => fetch(`${BASE_URL}/health`).then((r) => r.json()),
  v1Info: () => request<{ name: string; version: string; message: string }>('/v1'),
};
