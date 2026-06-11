import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Demo Credentials ──────────────────────────────────────────────────────────
const DEMO_USERS: Record<string, { password: string; role: 'admin' | 'pro'; name: string; email: string }> = {
  admin: { password: 'admin123', role: 'admin', name: 'Super Admin',  email: 'admin@doshanivarana.com' },
  pro:   { password: 'pro123',   role: 'pro',   name: 'PRO Manager',  email: 'pro@doshanivarana.com'   },
};

const SESSION_KEY = 'dn_demo_session';
const HANDOFF_PARAM = 'dn_auth';

// ─── Types ─────────────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'pro';

export interface DemoUser {
  username: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: DemoUser | null;
  role: UserRole | null;
  templeId: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<UserRole>;
  logout: () => void;
}

// ─── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  currentUser: null,
  role: null,
  templeId: null,
  loading: true,
  login: async () => { throw new Error('AuthProvider not mounted'); },
  logout: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1️⃣ Check URL for a cross-app session handoff first
    const params = new URLSearchParams(window.location.search);
    const handoff = params.get(HANDOFF_PARAM);
    if (handoff) {
      try {
        const user = JSON.parse(atob(handoff)) as DemoUser;
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        setCurrentUser(user);
        // Clean the URL so it doesn't persist on refresh
        const clean = window.location.pathname;
        window.history.replaceState({}, '', clean);
        setLoading(false);
        return;
      } catch {
        // Ignore bad handoff param
      }
    }

    // 2️⃣ Restore session from localStorage
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        setCurrentUser(JSON.parse(raw) as DemoUser);
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<UserRole> => {
    await new Promise(r => setTimeout(r, 600));

    const match = DEMO_USERS[username.toLowerCase().trim()];
    if (!match || match.password !== password) {
      throw new Error('Invalid username or password. Please try again.');
    }

    const user: DemoUser = {
      username: username.toLowerCase().trim(),
      name: match.name,
      email: match.email,
      role: match.role,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    setCurrentUser(user);
    return match.role;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!currentUser,
      currentUser,
      role: currentUser?.role ?? null,
      templeId: currentUser ? 'SVT_01' : null,
      loading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// ─── Helper: build cross-app redirect URL ─────────────────────────────────────
export function buildHandoffUrl(targetOrigin: string, user: DemoUser): string {
  const encoded = btoa(JSON.stringify(user));
  return `${targetOrigin}/?${HANDOFF_PARAM}=${encoded}`;
}
