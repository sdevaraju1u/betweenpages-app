// On-demand chart generation API with SSE streaming.
// Streams books to the client as they're generated — feels instant.
//
// Flow:
// 1. If chart cached in Firestore → return { status: "cached", chart } immediately
// 2. If not cached → stream:
//    - "generating" event when Gemini call starts
//    - "book" event for each enriched book (so UI can render progressively)
//    - "complete" event with final chart

export const maxDuration = 120; // 2 minutes

import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (getApps().length === 0) {
  initializeApp({ projectId: "betweenpages-a658a" });
}
const db = getFirestore();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const COUNTRY_NAMES: Record<string, string> = {
  IN: "India", US: "United States", GB: "United Kingdom", CA: "Canada",
  AU: "Australia", DE: "Germany", FR: "France", JP: "Japan", BR: "Brazil",
  KR: "South Korea", CN: "China", SG: "Singapore", PH: "Philippines",
  ID: "Indonesia", TH: "Thailand", MY: "Malaysia", VN: "Vietnam",
  PK: "Pakistan", BD: "Bangladesh", MX: "Mexico", AR: "Argentina",
  CO: "Colombia", CL: "Chile", ES: "Spain", IT: "Italy", NL: "Netherlands",
  SE: "Sweden", NO: "Norway", DK: "Denmark", PL: "Poland", PT: "Portugal",
  CH: "Switzerland", BE: "Belgium", IE: "Ireland", RU: "Russia",
  UA: "Ukraine", CZ: "Czech Republic", AT: "Austria", NG: "Nigeria",
  ZA: "South Africa", KE: "Kenya", EG: "Egypt", GH: "Ghana",
  AE: "UAE", SA: "Saudi Arabia", IL: "Israel", TR: "Turkey",
  NZ: "New Zealand",
};

const CHART_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

async function searchOpenLibrary(title: string, author: string) {
  try {
    const q = encodeURIComponent(`${title} ${author}`);
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${q}&limit=1&fields=key,title,author_name,cover_i,number_of_pages_median,first_publish_year,isbn,subject`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const doc = data.docs?.[0];
    if (!doc) return null;
    const coverId = doc.cover_i || null;
    return {
      coverUrl: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null,
      openLibraryKey: doc.key || null,
      pageCount: doc.number_of_pages_median || null,
      publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : null,
      isbn: doc.isbn?.[0] || null,
      subjects: (doc.subject || []).slice(0, 5),
    };
  } catch { return null; }
}

function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

type GeminiBook = { title: string; author: string; genre: string; language: string };

// SSE helper: encode an event
function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: Request) {
  const { countryCode } = await request.json();

  if (!countryCode || !COUNTRY_NAMES[countryCode]) {
    return Response.json({ error: "Invalid country code" }, { status: 400 });
  }

  const chartId = `top-${countryCode.toLowerCase()}`;
  const countryName = COUNTRY_NAMES[countryCode];

  // Check cache first
  const cached = await db.collection("charts").doc(chartId).get();
  if (cached.exists) {
    const data = cached.data()!;
    const age = Date.now() - (data.updatedAt || 0);
    if (age < CHART_MAX_AGE_MS) {
      // Return JSON (not streaming) for cache hits
      return Response.json({ status: "cached", chart: data });
    }
  }

  // Generate via streaming
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Event: generating
        controller.enqueue(encoder.encode(sseEvent("generating", {
          countryName,
          message: `Curating the best books from ${countryName}...`,
        })));

        // Ask Gemini for books
        const prompt = `List the 20 most popular and widely-read books in ${countryName} across all genres. Include both classic and contemporary books. Include books in the country's native language(s) and English.

Return ONLY a JSON array with no other text. Each object must have:
- "title": string (exact book title)
- "author": string (author's full name)
- "genre": string (primary genre)
- "language": string (original language)`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const geminiBooks: GeminiBook[] = JSON.parse(cleaned);

        // Event: enriching
        controller.enqueue(encoder.encode(sseEvent("enriching", {
          total: geminiBooks.length,
          message: `Finding covers for ${geminiBooks.length} books...`,
        })));

        // Enrich in parallel batches, streaming each book as it's done
        const bookIds: string[] = [];

        for (let i = 0; i < geminiBooks.length; i += 5) {
          const batch = geminiBooks.slice(i, i + 5);
          const results = await Promise.all(
            batch.map(async (gb) => {
              const bookId = toSlug(gb.title);
              const existing = await db.collection("books").doc(bookId).get();
              if (existing.exists) {
                return existing.data() as Record<string, unknown>;
              }
              const ol = await searchOpenLibrary(gb.title, gb.author);
              const bookDoc = {
                id: bookId,
                title: gb.title,
                author: gb.author,
                coverUrl: ol?.coverUrl || null,
                description: "",
                categories: ol?.subjects || [gb.genre],
                language: gb.language,
                pageCount: ol?.pageCount || null,
                publishedDate: ol?.publishedDate || null,
                isbn: ol?.isbn || null,
                openLibraryKey: ol?.openLibraryKey || null,
                cachedAt: Date.now(),
              };
              await db.collection("books").doc(bookId).set(bookDoc);
              return bookDoc;
            })
          );

          for (const book of results) {
            bookIds.push(book.id as string);
            // Event: book (stream each book as it's ready)
            controller.enqueue(encoder.encode(sseEvent("book", book)));
          }
        }

        // Save chart
        const chartDoc = {
          id: chartId,
          name: `Top in ${countryName}`,
          type: "country",
          country: countryCode,
          bookIds,
          updatedAt: Date.now(),
        };
        await db.collection("charts").doc(chartId).set(chartDoc);

        // Event: complete
        controller.enqueue(encoder.encode(sseEvent("complete", chartDoc)));
        controller.close();
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(encoder.encode(sseEvent("error", { message: errMsg })));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
