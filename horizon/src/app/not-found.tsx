"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";

export default function NotFound() {
  const router = useRouter();
  const [reveal, setReveal] = useState(false);
  const circleRef = useRef<HTMLDivElement | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const circle = circleRef.current;

    if (!circle) return;

    // Position the expanding circle at the button center
    circle.style.left = `${rect.left + rect.width / 2}px`;
    circle.style.top = `${rect.top + rect.height / 2}px`;

    setReveal(true);

    // Wait for animation to play before navigation
    setTimeout(() => {
      router.push("/");
    }, 700);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800 relative overflow-hidden">

      {/* Expanding Circle */}
      <div
        ref={circleRef}
        className={`absolute w-0 h-0 bg-black rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-[1200ms] ease-out`}
        style={{
          zIndex: 50,
          width: reveal ? "2000px" : "0",
          height: reveal ? "2000px" : "0",
        }}
      ></div>

      {/* Not Found Image */}
      <Image
        src="/nf.png"
        alt="Not found"
        width={700}
        height={700}
        className="z-10 -mt-[72px]"
      />

      {/* Heading */}
      <h1
        className={`text-5xl font-extrabold mb-8 z-20 -mt-[72px] transition-opacity duration-500 ${
          reveal ? "opacity-0" : "opacity-100"
        }`}
      >
        Page Under Construction
      </h1>

      {/* Go Back Button */}
      <button
        onClick={handleClick}
        className={`bg-white text-black border border-black font-semibold px-8 py-4 rounded-full text-lg
                    hover:bg-black hover:text-white hover:shadow-2xl hover:shadow-black
                    transition-all duration-300 relative z-10
                    ${reveal ? "opacity-100" : "opacity-100"}`}
      >
        Go Back Home
      </button>
    </div>
  );
}
