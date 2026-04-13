"use client";

// OnboardingModal — refactored with useSavePreferences mutation (React Query).

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useSavePreferences } from "@/lib/hooks/useUserPreferences";
import { GENRES, LANGUAGES, COUNTRIES, BOOK_CLUBS } from "@/lib/constants/onboarding";
import type { UserPreferences } from "@/lib/schemas/firestore";

type OnboardingModalProps = {
  onComplete: () => void;
  initialPreferences?: UserPreferences;
  editMode?: boolean;
};

const TOTAL_STEPS = 4;

export default function OnboardingModal({ onComplete, initialPreferences, editMode = false }: OnboardingModalProps) {
  const { user } = useAuth();
  const savePrefs = useSavePreferences();
  const [step, setStep] = useState(1);
  const [slideDir, setSlideDir] = useState<"left" | "right">("left");

  const [genres, setGenres] = useState<string[]>(initialPreferences?.favoriteGenres || []);
  const [languages, setLanguages] = useState<string[]>(initialPreferences?.preferredLanguages || []);
  const [countries, setCountries] = useState<string[]>(initialPreferences?.followedCountries || []);
  const [bookClubs, setBookClubs] = useState<string[]>(initialPreferences?.followedBookClubs || []);

  const toggle = useCallback(
    (arr: string[], setArr: (v: string[]) => void, val: string) => {
      setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
    },
    []
  );

  function next() { setSlideDir("left"); setStep((s) => Math.min(s + 1, TOTAL_STEPS + 1)); }
  function back() { setSlideDir("right"); setStep((s) => Math.max(s - 1, 1)); }

  const canProceed =
    (step === 1 && genres.length >= 3) ||
    (step === 2 && languages.length >= 1) ||
    (step === 3 && countries.length >= 1) ||
    step === 4;

  async function handleFinish() {
    if (!user) return;
    const prefs: UserPreferences = {
      favoriteGenres: genres,
      preferredLanguages: languages,
      followedCountries: countries,
      followedBookClubs: bookClubs,
      onboardingComplete: true,
    };
    await savePrefs.mutateAsync({ uid: user.uid, preferences: prefs });
    onComplete();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in" />
      <div className="relative w-full max-w-2xl mx-4 bg-surface-container-lowest rounded-3xl shadow-[0_24px_80px_rgba(15,31,18,0.12)] overflow-hidden animate-scale-in">
        <div className="h-1 bg-surface-container">
          <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
        </div>
        <div className="px-8 py-10 min-h-[480px] flex flex-col">
          <div key={step} className={`flex-1 ${slideDir === "left" ? "animate-slide-left" : "animate-slide-right"}`}>
            {step === 1 && <StepGenres selected={genres} onToggle={(g) => toggle(genres, setGenres, g)} />}
            {step === 2 && <StepLanguages selected={languages} onToggle={(l) => toggle(languages, setLanguages, l)} />}
            {step === 3 && <StepCountries selected={countries} onToggle={(c) => toggle(countries, setCountries, c)} />}
            {step === 4 && <StepBookClubs selected={bookClubs} onToggle={(b) => toggle(bookClubs, setBookClubs, b)} />}
          </div>
          <div className="flex items-center justify-between mt-8 pt-6">
            {step > 1 ? (
              <button onClick={back} className="px-5 py-2.5 rounded-full text-sm text-muted hover:text-on-surface bg-surface-container-low hover:bg-surface-container active:scale-[0.98] transition-all duration-200">Back</button>
            ) : <div />}
            {step < TOTAL_STEPS ? (
              <button onClick={next} disabled={!canProceed} className="px-8 py-3 rounded-full text-sm font-medium gradient-brand text-on-primary shadow-ambient hover:shadow-ambient-hover hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 transition-all duration-200">Continue</button>
            ) : (
              <button onClick={handleFinish} disabled={savePrefs.isPending} className="px-8 py-3 rounded-full text-sm font-medium gradient-brand text-on-primary shadow-ambient hover:shadow-ambient-hover hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 transition-all duration-200">
                {savePrefs.isPending ? "Saving..." : editMode ? "Update Preferences" : "Enter the Sanctuary \u2192"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepGenres({ selected, onToggle }: { selected: string[]; onToggle: (g: string) => void }) {
  return (
    <>
      <h2 className="font-display text-3xl font-medium text-on-surface tracking-[-0.02em]">What genres do you love?</h2>
      <p className="text-muted mt-2 mb-8">Pick at least 3 — we&apos;ll curate your feed around these.</p>
      <div className="flex flex-wrap gap-3">
        {GENRES.map((genre) => (
          <button key={genre} onClick={() => onToggle(genre)} className={`px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 active:scale-[0.96] ${selected.includes(genre) ? "bg-primary text-on-primary shadow-ambient" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}>{genre}</button>
        ))}
      </div>
      <p className="text-xs text-muted mt-4">{selected.length}/3 minimum selected</p>
    </>
  );
}

function StepLanguages({ selected, onToggle }: { selected: string[]; onToggle: (l: string) => void }) {
  return (
    <>
      <h2 className="font-display text-3xl font-medium text-on-surface tracking-[-0.02em]">What languages do you read in?</h2>
      <p className="text-muted mt-2 mb-8">Pick at least 1.</p>
      <div className="flex flex-wrap gap-3">
        {LANGUAGES.map(({ code, label }) => (
          <button key={code} onClick={() => onToggle(code)} className={`px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 active:scale-[0.96] ${selected.includes(code) ? "bg-primary text-on-primary shadow-ambient" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}>{label}</button>
        ))}
      </div>
    </>
  );
}

function StepCountries({ selected, onToggle }: { selected: string[]; onToggle: (c: string) => void }) {
  return (
    <>
      <h2 className="font-display text-3xl font-medium text-on-surface tracking-[-0.02em]">Which country charts to follow?</h2>
      <p className="text-muted mt-2 mb-8">See what&apos;s trending around the world.</p>
      <div className="flex flex-wrap gap-3">
        {COUNTRIES.map(({ code, label, flag }) => (
          <button key={code} onClick={() => onToggle(code)} className={`px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 active:scale-[0.96] ${selected.includes(code) ? "bg-primary text-on-primary shadow-ambient" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}>{flag} {label}</button>
        ))}
      </div>
    </>
  );
}

function StepBookClubs({ selected, onToggle }: { selected: string[]; onToggle: (b: string) => void }) {
  return (
    <>
      <h2 className="font-display text-3xl font-medium text-on-surface tracking-[-0.02em]">Follow your favorite book clubs</h2>
      <p className="text-muted mt-2 mb-8">Get recommendations from curators you trust.</p>
      <div className="grid grid-cols-2 gap-4">
        {BOOK_CLUBS.map(({ id, name, curator, emoji, count }) => (
          <button key={id} onClick={() => onToggle(id)} className={`flex items-start gap-4 p-5 rounded-2xl text-left transition-all duration-200 active:scale-[0.98] ${selected.includes(id) ? "bg-primary/10 ring-2 ring-primary" : "bg-surface-container-low hover:bg-surface-container"}`}>
            <span className="text-3xl">{emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-on-surface truncate">{name}</p>
              <p className="text-xs text-muted mt-0.5">{curator}</p>
              <p className="text-xs text-muted mt-1">{count} books</p>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
