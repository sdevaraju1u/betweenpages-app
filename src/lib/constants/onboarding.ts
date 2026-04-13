// All selectable options for the onboarding flow.

export const GENRES = [
  "Sci-Fi",
  "Fantasy",
  "Mystery",
  "Romance",
  "Thriller",
  "Horror",
  "Literary Fiction",
  "Historical Fiction",
  "Non-Fiction",
  "Biography",
  "Self-Help",
  "Poetry",
  "Graphic Novels",
  "Young Adult",
  "Classics",
  "Philosophy",
  "Science",
  "True Crime",
] as const;

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "bn", label: "Bengali" },
  { code: "mr", label: "Marathi" },
  { code: "gu", label: "Gujarati" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "pt", label: "Portuguese" },
  { code: "zh", label: "Mandarin" },
  { code: "ar", label: "Arabic" },
] as const;

export const COUNTRIES = [
  { code: "IN", label: "India", flag: "🇮🇳" },
  { code: "US", label: "USA", flag: "🇺🇸" },
  { code: "GB", label: "UK", flag: "🇬🇧" },
  { code: "CA", label: "Canada", flag: "🇨🇦" },
  { code: "AU", label: "Australia", flag: "🇦🇺" },
  { code: "DE", label: "Germany", flag: "🇩🇪" },
  { code: "FR", label: "France", flag: "🇫🇷" },
  { code: "JP", label: "Japan", flag: "🇯🇵" },
  { code: "BR", label: "Brazil", flag: "🇧🇷" },
  { code: "KR", label: "South Korea", flag: "🇰🇷" },
] as const;

export const BOOK_CLUBS = [
  {
    id: "oprah",
    name: "Oprah's Book Club",
    curator: "Oprah Winfrey",
    emoji: "📖",
    count: 15,
  },
  {
    id: "billgates",
    name: "Bill Gates' Reading List",
    curator: "Bill Gates",
    emoji: "🧠",
    count: 15,
  },
  {
    id: "reese",
    name: "Reese's Book Club",
    curator: "Reese Witherspoon",
    emoji: "☀️",
    count: 15,
  },
  {
    id: "obama",
    name: "Obama's Reading List",
    curator: "Barack Obama",
    emoji: "📚",
    count: 15,
  },
  {
    id: "goodreads",
    name: "Goodreads Choice Awards",
    curator: "Goodreads Community",
    emoji: "⭐",
    count: 15,
  },
] as const;
