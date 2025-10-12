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

    circle.style.left = `${rect.left + rect.width / 2}px`;
    circle.style.top = `${rect.top + rect.height / 2}px`;

    setReveal(true);

    setTimeout(() => {
      router.push("/");
    }, 700);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800 relative overflow-hidden px-4 sm:px-6 lg:px-8">

      {/* Expanding Circle */}
      <div
        ref={circleRef}
        className={`absolute bg-black rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-[1200ms] ease-out`}
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
        className="z-10 -mt-16 sm:-mt-20 md:-mt-24 lg:-mt-28 w-[80vw] max-w-[700px] h-auto"
      />

      {/* Heading */}
      <h1
        className={`font-extrabold mb-8 z-20 transition-opacity duration-500 text-center
          text-3xl sm:text-4xl md:text-5xl lg:text-5xl
          ${reveal ? "opacity-0" : "opacity-100"}`
        }
      >
        Page Under Construction
      </h1>

      {/* Go Back Button */}
      <button
        onClick={handleClick}
        className={`bg-white text-black border border-black font-semibold rounded-full
          px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg
          hover:bg-black hover:text-white hover:shadow-2xl hover:shadow-black
          transition-all duration-300 relative z-10`}
      >
        Go Back Home
      </button>
    </div>
  );
}
