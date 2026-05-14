import { useHabits } from '@/hooks/useHabits';
import { NewHabitForm } from '@/components/molecules/NewHabitForm';
import { HabitList } from '@/components/organisms/HabitList';
import type { CreateHabitInput } from '@/types/habit';

export function RutinaPage() {
  const { habits, status, error, create, update, archive, unarchive, remove } = useHabits();

  const handleCreate = async (input: CreateHabitInput) => {
    await create(input);
  };

  return (
    <section className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h2 className="font-mono text-3xl tracking-tight text-text-primary">Rutina</h2>
        <p className="text-sm text-text-muted">
          Tus hábitos. Definí qué hacer cada día (o ciertos días) y la app va a
          llevarte la cuenta. Doble click sobre el nombre para editar.
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
          onUpdateName={(id, name) => void update(id, { name })}
          onArchive={(id) => void archive(id)}
          onUnarchive={(id) => void unarchive(id)}
          onDelete={(id) => void remove(id)}
        />
      )}
    </section>
  );
}
