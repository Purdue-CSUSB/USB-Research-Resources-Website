import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthCard, { Banner } from '../components/ui/AuthCard.jsx';
import Button from '../components/ui/Button.jsx';
import Field from '../components/ui/Field.jsx';
import PasswordField from '../components/ui/PasswordField.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/projects');
    } catch (err) {
      setError(err.message || 'Failed to log in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // A reset link belongs next to a wrong-password error, but not next to the unverified-account
  // one: resetting requires a verified email, so that user would request a code and never
  // receive it. They need the verification mail instead.
  const isVerificationError = error.toLowerCase().includes('verify your email');

  return (
    <AuthCard title="Log In" subtitle="Sign in with your Purdue account.">
      {error && (
        <Banner tone="error">
          {error}
          {!isVerificationError && (
            <>
              {' '}
              {/* Carries the typed address across so the reset page opens ready to send. */}
              <Link
                to="/forgot-password"
                state={{ email }}
                className="font-semibold underline underline-offset-2 hover:text-red-900"
              >
                Forgot your password?
              </Link>
            </>
          )}
        </Banner>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field
          id="login-email"
          label="Purdue Email"
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="pete@purdue.edu"
        />

        <PasswordField
          id="login-password"
          label="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          labelRight={
            <Link to="/forgot-password" className="font-body text-xs font-semibold text-usb-charcoal hover:text-black underline">
              Forgot password?
            </Link>
          }
        />

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Log In'}
        </Button>
      </form>

      <p className="font-body text-sm text-usb-muted mt-6 text-center">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-usb-charcoal underline">
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
