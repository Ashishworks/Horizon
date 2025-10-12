"use client";

import { useState, useRef, MouseEvent, cloneElement, isValidElement, ReactElement } from "react";
import { useRouter } from "next/navigation";

interface PageTransitionProps {
  targetUrl: string;
  children: ReactElement<any, any>;
  duration?: number; // animation duration in ms
  circleColor?: string; // color of the expanding circle
  blurIntensity?: number; // blur amount in px
}

export default function PageTransition({
  targetUrl,
  children,
  duration = 1200, // default 1.2s
  circleColor = "rgba(0,0,0,0.1)", // default semi-transparent black
  blurIntensity = 4, // default blur px
}: PageTransitionProps) {
  const router = useRouter();
  const [reveal, setReveal] = useState(false);
  const circleRef = useRef<HTMLDivElement | null>(null);

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const circle = circleRef.current;
    if (!circle) return;

    circle.style.left = `${rect.left + rect.width / 2}px`;
    circle.style.top = `${rect.top + rect.height / 2}px`;

    setReveal(true);

    setTimeout(() => {
      router.push(targetUrl);
    }, duration - 200); // slightly before animation ends
  };

  // Safely clone the child and attach onClick
  const wrappedElement = isValidElement(children)
    ? cloneElement(children as ReactElement<any>, {
        onClick: handleClick,
      })
    : children;

  return (
    <>
      {/* Expanding Circle */}
      <div
        ref={circleRef}
        className={`absolute w-0 h-0 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all ease-out`}
        style={{
          zIndex: 50,
          backgroundColor: circleColor,
          transitionDuration: `${duration}ms`,
          ...(reveal
            ? { width: "2000px", height: "2000px", backdropFilter: `blur(${blurIntensity}px)` }
            : {}),
        }}
      ></div>

      {/* The element that triggers the transition */}
      {wrappedElement}
    </>
  );
}
