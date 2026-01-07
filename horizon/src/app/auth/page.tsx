"use client";

import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import Lanyard from "../components/Lanyard";
import Image from "next/image";

export default function AuthBox() {
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    setMessage("");
    setError(false);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(true);
          setMessage(error.message);
        } else {
          setMessage("Login successful!");
          router.push("/dashboard");
        }
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setError(true);
          setMessage(error.message);
        } else if (data.user) {
          // Profile is automatically created by the database trigger

          setMessage("Signup successful! Redirecting to onboarding...");
          router.push(`/onboarding?user_id=${data.user.id}`);
        }
      }
    } catch (err) {
      console.error(err);
      setError(true);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      {/* Top-right image */}
      <Image
        src="/note.png"
        alt="Sticky Note"
        width={300}
        height={300}
        priority
        className="absolute top-12 right-6 rotate-3"
      />

      {/* Centered login/signup */}
      <div className="flex justify-center items-center min-h-screen">
        <div className="relative z-10 bg-white p-8 rounded-xl shadow-md w-96">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl text-black font-bold">
              {isLogin ? "Login" : "Sign Up"}
            </h2>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-black underline text-sm"
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border placeholder-gray-300 border-gray-300 rounded mb-4 text-black"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border placeholder-gray-300 border-gray-300 rounded mb-4 text-black"
          />

          <button
            onClick={handleAuth}
            disabled={loading}
            className={`w-full py-2 rounded ${loading
                ? "bg-gray-900 text-white"
                : "bg-black hover:bg-white hover:text-black hover:border"
              }`}
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
          </button>

          {message && (
            <p
              className={`mt-4 text-center ${error ? "text-red-500" : "text-green-500"
                }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>

  );
}
