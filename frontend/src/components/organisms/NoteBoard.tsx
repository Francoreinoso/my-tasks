import type { Note } from '@/types/note';
import { NoteCard } from '@/components/molecules/NoteCard';

interface NoteBoardProps {
  notes: Note[];
  onOpen: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NoteBoard({ notes, onOpen, onDelete }: NoteBoardProps) {
  if (notes.length === 0) {
    return (
      <div
        role="status"
        className="rounded-lg border border-dashed border-border-default bg-bg-surface/40 p-10 text-center text-text-muted"
      >
        <p className="text-sm">Todavía no tenés notas.</p>
        <p className="text-xs text-text-subtle">
          Tocá <span className="font-medium text-text-muted">Nueva nota</span> para
          crear la primera.
        </p>
      </div>
    );
  }

  return (
    <div
      role="list"
      aria-label="Pizarra de notas"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {notes.map((note) => (
        <div role="listitem" key={note.id}>
          <NoteCard note={note} onClick={onOpen} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
}
