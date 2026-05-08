import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DayColumn } from './DayColumn';
import type { Task } from '@/types/task';

afterEach(() => {
  vi.useRealTimers();
});

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

describe('DayColumn', () => {
  const noop = () => undefined;

  it('muestra el nombre del día y el número', () => {
    render(
      <DayColumn
        isoDate="2026-05-11"
        tasks={[]}
        onToggle={noop}
        onUpdate={noop}
        onDelete={noop}
      />,
    );
    expect(screen.getByText(/lunes/i)).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
  });

  it('muestra placeholder "—" cuando no hay tareas', () => {
    render(
      <DayColumn
        isoDate="2026-05-12"
        tasks={[]}
        onToggle={noop}
        onUpdate={noop}
        onDelete={noop}
      />,
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renderiza las tareas asignadas a ese día', () => {
    const tasks = [
      makeTask({ id: 'a', title: 'Tarea uno', dueDate: '2026-05-12' }),
      makeTask({ id: 'b', title: 'Tarea dos', dueDate: '2026-05-12' }),
    ];
    render(
      <DayColumn
        isoDate="2026-05-12"
        tasks={tasks}
        onToggle={noop}
        onUpdate={noop}
        onDelete={noop}
      />,
    );
    expect(screen.getByText('Tarea uno')).toBeInTheDocument();
    expect(screen.getByText('Tarea dos')).toBeInTheDocument();
  });

  it('NO muestra el control de fecha en las tareas (la columna ya implica el día)', () => {
    const tasks = [makeTask({ id: 'a', dueDate: '2026-05-12' })];
    render(
      <DayColumn
        isoDate="2026-05-12"
        tasks={tasks}
        onToggle={noop}
        onUpdate={noop}
        onDelete={noop}
      />,
    );
    expect(screen.queryByText('12-05-2026')).not.toBeInTheDocument();
    expect(screen.queryByText(/sin día/i)).not.toBeInTheDocument();
  });

  it('marca visualmente la columna de hoy', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 12, 10, 0)); // 12 mayo

    const { container } = render(
      <DayColumn
        isoDate="2026-05-12"
        tasks={[]}
        onToggle={noop}
        onUpdate={noop}
        onDelete={noop}
      />,
    );
    // Buscamos el article y verificamos que tiene el borde acento
    const article = container.querySelector('article');
    expect(article?.className).toMatch(/border-accent/);
  });
});
