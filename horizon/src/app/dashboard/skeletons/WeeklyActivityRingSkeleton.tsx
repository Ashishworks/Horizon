import { Skeleton } from "./skeleton";

export default function WeeklyActivityRingSkeleton() {
  return (
    <div className="flex h-full items-center justify-center">
      <Skeleton className="h-[220px] w-[220px] rounded-full" />
    </div>
  );
}
