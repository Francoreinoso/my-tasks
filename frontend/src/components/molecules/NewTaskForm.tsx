import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Button } from '@/components/atoms/Button';
import type { CreateTaskInput } from '@/types/task';

interface NewTaskFormProps {
  onSubmit: (input: CreateTaskInput) => Promise<void> | void;
  disabled?: boolean;
}

export function NewTaskForm({ onSubmit, disabled = false }: NewTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const canSubmit = trimmedTitle.length > 0 && !submitting && !disabled;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: trimmedTitle,
        description: trimmedDescription.length === 0 ? null : trimmedDescription,
      });
      setTitle('');
      setDescription('');
    } catch {
      // El error queda en el store. Mantenemos los campos para reintentar.
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit();
  };

  // Enter envía en ambos campos. Shift+Enter en el textarea inserta un salto de línea
  // (convención Slack/Discord/WhatsApp). En el input título, Shift+Enter no aplica.
  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void submit();
    }
  };

  const handleDescriptionKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Nueva tarea"
      className="flex flex-col gap-3 rounded-lg border border-border-default bg-bg-surface/60 p-4 backdrop-blur-sm"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleTitleKeyDown}
        placeholder="Nueva tarea... (Enter para crear)"
        aria-label="Título de la nueva tarea"
        disabled={disabled || submitting}
        maxLength={200}
        className="rounded-md border border-border-default bg-bg-surface/60 px-4 py-2 text-text-primary placeholder:text-text-subtle focus:border-accent focus:outline-none disabled:opacity-50"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={handleDescriptionKeyDown}
        placeholder="Detalles (opcional) — Enter para crear, Shift+Enter para salto de línea"
        aria-label="Detalles de la nueva tarea"
        disabled={disabled || submitting}
        rows={3}
        maxLength={5000}
        className="resize-y rounded-md border border-border-default bg-bg-surface/60 px-4 py-2 text-sm leading-relaxed text-text-primary placeholder:text-text-subtle focus:border-accent focus:outline-none disabled:opacity-50"
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={!canSubmit}>
          {submitting ? 'Creando…' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
