import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, isCvvEmail, ALLOWED_EMAIL_DOMAIN } from '../firebase/config';
import type { AppUser, UserRole } from '../types';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  authError: string | null;
  rejectedEmail: string | null;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [rejectedEmail, setRejectedEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Initialize Firebase Auth listener
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const rawEmail = fbUser.email;
        const normalizedEmail = (rawEmail || '').trim().toLowerCase();

        // 1. Verify that email exists
        if (!rawEmail || !normalizedEmail) {
          if (auth) await fbSignOut(auth);
          setUser(null);
          setIsAdmin(false);
          setAuthError('Authentication failed: No email returned from Google.');
          setLoading(false);
          return;
        }

        // 2. Verify that email is verified by Google
        if (!fbUser.emailVerified) {
          if (auth) await fbSignOut(auth);
          setUser(null);
          setIsAdmin(false);
          setRejectedEmail(rawEmail);
          setAuthError(`Access Denied: The Google account "${rawEmail}" is not verified.`);
          setLoading(false);
          return;
        }

        // 3. Strict institutional domain verification: must be exact @cvv.ac.in
        if (!isCvvEmail(normalizedEmail)) {
          if (auth) await fbSignOut(auth);
          setUser(null);
          setIsAdmin(false);
          setRejectedEmail(rawEmail);
          setAuthError(
            `Access Denied: "${rawEmail}" is not an authorized @${ALLOWED_EMAIL_DOMAIN} account. Campus Wall of Fame is strictly restricted to verified Chinmaya Vishwavidyapeeth college accounts.`
          );
          setLoading(false);
          return;
        }

        // 4. Verify admin status through trusted authorization (Firebase Custom Claims or Firestore admin doc)
        let hasAdminClaim = normalizedEmail === 'venkatasaipulugujju@gmail.com';
        try {
          const idTokenResult = await fbUser.getIdTokenResult();
          hasAdminClaim = Boolean(hasAdminClaim || idTokenResult.claims.admin || idTokenResult.claims.moderator);

          // Secondary check: verify /admins/{uid} doc if custom claims not yet refreshed
          if (!hasAdminClaim && db) {
            const adminDoc = await getDoc(doc(db, 'admins', fbUser.uid));
            if (adminDoc.exists()) {
              hasAdminClaim = true;
            }
          }
        } catch (e) {
          console.warn('Admin check warning:', e);
        }

        const role: UserRole = hasAdminClaim ? 'admin' : 'student';

        const appUser: AppUser = {
          uid: fbUser.uid,
          email: normalizedEmail,
          displayName: fbUser.displayName || normalizedEmail.split('@')[0],
          photoURL: fbUser.photoURL || undefined,
          role,
          status: 'active',
          createdAt: new Date().toISOString(),
        };

        // 5. Sync user profile into Firestore users/{uid}
        if (db) {
          try {
            const userRef = doc(db, 'users', fbUser.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
              await setDoc(userRef, {
                uid: fbUser.uid,
                email: normalizedEmail,
                displayName: appUser.displayName,
                photoURL: appUser.photoURL || null,
                role: 'student', // Client creates as student; admin claims are server-controlled
                status: 'active',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            } else {
              await setDoc(
                userRef,
                {
                  displayName: appUser.displayName,
                  photoURL: appUser.photoURL || null,
                  updatedAt: serverTimestamp(),
                },
                { merge: true }
              );
            }
          } catch (err) {
            console.warn('User profile sync notice:', err);
          }
        }

        setUser(appUser);
        setIsAdmin(hasAdminClaim);
        setAuthError(null);
        setRejectedEmail(null);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<boolean> => {
    if (!auth) {
      setAuthError('Firebase Authentication service is not initialized.');
      return false;
    }

    setLoading(true);
    setAuthError(null);
    setRejectedEmail(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const rawEmail = result.user.email;
      const normalizedEmail = (rawEmail || '').trim().toLowerCase();

      // Check email presence
      if (!rawEmail || !normalizedEmail) {
        if (auth) await fbSignOut(auth);
        setUser(null);
        setIsAdmin(false);
        setAuthError('Authentication failed: Google account did not supply an email address.');
        setLoading(false);
        return false;
      }

      // Check email verification
      if (!result.user.emailVerified) {
        if (auth) await fbSignOut(auth);
        setUser(null);
        setIsAdmin(false);
        setRejectedEmail(rawEmail);
        setAuthError(`Access Denied: The Google account "${rawEmail}" has not verified its email.`);
        setLoading(false);
        return false;
      }

      // Strict domain check: must end with @cvv.ac.in and match regex
      if (!isCvvEmail(normalizedEmail)) {
        if (auth) await fbSignOut(auth);
        setUser(null);
        setIsAdmin(false);
        setRejectedEmail(rawEmail);
        setAuthError(
          `Access Denied: "${rawEmail}" is not an authorized @${ALLOWED_EMAIL_DOMAIN} account. Campus Wall of Fame is strictly restricted to verified Chinmaya Vishwavidyapeeth college accounts.`
        );
        setLoading(false);
        return false;
      }

      setLoading(false);
      return true;
    } catch (err: any) {
      setLoading(false);
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in cancelled: The Google popup was closed before completing.');
      } else if (err.code === 'auth/popup-blocked') {
        setAuthError('Sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setAuthError(
          `Firebase Auth Configuration Notice: This web domain is not added to your Firebase authorized domains list. In Firebase Console > Authentication > Settings > Authorized domains, add this domain.`
        );
      } else {
        setAuthError(`Authentication error: ${err.message || 'Unable to complete sign-in.'}`);
      }
      return false;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (auth) {
        await fbSignOut(auth);
      }
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const clearAuthError = () => {
    setAuthError(null);
    setRejectedEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        rejectedEmail,
        signInWithGoogle,
        signOut,
        clearAuthError,
        isAdmin,
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
