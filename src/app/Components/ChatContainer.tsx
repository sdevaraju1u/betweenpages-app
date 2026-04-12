"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import ChatMessage from "./ChatMessage";
import BookCard from "./BookCard";
type BookResult = {
  title: string;
  author: string;
  goodreadsRating: string | number;
  matchScore: string | number;
  testimony: string;
  testimonyAuthor: string;
  testimonyCredential: string;
  coverUrl?: string | null;
};

type ChatContainerProps = {
  moodChips: string[];
};

// Rotating earthy cover colors for recommended books (fallback when no image)
const coverColors = ["#7D907D", "#E2725B", "#C4956A", "#8BA58B", "#D4926D"];

/* Demo book cards shown in the welcome state */
const featuredBooks = [
  {
    title: "Neuromancer",
    author: "William Gibson",
    coverColor: "#7D907D",
    goodreadsRating: "3.9",
    matchScore: "97",
    testimony:
      "The book that invented cyberpunk. Still feels like it was written tomorrow.",
    testimonyAuthor: "Neil Gaiman",
    testimonyCredential: "Author",
  },
  {
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    coverColor: "#E2725B",
    goodreadsRating: "3.8",
    matchScore: "94",
    testimony:
      "Ishiguro at his most moving. A quiet masterpiece about what it means to love.",
    testimonyAuthor: "Parul Sehgal",
    testimonyCredential: "The New York Times",
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    coverColor: "#C4956A",
    goodreadsRating: "4.5",
    matchScore: "92",
    testimony:
      "I stayed up until 3 AM. Couldn't stop. Best sci-fi I've read in years.",
    testimonyAuthor: "Sarah K.",
    testimonyCredential: "Goodreads Reviewer ★★★★★",
  },
];

export default function ChatContainer({ moodChips }: ChatContainerProps) {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState("");

  const isLoading = status === "submitted" || status === "streaming";

  console.log(messages)

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  return (
    <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
        {messages.length === 0 && (
          <div className="space-y-10">
            {/* Welcome */}
            <div className="text-center py-8">
              <h1 className="font-display text-5xl font-medium">
                <span className="text-gradient">Welcome to</span>
                <span className="text-text"> the Sanctuary.</span>
              </h1>
              <p className="text-base text-muted mt-3">
                Tell me a genre, a mood, or pick a path below.
              </p>
            </div>

            {/* Mood chips */}
            <div className="flex flex-wrap justify-center gap-3">
              {moodChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => submit(chip)}
                  className="px-5 py-2.5 rounded-[100px] glass text-sm text-text font-medium
                    hover:-translate-y-1 hover:border-primary/40 hover:shadow-neon-pink
                    active:scale-95 transition-all duration-200"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Staff picks divider */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex-1 border-t border-black/[0.06]" />
              <span className="text-xs text-muted uppercase tracking-[3px] font-display font-semibold">
                Staff picks
              </span>
              <div className="flex-1 border-t border-black/[0.06]" />
            </div>

            {/* Demo book cards */}
            <div className="flex flex-wrap gap-4 justify-center">
              {featuredBooks.map((book) => (
                <BookCard key={book.title} {...book} />
              ))}
            </div>
          </div>
        )}

        {/* Render messages with tool results as BookCards */}
        {messages.map((m) => (
          <div key={m.id} className="space-y-4">
            {m.parts.map((part, i) => {
              // Regular text → ChatMessage bubble
              if (part.type === "text" && part.text.trim()) {
                return (
                  <ChatMessage
                    key={i}
                    role={m.role as "user" | "assistant"}
                  >
                    <span>{part.text}</span>
                  </ChatMessage>
                );
              }

              // Tool invocation → BookCards
              // AI SDK v6 without typed tools: part.type is "dynamic-tool"
              // Tool name is in part.toolName, state is "output-available"
              if (
                part.type === "tool-recommendBooks" &&
                "state" in part &&
                (part as { state: string }).state === "output-available"
              ) {
                const { books } = (part as { output: { books: BookResult[] } }).output;
                if (!books || books.length === 0) return null;
                return (
                  <div key={i} className="flex flex-wrap gap-4 justify-center">
                    {books.map((book, j) => (
                      <BookCard
                        key={`${book.title}-${j}`}
                        title={book.title}
                        author={book.author}
                        coverColor={coverColors[j % coverColors.length]}
                        coverUrl={book.coverUrl}
                        goodreadsRating={String(book.goodreadsRating)}
                        matchScore={String(book.matchScore)}
                        testimony={book.testimony}
                        testimonyAuthor={book.testimonyAuthor}
                        testimonyCredential={book.testimonyCredential}
                      />
                    ))}
                  </div>
                );
              }

              return null;
            })}
          </div>
        ))}

        {isLoading &&
          messages[messages.length - 1]?.role === "user" && (
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-purple animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:300ms]" />
              </div>
              <p className="text-sm text-muted">
                Finding your next obsession…
              </p>
            </div>
          )}
      </div>

      {/* Input */}
      <div className="px-6 pb-6 pt-3 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="flex items-center gap-3 glass rounded-[100px] px-5 py-2 glow-input transition-all duration-300"
        >
          <input
            type="text"
            placeholder="Ask about a book, a mood, an author…"
            className="flex-1 bg-transparent text-[15px] text-text placeholder:text-muted focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 rounded-full gradient-brand text-white flex items-center justify-center
              shadow-neon-pink hover:shadow-neon-pink-hover hover:scale-105
              disabled:opacity-30 transition-all duration-200"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>
        </form>
        <p className="text-xs text-muted/60 text-center mt-3">
          BetweenPages only discusses books. Off-topic questions will be
          politely redirected.
        </p>
      </div>
    </>
  );
}
