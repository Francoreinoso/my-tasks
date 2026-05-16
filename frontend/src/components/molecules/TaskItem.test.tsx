import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskItem } from './TaskItem';
import type { Task } from '@/types/task';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't-1',
    title: 'Estudiar React',
    description: null,
    dueDate: null,
    status: 'pending',
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
    ...overrides,
  };
}

describe('TaskItem', () => {
  it('renderiza el título y muestra la checkbox sin marcar si está pending', () => {
    render(
      <TaskItem
        task={makeTask()}
        onToggle={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('Estudiar React')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('marca la checkbox cuando la tarea está completada', () => {
    render(
      <TaskItem
        task={makeTask({ status: 'completed' })}
        onToggle={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('llama a onToggle con el id cuando se clickea la checkbox', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(
      <TaskItem task={makeTask()} onToggle={onToggle} onUpdate={vi.fn()} onDelete={vi.fn()} />,
    );

    await user.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith('t-1');
  });

  it('llama a onDelete con el id cuando se clickea el botón eliminar', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <TaskItem task={makeTask()} onToggle={vi.fn()} onUpdate={vi.fn()} onDelete={onDelete} />,
    );

    await user.click(screen.getByRole('button', { name: /eliminar/i }));
    expect(onDelete).toHaveBeenCalledWith('t-1');
  });

  it('al hacer doble click sobre el título entra en modo edición', async () => {
    const user = userEvent.setup();
    render(
      <TaskItem task={makeTask()} onToggle={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} />,
    );

    await user.dblClick(screen.getByRole('button', { name: /editar/i }));
    expect(screen.getByRole('textbox', { name: /editar título/i })).toBeInTheDocument();
  });

  it('al presionar Enter llama a onUpdate con el nuevo título', async () => {
    const onUpdate = vi.fn();
    const user = userEvent.setup();
    render(
      <TaskItem task={makeTask()} onToggle={vi.fn()} onUpdate={onUpdate} onDelete={vi.fn()} />,
    );

    await user.dblClick(screen.getByRole('button', { name: /editar/i }));
    const input = screen.getByRole('textbox', { name: /editar título/i });
    await user.clear(input);
    await user.type(input, 'Estudiar Vue{Enter}');

    expect(onUpdate).toHaveBeenCalledWith('t-1', { title: 'Estudiar Vue' });
  });

  it('al presionar Escape cancela la edición sin llamar a onUpdate', async () => {
    const onUpdate = vi.fn();
    const user = userEvent.setup();
    render(
      <TaskItem task={makeTask()} onToggle={vi.fn()} onUpdate={onUpdate} onDelete={vi.fn()} />,
    );

    await user.dblClick(screen.getByRole('button', { name: /editar/i }));
    const input = screen.getByRole('textbox', { name: /editar título/i });
    await user.clear(input);
    await user.type(input, 'Borrador{Escape}');

    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.getByText('Estudiar React')).toBeInTheDocument();
  });

  it('si el título nuevo es vacío, no llama a onUpdate', async () => {
    const onUpdate = vi.fn();
    const user = userEvent.setup();
    render(
      <TaskItem task={makeTask()} onToggle={vi.fn()} onUpdate={onUpdate} onDelete={vi.fn()} />,
    );

    await user.dblClick(screen.getByRole('button', { name: /editar/i }));
    const input = screen.getByRole('textbox', { name: /editar título/i });
    await user.clear(input);
    await user.type(input, '   {Enter}');

    expect(onUpdate).not.toHaveBeenCalled();
  });

  describe('description', () => {
    it('muestra la descripción debajo del título cuando existe', () => {
      render(
        <TaskItem
          task={makeTask({ description: 'Línea uno\nLínea dos' })}
          onToggle={vi.fn()}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(screen.getByText(/Línea uno/)).toBeInTheDocument();
      expect(screen.getByText(/Línea dos/)).toBeInTheDocument();
    });

    it('muestra el botón "+ agregar detalles" cuando la descripción es null', () => {
      render(
        <TaskItem
          task={makeTask({ description: null })}
          onToggle={vi.fn()}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(screen.getByRole('button', { name: /agregar detalles/i })).toBeInTheDocument();
    });

    it('al hacer doble click sobre la descripción entra en modo edición', async () => {
      const user = userEvent.setup();
      render(
        <TaskItem
          task={makeTask({ description: 'detalles existentes' })}
          onToggle={vi.fn()}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
        />,
      );

      await user.dblClick(
        screen.getByRole('button', { name: /editar detalles/i }),
      );
      expect(screen.getByRole('textbox', { name: /editar detalles/i })).toBeInTheDocument();
    });

    it('Enter guarda; Shift+Enter inserta salto de línea', async () => {
      const onUpdate = vi.fn();
      const user = userEvent.setup();
      render(
        <TaskItem
          task={makeTask({ description: 'viejo' })}
          onToggle={vi.fn()}
          onUpdate={onUpdate}
          onDelete={vi.fn()}
        />,
      );

      await user.dblClick(screen.getByRole('button', { name: /editar detalles/i }));
      const textarea = screen.getByRole('textbox', { name: /editar detalles/i });
      await user.clear(textarea);
      await user.type(
        textarea,
        'línea 1{Shift>}{Enter}{/Shift}línea 2{Enter}',
      );

      expect(onUpdate).toHaveBeenCalledWith('t-1', {
        description: 'línea 1\nlínea 2',
      });
    });

    it('Escape cancela la edición sin guardar', async () => {
      const onUpdate = vi.fn();
      const user = userEvent.setup();
      render(
        <TaskItem
          task={makeTask({ description: 'original' })}
          onToggle={vi.fn()}
          onUpdate={onUpdate}
          onDelete={vi.fn()}
        />,
      );

      await user.dblClick(screen.getByRole('button', { name: /editar detalles/i }));
      const textarea = screen.getByRole('textbox', { name: /editar detalles/i });
      await user.clear(textarea);
      await user.type(textarea, 'borrador');
      await user.keyboard('{Escape}');

      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('al borrar todo el contenido y guardar, se manda description: null', async () => {
      const onUpdate = vi.fn();
      const user = userEvent.setup();
      render(
        <TaskItem
          task={makeTask({ description: 'algo' })}
          onToggle={vi.fn()}
          onUpdate={onUpdate}
          onDelete={vi.fn()}
        />,
      );

      await user.dblClick(screen.getByRole('button', { name: /editar detalles/i }));
      const textarea = screen.getByRole('textbox', { name: /editar detalles/i });
      await user.clear(textarea);
      await user.keyboard('{Enter}');

      expect(onUpdate).toHaveBeenCalledWith('t-1', { description: null });
    });

    it('cuando showDescription es false, no se muestra ni la descripción ni el affordance', () => {
      render(
        <TaskItem
          task={makeTask({ description: 'no debería aparecer' })}
          onToggle={vi.fn()}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
          showDescription={false}
        />,
      );
      expect(screen.queryByText(/no debería aparecer/)).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /agregar detalles/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('dueDate', () => {
    it('muestra "sin día" cuando la tarea no tiene dueDate', () => {
      render(
        <TaskItem
          task={makeTask({ dueDate: null })}
          onToggle={vi.fn()}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(screen.getByText(/sin día/i)).toBeInTheDocument();
    });

    it('muestra la fecha en formato DD-MM-YYYY cuando está asignada', () => {
      render(
        <TaskItem
          task={makeTask({ dueDate: '2026-05-15' })}
          onToggle={vi.fn()}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(screen.getByText('15-05-2026')).toBeInTheDocument();
    });

    it('al clickear el botón de fecha aparece el input type=date', async () => {
      const user = userEvent.setup();
      render(
        <TaskItem
          task={makeTask()}
          onToggle={vi.fn()}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
        />,
      );

      await user.click(screen.getByRole('button', { name: /asignar fecha/i }));
      // Native date input no tiene role accesible estándar, lo buscamos por aria-label
      expect(screen.getByLabelText(/asignar fecha/i)).toBeInTheDocument();
    });

    it('cuando showDueDate es false, no se muestra el control de fecha', () => {
      render(
        <TaskItem
          task={makeTask({ dueDate: '2026-05-15' })}
          onToggle={vi.fn()}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
          showDueDate={false}
        />,
      );
      expect(screen.queryByText('15-05-2026')).not.toBeInTheDocument();
    });
  });
});
