# BetweenPages — Firestore Schema Design

## Architecture Diagram

![Firestore Schema Design](./schema-diagram.png)

---

## Design Principles

1. **Preferences as filters, not data** — User documents store what they care about (~300 bytes). Personalization happens at read time via queries, not pre-computation.
2. **Shared content, never duplicated** — Books, charts, and book clubs are stored once and read by everyone. Adding users doesn't multiply content docs.
3. **Atomic documents** — Each document is self-contained and small. No cross-document dependencies for reads.

---

## Collections

### `users/{uid}`

One document per authenticated user. Contains a `preferences` sub-document.

```
users/{uid}
  └── preferences
        ├── genres: ["sci-fi", "mystery", "ya"]        // user's favorite genres
        ├── languages: ["en", "hi", "ta"]              // ISO 639-1 codes
        ├── countries: ["IN", "US"]                    // ISO 3166-1 alpha-2 codes
        ├── bookClubs: ["oprah", "billgates"]          // club document IDs
        └── onboardingComplete: true
```

**Size:** ~300 bytes per user
**Scale:** 100K users = 30MB (trivial)

---

### `users/{uid}/savedBooks/{bookId}`

Sub-collection of saved/bookmarked books per user.

```
users/{uid}/savedBooks/{bookId}
  ├── bookId: "the-alchemist"
  ├── title: "The Alchemist"
  ├── author: "Paulo Coelho"
  ├── coverUrl: "https://covers.openlibrary.org/b/id/..."
  └── savedAt: 1713000000000
```

**Why denormalize title/author/coverUrl?** So the "My Saved Books" page renders without batch-fetching from `/books`. One query, instant display.

---

### `books/{bookId}`

Shared book catalog. One document per book, read by all users.

```
books/{bookId}
  ├── id: "midnight-s-children"
  ├── title: "Midnight's Children"
  ├── author: "Salman Rushdie"
  ├── coverUrl: "https://covers.openlibrary.org/b/id/..."
  ├── description: ""                          // fetched on-demand from Open Library
  ├── genres: ["literary-fiction", "magical-realism"]
  ├── languages: ["en", "hi"]
  ├── categories: ["Fiction", "India"]
  ├── pageCount: 647
  ├── publishedDate: "1981"
  ├── isbn: "0099578514"
  ├── openLibraryKey: "/works/OL2177904W"
  └── cachedAt: 1713000000000
```

**Key indexes:**
- `genres` — `array-contains` queries for "Because you love Sci-Fi" sections
- `languages` — client-side filtering by user's preferred languages

---

### `books/{bookId}/reviews/{reviewId}`

Sub-collection of reviews per book. Seeded by Gemini, supplemented by user reviews.

```
books/{bookId}/reviews/{reviewId}
  ├── id: "seeded-5"
  ├── rating: 5                                // 1-5 stars
  ├── headline: "Rewired how I think"
  ├── body: "The hard sci-fi is accessible without dumbing it down..."
  ├── reviewerName: "Sarah K."
  ├── reviewerPreference: "Sci-Fi Reader"      // gives context to the rating
  ├── source: "seeded" | "openlibrary" | "user"
  └── createdAt: 1713000000000
```

**Design choice:** Both positive AND negative reviews are shown. The `reviewerPreference` field explains WHY a reader rated the way they did.

---

### `charts/{chartId}`

Country charts and trending lists. Shared — all users who follow India see the same chart.

```
charts/{chartId}
  ├── id: "top-india"
  ├── name: "Top in India"
  ├── type: "country" | "trending" | "genre"
  ├── country: "IN"                            // ISO code (null for trending/genre)
  ├── bookIds: ["godan", "midnight-s-children", ...]
  └── updatedAt: 1713000000000
```

**Refresh schedule:**
- Weekly: NYT US bestsellers
- Monthly: Country charts, trending (regenerated via Gemini)

---

### `bookclubs/{clubId}`

Curated book lists from notable figures/organizations.

```
bookclubs/{clubId}
  ├── id: "oprah"
  ├── name: "Oprah's Book Club"
  ├── curator: "Oprah Winfrey"
  ├── description: "Oprah's curated picks spanning literary fiction, memoirs..."
  ├── avatarEmoji: "📖"
  ├── bookIds: ["the-water-dancer", "caste", ...]
  └── updatedAt: 1713000000000
```

---

## Query Patterns

### Landing page load (per user)

```
1. READ  users/{uid}                         → get preferences (1 read)
2. READ  charts/top-india, charts/top-usa    → get followed charts (N reads)
3. READ  bookclubs/oprah, bookclubs/billgates → get followed clubs (M reads)
4. BATCH books/{id} for all bookIds          → get book details (1 batch read)
5. FILTER client-side by user.languages      → 0 reads
```

**Total: ~6 Firestore reads regardless of user count.**

### "Because you love Sci-Fi" section

```
db.collection("books")
  .where("genres", "array-contains", "sci-fi")
  .limit(20)
```

Then filter by `user.languages` client-side. Same query for every sci-fi fan.

### Book detail page (on click)

```
1. READ  books/{bookId}                      → cached metadata (1 read)
2. FETCH Open Library /works/{key}.json      → full description (live, 0 reads)
3. READ  books/{bookId}/reviews/*            → seeded reviews (1 query)
```

### Save a book

```
WRITE users/{uid}/savedBooks/{bookId}        → denormalized book info (1 write)
```

---

## Scale Analysis

| Metric | 1 user | 100K users | 1M users |
|--------|--------|------------|----------|
| User docs | 1 | 100,000 | 1,000,000 |
| Book docs | 125 | 125 | 125 |
| Chart docs | 4 | 4 | 4 |
| Club docs | 5 | 5 | 5 |
| Reads per page load | ~6 | ~6 | ~6 |
| Storage (users) | 300B | 30MB | 300MB |
| Storage (books) | 125KB | 125KB | 125KB |

Books, charts, and clubs **never multiply** with users. Only user preference documents grow — linearly, at ~300 bytes each.

---

## Data Sources

| Source | Purpose | When |
|--------|---------|------|
| **Firestore** | Book cards, charts, clubs, preferences, reviews | Every page load (cached, fast) |
| **Open Library** | Full book details (synopsis, subjects) | On book card click (on-demand) |
| **Gemini** | Generate curated lists, seed reviews | Seed script (one-time + monthly refresh) |
| **NYT Books API** | US bestseller list | Weekly refresh (future) |
