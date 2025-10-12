"use client";

import {
  useState,
  useRef,
  MouseEvent,
  ReactElement,
  cloneElement,
  isValidElement,
} from "react";
import { useRouter } from "next/navigation";

interface PageTransitionProps {
  targetUrl: string;
  children: ReactElement<{ onClick?: (e: MouseEvent<HTMLElement>) => void }>;
  duration?: number;
}

export default function PageTransition({
  targetUrl,
  children,
  duration = 700,
}: PageTransitionProps) {
  const router = useRouter();
  const [reveal, setReveal] = useState(false);
  const circleRef = useRef<HTMLDivElement | null>(null);

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const circle = circleRef.current;
    if (!circle) return;

    circle.style.left = `${rect.left + rect.width / 2}px`;
    circle.style.top = `${rect.top + rect.height / 2}px`;

    setReveal(true);

    setTimeout(() => {
      router.push(targetUrl);
    }, duration - 300);
  };

  // Safely clone the child and attach onClick
  const wrappedElement = isValidElement(children)
    ? cloneElement(children, {
        onClick: handleClick,
      })
    : children;

  return (
    <>
      {/* Expanding Circle */}
      <div
        ref={circleRef}
        className={`absolute w-0 h-0 bg-black/10 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all ease-out`}
        style={{
          zIndex: 50,
          transitionDuration: `${duration}ms`,
          ...(reveal
            ? { width: "2000px", height: "2000px", backdropFilter: "blur(4px)" }
            : {}),
        }}
      ></div>

      {/* The element that triggers the transition */}
      {wrappedElement}
    </>
  );
}
