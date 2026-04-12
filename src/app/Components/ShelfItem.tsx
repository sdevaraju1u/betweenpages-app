import { Shelf } from "@/lib/schemas/book";
import BookItem from "./BookItem";


export default function ShelfItem({ shelf }: { shelf: Shelf }) {
    return (
        <div key={shelf.title}>
            <div className="flex items-baseline justify-between mb-3">
                <h2 className="font-display text-lg font-semibold text-primary">
                    {shelf.title}
                </h2>
                <a className="text-xs text-secondary hover:underline" href="#">
                    See all
                </a>
            </div>

            <div className="grid grid-cols-5 gap-4">
                {shelf.books.map((book) => (
                    <BookItem key={book.title} book={book} />
                ))}
            </div>
        </div>
    )
}