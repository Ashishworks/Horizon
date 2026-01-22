"use client";

import Image from "next/image";
import { useState } from "react";
import { loginAction, signupAction } from "./action";

export default function AuthBox() {
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function handleAction(formData: FormData) {
    setMessage("");
    setError(false);

    const res = isLogin
      ? await loginAction(formData)
      : await signupAction(formData);

    if (res && !res.ok) {
      setError(true);
      setMessage(res.message);
    } else if (res?.message) {
      setError(false);
      setMessage(res.message);
    }
  }

  return (
    <div className="relative min-h-screen bg-gray-100">
      <Image
        src="/note3.png"
        alt="Sticky Note"
        width={250}
        height={250}
        priority
        className="absolute top-18 right-6 -rotate-4 w-40 sm:w-56 md:w-60 h-auto drop-shadow-xl"
      />

      <div className="flex justify-center items-center min-h-screen drop-shadow-2xl">
        <div className="relative z-10 bg-white p-8 rounded-xl shadow-md w-96">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl text-black font-bold">
              {isLogin ? "Login" : "Sign Up"}
            </h2>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-black underline text-sm"
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </div>

          <form action={handleAction} className="space-y-4">
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="w-full p-2 border placeholder-gray-300 border-gray-300 rounded text-black"
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="w-full p-2 border placeholder-gray-300 border-gray-300 rounded text-black"
            />

            <button
              type="submit"
              className="w-full py-2 rounded bg-black text-white hover:bg-white hover:text-black hover:border"
            >
              {isLogin ? "Login" : "Sign Up"}
            </button>
          </form>

          {message && (
            <p
              className={`mt-4 text-center ${
                error ? "text-red-500" : "text-green-500"
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
