import { Navigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'pro';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'admin',
}) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0D0520, #1A0935)',
      }}>
        <div style={{ textAlign: 'center', color: 'rgba(196,181,212,0.8)' }}>
          <div style={{
            width: '40px', height: '40px', border: '3px solid rgba(199,106,0,0.3)',
            borderTopColor: '#C76A00', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <p style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>Loading…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not authenticated → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role → go to login (access denied)
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
