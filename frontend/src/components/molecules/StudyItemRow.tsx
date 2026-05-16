import { useState, type KeyboardEvent } from 'react';
import { Trash } from '@phosphor-icons/react';
import type { StudyItem } from '@/types/study';

interface StudyItemRowProps {
  item: StudyItem;
  onToggle: (itemId: string) => void;
  onUpdate: (itemId: string, label: string) => void;
  onDelete: (itemId: string) => void;
}

export function StudyItemRow({ item, onToggle, onUpdate, onDelete }: StudyItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(item.label);

  const startEdit = () => {
    setDraft(item.label);
    setIsEditing(true);
  };

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed.length === 0 || trimmed === item.label) {
      setDraft(item.label);
      setIsEditing(false);
      return;
    }
    onUpdate(item.id, trimmed);
    setIsEditing(false);
  };

  const cancel = () => {
    setDraft(item.label);
    setIsEditing(false);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  };

  return (
    <div className="group flex items-center gap-3 rounded-md px-2 py-1 hover:bg-bg-elevated/50">
      <input
        type="checkbox"
        checked={item.completed}
        onChange={() => onToggle(item.id)}
        aria-label={
          item.completed ? `Desmarcar "${item.label}"` : `Marcar "${item.label}"`
        }
        className="h-4 w-4 cursor-pointer accent-accent"
      />
      {isEditing ? (
        <input
          autoFocus
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKey}
          aria-label="Editar subtema"
          maxLength={200}
          className="flex-1 rounded-md border border-border-strong bg-bg-elevated px-2 py-0.5 text-sm text-text-primary focus:border-accent focus:outline-none"
        />
      ) : (
        <button
          type="button"
          onDoubleClick={startEdit}
          aria-label={`Editar "${item.label}" (doble click)`}
          className={`flex-1 cursor-text text-left text-sm ${
            item.completed
              ? 'text-text-subtle line-through'
              : 'text-text-primary'
          }`}
        >
          {item.label}
        </button>
      )}
      <button
        type="button"
        onClick={() => onDelete(item.id)}
        aria-label={`Eliminar "${item.label}"`}
        className="rounded p-1 text-text-subtle opacity-0 transition-opacity hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
      >
        <Trash weight="light" size={14} />
      </button>
    </div>
  );
}
