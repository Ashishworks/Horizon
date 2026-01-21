"use client";

import { FC, useEffect, useState } from "react";
import Lottie from "lottie-react";

interface CyclerProps {
  size?: number;
}

const Cycler: FC<CyclerProps> = ({ size = 120 }) => {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch("/cycler.json")
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

export default Cycler;
