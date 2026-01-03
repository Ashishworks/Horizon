'use client';

import React from 'react';

export default function TrophyAward({
  size = 36,
}: {
  size?: number;
}) {
  return (
    <span className="trophy-wrapper" style={{ fontSize: size }}>
      <span className="trophy">🏆</span>
      <span className="star star-1">✨</span>
      <span className="star star-3">✨</span>

      <style jsx>{`
        .trophy-wrapper {
          position: relative;
          display: inline-block;
        }

        .trophy {
          display: inline-block;
          animation: trophyGlow 2s ease-in-out infinite;
          filter: drop-shadow(0 0 6px rgba(255, 200, 60, 0.8));
        }

        .star {
          position: absolute;
          font-size: 0.45em; /* ⭐ smaller stars */
          opacity: 0;
          animation: sparkle 2.4s ease-in-out infinite;
        }

        .star-1 {
          top: -25%;
          left: 15%;
          animation-delay: 0s;
        }

        .star-2 {
          top: -45%;
          right: 15%;
          animation-delay: 0.8s;
        }

        .star-3 {
          top: -20%;
          left: 65%;
          animation-delay: 1.4s;
        }

        @keyframes trophyGlow {
          0% {
            filter: drop-shadow(0 0 6px rgba(255, 200, 60, 0.6));
          }
          50% {
            filter: drop-shadow(0 0 14px rgba(255, 215, 100, 1));
          }
          100% {
            filter: drop-shadow(0 0 6px rgba(255, 200, 60, 0.6));
          }
        }

        @keyframes sparkle {
          0% {
            transform: scale(0.5) translateY(8px);
            opacity: 0;
          }
          40% {
            opacity: 1;
          }
          70% {
            transform: scale(0.7) translateY(-4px);
            opacity: 1;
          }
          100% {
            transform: scale(0.5) translateY(-8px);
            opacity: 0;
          }
        }
      `}</style>
    </span>
  );
}
