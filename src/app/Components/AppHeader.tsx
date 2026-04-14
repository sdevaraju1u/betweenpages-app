"use client";

// AppHeader — fully responsive. Mobile: icon-only nav + search. Desktop: full nav + labels.

import { useState } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import ProfileDropdown from "./ProfileDropdown";
import SearchModal from "./SearchModal";

type AppHeaderProps = {
  onEditPreferences?: () => void;
};

export default function AppHeader({ onEditPreferences }: AppHeaderProps) {
  const { user, loading } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}

      <header className="glass-strong flex items-center justify-between h-16 px-4 sm:px-8 shrink-0 z-10">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <img
            src="/logo.png"
            alt="BetweenPages"
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-full"
          />
          <span className="font-display text-lg sm:text-xl font-medium tracking-[-0.02em]">
            Between<span className="text-gradient">Pages</span>
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {loading ? (
            <div className="w-24" />
          ) : user ? (
            <>
              {/* Search button — always visible */}
              <button
                onClick={() => setSearchOpen(true)}
                className="w-9 h-9 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-all duration-200 active:scale-95"
                aria-label="Search"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>

              {/* Desktop nav — hidden on mobile */}
              <nav className="hidden md:flex items-center gap-6 mr-2">
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

              {/* Mobile — icon-only My Books link */}
              <a
                href="/saved"
                className="md:hidden w-9 h-9 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-all duration-200 active:scale-95"
                aria-label="My Books"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                </svg>
              </a>

              <ProfileDropdown onEditPreferences={onEditPreferences || (() => {})} />
            </>
          ) : null}
        </div>
      </header>
    </>
  );
}
