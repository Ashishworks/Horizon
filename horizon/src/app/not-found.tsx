// app/not-found.tsx
"use client";

import { useRouter } from "next/navigation";
import React from "react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <h1 className="text-8xl font-extrabold mb-4">404</h1>
      <p className="text-2xl mb-6">Oops! Page not found.</p>
      <button
        onClick={() => router.push("/")}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Go Back Home
      </button>
    </div>
  );
}
