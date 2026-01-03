'use client';

import React from 'react';

type ECGLineProps = {
  speed?: number; // seconds
};

const ECGLine: React.FC<ECGLineProps> = ({ speed = 3 }) => {
  return (
    <svg
      width="100%"
      height={60}
      viewBox="0 0 600 100"
      fill="none"
    >
      <path
        d="
          M0 50
          L40 50
          L60 30
          L80 70
          L100 50
          L160 50
          L180 20
          L200 80
          L220 50
          L280 50
          L300 35
          L320 65
          L340 50
          L400 50
          L420 25
          L440 75
          L460 50
          L600 50
        "
        stroke="#00ff88"
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ecg-line"
        style={{ animationDuration: `${speed}s` }}
      />
    </svg>
  );
};

export default ECGLine;
