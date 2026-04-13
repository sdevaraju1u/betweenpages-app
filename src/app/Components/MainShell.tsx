"use client";

// MainShell — the adaptive container.
// Refactored: uses useUserPreferences hook (React Query) instead of manual useState/useEffect.

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useBookContext } from "@/lib/context/BookContext";
import { useUserPreferences } from "@/lib/hooks/useUserPreferences";
import OnboardingModal from "./OnboardingModal";
import LoginScreen from "./LoginScreen";
import DiscoveryFeed from "./DiscoveryFeed";
import ChatPanel from "./ChatPanel";
import AppHeader from "./AppHeader";

const moodChips = [
  "Dark Academia", "Space Opera", "Slow Burn", "Cyberpunk",
  "Cozy Mystery", "Mind-Bending", "Surprise Me",
];

function LoadingDots() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex gap-2">
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-tertiary animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-secondary animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export default function MainShell({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { currentBook } = useBookContext();
  const pathname = usePathname();
  const isBookDetail = pathname.startsWith("/book/");
  const isHome = pathname === "/";

  const { data: preferences, isLoading: prefsLoading } = useUserPreferences(user?.uid);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showEditPreferences, setShowEditPreferences] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);

  // Show onboarding if preferences loaded but not complete
  useEffect(() => {
    if (preferences && !preferences.onboardingComplete) {
      setShowOnboarding(true);
    }
  }, [preferences]);

  useEffect(() => {
    if (!isBookDetail) setChatExpanded(false);
  }, [isBookDetail]);

  if (authLoading) return <LoadingDots />;
  if (!user) return <LoginScreen />;
  if (prefsLoading) return <LoadingDots />;

  function handlePrefsComplete() {
    setShowOnboarding(false);
    setShowEditPreferences(false);
    // React Query auto-invalidates via useSavePreferences hook — no manual refetch needed
  }

  const modals = (
    <>
      {showOnboarding && <OnboardingModal onComplete={handlePrefsComplete} />}
      {showEditPreferences && preferences && (
        <OnboardingModal
          onComplete={handlePrefsComplete}
          initialPreferences={preferences}
          editMode
        />
      )}
    </>
  );

  // ─── Book detail: split layout ───
  if (isBookDetail) {
    return (
      <>
        <AppHeader onEditPreferences={() => setShowEditPreferences(true)} />
        {modals}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <div className="w-[55%] overflow-y-auto animate-slide-from-left border-r border-outline-variant">
            {children}
          </div>
          <div className="w-[45%] min-h-0 flex flex-col">
            <ChatPanel moodChips={moodChips} bookContext={currentBook || undefined} />
          </div>
        </div>
      </>
    );
  }

  // ─── Home: discovery + floating chat ───
  return (
    <>
      <AppHeader onEditPreferences={() => setShowEditPreferences(true)} />
      {modals}
      <div className="flex-1 overflow-y-auto pb-24">
        {isHome && <DiscoveryFeed />}
        {!isHome && children}
      </div>
      <div className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-400 ease-out ${chatExpanded ? "top-16 bg-background" : ""}`}>
        {chatExpanded && (
          <div className="h-full flex flex-col max-w-[800px] mx-auto">
            <div className="flex items-center justify-between px-6 py-3 shrink-0">
              <span className="text-sm text-muted font-display">
                {currentBook ? `Discussing ${currentBook.title}` : "Chat"}
              </span>
              <button
                onClick={() => setChatExpanded(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-muted hover:text-on-surface transition-all duration-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
            <ChatPanel moodChips={moodChips} bookContext={currentBook || undefined} />
          </div>
        )}
        {!chatExpanded && (
          <div className="glass-strong pb-6 pt-3 px-6">
            <div className="max-w-[800px] mx-auto">
              <button
                onClick={() => setChatExpanded(true)}
                className="w-full flex items-center gap-3 glass rounded-full px-5 py-3.5 glow-input hover:shadow-ambient transition-all duration-300 text-left"
              >
                <svg className="w-5 h-5 text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                <span className="text-muted text-[15px]">Ask about a book, a mood, an author…</span>
                <div className="ml-auto w-9 h-9 rounded-full gradient-brand flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-on-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                </div>
              </button>
              <p className="text-xs text-muted/50 text-center mt-2">BetweenPages only discusses books.</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
