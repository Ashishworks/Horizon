"use client";

import { useEffect, useState, useCallback } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { SupabaseClient } from "@supabase/supabase-js";
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
    const supabase: SupabaseClient = useSupabaseClient();
    const router = useRouter();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [uploading, setUploading] = useState(false);

    // Desktop skeleton loader
    const DesktopSkeleton = () => (
        <div className="animate-pulse">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-8 mb-6">
                {/* Avatar */}
                <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
                    <div className="w-32 h-32 bg-gray-300 dark:bg-gray-700 rounded-full mb-2" />
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32" />
                </div>

                {/* Form fields */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex flex-col">
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded"></div>
                        </div>
                    ))}

                    <div className="flex flex-col md:col-span-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2 w-1/2"></div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    </div>

                    <div className="flex flex-col md:col-span-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2 w-1/3"></div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 space-y-3 md:space-y-0 md:flex md:space-x-4">
                <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded flex-1"></div>
                <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded flex-1"></div>
            </div>
        </div>
    );

    // Fetch profile by userId
    const fetchProfile = useCallback(
        async (userId: string) => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from("profiles") // no generic here
                    .select("*")
                    .eq("id", userId)
                    .single();

                if (error && error.code !== "PGRST116") {
                    console.error(error);
                    setMessage("Error fetching profile");
                } else {
                    setProfile(data as Profile | null); // cast here
                }
            } finally {
                setLoading(false);
            }
        },
        [supabase]
    );

    // Check session on mount
    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
                router.push("/auth");
                return;
            }
            fetchProfile(data.session.user.id);
        };

        checkSession();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) router.push("/auth");
        });

        return () => listener.subscription.unsubscribe();
    }, [fetchProfile, router, supabase]);

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setProfile(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                [name]: type === "number" ? Number(value) : value,
            };
        });
    };

    // Handle profile update
    const handleUpdate = async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) return setMessage("Not logged in");

        const updates: Partial<Profile> & { id: string; updated_at: Date } = {
            id: sessionData.session.user.id,
            name: profile?.name || "",
            typical_sleep_hours: profile?.typical_sleep_hours,
            common_problems: profile?.common_problems,
            known_conditions: profile?.known_conditions,
            location: profile?.location,
            baseline_happiness: profile?.baseline_happiness,
            avatar_url: profile?.avatar_url,
            updated_at: new Date(),
        };

        const { error } = await supabase.from("profiles").upsert(updates);
        setMessage(error ? error.message : "Profile updated successfully!");
        window.dispatchEvent(new CustomEvent("profileUpdated"));
    };

    // Handle avatar upload
    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const file = event.target.files?.[0];
            const { data: sessionData } = await supabase.auth.getSession();
            if (!file || !sessionData.session) return;

            const fileExt = file.name.split(".").pop();
            if (!fileExt) throw new Error("Invalid file extension");

            const filePath = `${sessionData.session.user.id}-${Date.now()}.${fileExt}`;

            // Upload file
            const { error: uploadError } = await supabase.storage
                .from("avatar")
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: publicUrlData } = supabase.storage.from("avatar").getPublicUrl(filePath);
            if (!publicUrlData?.publicUrl) throw new Error("Could not get public URL");

            // Update profile state
            setProfile(prev => (prev ? { ...prev, avatar_url: publicUrlData.publicUrl } : prev));

            // Upsert profile in Supabase
            const updates: Partial<Profile> & { id: string } = {
                id: sessionData.session.user.id,
                avatar_url: publicUrlData.publicUrl,
            };

            const { error: upsertError } = await supabase
                .from("profiles")
                .upsert(updates, { onConflict: "id" });

            if (upsertError) throw upsertError;

            setMessage("Profile picture updated!");
        } catch (error) {
            // Use unknown instead of any
            if (error instanceof Error) {
                console.error(error);
                setMessage(error.message);
            } else {
                console.error(error);
                setMessage("An unexpected error occurred");
            }
        } finally {
            setUploading(false);
        }
    };


    if (loading || !profile) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 text-black dark:text-white px-4">
                <div className="w-full max-w-3xl p-8 border rounded-lg shadow-lg bg-white dark:bg-gray-800">
                    <DesktopSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
            <main className="flex-grow flex items-center justify-center px-4 mt-24">
                <div className="w-full max-w-3xl p-8 border rounded-lg shadow-lg bg-white dark:bg-gray-800">
                    <h2 className="text-3xl font-bold mb-6 text-center">Your Profile</h2>

                    {/* Avatar & Form */}
                    <div className="flex flex-col md:flex-row md:items-center md:space-x-8 mb-6">
                        <div className="flex flex-col items-center md:items-center mb-4 md:mb-0">
                            {profile.avatar_url ? (
                                <div className="relative w-32 h-32 mb-2 rounded-full overflow-hidden">
                                    <Image
                                        src={profile.avatar_url}
                                        alt="Avatar"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-32 h-32 bg-gray-300 rounded-full mb-2" />
                            )}
                            <div className="flex flex-col items-center space-y-1">
                                <label
                                    htmlFor="avatar-upload"
                                    className="cursor-pointer text-blue-500 hover:underline text-sm md:text-base"
                                >
                                    {uploading ? "Uploading..." : "Change Profile Picture"}
                                </label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleUpload}
                                    className="hidden"
                                />
                                {profile.avatar_url && (
                                    <button
                                        onClick={async () => {
                                            const { data: sessionData } = await supabase.auth.getSession();
                                            if (!sessionData.session) return setMessage("Not logged in");

                                            const { error } = await supabase
                                                .from("profiles")
                                                .update({ avatar_url: null })
                                                .eq("id", sessionData.session.user.id);

                                            if (error) setMessage(error.message);
                                            else setProfile(prev => (prev ? { ...prev, avatar_url: null } : prev));
                                        }}
                                        className="text-red-500 hover:underline text-sm md:text-base"
                                    >
                                        Remove Profile Picture
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Profile Form */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <label className="mb-1">Full Name</label>
                                <input
                                    name="name"
                                    value={profile.name || ""}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded text-black dark:text-white bg-gray-100 dark:bg-gray-700"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="mb-1">Typical Sleep Hours</label>
                                <input
                                    type="number"
                                    name="typical_sleep_hours"
                                    value={profile.typical_sleep_hours || ""}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="mb-1">Common Problems</label>
                                <input
                                    name="common_problems"
                                    value={profile.common_problems || ""}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="mb-1">Known Conditions</label>
                                <input
                                    name="known_conditions"
                                    value={profile.known_conditions || ""}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700"
                                />
                            </div>

                            <div className="flex flex-col md:col-span-2">
                                <label className="mb-1">Location</label>
                                <input
                                    name="location"
                                    value={profile.location || ""}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700"
                                />
                            </div>

                            <div className="flex flex-col md:col-span-2">
                                <label className="mb-1">Happiness Level ({profile.baseline_happiness || 5}/10)</label>
                                <input
                                    type="range"
                                    min={0}
                                    max={10}
                                    name="baseline_happiness"
                                    value={profile.baseline_happiness || 5}
                                    onChange={handleChange}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleUpdate}
                        className="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 mb-4"
                    >
                        Save Changes
                    </button>

                    <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full bg-gray-500 text-white py-3 rounded hover:bg-gray-600"
                    >
                        Back to Dashboard
                    </button>

                    {message && <p className="mt-2 text-center text-blue-500">{message}</p>}
                </div>
            </main>
        </div>
    );
}
