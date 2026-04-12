import type { Metadata } from "next";
import { Noto_Serif, Outfit } from "next/font/google";
import Providers from "./Providers";
import "./globals.css";

// Noto Serif = display font (headings, logo). Warm, literary, organic.
// Outfit = body font (paragraphs, UI text). Geometric, soft, highly legible.
const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BetweenPages",
  description: "A reading companion that actually knows your next book.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${notoSerif.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
