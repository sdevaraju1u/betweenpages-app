"use client";

// AuthContext — provides auth state to the entire app.
// Uses signInWithPopup on desktop and signInWithRedirect on mobile (iOS Safari
// doesn't support popups properly due to storage partitioning).

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  browserPopupRedirectResolver,
  type User,
} from "firebase/auth";
import { auth } from "./config";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Detect mobile / popup-unfriendly browsers. */
function isMobileBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  // iOS (iPhone, iPad, iPod) or Android mobile
  return /iPhone|iPad|iPod|Android/i.test(ua);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle redirect result (from signInWithRedirect on mobile)
    // Must be called ONCE on page load. No-op if no redirect happened.
    getRedirectResult(auth, browserPopupRedirectResolver)
      .catch((err) => {
        // Swallow — if this fails, the onAuthStateChanged listener still works
        console.warn("Redirect result error (safe to ignore if not redirecting):", err);
      });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signIn() {
    const provider = new GoogleAuthProvider();

    if (isMobileBrowser()) {
      // Mobile: redirect (page will reload after sign-in)
      await signInWithRedirect(auth, provider, browserPopupRedirectResolver);
      // signInWithRedirect navigates away — nothing below here runs
    } else {
      // Desktop: popup
      await signInWithPopup(auth, provider, browserPopupRedirectResolver);
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
