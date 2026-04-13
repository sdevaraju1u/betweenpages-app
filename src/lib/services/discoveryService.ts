// Discovery service — fetches charts, book clubs, and books from Firestore.
// All reads validated through Zod schemas.
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  documentId,
} from "firebase/firestore";
import { db } from "../firebase/config";
import {
  bookSchema,
  chartSchema,
  bookClubSchema,
  type Book,
  type Chart,
  type BookClub,
} from "../schemas/firestore";

/** Fetch a chart by ID */
export async function getChart(chartId: string): Promise<Chart | null> {
  const snap = await getDoc(doc(db, "charts", chartId));
  if (!snap.exists()) return null;
  return chartSchema.parse(snap.data());
}

/** Fetch a book club by ID */
export async function getBookClub(clubId: string): Promise<BookClub | null> {
  const snap = await getDoc(doc(db, "bookclubs", clubId));
  if (!snap.exists()) return null;
  return bookClubSchema.parse(snap.data());
}

/** Fetch charts by country codes */
export async function getChartsByCountries(countryCodes: string[]): Promise<Chart[]> {
  if (countryCodes.length === 0) return [];
  const q = query(collection(db, "charts"), where("country", "in", countryCodes));
  const snap = await getDocs(q);
  return snap.docs.map((d) => chartSchema.parse(d.data()));
}

/** Batch fetch books by IDs (Firestore max 30 per `in` query) */
export async function getBooksByIds(bookIds: string[]): Promise<Book[]> {
  if (bookIds.length === 0) return [];
  const chunks: string[][] = [];
  for (let i = 0; i < bookIds.length; i += 30) {
    chunks.push(bookIds.slice(i, i + 30));
  }
  const allBooks: Book[] = [];
  for (const chunk of chunks) {
    const q = query(collection(db, "books"), where(documentId(), "in", chunk));
    const snap = await getDocs(q);
    snap.docs.forEach((d) => {
      try {
        allBooks.push(bookSchema.parse(d.data()));
      } catch {
        // Skip malformed docs
      }
    });
  }
  const bookMap = new Map(allBooks.map((b) => [b.id, b]));
  return bookIds.map((id) => bookMap.get(id)).filter((b): b is Book => !!b);
}

/** Fetch books by genre (for "Because you love X" sections) */
export async function getBooksByGenre(genre: string, limit = 20): Promise<Book[]> {
  const q = query(collection(db, "books"), where("categories", "array-contains", genre));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => {
      try { return bookSchema.parse(d.data()); } catch { return null; }
    })
    .filter((b): b is Book => !!b)
    .slice(0, limit);
}

/** Fetch all book clubs */
export async function getAllBookClubs(): Promise<BookClub[]> {
  const snap = await getDocs(collection(db, "bookclubs"));
  return snap.docs.map((d) => bookClubSchema.parse(d.data()));
}
