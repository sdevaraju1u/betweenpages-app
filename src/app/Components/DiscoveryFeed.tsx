"use client";

// DiscoveryFeed — renders discovery sections + country charts (with SSE streaming).

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useDiscoverySections } from "@/lib/hooks/useDiscoverySections";
import BookCarousel from "./BookCarousel";
import CountryChartSection from "./CountryChartSection";

export default function DiscoveryFeed() {
  const { user } = useAuth();
  const { data, isLoading } = useDiscoverySections(user?.uid);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  if (isLoading) {
    return (
      <div className="px-4 sm:px-8 py-6 sm:py-10 space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <div className="h-6 w-48 bg-surface-container rounded-full animate-pulse" />
            <div className="flex gap-5">
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className="w-[160px] aspect-[2/3] bg-surface-container rounded-2xl animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const sections = data?.sections || [];
  const followedCountries = data?.followedCountries || [];

  // Split sections: trending comes first, then country charts, then the rest
  const trendingSection = sections.find((s) => s.key === "trending");
  const otherSections = sections.filter((s) => s.key !== "trending");

  return (
    <div className="py-6 sm:py-8 space-y-8 sm:space-y-10">
      {/* Greeting */}
      <div className="px-4 sm:px-8">
        <h1 className="font-display text-2xl sm:text-3xl font-medium text-on-surface tracking-[-0.02em]">
          {greeting},{" "}
          <span className="text-gradient">
            {user?.displayName?.split(" ")[0] || "Reader"}
          </span>
          .
        </h1>
        <p className="text-sm sm:text-base text-muted mt-1">Discover your next favorite book.</p>
      </div>

      {/* Trending first */}
      {trendingSection && (
        <div style={{ animation: `fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both` }}>
          <BookCarousel
            title={trendingSection.title}
            emoji={trendingSection.emoji}
            books={trendingSection.books}
            showRanks={trendingSection.showRanks}
          />
        </div>
      )}

      {/* Country charts — each is a self-contained SSE-streaming component */}
      {followedCountries.map((countryCode, i) => (
        <div
          key={`country-${countryCode}`}
          style={{
            animation: `fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${(i + 1) * 0.08}s both`,
          }}
        >
          <CountryChartSection countryCode={countryCode} />
        </div>
      ))}

      {/* Remaining sections (book clubs, genres) */}
      {otherSections.map((section, i) => (
        <div
          key={section.key}
          style={{
            animation: `fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${(i + followedCountries.length + 1) * 0.08}s both`,
          }}
        >
          <BookCarousel
            title={section.title}
            emoji={section.emoji}
            books={section.books}
            showRanks={section.showRanks}
          />
        </div>
      ))}

      {sections.length === 0 && followedCountries.length === 0 && !isLoading && (
        <div className="text-center py-16 px-8">
          <p className="text-muted text-lg">
            No sections to show yet. Try following more countries or book clubs
            in your preferences.
          </p>
        </div>
      )}
    </div>
  );
}
