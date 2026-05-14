import { useState, type FormEvent } from 'react';
import { Button } from '@/components/atoms/Button';
import { FrequencyPicker } from '@/components/molecules/FrequencyPicker';
import type { CreateHabitInput, HabitFrequency } from '@/types/habit';

interface NewHabitFormProps {
  onSubmit: (input: CreateHabitInput) => Promise<void> | void;
  disabled?: boolean;
}

const DEFAULT_FREQUENCY: HabitFrequency = { kind: 'daily' };

export function NewHabitForm({ onSubmit, disabled = false }: NewHabitFormProps) {
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<HabitFrequency>(DEFAULT_FREQUENCY);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName('');
    setFrequency(DEFAULT_FREQUENCY);
  };

  const submit = async () => {
    const trimmed = name.trim();
    if (trimmed.length === 0 || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({ name: trimmed, frequency });
      reset();
    } catch {
      // El error queda registrado en el store. Mantenemos el form para corregir.
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
      aria-label="Nuevo hábito"
      className="flex flex-col gap-3 rounded-lg border border-border-default bg-bg-surface/60 p-4 backdrop-blur-sm"
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre del hábito (ej. Entrenar)"
        aria-label="Nombre del hábito"
        disabled={disabled || submitting}
        maxLength={200}
        className="rounded-md border border-border-default bg-bg-surface/60 px-4 py-2 text-text-primary placeholder:text-text-subtle focus:border-accent focus:outline-none disabled:opacity-50"
      />

      <FrequencyPicker
        value={frequency}
        onChange={setFrequency}
        disabled={disabled || submitting}
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={disabled || submitting || name.trim().length === 0}
        >
          {submitting ? 'Creando…' : 'Crear hábito'}
        </Button>
      </div>
    </form>
  );
}
