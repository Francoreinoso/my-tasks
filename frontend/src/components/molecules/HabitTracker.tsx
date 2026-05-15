import type { Habit, HabitCompletion, HabitStats } from '@/types/habit';
import { isApplicableOn } from '@/lib/habitFrequency';
import { getWeekday, isoToday } from '@/lib/dateUtils';

interface HabitTrackerProps {
  habit: Habit;
  completions: HabitCompletion[];
  stats: HabitStats | null;
  days: string[];
  onMark: (date: string) => void;
  onUnmark: (date: string) => void;
}

const WEEKDAY_LABEL: Record<number, string> = {
  1: 'L',
  2: 'M',
  3: 'X',
  4: 'J',
  5: 'V',
  6: 'S',
  0: 'D',
};

export function HabitTracker({
  habit,
  completions,
  stats,
  days,
  onMark,
  onUnmark,
}: HabitTrackerProps) {
  const completedDates = new Set(completions.map((c) => c.date));
  const today = isoToday();

  const handleToggle = (date: string) => {
    if (completedDates.has(date)) {
      onUnmark(date);
    } else {
      onMark(date);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div role="group" aria-label="Últimos días" className="flex gap-1">
        {days.map((date) => {
          const completed = completedDates.has(date);
          const applicable = isApplicableOn(habit.frequency, date);
          const isToday = date === today;
          const weekdayLabel = WEEKDAY_LABEL[getWeekday(date)] ?? '?';

          return (
            <button
              key={date}
              type="button"
              onClick={() => handleToggle(date)}
              aria-label={`${weekdayLabel} ${date}${completed ? ' (cumplido)' : ''}`}
              aria-pressed={completed}
              className={[
                'flex h-9 w-9 flex-col items-center justify-center rounded-md border text-xs font-medium transition-colors',
                completed
                  ? 'border-accent bg-accent/20 text-accent'
                  : applicable
                    ? 'border-border-default bg-bg-surface/40 text-text-muted hover:border-border-strong hover:text-text-primary'
                    : 'border-border-default/40 bg-bg-surface/20 text-text-subtle/60 hover:border-border-default',
                isToday ? 'ring-2 ring-accent/40 ring-offset-1 ring-offset-bg-surface' : '',
              ].join(' ')}
            >
              <span aria-hidden="true">{weekdayLabel}</span>
              <span aria-hidden="true" className="text-[10px] leading-none">
                {completed ? '✓' : applicable ? '' : '·'}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex min-w-[90px] flex-col items-end gap-0.5">
        {stats ? (
          <>
            <span
              className="font-medium text-text-primary"
              aria-label={`Racha de ${String(stats.streak)} días`}
            >
              🔥 {stats.streak}
            </span>
            <span className="text-xs text-text-muted">
              {stats.rate.applicable > 0
                ? `${String(Math.round(stats.rate.rate * 100))}% (mes)`
                : 'sin días aplicables'}
            </span>
          </>
        ) : (
          <span className="text-xs text-text-subtle">Cargando…</span>
        )}
      </div>
    </div>
  );
}
