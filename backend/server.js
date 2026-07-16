import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import rateLimit from 'express-rate-limit';
import submitHandler from './routes/submit.js';
import projectsHandler, { deleteProjectHandler } from './routes/projects.js';
import { handleScrapeRequest, runScrape } from './routes/scrape.js';
import { signup, verifyEmail, resendCode, login, me, requestPasswordReset, resetPassword } from './routes/auth.js';
import { requireAuth, requireAdmin } from './lib/auth.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Caps submissions per IP so the OpenAI moderation call on /api/submit can't be spammed.
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many submissions from this IP. Please try again later.' },
});

// Caps signup/verify/resend per IP since these send real emails and must not be spammable.
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts from this IP. Please try again later.' },
});

app.post('/api/auth/signup', signupLimiter, signup);
app.post('/api/auth/verify-email', signupLimiter, verifyEmail);
app.post('/api/auth/resend-code', signupLimiter, resendCode);
app.post('/api/auth/request-password-reset', signupLimiter, requestPasswordReset);
app.post('/api/auth/reset-password', signupLimiter, resetPassword);
app.post('/api/auth/login', login);
app.get('/api/auth/me', ...me);

app.get('/api/projects', projectsHandler);
app.delete('/api/projects/:id', requireAdmin, deleteProjectHandler);
app.post('/api/submit', submitLimiter, requireAuth, submitHandler);
app.all('/api/scrape', handleScrapeRequest);

// Same schedule the old Vercel Cron used (8:00 AM UTC daily) - only runs while
// this process is up, since there's no serverless cron infra anymore.
cron.schedule('0 8 * * *', async () => {
  console.log('[cron] Running scheduled Google Calendar scrape...');
  try {
    const result = await runScrape();
    console.log('[cron]', result.message);
  } catch (error) {
    console.error('[cron] Scrape failed:', error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Backend API listening on http://localhost:${PORT}`);
});
