import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const TOKEN_KEY = 'veri_admin_token';
const USER_KEY = 'veri_admin_user';

const AuthContext = createContext(null);

const API_URL = (typeof window !== 'undefined' && window.location?.origin)
  ? window.location.origin
  : (process.env.REACT_APP_BACKEND_URL || '');

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  /** Initiates Emergent-managed Google OAuth flow. */
  const startGoogleLogin = useCallback(() => {
    const redirect = encodeURIComponent(`${window.location.origin}/auth/callback`);
    window.location.href = `https://auth.emergentagent.com/?redirect=${redirect}`;
  }, []);

  /** Exchange a session_id from the auth callback for a JWT. */
  const completeGoogleLogin = useCallback(async (sessionId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/google/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Login failed (${res.status})`);
      }
      const data = await res.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } finally { setLoading(false); }
  }, []);

  /** Fallback: legacy debut password login. */
  const passwordLogin = useCallback(async (password) => {
    const res = await fetch(`${API_URL}/api/auth/verify-debut`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) throw new Error('Invalid password');
    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.removeItem(USER_KEY);
    setToken(data.token);
    setUser(null);
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken('');
    setUser(null);
  }, []);

  // Validate token on mount; clears if expired/invalid.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (cancelled) return;
        if (!r.ok) logout();
      }).catch(() => {});
    return () => { cancelled = true; };
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{
      token, user, loading,
      isAuthed: !!token,
      startGoogleLogin, completeGoogleLogin, passwordLogin, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
