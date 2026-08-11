import { sendMail } from './mailer.js';

export async function sendVerificationCode(email, code) {
  await sendMail({
    to: email,
    subject: 'Verify your USB Research Resources account',
    text: `Your verification code is ${code}. It expires in 15 minutes.`
  });
}

export async function sendPasswordResetCode(email, code) {
  await sendMail({
    to: email,
    subject: 'Reset your USB Research Resources password',
    text: `Your password reset code is ${code}. It expires in 15 minutes. If you didn't request this, you can ignore this email.`
  });
}
