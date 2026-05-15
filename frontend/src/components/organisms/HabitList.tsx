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
      <div className="rounded-lg border border-dashed border-border-default bg-bg-surface/30 px-6 py-10 text-center backdrop-blur-sm">
        <p className="mb-2 text-4xl" aria-hidden="true">
          🌱
        </p>
        <p className="text-base font-medium text-text-primary">
          Tu rutina arranca acá
        </p>
        <p className="mx-auto mt-1 max-w-xs text-sm text-text-muted">
          Creá tu primer hábito arriba. Empezá con algo chico y diario — la
          constancia se mide, no se promete.
        </p>
      </div>
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
              <article
                key={h.id}
                className="mt-fade-in-up group rounded-lg border border-border-default bg-bg-surface/60 px-4 py-3 backdrop-blur-sm transition-colors hover:border-border-strong"
              >
                <HabitItem
                  habit={h}
                  variant="bare"
                  onUpdateName={onUpdateName}
                  onArchive={onArchive}
                  onUnarchive={onUnarchive}
                  onDelete={onDelete}
                />
                <div className="mt-3 border-t border-border-default/40 pt-3">
                  <HabitTracker
                    habit={h}
                    completions={completionsByHabit[h.id] ?? []}
                    stats={statsByHabit[h.id] ?? null}
                    days={trackerDays}
                    onMark={(date) => onMark(h.id, date)}
                    onUnmark={(date) => onUnmark(h.id, date)}
                  />
                </div>
              </article>
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
