"use client";

import { useEffect, useRef, useState } from "react";
import { Bars } from "react-loader-spinner";
import { useTheme } from "next-themes";

type Props = {
  src?: string;
  size?: number;
};

export default function AmbientAudioToggle({
  src = "/controlla.mp3",
  size = 20,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    audioRef.current = new Audio(src);
    audioRef.current.loop = true;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [src]);

  const toggleAudio = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      setIsPlaying((prev) => !prev);
    } catch (e) {
      console.error("Audio play failed:", e);
    }
  };

  // prevent hydration mismatch for theme
  const isDark = mounted ? resolvedTheme === "dark" : true;

  // ✅ Theme-aware colors
  const color = isPlaying
    ? isDark
      ? "#ffffff" // dark mode playing
      : "#111827" // light mode playing (gray-900)
    : hovered
    ? isDark
      ? "#ffffffb3" // dark hover
      : "#374151" // light hover (gray-700)
    : isDark
    ? "#ffffff66" // dark muted
    : "#9CA3AF"; // light muted (gray-400)

  return (
    <button
      type="button"
      onClick={toggleAudio}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-pointer p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
      aria-label={isPlaying ? "Pause Ambient Audio" : "Play Ambient Audio"}
      title={isPlaying ? "Pause Ambient Audio" : "Play Ambient Audio"}
    >
      <Bars
        height={size}
        width={size}
        color={color}
        ariaLabel="ambient-audio-toggle"
        visible={true}
      />
    </button>
  );
}
