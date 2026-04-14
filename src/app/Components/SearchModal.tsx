"use client";

// SearchModal — full-screen search overlay.
// Debounced input, shows results as they're found, navigates to book detail on click.

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type SearchResult = {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  source: "firestore" | "openlibrary";
};

type SearchModalProps = {
  onClose: () => void;
};

export default function SearchModal({ onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ESC to close
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: query }),
          signal: ac.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        // Abort errors are expected
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSelect(result: SearchResult) {
    router.push(`/book/${result.id}`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl mx-0 sm:mx-4 mt-0 sm:mt-20
          bg-surface-container-lowest
          rounded-none sm:rounded-3xl
          shadow-[0_24px_80px_rgba(15,31,18,0.12)]
          overflow-hidden animate-scale-in
          h-screen sm:h-auto sm:max-h-[80vh]
          flex flex-col"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant shrink-0">
          <svg className="w-5 h-5 text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, authors..."
            className="flex-1 bg-transparent text-base text-on-surface placeholder:text-muted focus:outline-none font-display"
          />
          {loading && (
            <div className="flex gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce [animation-delay:300ms]" />
            </div>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-muted hover:text-on-surface transition-colors shrink-0"
            aria-label="Close search"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2">
          {query.trim().length < 2 && (
            <div className="text-center py-16 px-4">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-muted text-sm">
                Search for any book by title or author.
              </p>
            </div>
          )}

          {query.trim().length >= 2 && !loading && results.length === 0 && (
            <div className="text-center py-16 px-4">
              <p className="text-muted">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-muted/60 mt-2">Try a different search term.</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-1">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-surface-container-low transition-colors text-left"
                >
                  {result.coverUrl ? (
                    <img
                      src={result.coverUrl}
                      alt={result.title}
                      className="w-12 h-16 object-cover rounded-md shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-16 rounded-md bg-surface-container shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{result.title}</p>
                    <p className="text-xs text-muted truncate">{result.author}</p>
                  </div>
                  <svg className="w-4 h-4 text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
