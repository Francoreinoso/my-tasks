import {
  useEffect,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { Button } from '@/components/atoms/Button';
import type { Note } from '@/types/note';

interface NoteEditorModalProps {
  /** Si se provee, se edita; si es null, se crea una nota nueva. */
  note: Note | null;
  onClose: () => void;
  onSubmit: (input: { title: string | null; content: string | null }) => Promise<void> | void;
}

/**
 * Modal de creación/edición. Se monta solo cuando el padre lo necesita
 * (no usar prop `open`). Para abrir con otra nota, el padre debe remontar
 * con un `key` distinto.
 */
export function NoteEditorModal({ note, onClose, onSubmit }: NoteEditorModalProps) {
  const [title, setTitle] = useState<string>(note?.title ?? '');
  const [content, setContent] = useState<string>(note?.content ?? '');
  const [submitting, setSubmitting] = useState(false);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [onClose]);

  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();
  const isEmpty = trimmedTitle.length === 0 && trimmedContent.length === 0;

  const submit = async () => {
    if (isEmpty || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: trimmedTitle.length === 0 ? null : trimmedTitle,
        content: trimmedContent.length === 0 ? null : trimmedContent,
      });
      onClose();
    } catch {
      // Error queda en el store. Dejamos el modal abierto para reintentar.
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit();
  };

  // Enter guarda, Shift+Enter inserta salto de línea (convención unificada con Tareas).
  const handleContentKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={note ? 'Editar nota' : 'Nueva nota'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/70 px-4 py-8 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-2xl flex-col gap-4 rounded-lg border border-border-default bg-bg-surface p-6 shadow-2xl"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título (opcional)"
          aria-label="Título"
          maxLength={200}
          autoFocus={!note}
          className="rounded-md border border-border-default bg-bg-surface/60 px-4 py-2 text-lg font-medium text-text-primary placeholder:text-text-subtle focus:border-accent focus:outline-none"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleContentKeyDown}
          placeholder="Contenido… (Enter para guardar, Shift+Enter para salto de línea)"
          aria-label="Contenido"
          maxLength={10000}
          rows={12}
          className="resize-y rounded-md border border-border-default bg-bg-surface/60 px-4 py-2 font-mono text-sm leading-relaxed text-text-primary placeholder:text-text-subtle focus:border-accent focus:outline-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-subtle">
            {trimmedContent.length} / 10000
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isEmpty || submitting}>
              {submitting ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
