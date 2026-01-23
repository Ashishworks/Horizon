// src/app/layout.tsx
import "./globals.css";
import { Providers } from "./providers";
import LayoutWrapper from "./LayoutWrapper";
import AIFaceAssistantClient from "./components/zony/AIFaceAssistantClient";

export const metadata = {
  title: {
    default: "Horizon",
    template: "%s | Horizon",
  },
  description: "Horizon helps you track mood & journal insights.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {/* ✅ Keep assistant OUTSIDE layout wrapper to avoid hydration mismatch */}
          <AIFaceAssistantClient />

          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
