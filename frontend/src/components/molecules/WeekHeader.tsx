import { Button } from '@/components/atoms/Button';
import { formatWeekRange } from '@/lib/dateUtils';

interface WeekHeaderProps {
  weekStart: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  isCurrentWeek: boolean;
}

export function WeekHeader({
  weekStart,
  onPrevious,
  onNext,
  onToday,
  isCurrentWeek,
}: WeekHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="font-mono text-3xl tracking-tight text-text-primary">Semana</h2>
        <p className="text-sm text-text-muted">
          <span aria-label="Rango de fechas" className="font-mono">
            {formatWeekRange(weekStart)}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={onPrevious}
          aria-label="Semana anterior"
          className="px-3 py-2"
        >
          <span aria-hidden="true">←</span>
        </Button>
        <Button
          variant="secondary"
          onClick={onToday}
          disabled={isCurrentWeek}
          aria-label="Ir a la semana actual"
        >
          Hoy
        </Button>
        <Button
          variant="ghost"
          onClick={onNext}
          aria-label="Semana siguiente"
          className="px-3 py-2"
        >
          <span aria-hidden="true">→</span>
        </Button>
      </div>
    </header>
  );
}
