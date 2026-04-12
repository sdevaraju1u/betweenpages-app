# BetweenPages — Learning Journal

> A living document. Updated every time a bite is completed.
> Read top-to-bottom the first time. After that, use the Table of Contents
> to jump to whatever you want to revise.

---

## How to use this doc

- **Progress log** — what's done, what's next. Tick boxes as we go.
- **Concepts** — organized by topic, not by the order we learned them. Each section is self-contained so you can revise one concept without reading the others.
- **Gotchas I hit** — a running list of mistakes + the lesson from each.
- **Glossary** — one-liners for every term. If a concept section uses a word you forgot, check here first.

Every section follows the same shape:

> **The idea in one sentence.**
> **Why it matters:** …
> **Example from BetweenPages:** (real code from your repo)
> **Gotchas:** …
> **Revise this if you forget:** (one-line memory trigger)

---

## Progress log

### Done
- [x] Project scaffold (`create-next-app`, Next 16, React 19, Tailwind v4, TypeScript)
- [x] Design tokens in `globals.css` via Tailwind v4 `@theme`
- [x] Root layout with `next/font/google` (Manrope + Inter)
- [x] Static split-screen layout (`page.tsx`)
- [x] Component extraction (`AppHeader`, `BooksPanel`, `ShelfItem`, `BookItem`, `ChatPanel`, `ChatMessage`, `ChatInput`)
- [x] Zod schemas for `Book` and `Shelf` at the server boundary
- [x] `"use client"` boundary on `ChatInput` with controlled input state
- [x] Firebase client SDK scaffolded (not wired to real credentials yet)

- [x] Vercel AI SDK wired end-to-end (`useChat` + `streamText` + Gemini)
- [x] System prompt + topic guardrail (prompt engineering)

### Pending (roadmap)
- [ ] Real `Book` schema (id, coverUrl, summary, collections, embedding)
- [ ] Firestore schema design + seed script
- [ ] Replace static arrays with Firestore reads in Server Components
- [ ] LLM abstraction layer at `src/lib/llm/`
- [ ] Embeddings (`text-embedding-004`) + Firestore Vector Search
- [ ] Zod-validated structured outputs from the LLM
- [ ] Inline book recommendation cards rendered from LLM output
- [ ] Book detail drawer + collection chip filtering
- [ ] Firebase Auth (Google sign-in)
- [ ] Persist conversations to Firestore
- [ ] Topic guardrail ("books only")
- [ ] Firestore Security Rules
- [ ] Responsive breakpoints + loading skeletons + error boundaries
- [ ] Dockerfile + Cloud Run deploy
- [ ] Secrets in GCP Secret Manager
- [ ] GitHub Actions CI/CD

---

## Concepts

### 1. Next.js App Router — the mental model

**Next.js is React + a file-system router + a build system that runs React on BOTH the server and the client.**

**Why it matters:** The App Router (the `src/app/` folder) decides what gets rendered where. Folders become URLs. Files inside them have special meanings (`page.tsx` = the page, `layout.tsx` = the wrapper, `route.ts` = an API endpoint, `loading.tsx` = the loading UI, `error.tsx` = the error UI). You don't configure routes — you arrange files.

**Example from BetweenPages:**

```
src/app/
├── layout.tsx          → wraps every page (fonts, <html>, <body>)
├── page.tsx            → the "/" route (the split-screen home)
├── globals.css         → Tailwind v4 + design tokens
├── Components/         → NOT a route (capitalized → ignored by the router)
│   ├── AppHeader.tsx
│   ├── BooksPanel.tsx
│   └── …
└── api/
    └── chat/
        └── route.ts    → POST /api/chat   (coming next)
```

**Gotchas:**
- Folders named with a capital letter (like `Components/`) are still real folders — the router just doesn't turn them into routes unless they contain `page.tsx` or `route.ts`. Convention, not magic.
- `layout.tsx` is NOT re-rendered when the page changes. It persists across navigations. That's why it's the right place for fonts and global chrome.

**Revise this if you forget:** *Folders = URLs. `page.tsx` = page. `route.ts` = API. `layout.tsx` = wrapper.*

---

### 2. Server vs Client Components — the boundary

