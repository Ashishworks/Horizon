"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface FrostGlassScrollButtonProps {
  containerRef: React.RefObject<HTMLElement | null>; // ✅ FIXED TYPE
  label?: string;
}

const FrostGlassScrollButton: React.FC<FrostGlassScrollButtonProps> = ({
  containerRef,
  label = "Scroll",
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;

    const handleScroll = () => {
      const isBottom =
        div.scrollTop + div.clientHeight >= div.scrollHeight - 5;
      setVisible(!isBottom);
    };

    div.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => div.removeEventListener("scroll", handleScroll);
  }, [containerRef]);

  const scrollToEnd = () => {
    const div = containerRef.current;
    if (!div) return;
    div.scrollTo({ top: div.scrollHeight, behavior: "smooth" });
  };

  return (
    <motion.button
      onClick={scrollToEnd}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
      transition={{ duration: 0.3 }}
      className="px-6 py-2 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 shadow-lg text-white text-sm font-medium hover:bg-white/20 transition-all"
    >
      {label}
    </motion.button>
  );
};

export default FrostGlassScrollButton;
