"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { User as UserIcon } from "lucide-react";

interface Profile {
  id: string;
  name?: string;
  avatar_url?: string | null;
  email?: string;
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Fetch user & profile
  useEffect(() => {
    

    const fetchUserProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!error && profileData) setProfile(profileData as Profile);
      }
    };

    fetchUserProfile();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data, error }) => {
            if (!error && data) setProfile(data as Profile);
          });
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  // Listen for profile updates
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
    { label: "Calender", href: "/journal/calender" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

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
      <UserIcon className="w-6 h-6 text-gray-700" />
    );

  return (
    <nav className="bg-white shadow-md fixed w-full z-50 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center relative">
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
          <div className="hidden md:flex md:items-center space-x-6 relative">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${
                  pathname === link.href
                    ? "font-bold text-blue-600"
                    : "font-normal text-gray-700"
                } hover:text-blue-500 transition`}
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
                  className="ml-4 p-1 rounded-full hover:bg-gray-100 transition"
                >
                  <Avatar />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-100 text-gray-800 font-semibold">
                      {profile?.name || "User"}
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition"
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
                className="p-1 rounded-full hover:bg-gray-100 transition"
              >
                <Avatar />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-100 text-gray-800 font-semibold">
                    {profile?.name || "User"}
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition"
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
              className={`${
                pathname === link.href ? "font-bold text-blue-600" : "font-normal text-gray-700"
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
