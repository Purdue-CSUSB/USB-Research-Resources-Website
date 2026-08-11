import { getDb } from './db.js';

// express-rate-limit's default store is per-process memory. That was fine for one long-lived
// Express process, but every lambda instance gets its own memory, so an in-memory limiter
// silently stops limiting anything the moment traffic spreads across instances. These buckets
// are backed by Mongo so the counters are shared, with a TTL index on expiresAt for cleanup
// (see backend/scripts/ensureIndexes.js).
//
// Windows and limits are carried over from the old server.js unchanged.
export const BUCKETS = {
  submit: {
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: 'Too many submissions. Please try again later.',
  },
  signup: {
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Too many attempts. Please try again later.',
  },
  passwordReset: {
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: 'Too many password reset attempts. Please try again later.',
  },
  login: {
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many login attempts. Please try again later.',
  },
};

const COLLECTION = 'rate_limits';

async function consume(bucket, key) {
  const { windowMs, max } = BUCKETS[bucket];
  const db = await getDb();
  const collection = db.collection(COLLECTION);
  const now = new Date();
  const id = `${bucket}:${key}`;

  // Increment inside a live window.
  const existing = await collection.findOneAndUpdate(
    { _id: id, expiresAt: { $gt: now } },
    { $inc: { count: 1 } },
    { returnDocument: 'after', includeResultMetadata: false }
  );

  if (existing) {
    return { allowed: existing.count <= max, remaining: Math.max(0, max - existing.count), resetAt: existing.expiresAt };
  }

  // No live window (first hit, or the previous one lapsed). replaceOne+upsert overwrites an
  // expired document rather than colliding with its _id.
  const expiresAt = new Date(now.getTime() + windowMs);
  await collection.replaceOne({ _id: id }, { count: 1, expiresAt }, { upsert: true });
  return { allowed: true, remaining: max - 1, resetAt: expiresAt };
}

/**
 * Applies a bucket against every supplied key and 429s if any of them is over the limit.
 *
 * Keying on IP *and* email (rather than IP alone, as the Express version did) matters on a
 * campus network: a lot of Purdue traffic shares an egress IP, so a pure-IP limiter lets one
 * abuser lock out everybody behind the same NAT. The email key catches the targeted case, the
 * IP key still catches the spray-across-accounts case.
 *
 * Returns true when the request may proceed; sends the 429 response and returns false otherwise.
 */
export async function enforceRateLimit(res, bucket, keys) {
  const config = BUCKETS[bucket];
  if (!config) {
    throw new Error(`Unknown rate limit bucket: ${bucket}`);
  }

  const uniqueKeys = [...new Set(keys.filter(Boolean))];
  let tightest = null;

  for (const key of uniqueKeys) {
    const result = await consume(bucket, key);
    if (!tightest || result.remaining < tightest.remaining) {
      tightest = result;
    }
    if (!result.allowed) {
      const retryAfter = Math.max(1, Math.ceil((result.resetAt.getTime() - Date.now()) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      res.setHeader('RateLimit-Limit', String(config.max));
      res.setHeader('RateLimit-Remaining', '0');
      res.status(429).json({ message: config.message });
      return false;
    }
  }

  if (tightest) {
    res.setHeader('RateLimit-Limit', String(config.max));
    res.setHeader('RateLimit-Remaining', String(tightest.remaining));
  }

  return true;
}
