import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewTaskForm } from './NewTaskForm';

describe('NewTaskForm', () => {
  it('llama a onSubmit con el título trimmeado al enviar', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<NewTaskForm onSubmit={onSubmit} />);

    await user.type(screen.getByRole('textbox'), '  Estudiar  ');
    await user.click(screen.getByRole('button', { name: /crear/i }));

    expect(onSubmit).toHaveBeenCalledWith('Estudiar');
  });

  it('limpia el input después de crear exitosamente', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<NewTaskForm onSubmit={onSubmit} />);

    const input = screen.getByRole<HTMLInputElement>('textbox');
    await user.type(input, 'Tarea X{Enter}');
    expect(input.value).toBe('');
  });

  it('el botón está deshabilitado si el título está vacío', () => {
    render(<NewTaskForm onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /crear/i })).toBeDisabled();
  });

  it('no llama a onSubmit si el título es solo espacios', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<NewTaskForm onSubmit={onSubmit} />);

    await user.type(screen.getByRole('textbox'), '    ');
    expect(screen.getByRole('button', { name: /crear/i })).toBeDisabled();
    // Enter sobre input — no submit porque está deshabilitado por validación
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('si onSubmit falla, el input mantiene su contenido', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('API error'));
    const user = userEvent.setup();
    const { findByText } = render(<NewTaskForm onSubmit={onSubmit} />);

    const input = screen.getByRole<HTMLInputElement>('textbox');
    await user.type(input, 'Tarea Y');
    await user.click(screen.getByRole('button', { name: /crear/i }));

    // Esperamos a que el submit termine (botón vuelve a "Crear" desde "Creando…")
    await findByText('Crear');
    expect(onSubmit).toHaveBeenCalled();
    expect(input.value).toBe('Tarea Y');
  });
});
