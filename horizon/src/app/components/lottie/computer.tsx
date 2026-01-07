"use client";

import { FC, useEffect, useState } from "react";
import Lottie from "lottie-react";

interface ComputerProps {
  size?: number;
}

const Computer: FC<ComputerProps> = ({ size = 120 }) => {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch("/computer.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data));
  }, []);

  if (!animationData) return null;

  return (
    <div style={{ width: size }}>
      <Lottie
        animationData={animationData}
        loop
        autoplay
      />
    </div>
  );
};

export default Computer;