**Every component in `src/app/` is a Server Component by default. Add `"use client"` at the top of a file to turn it (and everything it imports) into a Client Component.**

**Why it matters:** This is the ONE concept that confuses everyone coming from old-school React. Server Components run ONCE, on the server, and ship zero JS to the browser. Client Components run on the server (for the initial HTML) AND in the browser (for interactivity). Server Components can `await` directly. Client Components can use `useState`, `useEffect`, event handlers, and browser APIs. You cannot mix them freely — a Client Component can render a Server Component only if the Server Component was passed in as `children` or a prop.

**Example from BetweenPages:**

`src/app/page.tsx` — Server Component (no `"use client"`):
```tsx
// Runs on the server. Can read files, hit a DB, await stuff.
// Ships NO JS to the browser for this file.
const validatedShelves = shelves.map((s) => shelfSchema.parse(s));

export default function Home() {
  return <BooksPanel shelves={validatedShelves} />;
}
```

`src/app/Components/ChatInput.tsx` — Client Component:
```tsx
"use client";                       // ← the boundary marker
import { useState } from "react";

export default function ChatInput() {
  const [input, setInput] = useState("");   // needs the browser
  return <input value={input} onChange={(e) => setInput(e.target.value)} />;
}
```

**Gotchas:**
- `console.log` inside a **Server Component** appears in your **terminal** (where `npm run dev` runs).
- `console.log` inside a **Client Component** appears in the **browser DevTools Console**.
- If your log isn't showing up, you're probably looking at the wrong console.
- `"use client"` cascades: everything imported by a Client Component is also treated as client code. So you want the boundary as LOW in the tree as possible — make `ChatInput` a Client Component, NOT the whole page.
- You cannot `await` at the top level of a Client Component. No `async function` Client Components.
- You cannot pass non-serializable props (functions, class instances, Dates sometimes) from a Server Component to a Client Component. Plain JSON-ish data only.

**Revise this if you forget:** *No `"use client"` = server. The moment you need `useState`, `useEffect`, `onClick`, or `window`, you need `"use client"`.*

---

### 3. Tailwind v4 — design tokens via `@theme`

**Tailwind v4 reads design tokens from your CSS file, not a JS config. Declare CSS variables inside `@theme { … }` and they become utility classes automatically.**

**Why it matters:** In Tailwind v3 you had `tailwind.config.js`. In v4 there's no config file by default — you put everything in `globals.css`. A `--color-primary` token inside `@theme` gives you `bg-primary`, `text-primary`, `border-primary` for free. Same for fonts, spacing, etc.

**Example from BetweenPages** (`src/app/globals.css`):
```css
@import "tailwindcss";

@theme {
  --color-primary: #2b2118;        /* bg-primary, text-primary, border-primary */
  --color-secondary: #c3512f;
  --color-tertiary: #d9a441;
  --color-bg-100: #f6f0e4;
  --color-border: #e0d6c1;

  --font-sans: var(--font-inter), system-ui, sans-serif;
  --font-display: var(--font-manrope), var(--font-inter), system-ui, sans-serif;
}
```

Then in JSX:
```tsx
<h2 className="font-display text-primary bg-bg-100 border-border">
```

**Gotchas:**
- Tokens MUST be inside `@theme { … }` to become utilities. A plain `:root { --color-foo }` won't work.
- Token naming follows a pattern: `--color-<name>` → `bg-<name>`, `text-<name>`, etc. `--font-<name>` → `font-<name>`.
- `bg-bg-white` looks weird but it's because the token is literally `--color-bg-white`.

**Revise this if you forget:** *v4 = tokens in `@theme` block inside `globals.css`. No JS config.*

---

### 4. Zod — parse, don't validate

**Zod is a runtime schema library. You write a schema once, and get (a) runtime validation and (b) a TypeScript type, both from the same source of truth.**

**Why it matters:** TypeScript disappears at runtime. If your backend returns `{ title: 123 }` where your type says `title: string`, TypeScript CANNOT catch that — the type was erased during compilation. Zod runs at runtime and will throw (or return an error) the moment the shape is wrong. The pattern is called **"parse, don't validate"**: instead of checking things with if-statements, you parse data at the boundary (where it enters your app) and from that point on you can trust the type.

