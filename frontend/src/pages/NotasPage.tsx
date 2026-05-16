import { useState } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { Button } from '@/components/atoms/Button';
import { NoteBoard } from '@/components/organisms/NoteBoard';
import { NoteEditorModal } from '@/components/molecules/NoteEditorModal';
import type { Note } from '@/types/note';

type EditorTarget = { mode: 'new' } | { mode: 'edit'; note: Note };

export function NotasPage() {
  const { notes, status, error, create, update, remove } = useNotes();
  const [editor, setEditor] = useState<EditorTarget | null>(null);

  const openNew = () => {
    setEditor({ mode: 'new' });
  };

  const openExisting = (note: Note) => {
    setEditor({ mode: 'edit', note });
  };

  const closeEditor = () => {
    setEditor(null);
  };

  const handleSubmit = async (input: { title: string | null; content: string | null }) => {
    if (editor?.mode === 'edit') {
      await update(editor.note.id, input);
    } else {
      await create(input);
    }
  };

  return (
    <section className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-mono text-3xl tracking-tight text-text-primary">Notas</h2>
          <p className="text-sm text-text-muted">
            Tu pizarra de notas. Click en una nota para editarla.
          </p>
        </div>
        <Button onClick={openNew} disabled={status === 'loading'}>
          + Nueva nota
        </Button>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error}
        </div>
      )}

      {status === 'loading' && notes.length === 0 ? (
        <p className="text-text-muted">Cargando notas…</p>
      ) : (
        <NoteBoard
          notes={notes}
          onOpen={openExisting}
          onDelete={(id) => void remove(id)}
        />
      )}

      {editor && (
        <NoteEditorModal
          key={editor.mode === 'edit' ? editor.note.id : 'new'}
          note={editor.mode === 'edit' ? editor.note : null}
          onClose={closeEditor}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}
