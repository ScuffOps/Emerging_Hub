import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/** Handles return from auth.emergentagent.com — picks up #session_id and exchanges it. */
const AuthCallback = () => {
  const navigate = useNavigate();
  const { completeGoogleLogin } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const hash = window.location.hash || '';
    const m = hash.match(/session_id=([^&]+)/);
    const sessionId = m ? decodeURIComponent(m[1]) : null;
    if (!sessionId) {
      setError('Missing session_id from auth provider.');
      return;
    }
    completeGoogleLogin(sessionId)
      .then(() => navigate('/commissions', { replace: true }))
      .catch((e) => setError(e.message || 'Login failed'));
  }, [completeGoogleLogin, navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#171718] text-white p-6" data-testid="auth-callback-page">
      <div className="glass-card rounded-[28px] p-10 max-w-md w-full text-center">
        {error ? (
          <>
            <div className="w-12 h-12 rounded-full bg-[#600612]/20 border border-[#600612]/40 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-5 h-5 text-[#ff8095]" />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#E1DBC2' }}>Login failed</h2>
            <p className="text-sm text-[#7E88B7] mb-5">{error}</p>
            <button onClick={() => navigate('/commissions')} className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-[#B1EDE8] hover:bg-white/10">Back</button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-[#066DF7]/20 border border-[#066DF7]/40 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-5 h-5 text-[#066DF7]" />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#E1DBC2' }}>Verifying you…</h2>
            <p className="text-sm text-[#7E88B7] mb-5">One sec while we confirm your Google session.</p>
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#B1EDE8]" />
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
