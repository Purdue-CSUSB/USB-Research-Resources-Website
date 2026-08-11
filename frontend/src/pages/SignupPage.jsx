import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ALLOWED_EMAIL_DOMAIN } from '../config.js';

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

  return (
    <motion.div
      className="min-h-screen pt-32 pb-16 px-6 flex items-start justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="w-full max-w-md bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-800 rounded-2xl p-8 card-hover"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        {step === 'signup' ? (
          <>
            <h1 className="text-3xl font-bold text-white mb-2">Sign Up</h1>
            <p className="text-gray-400 mb-6">Create an account with your Purdue email.</p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                <input
                  required
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="Pete Purdue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Purdue Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="pete@purdue.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="At least 8 characters"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg ${isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white hover:shadow-green-900/20'}`}
              >
                {isSubmitting ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <p className="text-sm text-gray-400 mt-6 text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-green-400 hover:text-green-300 font-medium">
                Log in
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
            <p className="text-gray-400 mb-6">
              We sent a 6-digit code to <span className="text-white">{email}</span>.
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
            {info && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                {info}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Verification Code</label>
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-center tracking-[0.5em] focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="------"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg ${isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white hover:shadow-green-900/20'}`}
              >
                {isSubmitting ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            <button
              onClick={handleResend}
              className="text-sm text-gray-400 hover:text-green-400 mt-6 w-full text-center transition-colors"
            >
              Didn't get a code? Resend
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
