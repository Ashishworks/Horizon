// app/layout.tsx
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { usePathname } from "next/navigation";
import "./globals.css";
import Footer from "./components/footer/Footer";
import Navbar from "./components/navbar/Navbar";
import { shouldHideLayout } from "./layoutConfig";
import { Providers } from "./providers"; // <-- 1. Import your new provider

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient();
  const pathname = usePathname() || "/"; // fallback to "/" if null
  const hideLayout = shouldHideLayout(pathname);

  return (
    // 2. Add suppressHydrationWarning
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* 3. Wrap everything in your Providers for dark mode */}
        <Providers>
          <SessionContextProvider supabaseClient={supabase}>
            {!hideLayout && <Navbar />}
            {children}
            {!hideLayout && <Footer />}
          </SessionContextProvider>
        </Providers>
      </body>
    </html>
  );
}