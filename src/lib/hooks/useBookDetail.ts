import { useQuery } from "@tanstack/react-query";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { bookSchema, type Book } from "../schemas/firestore";
import { searchOpenLibrary, getBookDetails } from "../services/openLibrary";
import { isBookSaved } from "../services/savedBooks";

type BookDetailResult = {
  book: Book;
  description: string;
  isSaved: boolean;
};

async function fetchBookDetail(bookId: string, uid: string | undefined): Promise<BookDetailResult> {
  // 1. Try Firestore cache
  const bookSnap = await getDoc(doc(db, "books", bookId));
  let bookData: Book;

  if (bookSnap.exists()) {
    bookData = bookSchema.parse(bookSnap.data());
  } else {
    // Not in Firestore — search Open Library
    const titleGuess = bookId.replace(/-/g, " ");
    const olResult = await searchOpenLibrary(titleGuess, "");
    if (!olResult) throw new Error("Book not found");

    bookData = bookSchema.parse({
      id: bookId,
      title: olResult.title,
      author: olResult.author,
      coverUrl: olResult.coverUrl,
      description: "",
      categories: olResult.subjects,
      language: olResult.language?.[0] || "en",
      pageCount: olResult.pageCount,
      publishedDate: olResult.publishedDate,
      isbn: olResult.isbn,
      openLibraryKey: olResult.openLibraryKey,
      cachedAt: Date.now(),
    });

    // Cache for next time
    try { await setDoc(doc(db, "books", bookId), bookData); } catch {}
  }

  // 2. Check saved status
  const isSaved = uid ? await isBookSaved(uid, bookId) : false;

  // 3. Fetch description from Open Library
  let description = "";
  if (bookData.openLibraryKey) {
    const details = await getBookDetails(bookData.openLibraryKey);
    if (details?.description) description = details.description;
  }

  return { book: bookData, description, isSaved };
}

/** Fetches book detail (Firestore → Open Library fallback) + saved status + description */
export function useBookDetail(bookId: string, uid: string | undefined) {
  return useQuery({
    queryKey: ["bookDetail", bookId],
    queryFn: () => fetchBookDetail(bookId, uid),
    enabled: !!bookId,
    staleTime: 10 * 60 * 1000, // 10 min
  });
}
