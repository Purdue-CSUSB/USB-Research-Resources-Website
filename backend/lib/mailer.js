import nodemailer from 'nodemailer';
import { requireEnv, requireEnvInt } from './env.js';

// Cached on globalThis for the same reason as the Mongo client: warm invocations reuse the
// pooled SMTP transport instead of building a new one per request.
function getTransporter() {
  if (!globalThis.__usbMailTransport) {
    const port = requireEnvInt('SMTP_PORT');
    globalThis.__usbMailTransport = nodemailer.createTransport({
      host: requireEnv('SMTP_HOST'),
      port,
      // 465 is implicit TLS; 587 negotiates STARTTLS, which nodemailer does on its own.
      secure: port === 465,
      auth: { user: requireEnv('SMTP_USER'), pass: requireEnv('SMTP_PASS') },
    });
  }

  return globalThis.__usbMailTransport;
}

/**
 * Sends transactional mail.
 *
 * Missing SMTP config throws, rather than the old behaviour of warning and returning
 * { skipped: true }. That silent skip meant a misconfigured deploy produced accounts nobody
 * could ever verify and password resets that never arrived, while the API still answered 200.
 */
export async function sendMail({ to, subject, text }) {
  const transport = getTransporter();
  await transport.sendMail({ from: requireEnv('SMTP_FROM'), to, subject, text });
}
