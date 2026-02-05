import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";
// import { getAnalytics, type Analytics } from "firebase/analytics";

// Firebase configuration with environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only if environment variables are available
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
// let analytics: Analytics | null = null;

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return (
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID
  );
};

// Initialize Firebase services
if (isFirebaseConfigured()) {
  try {
    // Initialize Firebase app
    app = initializeApp(firebaseConfig);

    // Initialize Firestore
    db = getFirestore(app);

    // Initialize Auth
    auth = getAuth(app);

    // Initialize Storage
    storage = getStorage(app);

    // Initialize Analytics (only in production)
    // if (import.meta.env.PROD && import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
    //   analytics = getAnalytics(app);
    // }

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("✅ Firebase initialized successfully");
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("❌ Firebase initialization failed:", error);
    }
  }
} else {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn("⚠️ Firebase not configured - using local data only");
  }
}

export { app, db, auth, storage, isFirebaseConfigured };
