// Replacements for the pieces of middleware that server.js used to provide. Express handled
// verb routing, body-size limits and a (missing) error handler centrally; on Vercel each
// function is its own entry point, so these are composed per-handler instead.

const MAX_BODY_BYTES = 64 * 1024; // was express.json({ limit: '64kb' })

// Express 404'd unknown verbs on a path for free. A Vercel function is invoked for every
// method, so each handler has to reject the ones it doesn't implement.
export function methodGuard(req, res, allowed) {
  const methods = Array.isArray(allowed) ? allowed : [allowed];
  if (methods.includes(req.method)) {
    return true;
  }

  res.setHeader('Allow', methods.join(', '));
  res.status(405).json({ message: `Method ${req.method} is not allowed on this endpoint.` });
  return false;
}

export function bodyTooLarge(req, res) {
  const declared = Number(req.headers['content-length'] || 0);
  if (declared > MAX_BODY_BYTES) {
    res.status(413).json({ message: 'Request body is too large.' });
    return true;
  }
  return false;
}

// Vercel's edge sets x-vercel-forwarded-for and x-real-ip after stripping whatever the client
// sent, so they can be trusted. Plain x-forwarded-for is client-appendable and is only used as
// a fallback for local `vercel dev`, where nothing is spoofable that matters anyway.
export function clientIp(req) {
  const vercelForwarded = String(req.headers['x-vercel-forwarded-for'] || '').split(',')[0].trim();
  if (vercelForwarded) return vercelForwarded;

  const realIp = String(req.headers['x-real-ip'] || '').trim();
  if (realIp) return realIp;

  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  if (forwarded) return forwarded;

  return req.socket?.remoteAddress || 'unknown';
}

// server.js had no error-handling middleware, so an unhandled throw outside a route's own
// try/catch surfaced as an Express HTML stack trace. Wrapping every handler guarantees a JSON
// 500 and keeps internals in the logs rather than the response.
export function withErrorHandling(name, fn) {
  return async function handler(req, res) {
    try {
      await fn(req, res);
    } catch (error) {
      console.error(`[${name}]`, error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Something went wrong. Please try again.' });
      }
    }
  };
}
