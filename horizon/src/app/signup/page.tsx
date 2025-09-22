'use client';
import React, { useState } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignup = async () => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (data.user) {
      router.push('/dashboard'); // redirect after successful signup
    } else {
      setMessage(data.message || data.error);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/dashboard",
      },
    });
  };

  return (
    <div className="flex flex-col gap-4 p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Signup</h1>
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="border p-2 rounded" />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded" />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 rounded" />
      
      <button onClick={handleSignup} className="bg-blue-500 text-white p-2 rounded">Signup</button>
      <button onClick={handleGoogleLogin} className="bg-red-500 text-white px-4 py-2 rounded">Continue with Google</button>

      {message && <p className="text-red-500">{message}</p>}
    </div>
  );
}
