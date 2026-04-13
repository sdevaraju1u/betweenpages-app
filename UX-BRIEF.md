# BetweenPages — UX Design Brief

## Product Vision
A book discovery platform that feels like Spotify for readers. Users browse curated charts, follow book clubs, and have an AI reading companion available at all times. The experience is personal — every surface reflects the user's taste in genres, languages, and literary communities.

---

## Design Direction: Solarpunk Sanctuary
- **Mood**: A digital garden. Warm, organic, slow. Encourages thoughtful exploration over doomscrolling.
- **Palette**: Parchment (#F9F6F1), Sage Green (#7D907D), Terracotta (#E2725B), Soft White (#FFFFFF), Warm Gold (#C4956A)
- **Typography**: Noto Serif (headings) + Outfit (body)
- **Shapes**: Ultra-rounded (32px+ radius), pebble-shaped chips, organic forms
- **Effects**: Soft tinted shadows, frosted glass surfaces, no harsh borders

---

## Core Principle
**Chat is always present.** It is not a page — it is a layer. It reshapes itself based on context:
- **Main view**: Full-width centered (max 800px) — for general book conversation
- **Side view**: Narrower right panel (45%) — when a book detail is open on the left

**Users must be logged in.** There is no anonymous experience. Unauthenticated users see only a login screen.

---

## Screen 1: Login Screen (Unauthenticated)

**Purpose**: Gate. Simple, inviting, no friction.

**Layout**:
- Centered content on parchment background
- App logo + name (BetweenPages)
- Tagline: "Your personal book sanctuary awaits."
- Single button: [Sign in with Google]
- Subtle decorative element (leaf, vine, or book illustration)

**Notes**:
- No navigation, no preview of content
- After sign-in, first-time users go to Onboarding; returning users go to Landing Page

---

## Screen 2: Onboarding Modal (First-time users only)

**Purpose**: Personalize the experience. Collect preferences that drive all content.

**Format**: Full-screen overlay, stepped flow with progress indicator.

### Step 1 — Genres
- Header: "What genres do you love?"
- Subtext: "Pick at least 3 — we'll curate your feed around these."
- Grid of pebble-shaped genre chips (multi-select, min 3):
  Sci-Fi, Fantasy, Mystery, Romance, Thriller, Horror, Literary Fiction,
  Historical Fiction, Non-Fiction, Biography, Self-Help, Poetry,
  Graphic Novels, Young Adult, Classics, Philosophy, Science, True Crime
- Selected state: filled Terracotta or Sage
- Unselected state: outlined, transparent

### Step 2 — Languages
- Header: "What languages do you read in?"
- Subtext: "Pick at least 1."
- Chip grid:
  English, Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali,
  Marathi, Gujarati, Spanish, French, German, Japanese, Korean,
  Portuguese, Mandarin, Arabic
- Same chip styling as genres

### Step 3 — Countries
- Header: "Which country charts do you want to follow?"
- Subtext: "See what's trending around the world."
- Chips with flag emoji:
  🇮🇳 India, 🇺🇸 USA, 🇬🇧 UK, 🇨🇦 Canada, 🇦🇺 Australia,
  🇩🇪 Germany, 🇫🇷 France, 🇯🇵 Japan, 🇧🇷 Brazil, 🇰🇷 South Korea

### Step 4 — Book Clubs
- Header: "Follow your favorite book clubs"
- Subtext: "Get recommendations from curators you trust."
- Card grid (not chips — these are richer):
  Each card shows:
  - Club avatar/logo
  - Club name (e.g., "Oprah's Book Club")
  - Curator name
  - Book count ("42 books")
  - [Follow] toggle button
- Clubs: Oprah's Book Club, Bill Gates' Reading List, NYT Bestsellers,
  Reese's Book Club, Obama's Reading List, Goodreads Choice Awards

### Final
- CTA button: "Enter the Sanctuary →"
- Saves all preferences, marks onboarding complete

---

## Screen 3: Landing Page / Discovery (Authenticated)

**Purpose**: Browse curated content. This is the "home feed."

**Layout**: Vertically scrolling page with horizontal carousels. Chat is in main view (full-width, centered) at the bottom or toggled via a floating button.

### Section A — Hero / Welcome
- Greeting: "Good morning, {firstName}." (time-aware)
- Subtext: "What are you in the mood for?"
- Mood chips (quick entry into chat): Dark Academia, Space Opera, Slow Burn, Cyberpunk, Cozy Mystery, Mind-Bending, Surprise Me
- Clicking a mood chip opens chat in main view with that prompt

### Section B — Trending Now
- Section header: "🔥 Trending Now" with "See all →" link
- Horizontal carousel of BookCardSmall components
- These are globally trending books (refreshed monthly)

### Section C — Country Charts (per followed country)
- One section per country the user follows
- Section header: "🇮🇳 Top 50 in India — April 2025" with "See all →"
- Horizontal carousel of BookCardSmall with rank badge (#1, #2, #3...)
- Refreshed monthly (weekly for NYT US list)

### Section D — Book Clubs (per followed club)
- One section per followed book club
- Section header: "📚 Oprah's Book Club" with club avatar and "See all →"
- Horizontal carousel of BookCardSmall

### Section E — Genre Recommendations (per favorite genre)
- One section per favorite genre
- Section header: "Because you love Sci-Fi" with "See all →"
- Horizontal carousel of BookCardSmall
- Books filtered by user's preferred languages

### Section F — Chat (Main View)
- Full-width centered chat at the bottom of the discovery page
- Or: a floating chat button that expands chat into main view overlay
- Welcome message: "Ask me about any book, genre, or mood."
- Input bar always visible

### BookCardSmall Component (used in all carousels)
- Compact card: cover image (aspect 2:3) + title + author
- Rounded-[20px], soft sage shadow
- Rank badge (if in a chart): Terracotta circle with white number
- On click → navigates to /book/{id} (book detail view)
- Hover: subtle lift + shadow increase

### BookCarousel Component (reusable)
- Horizontal scroll with CSS snap
- Fade edges (gradient overlay) on left and right to hint at more content
- Arrow buttons appear on hover (desktop)
- Touch-swipe friendly (mobile)
- Shows 4-5 cards at a time on desktop, 2 on mobile

---

## Screen 4: Book Detail + Contextual Chat (Split View)

**Purpose**: Deep dive into a single book. Chat scopes to this book.

**Trigger**: User clicks any BookCardSmall from any carousel or chat recommendation.

**Layout**: Split screen.
- Left panel (55%): Book detail — scrollable
- Right panel (45%): Chat — fixed, scoped to this book
- Transition: book detail slides in from left, chat narrows from full-width to side panel

### Left Panel — Book Detail

#### Back Navigation
- "← Back to Discovery" link at top
- Returns to landing page, chat goes back to main view

#### Book Cover
- Large cover image (max 300px wide), centered
- Soft shadow, rounded-[16px]
- If no cover: colored placeholder with title/author text

#### Book Metadata
- Title (Noto Serif, large, bold)
- Author name
- Star rating (aggregate) + total ratings count
- Page count · Genre tags · Language
- Published date

#### Synopsis
- Expandable/collapsible section
- First 3 lines visible, "Read more" to expand
- Fetched live from Open Library when page loads

#### Featured In
- Section header: "📋 Featured in"
- List of charts/clubs this book appears in:
  - "• Bill Gates' Reading List"
  - "• Top 50 India — April 2025"
  - "• NYT Bestseller"
- Each item is a link back to that chart/club section on the landing page

#### What Readers Say (Reviews)
- Section header: "💬 What readers say"
- Horizontal scroll or vertical stack of ReviewCard components
- Mix of ratings (show the full spectrum, not just 5-star reviews)
- Reviews are seeded via AI, supplemented with live data

#### ReviewCard Component
- Rating: star display (★★★★★ or ★☆☆☆☆)
- Headline: one-line summary in quotes ("Couldn't connect with the humor")
- Body: 2-3 sentences explaining WHY this rating
- Reviewer: name + their genre preference (e.g., "Literary Fiction Fan")
- This genre context helps users understand the perspective behind the rating
- Design: glass card, rounded-[20px], subtle left border color:
  - 4-5 stars: sage green left border
  - 1-3 stars: terracotta left border
  - This is NOT good/bad — it's a visual grouping to help scanning

#### Action Buttons
- [💾 Save to Library] — saves to user's Firestore collection
- [🛒 Purchase] — affiliate link or search link (Amazon, Bookshop.org)
- Both buttons: rounded-full, Solarpunk styled

### Right Panel — Contextual Chat

#### Context Switch
- When book detail opens, chat receives context about this book
- System prompt includes: title, author, synopsis, genres
- Chat placeholder: "Ask about {title}..."
- Initial message: "You're looking at {title} by {author}. Want to explore similar books, discuss themes, or find something in a different direction?"

#### Book Recommendations in Chat
- When AI recommends books, they appear as clickable BookCardSmall
- Clicking a recommendation navigates to /book/{newId}
- Left panel updates with new book, chat stays but context switches

#### Chat Persistence
- Chat messages persist when switching between main and side view
- When navigating to a new book, chat can optionally clear or keep history
- Input bar stays at the bottom

---

## Screen 5: My Saved Books

**Purpose**: Library of books the user has saved.

**Layout**: Grid of BookCardSmall, grouped by genre or date saved.

**Sections**:
- "Recently Saved" — chronological
- Grouped by genre (if enough books)
- Each card: cover + title + author + date saved
- Click → opens book detail (same split view)
- Remove button (X or swipe to delete)

**Empty State**: "Your library is empty. Browse the Sanctuary to find your next read."

---

## Navigation

### AppHeader (persistent, top bar)
- Left: Logo (B gradient badge) + "BetweenPages" wordmark
- Center or left-of-center: Navigation links
  - Discovery (/) — active when on landing page
  - My Books (/saved) — active when on saved page
- Right:
  - User avatar (from Google profile)
  - User first name
  - [Sign out] button (subtle, text-only)

### Book Detail Header (replaces standard nav context)
- Left: "← Back to Discovery"
- Center: "BetweenPages" (smaller)
- Right: User avatar + sign out (same as always)

---

## Responsive / Mobile Considerations

### Mobile Landing Page
- Carousels show 2 cards at a time (swipeable)
- Mood chips wrap to 2 rows
- Chat is accessed via floating button (bottom-right)

### Mobile Book Detail
- Full-screen book detail (no split)
- Chat accessed via floating button or bottom sheet
- Swipe up from bottom to reveal chat
- Swipe down to dismiss chat, return to book detail

### Mobile Onboarding
- Same stepped flow, full-screen
- Chips wrap naturally, 2-3 per row
- Book club cards stack vertically

---

## Micro-interactions & Transitions

- **Book card hover**: Lift 4px + shadow intensify (200ms ease)
- **Carousel scroll**: Snap to card edges, momentum scrolling
- **Chat view switch**: Width transition 300ms ease-in-out
- **Book detail enter**: Slide in from left (300ms)
- **Mood chip click**: Brief scale pulse (95% → 100%) before sending
- **Save button**: Heart fill animation on click
- **Review cards**: Staggered fade-in on scroll (100ms delay between cards)
- **Onboarding steps**: Slide left transition between steps
- **Genre chip select**: Background fill with slight bounce

---

## Data Architecture (for UX context)

### What's pre-loaded (Firestore — instant)
- Book cards for carousels (title, author, cover, genre)
- Chart/club lists and their book IDs
- User preferences (genres, languages, countries, clubs)
- Seeded reviews (5 per book, spanning 1-5 stars)

### What's fetched on demand (Open Library — ~500ms)
- Full book synopsis (when book detail opens)
- Page count, publish date, ISBN
- Subject tags

### What's refreshed periodically
- Weekly: NYT Bestseller list (US)
- Monthly: Country charts, trending, book club lists

---

## Key UX Principles

1. **Chat is a companion, not a destination.** It's always there, reshaping to fit the context. Users never "go to chat" — they just talk.

2. **Every rating deserves context.** A 1-star review from a romance reader on a hard sci-fi book tells you something useful. Show the WHY and the WHO.

3. **Personalization is earned, not assumed.** The onboarding asks explicitly. No dark patterns, no tracking — users tell us what they love.

4. **Browse AND converse.** Some users want to scroll carousels. Some want to type "surprise me." Both are first-class experiences.

5. **The sanctuary metaphor.** This is a calm, warm place. No notifications, no urgency, no "trending NOW!" anxiety. Books don't expire.