**Example from BetweenPages** (`src/lib/schemas/book.ts`):
```ts
import { z } from "zod";

export const bookSchema = z.object({
  title: z.string(),
  author: z.string(),
  cover: z.string(),
  rating: z.string(),
});

export const shelfSchema = z.object({
  title: z.string(),
  books: z.array(bookSchema),
});

// Derive the TS type from the schema — single source of truth:
export type Book  = z.infer<typeof bookSchema>;
export type Shelf = z.infer<typeof shelfSchema>;
```

Usage at the boundary (`src/app/page.tsx`):
```ts
// At this point `shelves` is "trusted" — guaranteed to match the shape.
const validatedShelves: Shelf[] = shelves.map((s) => shelfSchema.parse(s));
```

**`.parse()` vs `.safeParse()`:**
```ts
bookSchema.parse(data);      // throws ZodError if invalid — use when you want to crash
bookSchema.safeParse(data);  // returns { success, data } or { success, error } — use in API routes
```

**Gotchas:**
- A `ZodError` at startup means your static data doesn't match your schema. Either fix the data or loosen the schema.
- Zod does NOT replace TypeScript. Use `z.infer<typeof X>` so you have ONE definition. Never write a TS type and a Zod schema separately — they'll drift.
- `z.string()` does NOT accept `undefined`. If a field is optional, use `z.string().optional()`.

**Revise this if you forget:** *Schema at the boundary. `parse()` throws, `safeParse()` returns a result. `z.infer` gives you the type.*

---

### 5. Route Handlers — your API inside Next.js

**A Route Handler is a `route.ts` file inside `src/app/api/` that exports functions named after HTTP methods (`GET`, `POST`, `PUT`, `DELETE`). That's your API — no Express needed.**

**Why it matters:** You need a server endpoint for the LLM call. The browser can't call Gemini directly (your API key would leak). Route Handlers give you a backend endpoint that lives in the same codebase, uses the same TypeScript, and deploys to the same host. They receive a standard Web `Request` and return a standard `Response` — no framework-specific req/res.

**Example from BetweenPages** (`src/app/api/chat/route.ts`):
```ts
import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages, type UIMessage } from "ai";

export const maxDuration = 30;

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = await streamText({
    model: google("gemini-3.0-flash"),
    system: "You are BetweenPages, a warm reading companion...",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
```

**Key points:**
- The folder path IS the URL: `src/app/api/chat/route.ts` → `POST /api/chat`.
- `export async function POST(...)` — the function name determines the HTTP method.
- `request` is a standard Web `Request`. `await request.json()` parses the body. No `body-parser`, no middleware.
- The function returns a standard `Response`. `toUIMessageStreamResponse()` creates one with SSE headers for streaming.
- `export const maxDuration = 30` — tells the platform this endpoint can run up to 30 seconds (streaming LLMs need more than the default).

**Gotchas:**
- Don't put a `page.tsx` and a `route.ts` in the same folder — they conflict. A folder is either a page or an API, not both.
- Route Handlers run on the server ONLY. They never ship to the browser. Your API key is safe.
- `await request.json()` will throw if the body isn't valid JSON. In production, wrap it in try/catch or use Zod `.safeParse()`.

**Revise this if you forget:** *`route.ts` + function name = API endpoint. Web `Request` in, `Response` out. Folder path = URL.*

---

### 6. Vercel AI SDK — `useChat` + `streamText`

**The Vercel AI SDK is a TypeScript toolkit that connects a React frontend to any LLM with streaming built in. `streamText()` on the server streams tokens from the model. `useChat()` on the client consumes that stream and manages chat state.**

**Why it matters:** Without it, you'd need to: (a) manually construct SSE responses, (b) parse SSE on the client, (c) manage message history in state, (d) handle loading/error/streaming states, (e) do optimistic updates when the user sends a message. `useChat()` does all of this in one hook. And the SDK is provider-agnostic — swap `@ai-sdk/google` for `@ai-sdk/anthropic` and everything else stays the same.

**The three packages:**

