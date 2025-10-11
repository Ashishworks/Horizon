"use client";

import { useEffect, useRef } from "react";

interface FaceProps {
  size?: number; // diameter of face
  color?: 1 | 2 | 3 | 4; // 1 = red, 2 = yellow, 3 = green, 4 = white
  shadow?: 0 | 1 | 2 | 3; // 0 = no shadow, 1 = light, 2 = medium, 3 = strong
  mouthWidth?: number; // optional custom width of mouth
  mouthHeight?: number; // optional custom height of mouth
}

export default function Face({
  size = 200,
  color = 2,
  shadow = 0,
  mouthWidth,
  mouthHeight,
}: FaceProps) {
  const leftEye = useRef<HTMLDivElement | null>(null);
  const rightEye = useRef<HTMLDivElement | null>(null);

  // Proportional sizes
  const eyeSize = size * 0.25; // 25% of face diameter
  const pupilSize = eyeSize * 0.4; // 40% of eye size

  // Use custom mouth size if provided
  const mouthW = mouthWidth ?? size * 0.5;
  const mouthH = mouthHeight ?? size * 0.4;

  // Map color prop to actual color
  const faceColorMap = {
    1: "red",
    2: "yellow",
    3: "green",
    4: "white",
  };
  const faceColor = faceColorMap[color];

  // Map shadow levels to box-shadow CSS
  const shadowMap = {
    0: "none",
    1: "0px 4px 6px rgba(0,0,0,0.1)",
    2: "0px 8px 12px rgba(0,0,0,0.2)",
    3: "0px 12px 20px rgba(0,0,0,0.3)",
  };
  const faceShadow = shadowMap[shadow];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const eyes = [leftEye.current, rightEye.current];

      eyes.forEach((eye) => {
        if (!eye) return;

        const rect = eye.getBoundingClientRect();
        const eyeX = rect.left + rect.width / 2;
        const eyeY = rect.top + rect.height / 2;

        const dx = e.clientX - eyeX;
        const dy = e.clientY - eyeY;
        const angle = Math.atan2(dy, dx);

        const radius = 0.2 * eyeSize; // max pupil movement relative to eye
        const pupil = eye.querySelector<HTMLDivElement>(".pupil");
        if (pupil) {
          pupil.style.transform = `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px)`;
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [eyeSize]);

  return (
    <div className="face-container">
      <div className="face">
        <div ref={leftEye} className="eye">
          <div className="pupil"></div>
        </div>
        <div ref={rightEye} className="eye">
          <div className="pupil"></div>
        </div>
        <div className="mouth"></div>
      </div>

      <style jsx>{`
        .face-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .face {
          position: relative;
          width: ${size}px;
          height: ${size}px;
          background: ${faceColor};
          border-radius: 50%;
          display: flex;
          justify-content: space-around;
          align-items: center;
          box-shadow: ${faceShadow};
        }
        .eye {
          position: relative;
          width: ${eyeSize}px;
          height: ${eyeSize}px;
          background: white;
          border: 2px solid black;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .pupil {
          width: ${pupilSize}px;
          height: ${pupilSize}px;
          background: black;
          border-radius: 50%;
          transition: transform 0.05s;
        }
        .mouth {
  position: absolute;
  bottom: ${0.15 * size}px;
  left: 50%;
  transform: translateX(-50%);
  width: ${mouthW}px;
  height: ${mouthH}px;
  border-bottom: 5px solid black;
  border-radius: 50%;
  transition: width 0.3s ease, height 0.3s ease; /* <-- smooth transition */
}
      `}</style>
    </div>
  );
}
