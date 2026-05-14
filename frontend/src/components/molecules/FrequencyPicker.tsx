import type { HabitFrequency, Weekday } from '@/types/habit';

interface FrequencyPickerProps {
  value: HabitFrequency;
  onChange: (next: HabitFrequency) => void;
  disabled?: boolean;
}

const DAYS_LABEL: Record<Weekday, string> = {
  1: 'Lu',
  2: 'Ma',
  3: 'Mi',
  4: 'Ju',
  5: 'Vi',
  6: 'Sa',
  0: 'Do',
};

const ORDERED_DAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

export function FrequencyPicker({ value, onChange, disabled = false }: FrequencyPickerProps) {
  const kind = value.kind;
  const customDays = kind === 'custom' ? value.days : [];

  const toggleDay = (day: Weekday) => {
    const isOn = customDays.includes(day);
    const nextDays = (isOn ? customDays.filter((d) => d !== day) : [...customDays, day])
      .slice()
      .sort((a, b) => a - b);
    // Si el usuario deja todos vacíos, mantenemos el último seleccionado como mínimo.
    // El backend valida ≥1, así que evitamos el roundtrip de error.
    if (nextDays.length === 0) return;
    onChange({ kind: 'custom', days: nextDays });
  };

  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="mb-1 text-xs font-medium uppercase tracking-wider text-text-muted">
        Frecuencia
      </legend>

      <div className="flex flex-wrap gap-2">
        <FrequencyOption
          label="Todos los días"
          active={kind === 'daily'}
          onClick={() => onChange({ kind: 'daily' })}
        />
        <FrequencyOption
          label="Lunes a viernes"
          active={kind === 'weekdays'}
          onClick={() => onChange({ kind: 'weekdays' })}
        />
        <FrequencyOption
          label="Días específicos"
          active={kind === 'custom'}
          onClick={() => onChange({ kind: 'custom', days: customDays.length > 0 ? customDays : [1] })}
        />
      </div>

      {kind === 'custom' && (
        <div
          role="group"
          aria-label="Días de la semana"
          className="mt-2 flex flex-wrap gap-1"
        >
          {ORDERED_DAYS.map((day) => {
            const on = customDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                aria-pressed={on}
                aria-label={DAYS_LABEL[day]}
                className={`min-w-[2.5rem] rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                  on
                    ? 'border-accent bg-accent/20 text-accent'
                    : 'border-border-default bg-bg-surface/40 text-text-muted hover:border-border-strong hover:text-text-primary'
                }`}
              >
                {DAYS_LABEL[day]}
              </button>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}

function FrequencyOption({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
        active
          ? 'border-accent bg-accent/15 text-accent'
          : 'border-border-default bg-bg-surface/40 text-text-muted hover:border-border-strong hover:text-text-primary'
      }`}
    >
      {label}
    </button>
  );
}
