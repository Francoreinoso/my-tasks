import type { Note } from '@/types/note';

interface NoteCardProps {
  note: Note;
  onClick: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onClick, onDelete }: NoteCardProps) {
  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (confirm('¿Eliminar esta nota?')) {
      onDelete(note.id);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Abrir nota "${note.title ?? 'sin título'}"`}
      onClick={() => onClick(note)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(note);
        }
      }}
      className="group relative flex cursor-pointer flex-col gap-2 rounded-lg border border-border-default bg-bg-surface/60 p-4 text-left backdrop-blur-sm transition-colors hover:border-border-strong focus-visible:border-accent focus-visible:outline-none"
    >
      {note.title && (
        <h3 className="line-clamp-2 font-medium text-text-primary">{note.title}</h3>
      )}
      {note.content && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-muted line-clamp-6">
          {note.content}
        </p>
      )}
      <button
        type="button"
        onClick={handleDelete}
        aria-label={`Eliminar nota "${note.title ?? 'sin título'}"`}
        className="absolute right-2 top-2 rounded-md p-1 text-text-subtle opacity-0 transition-opacity hover:bg-bg-elevated hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </article>
  );
}
