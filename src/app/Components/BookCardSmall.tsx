"use client";

// BookCardSmall — compact card for carousels.
// Cover image (2:3 aspect) + title + author.
// Optional rank badge for charts (#1, #2, etc.)
// Clicks navigate to /book/{id}.

import { useRouter } from "next/navigation";

type BookCardSmallProps = {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  rank?: number;
  coverColor?: string;
};

const fallbackColors = ["#4E604F", "#9F402D", "#7A542E", "#677967", "#966C44"];

export default function BookCardSmall({
  id,
  title,
  author,
  coverUrl,
  rank,
  coverColor,
}: BookCardSmallProps) {
  const router = useRouter();
  const bgColor = coverColor || fallbackColors[title.length % fallbackColors.length];

  return (
    <button
      onClick={() => router.push(`/book/${id}`)}
      className="flex-shrink-0 w-[160px] group text-left focus:outline-none"
    >
      {/* Cover */}
      <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden
        shadow-ambient group-hover:shadow-ambient-hover
        group-hover:-translate-y-1 transition-all duration-300">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-end justify-center p-4"
            style={{ backgroundColor: bgColor }}
          >
            <p className="font-display text-sm font-medium text-white/90 text-center leading-tight">
              {title}
            </p>
          </div>
        )}

        {/* Rank badge */}
        {rank && (
          <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-secondary
            flex items-center justify-center text-white text-xs font-bold shadow-warm">
            {rank}
          </div>
        )}
      </div>

      {/* Title + Author */}
      <div className="mt-2.5 px-0.5">
        <p className="text-sm font-medium text-on-surface truncate leading-tight">
          {title}
        </p>
        <p className="text-xs text-muted mt-0.5 truncate">{author}</p>
      </div>
    </button>
  );
}
