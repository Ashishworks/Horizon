'use client';

import React from 'react';

interface FireFlamesProps {
  size?: number;
}

const FireFlames: React.FC<FireFlamesProps> = ({ size = 36 }) => {
  return (
    <span className="fire-wrapper" style={{ fontSize: size }}>
      🔥

      <span className="flame flame-1" />
      <span className="flame flame-2" />
      <span className="flame flame-3" />

      <style jsx>{`
        .fire-wrapper {
          position: relative;
          display: inline-block;
          line-height: 1;
          filter: drop-shadow(0 0 10px rgba(255, 140, 0, 0.8));
        }

        .flame {
          position: absolute;
          bottom: 20%;
          width: 10px;
          height: 14px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            #fff3cd 0%,
            #ff9800 50%,
            rgba(255, 0, 0, 0.3) 70%,
            transparent 75%
          );
          animation: flame-rise 1.2s infinite ease-out;
          opacity: 0;
        }

        .flame-1 {
          left: 45%;
          animation-delay: 0s;
        }

        .flame-2 {
          left: 55%;
          animation-delay: 0.35s;
        }

        .flame-3 {
          left: 50%;
          animation-delay: 0.7s;
        }

        @keyframes flame-rise {
          0% {
            transform: translateY(0) scale(0.6);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translateY(-28px) scale(1.4);
            opacity: 0;
          }
        }
      `}</style>
    </span>
  );
};

export default FireFlames;
