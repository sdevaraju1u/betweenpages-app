// Search API — searches books by title/author via Open Library.
// Falls back to Firestore cache first if a query matches existing books.

export const maxDuration = 15;

import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) {
  initializeApp({ projectId: "betweenpages-a658a" });
}
const db = getFirestore();

type SearchResult = {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  source: "firestore" | "openlibrary";
};

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export async function POST(request: Request) {
  const { q } = await request.json();

  if (!q || typeof q !== "string" || q.trim().length < 2) {
    return Response.json({ results: [] });
  }

  const query = q.trim();
  const results: SearchResult[] = [];
  const seen = new Set<string>();

  // 1. Search Firestore cache first (fast path)
  try {
    // Search by title prefix (Firestore doesn't support full-text search natively)
    const snap = await db
      .collection("books")
      .where("title", ">=", query)
      .where("title", "<=", query + "\uf8ff")
      .limit(5)
      .get();

    snap.docs.forEach((d) => {
      const data = d.data();
      if (data.coverUrl && !seen.has(data.id)) {
        seen.add(data.id);
        results.push({
          id: data.id,
          title: data.title,
          author: data.author,
          coverUrl: data.coverUrl,
          source: "firestore",
        });
      }
    });
  } catch {}

  // 2. Hit Open Library for more results
  try {
    const olRes = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=15&fields=title,author_name,cover_i`
    );
    if (olRes.ok) {
      const data = await olRes.json();
      for (const doc of data.docs || []) {
        if (results.length >= 15) break;
        if (!doc.title || !doc.cover_i) continue; // skip books without covers
        const id = toSlug(doc.title);
        if (seen.has(id)) continue;
        seen.add(id);
        results.push({
          id,
          title: doc.title,
          author: doc.author_name?.[0] || "Unknown author",
          coverUrl: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`,
          source: "openlibrary",
        });
      }
    }
  } catch {}

  return Response.json({ results });
}
