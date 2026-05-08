import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskList } from './TaskList';
import type { Task } from '@/types/task';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't-1',
    title: 'Tarea',
    description: null,
    dueDate: null,
    status: 'pending',
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
    ...overrides,
  };
}

describe('TaskList', () => {
  const noop = () => undefined;

  it('muestra estado vacío cuando no hay tareas', () => {
    render(<TaskList tasks={[]} onToggle={noop} onUpdate={noop} onDelete={noop} />);
    expect(screen.getByRole('status')).toHaveTextContent(/sin tareas/i);
  });

  it('agrupa pendientes y completadas en secciones separadas', () => {
    const tasks = [
      makeTask({ id: 'a', title: 'Pendiente A' }),
      makeTask({ id: 'b', title: 'Hecha B', status: 'completed' }),
      makeTask({ id: 'c', title: 'Pendiente C' }),
    ];

    render(<TaskList tasks={tasks} onToggle={noop} onUpdate={noop} onDelete={noop} />);

    expect(screen.getByText(/pendientes \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/completadas \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText('Pendiente A')).toBeInTheDocument();
    expect(screen.getByText('Hecha B')).toBeInTheDocument();
  });

  it('no muestra sección "Pendientes" si no hay ninguna', () => {
    const tasks = [makeTask({ status: 'completed' })];
    render(<TaskList tasks={tasks} onToggle={noop} onUpdate={noop} onDelete={noop} />);
    expect(screen.queryByText(/pendientes/i)).not.toBeInTheDocument();
  });

  it('propaga el id de la tarea al onToggle', async () => {
    const userEvent = await import('@testing-library/user-event').then((m) => m.default);
    const onToggle = vi.fn();
    const user = userEvent.setup();
    const tasks = [makeTask({ id: 'xyz' })];

    render(<TaskList tasks={tasks} onToggle={onToggle} onUpdate={noop} onDelete={noop} />);
    await user.click(screen.getByRole('checkbox'));

    expect(onToggle).toHaveBeenCalledWith('xyz');
  });

  it('respeta el flag showDueDate=false ocultando el control de fecha', () => {
    const tasks = [makeTask({ dueDate: '2026-05-15' })];
    render(
      <TaskList
        tasks={tasks}
        onToggle={noop}
        onUpdate={noop}
        onDelete={noop}
        showDueDate={false}
      />,
    );
    expect(screen.queryByText('15-05-2026')).not.toBeInTheDocument();
  });
});
