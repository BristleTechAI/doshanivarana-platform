import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRole } from '@devaseva/core';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  templeId: string | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  templeId: null,
  loading: true,
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [templeId, setTempleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Get custom claims
        const token = await currentUser.getIdTokenResult();
        setRole((token.claims.role as UserRole) || UserRole.USER);
        setTempleId((token.claims.templeId as string) || null);

        // Update session
        const sessionRef = doc(db, 'userSessions', currentUser.uid);
        await setDoc(sessionRef, {
          userId: currentUser.uid,
          lastSeen: serverTimestamp(),
          role: token.claims.role || UserRole.USER,
        }, { merge: true });

      } else {
        setUser(null);
        setRole(null);
        setTempleId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, role, templeId, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
