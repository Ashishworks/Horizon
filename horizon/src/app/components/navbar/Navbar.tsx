"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { User as UserIcon, Moon, Sun, FileText } from "lucide-react";
import { useTheme } from "next-themes";
import PageTransition from "../pagetransitions/PageTransition";
import { createClient } from "@/lib/supabase/client";
import AmbientAudioToggle from "../ui/AmbientAudioToggle";


interface Profile {
  id: string;
  name?: string;
  avatar_url?: string | null;
  email?: string;
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mounted, setMounted] = useState(false);

  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Track the last fetched ID to prevent redundant network calls
  const lastFetchedId = useRef<string | null>(null);

  useEffect(() => setMounted(true), []);

  // ✅ 1. Profile Fetcher with Retry Logic
  const getProfile = useCallback(async (userId: string, retries = 3) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      // If profile row isn't found (common right after signup), retry 3 times
      if (retries > 0) {
        setTimeout(() => getProfile(userId, retries - 1), 1000);
      }
      return;
    }

    setProfile(data as Profile);
    lastFetchedId.current = userId;
  }, [supabase]);

  // ✅ 2. Integrated Auth Listener
  useEffect(() => {
    // Initial Check
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        getProfile(session.user.id);
      }
    };
    checkUser();

    // Listen for Auth Events
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser && lastFetchedId.current !== currentUser.id) {
        getProfile(currentUser.id);
      }

      if (event === "SIGNED_OUT") {
        setProfile(null);
        lastFetchedId.current = null;
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, getProfile]);
  useEffect(() => {
    const syncUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        if (lastFetchedId.current !== session.user.id) {
          getProfile(session.user.id);
        }
      } else {
        setUser(null);
        setProfile(null);
        lastFetchedId.current = null;
      }
    };

    syncUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser && lastFetchedId.current !== currentUser.id) {
          getProfile(currentUser.id);
        }

        if (!currentUser) {
          setProfile(null);
          lastFetchedId.current = null;
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, getProfile, pathname]); // 👈 THIS is the key


  // ✅ 3. Listen for Custom Profile Updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      if (user?.id) getProfile(user.id);
    };
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, [user, getProfile]);

  // ✅ 4. Outside Click Handler for Dropdown
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
    setDropdownOpen(false);
    router.push("/");
  };

  const ThemeToggle = () => {
    if (!mounted) return null;
    return (
      <div className="border-t border-border">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setTheme(theme === "dark" ? "light" : "dark");
          }}
          className="w-full flex justify-between items-center px-4 py-2 text-foreground hover:bg-accent transition"
        >
          <span className="text-sm font-medium">
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </span>
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>
    );
  };

  const Avatar = () => (
    <div className="w-8 h-8 rounded-full overflow-hidden border border-border flex items-center justify-center bg-muted">
      {profile?.avatar_url ? (
        <Image
          src={profile.avatar_url}
          alt="Avatar"
          width={32}
          height={32}
          className="object-cover w-full h-full"
        />
      ) : (
        <UserIcon className="w-5 h-5 text-muted-foreground" />
      )}
    </div>
  );

  return (
    <nav className="bg-background shadow-md dark:shadow-white/5 border-b border-border fixed w-full z-50 text-foreground transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Left: Logo & Audio */}
          <div className="flex items-center space-x-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMobileOpen(true);
              }}
              className="md:hidden flex flex-col justify-between w-6 h-5"
            >
              <span className="block h-0.5 w-full bg-foreground rounded"></span>
              <span className="block h-0.5 w-full bg-foreground rounded"></span>
              <span className="block h-0.5 w-full bg-foreground rounded"></span>
            </button>
            <div className="flex items-center gap-2">
              <AmbientAudioToggle src="/controlla.mp3" size={20} />
              <PageTransition
                targetUrl="/"
                circleColor="rgba(0, 0, 0, 0.18)"
                blurIntensity={5}
                duration={1000}
              >
                <span className="text-xl font-bold cursor-pointer tracking-tight">Horizon</span>
              </PageTransition>
            </div>
          </div>

          {/* Right: Desktop Links & Profile */}
          <div className="hidden md:flex md:items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${pathname === link.href
                  ? "font-bold text-primary"
                  : "font-medium text-muted-foreground hover:text-foreground"
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {user && (
  <Link
    href="/report"
    className={`flex items-center justify-center p-2 rounded-md transition-colors ${
      pathname === "/report"
        ? "text-primary bg-primary/10"
        : "text-muted-foreground hover:text-foreground hover:bg-accent"
    }`}
    title="Report"
  >
    <FileText className="w-5 h-5" />
  </Link>
)}

            {user && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(!dropdownOpen);
                  }}
                  className="p-1 rounded-full hover:ring-2 ring-primary/20 transition-all"
                >
                  <Avatar />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border">
                      <p className="text-xs text-muted-foreground truncate">Signed in as</p>
                      <p className="text-sm font-semibold truncate">{profile?.name || user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm hover:bg-accent transition"
                    >
                      Settings
                    </Link>
                    <ThemeToggle />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition border-t border-border"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Mobile Profile Button */}
          {user && (
            <div className="md:hidden relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(!dropdownOpen);
                }}
                className="p-1 rounded-full"
              >
                <Avatar />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-muted/50 text-sm font-semibold">
                    {profile?.name || "Menu"}
                  </div>
                  <Link href="/profile" className="block px-4 py-2 text-sm">Profile</Link>
                  <ThemeToggle />
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-destructive border-t border-border">
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-background border-r border-border shadow-2xl transform transition-transform duration-300 z-[60] ${mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex justify-between items-center p-5 border-b border-border">
          <span className="text-lg font-bold">Navigation</span>
          <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-accent rounded-md">✕</button>
        </div>
        <div className="flex flex-col p-4 space-y-2">
  {navLinks.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      onClick={() => setMobileOpen(false)}
      className={`p-3 rounded-md text-base transition-colors ${
        pathname === link.href 
          ? "bg-primary/10 text-primary font-bold" 
          : "hover:bg-accent"
      }`}
    >
      {link.label}
    </Link>
  ))}

  {/* Only show "Report" as a text link on mobile if logged in */}
  {user && (
    <Link
      href="/report"
      onClick={() => setMobileOpen(false)}
      className={`p-3 rounded-md text-base transition-colors ${
        pathname === "/report" 
          ? "bg-primary/10 text-primary font-bold" 
          : "hover:bg-accent"
      }`}
    >
      Report
    </Link>
  )}
</div>
        

      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </nav>
  );
}