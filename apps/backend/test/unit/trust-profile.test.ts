import { describe, it, expect } from 'vitest';
import { toInitials, deriveBadges } from '../../src/modules/users/users.service';

describe('toInitials', () => {
  it('reduces a full name to dotted initials', () => {
    expect(toInitials('Arjun Sharma')).toBe('A.S.');
  });

  it('handles a single name', () => {
    expect(toInitials('Arjun')).toBe('A.');
  });

  it('collapses extra whitespace', () => {
    expect(toInitials('  Arjun   Kumar  Sharma ')).toBe('A.K.S.');
  });

  it('returns null for empty / null', () => {
    expect(toInitials(null)).toBeNull();
    expect(toInitials('   ')).toBeNull();
  });
});

describe('deriveBadges', () => {
  const oldMember = new Date(Date.now() - 200 * 86_400_000);
  const newMember = new Date();

  it('awards KYC + phone badges from verification flags', () => {
    const badges = deriveBadges({
      kycVerified: true,
      phoneVerified: true,
      ratingAvg: 5,
      ratingCount: 0,
      deliveriesCompleted: 0,
      memberSince: newMember,
    });
    expect(badges).toContain('KYC_VERIFIED');
    expect(badges).toContain('PHONE_VERIFIED');
  });

  it('awards TRUSTED_CARRIER only with enough deliveries and a strong rating', () => {
    expect(
      deriveBadges({
        kycVerified: false,
        phoneVerified: false,
        ratingAvg: 4.6,
        ratingCount: 5,
        deliveriesCompleted: 5,
        memberSince: newMember,
      }),
    ).toContain('TRUSTED_CARRIER');

    expect(
      deriveBadges({
        kycVerified: false,
        phoneVerified: false,
        ratingAvg: 4.6,
        ratingCount: 5,
        deliveriesCompleted: 4, // one short
        memberSince: newMember,
      }),
    ).not.toContain('TRUSTED_CARRIER');
  });

  it('awards TOP_RATED for a high average with enough ratings', () => {
    expect(
      deriveBadges({
        kycVerified: false,
        phoneVerified: false,
        ratingAvg: 4.9,
        ratingCount: 3,
        deliveriesCompleted: 0,
        memberSince: newMember,
      }),
    ).toContain('TOP_RATED');
  });

  it('awards ESTABLISHED_MEMBER past 90 days, not before', () => {
    expect(
      deriveBadges({
        kycVerified: false,
        phoneVerified: false,
        ratingAvg: 5,
        ratingCount: 0,
        deliveriesCompleted: 0,
        memberSince: oldMember,
      }),
    ).toContain('ESTABLISHED_MEMBER');

    expect(
      deriveBadges({
        kycVerified: false,
        phoneVerified: false,
        ratingAvg: 5,
        ratingCount: 0,
        deliveriesCompleted: 0,
        memberSince: newMember,
      }),
    ).not.toContain('ESTABLISHED_MEMBER');
  });
});
