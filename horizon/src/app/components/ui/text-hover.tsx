"use client";
import React from "react";
import { motion } from "motion/react";

export const TextHoverEffect = ({
  text,
  duration = 2,
}: {
  text: string;
  duration?: number;
}) => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 150"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      className="select-none"
    >
      <defs>
        {/* Warm, bright gold gradient */}
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d4af37" />   {/* rich gold */}
          <stop offset="50%" stopColor="#ffd700" />  {/* bright yellow-gold */}
          <stop offset="100%" stopColor="#d4af37" />
        </linearGradient>
      </defs>

      {/* Black outline */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="black"
        strokeWidth="2"
        className="fill-transparent font-[helvetica] text-7xl font-bold"
      >
        {text}
      </text>

      {/* Bright warm gold glow (no blue tint) */}
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#goldGradient)"
        strokeWidth="2"
        className="fill-transparent font-[helvetica] text-7xl font-bold"
        animate={{
          opacity: [0.7, 1, 0.7],
          filter: [
            "drop-shadow(0 0 3px #ffbf00)",
            "drop-shadow(0 0 10px #ffdf00)",
            "drop-shadow(0 0 3px #ffbf00)",
          ],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {text}
      </motion.text>
    </svg>
  );
};
