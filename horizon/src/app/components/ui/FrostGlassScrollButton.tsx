"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react"; // npm i lucide-react

interface FrostGlassScrollButtonProps {
  containerRef: React.RefObject<HTMLElement | null>;
  label?: string;
}

const FrostGlassScrollButton: React.FC<FrostGlassScrollButtonProps> = ({
  containerRef,
  label = "New Entries",
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;

    const handleScroll = () => {
      // Threshold of 20px to account for small layout shifts
      const isBottom = div.scrollTop + div.clientHeight >= div.scrollHeight - 20;
      setVisible(!isBottom);
    };

    div.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => div.removeEventListener("scroll", handleScroll);
  }, [containerRef]);

  const scrollToEnd = () => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToEnd}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          // Modern Dark/Light support using standard Tailwind classes
          className="group flex items-center gap-2 px-4 py-2 rounded-full 
                     backdrop-blur-xl bg-background/80 dark:bg-card/80
                     border border-border/50 shadow-[0_8px_32px_rgba(0,0,0,0.1)]
                     text-foreground/80 hover:text-foreground
                     transition-colors duration-300"
        >
          <span className="text-xs font-bold uppercase tracking-wider pl-1">
            {label}
          </span>
          
          <div className="relative flex h-5 w-5 items-center justify-center">
            {/* Animated Ping for attention */}
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/20 opacity-75"></span>
            <ChevronDown className="relative h-4 w-4 text-primary group-hover:translate-y-0.5 transition-transform" />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default FrostGlassScrollButton;