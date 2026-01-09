export default function WideStatSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl min-h-[150px] p-6 md:col-span-2">
      <div className="h-5 w-48 mx-auto mb-6 rounded bg-muted" />
      <div className="grid grid-cols-2 items-center gap-6">
        <div className="w-28 h-28 rounded-full bg-muted mx-auto" />
        <div className="space-y-3">
          <div className="h-8 w-20 bg-muted rounded" />
          <div className="h-4 w-40 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
