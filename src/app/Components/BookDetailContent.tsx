"use client";

// BookDetailContent — refactored with React Query hooks.
// useBookDetail: fetches book + description + saved status
// useBookReviews: fetches reviews (on-demand generation if missing)
// useSaveBook/useUnsaveBook: mutations with cache invalidation

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useBookContext } from "@/lib/context/BookContext";
import { useBookDetail } from "@/lib/hooks/useBookDetail";
import { useBookReviews } from "@/lib/hooks/useBookReviews";
import { useSaveBook, useUnsaveBook } from "@/lib/hooks/useSaveBook";
import Snackbar from "./Snackbar";
import PurchaseSheet from "./PurchaseSheet";

type BookDetailContentProps = {
  bookId: string;
};

export default function BookDetailContent({ bookId }: BookDetailContentProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { setCurrentBook } = useBookContext();
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Queries
  const { data: detail, isLoading, error } = useBookDetail(bookId, user?.uid);
  const book = detail?.book;
  const description = detail?.description || "";
  const isSaved = detail?.isSaved || false;

  const { data: reviews = [] } = useBookReviews(
    bookId,
    book?.title || "",
    book?.author || ""
  );

  // Mutations
  const saveBookMutation = useSaveBook();
  const unsaveBookMutation = useUnsaveBook();

  // Set book context for chat
  useEffect(() => {
    if (book) setCurrentBook({ title: book.title, author: book.author });
    return () => setCurrentBook(null);
  }, [book, setCurrentBook]);

  async function handleToggleSave() {
    if (!user || !book) return;
    try {
      if (isSaved) {
        await unsaveBookMutation.mutateAsync({ uid: user.uid, bookId: book.id });
        setSnackbar({ message: `Removed "${book.title}" from your library`, type: "success" });
      } else {
        await saveBookMutation.mutateAsync({ uid: user.uid, book });
        setSnackbar({ message: `Added "${book.title}" to your library`, type: "success" });
      }
    } catch {
      setSnackbar({ message: "Something went wrong. Try again.", type: "error" });
    }
  }

  const saving = saveBookMutation.isPending || unsaveBookMutation.isPending;

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-5 w-32 bg-surface-container rounded-full" />
        <div className="w-48 aspect-[2/3] bg-surface-container rounded-2xl mx-auto" />
        <div className="h-8 w-64 bg-surface-container rounded-full" />
        <div className="h-4 w-48 bg-surface-container rounded-full" />
        <div className="space-y-2 mt-8">
          <div className="h-3 w-full bg-surface-container rounded-full" />
          <div className="h-3 w-full bg-surface-container rounded-full" />
          <div className="h-3 w-3/4 bg-surface-container rounded-full" />
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted text-lg">Book not found.</p>
        <button onClick={() => router.push("/")} className="mt-4 text-primary hover:underline text-sm">
          ← Back to Discovery
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        className="text-sm text-muted hover:text-on-surface transition-colors flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Discovery
      </button>

      {/* Cover */}
      <div className="flex justify-center">
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} className="w-56 rounded-2xl shadow-ambient" />
        ) : (
          <div className="w-56 aspect-[2/3] rounded-2xl flex items-end justify-center p-6" style={{ backgroundColor: "#4E604F" }}>
            <p className="font-display text-lg font-medium text-white/90 text-center">{book.title}</p>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="text-center">
        <h1 className="font-display text-2xl font-medium text-on-surface tracking-[-0.01em]">{book.title}</h1>
        <p className="text-muted mt-1">{book.author}</p>
        <div className="flex items-center justify-center gap-3 mt-3 text-sm text-muted">
          {book.pageCount && <span>{book.pageCount} pages</span>}
          {book.pageCount && book.publishedDate && <span>·</span>}
          {book.publishedDate && <span>{book.publishedDate}</span>}
          {book.language && <span>· {book.language}</span>}
        </div>
        {book.categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {book.categories.slice(0, 5).map((cat) => (
              <span key={cat} className="px-3 py-1 rounded-full text-xs bg-surface-container text-on-surface-variant">{cat}</span>
            ))}
          </div>
        )}
      </div>

      {/* Synopsis */}
      {description && (
        <div>
          <h2 className="font-display text-lg font-medium text-on-surface mb-3">Synopsis</h2>
          <div className="relative">
            <p className={`text-sm text-on-surface-variant leading-relaxed ${!synopsisExpanded ? "line-clamp-4" : ""}`}>
              {description}
            </p>
            {description.length > 300 && (
              <button onClick={() => setSynopsisExpanded(!synopsisExpanded)} className="text-primary text-sm mt-2 hover:underline">
                {synopsisExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-medium text-on-surface mb-4">💬 What readers say</h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl p-5 bg-surface-container-low"
                style={{
                  borderLeft: `3px solid ${
                    review.rating >= 4 ? "var(--color-primary)"
                    : review.rating <= 2 ? "var(--color-secondary)"
                    : "var(--color-tertiary)"
                  }`,
                }}
              >
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`text-sm ${i < review.rating ? "text-secondary" : "text-surface-container-highest"}`}>★</span>
                  ))}
                </div>
                <p className="font-medium text-sm text-on-surface">&ldquo;{review.headline}&rdquo;</p>
                <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">{review.body}</p>
                <p className="text-xs text-muted mt-3">👤 {review.reviewerName} · {review.reviewerPreference}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pb-8">
        <button
          disabled={saving}
          onClick={handleToggleSave}
          className={`flex-1 py-3 rounded-full text-sm font-medium active:scale-[0.98] transition-all duration-200 disabled:opacity-50
            ${isSaved
              ? "bg-surface-container-low text-on-surface hover:bg-surface-container"
              : "gradient-brand text-on-primary shadow-ambient hover:shadow-ambient-hover"
            }`}
        >
          {saving ? "…" : isSaved ? "✓ Saved" : "💾 Save to Library"}
        </button>
        <button
          onClick={() => setShowPurchase(true)}
          className="flex-1 py-3 rounded-full bg-surface-container-low text-on-surface text-sm font-medium hover:bg-surface-container active:scale-[0.98] transition-all duration-200"
        >
          🛒 Purchase
        </button>
      </div>

      {showPurchase && book && (
        <PurchaseSheet title={book.title} author={book.author} isbn={book.isbn} onClose={() => setShowPurchase(false)} />
      )}
      {snackbar && <Snackbar message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar(null)} />}
    </div>
  );
}