| Package | Role |
|---|---|
| `ai` | Core. Exports `streamText()` (server), `convertToModelMessages()`, types. |
| `@ai-sdk/google` | Provider. Teaches `streamText` how to talk to Gemini. Reads `GOOGLE_GENERATIVE_AI_API_KEY` from env automatically. |
| `@ai-sdk/react` | Client hooks. Exports `useChat()` for chat UIs. |

**Server side** (`route.ts`):
```ts
const result = await streamText({
  model: google("gemini-3.0-flash"),
  system: "You are BetweenPages...",
  messages: await convertToModelMessages(messages),
});
return result.toUIMessageStreamResponse();
```

**Client side** (`ChatContainer.tsx`):
```tsx
"use client";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";

const { messages, sendMessage, status } = useChat();
const [input, setInput] = useState("");

// On submit:
sendMessage({ text: input });
setInput("");
```

**What `useChat()` returns:**

| Value | What it does |
|---|---|
| `messages` | Full conversation history. Updates in real-time as tokens stream in. |
| `sendMessage({ text })` | POSTs `{ messages: [...all] }` to `/api/chat`. Appends user message immediately (optimistic). |
| `status` | `"ready"` → `"submitted"` → `"streaming"` → `"ready"`. Or `"error"`. |
| `error` | The error object if the request failed. |
| `stop()` | Cancels an in-flight stream. |
| `regenerate()` | Re-asks the model for the last response. |

**Critical mental model — messages are `parts`, not strings:**
```tsx
m.parts.map((part, i) =>
  part.type === "text" ? <span key={i}>{part.text}</span> : null
)
```
A message is an array of typed parts (`text`, `tool-call`, `tool-result`, etc.). Today we only render `text` parts. Later, when the LLM returns structured book recommendations via tool calls, we'll render `tool-result` parts as book cards — in this same `.map()`.

**The conversation is stateless on the server:** every POST sends the ENTIRE history. The model has no memory between requests. `useChat` keeps the history on the client and sends it every time. This is fundamental to how chat LLMs work.

**Gotchas:**
- In AI SDK v5, `useChat` does NOT manage the input text field. You use your own `useState` for the input and call `sendMessage({ text })`. This is different from v4 where the hook managed `input` and `handleInputChange`.
- `useChat` POSTs to `/api/chat` by default. If your route is at a different path, pass `api: "/api/my-other-path"` to the hook.
- The hook must live in a `"use client"` component.

**Revise this if you forget:** *Server: `streamText()` → `toUIMessageStreamResponse()`. Client: `useChat()` → `sendMessage()`. Messages are arrays of typed `parts`, not strings.*

---

### 7. Streaming and SSE — how tokens travel

**Server-Sent Events (SSE) is a one-way HTTP streaming protocol. The server keeps the connection open and pushes `data:` lines as tokens are generated. The browser reads them as they arrive.**

**Why it matters:** Without streaming, the user stares at a blank screen for 2-5 seconds until the full response is ready. With streaming, the first token appears in ~200ms and the rest trickle in word-by-word. This is how ChatGPT, Claude, and every modern chat UI feels fast.

**How it works in BetweenPages:**

```
1. Browser sends POST /api/chat with all messages
2. Route handler calls streamText() → Gemini starts generating
3. Gemini emits tokens one at a time
4. streamText converts each token to an SSE `data:` line
5. toUIMessageStreamResponse() wraps it in an HTTP Response with:
     Content-Type: text/event-stream
     Transfer-Encoding: chunked
6. useChat() reads the stream, appends each chunk to `messages`
7. React re-renders on each chunk → the user sees text appear live
```

**You can see the raw stream** with curl:
```bash
curl -N -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"id":"1","role":"user","parts":[{"type":"text","text":"Hi"}]}]}'
```
The `-N` flag disables buffering. You'll see `data: ...` lines arrive in real-time.

**Revise this if you forget:** *SSE = server pushes `data:` lines over a kept-open HTTP connection. `streamText` produces them, `useChat` consumes them. First token in ~200ms.*

---

### 8. Prompt engineering — system prompts and guardrails

**The system prompt is a hidden instruction sent on every request that defines your AI product's identity, tone, scope, and behavior. The user never sees it. It's product design, not code.**

