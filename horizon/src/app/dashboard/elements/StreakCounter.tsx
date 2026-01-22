'use client';

import { differenceInCalendarDays, parseISO } from 'date-fns';
import FireFlames from '../ui/fireEmoji';
import TrophyAward from '../ui/trophyEmoji';

export default function StreakCounter({ entries }: { entries: any[] }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="flex flex-row md:flex-col items-center justify-center h-full gap-8 md:gap-4">
        <div className="text-center">
          <p className="text-5xl font-bold text-orange-400"><FireFlames /> 0</p>
          <p className="text-sm text-muted-foreground">Current Streak</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-green-400"><TrophyAward /> 0</p>
          <p className="text-sm text-muted-foreground">Best Streak</p>
        </div>
      </div>
    );
  }

  // sort dates ascending
  const dates = entries
    .map(e => parseISO(e.date))
    .sort((a, b) => a.getTime() - b.getTime());

  // best streak
  let best = 1;
  let streak = 1;

  for (let i = 1; i < dates.length; i++) {
    const diff = differenceInCalendarDays(dates[i], dates[i - 1]);
    if (diff === 1) {
      streak++;
      best = Math.max(best, streak);
    } else if (diff > 1) {
      streak = 1;
    }
  }

  // current streak
  let current = 1;
  for (let i = dates.length - 1; i > 0; i--) {
    const diff = differenceInCalendarDays(dates[i], dates[i - 1]);
    if (diff === 1) current++;
    else break;
  }

  return (
    <div className="flex flex-row md:flex-col items-center justify-center h-full gap-8 md:gap-4">
      <div className="text-center">
        <p className="text-5xl font-bold text-orange-400"><FireFlames /> {current}</p>
        <p className="text-sm text-muted-foreground">Current Streak</p>
      </div>

      <div className="text-center">
        <p className="text-2xl font-semibold text-green-400"><TrophyAward /> {best}</p>
        <p className="text-sm text-muted-foreground">Best Streak</p>
      </div>
    </div>
  );
}
