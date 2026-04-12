import { z } from "zod";


export const bookSchema = z.object({
    title: z.string(),
    author: z.string(),
    cover: z.string(),
    rating: z.string(),
});

export const shelfSchema = z.object({
    title: z.string(),
    books: z.array(bookSchema),
});

export type Book = z.infer<typeof bookSchema>;
export type Shelf = z.infer<typeof shelfSchema>;