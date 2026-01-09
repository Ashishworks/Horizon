// components/skeletons/StreakCounterSkeleton.tsx
export default function StreakCounterSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      
      {/* Current Streak Skeleton */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          <div className="h-12 w-20 rounded-md bg-white/10 animate-pulse" />
        </div>
        <div className="h-4 w-28 mx-auto rounded bg-white/10 animate-pulse" />
      </div>

      {/* Best Streak Skeleton */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/10 animate-pulse" />
          <div className="h-8 w-16 rounded-md bg-white/10 animate-pulse" />
        </div>
        <div className="h-4 w-24 mx-auto rounded bg-white/10 animate-pulse" />
      </div>

    </div>
  );
}
