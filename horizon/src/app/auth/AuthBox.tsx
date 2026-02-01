"use client";

import Image from "next/image";
import { useState } from "react";
import { loginAction, signupAction } from "./action";
import { motion, AnimatePresence } from "framer-motion";


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
        <div className="relative z-10 bg-white p-5 sm:p-8 rounded-xl shadow-md
                w-[90%] sm:w-96 max-w-md">
          <div className="flex justify-between items-center mb-10">
            <AnimatePresence mode="wait">
              <motion.h2
                key={isLogin ? "login" : "signup"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="text-2xl text-black font-bold"
              >
                {isLogin ? "Login" : "Sign Up"}
              </motion.h2>
            </AnimatePresence>

            <motion.button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              whileHover={{ scale: 1.05, x: 2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-black underline text-sm relative"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={isLogin ? "signup-text" : "login-text"}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="inline-block"
                >
                  {isLogin ? "Sign Up" : "Login"}
                </motion.span>
              </AnimatePresence>
            </motion.button>

          </div>

          <form action={handleAction} className="space-y-6">
            {/* Email */}
            <div className="relative">
              <input
                name="email"
                type="email"
                required
                placeholder=" "
                className="peer w-full px-3 py-2 border border-gray-300 rounded text-black focus:outline-none focus:border-black"
              />
              <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-500
                peer-placeholder-shown:top-2.5
                peer-placeholder-shown:text-base
                peer-placeholder-shown:text-gray-400
                peer-focus:-top-2.5
                peer-focus:text-sm
                peer-focus:text-black
                transition-all">
                Email
              </label>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                name="password"
                type="password"
                required
                placeholder=" "
                className="peer w-full px-3 py-2 border border-gray-300 rounded text-black focus:outline-none focus:border-black"
              />
              <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-500
                peer-placeholder-shown:top-2.5
                peer-placeholder-shown:text-base
                peer-placeholder-shown:text-gray-400
                peer-focus:-top-2.5
                peer-focus:text-sm
                peer-focus:text-black
                transition-all">
                Password
              </label>
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-full py-2 rounded border border-black bg-black text-white
    shadow-md active:shadow-inner"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={isLogin ? "login-btn" : "signup-btn"}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="block text-center"
                >
                  {isLogin ? "Login" : "Sign Up"}
                </motion.span>
              </AnimatePresence>
            </motion.button>



          </form>

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
