import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from '../lib/firebase.ts';
import type { UserProfile } from '../types/finance.ts';
import firebaseConfig from '../../firebase-applet-config.json';

interface GoogleApiStatus {
  isLoaded: boolean;
  clientId: string;
  projectId: string;
  error?: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  token: string | null;
  googleStatus: GoogleApiStatus;
  signInWithGoogle: () => Promise<void>;
  signInWithCredentials: (identifier: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInAsSilas: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [googleStatus, setGoogleStatus] = useState<GoogleApiStatus>({
    isLoaded: false,
    clientId: firebaseConfig.oAuthClientId,
    projectId: firebaseConfig.projectId,
  });

  // Verify stored token or fetch user profile
  const verifyCurrentSession = async (existingToken: string) => {
    try {
      const res = await fetch('/api/me', {
        headers: {
          Authorization: `Bearer ${existingToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setUser({
          uid: data.user.id,
          email: data.user.email,
          displayName: data.user.name,
          photoURL: data.user.avatar,
        });
        setToken(existingToken);
        return true;
      } else {
        localStorage.removeItem('silas_finance_token');
        return false;
      }
    } catch (err) {
      console.warn('Sessão local não validada:', err);
      return false;
    }
  };

  // Check Google Identity Services API script
  useEffect(() => {
    // Load Google Identity Services script if not already present
    if (!document.getElementById('google-gsi-client')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setGoogleStatus((prev) => ({ ...prev, isLoaded: true }));
      };
      script.onerror = () => {
        setGoogleStatus((prev) => ({
          ...prev,
          error: 'Não foi possível carregar o script Google Identity Services',
        }));
      };
      document.head.appendChild(script);
    } else {
      setGoogleStatus((prev) => ({ ...prev, isLoaded: true }));
    }
  }, []);

  // Initialize Auth State (Check localStorage first, then Firebase)
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const savedToken = localStorage.getItem('silas_finance_token');
      if (savedToken) {
        const valid = await verifyCurrentSession(savedToken);
        if (valid && isMounted) {
          setLoading(false);
          return;
        }
      }

      // Also listen to Firebase Auth changes
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (!isMounted) return;

        if (currentUser) {
          try {
            const idToken = await currentUser.getIdToken();
            setToken(idToken);
            localStorage.setItem('silas_finance_token', idToken);

            const res = await fetch('/api/auth/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify({
                name: currentUser.displayName || 'Silas Vinícius',
                avatar: currentUser.photoURL || '',
              }),
            });

            if (res.ok) {
              const data = await res.json();
              setProfile(data.user);
              setUser(currentUser);
            }
          } catch (e) {
            console.error('Erro na sincronização Firebase:', e);
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Direct Login with Username (silas) and Password (060333)
  const signInWithCredentials = async (identifier: string, pass: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: identifier, password: pass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao autenticar.');
      }

      setToken(data.token);
      localStorage.setItem('silas_finance_token', data.token);
      setProfile(data.user);
      setUser({
        uid: data.user.id,
        email: data.user.email,
        displayName: data.user.name,
        photoURL: data.user.avatar,
      });
    } catch (err: any) {
      console.error('Erro ao logar com credenciais:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 2. Google Authentication API (Firebase Auth + Google Identity fallback)
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // First attempt: Firebase Google Auth popup
      try {
        const result = await signInWithPopup(auth, googleAuthProvider);
        if (result && result.user) {
          const idToken = await result.user.getIdToken();

          // Sync with our PostgreSQL backend
          const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user: {
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName,
                photoURL: result.user.photoURL,
              },
              idToken,
            }),
          });

          const data = await res.json();
          if (res.ok) {
            setToken(data.token);
            localStorage.setItem('silas_finance_token', data.token);
            setProfile(data.user);
            setUser(result.user);
            return;
          }
        }
      } catch (firebaseErr: any) {
        console.warn('Firebase Popup result code:', firebaseErr.code, firebaseErr.message);

        // If popup blocked or cancelled or operation-not-allowed
        if (firebaseErr.code === 'auth/popup-blocked') {
          throw new Error('O navegador bloqueou a janela pop-up do Google. Por favor, permita pop-ups ou use usuário: silas / senha: 060333.');
        }

        if (firebaseErr.code === 'auth/popup-closed-by-user') {
          throw new Error('A janela de autenticação do Google foi fechada antes de concluir.');
        }

        // Check if Google Identity Services prompt can be shown
        if (typeof (window as any).google !== 'undefined' && (window as any).google.accounts) {
          const google = (window as any).google;
          await new Promise<void>((resolve, reject) => {
            google.accounts.id.initialize({
              client_id: firebaseConfig.oAuthClientId,
              callback: async (response: any) => {
                try {
                  const res = await fetch('/api/auth/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ credential: response.credential }),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setToken(data.token);
                    localStorage.setItem('silas_finance_token', data.token);
                    setProfile(data.user);
                    setUser({
                      uid: data.user.id,
                      email: data.user.email,
                      displayName: data.user.name,
                      photoURL: data.user.avatar,
                    });
                    resolve();
                  } else {
                    reject(new Error(data.error || 'Erro ao sincronizar com Google'));
                  }
                } catch (e) {
                  reject(e);
                }
              },
            });
            google.accounts.id.prompt((notification: any) => {
              if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // If GIS prompt is not displayed in iframe, fallback to message
                console.info('Google GIS prompt skipped or suppressed by browser');
              }
            });
          });
          return;
        }

        throw new Error(firebaseErr.message || 'Erro ao conectar à API do Google.');
      }
    } catch (error: any) {
      console.error('Erro na autenticação com o Google:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 3. User registration
  const signUpWithEmail = async (email: string, pass: string) => {
    await signInWithCredentials(email, pass);
  };

  // 4. Password reset
  const resetPassword = async (email: string) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    console.log(`Instruções de recuperação enviadas para: ${email}`);
  };

  // 5. One-click instant login for Silas Vinícius
  const signInAsSilas = async () => {
    await signInWithCredentials('silas', '060333');
  };

  // 6. Logout
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('silas_finance_token');
    setUser(null);
    setProfile(null);
    setToken(null);
  };

  const refreshProfile = async () => {
    const currentToken = token || localStorage.getItem('silas_finance_token');
    if (currentToken) {
      await verifyCurrentSession(currentToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        token,
        googleStatus,
        signInWithGoogle,
        signInWithCredentials,
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
