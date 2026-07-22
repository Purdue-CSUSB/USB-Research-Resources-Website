import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import submitHandler from './routes/submit.js';
import projectsHandler, { deleteProjectHandler } from './routes/projects.js';
import { signup, verifyEmail, resendCode, login, me, requestPasswordReset, resetPassword } from './routes/auth.js';
import { requireAuth, requireAdmin } from './lib/auth.js';

const app = express();
const PORT = process.env.PORT || 5001;

// When deployed behind a reverse proxy, set TRUST_PROXY (e.g. =1) so express-rate-limit keys on
// the real client IP. Left off in local dev so X-Forwarded-For can't be spoofed to dodge limiters.
if (process.env.TRUST_PROXY) {
  app.set('trust proxy', Number(process.env.TRUST_PROXY));
}

// Baseline security headers.
app.use(helmet());

// Restrict cross-origin callers to an explicit allowlist (comma-separated ALLOWED_ORIGINS),
// defaulting to the local dev frontend. Requests with no Origin (curl, same-origin) still pass.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins }));

app.use(express.json({ limit: '64kb' }));

// Caps submissions per IP so the OpenAI moderation call on /api/submit can't be spammed.
// Admins are exempt (trusted accounts, not the abuse this guards against) - requires
// requireAuth to run first so req.user.isAdmin is populated when skip() checks it.
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.user?.isAdmin === true,
  message: { message: 'Too many submissions from this IP. Please try again later.' },
});

// Caps signup/verify/resend per IP since these send real emails and must not be spammable.
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts from this IP. Please try again later.' },
});

// Separate bucket for password reset so it is never starved by signup/verify traffic. Previously
// all auth-email routes shared one 5/hr limiter, which blocked resets after normal account setup.
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many password reset attempts from this IP. Please try again later.' },
});

// Throttles login to blunt online password brute-forcing without punishing the occasional typo.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts from this IP. Please try again later.' },
});

app.post('/api/auth/signup', signupLimiter, signup);
app.post('/api/auth/verify-email', signupLimiter, verifyEmail);
app.post('/api/auth/resend-code', signupLimiter, resendCode);
app.post('/api/auth/request-password-reset', passwordResetLimiter, requestPasswordReset);
app.post('/api/auth/reset-password', passwordResetLimiter, resetPassword);
app.post('/api/auth/login', loginLimiter, login);
app.get('/api/auth/me', ...me);

app.get('/api/projects', projectsHandler);
app.delete('/api/projects/:id', requireAdmin, deleteProjectHandler);
app.post('/api/submit', requireAuth, submitLimiter, submitHandler);

// The daily Google Calendar sync now runs as the "Sync Calendar Events" GitHub Action
// (.github/workflows/scrape-calendar.yml) instead of an in-process cron job, so the
// calendar stays current without this server running.

app.listen(PORT, () => {
  console.log(`Backend API listening on http://localhost:${PORT}`);
});
