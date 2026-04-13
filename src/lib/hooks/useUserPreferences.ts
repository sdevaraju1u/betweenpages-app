import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserPreferences, saveUserPreferences } from "../services/userPreferences";
import type { UserPreferences } from "../schemas/firestore";

/** Shared query for user preferences — cached globally, used by MainShell, ProfileDropdown, DiscoveryFeed */
export function useUserPreferences(uid: string | undefined) {
  return useQuery({
    queryKey: ["userPreferences", uid],
    queryFn: () => getUserPreferences(uid!),
    enabled: !!uid,
    staleTime: 5 * 60 * 1000, // 5 min — preferences rarely change
  });
}

/** Mutation to save preferences (onboarding + edit). Invalidates preferences + discovery cache. */
export function useSavePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, preferences }: { uid: string; preferences: UserPreferences }) =>
      saveUserPreferences(uid, preferences),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userPreferences", variables.uid] });
      queryClient.invalidateQueries({ queryKey: ["discoverySections"] });
    },
  });
}
