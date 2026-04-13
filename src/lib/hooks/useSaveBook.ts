import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveBook, unsaveBook } from "../services/savedBooks";
import type { Book } from "../schemas/firestore";

/** Mutation to save a book. Invalidates bookDetail and savedBooks queries. */
export function useSaveBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, book }: { uid: string; book: Book }) => saveBook(uid, book),
    onSuccess: (_data, { book }) => {
      qc.invalidateQueries({ queryKey: ["bookDetail", book.id] });
      qc.invalidateQueries({ queryKey: ["savedBooks"] });
    },
  });
}

/** Mutation to unsave a book. Invalidates bookDetail and savedBooks queries. */
export function useUnsaveBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, bookId }: { uid: string; bookId: string }) => unsaveBook(uid, bookId),
    onSuccess: (_data, { bookId }) => {
      qc.invalidateQueries({ queryKey: ["bookDetail", bookId] });
      qc.invalidateQueries({ queryKey: ["savedBooks"] });
    },
  });
}
