"use client";

// BookContext — shares the currently-viewed book between BookDetailContent and ChatPanel.
// When a user opens /book/:id, BookDetailContent sets the book context.
// MainShell reads it and passes it to ChatPanel for scoped system prompts.

import { createContext, useContext, useState, type ReactNode } from "react";

type BookContextValue = {
  title: string;
  author: string;
  description?: string;
};

type BookContextState = {
  currentBook: BookContextValue | null;
  setCurrentBook: (book: BookContextValue | null) => void;
};

const BookCtx = createContext<BookContextState | null>(null);

export function BookContextProvider({ children }: { children: ReactNode }) {
  const [currentBook, setCurrentBook] = useState<BookContextValue | null>(null);

  return (
    <BookCtx.Provider value={{ currentBook, setCurrentBook }}>
      {children}
    </BookCtx.Provider>
  );
}

export function useBookContext() {
  const ctx = useContext(BookCtx);
  if (!ctx) throw new Error("useBookContext must be inside BookContextProvider");
  return ctx;
}
