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

type BookContext = {
  title: string;
  author: string;
  description?: string;
};

type ChatContainerProps = {
  moodChips: string[];
  bookContext?: BookContext;
};

// Earthy cover colors — sage, terracotta, gold, muted olive, warm clay
const coverColors = ["#4E604F", "#9F402D", "#7A542E", "#677967", "#966C44"];


export default function ChatContainer({ moodChips, bookContext }: ChatContainerProps) {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState("");

  const isLoading = status === "submitted" || status === "streaming";

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    // Pass bookContext as extra body data with each message (second arg = ChatRequestOptions)
    sendMessage(
      { text: trimmed },
      bookContext ? { body: { bookContext } } : undefined
    );
    setInput("");
  }

  return (
    <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-10 space-y-6">
        {messages.length === 0 && !bookContext && (
          <div className="space-y-12">
            {/* Welcome — display-lg headline, tight tracking */}
            <div className="text-center py-10">
              <h1 className="font-display text-[3.5rem] font-medium leading-[1.1] tracking-[-0.02em]">
                <span className="text-gradient">Welcome to</span>
                <br />
                <span className="text-on-surface">the Sanctuary.</span>
              </h1>
              <p className="text-lg text-muted mt-4 max-w-md mx-auto">
                Tell me a genre, a mood, or pick a path below.
              </p>
            </div>

            {/* Mood chips — pebble-shaped, tonal surfaces */}
            <div className="flex flex-wrap justify-center gap-3">
              {moodChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => submit(chip)}
                  className="px-6 py-3 pebble-chip text-sm text-on-surface font-medium
                    bg-surface-container-low hover:bg-surface-container
                    active:scale-[0.98] transition-all duration-200"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Book-scoped empty state */}
        {messages.length === 0 && bookContext && (
          <div className="space-y-8 animate-fade-up">
            <div className="text-center py-8">
              <p className="text-sm text-muted uppercase tracking-[2px] font-medium">
                Discussing
              </p>
              <h2 className="font-display text-2xl font-medium text-on-surface mt-2 tracking-[-0.01em]">
                {bookContext.title}
              </h2>
              <p className="text-muted mt-1">{bookContext.author}</p>
            </div>

            {/* Contextual quick prompts */}
            <div className="flex flex-wrap justify-center gap-2.5">
              {[
                "What is this book about?",
                "Who should read this?",
                "Similar books?",
                "Key themes",
                "Is it worth reading?",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => submit(prompt)}
                  className="px-5 py-2.5 rounded-full text-sm text-on-surface-variant font-medium
                    bg-surface-container-low hover:bg-surface-container
                    active:scale-[0.98] transition-all duration-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Render messages with tool results as BookCards */}
        {messages.map((m) => (
          <div key={m.id} className="space-y-4">
            {m.parts.map((part, i) => {
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
              if (
                part.type === "tool-recommendBooks" &&
                "state" in part &&
                (part as { state: string }).state === "output-available"
              ) {
                const { books } = (part as { output: { books: BookResult[] } }).output;
                if (!books || books.length === 0) return null;
                return (
                  <div key={i} className="flex flex-wrap gap-6 justify-center">
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
            <div className="flex items-center gap-3 pl-2">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-tertiary animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-secondary animate-bounce [animation-delay:300ms]" />
              </div>
              <p className="text-sm text-muted">
                Finding your next obsession…
              </p>
            </div>
          )}
      </div>

      {/* Input — translucent glass bar, fixed bottom feel */}
      <div className="px-6 pb-6 pt-3 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="flex items-center gap-3 glass rounded-full px-5 py-2 glow-input transition-all duration-300"
        >
          <input
            type="text"
            placeholder={bookContext ? `Ask about ${bookContext.title}…` : "Ask about a book, a mood, an author…"}
            className="flex-1 bg-transparent text-[15px] text-on-surface placeholder:text-muted focus:outline-none font-display"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 rounded-full gradient-brand text-on-primary flex items-center justify-center
              shadow-ambient hover:shadow-ambient-hover hover:scale-[1.02]
              active:scale-[0.98] active:shadow-none
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
