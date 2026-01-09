export default function SmallStatSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl min-h-[250px] p-6 flex flex-col">
      <div className="h-5 w-28 mx-auto mb-6 rounded bg-muted" />
      <div className="flex-1 flex items-center justify-center gap-6">
        <div className="w-24 h-24 rounded-full bg-muted" />
        <div className="space-y-3">
          <div className="h-6 w-20 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
