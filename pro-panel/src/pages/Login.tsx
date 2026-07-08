import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const { login, isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('pro@doshanivarana.com');
  const [password, setPassword] = useState('proPassword123!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return !!(params.get('email') && params.get('password'));
  });
  
  const isDemoMode = import.meta.env.VITE_DEMO_AUTH_MODE === 'true';

  // If already authenticated with the correct role, redirect to dashboard.
  // If authenticated with wrong role, redirect to correct port.
  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'PRO') {
        navigate('/', { replace: true });
      } else if (role === 'ADMIN') {
        const redirectAndLogout = async () => {
          const baseUrl = import.meta.env.VITE_ADMIN_PANEL_URL || 'http://localhost:5173/';
          await logout();
          window.location.href = baseUrl;
        };
        redirectAndLogout();
      }
    }
  }, [isAuthenticated, role, navigate, logout]);

  // Check for auto-login credentials in URL query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlEmail = params.get('email');
    const urlPassword = params.get('password');

    if (urlEmail && urlPassword) {
      // Clear credentials from address bar immediately
      window.history.replaceState({}, document.title, window.location.pathname);
      
      setEmail(urlEmail);
      setPassword(urlPassword);
      setIsLoading(true);
      setError('');

      login(urlEmail, urlPassword)
        .then(async (userRole) => {
          if (userRole === 'PRO') {
            navigate('/', { replace: true });
          } else if (userRole === 'ADMIN') {
            const baseUrl = import.meta.env.VITE_ADMIN_PANEL_URL || 'http://localhost:5173/';
            const targetUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            await logout();
            window.location.href = `${targetUrl}/login?email=${encodeURIComponent(urlEmail)}&password=${encodeURIComponent(urlPassword)}`;
          } else {
            setError('Unauthorized.');
            setIsLoading(false);
          }
        })
        .catch((err) => {
          setError(err.message || 'Auto-login failed.');
          setIsLoading(false);
          setIsAutoLoggingIn(false);
        });
    }
  }, [login, navigate, logout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userRole = await login(email, password);

      if (userRole === 'PRO') {
        navigate('/', { replace: true });
      } else if (userRole === 'ADMIN') {
        const baseUrl = import.meta.env.VITE_ADMIN_PANEL_URL || 'http://localhost:5173/';
        const targetUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        await logout();
        window.location.href = `${targetUrl}/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      } else {
        await logout();
        setError('Unauthorized.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', system-ui, sans-serif",
      background: 'linear-gradient(135deg, #0D0520 0%, #1A0935 30%, #2D0B50 55%, #4A1259 80%, #C76A00 130%)',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(199,106,0,0.18) 0%, transparent 70%)', animation: 'floatOrb1 8s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,18,89,0.35) 0%, transparent 70%)', animation: 'floatOrb2 10s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', top: '40%', left: '15%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,160,23,0.1) 0%, transparent 70%)', animation: 'floatOrb1 12s ease-in-out infinite reverse' }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap');
        @keyframes floatOrb1 { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-30px) scale(1.05)} }
        @keyframes floatOrb2 { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(25px) scale(0.97)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .dn-card{animation:slideUp 0.55s cubic-bezier(0.22,1,0.36,1) both}
        .dn-input:focus{outline:none;border-color:#C76A00 !important;box-shadow:0 0 0 3px rgba(199,106,0,0.15) !important}
        .dn-input::placeholder{color:rgba(139,119,119,0.5)}
        .dn-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 12px 32px rgba(199,106,0,0.45) !important}
        .dn-btn:active:not(:disabled){transform:translateY(0)}
        .dn-btn:disabled{opacity:0.75;cursor:not-allowed}
        .dn-eye:hover{color:#C76A00 !important}
      `}</style>

      <main style={{ width: '100%', maxWidth: '440px', padding: '16px', position: 'relative', zIndex: 10 }}>
        {isAutoLoggingIn ? (
          <div className="dn-card" style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '20px', border: '1px solid rgba(255,255,255,0.12)',
            padding: '40px 36px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
            minHeight: '400px'
          }}>
             <div style={{ width: '40px', height: '40px', border: '3px solid rgba(199,106,0,0.3)', borderTopColor: '#C76A00', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '20px' }} />
             <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 600 }}>Authenticating securely...</p>
          </div>
        ) : (
        <div className="dn-card" style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '20px', border: '1px solid rgba(255,255,255,0.12)',
          padding: '40px 36px',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '18px',
              background: 'linear-gradient(135deg, #C76A00, #E8894A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px', boxShadow: '0 8px 24px rgba(199,106,0,0.5)',
            }}>
              <span style={{ fontSize: '28px', lineHeight: 1 }}>🕉</span>
            </div>

            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '24px', fontWeight: 800, color: '#FFFFFF',
              letterSpacing: '-0.3px', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}>Dosha Nivarana</h1>

            {isDemoMode && (
              <div style={{ marginTop: '8px', padding: '4px 12px', background: '#F59E0B', color: '#fff', borderRadius: '12px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>
                DEMO MODE ENABLED
              </div>
            )}

            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', color: 'rgba(196,181,212,0.7)', marginTop: '6px', textTransform: 'uppercase' }}>
              Management Portal
            </p>

            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              <span style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
                padding: '3px 10px', borderRadius: '20px',
                background: '#4A125933', border: `1px solid rgba(74,18,89,0.6)`,
                color: 'rgba(255,255,255,0.75)',
              }}>🛡️ Admin</span>
              <span style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
                padding: '3px 10px', borderRadius: '20px',
                background: '#C76A0033', border: `1px solid rgba(199,106,0,0.5)`,
                color: 'rgba(255,255,255,0.75)',
              }}>⚡ PRO</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', marginTop: '24px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: '10px', color: 'rgba(196,181,212,0.5)', fontWeight: 600, letterSpacing: '0.1em' }}>SIGN IN</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            </div>
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '10px', padding: '12px 14px', marginBottom: '20px',
            }}>
              <span style={{ fontSize: '16px', lineHeight: 1, flexShrink: 0 }}>⚠️</span>
              <p style={{ margin: 0, fontSize: '13px', color: '#FCA5A5', lineHeight: 1.5 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="dn-email" style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em' }}>EMAIL ADDRESS</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' }}>✉️</span>
                <input
                  id="dn-email"
                  className="dn-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                  style={{
                    width: '100%', height: '48px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px', paddingLeft: '44px', paddingRight: '16px',
                    fontSize: '14px', color: '#FFFFFF',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="dn-password" style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em' }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' }}>🔒</span>
                <input
                  id="dn-password"
                  className="dn-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                  style={{
                    width: '100%', height: '48px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px', paddingLeft: '44px', paddingRight: '48px',
                    fontSize: '14px', color: '#FFFFFF',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                />
                <button type="button" className="dn-eye" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(196,181,212,0.6)', fontSize: '16px', padding: '4px', transition: 'color 0.2s' }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ paddingTop: '6px' }}>
              <button
                type="submit"
                disabled={isLoading}
                className="dn-btn"
                style={{
                  width: '100%', height: '50px',
                  background: isLoading
                    ? 'linear-gradient(135deg, rgba(199,106,0,0.6), rgba(232,137,74,0.6))'
                    : 'linear-gradient(135deg, #C76A00, #E8894A)',
                  border: 'none', borderRadius: '12px',
                  color: '#FFFFFF', fontSize: '15px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  boxShadow: '0 8px 24px rgba(199,106,0,0.35)',
                  transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)',
                  letterSpacing: '0.02em', cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {isLoading ? (
                  <>
                    <span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Authenticating…
                  </>
                ) : (
                  <>Sign In →</>
                )}
              </button>
            </div>
          </form>

          {isDemoMode && (
            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.2)' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Demo Credentials:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '12px', color: '#fff' }}>
                  <span style={{ color: '#E8894A', fontWeight: 600 }}>Admin:</span> admin@doshanivarana.com <br/>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Pass:</span> Admin@123
                </div>
                <div style={{ fontSize: '12px', color: '#fff' }}>
                  <span style={{ color: '#E8894A', fontWeight: 600 }}>PRO:</span> pro@doshanivarana.com <br/>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Pass:</span> Pro@123
                </div>
              </div>
            </div>
          )}

        </div>
        )}
      </main>
    </div>
  );
}
