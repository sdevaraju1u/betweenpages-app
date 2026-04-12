"use client";

// Providers — client component wrapper for layout.tsx.
//
// WHY THIS FILE EXISTS:
// layout.tsx is a Server Component (no "use client" directive).
// AuthProvider uses useState/useEffect, so it's a Client Component.
// Server Components can't directly render Client Components that use hooks.
// Solution: wrap all client-side providers in one "Providers" component,
// and render <Providers> inside layout.tsx.
//
// If you add more providers later (e.g., ThemeProvider, QueryClientProvider),
// nest them here.

import { AuthProvider } from "@/lib/firebase/AuthContext";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
