import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth, buildHandoffUrl, type DemoUser } from '../../../contexts/AuthContext';

// ── Which app is this? We detect by checking window.location.port
// Admin panel runs on a higher port (5174 by default when pro is on 5173).
// We use an env-style approach: the admin panel passes its own URL via
// import.meta.env, or we fall back to smart detection.
const THIS_ROLE = 'admin' as const;
const OTHER_ROLE = 'pro' as const;

// When running dev, pro-panel is typically on 5173. In production this
// would be a real URL. For demo we detect by port offset.
function getPROPanelOrigin(): string {
  const { protocol, hostname, port } = window.location;
  // Heuristic: admin is usually one port above pro
  // If admin is on 5174, pro is on 5173; if admin is on 3001, pro is on 3000
  const adminPort = parseInt(port || '80', 10);
  const proPort = adminPort - 1;
  return `${protocol}//${hostname}:${proPort}`;
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const role = await login(username, password);

      if (role === THIS_ROLE) {
        // ✅ Admin → go straight to admin dashboard
        navigate('/', { replace: true });
      } else {
        // ✅ PRO creds entered here → cross-app redirect to PRO panel
        setRedirecting(true);
        const user: DemoUser = {
          username: username.toLowerCase().trim(),
          name: 'PRO Manager',
          email: 'pro@doshanivarana.com',
          role: OTHER_ROLE,
        };
        const targetUrl = buildHandoffUrl(getPROPanelOrigin(), user);
        // Small delay so user sees the "Redirecting..." state
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 700);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
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

      {/* Mandala watermark */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }} viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#C76A00" strokeWidth="0.8" fill="none" transform="translate(400,400)">
          <circle r="340" /><circle r="280" strokeDasharray="4 4" /><circle r="220" />
          <circle r="160" strokeDasharray="2 6" /><circle r="100" /><circle r="50" strokeDasharray="3 3" />
          <line x1="-340" y1="0" x2="340" y2="0" /><line x1="0" y1="-340" x2="0" y2="340" />
          <line x1="-240" y1="-240" x2="240" y2="240" /><line x1="240" y1="-240" x2="-240" y2="240" />
          <polygon points="0,-160 92,-80 57,130 -57,130 -92,-80" />
          <polygon points="0,160 -92,80 -57,-130 57,-130 92,80" />
        </g>
      </svg>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap');
        @keyframes floatOrb1 { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-30px) scale(1.05)} }
        @keyframes floatOrb2 { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(25px) scale(0.97)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
        .dn-card{animation:slideUp 0.55s cubic-bezier(0.22,1,0.36,1) both}
        .dn-input:focus{outline:none;border-color:#C76A00 !important;box-shadow:0 0 0 3px rgba(199,106,0,0.15) !important}
        .dn-input::placeholder{color:rgba(139,119,119,0.5)}
        .dn-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 12px 32px rgba(199,106,0,0.45) !important}
        .dn-btn:active:not(:disabled){transform:translateY(0)}
        .dn-btn:disabled{opacity:0.75;cursor:not-allowed}
        .dn-eye:hover{color:#C76A00 !important}
        .dn-cred-row:hover{background:rgba(255,255,255,0.05);border-radius:8px;cursor:pointer}
      `}</style>

      <main style={{ width: '100%', maxWidth: '440px', padding: '16px', position: 'relative', zIndex: 10 }}>
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

            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', color: 'rgba(196,181,212,0.7)', marginTop: '6px', textTransform: 'uppercase' }}>
              Digital Temple Services
            </p>

            {/* Role pills */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              {[{ label: '🛡️ Admin', color: '#4A1259', border: 'rgba(74,18,89,0.6)' }, { label: '⚡ PRO', color: '#a04100', border: 'rgba(199,106,0,0.5)' }].map(r => (
                <span key={r.label} style={{
                  fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
                  padding: '3px 10px', borderRadius: '20px',
                  background: r.color + '33', border: `1px solid ${r.border}`,
                  color: 'rgba(255,255,255,0.75)',
                }}>{r.label}</span>
              ))}
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', marginTop: '24px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: '10px', color: 'rgba(196,181,212,0.5)', fontWeight: 600, letterSpacing: '0.1em' }}>SIGN IN</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            </div>
          </div>

          {/* Error */}
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

          {/* Redirecting state */}
          {redirecting && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'rgba(199,106,0,0.15)', border: '1px solid rgba(199,106,0,0.3)',
              borderRadius: '10px', padding: '14px 16px', marginBottom: '20px',
            }}>
              <span style={{ width: '18px', height: '18px', border: '2px solid rgba(199,106,0,0.3)', borderTopColor: '#C76A00', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '13px', color: '#E8894A', fontWeight: 600 }}>Redirecting to PRO Panel…</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Username */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="dn-username" style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em' }}>USERNAME</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' }}>👤</span>
                <input
                  id="dn-username"
                  className="dn-input"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                  disabled={isLoading || redirecting}
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

            {/* Password */}
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
                  disabled={isLoading || redirecting}
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

            {/* Submit */}
            <div style={{ paddingTop: '6px' }}>
              <button
                id="dn-login-btn"
                type="submit"
                disabled={isLoading || redirecting}
                className="dn-btn"
                style={{
                  width: '100%', height: '50px',
                  background: (isLoading || redirecting)
                    ? 'linear-gradient(135deg, rgba(199,106,0,0.6), rgba(232,137,74,0.6))'
                    : 'linear-gradient(135deg, #C76A00, #E8894A)',
                  border: 'none', borderRadius: '12px',
                  color: '#FFFFFF', fontSize: '15px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  boxShadow: '0 8px 24px rgba(199,106,0,0.35)',
                  transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)',
                  letterSpacing: '0.02em', cursor: (isLoading || redirecting) ? 'not-allowed' : 'pointer',
                }}
              >
                {isLoading ? (
                  <>
                    <span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Authenticating…
                  </>
                ) : redirecting ? (
                  <>
                    <span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Redirecting…
                  </>
                ) : (
                  <>Sign In →</>
                )}
              </button>
            </div>
          </form>

          {/* Demo credentials — clickable to auto-fill */}
          <div style={{ marginTop: '24px', background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.22)', borderRadius: '12px', padding: '14px 16px' }}>
            <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 700, color: '#F5D673', letterSpacing: '0.08em' }}>🔑 DEMO CREDENTIALS — Click to fill</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: 'Admin', user: 'admin', pass: 'admin123', badge: '🛡️', dest: 'Admin Dashboard' },
                { label: 'PRO',   user: 'pro',   pass: 'pro123',   badge: '⚡', dest: 'PRO Dashboard'   },
              ].map(c => (
                <div
                  key={c.label}
                  className="dn-cred-row"
                  onClick={() => { setUsername(c.user); setPassword(c.pass); setError(''); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', transition: 'background 0.15s', cursor: 'pointer', borderRadius: '8px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>{c.badge}</span>
                    <span style={{ fontSize: '12px', color: '#F5D673', fontFamily: 'monospace', fontWeight: 700 }}>{c.user} / {c.pass}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: 'rgba(196,181,212,0.5)', fontWeight: 600 }}>→ {c.dest}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '18px', marginBottom: 0, fontSize: '11px', color: 'rgba(196,181,212,0.35)' }}>
            Demo-only session · Dosha Nivarana Platform
          </p>
        </div>
      </main>
    </div>
  );
}
