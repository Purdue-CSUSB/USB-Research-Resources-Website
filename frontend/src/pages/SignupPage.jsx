import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ALLOWED_EMAIL_DOMAIN } from '../config.js';
import AuthCard, { Banner } from '../components/ui/AuthCard.jsx';
import Button from '../components/ui/Button.jsx';
import Field from '../components/ui/Field.jsx';
import PasswordField from '../components/ui/PasswordField.jsx';

export default function SignupPage() {
  const { signup, verifyEmail, resendCode } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('signup');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Convenience check only - the server enforces the same domain from the same env var.
    if (!email.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN)) {
      setError(`You must sign up with a valid ${ALLOWED_EMAIL_DOMAIN} email.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(username, email, password);
      setStep('verify');
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await verifyEmail(email, code);
      navigate('/projects');
    } catch (err) {
      setError(err.message || 'Failed to verify email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    try {
      await resendCode(email);
      setInfo('A new code has been sent.');
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    }
  };

  if (step === 'signup') {
    return (
      <AuthCard title="Sign Up" subtitle="Create an account with your Purdue email.">
        <Banner tone="error">{error}</Banner>

        <form onSubmit={handleSignup} className="space-y-5">
          <Field
            id="signup-username"
            label="Username"
            required
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Pete Purdue"
          />
          <Field
            id="signup-email"
            label="Purdue Email"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="pete@purdue.edu"
          />
          <PasswordField
            id="signup-password"
            label="Password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="font-body text-sm text-usb-muted mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-usb-charcoal underline">
            Log in
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Verify Your Email"
      subtitle={<>We sent a 6-digit code to <span className="font-semibold text-usb-charcoal">{email}</span>.</>}
    >
      <Banner tone="error">{error}</Banner>
      <Banner tone="success">{info}</Banner>

      <form onSubmit={handleVerify} className="space-y-5">
        <Field
          id="signup-code"
          label="Verification Code"
          required
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          controlClassName="text-center tracking-[0.5em]"
          placeholder="------"
        />
        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Verifying...' : 'Verify Email'}
        </Button>
      </form>

      <button
        onClick={handleResend}
        className="font-body text-sm text-usb-muted hover:text-usb-charcoal mt-6 w-full text-center transition-colors cursor-pointer"
      >
        Didn't get a code? Resend
      </button>
    </AuthCard>
  );
}
