// Reviews API with SSE streaming.
// If reviews exist in Firestore → return JSON immediately.
// If not → stream each review to the client as it's generated.

export const maxDuration = 60;

import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Firebase Admin (server-side)
function getDb() {
  if (getApps().length === 0) {
    const saPath = resolve(process.cwd(), "serviceAccountKey.json");
    if (existsSync(saPath)) {
      const sa = JSON.parse(readFileSync(saPath, "utf-8"));
      initializeApp({ credential: cert(sa) });
    } else {
      initializeApp({ projectId: "betweenpages-a658a" });
    }
  }
  return getFirestore();
}

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

type GeneratedReview = {
  rating: number;
  headline: string;
  body: string;
  reviewerName: string;
  reviewerPreference: string;
};

export async function POST(request: Request) {
  const { bookId, title, author } = await request.json();

  if (!bookId || !title || !author) {
    return Response.json({ error: "Missing bookId, title, or author" }, { status: 400 });
  }

  const db = getDb();

  // If reviews already exist, return as JSON (no streaming needed)
  const existing = await db
    .collection("books")
    .doc(bookId)
    .collection("reviews")
    .get();

  if (!existing.empty) {
    return Response.json({
      reviews: existing.docs
        .map((d) => d.data())
        .sort((a, b) => b.rating - a.rating),
    });
  }

  // No reviews — stream generation
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(
          encoder.encode(
            sseEvent("generating", {
              message: `Gathering reader reviews for ${title}...`,
            })
          )
        );

        const { text } = await generateText({
          model: google("gemini-2.5-flash"),
          prompt: `Generate 5 representative reader reviews for "${title}" by ${author}.
The reviews should span the full rating spectrum (one each of 1-star through 5-star).
For each review, explain WHY the reader felt that way. Include the reader's preferred genre to give context.

Return ONLY a JSON array. Each object must have:
- "rating": number (1-5)
- "headline": string (one-line summary, max 10 words)
- "body": string (2-3 sentences explaining why this rating)
- "reviewerName": string (first name + last initial)
- "reviewerPreference": string (e.g., "Literary Fiction Fan")`,
        });

        const cleaned = text
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        const reviews = JSON.parse(cleaned) as GeneratedReview[];
        const sorted = reviews.sort((a, b) => b.rating - a.rating);

        // Stream each review as it's saved
        for (const review of sorted) {
          const reviewId = `seeded-${review.rating}`;
          const docData = {
            ...review,
            id: reviewId,
            source: "seeded",
            createdAt: Date.now(),
          };

          await db
            .collection("books")
            .doc(bookId)
            .collection("reviews")
            .doc(reviewId)
            .set(docData);

          controller.enqueue(encoder.encode(sseEvent("review", docData)));
        }

        controller.enqueue(encoder.encode(sseEvent("complete", { count: sorted.length })));
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(encoder.encode(sseEvent("error", { message: msg })));
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
