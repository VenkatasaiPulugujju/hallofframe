import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import rawConfig from '../../firebase-applet-config.json';
import { OperationType, type FirestoreErrorInfo } from '../types';

// The allowed domain for Chinmaya Vishwavidyapeeth (CVV)
export const ALLOWED_EMAIL_DOMAIN = 'cvv.ac.in';

// Check if email belongs to verified @cvv.ac.in domain
export function isCvvEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const pattern = /^[a-zA-Z0-9._%+-]+@cvv\.ac\.in$/;
  return pattern.test(normalized) && normalized.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
}

// Client configuration from firebase-applet-config.json with env fallbacks
export const firebaseConfig = {
  apiKey: rawConfig.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAdQnNiYpVwXvp1dgtbbKOrE0T5nbDDq10",
  authDomain: rawConfig.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "collage-b3e32.firebaseapp.com",
  projectId: rawConfig.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || "collage-b3e32",
  storageBucket: rawConfig.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "collage-b3e32.firebasestorage.app",
  messagingSenderId: rawConfig.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "428748235882",
  appId: rawConfig.appId || import.meta.env.VITE_FIREBASE_APP_ID || "1:428748235882:web:74e4c16c541dcdaa2a9613",
  measurementId: rawConfig.measurementId || import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-YJ217FT7E7",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('Placeholder')
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Initialize analytics if supported in the browser environment
  isSupported().then((supported) => {
    if (supported && app) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics optional in preview environments
  });
} catch (err) {
  console.warn('Firebase initialization error:', err);
}

export { app, auth, db, storage, analytics };

// Google Auth Provider configured with domain hint
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  hd: ALLOWED_EMAIL_DOMAIN, // Hint to Google account picker
  prompt: 'select_account',
});

// Standardized error handler for Firestore operations
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentAuthUser = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: currentAuthUser?.uid ?? null,
      email: currentAuthUser?.email ?? null,
      emailVerified: currentAuthUser?.emailVerified ?? null,
      isAnonymous: currentAuthUser?.isAnonymous ?? null,
      tenantId: currentAuthUser?.tenantId ?? null,
      providerInfo: currentAuthUser?.providerData?.map((p) => ({
        providerId: p.providerId,
        email: p.email,
      })) || [],
    },
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
