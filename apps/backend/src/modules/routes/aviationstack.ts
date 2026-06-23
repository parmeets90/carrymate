import { env, isAviationStackConfigured } from '../../config/env';
import { logger } from '../../utils/logger';

/**
 * AviationStack flight check (Challenge 09, Layer 1). Config-gated: when no API
 * key is set, flights aren't auto-verified and fall back to the mandatory ticket
 * photo (Layer 2) + admin manual override. Never throws — returns false on any
 * miss/outage so the route still publishes (evidence-backed) and admin can verify.
 */
export async function verifyFlight(input: {
  flightNumber?: string | null;
  originAirport: string;
  destinationAirport: string;
  departureDate: Date;
}): Promise<boolean> {
  if (!isAviationStackConfigured || !input.flightNumber) return false;

  try {
    const url = new URL('https://api.aviationstack.com/v1/flights');
    url.searchParams.set('access_key', env.AVIATIONSTACK_API_KEY!);
    url.searchParams.set('flight_iata', input.flightNumber);
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`AviationStack ${res.status}`);

    const data = (await res.json()) as {
      data?: { departure?: { iata?: string }; arrival?: { iata?: string } }[];
    };
    // Match the declared corridor (departure/arrival airports).
    return (data.data ?? []).some(
      (f) =>
        f.departure?.iata === input.originAirport && f.arrival?.iata === input.destinationAirport,
    );
  } catch (err) {
    // Down/timeout → manual fallback (Fix 2).
    logger.warn(`[aviationstack] verify failed for ${input.flightNumber}: ${(err as Error).message}`);
    return false;
  }
}
