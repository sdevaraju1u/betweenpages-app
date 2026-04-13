"use client";

// AppHeader — auth-aware, with navigation and profile dropdown.

import { useAuth } from "@/lib/firebase/AuthContext";
import ProfileDropdown from "./ProfileDropdown";

type AppHeaderProps = {
  onEditPreferences?: () => void;
};

export default function AppHeader({ onEditPreferences }: AppHeaderProps) {
  const { user, loading } = useAuth();

  return (
    <header className="glass-strong flex items-center justify-between h-16 px-8 shrink-0 z-10">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <img
          src="/logo.png"
          alt="BetweenPages"
          className="w-10 h-10 object-contain rounded-full"
        />
        <span className="font-display text-xl font-medium tracking-[-0.02em]">
          Between<span className="text-gradient">Pages</span>
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5">
        {loading ? (
          <div className="w-24" />
        ) : user ? (
          <>
            <nav className="flex items-center gap-6 mr-2">
              <a
                href="/"
                className="text-sm text-muted hover:text-on-surface transition-colors duration-200"
              >
                Discovery
              </a>
              <a
                href="/saved"
                className="text-sm text-muted hover:text-on-surface transition-colors duration-200"
              >
                My Books
              </a>
            </nav>
            <ProfileDropdown onEditPreferences={onEditPreferences || (() => {})} />
          </>
        ) : null}
      </div>
    </header>
  );
}
