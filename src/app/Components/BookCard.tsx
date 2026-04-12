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
  return (
    <div
      className="rounded-[24px] overflow-hidden max-w-[320px] mx-auto
        shadow-[0_4px_24px_rgba(125,144,125,0.15),0_1px_4px_rgba(0,0,0,0.06)]
        hover:shadow-[0_8px_32px_rgba(125,144,125,0.25),0_2px_8px_rgba(0,0,0,0.08)]
        transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        border: "1px solid rgba(0, 0, 0, 0.06)",
      }}
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
              <p className="font-display text-xl font-bold text-white/90 leading-tight">
                {title}
              </p>
              <p className="text-sm text-white/70 mt-2">{author}</p>
            </div>
          </div>
        )}

        {/* Gradient overlay on cover for text readability */}
        {coverUrl && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        )}

        {/* Title + Author overlaid on cover */}
        {coverUrl && (
          <div className="absolute bottom-3 left-4 right-16">
            <h3 className="font-display text-lg font-bold text-white leading-tight drop-shadow-lg">
              {title}
            </h3>
            <p className="text-sm text-white/80 mt-0.5 drop-shadow-lg">
              {author}
            </p>
          </div>
        )}

        {/* Match score badge — overlaid on bottom-right of cover */}
        <div
          className="absolute bottom-3 right-3 w-14 h-14 rounded-full flex flex-col items-center justify-center
            border-2 border-accent/60 shadow-[0_0_12px_rgba(226,114,91,0.25)]"
          style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)" }}
        >
          <span className="text-accent font-bold text-sm leading-none">
            {matchScore}%
          </span>
          <span className="text-[9px] text-muted leading-none mt-0.5">
            Match
          </span>
        </div>
      </div>

      {/* Info section below cover */}
      <div className="px-5 pt-4 pb-5">
        {/* Title + Author (below cover) */}
        <h3 className="font-display text-lg font-bold text-text leading-tight">
          {title}
        </h3>
        <p className="text-sm text-muted mt-0.5">{author}</p>

        {/* Goodreads rating */}
        <div className="flex items-center gap-1.5 mt-3">
          <span className="text-accent text-sm">&#9733;</span>
          <span className="text-text font-medium text-sm">{goodreadsRating}</span>
          <span className="text-muted text-xs">Goodreads</span>
        </div>

        {/* Testimony */}
        <div className="border-t border-black/[0.06] pt-3 mt-3">
          <p className="text-sm italic text-text/70 leading-relaxed">
            &ldquo;{testimony}&rdquo;
          </p>
          <p className="text-xs text-muted mt-1.5">
            &mdash; {testimonyAuthor}, {testimonyCredential}
          </p>
        </div>
      </div>
    </div>
  );
}
