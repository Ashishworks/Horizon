'use client';
import CountUp from './components/ui/Countup';
import { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import Face from './components/ui/face';
import { Bars, DNA, Rings, Watch } from 'react-loader-spinner';
import PageTransition from './components/pagetransitions/PageTransition';

interface Stat {
  label: string;
  value: number; // full number
  info: string;
}

// Convert to millions or billions
const formatNumber = (num: number) => {
  if (num >= 1_000_000_000) {
    return Math.round((num / 1_000_000_000) * 10) / 10; // 1 decimal
  }
  return Math.round((num / 1_000_000) * 10) / 10;
};

const isBillion = (num: number) => num >= 1_000_000_000;

const stats: Stat[] = [
  { label: 'Prevalence', value: 1_100_000_000, info: 'Global mental health' },
  { label: 'Depression', value: 332_000_000, info: 'Global depression rate' },
  { label: 'Suicide', value: 727_000, info: 'Global suicide deaths' },
  { label: 'Economic Impact', value: 1_000_000, info: 'Lost productivity' },
  { label: 'Access to Treatment', value: 910_000_000, info: 'Untreated depression' },
];

export default function MentalHealthLanding() {
  const [reveal] = useState(false);
  const [ringColor, setRingColor] = useState("#00000076");
  const [time, setTime] = useState<string | null>(null);
  const [mouthSize, setMouthSize] = useState<{ width: number; height: number }>({
    width: 20,
    height: 10,
  });
  const circleRef = useRef<HTMLDivElement | null>(null);
  const mouthTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update clock every second (after client hydration)
  useEffect(() => {
    setTime(moment().format('HH:mm:ss')); // initialize after mount
    const interval = setInterval(() => {
      setTime(moment().format('HH:mm:ss'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper to handle mouse enter for mouth size
  const handleMouseEnter = (width: number, height: number) => {
    if (mouthTimeoutRef.current) clearTimeout(mouthTimeoutRef.current);
    setMouthSize({ width, height });
  };

  // Helper to handle mouse leave with 0.5s delay
  const handleMouseLeave = (width: number, height: number) => {
    if (mouthTimeoutRef.current) clearTimeout(mouthTimeoutRef.current);
    mouthTimeoutRef.current = setTimeout(() => {
      setMouthSize({ width, height });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-16 px-4 relative overflow-hidden">
      {/* Small Face at top-left */}
      <div className="absolute top-4 left-4 z-20 transition-all duration-300">
        <Face
          size={80}
          color={4}
          shadow={2}
          mouthWidth={mouthSize.width}
          mouthHeight={mouthSize.height}
        />
      </div>

      {/* Rings loader beneath the Face on z-axis */}
      <div className="absolute -top-1.5 -left-1.5 z-10 transition-all duration-300 flex justify-center items-center">
        <Rings
          visible={true}
          height="120"
          width="120"
          color={ringColor}
          ariaLabel="rings-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>

      {/* Expanding Circle */}
      <div
        ref={circleRef}
        className={`absolute w-0 h-0 bg-black/10 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-[1200ms] ease-out ${reveal ? 'w-[2000px] h-[2000px] backdrop-blur-sm' : ''
          }`}
        style={{ zIndex: 50 }}
      ></div>

      {/* Real-Time Clock (render only after client mount) */}
      {time && (
        <div className="absolute top-4 right-4 text-black font-mono text-lg sm:text-2xl z-20 font-bold flex items-center space-x-2">
          <Watch
            visible={true}
            height="40"
            width="40"
            radius="0"
            color="#000000ff"
            ariaLabel="watch-loading"
          />
          <span>{time}</span>
        </div>
      )}

      {/* Main Title */}
      <h1 className="text-5xl sm:text-7xl font-extrabold mb-4 text-center text-black sm:mt-0 mt-15">
        Horizon
      </h1>

      {/* Tagline */}
      <div className="flex items-center justify-center text-xl sm:text-2xl font-medium mb-12 text-center text-gray-700 gap-2">
        <Bars
          height="20"
          width="20"
          color="#00000050"
          ariaLabel="bars-loading"
          wrapperClass=""
          visible={true}
        />
        See Your Mind Clearly.
        <Bars
          height="20"
          width="20"
          color="#00000050"
          ariaLabel="bars-loading"
          wrapperClass=""
          visible={true}
        />
      </div>

      {/* Stats */}
      <div className="flex flex-wrap justify-center gap-6 mb-12">
        {stats.map((stat, idx) => {
          const displayValue = formatNumber(stat.value);
          const suffix = isBillion(stat.value) ? 'B+' : 'M+';

          // For mobile: 2 per row except last one centered
          let widthClass = 'w-40 sm:w-48 md:w-52 lg:w-56';
          if (idx === stats.length - 1) widthClass += ' mx-auto'; // last item centered

          return (
            <div
              key={idx}
              className={`bg-white text-black ${widthClass} h-40 sm:h-48 md:h-52 lg:h-56
       flex flex-col items-center justify-center rounded-full
       shadow-[0_20px_40px_rgba(0,0,0,0.25)]
       hover:shadow-[0_25px_60px_rgba(255,0,0,0.6)]
       transition-colors duration-700 ease-in-out
       transition-shadow`}
              onMouseEnter={() => { handleMouseEnter(30, -10); setRingColor("#ff7878ff"); }}
              onMouseLeave={() => { handleMouseLeave(20, 10); setRingColor("#00000076"); }}
            >
              <div className="flex items-baseline justify-center text-3xl sm:text-4xl md:text-5xl font-bold ease-in-out transition-colors">
                <CountUp
                  from={0}
                  to={displayValue}
                  duration={2}
                  separator=","
                  className="text-3xl sm:text-4xl md:text-5xl font-bold "
                  onStart={() => { }}
                  onEnd={() => { }}
                />
                <span className="ml-1">{suffix}</span>
              </div>
              <p className="mt-2 font-medium text-center text-sm sm:text-base">
                {stat.info}
              </p>
              <DNA
                visible={true}
                height="50"
                width="40"
                ariaLabel="dna-loading"
                wrapperStyle={{}}
                wrapperClass="dna-wrapper"
              />
            </div>
          );
        })}
      </div>

      {/* Get Started Button */}
      <PageTransition targetUrl="/dashboard" circleColor="rgba(0, 0, 0, 0.1)" blurIntensity={10}>
        <button
          onMouseEnter={() => { handleMouseEnter(30, 20); setRingColor("#8aff78ff"); }}
          onMouseLeave={() => { handleMouseLeave(20, 10); setRingColor("#00000076"); }}
          className="bg-white text-black border border-black font-semibold px-8 py-4 rounded-full text-lg 
               hover:bg-black hover:text-white hover:shadow-2xl hover:shadow-black
               transition-all duration-300 relative z-10"
        >
          Get Started
        </button>
      </PageTransition>
    </div>
  );
}
