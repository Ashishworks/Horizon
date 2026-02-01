"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Profile {
  id: string;
  name: string;
  typical_sleep_hours?: number;
  common_problems?: string;
  known_conditions?: string;
  location?: string;
  baseline_happiness?: number;
  avatar_url?: string | null;
}

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  /* ---------------- Skeleton ---------------- */
  const DesktopSkeleton = () => (
    <div className="animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-8 mb-6 p-8">
        <div className="flex flex-col items-center justify-center mb-6 md:mb-0">
          <div className="w-32 h-32 bg-muted/60 rounded-full mb-2" />
          <div className="h-4 bg-muted/60 rounded-xl w-32" />
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-muted/60 rounded-xl mb-2 w-3/4" />
              <div className="h-10 bg-muted/60 rounded-xl" />
            </div>
          ))}
          <div className="md:col-span-2">
            <div className="h-4 bg-muted/60 rounded-xl mb-2 w-1/2" />
            <div className="h-10 bg-muted/60 rounded-xl" />
          </div>
          <div className="md:col-span-2">
            <div className="h-4 bg-muted/60 rounded-xl mb-2 w-1/3" />
            <div className="h-10 bg-muted/60 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );

  /* ---------------- Fetch Profile ---------------- */
  const fetchProfile = useCallback(
    async (userId: string) => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      setProfile(data as Profile);
      setLoading(false);
    },
    [supabase]
  );

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return router.push("/auth");
      fetchProfile(session.user.id);
    };
    init();
  }, [fetchProfile, router, supabase]);

  /* ---------------- Handlers ---------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setProfile((p) =>
      p ? { ...p, [name]: type === "number" ? Number(value) : value } : p
    );
  };

  const handleUpdate = async () => {
    if (!profile) return;
    await supabase.from("profiles").upsert({
      ...profile,
      updated_at: new Date(),
    });
    setMessage("Profile updated successfully!");
    window.dispatchEvent(new CustomEvent("profileUpdated"));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const path = `${session.user.id}-${Date.now()}.${file.name.split(".").pop()}`;
      await supabase.storage.from("avatar").upload(path, file, { upsert: true });

      const { data } = supabase.storage.from("avatar").getPublicUrl(path);

      setProfile((p) => (p ? { ...p, avatar_url: data.publicUrl } : p));
      await supabase.from("profiles").upsert({
        id: session.user.id,
        avatar_url: data.publicUrl,
      });

      setMessage("Profile picture updated!");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", session.user.id);

    setProfile((p) => (p ? { ...p, avatar_url: null } : p));
    window.dispatchEvent(new CustomEvent("profileUpdated"));
  };

  /* ---------------- Loading ---------------- */
  if (loading || !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4">
        <div className="w-full max-w-3xl p-8 border rounded-2xl shadow-lg bg-card animate-in fade-in duration-500">
          <DesktopSkeleton />
        </div>
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="flex min-h-screen">
      <main className="flex-grow flex items-center justify-center px-4 mt-24 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="w-full max-w-3xl p-8 border border-border/60 rounded-2xl shadow-lg bg-card">
          <h2 className="text-3xl font-bold mb-6 text-center">Your Profile</h2>

          <div className="flex flex-col md:flex-row md:items-center md:space-x-8 mb-6">
            {/* Avatar column */}
            <div className="flex flex-col items-center justify-center mb-4 md:mb-0">
              <div className="relative w-32 h-32 mb-2 rounded-full overflow-hidden ring-2 ring-primary/30 transition-all hover:scale-[1.03]">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted/60" />
                )}
              </div>

              <label className="cursor-pointer text-primary text-sm hover:underline">
                {uploading ? "Uploading..." : "Change Profile Picture"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>

              {profile.avatar_url && (
                <button
                  onClick={handleRemoveAvatar}
                  className="text-destructive text-sm mt-1 hover:underline"
                >
                  Remove Profile Picture
                </button>
              )}
            </div>

            {/* Form */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ["name", "Full Name"],
                ["typical_sleep_hours", "Typical Sleep Hours"],
                ["common_problems", "Common Problems"],
                ["known_conditions", "Known Conditions"],
              ].map(([name, label]) => (
                <div key={name}>
                  <label className="mb-1 block">{label}</label>
                  <input
                    name={name}
                    value={(profile as any)[name] || ""}
                    onChange={handleChange}
                    className="w-full p-2 border border-border/60 rounded-xl bg-input transition-all focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              ))}

              <div className="md:col-span-2">
                <label className="mb-1 block">Location</label>
                <input
                  name="location"
                  value={profile.location || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-xl bg-input focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block">
                  Happiness Level ({profile.baseline_happiness || 5}/10)
                </label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  name="baseline_happiness"
                  value={profile.baseline_happiness || 5}
                  onChange={handleChange}
                  className="w-full accent-primary"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleUpdate}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl transition-all hover:bg-primary/90 hover:scale-[1.01]"
          >
            Save Changes
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full mt-3 bg-secondary text-secondary-foreground py-3 rounded-xl transition-all hover:bg-secondary/80 hover:scale-[1.01]"
          >
            Back to Dashboard
          </button>

          {message && (
            <p className="mt-3 text-center text-primary animate-in fade-in">
              {message}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
