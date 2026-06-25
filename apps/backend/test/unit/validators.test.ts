import { describe, it, expect } from 'vitest';
import { createRequestSchema } from '../../src/modules/requests/requests.validators';
import { createBidSchema } from '../../src/modules/bids/bids.validators';
import { MIN_CARRY_FEE_INR, MAX_CARRY_FEE_INR, MAX_DECLARED_VALUE_INR } from '@carrymate/shared';

const validRequest = {
  title: 'Homemade pickle',
  description: 'Two sealed jars for family.',
  category: 'FOOD',
  weightKg: 2,
  declaredValueInr: 2000,
  originCity: 'Delhi',
  originAirport: 'del',
  destinationCity: 'Dubai',
  recipientName: 'Asha',
  recipientPhone: '+971501234567',
  recipientAddress: 'Marina, Dubai',
  deadlineDate: '2026-12-01',
  declarationAccepted: true,
};

describe('createRequestSchema (business rules)', () => {
  it('accepts a valid request and upper-cases the airport', () => {
    const r = createRequestSchema.parse(validRequest);
    expect(r.originAirport).toBe('DEL');
    expect(r.itemPhotos).toEqual([]); // defaulted
  });

  it('enforces the 5kg weight cap', () => {
    expect(createRequestSchema.safeParse({ ...validRequest, weightKg: 5.1 }).success).toBe(false);
    expect(createRequestSchema.safeParse({ ...validRequest, weightKg: 5 }).success).toBe(true);
  });

  it(`enforces the ₹${MAX_DECLARED_VALUE_INR} declared-value cap`, () => {
    expect(createRequestSchema.safeParse({ ...validRequest, declaredValueInr: MAX_DECLARED_VALUE_INR + 1 }).success).toBe(false);
    expect(createRequestSchema.safeParse({ ...validRequest, declaredValueInr: MAX_DECLARED_VALUE_INR }).success).toBe(true);
  });

  it('requires the item declaration to be accepted', () => {
    expect(createRequestSchema.safeParse({ ...validRequest, declarationAccepted: false }).success).toBe(false);
    const { declarationAccepted: _omit, ...noDecl } = validRequest;
    expect(createRequestSchema.safeParse(noDecl).success).toBe(false);
  });

  it('requires a UAE (+971) recipient phone', () => {
    expect(createRequestSchema.safeParse({ ...validRequest, recipientPhone: '+919812345678' }).success).toBe(false);
    expect(createRequestSchema.safeParse({ ...validRequest, recipientPhone: '+971501234567' }).success).toBe(true);
  });

  it('rejects a non-UAE destination city', () => {
    expect(createRequestSchema.safeParse({ ...validRequest, destinationCity: 'London' }).success).toBe(false);
  });

  it('enforces title/description minimums and a 5-photo cap', () => {
    expect(createRequestSchema.safeParse({ ...validRequest, title: 'abc' }).success).toBe(false);
    expect(createRequestSchema.safeParse({ ...validRequest, itemPhotos: Array(6).fill('k') }).success).toBe(false);
  });
});

describe('createBidSchema (carry-fee bounds)', () => {
  const validBid = {
    requestId: '11111111-1111-1111-1111-111111111111',
    routeId: '22222222-2222-2222-2222-222222222222',
    carryFeeInr: 500,
    pickupPreference: 'AIRPORT',
    estimatedDeliveryDate: '2026-12-05',
  };

  it('accepts a valid bid within the fee band', () => {
    expect(createBidSchema.safeParse(validBid).success).toBe(true);
  });

  it('enforces the min/max carry fee', () => {
    expect(createBidSchema.safeParse({ ...validBid, carryFeeInr: MIN_CARRY_FEE_INR - 1 }).success).toBe(false);
    expect(createBidSchema.safeParse({ ...validBid, carryFeeInr: MAX_CARRY_FEE_INR + 1 }).success).toBe(false);
    expect(createBidSchema.safeParse({ ...validBid, carryFeeInr: MIN_CARRY_FEE_INR }).success).toBe(true);
  });

  it('requires valid UUIDs for request and route', () => {
    expect(createBidSchema.safeParse({ ...validBid, requestId: 'not-a-uuid' }).success).toBe(false);
  });
});
