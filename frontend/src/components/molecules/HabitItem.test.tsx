import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HabitItem } from './HabitItem';
import type { Habit } from '@/types/habit';

function fakeHabit(overrides: Partial<Habit> = {}): Habit {
  const now = new Date().toISOString();
  return {
    id: 'h1',
    name: 'Entrenar',
    description: null,
    frequency: { kind: 'daily' },
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
    ...overrides,
  };
}

describe('HabitItem', () => {
  it('renderiza el nombre y la frecuencia legible', () => {
    render(
      <HabitItem
        habit={fakeHabit({ frequency: { kind: 'weekdays' } })}
        onUpdateName={vi.fn()}
        onArchive={vi.fn()}
        onUnarchive={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('Entrenar')).toBeInTheDocument();
    expect(screen.getByText(/Lun a Vie/i)).toBeInTheDocument();
  });

  it('muestra la frecuencia custom como letras de días', () => {
    render(
      <HabitItem
        habit={fakeHabit({ frequency: { kind: 'custom', days: [1, 3, 5] } })}
        onUpdateName={vi.fn()}
        onArchive={vi.fn()}
        onUnarchive={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('L X V')).toBeInTheDocument();
  });

  it('doble click sobre el nombre activa edición y Enter confirma', async () => {
    const onUpdateName = vi.fn();
    render(
      <HabitItem
        habit={fakeHabit()}
        onUpdateName={onUpdateName}
        onArchive={vi.fn()}
        onUnarchive={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    await userEvent.dblClick(screen.getByText('Entrenar'));
    const input = screen.getByLabelText(/editar nombre/i);
    await userEvent.clear(input);
    await userEvent.type(input, 'Correr{Enter}');

    expect(onUpdateName).toHaveBeenCalledWith('h1', 'Correr');
  });

  it('botón Archivar dispara onArchive', async () => {
    const onArchive = vi.fn();
    render(
      <HabitItem
        habit={fakeHabit()}
        onUpdateName={vi.fn()}
        onArchive={onArchive}
        onUnarchive={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /archivar/i }));
    expect(onArchive).toHaveBeenCalledWith('h1');
  });

  it('si el hábito está archivado muestra "Restaurar" en vez de "Archivar"', async () => {
    const onUnarchive = vi.fn();
    render(
      <HabitItem
        habit={fakeHabit({ archivedAt: new Date().toISOString() })}
        onUpdateName={vi.fn()}
        onArchive={vi.fn()}
        onUnarchive={onUnarchive}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: /^archivar/i })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /restaurar/i }));
    expect(onUnarchive).toHaveBeenCalledWith('h1');
  });

  it('botón ✕ dispara onDelete', async () => {
    const onDelete = vi.fn();
    render(
      <HabitItem
        habit={fakeHabit()}
        onUpdateName={vi.fn()}
        onArchive={vi.fn()}
        onUnarchive={vi.fn()}
        onDelete={onDelete}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /eliminar/i }));
    expect(onDelete).toHaveBeenCalledWith('h1');
  });
});
