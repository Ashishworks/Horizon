const LoadingHorizon = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-background transition-colors duration-500">
      <div className="text-center animate-horizon-blink select-none">
        {/* Decreased size: was 5xl/7xl -> now 4xl/6xl */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-[0.2em] uppercase text-foreground">
          Horizon
        </h1>
        
        {/* Decreased size: was sm/lg -> now xs/sm */}
        <p className="mt-4 text-xs sm:text-sm font-medium tracking-[0.3em] uppercase opacity-80 text-foreground">
          See your mind clearly
        </p>
      </div>
    </div>
  );
};

export default LoadingHorizon;