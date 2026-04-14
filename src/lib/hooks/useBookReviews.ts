"use client";

// useBookReviews — streams reviews via SSE when Firestore has none.
// Returns { reviews, status, message } — same pattern as useCountryChart.

import { useEffect, useState, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import type { BookReview } from "../schemas/firestore";

type Status = "idle" | "loading" | "cached" | "generating" | "streaming" | "complete" | "error";

type State = {
  reviews: BookReview[];
  status: Status;
  message: string;
};

/** Lenient review parser — fills in missing fields with defaults. */
function parseReview(raw: unknown, fallbackId: string): BookReview | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const rating = Number(r.rating);
  const body = typeof r.body === "string" ? r.body : "";
  if (!rating || rating < 1 || rating > 5 || !body) return null;
  return {
    id: typeof r.id === "string" ? r.id : fallbackId,
    rating: Math.round(rating),
    headline: typeof r.headline === "string" ? r.headline : "",
    body,
    reviewerName: typeof r.reviewerName === "string" ? r.reviewerName : "Anonymous Reader",
    reviewerPreference:
      typeof r.reviewerPreference === "string" ? r.reviewerPreference : "Reader",
    source:
      r.source === "seeded" || r.source === "openlibrary" || r.source === "user"
        ? r.source
        : "seeded",
    createdAt: typeof r.createdAt === "number" ? r.createdAt : 0,
  };
}

export function useBookReviews(bookId: string, title: string, author: string) {
  const [state, setState] = useState<State>({
    reviews: [],
    status: "idle",
    message: "",
  });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!bookId || !title) return;

    const ac = new AbortController();
    abortRef.current = ac;

    async function load() {
      setState({ reviews: [], status: "loading", message: "" });

      // 1. Try Firestore directly
      try {
        const snap = await getDocs(collection(db, "books", bookId, "reviews"));
        const firestoreReviews = snap.docs
          .map((d) => parseReview(d.data(), d.id))
          .filter((r): r is BookReview => !!r)
          .sort((a, b) => b.rating - a.rating);
        if (firestoreReviews.length > 0) {
          setState({ reviews: firestoreReviews, status: "cached", message: "" });
          return;
        }
      } catch {}

      // 2. Stream from API
      try {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId, title, author }),
          signal: ac.signal,
        });

        if (!res.ok) {
          setState({ reviews: [], status: "error", message: "Failed to load reviews" });
          return;
        }

        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          // Server returned cached JSON (reviews already existed)
          const data = await res.json();
          const reviews = (Array.isArray(data.reviews) ? data.reviews : [])
            .map((r: unknown, i: number) => parseReview(r, `seeded-${i}`))
            .filter((r: BookReview | null): r is BookReview => !!r)
            .sort((a: BookReview, b: BookReview) => b.rating - a.rating);
          setState({ reviews, status: "cached", message: "" });
          return;
        }

        // Parse SSE stream
        const reader = res.body?.getReader();
        if (!reader) return;
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() || "";

          for (const evt of events) {
            if (!evt.trim()) continue;
            const lines = evt.split("\n");
            let eventName = "";
            let dataStr = "";
            for (const line of lines) {
              if (line.startsWith("event:")) eventName = line.slice(6).trim();
              else if (line.startsWith("data:")) dataStr += line.slice(5).trim();
            }
            if (!eventName || !dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (eventName === "generating") {
                setState((s) => ({ ...s, status: "generating", message: data.message }));
              } else if (eventName === "review") {
                const parsed = parseReview(data, `review-${Date.now()}`);
                if (parsed) {
                  setState((s) => ({
                    ...s,
                    status: "streaming",
                    reviews: [...s.reviews, parsed].sort((a, b) => b.rating - a.rating),
                  }));
                }
              } else if (eventName === "complete") {
                setState((s) => ({ ...s, status: "complete", message: "" }));
              } else if (eventName === "error") {
                setState((s) => ({ ...s, status: "error", message: data.message }));
              }
            } catch {}
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setState({ reviews: [], status: "error", message: "Couldn't load reviews" });
        }
      }
    }

    load();
    return () => ac.abort();
  }, [bookId, title, author]);

  return state;
}
