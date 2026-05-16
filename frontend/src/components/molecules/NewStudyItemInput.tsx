import { useState, type FormEvent } from 'react';
import { Plus } from '@phosphor-icons/react';

interface NewStudyItemInputProps {
  onAdd: (label: string) => Promise<void> | void;
}

export function NewStudyItemInput({ onAdd }: NewStudyItemInputProps) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const trimmed = value.trim();
    if (trimmed.length === 0 || submitting) return;
    setSubmitting(true);
    try {
      await onAdd(trimmed);
      setValue('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 px-2 py-1">
      <Plus weight="light" size={16} className="shrink-0 text-text-subtle" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Agregar subtema… (Enter)"
        aria-label="Nuevo subtema"
        maxLength={200}
        disabled={submitting}
        className="flex-1 rounded-md bg-transparent px-1 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none disabled:opacity-50"
      />
    </form>
  );
}
