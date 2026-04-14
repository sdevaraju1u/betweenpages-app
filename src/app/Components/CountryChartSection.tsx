"use client";

// CountryChartSection — a single country chart with progressive SSE loading.
// Shows friendly loading message + skeleton books until data arrives.
// Books stream in one-by-one as they're enriched.

import { useCountryChart } from "@/lib/hooks/useCountryChart";
import BookCarousel from "./BookCarousel";

const FLAGS: Record<string, string> = {
  IN: "🇮🇳", US: "🇺🇸", GB: "🇬🇧", CA: "🇨🇦", AU: "🇦🇺", DE: "🇩🇪", FR: "🇫🇷",
  JP: "🇯🇵", BR: "🇧🇷", KR: "🇰🇷", CN: "🇨🇳", SG: "🇸🇬", PH: "🇵🇭", ID: "🇮🇩",
  TH: "🇹🇭", MY: "🇲🇾", VN: "🇻🇳", PK: "🇵🇰", BD: "🇧🇩", MX: "🇲🇽", AR: "🇦🇷",
  CO: "🇨🇴", CL: "🇨🇱", ES: "🇪🇸", IT: "🇮🇹", NL: "🇳🇱", SE: "🇸🇪", NO: "🇳🇴",
  DK: "🇩🇰", PL: "🇵🇱", PT: "🇵🇹", CH: "🇨🇭", BE: "🇧🇪", IE: "🇮🇪", RU: "🇷🇺",
  UA: "🇺🇦", CZ: "🇨🇿", AT: "🇦🇹", NG: "🇳🇬", ZA: "🇿🇦", KE: "🇰🇪", EG: "🇪🇬",
  GH: "🇬🇭", AE: "🇦🇪", SA: "🇸🇦", IL: "🇮🇱", TR: "🇹🇷", NZ: "🇳🇿",
};

const COUNTRY_NAMES: Record<string, string> = {
  IN: "India", US: "United States", GB: "United Kingdom", CA: "Canada",
  AU: "Australia", DE: "Germany", FR: "France", JP: "Japan", BR: "Brazil",
  KR: "South Korea", CN: "China", SG: "Singapore", PH: "Philippines",
  ID: "Indonesia", TH: "Thailand", MY: "Malaysia", VN: "Vietnam",
  PK: "Pakistan", BD: "Bangladesh", MX: "Mexico", AR: "Argentina",
  CO: "Colombia", CL: "Chile", ES: "Spain", IT: "Italy", NL: "Netherlands",
  SE: "Sweden", NO: "Norway", DK: "Denmark", PL: "Poland", PT: "Portugal",
  CH: "Switzerland", BE: "Belgium", IE: "Ireland", RU: "Russia",
  UA: "Ukraine", CZ: "Czech Republic", AT: "Austria", NG: "Nigeria",
  ZA: "South Africa", KE: "Kenya", EG: "Egypt", GH: "Ghana",
  AE: "UAE", SA: "Saudi Arabia", IL: "Israel", TR: "Turkey",
  NZ: "New Zealand",
};

type Props = {
  countryCode: string;
};

export default function CountryChartSection({ countryCode }: Props) {
  const { books, status, message } = useCountryChart(countryCode);
  const flag = FLAGS[countryCode] || "📊";
  const countryName = COUNTRY_NAMES[countryCode] || countryCode;
  const title = `Top in ${countryName}`;

  // If we have books, show them (even while still streaming)
  if (books.length > 0) {
    return (
      <div>
        <BookCarousel
          title={title}
          emoji={flag}
          books={books}
          showRanks
        />
        {/* If still loading more, show a subtle indicator */}
        {(status === "generating" || status === "enriching") && (
          <p className="text-xs text-muted px-4 sm:px-8 -mt-2">
            ✨ {message}
          </p>
        )}
      </div>
    );
  }

  // No books yet — show friendly loading state
  if (status === "loading" || status === "generating" || status === "enriching") {
    return (
      <section className="px-4 sm:px-8">
        <h2 className="font-display text-xl font-medium text-on-surface tracking-[-0.01em] mb-2">
          {flag} {title}
        </h2>
        <p className="text-sm text-muted mb-5 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
          {status === "loading" ? `Discovering ${countryName}'s best reads...` : message || "Loading..."}
        </p>
        <div className="flex gap-5 px-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-[160px] aspect-[2/3] bg-surface-container rounded-2xl"
              style={{
                animation: `pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) ${i * 0.1}s infinite`,
              }}
            />
          ))}
        </div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="px-4 sm:px-8">
        <h2 className="font-display text-xl font-medium text-on-surface tracking-[-0.01em] mb-2">
          {flag} {title}
        </h2>
        <p className="text-sm text-muted">
          Couldn&apos;t load this chart right now. Try refreshing in a moment.
        </p>
      </section>
    );
  }

  return null;
}
