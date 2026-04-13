import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { bookReviewSchema, type BookReview } from "../schemas/firestore";

async function fetchBookReviews(bookId: string, title: string, author: string): Promise<BookReview[]> {
  // 1. Try Firestore
  const snap = await getDocs(collection(db, "books", bookId, "reviews"));
  if (!snap.empty) {
    return snap.docs
      .map((d) => { try { return bookReviewSchema.parse(d.data()); } catch { return null; } })
      .filter((r): r is BookReview => !!r)
      .sort((a, b) => b.rating - a.rating);
  }

  // 2. Generate on-demand via API
  try {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, title, author }),
    });
    const data = await res.json();
    if (data.reviews?.length > 0) {
      return (data.reviews as BookReview[]).sort((a, b) => b.rating - a.rating);
    }
  } catch {}

  return [];
}

/** Fetches reviews for a book. Falls back to on-demand generation if none exist. */
export function useBookReviews(bookId: string, title: string, author: string) {
  return useQuery({
    queryKey: ["bookReviews", bookId],
    queryFn: () => fetchBookReviews(bookId, title, author),
    enabled: !!bookId && !!title,
    staleTime: 30 * 60 * 1000, // 30 min — reviews don't change often
  });
}
