import { type Shelf } from "@/lib/schemas/book";
import ShelfItem from "./ShelfItem";

type BooksPanelProps = {
  collections: string[];
  shelves: Shelf[];
};

export default function BooksPanel({ collections, shelves }: BooksPanelProps) {
  return (
    <section className="w-[57%] flex flex-col min-h-0 border-r border-border bg-bg-100">
      <div className="p-6 pb-4 shrink-0 bg-bg-100">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by title, author, or vibe…"
            className="w-full h-12 pl-11 pr-4 rounded-lg bg-bg-white border border-border text-neutral placeholder:text-muted focus:outline-none focus:border-secondary"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {collections.map((name) => (
            <button
              key={name}
              className="px-3 py-1.5 rounded-full bg-bg-200 hover:bg-tertiary/20 text-sm text-neutral border border-border"
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-8">
        {shelves.map((shelf) => (
          <ShelfItem key={shelf.title} shelf={shelf} />
        ))}
      </div>
    </section>
  );
}
