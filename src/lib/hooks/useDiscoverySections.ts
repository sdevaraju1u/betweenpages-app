import { useQuery } from "@tanstack/react-query";
import { getUserPreferences } from "../services/userPreferences";
import { getBookClub, getBooksByIds, getBooksByGenre } from "../services/discoveryService";
import type { Book } from "../schemas/firestore";

export type Section = {
  key: string;
  title: string;
  emoji?: string;
  books: Book[];
  showRanks?: boolean;
};

export type DiscoveryData = {
  sections: Section[];
  followedCountries: string[];
};

async function fetchDiscoveryData(uid: string): Promise<DiscoveryData> {
  const prefs = await getUserPreferences(uid);
  const sections: Section[] = [];
  const withCovers = (books: Book[]) => books.filter((b) => b.coverUrl);

  // 1. Trending — from user's genres
  try {
    const trendingBooks: Book[] = [];
    for (const genre of prefs.favoriteGenres.slice(0, 3)) {
      const genreBooks = await getBooksByGenre(genre, 10);
      trendingBooks.push(...genreBooks);
    }
    const seen = new Set<string>();
    const unique = withCovers(trendingBooks)
      .filter((b) => {
        if (seen.has(b.id)) return false;
        seen.add(b.id);
        return true;
      })
      .slice(0, 15);
    if (unique.length > 0) {
      sections.push({
        key: "trending",
        title: "Trending in your genres",
        emoji: "\u{1F525}",
        books: unique,
      });
    }
  } catch {}

  // 2. Country charts are rendered separately by <CountryChartSection> with SSE streaming.

  // 3. Book clubs
  try {
    for (const clubId of prefs.followedBookClubs) {
      const club = await getBookClub(clubId);
      if (club && club.bookIds.length > 0) {
        const books = withCovers(await getBooksByIds(club.bookIds.slice(0, 15)));
        if (books.length > 0) {
          sections.push({
            key: `club-${club.id}`,
            title: club.name,
            emoji: club.avatarEmoji,
            books,
          });
        }
      }
    }
  } catch {}

  // 4. Genre sections
  try {
    for (const genre of prefs.favoriteGenres.slice(0, 4)) {
      const books = withCovers(await getBooksByGenre(genre, 15));
      if (books.length > 0) {
        sections.push({
          key: `genre-${genre}`,
          title: `Because you love ${genre}`,
          emoji: "\u{1F4D6}",
          books,
        });
      }
    }
  } catch {}

  return { sections, followedCountries: prefs.followedCountries };
}

/** Fetches non-country discovery sections + followedCountries list for SSE rendering. */
export function useDiscoverySections(uid: string | undefined) {
  return useQuery({
    queryKey: ["discoverySections", uid],
    queryFn: () => fetchDiscoveryData(uid!),
    enabled: !!uid,
    staleTime: 3 * 60 * 1000,
  });
}
