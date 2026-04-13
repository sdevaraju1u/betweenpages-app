// API route to generate reviews on-demand for a book.
// Called when BookDetailContent finds no reviews in Firestore.
// Uses Gemini to generate 5 reviews, saves them to Firestore, returns them.

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

export async function POST(request: Request) {
  const { bookId, title, author } = await request.json();

  if (!bookId || !title || !author) {
    return Response.json({ error: "Missing bookId, title, or author" }, { status: 400 });
  }

  const db = getDb();

  // Check if reviews already exist (race condition guard)
  const existing = await db.collection("books").doc(bookId).collection("reviews").limit(1).get();
  if (!existing.empty) {
    const reviews = await db.collection("books").doc(bookId).collection("reviews").get();
    return Response.json({
      reviews: reviews.docs.map((d) => d.data()).sort((a, b) => b.rating - a.rating),
    });
  }

  // Generate reviews with Gemini
  try {
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

    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const reviews = JSON.parse(cleaned) as Array<{
      rating: number;
      headline: string;
      body: string;
      reviewerName: string;
      reviewerPreference: string;
    }>;

    // Save to Firestore
    const batch = db.batch();
    for (const review of reviews) {
      const ref = db
        .collection("books")
        .doc(bookId)
        .collection("reviews")
        .doc(`seeded-${review.rating}`);
      batch.set(ref, {
        ...review,
        id: `seeded-${review.rating}`,
        source: "seeded",
        createdAt: Date.now(),
      });
    }
    await batch.commit();

    return Response.json({
      reviews: reviews
        .map((r) => ({ ...r, id: `seeded-${r.rating}`, source: "seeded", createdAt: Date.now() }))
        .sort((a, b) => b.rating - a.rating),
    });
  } catch (err) {
    console.error("Failed to generate reviews:", err);
    return Response.json({ reviews: [] });
  }
}
