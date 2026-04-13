// Zod schemas for all Firestore document types.
// Single source of truth for both runtime validation and TypeScript types.

import { z } from "zod";

// ─── Book ───
export const bookSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string(),
  coverUrl: z.string().nullable(),
  description: z.string().default(""),
  categories: z.array(z.string()).default([]),
  language: z.string().default("en"),
  pageCount: z.number().nullable().default(null),
  publishedDate: z.string().nullable().default(null),
  isbn: z.string().nullable().default(null),
  openLibraryKey: z.string().nullable().default(null),
  cachedAt: z.number().default(0),
});
export type Book = z.infer<typeof bookSchema>;

// ─── Book Review ───
export const bookReviewSchema = z.object({
  id: z.string(),
  rating: z.number().min(1).max(5),
  headline: z.string(),
  body: z.string(),
  reviewerName: z.string(),
  reviewerPreference: z.string(),
  source: z.enum(["seeded", "openlibrary", "user"]).default("seeded"),
  createdAt: z.number().default(0),
});
export type BookReview = z.infer<typeof bookReviewSchema>;

// ─── Chart ───
export const chartSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["country", "trending", "genre", "bookclub"]),
  country: z.string().optional(),
  bookIds: z.array(z.string()).default([]),
  updatedAt: z.number().default(0),
});
export type Chart = z.infer<typeof chartSchema>;

// ─── Book Club ───
export const bookClubSchema = z.object({
  id: z.string(),
  name: z.string(),
  curator: z.string(),
  description: z.string(),
  avatarEmoji: z.string().default("📚"),
  bookIds: z.array(z.string()).default([]),
  updatedAt: z.number().default(0),
});
export type BookClub = z.infer<typeof bookClubSchema>;

// ─── User Preferences ───
export const userPreferencesSchema = z.object({
  favoriteGenres: z.array(z.string()).default([]),
  preferredLanguages: z.array(z.string()).default([]),
  followedCountries: z.array(z.string()).default([]),
  followedBookClubs: z.array(z.string()).default([]),
  onboardingComplete: z.boolean().default(false),
});
export type UserPreferences = z.infer<typeof userPreferencesSchema>;

// ─── Saved Book (denormalized for fast listing) ───
export const savedBookSchema = z.object({
  bookId: z.string(),
  title: z.string(),
  author: z.string(),
  coverUrl: z.string().nullable().default(null),
  savedAt: z.number().default(0),
});
export type SavedBook = z.infer<typeof savedBookSchema>;
