"use client";

// SavedBooksContent — refactored with React Query.
// useSavedBooks: query for fetching saved books
// useUnsaveBook: mutation with cache invalidation

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useSavedBooks } from "@/lib/hooks/useSavedBooks";
import { useUnsaveBook } from "@/lib/hooks/useSaveBook";
import Snackbar from "./Snackbar";
import type { SavedBook } from "@/lib/schemas/firestore";

const fallbackColors = ["#4E604F", "#9F402D", "#7A542E", "#677967", "#966C44"];

export default function SavedBooksContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: books = [], isLoading } = useSavedBooks(user?.uid);
  const unsaveBookMutation = useUnsaveBook();
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  async function handleRemove(book: SavedBook) {
    if (!user) return;
    try {
      await unsaveBookMutation.mutateAsync({ uid: user.uid, bookId: book.bookId });
      setSnackbar({ message: `Removed "${book.title}" from your library`, type: "success" });
    } catch {
      setSnackbar({ message: "Failed to remove. Try again.", type: "error" });
    }
  }

  if (isLoading) {
    return (
      <div className="px-8 py-10">
        <div className="h-8 w-48 bg-surface-container rounded-full animate-pulse mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[2/3] bg-surface-container rounded-2xl animate-pulse" />
              <div className="h-4 w-24 bg-surface-container rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-10">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-medium text-on-surface tracking-[-0.02em]">My Books</h1>
        <p className="text-muted mt-1">
          {books.length === 0 ? "Your library is empty." : `${books.length} book${books.length !== 1 ? "s" : ""} saved`}
        </p>
      </div>

      {books.length === 0 && (
        <div className="text-center py-20 animate-fade-up">
          <p className="text-5xl mb-6">📚</p>
          <h2 className="font-display text-xl font-medium text-on-surface">Your library is empty</h2>
          <p className="text-muted mt-2 max-w-sm mx-auto">
            Browse the Sanctuary to find your next read. Save books and they&apos;ll appear here.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-6 py-2.5 rounded-full gradient-brand text-on-primary text-sm font-medium shadow-ambient hover:shadow-ambient-hover active:scale-[0.98] transition-all duration-200"
          >
            Explore Books
          </button>
        </div>
      )}

      {books.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {books.map((book, i) => (
            <div
              key={book.bookId}
              className="group relative"
              style={{ animation: `fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s both` }}
            >
              <button onClick={() => router.push(`/book/${book.bookId}`)} className="w-full text-left focus:outline-none">
                <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-ambient group-hover:shadow-ambient-hover group-hover:-translate-y-1 transition-all duration-300">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-end justify-center p-4" style={{ backgroundColor: fallbackColors[book.title.length % fallbackColors.length] }}>
                      <p className="font-display text-sm font-medium text-white/90 text-center leading-tight">{book.title}</p>
                    </div>
                  )}
                </div>
                <div className="mt-2.5 px-0.5">
                  <p className="text-sm font-medium text-on-surface truncate">{book.title}</p>
                  <p className="text-xs text-muted mt-0.5 truncate">{book.author}</p>
                </div>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleRemove(book); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-center text-muted hover:text-secondary opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95"
                title="Remove from library"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {snackbar && <Snackbar message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar(null)} />}
    </div>
  );
}
