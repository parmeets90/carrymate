import { randomUUID } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, isStorageConfigured } from '../config/env';
import { AppError } from '../utils/errors';

/**
 * Object storage behind a small provider interface so the backend never depends
 * on a specific vendor. Today: Supabase Storage. Future: Azure Blob (swap this
 * file's implementation only).
 */
export interface StorageProvider {
  /** A signed URL the client can PUT bytes to, plus the stored object key. */
  createUploadUrl(key: string): Promise<{ uploadUrl: string; token: string; key: string }>;
  /** A short-lived signed URL to read a private object. */
  createDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
}

class SupabaseStorageProvider implements StorageProvider {
  private readonly client: SupabaseClient;
  private readonly bucket: string;

  constructor() {
    this.client = createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
    this.bucket = env.STORAGE_BUCKET;
  }

  async createUploadUrl(key: string) {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUploadUrl(key);
    if (error || !data) {
      throw AppError.internal(`Storage upload URL failed: ${error?.message ?? 'unknown'}`);
    }
    return { uploadUrl: data.signedUrl, token: data.token, key: data.path };
  }

  async createDownloadUrl(key: string, expiresInSeconds = 300) {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(key, expiresInSeconds);
    if (error || !data) {
      throw AppError.internal(`Storage download URL failed: ${error?.message ?? 'unknown'}`);
    }
    return data.signedUrl;
  }
}

let provider: StorageProvider | null = null;

/** The active storage provider, or 503 if storage isn't configured. */
export function storage(): StorageProvider {
  if (!isStorageConfigured) {
    throw new AppError(503, 'STORAGE_NOT_CONFIGURED', 'File storage is not configured.');
  }
  provider ??= new SupabaseStorageProvider();
  return provider;
}

/** Build a namespaced object key, e.g. kyc/<userId>/<uuid>.jpg */
export function buildStorageKey(purpose: string, userId: string, ext: string): string {
  return `${purpose}/${userId}/${randomUUID()}.${ext}`;
}
