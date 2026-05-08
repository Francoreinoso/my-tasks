import type { DragEndEvent } from '@dnd-kit/core';
import type { Task, UpdateTaskInput } from '@/types/task';

/**
 * Lógica pura del drop: dada una lista de tareas, el evento de dnd-kit y un
 * callback de update, decide si llamar update y con qué args.
 *
 * Se mantiene como función separada del componente para poder testearla sin
 * montar dnd-kit en JSDOM (que tiene soporte limitado de pointer events).
 */
export function resolveDropToUpdate(
  event: DragEndEvent,
  tasks: Task[],
): { taskId: string; input: UpdateTaskInput } | null {
  const { active, over } = event;
  if (!over) return null;

  const taskId = String(active.id);
  const targetDate = String(over.id);

  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;
  if (task.dueDate === targetDate) return null;

  return { taskId, input: { dueDate: targetDate } };
}
