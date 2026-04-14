"use client";

// useCountryChart — fetches a single country's chart with progressive SSE streaming.
// Returns { books, status, message } where status is:
//   "cached" | "generating" | "enriching" | "complete" | "error"

import { useEffect, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getChart, getBooksByIds } from "@/lib/services/discoveryService";
import type { Book } from "@/lib/schemas/firestore";

type Status = "idle" | "loading" | "cached" | "generating" | "enriching" | "complete" | "error";

type State = {
  books: Book[];
  status: Status;
  message: string;
  totalExpected: number;
};

export function useCountryChart(countryCode: string | null) {
  const [state, setState] = useState<State>({
    books: [],
    status: "idle",
    message: "",
    totalExpected: 0,
  });
  const abortRef = useRef<AbortController | null>(null);
  const qc = useQueryClient();

  useEffect(() => {
    if (!countryCode) return;

    const ac = new AbortController();
    abortRef.current = ac;

    async function load() {
      setState({ books: [], status: "loading", message: "", totalExpected: 0 });

      // 1. Try Firestore cache first (fast path)
      const chartId = `top-${countryCode!.toLowerCase()}`;
      const cached = await getChart(chartId);
      if (cached && cached.bookIds.length > 0) {
        const books = (await getBooksByIds(cached.bookIds.slice(0, 20))).filter((b) => b.coverUrl);
        if (books.length > 0) {
          setState({ books, status: "cached", message: "", totalExpected: books.length });
          return;
        }
      }

      // 2. Stream from API
      try {
        const res = await fetch("/api/charts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ countryCode }),
          signal: ac.signal,
        });

        // If response is JSON (cache hit from server), handle directly
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await res.json();
          if (data.chart) {
            const books = (await getBooksByIds(data.chart.bookIds.slice(0, 20))).filter((b) => b.coverUrl);
            setState({ books, status: "cached", message: "", totalExpected: books.length });
            qc.invalidateQueries({ queryKey: ["discoverySections"] });
          }
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

          // Split by double-newline (SSE event delimiter)
          const events = buffer.split("\n\n");
          buffer = events.pop() || ""; // keep incomplete event

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
              } else if (eventName === "enriching") {
                setState((s) => ({ ...s, status: "enriching", message: data.message, totalExpected: data.total }));
              } else if (eventName === "book") {
                if (data.coverUrl) {
                  setState((s) => ({ ...s, books: [...s.books, data] }));
                }
              } else if (eventName === "complete") {
                setState((s) => ({ ...s, status: "complete", message: "" }));
                qc.invalidateQueries({ queryKey: ["discoverySections"] });
              } else if (eventName === "error") {
                setState((s) => ({ ...s, status: "error", message: data.message }));
              }
            } catch {}
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setState((s) => ({ ...s, status: "error", message: "Couldn't load this chart" }));
        }
      }
    }

    load();

    return () => {
      ac.abort();
    };
  }, [countryCode, qc]);

  return state;
}