**Why it matters:** Two apps using the exact same model with different system prompts feel like completely different products. The system prompt is where you turn a generic LLM into YOUR assistant. Without it, the model defaults to its own personality — verbose, generic, eager to please about everything.

**The five pillars of a system prompt:**

| Pillar | What it controls | Example |
|---|---|---|
| **Identity** | Who is the model? | "You are BetweenPages, a reading companion" |
| **Personality** | What's the tone? | "Warm, slightly opinionated, concise — like a friend who reads a lot" |
| **Scope** | What topics are allowed? | "Books, authors, genres, reading habits. Not code, weather, or math." |
| **Refusal style** | How to decline off-topic? | "Redirect warmly: 'I'm all about books! Want a recommendation?'" |
| **Format** | How long/structured are responses? | "2-3 short paragraphs. At most 3 book picks." |

**Example from BetweenPages** (`src/app/api/chat/route.ts`):
```ts
system: `You are BetweenPages, a warm and slightly opinionated reading companion...

SCOPE:
- You discuss: books, authors, genres, reading habits, literary themes.
- You do NOT discuss: anything unrelated to books or reading.

REFUSAL:
- Redirect warmly in one sentence.

FORMAT:
- Keep responses to 2-3 short paragraphs.
- When recommending: at most 3 picks. Title, author, one-sentence hook.`
```

**What we learned testing it:**

| Version | Python book response | Problem |
|---|---|---|
| v1: `"helpful librarian... will not answer anything else"` | 6 books, sub-bullets, wall of text, tutorial tone | No format constraint, no personality, vague refusal |
| v2: Added all 5 pillars | 3 books, conversational, warm tone | Prompt doing its job |

**The edge case that teaches the most:** "What's the best Python programming book?" is BOTH a book question and a programming question. A naive "no programming" guardrail would refuse it. A good scope definition says "programming books are books" — the topic is the book, not the code.

**Gotchas:**
- LLMs are literal. If you don't say "be concise," they'll write essays. If you don't say "max 3 books," they'll list 10.
- The system prompt is sent on EVERY request. 200 words × 50 messages in a conversation = 10,000 extra tokens. Keep it tight.
- System prompts are not tamper-proof. A determined user can say "ignore your instructions." This is called **prompt injection**. For a book app, casual guardrails are fine. For anything handling sensitive data, you need server-side validation too.
- Test with edge cases, not just happy paths. The edge cases reveal the gaps in your prompt.

**Revise this if you forget:** *System prompt = identity + personality + scope + refusal + format. Be specific, be concise, test edge cases.*

---

### 9. Project structure — where things live

```
betweenpages-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx          Root HTML, fonts, <body>
│   │   ├── page.tsx            The "/" route (Server Component)
│   │   ├── globals.css         Tailwind + @theme tokens
│   │   ├── Components/         Shared UI components (NOT a route)
│   │   │   ├── ChatContainer.tsx  "use client" — owns useChat + input state
│   │   │   ├── ChatPanel.tsx      Server Component — header + renders ChatContainer
│   │   │   └── …
│   │   └── api/
│   │       └── chat/route.ts   POST /api/chat (streamText → Gemini)
│   └── lib/
│       ├── schemas/            Zod schemas — the boundary contracts
│       │   └── book.ts
│       ├── firebase/           Firebase client SDK setup
│       │   └── config.ts
│       └── llm/                LLM abstraction (coming)
├── .env.local                  Secrets (gitignored)
├── .env.local.example          Committed template
├── next.config.ts              Turbopack root pinned
├── tsconfig.json               Path alias: @/* → src/*
└── LEARNING.md                 This file
```

**Why `src/lib/`:** Anything that isn't a route and isn't a component goes here. Schemas, SDK setup, pure utility functions, server-only helpers. This keeps `src/app/` focused on routing and UI.

**Why the `@/` alias:** Lets you import from `@/lib/schemas/book` instead of `../../../lib/schemas/book`. Defined in `tsconfig.json` under `compilerOptions.paths`.

**Revise this if you forget:** *`app/` = routes + UI. `lib/` = everything else. `@/` = `src/`.*

---

## Gotchas I hit

