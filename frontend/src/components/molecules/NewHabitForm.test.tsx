import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewHabitForm } from './NewHabitForm';

describe('NewHabitForm', () => {
  it('envía name + frequency por defecto (daily) al submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<NewHabitForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/nombre del hábito/i), 'Entrenar');
    await userEvent.click(screen.getByRole('button', { name: /crear hábito/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Entrenar',
      frequency: { kind: 'daily' },
    });
  });

  it('permite elegir frequency weekdays y la incluye en el submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<NewHabitForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/nombre/i), 'Trabajar');
    await userEvent.click(screen.getByRole('button', { name: /lunes a viernes/i }));
    await userEvent.click(screen.getByRole('button', { name: /crear hábito/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Trabajar',
      frequency: { kind: 'weekdays' },
    });
  });

  it('botón submit deshabilitado cuando el nombre está vacío', () => {
    render(<NewHabitForm onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /crear hábito/i })).toBeDisabled();
  });

  it('limpia el formulario después de un submit exitoso', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<NewHabitForm onSubmit={onSubmit} />);

    const input = screen.getByLabelText<HTMLInputElement>(/nombre/i);
    await userEvent.type(input, 'Leer');
    await userEvent.click(screen.getByRole('button', { name: /crear hábito/i }));

    expect(input.value).toBe('');
  });
});
