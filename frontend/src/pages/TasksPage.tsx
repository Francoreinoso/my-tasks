import { useTasks } from '@/hooks/useTasks';
import { NewTaskForm } from '@/components/molecules/NewTaskForm';
import { TaskList } from '@/components/organisms/TaskList';
import type { CreateTaskInput } from '@/types/task';

export function TasksPage() {
  const { tasks, status, error, create, toggle, update, remove } = useTasks();

  const handleCreate = async (input: CreateTaskInput) => {
    await create(input);
  };

  return (
    <section className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h2 className="font-mono text-3xl tracking-tight text-text-primary">Tareas</h2>
        <p className="text-sm text-text-muted">
          Tus pendientes. Doble click sobre el título para editar. Click en el icono 📅 para
          asignar día.
        </p>
      </header>

      <div className="mb-6">
        <NewTaskForm onSubmit={handleCreate} disabled={status === 'loading'} />
      </div>

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
        <TaskList
          tasks={tasks}
          onToggle={(id) => void toggle(id)}
          onUpdate={(id, input) => void update(id, input)}
          onDelete={(id) => void remove(id)}
        />
      )}
    </section>
  );
}
