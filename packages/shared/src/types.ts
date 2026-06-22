/**
 * Shared API and domain types.
 */

import type { ErrorCode } from './constants';

/** Standard envelope every API endpoint returns. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: ErrorCode | string;
    message: string;
    /** Optional field-level validation details. */
    details?: Record<string, string[]>;
    requestId?: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/** Cursor/offset pagination wrapper. */
export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

/** A user as exposed to clients (no sensitive fields). */
export interface PublicUser {
  id: string;
  phone: string;
  email: string | null;
  fullName: string | null;
  role: string;
  status: string;
  kycStatus: string;
  phoneVerified: boolean;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
}

/** Access + refresh tokens returned to the client. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
}

/** Result of a successful OTP verification / login. */
export interface AuthResult {
  user: PublicUser;
  tokens: AuthTokens;
  isNewUser: boolean;
}

/** A KYC document as exposed to clients (no hashes). */
export interface KycDocumentDto {
  id: string;
  docType: string;
  status: string;
  rejectReason: string | null;
  fileKey: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

/** A user's KYC state plus their submitted documents. */
export interface KycStatusResult {
  kycStatus: string;
  documents: KycDocumentDto[];
}

/** A user + their documents, for the admin KYC review queue / detail view. */
export interface AdminKycReviewItem {
  user: PublicUser;
  documents: KycDocumentDto[];
}

/** A traveler's trip. */
export interface TravelRouteDto {
  id: string;
  originAirport: string;
  destinationAirport: string;
  departureDate: string;
  arrivalDate: string | null;
  capacityKg: number;
  capacityUsedKg: number;
  flightNumber: string | null;
  airline: string | null;
  ticketVerified: boolean;
  status: string;
  createdAt: string;
}

/** Full delivery request (owner view — includes recipient PII). */
export interface DeliveryRequestDto {
  id: string;
  title: string;
  description: string;
  category: string;
  weightKg: number;
  declaredValueInr: number;
  itemPhotos: string[];
  originCity: string;
  originAirport: string;
  destinationCity: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  deadlineDate: string;
  isFragile: boolean;
  senderNotes: string | null;
  status: string;
  createdAt: string;
}

/** Browse view of a request (no recipient PII; includes sender trust signals). */
export interface DeliveryRequestSummary {
  id: string;
  title: string;
  category: string;
  weightKg: number;
  declaredValueInr: number;
  originCity: string;
  destinationCity: string;
  deadlineDate: string;
  isFragile: boolean;
  status: string;
  createdAt: string;
  senderName: string | null;
  senderRating: number;
}

/** A bid, with the traveler's trust signals and trip summary. */
export interface BidDto {
  id: string;
  requestId: string;
  carryFeeInr: number;
  commissionInr: number;
  payoutInr: number;
  message: string | null;
  pickupPreference: string;
  pickupLocation: string | null;
  estimatedDeliveryDate: string;
  status: string;
  createdAt: string;
  traveler: {
    id: string;
    fullName: string | null;
    ratingAvg: number;
    ratingCount: number;
  };
  route: {
    originAirport: string;
    destinationAirport: string;
    departureDate: string;
    flightNumber: string | null;
  };
}

/** An order created when a bid is accepted (awaiting payment in Phase 3). */
export interface OrderDto {
  id: string;
  requestId: string;
  bidId: string;
  amountInr: number;
  commissionInr: number;
  payoutInr: number;
  status: string;
  createdAt: string;
}

/** Order as shown to a participant (sender or traveler), with escrow lifecycle. */
export interface OrderView {
  id: string;
  requestId: string;
  amountInr: number;
  commissionInr: number;
  payoutInr: number;
  status: string;
  createdAt: string;
  requestTitle: string;
  originCity: string;
  destinationCity: string;
  /** The viewer's role in this order. */
  role: 'SENDER' | 'TRAVELER';
  counterpartyName: string | null;
  /** Revealed only once escrow is held (anti-disintermediation). */
  counterpartyPhone: string | null;
  escrowHeldAt: string | null;
  releasedAt: string | null;
}

/** Health-check payload. */
export interface HealthStatus {
  status: 'healthy' | 'degraded';
  timestamp: string;
  version: string;
  checks: {
    database: boolean;
  };
}
