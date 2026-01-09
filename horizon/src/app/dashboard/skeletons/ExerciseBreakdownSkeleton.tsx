const ExerciseBreakdownSkeleton = () => {
  return (
    <div className="bg-card p-4 rounded-xl border border-border h-[320px] flex flex-col shadow-xl dark:shadow-white/10 animate-pulse">
      
      {/* Title Skeleton */}
      <div className="h-5 w-48 mx-auto mb-4 rounded bg-muted" />

      <div className="flex-1 flex items-center justify-center">
        
        {/* Pie Chart Skeleton */}
        <div className="relative w-[180px] h-[180px] rounded-full bg-muted">
          {/* Inner hole */}
          <div className="absolute inset-6 rounded-full bg-card" />
        </div>

        {/* Legend Skeleton */}
        <div className="ml-10 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
