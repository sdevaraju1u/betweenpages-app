
import { Book } from "@/lib/schemas/book";

export default function BookItem({ book }: { book: Book }) {
    return (
        <article key={book.title} className="group cursor-pointer">
            <div
                className="aspect-[2/3] rounded-md shadow-sm group-hover:shadow-md transition-shadow"
                style={{ backgroundColor: book.cover }}
            />
            <h3 className="mt-2 text-sm font-medium text-primary line-clamp-2 leading-snug">
                {book.title}
            </h3>
            <p className="text-xs text-muted line-clamp-1">
                {book.author}
            </p>
            <p className="text-xs text-tertiary font-medium mt-0.5">
                ★ {book.rating}
            </p>
        </article>
    )
}