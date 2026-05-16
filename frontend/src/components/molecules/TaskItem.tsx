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
  /**
   * Si false, no se muestra la descripción ni el affordance para editarla.
   * Útil en la vista Semana donde las columnas son angostas.
   */
  showDescription?: boolean;
}

export function TaskItem({
  task,
  onToggle,
  onUpdate,
  onDelete,
  showDueDate = true,
  showDescription = true,
}: TaskItemProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState(task.description ?? '');

  const isDone = task.status === 'completed';

  const startEditTitle = () => {
    setTitleDraft(task.title);
    setIsEditingTitle(true);
  };

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed.length === 0 || trimmed === task.title) {
      setIsEditingTitle(false);
      setTitleDraft(task.title);
      return;
    }
    onUpdate(task.id, { title: trimmed });
    setIsEditingTitle(false);
  };

  const cancelTitle = () => {
    setTitleDraft(task.title);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitTitle();
    if (e.key === 'Escape') cancelTitle();
  };

  const startEditDescription = () => {
    setDescriptionDraft(task.description ?? '');
    setIsEditingDescription(true);
  };

  const commitDescription = () => {
    const trimmed = descriptionDraft.trim();
    const next = trimmed.length === 0 ? null : trimmed;
    if (next !== task.description) {
      onUpdate(task.id, { description: next });
    }
    setIsEditingDescription(false);
  };

  const cancelDescription = () => {
    setDescriptionDraft(task.description ?? '');
    setIsEditingDescription(false);
  };

  const handleDescriptionKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter guarda. Shift+Enter inserta salto de línea (convención Slack/Discord).
    // Escape cancela sin guardar.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commitDescription();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelDescription();
    }
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
      className={`group flex flex-col gap-2 rounded-md border border-border-default bg-bg-surface/60 px-4 py-3 backdrop-blur-sm transition-colors hover:border-border-strong ${
        isDone ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center gap-3">
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
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
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

      {showDescription && (
        <div className="pl-8">
          {isEditingDescription ? (
            <textarea
              autoFocus
              value={descriptionDraft}
              onChange={(e) => setDescriptionDraft(e.target.value)}
              onBlur={commitDescription}
              onKeyDown={handleDescriptionKeyDown}
              aria-label="Editar detalles"
              rows={Math.max(3, descriptionDraft.split('\n').length + 1)}
              maxLength={5000}
              placeholder="Detalles… (Enter para guardar, Shift+Enter para salto de línea, Escape para cancelar)"
              className="w-full resize-y rounded-md border border-border-strong bg-bg-elevated px-2 py-1 text-sm leading-relaxed text-text-primary placeholder:text-text-subtle focus:border-accent focus:outline-none"
            />
          ) : task.description ? (
            <button
              type="button"
              onDoubleClick={startEditDescription}
              aria-label="Editar detalles (doble click)"
              className="w-full cursor-text whitespace-pre-wrap text-left text-sm leading-relaxed text-text-muted"
            >
              {task.description}
            </button>
          ) : (
            <button
              type="button"
              onClick={startEditDescription}
              aria-label="Agregar detalles"
              className="text-xs text-text-subtle opacity-0 transition-opacity hover:text-text-muted group-hover:opacity-100 focus-visible:opacity-100"
            >
              + agregar detalles
            </button>
          )}
        </div>
      )}
    </div>
  );
}
