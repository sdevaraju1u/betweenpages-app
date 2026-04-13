import { useQuery } from "@tanstack/react-query";
import { getUserPreferences } from "../services/userPreferences";
import {
  getChart,
  getBooksByIds,
  getChartsByCountries,
  getBookClub,
  getBooksByGenre,
} from "../services/discoveryService";
import type { Book } from "../schemas/firestore";

export type Section = {
  key: string;
  title: string;
  emoji?: string;
  books: Book[];
  showRanks?: boolean;
};

const FLAGS: Record<string, string> = {
  IN: "\u{1F1EE}\u{1F1F3}", US: "\u{1F1FA}\u{1F1F8}", GB: "\u{1F1EC}\u{1F1E7}",
  CA: "\u{1F1E8}\u{1F1E6}", AU: "\u{1F1E6}\u{1F1FA}", DE: "\u{1F1E9}\u{1F1EA}",
  FR: "\u{1F1EB}\u{1F1F7}", JP: "\u{1F1EF}\u{1F1F5}", BR: "\u{1F1E7}\u{1F1F7}",
  KR: "\u{1F1F0}\u{1F1F7}",
};

async function fetchDiscoverySections(uid: string): Promise<Section[]> {
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
      .filter((b) => { if (seen.has(b.id)) return false; seen.add(b.id); return true; })
      .slice(0, 15);
    if (unique.length > 0) {
      sections.push({ key: "trending", title: "Trending in your genres", emoji: "\u{1F525}", books: unique });
    }
  } catch {}

  // 2. Country charts
  try {
    const charts = await getChartsByCountries(prefs.followedCountries);
    for (const chart of charts) {
      if (chart.bookIds.length > 0) {
        const books = withCovers(await getBooksByIds(chart.bookIds.slice(0, 20)));
        if (books.length > 0) {
          sections.push({
            key: `chart-${chart.id}`, title: chart.name,
            emoji: FLAGS[chart.country || ""] || "\u{1F4CA}",
            books, showRanks: true,
          });
        }
      }
    }
  } catch {}

  // 3. Book clubs
  try {
    for (const clubId of prefs.followedBookClubs) {
      const club = await getBookClub(clubId);
      if (club && club.bookIds.length > 0) {
        const books = withCovers(await getBooksByIds(club.bookIds.slice(0, 15)));
        if (books.length > 0) {
          sections.push({ key: `club-${club.id}`, title: club.name, emoji: club.avatarEmoji, books });
        }
      }
    }
  } catch {}

  // 4. Genre sections
  try {
    for (const genre of prefs.favoriteGenres.slice(0, 4)) {
      const books = withCovers(await getBooksByGenre(genre, 15));
      if (books.length > 0) {
        sections.push({ key: `genre-${genre}`, title: `Because you love ${genre}`, emoji: "\u{1F4D6}", books });
      }
    }
  } catch {}

  return sections;
}

/** Fetches all discovery sections for a user. Cached and invalidated on preference change. */
export function useDiscoverySections(uid: string | undefined) {
  return useQuery({
    queryKey: ["discoverySections", uid],
    queryFn: () => fetchDiscoverySections(uid!),
    enabled: !!uid,
    staleTime: 3 * 60 * 1000, // 3 min
  });
}
