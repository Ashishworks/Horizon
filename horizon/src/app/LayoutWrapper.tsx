"use client";

import { usePathname } from "next/navigation";
import Footer from "./components/footer/Footer";
import Navbar from "./components/navbar/Navbar";
import { shouldHideLayout } from "./layoutConfig";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/";
  const hideLayout = shouldHideLayout(pathname);

  return (
    <>
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && <Footer />}
    </>
  );
}
