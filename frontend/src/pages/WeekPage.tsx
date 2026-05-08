import { useState, useMemo } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useTasks } from '@/hooks/useTasks';
import { WeekHeader } from '@/components/molecules/WeekHeader';
import { DayColumn } from '@/components/organisms/DayColumn';
import {
  addWeeks,
  getCurrentWeekStart,
  getWeekDays,
} from '@/lib/dateUtils';
import { resolveDropToUpdate } from '@/lib/weekDnd';

export function WeekPage() {
  const { tasks, status, error, toggle, update, remove } = useTasks();
  const [weekStart, setWeekStart] = useState(() => getCurrentWeekStart());

  // PointerSensor con activationConstraint distance:5 → hace falta MOVER el
  // mouse 5px para que arranque el drag. Así los clicks (ej. checkbox) siguen
  // funcionando normalmente.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const days = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const tasksByDay = useMemo(() => {
    const grouped = new Map<string, typeof tasks>();
    for (const day of days) grouped.set(day, []);
    for (const task of tasks) {
      if (task.dueDate && grouped.has(task.dueDate)) {
        grouped.get(task.dueDate)?.push(task);
      }
    }
    return grouped;
  }, [tasks, days]);

  const handleDragEnd = (event: DragEndEvent) => {
    const result = resolveDropToUpdate(event, tasks);
    if (result) {
      void update(result.taskId, result.input);
    }
  };

  const isCurrentWeek = weekStart === getCurrentWeekStart();

  return (
    <section className="mx-auto max-w-7xl">
      <WeekHeader
        weekStart={weekStart}
        onPrevious={() => setWeekStart((w) => addWeeks(w, -1))}
        onNext={() => setWeekStart((w) => addWeeks(w, 1))}
        onToday={() => setWeekStart(getCurrentWeekStart())}
        isCurrentWeek={isCurrentWeek}
      />

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error}
        </div>
      )}

      {status === 'loading' && tasks.length === 0 ? (
        <p className="text-text-muted">Cargando tareas…</p>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-7">
            {days.map((day) => (
              <DayColumn
                key={day}
                isoDate={day}
                tasks={tasksByDay.get(day) ?? []}
                onToggle={(id) => void toggle(id)}
                onUpdate={(id, input) => void update(id, input)}
                onDelete={(id) => void remove(id)}
              />
            ))}
          </div>
        </DndContext>
      )}
    </section>
  );
}
