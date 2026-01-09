export default function CardSkeleton({ title }: { title?: boolean }) {
  return (
    <div className="bg-card border border-border rounded-xl h-[320px] p-4 flex flex-col">
      {title && <div className="h-5 w-40 mx-auto mb-4 rounded bg-muted" />}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-40 h-40 rounded-full bg-muted" />
      </div>
    </div>
  );
}
