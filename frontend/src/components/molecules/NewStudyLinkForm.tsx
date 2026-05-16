import { useState, type FormEvent } from 'react';
import { Plus } from '@phosphor-icons/react';

interface NewStudyLinkFormProps {
  onAdd: (label: string, url: string) => Promise<void> | void;
}

export function NewStudyLinkForm({ onAdd }: NewStudyLinkFormProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setLabel('');
    setUrl('');
    setError(null);
    setOpen(false);
  };

  const submit = async () => {
    const lbl = label.trim();
    const u = url.trim();
    if (lbl.length === 0 || u.length === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onAdd(lbl, u);
      reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit();
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-text-subtle hover:bg-bg-elevated/50 hover:text-text-muted"
      >
        <Plus weight="light" size={14} />
        agregar recurso
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Nuevo recurso"
      className="flex flex-col gap-2 rounded-md border border-border-strong bg-bg-elevated/60 p-2"
    >
      <input
        type="text"
        autoFocus
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Etiqueta (ej. Curso JS Total)"
        aria-label="Etiqueta del recurso"
        maxLength={100}
        disabled={submitting}
        className="rounded-sm bg-transparent px-1 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none"
      />
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        aria-label="URL del recurso"
        disabled={submitting}
        className="rounded-sm bg-transparent px-1 text-xs text-text-muted placeholder:text-text-subtle focus:outline-none"
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex justify-end gap-2 text-xs">
        <button
          type="button"
          onClick={reset}
          className="rounded px-2 py-0.5 text-text-subtle hover:text-text-primary"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting || label.trim().length === 0 || url.trim().length === 0}
          className="rounded bg-accent px-2 py-0.5 text-bg-primary disabled:opacity-40"
        >
          {submitting ? 'Agregando…' : 'Agregar'}
        </button>
      </div>
    </form>
  );
}
