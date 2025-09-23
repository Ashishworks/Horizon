"use client";

import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";

export default function AuthBox() {
  const supabase = useSupabaseClient();
  const router = useRouter(); // moved inside the component

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true); // toggle between login and signup
  const [message, setMessage] = useState("");

  const handleAuth = async () => {
    setMessage("");
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else {
        setMessage("Login successful!");
        router.push("/dashboard"); // redirect after login
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else {
        setMessage("Signup successful! Redirecting to onboarding...");
        router.push(`/onboarding?user_id=${data.user?.id}`); // redirect to onboarding
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl text-black font-bold">{isLogin ? "Login" : "Sign Up"}</h2>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 underline text-sm"
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
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>
        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
      </div>
    </div>
  );
}
