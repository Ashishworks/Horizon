'use client';
import React, { useState } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
  };

  const supabase = createClientComponentClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000",
      },
    });
  }
    return (
      <div className="flex flex-col gap-4 p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold">Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
        />
        <div className="flex flex-col gap-4">
          <button onClick={handleGoogleLogin} className="bg-red-500 text-white px-4 py-2 rounded">
            Continue with Google
          </button>
        </div>
        <button
          onClick={handleLogin}
          className="bg-green-500 text-white p-2 rounded"
        >
          Login
        </button>
        
        {message && <p className="text-red-500">{message}</p>}
      </div>
    );
  }
