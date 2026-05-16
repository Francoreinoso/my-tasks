import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewTaskForm } from './NewTaskForm';

describe('NewTaskForm', () => {
  it('llama a onSubmit con título trimmeado y description null cuando no hay detalles', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<NewTaskForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/título/i), '  Estudiar  ');
    await user.click(screen.getByRole('button', { name: /crear/i }));

    expect(onSubmit).toHaveBeenCalledWith({ title: 'Estudiar', description: null });
  });

  it('llama a onSubmit con title + description cuando ambos tienen contenido', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<NewTaskForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/título/i), 'Llamar al dentista');
    await user.type(
      screen.getByLabelText(/detalles/i),
      'Pedir turno limpieza\nMencionar diente del fondo',
    );
    await user.click(screen.getByRole('button', { name: /crear/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Llamar al dentista',
      description: 'Pedir turno limpieza\nMencionar diente del fondo',
    });
  });

  it('Enter en el título envía el formulario', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<NewTaskForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/título/i), 'Tarea X{Enter}');

    expect(onSubmit).toHaveBeenCalledWith({ title: 'Tarea X', description: null });
  });

  it('Enter en el textarea de detalles envía el formulario', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<NewTaskForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/título/i), 'X');
    await user.type(screen.getByLabelText(/detalles/i), 'algo{Enter}');

    expect(onSubmit).toHaveBeenCalledWith({ title: 'X', description: 'algo' });
  });

  it('Shift+Enter en el textarea de detalles inserta salto de línea (no envía)', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<NewTaskForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/título/i), 'X');
    const textarea = screen.getByLabelText<HTMLTextAreaElement>(/detalles/i);
    await user.type(textarea, 'línea 1{Shift>}{Enter}{/Shift}línea 2');

    expect(onSubmit).not.toHaveBeenCalled();
    expect(textarea.value).toBe('línea 1\nlínea 2');
  });

  it('limpia ambos campos después de crear exitosamente', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<NewTaskForm onSubmit={onSubmit} />);

    const title = screen.getByLabelText<HTMLInputElement>(/título/i);
    const description = screen.getByLabelText<HTMLTextAreaElement>(/detalles/i);
    await user.type(title, 'Tarea X');
    await user.type(description, 'detalles');
    await user.click(screen.getByRole('button', { name: /crear/i }));

    expect(title.value).toBe('');
    expect(description.value).toBe('');
  });

  it('el botón está deshabilitado si el título está vacío', () => {
    render(<NewTaskForm onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /crear/i })).toBeDisabled();
  });

  it('no llama a onSubmit si el título es solo espacios', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<NewTaskForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/título/i), '    ');
    expect(screen.getByRole('button', { name: /crear/i })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('si onSubmit falla, ambos campos mantienen su contenido', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('API error'));
    const user = userEvent.setup();
    const { findByText } = render(<NewTaskForm onSubmit={onSubmit} />);

    const title = screen.getByLabelText<HTMLInputElement>(/título/i);
    const description = screen.getByLabelText<HTMLTextAreaElement>(/detalles/i);
    await user.type(title, 'Tarea Y');
    await user.type(description, 'detalles');
    await user.click(screen.getByRole('button', { name: /crear/i }));

    await findByText('Crear');
    expect(onSubmit).toHaveBeenCalled();
    expect(title.value).toBe('Tarea Y');
    expect(description.value).toBe('detalles');
  });
});
