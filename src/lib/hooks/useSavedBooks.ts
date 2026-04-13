import { useQuery } from "@tanstack/react-query";
import { getSavedBooks } from "../services/savedBooks";
import type { SavedBook } from "../schemas/firestore";

/** Fetches all saved books for a user, ordered by most recent. */
export function useSavedBooks(uid: string | undefined) {
  return useQuery<SavedBook[]>({
    queryKey: ["savedBooks", uid],
    queryFn: () => getSavedBooks(uid!),
    enabled: !!uid,
    staleTime: 60 * 1000, // 1 min
  });
}
