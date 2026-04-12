"use client";

// AppHeader — now auth-aware.
// Shows "Sign In" when logged out, user avatar + "Sign Out" when logged in.
// useAuth() reads from AuthContext (provided by Providers in layout.tsx).

import { useAuth } from "@/lib/firebase/AuthContext";

export default function AppHeader() {
  const { user, loading, signIn, signOut } = useAuth();

  return (
    <header className="glass-strong flex items-center justify-between h-16 px-8 shrink-0 z-10">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center font-display font-bold text-white text-sm shadow-neon-pink">
          B
        </div>
        <span className="font-display text-xl font-bold tracking-tight">
          Between<span className="text-gradient">Pages</span>
        </span>
      </div>

      {/* Right side — auth-aware */}
      <div className="flex items-center gap-5">
        {loading ? (
          // While checking cached session, show nothing (avoids flicker)
          <div className="w-24" />
        ) : user ? (
          // LOGGED IN: show avatar, name, saved books, sign out
          <>
            <button className="text-sm text-muted hover:text-text transition-colors">
              My Saved Books
            </button>
            <div className="flex items-center gap-3">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-8 h-8 rounded-full border border-primary/30"
                />
              )}
              <span className="text-sm text-text hidden sm:inline">
                {user.displayName?.split(" ")[0]}
              </span>
              <button
                onClick={signOut}
                className="px-4 py-1.5 rounded-[100px] text-sm text-muted hover:text-text
                  border border-black/[0.08] hover:border-black/[0.15] transition-all duration-200"
              >
                Sign out
              </button>
            </div>
          </>
        ) : (
          // LOGGED OUT: show sign in button
          <>
            <button className="text-sm text-muted hover:text-text transition-colors">
              My Saved Books
            </button>
            <button
              onClick={signIn}
              className="px-5 py-2 rounded-[100px] gradient-brand text-white text-sm font-display
                font-semibold uppercase tracking-wider shadow-neon-pink hover:shadow-neon-pink-hover
                hover:scale-[1.03] transition-all duration-200"
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </header>
  );
}
