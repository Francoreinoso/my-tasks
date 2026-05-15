import { useEffect } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { NewHabitForm } from '@/components/molecules/NewHabitForm';
import { HabitList } from '@/components/organisms/HabitList';
import { lastNDays } from '@/lib/dateUtils';
import type { CreateHabitInput } from '@/types/habit';

const TRACKER_DISPLAY_DAYS = 7;

export function RutinaPage() {
  const {
    habits,
    status,
    error,
    completionsByHabit,
    statsByHabit,
    trackingRange,
    create,
    update,
    archive,
    unarchive,
    remove,
    loadTracking,
    markCompletion,
    unmarkCompletion,
  } = useHabits();

  // Una vez que los hábitos cargaron, traemos su tracking (completions + stats).
  // Se reintenta si la lista de hábitos cambia (ej. después de crear/eliminar).
  useEffect(() => {
    if (status === 'ready' && habits.length > 0) {
      void loadTracking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, habits.length]);

  const trackerDays = trackingRange
    ? lastNDays(TRACKER_DISPLAY_DAYS, trackingRange.asOf)
    : lastNDays(TRACKER_DISPLAY_DAYS);

  const handleCreate = async (input: CreateHabitInput) => {
    await create(input);
  };

  return (
    <section className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h2 className="font-mono text-3xl tracking-tight text-text-primary">Rutina</h2>
        <p className="text-sm text-text-muted">
          Tus hábitos. Definí qué hacer cada día (o ciertos días) y marcá los que
          cumpliste. Doble click sobre el nombre para editar.
        </p>
      </header>

      <div className="mb-6">
        <NewHabitForm onSubmit={handleCreate} disabled={status === 'loading'} />
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error}
        </div>
      )}

      {status === 'loading' && habits.length === 0 ? (
        <p className="text-text-muted">Cargando hábitos…</p>
      ) : (
        <HabitList
          habits={habits}
          completionsByHabit={completionsByHabit}
          statsByHabit={statsByHabit}
          trackerDays={trackerDays}
          onUpdateName={(id, name) => void update(id, { name })}
          onArchive={(id) => void archive(id)}
          onUnarchive={(id) => void unarchive(id)}
          onDelete={(id) => void remove(id)}
          onMark={(habitId, date) => void markCompletion(habitId, date)}
          onUnmark={(habitId, date) => void unmarkCompletion(habitId, date)}
        />
      )}
    </section>
  );
}
