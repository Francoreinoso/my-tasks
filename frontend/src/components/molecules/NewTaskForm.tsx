import { useState, type FormEvent } from 'react';
import { Button } from '@/components/atoms/Button';

interface NewTaskFormProps {
  onSubmit: (title: string) => Promise<void> | void;
  disabled?: boolean;
}

export function NewTaskForm({ onSubmit, disabled = false }: NewTaskFormProps) {
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const trimmed = title.trim();
    if (trimmed.length === 0 || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setTitle('');
    } catch {
      // El error ya queda registrado en el store (state.error). Mantenemos el input.
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2" aria-label="Nueva tarea">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nueva tarea... (Enter para crear)"
        aria-label="Título de la nueva tarea"
        disabled={disabled || submitting}
        className="flex-1 rounded-md border border-border-default bg-bg-surface/60 px-4 py-2 text-text-primary placeholder:text-text-subtle focus:border-accent focus:outline-none disabled:opacity-50"
        maxLength={200}
      />
      <Button
        type="submit"
        disabled={disabled || submitting || title.trim().length === 0}
      >
        {submitting ? 'Creando…' : 'Crear'}
      </Button>
    </form>
  );
}
