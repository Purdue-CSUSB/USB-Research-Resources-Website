import bcrypt from 'bcryptjs';
import { randomInt } from 'node:crypto';
import { ObjectId } from 'mongodb';
import { getDb } from '../lib/db.js';
import { signToken, requireAuth } from '../lib/auth.js';
import { sendMail } from '../lib/mailer.js';

const CODE_TTL_MS = 15 * 60 * 1000;
// Max wrong code entries before a verification/reset code is burned and must be re-requested.
const MAX_CODE_ATTEMPTS = 5;

// crypto.randomInt is cryptographically secure - unlike Math.random(), its output can't be
// predicted from prior codes. Range is [100000, 1000000) => always a 6-digit code.
function generateCode() {
  return String(randomInt(100000, 1000000));
}

function publicUser(user) {
  return { username: user.username, email: user.email, isAdmin: !!user.isAdmin };
}

async function sendVerificationCode(user, code) {
  await sendMail({
    to: user.email,
    subject: 'Verify your USB Research Resources account',
    text: `Your verification code is ${code}. It expires in 15 minutes.`
  });
}

export async function signup(req, res) {
  const { username, email, password } = req.body;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ message: 'Username is required.' });
  }
  if (typeof email !== 'string' || !email.toLowerCase().endsWith('@purdue.edu')) {
    return res.status(400).json({ message: 'You must sign up with a valid @purdue.edu email.' });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  const normalizedEmail = email.toLowerCase();

  try {
    const db = await getDb();
    const users = db.collection('users');

    const existing = await users.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const code = generateCode();

    const newUser = {
      username,
      email: normalizedEmail,
      passwordHash,
      isAdmin: false,
      emailVerified: false,
      verificationCode: code,
      verificationCodeExpires: new Date(Date.now() + CODE_TTL_MS),
      createdAt: new Date()
    };

    await users.insertOne(newUser);
    await sendVerificationCode(newUser, code);

    return res.status(201).json({ message: 'Account created. Check your email for a verification code.' });
  } catch (error) {
    console.error('[auth:signup]', error);
    return res.status(500).json({ message: 'Failed to create account.' });
  }
}

export async function verifyEmail(req, res) {
  const { email, code } = req.body;
  if (typeof email !== 'string' || typeof code !== 'string') {
    return res.status(400).json({ message: 'Email and code are required.' });
  }

  const normalizedEmail = email.toLowerCase();

  try {
    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'No account found for that email.' });
    }
    if (user.emailVerified) {
      return res.status(400).json({ message: 'This account is already verified.' });
    }
    if (!user.verificationCode || user.verificationCode !== code) {
      // Count wrong tries and burn the code after too many, so a 6-digit code can't be guessed.
      const attempts = (user.verificationAttempts || 0) + 1;
      if (attempts >= MAX_CODE_ATTEMPTS) {
        await users.updateOne(
          { _id: user._id },
          { $unset: { verificationCode: '', verificationCodeExpires: '', verificationAttempts: '' } }
        );
        return res.status(400).json({ message: 'Too many incorrect attempts. Request a new code.' });
      }
      await users.updateOne({ _id: user._id }, { $set: { verificationAttempts: attempts } });
      return res.status(400).json({ message: 'Incorrect verification code.' });
    }
    if (!user.verificationCodeExpires || user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ message: 'That code has expired. Request a new one.' });
    }

    await users.updateOne(
      { _id: user._id },
      { $set: { emailVerified: true }, $unset: { verificationCode: '', verificationCodeExpires: '', verificationAttempts: '' } }
    );

    const token = signToken({ ...user, emailVerified: true });
    return res.status(200).json({ token, user: publicUser(user) });
  } catch (error) {
    console.error('[auth:verifyEmail]', error);
    return res.status(500).json({ message: 'Failed to verify email.' });
  }
}

export async function resendCode(req, res) {
  const { email } = req.body;
  if (typeof email !== 'string') {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const normalizedEmail = email.toLowerCase();

  try {
    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'No account found for that email.' });
    }
    if (user.emailVerified) {
      return res.status(400).json({ message: 'This account is already verified.' });
    }

    const code = generateCode();
    await users.updateOne(
      { _id: user._id },
      { $set: { verificationCode: code, verificationCodeExpires: new Date(Date.now() + CODE_TTL_MS), verificationAttempts: 0 } }
    );
    await sendVerificationCode(user, code);

    return res.status(200).json({ message: 'A new code has been sent.' });
  } catch (error) {
    console.error('[auth:resendCode]', error);
    return res.status(500).json({ message: 'Failed to resend code.' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const normalizedEmail = email.toLowerCase();

  try {
    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'No account found for that email.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }
    if (!user.emailVerified) {
      return res.status(403).json({ message: 'Verify your email before logging in.' });
    }

    const token = signToken(user);
    return res.status(200).json({ token, user: publicUser(user) });
  } catch (error) {
    console.error('[auth:login]', error);
    return res.status(500).json({ message: 'Failed to log in.' });
  }
}

export async function requestPasswordReset(req, res) {
  const { email } = req.body;
  if (typeof email !== 'string') {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const normalizedEmail = email.toLowerCase();

  try {
    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'No account found for that email.' });
    }

    const code = generateCode();
    await users.updateOne(
      { _id: user._id },
      { $set: { resetCode: code, resetCodeExpires: new Date(Date.now() + CODE_TTL_MS), resetAttempts: 0 } }
    );

    await sendMail({
      to: user.email,
      subject: 'Reset your USB Research Resources password',
      text: `Your password reset code is ${code}. It expires in 15 minutes. If you didn't request this, you can ignore this email.`
    });

    return res.status(200).json({ message: 'A password reset code has been sent to your email.' });
  } catch (error) {
    console.error('[auth:requestPasswordReset]', error);
    return res.status(500).json({ message: 'Failed to send reset code.' });
  }
}

export async function resetPassword(req, res) {
  const { email, code, newPassword } = req.body;
  if (typeof email !== 'string' || typeof code !== 'string') {
    return res.status(400).json({ message: 'Email and code are required.' });
  }
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  const normalizedEmail = email.toLowerCase();

  try {
    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'No account found for that email.' });
    }
    if (!user.resetCode || user.resetCode !== code) {
      // Count wrong tries and burn the code after too many, so a 6-digit code can't be guessed.
      const attempts = (user.resetAttempts || 0) + 1;
      if (attempts >= MAX_CODE_ATTEMPTS) {
        await users.updateOne(
          { _id: user._id },
          { $unset: { resetCode: '', resetCodeExpires: '', resetAttempts: '' } }
        );
        return res.status(400).json({ message: 'Too many incorrect attempts. Request a new code.' });
      }
      await users.updateOne({ _id: user._id }, { $set: { resetAttempts: attempts } });
      return res.status(400).json({ message: 'Incorrect reset code.' });
    }
    if (!user.resetCodeExpires || user.resetCodeExpires < new Date()) {
      return res.status(400).json({ message: 'That code has expired. Request a new one.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await users.updateOne(
      { _id: user._id },
      { $set: { passwordHash }, $unset: { resetCode: '', resetCodeExpires: '', resetAttempts: '' } }
    );

    return res.status(200).json({ message: 'Password reset. You can now log in.' });
  } catch (error) {
    console.error('[auth:resetPassword]', error);
    return res.status(500).json({ message: 'Failed to reset password.' });
  }
}

export const me = [requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({ _id: new ObjectId(req.user.userId) });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ user: publicUser(user) });
  } catch (error) {
    console.error('[auth:me]', error);
    return res.status(500).json({ message: 'Failed to load account.' });
  }
}];
