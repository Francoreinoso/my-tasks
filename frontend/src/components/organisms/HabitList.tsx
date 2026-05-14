import { HabitItem } from '@/components/molecules/HabitItem';
import type { Habit } from '@/types/habit';

interface HabitListProps {
  habits: Habit[];
  onUpdateName: (id: string, name: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export function HabitList({
  habits,
  onUpdateName,
  onArchive,
  onUnarchive,
  onDelete,
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
          <div role="list" className="flex flex-col gap-2">
            {active.map((h) => (
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
