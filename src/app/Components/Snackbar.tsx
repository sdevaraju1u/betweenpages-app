"use client";

// Snackbar — a toast notification that slides up from the bottom.
// Auto-dismisses after 3 seconds. Supports success and error variants.

import { useEffect, useState } from "react";

type SnackbarProps = {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
  duration?: number;
};

export default function Snackbar({
  message,
  type = "success",
  onClose,
  duration = 3000,
}: SnackbarProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 300); // wait for exit animation
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-[0_8px_32px_rgba(15,31,18,0.15)]
          text-sm font-medium transition-all duration-300
          ${exiting ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}
          ${type === "success"
            ? "bg-primary text-on-primary"
            : "bg-secondary text-white"
          }`}
        style={{
          animation: exiting ? undefined : "snackbarIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <span>
          {type === "success" ? "✓" : "✗"}
        </span>
        <span>{message}</span>
        <button
          onClick={() => {
            setExiting(true);
            setTimeout(onClose, 300);
          }}
          className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
