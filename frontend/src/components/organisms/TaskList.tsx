import { TaskItem } from '@/components/molecules/TaskItem';
import type { Task, UpdateTaskInput } from '@/types/task';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, input: UpdateTaskInput) => void;
  onDelete: (id: string) => void;
  showDueDate?: boolean;
  /** Mensaje del estado vacío. Cambia entre "Tareas" y "Semana". */
  emptyMessage?: { title: string; hint: string; icon?: string };
}

const DEFAULT_EMPTY = {
  title: 'Sin tareas pendientes',
  hint: 'Empezá agregando una arriba.',
  icon: '🌸',
} as const;

export function TaskList({
  tasks,
  onToggle,
  onUpdate,
  onDelete,
  showDueDate = true,
  emptyMessage,
}: TaskListProps) {
  if (tasks.length === 0) {
    const empty = emptyMessage ?? DEFAULT_EMPTY;
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border-default bg-bg-surface/40 px-6 py-12 text-center text-text-muted"
      >
        <span aria-hidden="true" className="text-5xl">
          {empty.icon ?? '🌸'}
        </span>
        <p className="font-medium text-text-primary">{empty.title}</p>
        <p className="text-sm">{empty.hint}</p>
      </div>
    );
  }

  const pending = tasks.filter((t) => t.status === 'pending');
  const done = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="flex flex-col gap-6">
      {pending.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-text-subtle">
            Pendientes ({pending.length})
          </h3>
          <div role="list" className="flex flex-col gap-2">
            {pending.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onUpdate={onUpdate}
                onDelete={onDelete}
                showDueDate={showDueDate}
              />
            ))}
          </div>
        </section>
      )}

      {done.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-text-subtle">
            Completadas ({done.length})
          </h3>
          <div role="list" className="flex flex-col gap-2">
            {done.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onUpdate={onUpdate}
                onDelete={onDelete}
                showDueDate={showDueDate}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
