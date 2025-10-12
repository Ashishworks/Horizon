"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js"; // ✅ import User type

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null); // ✅ typed properly
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    setMounted(true);

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ ignore supabase.auth in deps safely

  if (!mounted) return null;

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-50 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Mobile Hamburger + Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex flex-col justify-between w-6 h-5 focus:outline-none"
            >
              <span className="block h-0.5 w-full bg-black rounded"></span>
              <span className="block h-0.5 w-full bg-black rounded"></span>
              <span className="block h-0.5 w-full bg-black rounded"></span>
            </button>

            <Link href="/">
              <span className="text-xl font-bold cursor-pointer">Horizon</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${pathname === link.href ? "font-bold" : "font-normal"}`}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <button
                onClick={handleLogout}
                className="ml-4 text-red-600 font-semibold hover:text-red-800"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Side Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex justify-between items-center px-4 py-4 border-b">
          <span className="text-xl font-bold">Menu</span>
          <button onClick={() => setMobileOpen(false)} className="text-gray-800 font-bold">
            X
          </button>
        </div>

        <div className="flex flex-col mt-4 space-y-4 px-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${pathname === link.href ? "font-bold" : "font-normal"}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {user && (
            <button
              onClick={() => {
                handleLogout();
                setMobileOpen(false);
              }}
              className="text-left text-red-600 font-semibold hover:text-red-800"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}
    </nav>
  );
}
