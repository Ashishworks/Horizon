"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { User as UserIcon, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import PageTransition from "../pagetransitions/PageTransition";

// ... (interface, state, hooks, and functions remain the same) ...
interface Profile {
  id: string;
  name?: string;
  avatar_url?: string | null;
  email?: string;
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const user = useUser();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetches profile when the user object changes
  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!error && profileData) {
          setProfile(profileData as Profile);
        }
      };

      fetchUserProfile();
    } else {
      setProfile(null); // Clear profile if user logs out
    }
  }, [user, supabase]);

  // Listen for profile updates (e.g., from a profile edit page)
  useEffect(() => {
    const handleProfileUpdate = async () => {
      if (!user) return;
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error && profileData) setProfile(profileData as Profile);
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, [user, supabase]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const navLinks = [
    { label: "Home", href: "/dashboard" },
    { label: "Reflect", href: "/journal/new" },
    { label: "Calendar", href: "/journal/calendar" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // --- Theme Toggle Component ---
  const ThemeToggle = () => {
    if (!mounted) return null; // Don't render on server

    return (
      <div className="border-t border-border">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setTheme(theme === "dark" ? "light" : "dark");
          }}
          className="w-full flex justify-between items-center px-4 py-2 text-foreground hover:bg-accent transition"
        >
          <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    );
  };

  // --- Avatar Component ---
  const Avatar = () =>
    profile?.avatar_url ? (
      <div className="w-8 h-8 rounded-full overflow-hidden">
        <Image
          src={profile.avatar_url || "/default-avatar.png"}
          alt="Avatar"
          width={32}
          height={32}
          className="object-cover w-full h-full"
        />
      </div>
    ) : (
      <UserIcon className="w-6 h-6 text-muted-foreground" />
    );

  return (
    //
    // --- 💡 MODIFIED LINE HERE ---
    // Added `border-b border-border` to create a visible separator line
    //
    <nav className="bg-background shadow-md dark:shadow-white/10 border-b border-border fixed w-full z-50 text-foreground">
      
      {/* ... (rest of the component is identical) ... */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center relative">
          {/* Mobile Hamburger + Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex flex-col justify-between w-6 h-5 focus:outline-none"
            >
              <span className="block h-0.5 w-full bg-foreground rounded"></span>
              <span className="block h-0.5 w-full bg-foreground rounded"></span>
              <span className="block h-0.5 w-full bg-foreground rounded"></span>
            </button>
            <PageTransition targetUrl="/" circleColor="rgba(0, 0, 0, 0.18)" blurIntensity={5} duration = {1000}>
              <span className="text-xl font-bold cursor-pointer">Horizon</span>
            </PageTransition>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center space-x-6 relative">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${
                  pathname === link.href
                    ? "font-bold text-primary" // Active link
                    : "font-normal text-foreground" // Inactive link
                } hover:text-primary transition`}
              >
                {link.label}
              </Link>
            ))}

            {/* Desktop profile dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen((prev) => !prev);
                  }}
                  className="ml-4 p-1 rounded-full hover:bg-accent transition"
                >
                  <Avatar />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-md border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 bg-muted text-muted-foreground font-semibold">
                      {profile?.name || "User"}
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-foreground hover:bg-accent transition"
                    >
                      Profile
                    </Link>

                    <ThemeToggle />

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-destructive hover:bg-accent transition border-t border-border"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile profile button */}
          {user && (
            <div className="absolute right-4 top-4 md:hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen((prev) => !prev);
                }}
                className="p-1 rounded-full hover:bg-accent transition"
              >
                <Avatar />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white/5 backdrop-blur-md
 border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-muted text-muted-foreground font-semibold">
                    {profile?.name || "User"}
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-foreground hover:bg-accent transition"
                  >
                    Profile
                  </Link>

                  <ThemeToggle />

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-destructive hover:bg-accent transition border-t border-border"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Side Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-background shadow-lg transform transition-transform duration-300 z-50
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex justify-between items-center px-4 py-4 border-b border-border">
          <span className="text-xl font-bold">Menu</span>
          <button onClick={() => setMobileOpen(false)} className="text-foreground font-bold">
            X
          </button>
        </div>

        <div className="flex flex-col mt-4 space-y-4 px-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${
                pathname === link.href
                  ? "font-bold text-primary" // Active link
                  : "font-normal text-foreground" // Inactive link
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
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