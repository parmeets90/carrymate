import { describe, it, expect } from 'vitest';
import { scrubPii } from '../../src/utils/pii';

describe('scrubPii (chat anti-disintermediation firewall)', () => {
  it('redacts phone numbers in various formats', () => {
    for (const text of ['call me 9876543210', 'reach +91 98765 43210', 'ph: 98765-43210']) {
      const { clean, redacted } = scrubPii(text);
      expect(redacted).toBe(true);
      expect(clean).not.toMatch(/\d{5}/);
    }
  });

  it('redacts emails, links and UPI handles', () => {
    expect(scrubPii('mail me at a@b.com').clean).not.toContain('@b.com');
    expect(scrubPii('see https://wa.me/123').clean).not.toContain('http');
    expect(scrubPii('pay me ravi@okhdfc').clean).not.toContain('okhdfc');
  });

  it('leaves an ordinary message — including a small carry fee — untouched', () => {
    const { clean, redacted } = scrubPii('Can you carry it for 400 rupees? Thanks!');
    expect(redacted).toBe(false);
    expect(clean).toBe('Can you carry it for 400 rupees? Thanks!');
  });

  it('flags redaction whenever anything was stripped', () => {
    expect(scrubPii('hello').redacted).toBe(false);
    expect(scrubPii('hello 9876543210').redacted).toBe(true);
  });
});
