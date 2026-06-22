/**
 * Server-side PII scrubbing for in-app chat.
 *
 * CarryMate's trust + anti-disintermediation model depends on parties NOT exchanging
 * direct contact details or off-platform payment handles. We strip them before a
 * message is ever stored or delivered, so neither the recipient nor an admin export
 * leaks them. This is a firewall, not UI sugar — always run on the server.
 */

const REDACTION = '•••';

/** Ordered so URLs/emails are caught before the looser phone-number sweep. */
const PATTERNS: RegExp[] = [
  // Links (http/https or bare www.)
  /\b(?:https?:\/\/|www\.)\S+/gi,
  // Emails
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  // UPI / payment handles (name@bank — no dotted TLD)
  /\b[A-Z0-9._-]{2,}@[A-Z]{2,}\b/gi,
  // Phone numbers: 7+ digits, allowing +, spaces, dots, dashes, parens.
  // (Carry fees are 3–4 digits, so this never touches prices.)
  /(?:\+?\d[\d\s().-]{5,}\d)/g,
];

export interface PiiResult {
  clean: string;
  redacted: boolean;
}

/** Strip contact info / payment handles / links from a chat message. */
export function scrubPii(input: string): PiiResult {
  let clean = input;
  let redacted = false;
  for (const pattern of PATTERNS) {
    clean = clean.replace(pattern, () => {
      redacted = true;
      return REDACTION;
    });
  }
  return { clean: clean.trim(), redacted };
}
