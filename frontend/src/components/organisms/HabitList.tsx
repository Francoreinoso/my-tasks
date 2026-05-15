import { HabitItem } from '@/components/molecules/HabitItem';
import { HabitTracker } from '@/components/molecules/HabitTracker';
import type { Habit, HabitCompletion, HabitStats } from '@/types/habit';

interface HabitListProps {
  habits: Habit[];
  completionsByHabit: Record<string, HabitCompletion[]>;
  statsByHabit: Record<string, HabitStats>;
  trackerDays: string[];
  onUpdateName: (id: string, name: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
  onMark: (habitId: string, date: string) => void;
  onUnmark: (habitId: string, date: string) => void;
}

export function HabitList({
  habits,
  completionsByHabit,
  statsByHabit,
  trackerDays,
  onUpdateName,
  onArchive,
  onUnarchive,
  onDelete,
  onMark,
  onUnmark,
}: HabitListProps) {
  const active = habits.filter((h) => h.archivedAt === null);
  const archived = habits.filter((h) => h.archivedAt !== null);

  if (habits.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border-default px-4 py-8 text-center text-sm text-text-muted">
        Todavía no tenés hábitos. Creá el primero con el formulario de arriba.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section aria-label="Hábitos activos">
        {active.length === 0 ? (
          <p className="text-sm text-text-muted">No tenés hábitos activos.</p>
        ) : (
          <div role="list" className="flex flex-col gap-3">
            {active.map((h) => (
              <div key={h.id} className="flex flex-col gap-2">
                <HabitItem
                  habit={h}
                  onUpdateName={onUpdateName}
                  onArchive={onArchive}
                  onUnarchive={onUnarchive}
                  onDelete={onDelete}
                />
                <div className="ml-2 rounded-md border border-border-default/40 bg-bg-surface/30 px-3 py-2 backdrop-blur-sm">
                  <HabitTracker
                    habit={h}
                    completions={completionsByHabit[h.id] ?? []}
                    stats={statsByHabit[h.id] ?? null}
                    days={trackerDays}
                    onMark={(date) => onMark(h.id, date)}
                    onUnmark={(date) => onUnmark(h.id, date)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {archived.length > 0 && (
        <section aria-label="Hábitos archivados">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
            Archivados
          </h3>
          <div role="list" className="flex flex-col gap-2">
            {archived.map((h) => (
              <HabitItem
                key={h.id}
                habit={h}
                onUpdateName={onUpdateName}
                onArchive={onArchive}
                onUnarchive={onUnarchive}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
