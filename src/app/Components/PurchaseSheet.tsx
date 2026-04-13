"use client";

// PurchaseSheet — bottom sheet showing multiple retailers to buy a book.
// Uses ISBN or title to build affiliate links.
// Affiliate tags can be added via env vars once accounts are set up.

import { useState } from "react";

type PurchaseSheetProps = {
  title: string;
  author: string;
  isbn: string | null;
  onClose: () => void;
};

// Affiliate tags — set these in .env.local once you have accounts:
//   NEXT_PUBLIC_AMAZON_IN_TAG=betweenpages-21
//   NEXT_PUBLIC_AMAZON_COM_TAG=betweenpages-20
//   NEXT_PUBLIC_BOOKSHOP_ID=12345
//   NEXT_PUBLIC_FLIPKART_ID=yourid
const AMAZON_IN_TAG = process.env.NEXT_PUBLIC_AMAZON_IN_TAG || "";
const AMAZON_COM_TAG = process.env.NEXT_PUBLIC_AMAZON_COM_TAG || "";
const BOOKSHOP_ID = process.env.NEXT_PUBLIC_BOOKSHOP_ID || "";
const FLIPKART_ID = process.env.NEXT_PUBLIC_FLIPKART_ID || "";

type Retailer = {
  name: string;
  icon: string;
  description: string;
  getUrl: (title: string, author: string, isbn: string | null) => string;
};

const retailers: Retailer[] = [
  {
    name: "Amazon India",
    icon: "🇮🇳",
    description: "Fast delivery across India",
    getUrl: (title, _author, isbn) => {
      const searchQuery = isbn || title;
      const tag = AMAZON_IN_TAG ? `&tag=${AMAZON_IN_TAG}` : "";
      return `https://www.amazon.in/s?k=${encodeURIComponent(searchQuery)}&i=stripbooks${tag}`;
    },
  },
  {
    name: "Amazon US",
    icon: "🇺🇸",
    description: "Kindle & paperback editions",
    getUrl: (title, _author, isbn) => {
      const searchQuery = isbn || title;
      const tag = AMAZON_COM_TAG ? `&tag=${AMAZON_COM_TAG}` : "";
      return `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}&i=stripbooks${tag}`;
    },
  },
  {
    name: "Bookshop.org",
    icon: "📚",
    description: "Supports independent bookstores",
    getUrl: (title, author, _isbn) => {
      const aff = BOOKSHOP_ID ? `?a_aid=${BOOKSHOP_ID}` : "";
      return `https://bookshop.org/search?keywords=${encodeURIComponent(`${title} ${author}`)}${aff}`;
    },
  },
  {
    name: "Flipkart",
    icon: "🛒",
    description: "Popular in India",
    getUrl: (title, _author, _isbn) => {
      const aff = FLIPKART_ID ? `&affid=${FLIPKART_ID}` : "";
      return `https://www.flipkart.com/search?q=${encodeURIComponent(title)}&otracker=search&as=on&as-show=on&marketplace=FLIPKART${aff}`;
    },
  },
];

export default function PurchaseSheet({
  title,
  author,
  isbn,
  onClose,
}: PurchaseSheetProps) {
  const [exiting, setExiting] = useState(false);

  function close() {
    setExiting(true);
    setTimeout(onClose, 300);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"
        onClick={close}
      />

      {/* Sheet */}
      <div
        className={`relative w-full max-w-lg mx-4 mb-4 bg-surface-container-lowest rounded-3xl
          shadow-[0_-8px_40px_rgba(15,31,18,0.12)] overflow-hidden
          transition-all duration-300
          ${exiting ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"}`}
        style={{
          animation: exiting
            ? undefined
            : "sheetUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-surface-container-highest" />
        </div>

        {/* Header */}
        <div className="px-6 pt-3 pb-4">
          <h3 className="font-display text-lg font-medium text-on-surface">
            Purchase
          </h3>
          <p className="text-sm text-muted mt-0.5">
            {title} by {author}
          </p>
        </div>

        {/* Retailers */}
        <div className="px-4 pb-6 space-y-2">
          {retailers.map((retailer) => (
            <a
              key={retailer.name}
              href={retailer.getUrl(title, author, isbn)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 px-4 py-4 rounded-2xl
                hover:bg-surface-container-low active:scale-[0.99]
                transition-all duration-200 group"
            >
              <span className="text-2xl">{retailer.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
                  {retailer.name}
                </p>
                <p className="text-xs text-muted">{retailer.description}</p>
              </div>
              <svg
                className="w-4 h-4 text-muted group-hover:text-primary group-hover:translate-x-0.5
                  transition-all duration-200"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
          ))}
        </div>

        {/* Footer note */}
        <div className="px-6 pb-5">
          <p className="text-xs text-muted/60 text-center">
            You&apos;ll be redirected to the retailer&apos;s website to complete your purchase.
          </p>
        </div>
      </div>
    </div>
  );
}
