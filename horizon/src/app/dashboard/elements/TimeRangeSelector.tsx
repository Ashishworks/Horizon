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
    <div
      className="
        relative flex w-fit p-1 rounded-4xl
        border border-green-500/60
        bg-white/5 backdrop-blur-md
        shadow-[0_0_20px_rgba(34,197,94,0.15)]
      "
    >
      {/* Glass slider */}
      <div
        className="
          absolute top-1 left-1
          h-[calc(100%-0.5rem)] w-20 rounded-4xl
          bg-green-500/10
          backdrop-blur-xl
          border border-green-400/50
          shadow-inner
          transition-transform duration-300 ease-out
        "
        style={{ transform: `translateX(${index * 80}px)` }}
      />

      {options.map((d) => (
        <button
          key={d}
          onClick={() => onChange(d)}
          className={`
            relative z-10 w-20 py-1.5 text-sm font-medium
            transition-colors
            ${
              value === d
                ? 'text-green-200'
                : 'text-muted-foreground hover:text-green-300'
            }
          `}
        >
          {d} days
        </button>
      ))}
    </div>
  );
}
