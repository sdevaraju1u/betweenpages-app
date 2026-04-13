"use client";

// AuthContext — provides auth state to the entire app.
//
// HOW IT WORKS:
// 1. AuthProvider mounts → sets up onAuthStateChanged listener
// 2. Listener fires immediately (checks if user has a cached session)
// 3. Listener fires again whenever user signs in or out
// 4. We store the user in React state → triggers re-render everywhere
// 5. Any component calls useAuth() to get { user, loading, signIn, signOut }

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
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  type User,
} from "firebase/auth";
import { auth } from "./config";

// --- Types ---
type AuthContextValue = {
  user: User | null; // null = not logged in
  loading: boolean; // true while checking cached session on page load
  signIn: () => Promise<void>; // opens Google popup
  signOut: () => Promise<void>; // logs out
};

// --- Context ---
// Default value is only used if a component reads useAuth() outside of AuthProvider.
// We throw an error instead (see useAuth below).
const AuthContext = createContext<AuthContextValue | null>(null);

// --- Provider ---
// Wrap your app with this in layout.tsx:
//   <AuthProvider>{children}</AuthProvider>
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // start true, flip to false once we know

  // Set up the auth state listener on mount.
  // onAuthStateChanged returns an unsubscribe function — we call it on unmount.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe; // cleanup on unmount
  }, []);

  // Sign in with Google popup, then redirect to landing page
  async function signIn() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // Always land on the discovery page after login
    if (window.location.pathname !== "/") {
      window.location.href = "/";
    }
  }

  // Sign out
  async function signOut() {
    await firebaseSignOut(auth);
    // No need to setUser(null) — onAuthStateChanged will fire automatically
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// --- Hook ---
// Components call this to access auth state:
//   const { user, loading, signIn, signOut } = useAuth();
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
