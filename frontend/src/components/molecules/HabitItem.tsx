import { useState, type KeyboardEvent } from 'react';
import type { Habit, HabitFrequency } from '@/types/habit';

interface HabitItemProps {
  habit: Habit;
  onUpdateName: (id: string, name: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
  /**
   * 'card' (default): contenedor con borde y bg propios.
   * 'bare': sin borde ni bg; el padre se encarga del container visual.
   * Útil cuando HabitItem se compone dentro de un card mayor (ej. con tracker).
   */
  variant?: 'card' | 'bare';
}

const DAY_SHORT: Record<number, string> = {
  1: 'L',
  2: 'M',
  3: 'X',
  4: 'J',
  5: 'V',
  6: 'S',
  0: 'D',
};

function frequencyLabel(frequency: HabitFrequency): string {
  switch (frequency.kind) {
    case 'daily':
      return 'Todos los días';
    case 'weekdays':
      return 'Lun a Vie';
    case 'custom':
      return frequency.days
        .slice()
        .sort((a, b) => {
          // Mostrar en orden L M X J V S D (lunes primero)
          const order = (d: number) => (d === 0 ? 7 : d);
          return order(a) - order(b);
        })
        .map((d) => DAY_SHORT[d])
        .join(' ');
  }
}

export function HabitItem({
  habit,
  onUpdateName,
  onArchive,
  onUnarchive,
  onDelete,
  variant = 'card',
}: HabitItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(habit.name);

  const isArchived = habit.archivedAt !== null;
  const containerClasses =
    variant === 'card'
      ? 'rounded-md border border-border-default bg-bg-surface/60 px-4 py-3 backdrop-blur-sm hover:border-border-strong'
      : '';

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed.length === 0 || trimmed === habit.name) {
      setIsEditing(false);
      setDraft(habit.name);
      return;
    }
    onUpdateName(habit.id, trimmed);
    setIsEditing(false);
  };

  const cancel = () => {
    setDraft(habit.name);
    setIsEditing(false);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') cancel();
  };

  return (
    <div
      role="listitem"
      className={`group flex items-center gap-3 transition-colors ${containerClasses} ${
        isArchived ? 'opacity-60' : ''
      }`}
    >
      <div className="flex flex-1 flex-col gap-1">
        {isEditing ? (
          <input
            autoFocus
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKey}
            aria-label="Editar nombre del hábito"
            disabled={isArchived}
            className="rounded-md border border-border-strong bg-bg-elevated px-2 py-1 text-text-primary focus:border-accent focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onDoubleClick={() => !isArchived && setIsEditing(true)}
            className={`cursor-text text-left font-medium text-text-primary ${
              isArchived ? 'line-through' : ''
            }`}
            aria-label={`Editar "${habit.name}" (doble click)`}
            disabled={isArchived}
          >
            {habit.name}
          </button>
        )}
        <span
          className="text-xs text-text-muted"
          aria-label={`Frecuencia: ${frequencyLabel(habit.frequency)}`}
        >
          {frequencyLabel(habit.frequency)}
        </span>
      </div>

      {isArchived ? (
        <button
          type="button"
          onClick={() => onUnarchive(habit.id)}
          aria-label={`Restaurar "${habit.name}"`}
          className="rounded-md px-2 py-1 text-xs text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary"
        >
          Restaurar
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onArchive(habit.id)}
          aria-label={`Archivar "${habit.name}"`}
          className="rounded-md px-2 py-1 text-xs text-text-muted opacity-0 transition-opacity hover:bg-bg-elevated hover:text-text-primary group-hover:opacity-100 focus-visible:opacity-100"
        >
          Archivar
        </button>
      )}

      <button
        type="button"
        onClick={() => onDelete(habit.id)}
        aria-label={`Eliminar "${habit.name}"`}
        className="rounded-md p-1 text-text-subtle opacity-0 transition-opacity hover:bg-bg-elevated hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
}
