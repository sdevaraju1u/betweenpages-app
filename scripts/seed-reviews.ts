/**
 * Generates reviews for books that don't have any yet.
 * Run: GOOGLE_GENERATIVE_AI_API_KEY="..." npx tsx scripts/seed-reviews.ts
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from "fs";
import { resolve } from "path";

const sa = JSON.parse(readFileSync(resolve(__dirname, "../serviceAccountKey.json"), "utf-8"));
const app = initializeApp({ credential: cert(sa) });
const db = getFirestore(app);

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ""
);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseJson(text: string): unknown {
  return JSON.parse(text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
}

async function generateReviews(title: string, author: string) {
  const prompt = `Generate 5 representative reader reviews for "${title}" by ${author}.
The reviews should span the full rating spectrum (one each of 1-star through 5-star).
For each review, explain WHY the reader felt that way. Include the reader's preferred genre to give context.

Return ONLY a JSON array. Each object must have:
- "rating": number (1-5)
- "headline": string (one-line summary, max 10 words)
- "body": string (2-3 sentences explaining why this rating)
- "reviewerName": string (first name + last initial)
- "reviewerPreference": string (e.g., "Literary Fiction Fan")`;

  const result = await model.generateContent(prompt);
  return parseJson(result.response.text()) as Array<{
    rating: number;
    headline: string;
    body: string;
    reviewerName: string;
    reviewerPreference: string;
  }>;
}

async function main() {
  console.log("\n💬 Generating missing reviews...\n");

  const allBooks = await db.collection("books").get();
  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const bookDoc of allBooks.docs) {
    const bookId = bookDoc.id;
    const bookData = bookDoc.data();

    // Check if reviews exist
    const existing = await db.collection("books").doc(bookId).collection("reviews").limit(1).get();
    if (!existing.empty) {
      skipped++;
      continue;
    }

    try {
      const reviews = await generateReviews(bookData.title, bookData.author);
      const batch = db.batch();
      for (const review of reviews) {
        const ref = db.collection("books").doc(bookId).collection("reviews").doc(`seeded-${review.rating}`);
        batch.set(ref, { ...review, id: `seeded-${review.rating}`, source: "seeded", createdAt: Date.now() });
      }
      await batch.commit();
      generated++;
      console.log(`  ✓ ${bookData.title} (${reviews.length} reviews)`);
      await sleep(1000); // rate limit
    } catch (err) {
      failed++;
      console.error(`  ✗ ${bookData.title}:`, (err as Error).message?.slice(0, 80));
    }
  }

  console.log(`\n✅ Done: ${generated} generated, ${skipped} skipped, ${failed} failed\n`);
  process.exit(0);
}

main();
