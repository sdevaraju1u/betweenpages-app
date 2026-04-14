"use client";

// BookCarousel — horizontal scroll section with snap, fade edges, and arrows.
// Reusable for trending, country charts, book clubs, genre sections.

import { useRef, useState, useEffect } from "react";
import BookCardSmall from "./BookCardSmall";

type Book = {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
};

type BookCarouselProps = {
  title: string;
  emoji?: string;
  books: Book[];
  showRanks?: boolean;
};

export default function BookCarousel({
  title,
  emoji,
  books,
  showRanks = false,
}: BookCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [books]);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === "left" ? -400 : 400;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }

  if (books.length === 0) return null;

  return (
    <section className="relative group/carousel">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5 px-4 sm:px-8">
        <h2 className="font-display text-lg sm:text-xl font-medium text-on-surface tracking-[-0.01em]">
          {emoji && <span className="mr-2">{emoji}</span>}
          {title}
        </h2>
      </div>

      {/* Carousel container */}
      <div className="relative">
        {/* Fade edges */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 z-10
            bg-gradient-to-r from-background to-transparent pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-12 z-10
            bg-gradient-to-l from-background to-transparent pointer-events-none" />
        )}

        {/* Arrow buttons */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20
              w-10 h-10 rounded-full bg-surface-container-lowest shadow-ambient
              flex items-center justify-center text-on-surface-variant
              opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200
              hover:bg-surface-container active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20
              w-10 h-10 rounded-full bg-surface-container-lowest shadow-ambient
              flex items-center justify-center text-on-surface-variant
              opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200
              hover:bg-surface-container active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}

        {/* Scrollable track */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-5 overflow-x-auto px-4 sm:px-8 pb-4 snap-x snap-mandatory
            scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {books.map((book, i) => (
            <BookCardSmall
              key={book.id}
              id={book.id}
              title={book.title}
              author={book.author}
              coverUrl={book.coverUrl}
              rank={showRanks ? i + 1 : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
