// Firebase client initialization.
// Uses LOCAL persistence (localStorage) so auth state survives page reloads
// and redirect flows on iOS Safari (which aggressively partitions sessionStorage).

import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  inMemoryPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

// Set persistence to survive redirects and browser restarts.
// Firebase will automatically fall back in this priority order:
//   indexedDB → localStorage → in-memory
// On iOS Safari where sessionStorage gets partitioned during OAuth redirects,
// indexedDB and localStorage persist correctly across the sign-in flow.
if (typeof window !== "undefined") {
  setPersistence(auth, indexedDBLocalPersistence)
    .catch(() =>
      setPersistence(auth, browserLocalPersistence).catch(() =>
        setPersistence(auth, inMemoryPersistence)
      )
    );
}

export default app;
