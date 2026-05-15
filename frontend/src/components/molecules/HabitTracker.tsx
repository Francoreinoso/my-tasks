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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="group"
        aria-label="Últimos días"
        className="flex justify-between gap-1 sm:justify-start"
      >
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
                'flex h-10 w-10 flex-col items-center justify-center rounded-md border text-xs font-medium transition-all active:scale-95',
                completed
                  ? 'border-accent bg-accent/25 text-accent-soft shadow-[0_0_12px_-4px_var(--accent)]'
                  : applicable
                    ? 'border-border-default bg-bg-surface/50 text-text-muted hover:border-accent/60 hover:bg-bg-elevated hover:text-text-primary'
                    : 'border-border-default/30 bg-bg-surface/20 text-text-subtle/50 hover:border-border-default/60',
                isToday && !completed
                  ? 'ring-1 ring-inset ring-accent/50'
                  : '',
              ].join(' ')}
            >
              <span aria-hidden="true" className="leading-none">
                {weekdayLabel}
              </span>
              <span aria-hidden="true" className="text-[11px] leading-none">
                {completed ? '✓' : applicable ? '' : '·'}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-3 sm:min-w-[110px] sm:flex-col sm:items-end sm:gap-0.5">
        {stats ? (
          <>
            <span
              className="text-base font-semibold text-text-primary"
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
