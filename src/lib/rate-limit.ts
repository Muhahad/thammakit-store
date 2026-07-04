/**
 * Lightweight fixed-window rate limiter (in-memory).
 *
 * Good enough for a single serverless region / small deployment. For multi-region
 * production, swap the Map for Upstash Redis (`@upstash/ratelimit`) — the
 * `rateLimit()` signature stays the same.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/**
 * @param key       unique identifier (e.g. `login:${ip}`)
 * @param limit     max requests per window
 * @param windowMs  window length in ms (default 60s)
 * @returns { success, remaining, resetAt }
 */
export function rateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  bucket.count += 1;
  const success = bucket.count <= limit;
  return { success, remaining: Math.max(0, limit - bucket.count), resetAt: bucket.resetAt };
}

/** Extract the client IP from a Request (Vercel sets x-forwarded-for). */
export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() ?? "unknown";
}
