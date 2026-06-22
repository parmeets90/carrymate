/**
 * Domain enums shared across backend, mobile, and admin.
 * Keep in sync with the Prisma schema (apps/backend/prisma/schema.prisma).
 */

export enum UserRole {
  SENDER = 'SENDER',
  TRAVELER = 'TRAVELER',
  BOTH = 'BOTH',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

export enum KycStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum KycDocType {
  AADHAAR = 'AADHAAR',
  PAN = 'PAN',
  PASSPORT = 'PASSPORT',
  SELFIE = 'SELFIE',
  FLIGHT_TICKET = 'FLIGHT_TICKET',
}

export enum KycDocStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum RequestCategory {
  FOOD = 'FOOD',
  DOCUMENTS = 'DOCUMENTS',
  CLOTHING = 'CLOTHING',
  GIFTS = 'GIFTS',
  OTHER = 'OTHER',
}

export enum RequestStatus {
  OPEN = 'OPEN',
  BIDDING = 'BIDDING',
  MATCHED = 'MATCHED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CONFIRMED = 'CONFIRMED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED',
}

export enum RouteStatus {
  ACTIVE = 'ACTIVE',
  FULL = 'FULL',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum BidStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
  EXPIRED = 'EXPIRED',
}

export enum TransactionStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  ESCROW_HELD = 'ESCROW_HELD',
  PAYOUT_INITIATED = 'PAYOUT_INITIATED',
  COMPLETED = 'COMPLETED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED',
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED_SENDER = 'RESOLVED_SENDER',
  RESOLVED_TRAVELER = 'RESOLVED_TRAVELER',
  ESCALATED = 'ESCALATED',
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  DELIVERY_PROOF = 'DELIVERY_PROOF',
  SYSTEM = 'SYSTEM',
}

export enum NotificationChannel {
  PUSH = 'PUSH',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP',
}
