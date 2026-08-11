import jwt from 'jsonwebtoken';
import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import { ObjectId } from 'mongodb';
import { getDb } from './db.js';
import { requireEnv } from './env.js';
import { ALLOWED_EMAIL_DOMAIN } from './constants.js';

// Security policy, deliberately NOT configurable. These are not deployment settings - making
// the algorithm settable would hand an attacker the knob that lets them request alg "none",
// and the code lifetime/attempt cap are what keep a 6-digit code unguessable.
const JWT_ALGORITHM = 'HS256';
export const CODE_TTL_MS = 15 * 60 * 1000;
export const MAX_CODE_ATTEMPTS = 5;

export function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

// Single source of truth for the domain gate. It used to be inlined in signup only, which left
// the password-reset flow able to operate on any address that had somehow been created.
export function isAllowedEmail(email) {
  return typeof email === 'string' && normalizeEmail(email).endsWith(ALLOWED_EMAIL_DOMAIN);
}

// crypto.randomInt is cryptographically secure - unlike Math.random(), its output can't be
// predicted from prior codes. Range is [100000, 1000000) => always a 6-digit code.
export function generateCode() {
  return String(randomInt(100000, 1000000));
}

// Codes are stored hashed, never in plaintext. Anyone with read access to the users collection
// (a backup, a leaked connection string, an aggregation bug) could previously read a live
// verification or reset code and take over the account mid-flow.
export function hashCode(code) {
  return createHash('sha256').update(String(code), 'utf8').digest('hex');
}

// Constant-time compare so response timing doesn't leak how much of a code was correct.
export function codeMatches(storedHash, submittedCode) {
  if (typeof storedHash !== 'string' || typeof submittedCode !== 'string') {
    return false;
  }

  const expected = Buffer.from(storedHash, 'hex');
  const actual = Buffer.from(hashCode(submittedCode), 'hex');
  if (expected.length === 0 || expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

export function publicUser(user) {
  return { username: user.username, email: user.email, isAdmin: !!user.isAdmin };
}

// The payload deliberately does NOT include isAdmin. It used to, which meant a user demoted or
// deleted in Mongo kept admin rights until their token expired. Privileges are now read from
// the database on every request that needs them.
export function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email },
    requireEnv('JWT_SECRET'),
    { expiresIn: requireEnv('JWT_TTL'), algorithm: JWT_ALGORITHM }
  );
}

function verifyToken(req) {
  const secret = requireEnv('JWT_SECRET');

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, secret, { algorithms: [JWT_ALGORITHM] });
  } catch {
    return null;
  }
}

/**
 * Resolves the bearer token to a live user document, or null. Re-reading the user means a
 * deleted, unverified or demoted account stops being authorised immediately rather than at
 * token expiry.
 */
export async function authenticate(req) {
  const payload = verifyToken(req);
  if (!payload?.userId || !ObjectId.isValid(payload.userId)) {
    return null;
  }

  const db = await getDb();
  const user = await db.collection('users').findOne({ _id: new ObjectId(payload.userId) });
  if (!user || !user.emailVerified) {
    return null;
  }

  return user;
}

/**
 * Handler-level replacement for the requireAuth middleware. Returns the user document, or
 * sends a 401 and returns null - callers must bail out when they get null.
 */
export async function requireAuth(req, res) {
  const user = await authenticate(req);
  if (!user) {
    res.status(401).json({ message: 'Missing, invalid or expired credentials.' });
    return null;
  }
  return user;
}
