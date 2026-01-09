// app/dashboard/skeleton.tsx
'use client';

import CardSkeleton from "./CardSkeleton";
import ChartSkeleton from "./ChartSkeleton";
import PieSkeleton from "./PieSkeleton";
import SmallStatSkeleton from "./SmallStatSkeleton";
import WideBarSkeleton from "./WideBarSkeleton";
import WideStatSkeleton from "./WideStatSkeleton";

export default function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-10 bg-background min-h-screen animate-pulse">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10 mt-16">
        <div className="h-10 w-72 rounded bg-muted" />
        <div className="hidden md:block h-6 w-40 rounded bg-muted" />
        <div className="md:ml-auto flex gap-4">
          <div className="h-10 w-24 rounded bg-muted" />
          <div className="h-10 w-36 rounded bg-muted" />
        </div>
      </div>

      {/* ================= ROW 1 ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <CardSkeleton />
        <PieSkeleton />
      </div>

      {/* ================= ROW 2 ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <SmallStatSkeleton />
        <WideStatSkeleton/>
        <SmallStatSkeleton />
      </div>

      {/* ================= ROW 3 ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartSkeleton/>
        <ChartSkeleton />
      </div>

      {/* ================= ROW 4 ================= */}
      <div className="mt-8">
        <WideBarSkeleton />
      </div>
    </div>
  );
}
