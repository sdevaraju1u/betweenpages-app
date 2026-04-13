"use client";

// Providers — client component wrapper for layout.tsx.
// Nests all client-side providers: React Query, Auth, BookContext.

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/lib/firebase/AuthContext";
import { BookContextProvider } from "@/lib/context/BookContext";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  // Create QueryClient once per component lifetime (not on every render)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BookContextProvider>{children}</BookContextProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