A running list. When something trips you up, add it here so you don't trip on it twice.

1. **`console.log` wasn't appearing.** I was looking at the terminal, but `ChatInput` is a Client Component — its logs go to the browser DevTools Console. Lesson: server logs → terminal, client logs → browser.
2. **I thought I did the Zod exercise but I hadn't.** I wrote TS types in `src/lib/schemas/book.ts` and stopped. Types alone give you zero runtime safety — I had to come back and write the Zod schemas. Lesson: if the filename says "schema", the file should contain a schema, not just a type.
3. **Forgot `.env*.example` is caught by `.env*` in `.gitignore`.** Had to add `!.env*.example` as an exception so the template would commit.
4. **`turbopack` picked up the wrong workspace root** because of a stray lockfile in a parent directory. Fixed by pinning `turbopack.root` in `next.config.ts`.

---

## Glossary

| Term | One-line meaning |
|---|---|
| **App Router** | Next.js routing system based on `src/app/` folder structure. |
| **Server Component** | A component that runs only on the server. Default in App Router. Ships no JS. |
| **Client Component** | A component that runs in the browser. Marked with `"use client"`. Needed for `useState`, events, browser APIs. |
| **Hydration** | The process of attaching JS event handlers to server-rendered HTML in the browser. |
| **Route Handler** | A `route.ts` file that exports `GET`, `POST`, etc. — Next.js's built-in API endpoint system. |
| **RSC** | React Server Component. Same thing as "Server Component". |
| **SSR** | Server-Side Rendering. HTML is generated on the server per request. |
| **SSG** | Static Site Generation. HTML is generated at build time. |
| **SSE** | Server-Sent Events. A one-way stream from server to browser over HTTP. How LLM tokens get streamed. |
| **Zod** | A runtime schema validation library. Generates TS types from schemas via `z.infer`. |
| **Parse, don't validate** | The pattern of converting unknown data into a typed value at the boundary, then trusting the type everywhere else. |
| **Boundary** | The point where untrusted data enters your app (API response, form submit, env var). The right place to run Zod. |
| **`"use client"`** | Directive at the top of a file that marks it (and its imports) as client-side. |
| **Tailwind `@theme`** | v4 syntax for declaring design tokens inside `globals.css`, which Tailwind turns into utilities. |
| **Turbopack** | Next.js's new Rust-based bundler. Replaces Webpack. |
| **`next/font/google`** | Next.js API that downloads Google Fonts at build time and self-hosts them for zero layout shift. |
| **Vercel AI SDK** | TypeScript toolkit for building LLM-powered apps. Provider-agnostic. `streamText` (server) + `useChat` (client). |
| **`streamText()`** | Server function that calls an LLM and returns a streaming response. Lives in `route.ts`. |
| **`useChat()`** | React hook that manages chat state: messages, input, submission, streaming, errors. Lives in a Client Component. |
| **`sendMessage()`** | Function from `useChat` that sends a new user message and triggers the POST to `/api/chat`. |
| **`UIMessage`** | The AI SDK's message type. Has `id`, `role`, and `parts` (array of typed chunks like `{type:"text", text:"..."}`) |
| **`convertToModelMessages()`** | Converts `UIMessage[]` (UI format with parts/attachments) → the plain `{role, content}` format models expect. |
| **Provider** | An AI SDK adapter for a specific model vendor. `@ai-sdk/google` for Gemini, `@ai-sdk/anthropic` for Claude, etc. |
| **`maxDuration`** | Exported constant in a Route Handler that tells the platform how many seconds the endpoint can run. |
| **Optimistic update** | Updating the UI immediately (before the server confirms) to feel instant. `useChat` adds the user message to `messages` before the POST completes. |
| **System prompt** | A hidden instruction sent on every LLM request. Defines identity, tone, scope, and rules. The user never sees it. |
| **Topic guardrail** | A system prompt instruction that restricts the model to a specific subject and redirects off-topic questions. |
| **Prompt injection** | When a user tries to override the system prompt ("ignore your instructions and…"). Casual guardrails can't prevent this. |
| **Prompt engineering** | The skill of writing effective instructions for LLMs — system prompts, few-shot examples, format constraints, etc. |
