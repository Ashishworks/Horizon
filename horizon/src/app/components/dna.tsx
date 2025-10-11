'use client';

import React from 'react';

type Props = {
  width?: number;
  height?: number;
  duration?: number; // seconds
};

export default function DnaWaveSpinner({
  width = 400,
  height = 150,
  duration = 2.5,
}: Props) {
  const midY = height / 2;
  const amplitude = height * 0.25;
  const wavelength = width / 6;

  // function to build simple sine wave path
  const buildPath = (phase = 0) => {
    const samples = 16;
    let d = '';
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const x = t * width;
      const y =
        midY + amplitude * Math.sin((t * Math.PI * 2 * (width / wavelength)) + phase);
      d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    return d;
  };

  const strandA = buildPath(0);
  const strandB = buildPath(Math.PI);

  return (
    <div className="flex items-center justify-center p-4 bg-white">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          <style>{`
            @keyframes waveUpDown {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-8px); }
            }
            .wave {
              animation: waveUpDown ${duration}s ease-in-out infinite;
            }
          `}</style>
        </defs>

        {/* back strand */}
        <path
          d={strandB}
          fill="none"
          stroke="black"
          strokeWidth={2}
          opacity={0.3}
        />

        {/* front strand with animation */}
        <path
          d={strandA}
          fill="none"
          stroke="black"
          strokeWidth={2}
          className="wave"
        />

        {/* connectors between strands */}
        {Array.from({ length: 12 }).map((_, i) => {
          const t = i / 11;
          const x = t * width;
          const y1 =
            midY + amplitude * Math.sin((t * Math.PI * 2 * (width / wavelength)) + 0);
          const y2 =
            midY + amplitude * Math.sin((t * Math.PI * 2 * (width / wavelength)) + Math.PI);
          return (
            <line
              key={i}
              x1={x}
              y1={y1}
              x2={x}
              y2={y2}
              stroke="black"
              strokeWidth={1}
              opacity={0.6}
            />
          );
        })}
      </svg>
    </div>
  );
}
