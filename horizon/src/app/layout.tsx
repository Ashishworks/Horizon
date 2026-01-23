// src/app/layout.tsx
import "./globals.css";
import Footer from "./components/footer/Footer";
import Navbar from "./components/navbar/Navbar";
import { Providers } from "./providers";
import LayoutWrapper from "./LayoutWrapper";
import AIFaceAssistant from "./components/zony/AIFaceAssistant";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <LayoutWrapper>
            {children}
            <AIFaceAssistant/>
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
