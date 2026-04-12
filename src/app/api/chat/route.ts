import { google } from "@ai-sdk/google";
import {
    streamText,
    convertToModelMessages,
    tool,
    jsonSchema,
    type UIMessage,
} from "ai";

export const maxDuration = 30;

// Fetch book cover from Open Library (free, no key, no rate limits)
async function fetchCoverUrl(
  title: string,
  author: string
): Promise<string | null> {
  try {
    const query = encodeURIComponent(`${title} ${author}`);
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${query}&limit=1&fields=cover_i`
    );
    const data = await res.json();
    const coverId = data.docs?.[0]?.cover_i;
    return coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
      : null;
  } catch {
    return null;
  }
}

// Define the tool schema as plain JSON Schema (bypasses Zod v4 conversion issues)
const recommendBooksParameters = jsonSchema<{
    books: Array<{
        title: string;
        author: string;
        goodreadsRating: string;
        matchScore: string;
        testimony: string;
        testimonyAuthor: string;
        testimonyCredential: string;
    }>;
}>({
    type: "object",
    properties: {
        books: {
            type: "array",
            description: "Array of 1-3 book recommendations",
            minItems: 1,
            maxItems: 3,
            items: {
                type: "object",
                properties: {
                    title: { type: "string", description: "The book title" },
                    author: { type: "string", description: "The author's full name" },
                    goodreadsRating: {
                        type: "string",
                        description: "Goodreads rating out of 5, e.g. '4.2'",
                    },
                    matchScore: {
                        type: "string",
                        description:
                            "How well this book matches the user's request, 1-100",
                    },
                    testimony: {
                        type: "string",
                        description:
                            "A short quote about the book from a notable reviewer, author, or reader. 1-2 sentences max.",
                    },
                    testimonyAuthor: {
                        type: "string",
                        description: "Who said the testimony quote",
                    },
                    testimonyCredential: {
                        type: "string",
                        description:
                            "The credential of the testimony author, e.g. 'NYT Bestselling Author'",
                    },
                },
                required: [
                    "title",
                    "author",
                    "goodreadsRating",
                    "matchScore",
                    "testimony",
                    "testimonyAuthor",
                    "testimonyCredential",
                ],
                additionalProperties: false,
            },
        },
    },
    required: ["books"],
});

export async function POST(request: Request) {
    const { messages }: { messages: UIMessage[] } = await request.json();

    const result = await streamText({
        model: google("gemini-2.5-flash"),
        system: `You are BetweenPages, a warm and slightly opinionated reading companion — like a friend who always has a book recommendation ready.

PERSONALITY:
- Warm, conversational, concise. Never lecture.
- You have opinions. "You HAVE to read this" is better than "You might consider."
- Use natural language, not bullet-point dumps.

SCOPE:
- You discuss: books, authors, genres, reading habits, literary themes, book-to-film adaptations.
- Programming books, self-help books, cookbooks — all fair game. They're books.
- You do NOT discuss: anything unrelated to books or reading. No code, no weather, no math, no trivia.

REFUSAL:
- When asked something off-topic, redirect warmly in one sentence.
- Example: "I'm all about books! Want me to recommend something instead?"
- Never apologize excessively. One redirect, then move on.

TOOLS:
- When recommending books, ALWAYS use the recommendBooks tool to provide structured book data. Do NOT list books in plain text.
- You MUST provide the books array with all required fields filled in.
- You may include a short conversational intro or follow-up as regular text alongside the tool call.
- Provide 1-3 books per recommendation. Quality over quantity.

FORMAT:
- Keep text responses to 2-3 short paragraphs.
- Only give longer responses if the user explicitly asks for detail.`,
        messages: await convertToModelMessages(messages),
        tools: {
            recommendBooks: tool({
                description:
                    "Recommend 1-3 books to the user. Call this whenever the user asks for book recommendations, suggestions, or what to read next. You MUST provide the books array where EVERY book has ALL of these fields: title, author, goodreadsRating (string like '4.2'), matchScore (string like '95'), testimony (a real quote about the book), testimonyAuthor, testimonyCredential. Do NOT add any other fields.",
                parameters: recommendBooksParameters,
                execute: async (args) => {
                    const books = args?.books;
                    // Guard against empty tool calls (Gemini sometimes sends {})
                    if (!books || !Array.isArray(books) || books.length === 0) {
                        return { books: [] };
                    }
                    // Enrich each book with a real cover image from Google Books
                    const enriched = await Promise.all(
                        books.map(async (book) => ({
                            ...book,
                            coverUrl: await fetchCoverUrl(book.title, book.author),
                        }))
                    );
                    return { books: enriched };
                },
            }),
        },
        // @ts-expect-error bypass SDK type gap 
        maxSteps: 3,
    });

    return result.toUIMessageStreamResponse();
}
