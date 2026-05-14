import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FrequencyPicker } from './FrequencyPicker';
import type { HabitFrequency } from '@/types/habit';

describe('FrequencyPicker', () => {
  it('marca la opción activa según value.kind', () => {
    render(<FrequencyPicker value={{ kind: 'weekdays' }} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /lunes a viernes/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('al elegir "Días específicos" llama onChange con custom y al menos un día', async () => {
    const onChange = vi.fn();
    render(<FrequencyPicker value={{ kind: 'daily' }} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: /días específicos/i }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'custom', days: expect.arrayContaining([1]) }),
    );
  });

  it('toggle de día agrega o quita de la lista, manteniéndola ordenada', async () => {
    const onChange = vi.fn();
    const value: HabitFrequency = { kind: 'custom', days: [1] };
    render(<FrequencyPicker value={value} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Mi' }));

    expect(onChange).toHaveBeenCalledWith({ kind: 'custom', days: [1, 3] });
  });

  it('no permite dejar custom sin ningún día seleccionado', async () => {
    const onChange = vi.fn();
    render(<FrequencyPicker value={{ kind: 'custom', days: [1] }} onChange={onChange} />);

    // Quitar el único día seleccionado debería ser un no-op
    await userEvent.click(screen.getByRole('button', { name: 'Lu' }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
