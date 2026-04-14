"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";

/** Detects if the page is loaded inside an in-app browser (WhatsApp, Instagram, Facebook, etc.) */
function isInAppBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  // Common in-app browser markers
  return /FBAN|FBAV|Instagram|Twitter|Line|WhatsApp|LinkedInApp|Snapchat|TikTok|Pinterest|MicroMessenger|wv\)/i.test(ua);
}

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [inApp, setInApp] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setInApp(isInAppBrowser());
  }, []);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-8">
      <div className="text-center max-w-md animate-fade-up">
        <img
          src="/logo.png"
          alt="BetweenPages"
          className="w-20 h-20 object-contain rounded-full mx-auto mb-8"
        />
        <h1 className="font-display text-3xl sm:text-4xl font-medium text-on-surface tracking-[-0.02em] leading-[1.15]">
          Your personal book
          <br />
          sanctuary awaits.
        </h1>
        <p className="text-muted mt-4 text-base sm:text-lg leading-relaxed">
          Discover books through curated charts, book clubs, and an AI reading
          companion.
        </p>

        {inApp ? (
          <div className="mt-8 rounded-2xl p-5 bg-surface-container-low text-left">
            <p className="text-sm text-on-surface font-medium">
              🔓 Open in your browser to continue
            </p>
            <p className="text-xs text-muted mt-2 leading-relaxed">
              Google sign-in doesn&apos;t work inside in-app browsers. Tap the menu
              (⋯) at the top and choose <strong>&ldquo;Open in Safari&rdquo;</strong> or{" "}
              <strong>&ldquo;Open in Chrome&rdquo;</strong>.
            </p>
            <button
              onClick={copyUrl}
              className="mt-4 w-full py-2.5 rounded-full text-sm bg-surface-container text-on-surface
                hover:bg-surface-container-high active:scale-[0.98] transition-all duration-200"
            >
              {copied ? "✓ Link copied!" : "Copy link instead"}
            </button>
          </div>
        ) : (
          <button
            onClick={signIn}
            className="mt-8 px-8 py-3.5 rounded-full gradient-brand text-on-primary text-sm font-medium
              shadow-ambient hover:shadow-ambient-hover hover:scale-[1.02]
              active:scale-[0.98] transition-all duration-200"
          >
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  );
}
