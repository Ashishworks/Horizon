'use client';

type Props = {
  value: number;
};

export default function MoodVolatilityLine({ value }: Props) {
  const max = 6;
  const clamped = Math.min(Math.max(value, 0), max);
  const percentage = (clamped / max) * 100;

  const label =
    value <= 2
      ? { text: 'Stable', color: 'text-emerald-400' }
      : value <= 4
      ? { text: 'Moderate', color: 'text-amber-400' }
      : { text: 'High swings', color: 'text-rose-400' };

  return (
    <div className="w-full space-y-1">

      {/* Top row: value + label */}
      <div className="flex items-center justify-between">
  {/* Left: value */}
  <p className="text-3xl font-bold tabular-nums">
    {value.toFixed(2)}
  </p>

  {/* Right: tag */}
  <p className={`text-sm font-medium ${label.color}`}>
    {label.text}
  </p>
</div>


      {/* Centered title */}
      <p className="text-sm font-medium text-muted-foreground text-center">
        Mood volatility
      </p>

      {/* Number line */}
      <div className="relative h-3 rounded-full overflow-hidden bg-muted">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 opacity-70" />
        <div className="absolute inset-0 bg-black/10 dark:bg-white/5" />

        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{ left: `${percentage}%` }}
        >
          <div
            className="
              h-2.5 w-2.5 rounded-full
              bg-background
              border border-border
              shadow-md
              ring-1 ring-white/90 dark:ring-black/90
              backdrop-blur
            "
          />
        </div>
      </div>

      {/* Scale */}
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>0</span>
        <span>2</span>
        <span>4</span>
        <span>6</span>
      </div>
    </div>
  );
}
