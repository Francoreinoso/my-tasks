import { useState, type KeyboardEvent } from 'react';
import type { Task, UpdateTaskInput } from '@/types/task';
import { formatDDMMYYYY } from '@/lib/dateUtils';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, input: UpdateTaskInput) => void;
  onDelete: (id: string) => void;
  /**
   * Si false, no se muestra el control de dueDate.
   * Útil en la vista Semana donde la columna ya implica el día.
   */
  showDueDate?: boolean;
}

export function TaskItem({
  task,
  onToggle,
  onUpdate,
  onDelete,
  showDueDate = true,
}: TaskItemProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const [isEditingDate, setIsEditingDate] = useState(false);

  const isDone = task.status === 'completed';

  const startEditTitle = () => {
    setDraft(task.title);
    setIsEditingTitle(true);
  };

  const commitTitle = () => {
    const trimmed = draft.trim();
    if (trimmed.length === 0 || trimmed === task.title) {
      setIsEditingTitle(false);
      setDraft(task.title);
      return;
    }
    onUpdate(task.id, { title: trimmed });
    setIsEditingTitle(false);
  };

  const cancelTitle = () => {
    setDraft(task.title);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitTitle();
    if (e.key === 'Escape') cancelTitle();
  };

  const handleDateChange = (newDate: string) => {
    const value = newDate === '' ? null : newDate;
    if (value !== task.dueDate) {
      onUpdate(task.id, { dueDate: value });
    }
    setIsEditingDate(false);
  };

  return (
    <div
      role="listitem"
      className={`group flex items-center gap-3 rounded-md border border-border-default bg-bg-surface/60 px-4 py-3 backdrop-blur-sm transition-colors hover:border-border-strong ${
        isDone ? 'opacity-60' : ''
      }`}
    >
      <input
        type="checkbox"
        checked={isDone}
        onChange={() => onToggle(task.id)}
        aria-label={isDone ? `Reabrir "${task.title}"` : `Completar "${task.title}"`}
        className="h-5 w-5 cursor-pointer accent-accent"
      />

      {isEditingTitle ? (
        <input
          autoFocus
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitTitle}
          onKeyDown={handleTitleKeyDown}
          aria-label="Editar título"
          className="flex-1 rounded-md border border-border-strong bg-bg-elevated px-2 py-1 text-text-primary focus:border-accent focus:outline-none"
        />
      ) : (
        <button
          type="button"
          onDoubleClick={startEditTitle}
          className={`flex-1 cursor-text text-left text-text-primary ${isDone ? 'line-through' : ''}`}
          aria-label={`Editar "${task.title}" (doble click)`}
        >
          {task.title}
        </button>
      )}

      {showDueDate && (
        <div className="shrink-0">
          {isEditingDate ? (
            <input
              autoFocus
              type="date"
              value={task.dueDate ?? ''}
              onChange={(e) => handleDateChange(e.target.value)}
              onBlur={() => setIsEditingDate(false)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsEditingDate(false);
              }}
              aria-label="Asignar fecha"
              className="rounded-md border border-border-strong bg-bg-elevated px-2 py-1 text-sm text-text-primary focus:border-accent focus:outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingDate(true)}
              aria-label={
                task.dueDate
                  ? `Cambiar fecha (actual: ${formatDDMMYYYY(task.dueDate)})`
                  : 'Asignar fecha'
              }
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary"
            >
              <span aria-hidden="true">📅</span>
              <span className="font-mono">
                {task.dueDate ? formatDDMMYYYY(task.dueDate) : 'sin día'}
              </span>
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => onDelete(task.id)}
        aria-label={`Eliminar "${task.title}"`}
        className="rounded-md p-1 text-text-subtle opacity-0 transition-opacity hover:bg-bg-elevated hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
}
