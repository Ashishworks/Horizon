export default function PieSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl h-[320px] p-4 flex flex-col">
      <div className="h-5 w-48 mx-auto mb-4 rounded bg-muted" />

      <div className="flex-1 flex items-center justify-center gap-10">
        <div className="relative w-40 h-40 rounded-full bg-muted">
          <div className="absolute inset-6 rounded-full bg-card" />
        </div>

        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
