// Saved books service — reads/writes to /users/{uid}/savedBooks/{bookId}
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { savedBookSchema, type Book, type SavedBook } from "../schemas/firestore";

/** Save a book to the user's library */
export async function saveBook(uid: string, book: Book): Promise<void> {
  const ref = doc(db, "users", uid, "savedBooks", book.id);
  await setDoc(ref, {
    bookId: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.coverUrl || null,
    savedAt: Date.now(),
  });
}

/** Remove a book from the user's library */
export async function unsaveBook(uid: string, bookId: string): Promise<void> {
  const ref = doc(db, "users", uid, "savedBooks", bookId);
  await deleteDoc(ref);
}

/** Check if a book is saved */
export async function isBookSaved(uid: string, bookId: string): Promise<boolean> {
  const ref = doc(db, "users", uid, "savedBooks", bookId);
  const snap = await getDoc(ref);
  return snap.exists();
}

/** Get all saved books for a user, ordered by most recent */
export async function getSavedBooks(uid: string): Promise<SavedBook[]> {
  const q = query(collection(db, "users", uid, "savedBooks"), orderBy("savedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => savedBookSchema.parse(d.data()));
}
