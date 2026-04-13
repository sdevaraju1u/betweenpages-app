"use client";

import { useRouter } from "next/navigation";

type BookCardProps = {
  title: string;
  author: string;
  coverColor: string;
  coverUrl?: string | null;
  goodreadsRating: string;
  matchScore: string;
  testimony: string;
  testimonyAuthor: string;
  testimonyCredential: string;
};

// Generate a slug ID from title (same logic as the seed script)
function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export default function BookCard({
  title,
  author,
  coverColor,
  coverUrl,
  goodreadsRating,
  matchScore,
  testimony,
  testimonyAuthor,
  testimonyCredential,
}: BookCardProps) {
  const router = useRouter();

  function handleClick() {
    router.push(`/book/${toSlug(title)}`);
  }

  return (
    <div
      onClick={handleClick}
      className="rounded-[24px] overflow-hidden max-w-[320px] mx-auto
        bg-surface-container-lowest border border-outline-variant
        shadow-ambient hover:shadow-ambient-hover
        transition-all duration-400 hover:-translate-y-1 cursor-pointer group"
    >
      {/* Cover image section */}
      <div className="relative w-full aspect-[3/4] overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`Cover of ${title}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-end justify-center p-6"
            style={{ backgroundColor: coverColor }}
          >
            <div className="text-center">
              <p className="font-display text-xl font-medium text-white/90 leading-tight">
                {title}
              </p>
              <p className="text-sm text-white/70 mt-2">{author}</p>
            </div>
          </div>
        )}

        {/* Gradient overlay for text readability */}
        {coverUrl && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        )}

        {/* Title + Author overlaid on cover */}
        {coverUrl && (
          <div className="absolute bottom-3 left-5 right-16">
            <h3 className="font-display text-lg font-medium text-white leading-tight drop-shadow-lg">
              {title}
            </h3>
            <p className="text-sm text-white/80 mt-0.5 drop-shadow-lg">
              {author}
            </p>
          </div>
        )}

        {/* Match score badge */}
        <div
          className="absolute bottom-3 right-3 w-14 h-14 rounded-full flex flex-col items-center justify-center
            shadow-warm"
          style={{
            background: "rgba(252, 249, 244, 0.9)",
            backdropFilter: "blur(8px)",
          }}
        >
          <span className="text-secondary font-bold text-sm leading-none">
            {matchScore}%
          </span>
          <span className="text-[9px] text-muted leading-none mt-0.5">
            Match
          </span>
        </div>
      </div>

      {/* Info section below cover */}
      <div className="px-5 pt-4 pb-5">
        <h3 className="font-display text-lg font-medium text-on-surface leading-tight">
          {title}
        </h3>
        <p className="text-sm text-muted mt-0.5">{author}</p>

        {/* Goodreads rating */}
        <div className="flex items-center gap-1.5 mt-3">
          <span className="text-secondary text-sm">&#9733;</span>
          <span className="text-on-surface font-medium text-sm">{goodreadsRating}</span>
          <span className="text-muted text-xs">Goodreads</span>
        </div>

        {/* Testimony */}
        <div className="pt-4 mt-4">
          <p className="text-sm italic text-on-surface-variant leading-relaxed">
            &ldquo;{testimony}&rdquo;
          </p>
          <p className="text-xs text-muted mt-2">
            &mdash; {testimonyAuthor}, {testimonyCredential}
          </p>
        </div>
      </div>
    </div>
  );
}
