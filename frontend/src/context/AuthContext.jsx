import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'usb_auth';
const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please log in again.';

async function parseResponse(response) {
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || 'Something went wrong.' };
  }
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong.');
  }
  return data;
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [auth]);

  // Read through a ref so authFetch keeps a stable identity and can safely sit in effect
  // dependency arrays without re-firing every render.
  const authRef = useRef(auth);
  useEffect(() => {
    authRef.current = auth;
  }, [auth]);

  /**
   * fetch() for endpoints that require a login: attaches the bearer token, and treats a 401 as
   * "this session is over" by clearing it.
   *
   * Without this, an expired token left isAuthenticated stuck at true - the UI kept rendering
   * as signed in while every protected request quietly failed in a console.error. Access tokens
   * are 2h now (down from 24h), so this is a routine path, not a corner case.
   */
  const authFetch = useCallback(async (url, options = {}) => {
    const token = authRef.current?.token;
    const headers = { ...(options.headers || {}) };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      setAuth(null);
      throw new Error(SESSION_EXPIRED_MESSAGE);
    }

    return response;
  }, []);

  const signup = async (username, email, password) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    return parseResponse(response);
  };

  const verifyEmail = async (email, code) => {
    const response = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    const data = await parseResponse(response);
    setAuth(data);
    return data;
  };

  const resendCode = async (email) => {
    const response = await fetch('/api/auth/resend-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return parseResponse(response);
  };

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await parseResponse(response);
    setAuth(data);
    return data;
  };

  const requestPasswordReset = async (email) => {
    const response = await fetch('/api/auth/request-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return parseResponse(response);
  };

  const resetPassword = async (email, code, newPassword) => {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword })
    });
    return parseResponse(response);
  };

  const logout = () => setAuth(null);

  const value = {
    user: auth?.user || null,
    token: auth?.token || null,
    isAuthenticated: !!auth?.token,
    isAdmin: !!auth?.user?.isAdmin,
    authFetch,
    signup,
    verifyEmail,
    resendCode,
    login,
    logout,
    requestPasswordReset,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
