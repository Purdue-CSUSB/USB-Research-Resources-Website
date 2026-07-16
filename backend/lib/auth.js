import jwt from 'jsonwebtoken';

const TOKEN_TTL = '7d';

export function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set.');
  }

  return jwt.sign(
    { userId: user._id.toString(), email: user.email, isAdmin: !!user.isAdmin },
    secret,
    { expiresIn: TOKEN_TTL }
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
    const payload = jwt.verify(token, secret);
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
