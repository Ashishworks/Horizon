"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { usePathname } from "next/navigation";
import "./globals.css";
import Footer from "./components/footer/Footer";
import Navbar from "./components/navbar/Navbar";
import { shouldHideLayout } from "./layoutConfig";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient();
  const pathname = usePathname() || "/"; // fallback to "/" if null
  const hideLayout = shouldHideLayout(pathname);

  return (
    <html lang="en">
      <body>
        <SessionContextProvider supabaseClient={supabase}>
          {!hideLayout && <Navbar />}
          {children}
          {!hideLayout && <Footer />}
        </SessionContextProvider>
      </body>
    </html>
  );
}
