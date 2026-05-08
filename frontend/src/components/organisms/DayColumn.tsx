import { useDroppable } from '@dnd-kit/core';
import { DraggableTaskItem } from '@/components/molecules/DraggableTaskItem';
import type { Task, UpdateTaskInput } from '@/types/task';
import { fromIsoDate, getWeekDayName, isoToday } from '@/lib/dateUtils';

interface DayColumnProps {
  isoDate: string;
  tasks: Task[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, input: UpdateTaskInput) => void;
  onDelete: (id: string) => void;
}

export function DayColumn({ isoDate, tasks, onToggle, onUpdate, onDelete }: DayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: isoDate });

  const isToday = isoDate === isoToday();
  const dayName = getWeekDayName(isoDate);
  const dayNumber = fromIsoDate(isoDate).getDate();

  const borderClass = isOver
    ? 'border-accent ring-2 ring-accent/40'
    : isToday
      ? 'border-accent/60 bg-bg-elevated/50'
      : 'border-border-default bg-bg-surface/40';

  return (
    <article
      ref={setNodeRef}
      aria-label={`${dayName} ${String(dayNumber)}`}
      className={`flex min-h-[12rem] flex-col rounded-lg border transition-colors ${borderClass} p-3`}
    >
      <header className="mb-3 flex items-baseline justify-between border-b border-border-default pb-2">
        <h3 className="text-xs font-medium uppercase tracking-wider text-text-subtle">
          {dayName}
        </h3>
        <span
          className={`font-mono text-2xl ${
            isToday ? 'text-accent' : 'text-text-primary'
          }`}
        >
          {dayNumber}
        </span>
      </header>

      {tasks.length === 0 ? (
        <p className="mt-2 text-center text-xs text-text-subtle">—</p>
      ) : (
        <div role="list" className="flex flex-col gap-2">
          {tasks.map((task) => (
            <DraggableTaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </article>
  );
}
