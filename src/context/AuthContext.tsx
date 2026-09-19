import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  type User,
} from '../lib/firebase.ts';
import type { UserProfile } from '../types/finance.ts';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  token: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInAsSilas: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync with backend on auth state change
  const syncUserWithBackend = async (firebaseUser: User) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      setToken(idToken);

      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          name: firebaseUser.displayName || 'Silas Vinícius',
          avatar: firebaseUser.photoURL || '',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
      } else {
        // Fallback profile if sync fails
        setProfile({
          id: firebaseUser.uid,
          email: firebaseUser.email || 'silasvinicius.dev@gmail.com',
          name: firebaseUser.displayName || 'Silas Vinícius',
          avatar: firebaseUser.photoURL || '',
        });
      }
    } catch (err) {
      console.error('Error syncing user with backend:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await syncUserWithBackend(currentUser);
      } else {
        setUser(null);
        setProfile(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      setUser(result.user);
      await syncUserWithBackend(result.user);
    } catch (error) {
      console.error('Erro ao autenticar com Google:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      setUser(result.user);
      await syncUserWithBackend(result.user);
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      setUser(result.user);
      await syncUserWithBackend(result.user);
    } catch (error) {
      console.error('Erro no cadastro:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // One-click instant login for Silas Vinícius
  const signInAsSilas = async () => {
    setLoading(true);
    try {
      // Try signing in with Silas's email, or create default demo account
      const silasEmail = 'silasvinicius.dev@gmail.com';
      const defaultPass = 'SilasFinance2026!';
      try {
        await signInWithEmail(silasEmail, defaultPass);
      } catch (loginErr: any) {
        if (loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential') {
          // Try creating the user
          await signUpWithEmail(silasEmail, defaultPass);
        } else {
          throw loginErr;
        }
      }
    } catch (error) {
      console.warn('Fallback: authenticating with Google popup...');
      await signInWithGoogle();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
    setToken(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await syncUserWithBackend(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        token,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signInAsSilas,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
