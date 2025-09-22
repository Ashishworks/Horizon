'use client';
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogin = async () => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (data.user) {
      router.push("/dashboard"); // redirect to dashboard
    } else {
      setMessage(data.error || data.message || "Login failed");
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "http://localhost:3000/dashboard" },
    });
  };

  return (
    <div className="flex flex-col gap-4 p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Login</h1>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded" />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 rounded" />

      <button onClick={handleLogin} className="bg-green-500 text-white p-2 rounded">Login</button>
      <button onClick={handleGoogleLogin} className="bg-red-500 text-white px-4 py-2 rounded">Continue with Google</button>

      {message && <p className="text-red-500">{message}</p>}
    </div>
  );
}
