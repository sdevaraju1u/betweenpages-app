import { z } from "zod";

export const bookRecommendationSchema = z.object({
  title: z.string().describe("The book title"),
  author: z.string().describe("The author's full name"),
  goodreadsRating: z.string().describe("Goodreads rating out of 5, e.g. '4.2'"),
  matchScore: z
    .string()
    .describe("How well this book matches the user's request, 1-100"),
  testimony: z
    .string()
    .describe(
      "A short quote about the book from a notable reviewer, author, or reader. 1-2 sentences max."
    ),
  testimonyAuthor: z.string().describe("Who said the testimony quote"),
  testimonyCredential: z
    .string()
    .describe("The credential of the testimony author, e.g. 'NYT Bestselling Author'"),
});

export const recommendBooksSchema = z.object({
  books: z
    .array(bookRecommendationSchema)
    .min(1)
    .max(3)
    .describe("Array of 1-3 book recommendations"),
});

export type BookRecommendation = z.infer<typeof bookRecommendationSchema>;
