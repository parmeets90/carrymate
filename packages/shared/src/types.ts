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
  phone: string | null;
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
  /** Why the user landed in manual review (IDFY failure/timeout/low score). */
  failureReason: string | null;
  /** IDFY confidence scores when an automated check ran. */
  faceMatchScore: number | null;
  ocrConfidence: number | null;
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

/** Cold-start signals for a request detail (Challenge 05). */
export interface RequestInsights {
  /** Travelers with an active trip on this corridor in the next 7 days. */
  activeTravelers: number;
  /** Historical avg days from posting to match on this route, or null if unknown. */
  avgDaysToMatch: number | null;
  destinationCity: string;
}

/** Lightweight marketplace pulse for the home screen. */
export interface MarketplacePulse {
  matchedToday: number;
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
  senderId: string;
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
    /** KYC lifecycle state (e.g. 'VERIFIED') — drives the identity trust badge. */
    kycStatus: string;
  };
  route: {
    originAirport: string;
    destinationAirport: string;
    departureDate: string;
    flightNumber: string | null;
    /** Ticket/flight verified against the airline feed — drives the flight trust badge. */
    flightVerified: boolean;
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
  /** The counterparty's user id — used to open their public trust profile. */
  counterpartyId: string | null;
  counterpartyName: string | null;
  /** Revealed only once escrow is held (anti-disintermediation). */
  counterpartyPhone: string | null;
  escrowHeldAt: string | null;
  releasedAt: string | null;
  // Fulfillment (Phase 4)
  requestStatus: string; // MATCHED | IN_TRANSIT | DELIVERED | CONFIRMED | ...
  openBoxDone: boolean;
  deliveredAt: string | null;
  autoConfirmAt: string | null;
  hasDispute: boolean;
  /** Delivery handover code — shown to the sender only, once in transit. */
  deliveryOtp: string | null;
  /** True once the viewer has rated their counterparty for this order. */
  ratedByMe: boolean;
}

/** A dispute as shown to admins, with order/party context. */
export interface DisputeView {
  id: string;
  orderId: string;
  reason: string;
  description: string;
  evidence: string[];
  status: string;
  raisedByRole: 'SENDER' | 'TRAVELER';
  requestTitle: string;
  amountInr: number;
  senderName: string | null;
  travelerName: string | null;
  createdAt: string;
}

// ── Phase 5: Communications ───────────────────────────────────

/** A single chat message as exposed to clients. */
export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  /** True when this message was sent by the requesting user. */
  mine: boolean;
  type: 'TEXT' | 'IMAGE' | 'SYSTEM';
  body: string;
  /** Whether contact info was stripped from this message. */
  piiRedacted: boolean;
  createdAt: string;
}

/** A chat thread (one per order) as shown in the conversations list. */
export interface ConversationSummary {
  id: string;
  orderId: string;
  requestTitle: string;
  /** The other party in this conversation. */
  counterpartyName: string | null;
  /** The viewer's role in the underlying order. */
  role: 'SENDER' | 'TRAVELER';
  orderStatus: string;
  requestStatus: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

/** An in-app notification as exposed to clients. */
export interface NotificationDto {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
}

// ── Phase 6: Safety, Fraud & Admin ────────────────────────────

/** Ops dashboard KPIs. */
export interface AdminMetrics {
  users: number;
  kycBacklog: number;
  suspended: number;
  requestsTotal: number;
  requestsMatched: number;
  /** Matched-or-beyond requests as a % of all requests. */
  matchRate: number;
  ordersTotal: number;
  escrowHeld: number;
  completed: number;
  /** Gross merchandise value (sum of completed order amounts), in INR. */
  gmvInr: number;
  disputesOpen: number;
  disputeRate: number;
  fraudHolds: number;
  // ── SLA / ops health (B1) ──
  /** Avg minutes from KYC submission to a review decision. */
  avgKycReviewMins: number;
  /** Avg hours from dispute opened to resolved. */
  avgDisputeResolutionHours: number;
  /** Age (hours) of the oldest still-open dispute — alert if > 24. */
  oldestOpenDisputeHours: number;
}

/** SLA bucket for a queue item. */
export type SlaLevel = 'green' | 'amber' | 'red';

/** A single actionable item in the unified admin work queue (B1). */
export interface AdminQueueItem {
  kind: 'DISPUTE' | 'FRAUD' | 'REVIEW' | 'KYC' | 'PAYOUT';
  /** Entity id (disputeId / orderId / userId) for the relevant action. */
  id: string;
  title: string;
  subtitle: string;
  createdAt: string;
  ageHours: number;
  sla: SlaLevel;
  /** Lower sorts first across kinds (DISPUTE=0 … PAYOUT=3). */
  priority: number;
  /** Admin route that actions this item. */
  link: string;
}

/** An order in the admin risk/fraud queue. */
export interface FraudQueueItem extends OrderView {
  senderName: string | null;
  travelerName: string | null;
  riskScore: number;
  riskFactors: string[];
  fraudHold: boolean;
}

/** A traveler's payout bank account (no full number — masked only). */
export interface BankAccountDto {
  id: string;
  accountHolderName: string;
  accountNumberMasked: string;
  ifsc: string;
  updatedAt: string;
}

/** A trip whose flight ticket needs manual verification (Challenge 09). */
export interface PendingRouteItem {
  id: string;
  travelerName: string | null;
  flightNumber: string | null;
  airline: string | null;
  route: string; // "DEL → DXB"
  departureDate: string;
  ticketFileKey: string | null;
}

/** An order whose payout failed, for the admin recovery queue. */
export interface FailedPayoutItem {
  orderId: string;
  travelerName: string | null;
  payoutInr: number;
  requestTitle: string;
  failureReason: string | null;
  payoutInitiatedAt: string | null;
}

/**
 * Public "trust profile" — what one party sees about another (a sender vetting
 * a traveler, or a traveler vetting a sender). Deliberately carries NO personal
 * contact details (phone/email/address/KYC numbers); only legitimacy signals
 * and in-app history.
 */
export type TrustBadgeKind =
  | 'KYC_VERIFIED'
  | 'PHONE_VERIFIED'
  | 'TRUSTED_CARRIER'
  | 'TOP_RATED'
  | 'ESTABLISHED_MEMBER';

/** A single review left for the user, anonymised to initials. */
export interface TrustProfileReview {
  stars: number;
  comment: string | null;
  /** Reviewer shown as initials only, e.g. "A.S." — never a full name. */
  raterInitials: string | null;
  createdAt: string;
}

export interface TrustProfileStats {
  /** Completed deliveries carried (as a traveler). */
  deliveriesCompleted: number;
  /** Trips/routes posted (as a traveler). */
  tripsPosted: number;
  /** Completed requests sent (as a sender). */
  requestsCompleted: number;
  /** Requests posted (as a sender). */
  requestsPosted: number;
}

export interface TrustProfile {
  id: string;
  /** Display name only — no contact details are ever included. */
  fullName: string | null;
  role: string; // SENDER | TRAVELER
  /** Account creation time; UI renders "Member since Jun 2026". */
  memberSince: string;
  kycVerified: boolean;
  phoneVerified: boolean;
  ratingAvg: number;
  ratingCount: number;
  badges: TrustBadgeKind[];
  stats: TrustProfileStats;
  /** Most recent reviews (capped server-side). */
  reviews: TrustProfileReview[];
}

/** Health-check payload. */
export interface HealthStatus {
  status: 'healthy' | 'degraded';
  timestamp: string;
  version: string;
  checks: {
    database: boolean;
    storage?: boolean;
  };
}
