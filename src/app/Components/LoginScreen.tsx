"use client";

import { useAuth } from "@/lib/firebase/AuthContext";

export default function LoginScreen() {
  const { signIn } = useAuth();

  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div
        className="text-center max-w-md animate-fade-up"
      >
        <img
          src="/logo.png"
          alt="BetweenPages"
          className="w-20 h-20 object-contain rounded-full mx-auto mb-8"
        />
        <h1 className="font-display text-4xl font-medium text-on-surface tracking-[-0.02em] leading-[1.15]">
          Your personal book
          <br />
          sanctuary awaits.
        </h1>
        <p className="text-muted mt-4 text-lg leading-relaxed">
          Discover books through curated charts, book clubs, and an AI reading
          companion.
        </p>
        <button
          onClick={signIn}
          className="mt-8 px-8 py-3.5 rounded-full gradient-brand text-on-primary text-sm font-medium
            shadow-ambient hover:shadow-ambient-hover hover:scale-[1.02]
            active:scale-[0.98] transition-all duration-200"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
