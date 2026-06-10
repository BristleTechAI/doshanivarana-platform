import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, firestore } from '../lib/firebase';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { UserRole } from '@devaseva/core';

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  role: UserRole | null;
  loading: boolean;
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const token = await currentUser.getIdTokenResult();
          setRole((token.claims.role as UserRole) || UserRole.USER);
        } catch (e) {
          setRole(UserRole.USER);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return subscriber;
  }, []);

  const login = async (phone: string, otp: string) => {
    // Mocking Phone Auth using Email/Password for emulator/dev testing
    const email = `${phone}@doshanivarana.com`;
    let userCred;
    try {
      userCred = await auth().signInWithEmailAndPassword(email, otp);
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') {
        userCred = await auth().createUserWithEmailAndPassword(email, otp);
      } else {
        throw e;
      }
    }
    
    // Create/Update User document
    await firestore().collection('users').doc(userCred.user.uid).set({
      id: userCred.user.uid,
      phoneNumber: `+91${phone}`,
      role: UserRole.USER,
      status: 'ACTIVE',
      lastLoginAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
      createdAt: firestore.FieldValue.serverTimestamp() // Firestore merge will ignore this if it exists
    }, { merge: true });

    // Update Session
    await firestore().collection('userSessions').doc(userCred.user.uid).set({
      userId: userCred.user.uid,
      lastSeen: firestore.FieldValue.serverTimestamp(),
      role: UserRole.USER,
    }, { merge: true });
  };

  const logout = async () => {
    await auth().signOut();
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
