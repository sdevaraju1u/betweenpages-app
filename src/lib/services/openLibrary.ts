// Open Library API service.
// Free, no API key, no hard rate limits (~1 req/sec politely).
// Used for: cover images, book metadata enrichment, search.

export type OpenLibrarySearchResult = {
  title: string;
  author: string;
  coverId: number | null;
  coverUrl: string | null;
  openLibraryKey: string | null;
  pageCount: number | null;
  publishedDate: string | null;
  isbn: string | null;
  subjects: string[];
  language: string[];
};

/**
 * Search Open Library for a book by title + author.
 * Returns the best match with cover URL and metadata.
 */
export async function searchOpenLibrary(
  title: string,
  author: string
): Promise<OpenLibrarySearchResult | null> {
  try {
    const query = encodeURIComponent(`${title} ${author}`);
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${query}&limit=1&fields=key,title,author_name,cover_i,number_of_pages_median,first_publish_year,isbn,subject,language`
    );

    if (!res.ok) return null;

    const data = await res.json();
    const doc = data.docs?.[0];
    if (!doc) return null;

    const coverId = doc.cover_i || null;

    return {
      title: doc.title || title,
      author: doc.author_name?.[0] || author,
      coverId,
      coverUrl: coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
        : null,
      openLibraryKey: doc.key || null,
      pageCount: doc.number_of_pages_median || null,
      publishedDate: doc.first_publish_year
        ? String(doc.first_publish_year)
        : null,
      isbn: doc.isbn?.[0] || null,
      subjects: (doc.subject || []).slice(0, 5),
      language: doc.language || [],
    };
  } catch (err) {
    console.error(`Open Library search failed for "${title}":`, err);
    return null;
  }
}

/**
 * Get a high-res cover URL for a book.
 * Sizes: S (small), M (medium), L (large)
 */
export function getCoverUrl(
  coverId: number,
  size: "S" | "M" | "L" = "M"
): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

/**
 * Fetch full book details from Open Library works endpoint.
 * Used when user clicks a book card (on-demand, not during seeding).
 */
export async function getBookDetails(openLibraryKey: string): Promise<{
  description: string;
  subjects: string[];
} | null> {
  try {
    const res = await fetch(`https://openlibrary.org${openLibraryKey}.json`);
    if (!res.ok) return null;

    const data = await res.json();

    let description = "";
    if (typeof data.description === "string") {
      description = data.description;
    } else if (data.description?.value) {
      description = data.description.value;
    }

    return {
      description,
      subjects: (data.subjects || []).slice(0, 10),
    };
  } catch {
    return null;
  }
}
