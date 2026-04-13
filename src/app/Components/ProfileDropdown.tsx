"use client";

// ProfileDropdown — refactored with shared useUserPreferences hook (React Query).
// No more independent fetch — reads from the same cache as MainShell.

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useUserPreferences } from "@/lib/hooks/useUserPreferences";

type ProfileDropdownProps = {
  onEditPreferences: () => void;
};

export default function ProfileDropdown({ onEditPreferences }: ProfileDropdownProps) {
  const { user, signOut } = useAuth();
  const { data: prefs } = useUserPreferences(user?.uid);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 hover:bg-surface-container-low transition-colors duration-200"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || "User"} className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold">
            {user.displayName?.[0] || "U"}
          </div>
        )}
        <span className="text-sm text-on-surface hidden sm:inline">{user.displayName?.split(" ")[0]}</span>
        <svg className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest rounded-2xl shadow-[0_12px_48px_rgba(15,31,18,0.12)] overflow-hidden animate-scale-in z-50">
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold">{user.displayName?.[0] || "U"}</div>
              )}
              <div className="min-w-0">
                <p className="font-medium text-on-surface truncate">{user.displayName}</p>
                <p className="text-xs text-muted truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {prefs && (
            <div className="px-5 pb-4 space-y-3">
              {prefs.favoriteGenres.length > 0 && (
                <div>
                  <p className="text-xs text-muted mb-1.5">Genres</p>
                  <div className="flex flex-wrap gap-1.5">
                    {prefs.favoriteGenres.map((g) => (
                      <span key={g} className="px-2.5 py-1 rounded-full text-xs bg-surface-container text-on-surface-variant">{g}</span>
                    ))}
                  </div>
                </div>
              )}
              {prefs.preferredLanguages.length > 0 && (
                <div>
                  <p className="text-xs text-muted mb-1.5">Languages</p>
                  <div className="flex flex-wrap gap-1.5">
                    {prefs.preferredLanguages.map((l) => (
                      <span key={l} className="px-2.5 py-1 rounded-full text-xs bg-surface-container text-on-surface-variant">{l}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="px-3 pb-3 space-y-1">
            <button onClick={() => { setOpen(false); onEditPreferences(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-on-surface hover:bg-surface-container-low transition-colors duration-150 text-left">
              <svg className="w-4 h-4 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
              Edit Preferences
            </button>
            <button onClick={() => { setOpen(false); signOut(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-secondary hover:bg-secondary/5 transition-colors duration-150 text-left">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
