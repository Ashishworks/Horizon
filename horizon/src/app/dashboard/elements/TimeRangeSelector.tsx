'use client';

type Range = 7 | 30 | 90;

export default function TimeRangeSelector({
  value,
  onChange,
}: {
  value: Range;
  onChange: (r: Range) => void;
}) {
  const options: Range[] = [7, 30, 90];
  const index = options.indexOf(value);

  return (
    <div className="relative flex bg-card border rounded-4xl p-1 w-fit">
      <div
        className="absolute top-1 left-1 h-[calc(100%-0.5rem)] w-20 rounded-4xl bg-primary transition-transform duration-300 ease-out"
        style={{ transform: `translateX(${index * 80}px)` }}
      />

      {options.map((d) => (
        <button
          key={d}
          onClick={() => onChange(d)}
          className={`relative z-10 w-20 py-1.5 text-sm font-medium transition-colors
            ${value === d ? 'text-primary-foreground' : 'text-muted-foreground'}
          `}
        >
          {d} days
        </button>
      ))}
    </div>
  );
}
