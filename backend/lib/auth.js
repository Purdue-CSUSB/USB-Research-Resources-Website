import jwt from 'jsonwebtoken';

const TOKEN_TTL = '1d';
// Pin the signing algorithm so a forged token can't request a different alg (e.g. "none").
const JWT_ALGORITHM = 'HS256';

export function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set.');
  }

  return jwt.sign(
    { userId: user._id.toString(), email: user.email, isAdmin: !!user.isAdmin },
    secret,
    { expiresIn: TOKEN_TTL, algorithm: JWT_ALGORITHM }
  );
}

export function requireAuth(req, res, next) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: 'JWT_SECRET is not set on the server.' });
  }

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header.' });
  }

  try {
    const payload = jwt.verify(token, secret, { algorithms: [JWT_ALGORITHM] });
    req.user = { userId: payload.userId, email: payload.email, isAdmin: !!payload.isAdmin };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required.' });
    }
    next();
  });
}
