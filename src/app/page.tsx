/*
  BetweenPages — main split-layout shell.
  Left (57%): searchable shelves + collection chips.
  Right (43%): chat with the reading companion.

  All content here is STATIC placeholder data. No fetching, no state, no
  auth — that's wired up in later steps. This file is intentionally a
  single Server Component so you can see the whole layout in one place
  before we extract pieces into smaller components.
*/

const collections = [
  "Oprah's Book Club",
  "Gates Notes",
  "NY Times Bestsellers",
  "Pulitzer Winners",
  "Booker Prize",
  "BookTok Viral",
  "Reese's Picks",
  "Obama's Favorites",
  "Indie Next List",
  "National Book Award",
  "Hugo Winners",
  "Goodreads Choice",
];

type Book = {
  title: string;
  author: string;
  cover: string; // background color stand-in until real covers land
  rating: string;
};

type Shelf = { title: string; books: Book[] };

const shelves: Shelf[] = [
  {
    title: "Trending Now",
    books: [
      { title: "The Heaven & Earth Grocery Store", author: "James McBride", cover: "#c3512f", rating: "4.6" },
      { title: "Tomorrow, and Tomorrow, and Tomorrow", author: "Gabrielle Zevin", cover: "#2b2118", rating: "4.4" },
      { title: "Fourth Wing", author: "Rebecca Yarros", cover: "#d9a441", rating: "4.7" },
      { title: "Lessons in Chemistry", author: "Bonnie Garmus", cover: "#4a4038", rating: "4.5" },
      { title: "Demon Copperhead", author: "Barbara Kingsolver", cover: "#8a7e72", rating: "4.5" },
    ],
  },
  {
    title: "Oprah's Book Club",
    books: [
      { title: "Wellness", author: "Nathan Hill", cover: "#2b2118", rating: "4.2" },
      { title: "The Many Lives of Mama Love", author: "Lara Love Hardin", cover: "#c3512f", rating: "4.6" },
      { title: "Let Us Descend", author: "Jesmyn Ward", cover: "#d9a441", rating: "4.3" },
      { title: "The Covenant of Water", author: "Abraham Verghese", cover: "#4a4038", rating: "4.5" },
      { title: "Hello Beautiful", author: "Ann Napolitano", cover: "#8a7e72", rating: "4.4" },
    ],
  },
  {
    title: "Gates Notes Picks",
    books: [
      { title: "The Song of the Cell", author: "Siddhartha Mukherjee", cover: "#d9a441", rating: "4.6" },
      { title: "Invention and Innovation", author: "Vaclav Smil", cover: "#2b2118", rating: "4.1" },
      { title: "How the World Really Works", author: "Vaclav Smil", cover: "#c3512f", rating: "4.3" },
      { title: "Mendeleyev's Dream", author: "Paul Strathern", cover: "#4a4038", rating: "4.2" },
      { title: "The Coming Wave", author: "Mustafa Suleyman", cover: "#8a7e72", rating: "4.4" },
    ],
  },
  {
    title: "BookTok Viral",
    books: [
      { title: "It Ends with Us", author: "Colleen Hoover", cover: "#c3512f", rating: "4.5" },
      { title: "A Court of Thorns and Roses", author: "Sarah J. Maas", cover: "#2b2118", rating: "4.7" },
      { title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", cover: "#d9a441", rating: "4.8" },
      { title: "The Love Hypothesis", author: "Ali Hazelwood", cover: "#4a4038", rating: "4.4" },
      { title: "Icebreaker", author: "Hannah Grace", cover: "#8a7e72", rating: "4.3" },
    ],
  },
];

const moodChips = [
  "I want something cozy",
  "Surprise me",
  "Heavy non-fiction",
  "Under 300 pages",
  "Made me cry",
];

export default function Home() {
  return (
    // h-screen + overflow-hidden = the page itself never scrolls.
    // Inner panels own their own scroll.
    <div className="h-screen flex flex-col overflow-hidden bg-bg-100 text-neutral">
      {/* ───────── Header ───────── */}
      <header className="flex items-center justify-between h-16 px-6 bg-primary text-bg-white shrink-0 border-b border-black/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center font-display font-bold text-bg-white">
            B
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            BetweenPages
          </span>
        </div>

        <nav className="flex items-center gap-6 text-sm">
          <a className="text-bg-white font-medium border-b-2 border-tertiary pb-1" href="#">
            Discover
          </a>
          <a className="text-bg-white/70 hover:text-bg-white" href="#">
            My Shelf
          </a>
          <a className="text-bg-white/70 hover:text-bg-white" href="#">
            Reading List
          </a>
          <button className="ml-2 px-4 py-2 rounded-md bg-secondary hover:bg-secondary/90 text-bg-white text-sm font-medium">
            Sign in with Google
          </button>
        </nav>
      </header>

      {/* ───────── Split body ───────── */}
      {/* flex-1 + min-h-0 is the magic that lets children (which are themselves
          flex columns) scroll independently instead of overflowing the page. */}
      <div className="flex-1 flex min-h-0">
        {/* ========== LEFT: Books panel (57%) ========== */}
        <section className="w-[57%] flex flex-col min-h-0 border-r border-border bg-bg-100">
          {/* Search + chips — fixed, don't scroll */}
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

          {/* Shelves — this is the scroller */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-8">
            {shelves.map((shelf) => (
              <div key={shelf.title}>
                <div className="flex items-baseline justify-between mb-3">
                  <h2 className="font-display text-lg font-semibold text-primary">
                    {shelf.title}
                  </h2>
                  <a className="text-xs text-secondary hover:underline" href="#">
                    See all
                  </a>
                </div>

                <div className="grid grid-cols-5 gap-4">
                  {shelf.books.map((book) => (
                    <article key={book.title} className="group cursor-pointer">
                      <div
                        className="aspect-[2/3] rounded-md shadow-sm group-hover:shadow-md transition-shadow"
                        style={{ backgroundColor: book.cover }}
                      />
                      <h3 className="mt-2 text-sm font-medium text-primary line-clamp-2 leading-snug">
                        {book.title}
                      </h3>
                      <p className="text-xs text-muted line-clamp-1">
                        {book.author}
                      </p>
                      <p className="text-xs text-tertiary font-medium mt-0.5">
                        ★ {book.rating}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========== RIGHT: Chat panel (43%) ========== */}
        <section className="w-[43%] flex flex-col min-h-0 bg-bg-white">
          {/* Chat header */}
          <div className="px-6 h-14 flex items-center justify-between border-b border-border shrink-0">
            <div>
              <h2 className="font-display text-base font-semibold text-primary">
                Reading Companion
              </h2>
              <p className="text-xs text-muted">
                Ask me about books, moods, or what to read next.
              </p>
            </div>
            <button className="text-xs text-muted hover:text-primary">
              New chat
            </button>
          </div>

          {/* Messages — the scroller */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* Welcome card */}
            <div className="bg-bg-100 border border-border rounded-lg p-4">
              <p className="text-sm text-primary font-medium">
                Hi — I&apos;m BetweenPages.
              </p>
              <p className="text-sm text-neutral mt-1">
                Tell me what you&apos;re in the mood for, or pick a starter:
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {moodChips.map((chip) => (
                  <button
                    key={chip}
                    className="px-3 py-1 rounded-full bg-bg-white border border-border text-xs text-neutral hover:bg-tertiary/20"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* User message */}
            <div className="flex justify-end">
              <div className="max-w-[85%] bg-primary text-bg-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm">
                I just finished Lessons in Chemistry and I want something with
                the same energy.
              </div>
            </div>

            {/* Assistant message */}
            <div className="flex">
              <div className="max-w-[90%] text-sm text-neutral space-y-3">
                <p>
                  Great taste. If you loved the sharp, wry female lead and the
                  mid-century setting, try these three:
                </p>

                {/* Inline book reference card */}
                <div className="flex gap-3 p-3 bg-bg-100 border border-border rounded-lg hover:border-secondary cursor-pointer">
                  <div className="w-12 h-16 rounded bg-secondary shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-primary text-sm truncate">
                      The Sweetness at the Bottom of the Pie
                    </p>
                    <p className="text-xs text-muted">Alan Bradley</p>
                    <p className="text-xs text-tertiary mt-0.5">★ 4.3</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-bg-100 border border-border rounded-lg hover:border-secondary cursor-pointer">
                  <div className="w-12 h-16 rounded bg-tertiary shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-primary text-sm truncate">
                      Hamnet
                    </p>
                    <p className="text-xs text-muted">Maggie O&apos;Farrell</p>
                    <p className="text-xs text-tertiary mt-0.5">★ 4.4</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-bg-100 border border-border rounded-lg hover:border-secondary cursor-pointer">
                  <div className="w-12 h-16 rounded bg-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-primary text-sm truncate">
                      The Personal Librarian
                    </p>
                    <p className="text-xs text-muted">Marie Benedict</p>
                    <p className="text-xs text-tertiary mt-0.5">★ 4.3</p>
                  </div>
                </div>

                <p className="text-xs text-muted">
                  Want me to narrow by length, mood, or time period?
                </p>
              </div>
            </div>
          </div>

          {/* Input bar — pinned bottom */}
          <div className="border-t border-border p-4 shrink-0 bg-bg-white">
            <div className="flex items-center gap-2 bg-bg-100 border border-border rounded-lg px-3 py-2 focus-within:border-secondary">
              <input
                type="text"
                placeholder="Ask about a book, a mood, an author…"
                className="flex-1 bg-transparent text-sm text-neutral placeholder:text-muted focus:outline-none"
              />
              <button className="w-8 h-8 rounded-md bg-secondary hover:bg-secondary/90 text-bg-white flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <p className="text-[11px] text-muted text-center mt-2">
              BetweenPages only discusses books. Off-topic questions will be
              politely redirected.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
