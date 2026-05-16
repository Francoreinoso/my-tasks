import { useState, type FormEvent } from 'react';
import { Button } from '@/components/atoms/Button';

interface NewStudyTopicFormProps {
  onSubmit: (title: string) => Promise<void> | void;
  disabled?: boolean;
}

export function NewStudyTopicForm({ onSubmit, disabled = false }: NewStudyTopicFormProps) {
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const trimmed = title.trim();
    if (trimmed.length === 0 || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setTitle('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Nuevo tema de estudio"
      className="flex gap-2 rounded-lg border border-border-default bg-bg-surface/60 p-4 backdrop-blur-sm"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nuevo tema… (ej. React, Algoritmos, Inglés)"
        aria-label="Título del nuevo tema"
        disabled={disabled || submitting}
        maxLength={200}
        className="flex-1 rounded-md border border-border-default bg-bg-surface/60 px-4 py-2 text-text-primary placeholder:text-text-subtle focus:border-accent focus:outline-none disabled:opacity-50"
      />
      <Button
        type="submit"
        disabled={disabled || submitting || title.trim().length === 0}
      >
        {submitting ? 'Creando…' : 'Crear tema'}
      </Button>
    </form>
  );
}
