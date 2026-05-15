import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HabitTracker } from './HabitTracker';
import type { Habit, HabitCompletion, HabitStats } from '@/types/habit';

function fakeHabit(overrides: Partial<Habit> = {}): Habit {
  const now = new Date().toISOString();
  return {
    id: 'h1',
    name: 'X',
    description: null,
    frequency: { kind: 'daily' },
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
    ...overrides,
  };
}

function fakeStats(overrides: Partial<HabitStats> = {}): HabitStats {
  return {
    habitId: 'h1',
    streak: 0,
    rate: { applicable: 30, completed: 0, rate: 0 },
    asOf: '2026-05-14',
    range: { from: '2026-04-15', to: '2026-05-14' },
    ...overrides,
  };
}

const SEVEN_DAYS = [
  '2026-05-08',
  '2026-05-09',
  '2026-05-10',
  '2026-05-11',
  '2026-05-12',
  '2026-05-13',
  '2026-05-14',
];

describe('HabitTracker', () => {
  it('renderiza un botón por cada día con su letra', () => {
    render(
      <HabitTracker
        habit={fakeHabit()}
        completions={[]}
        stats={fakeStats()}
        days={SEVEN_DAYS}
        onMark={vi.fn()}
        onUnmark={vi.fn()}
      />,
    );
    expect(screen.getAllByRole('button')).toHaveLength(7);
  });

  it('marca el día como pressed cuando hay completion', () => {
    const completion: HabitCompletion = {
      id: 'c1',
      habitId: 'h1',
      date: '2026-05-14',
      createdAt: '',
    };
    render(
      <HabitTracker
        habit={fakeHabit()}
        completions={[completion]}
        stats={fakeStats({ streak: 1 })}
        days={SEVEN_DAYS}
        onMark={vi.fn()}
        onUnmark={vi.fn()}
      />,
    );
    // El botón del 14 (jueves "J") debe estar aria-pressed=true
    const cells = screen.getAllByRole('button');
    const lastCell = cells[cells.length - 1];
    expect(lastCell).toHaveAttribute('aria-pressed', 'true');
  });

  it('click en celda no marcada llama onMark con la fecha', async () => {
    const onMark = vi.fn();
    render(
      <HabitTracker
        habit={fakeHabit()}
        completions={[]}
        stats={fakeStats()}
        days={SEVEN_DAYS}
        onMark={onMark}
        onUnmark={vi.fn()}
      />,
    );
    const cells = screen.getAllByRole('button');
    const lastCell = cells[cells.length - 1];
    if (!lastCell) throw new Error('no cell');
    await userEvent.click(lastCell);
    expect(onMark).toHaveBeenCalledWith('2026-05-14');
  });

  it('click en celda marcada llama onUnmark con la fecha', async () => {
    const onUnmark = vi.fn();
    const completion: HabitCompletion = {
      id: 'c1',
      habitId: 'h1',
      date: '2026-05-14',
      createdAt: '',
    };
    render(
      <HabitTracker
        habit={fakeHabit()}
        completions={[completion]}
        stats={fakeStats({ streak: 1 })}
        days={SEVEN_DAYS}
        onMark={vi.fn()}
        onUnmark={onUnmark}
      />,
    );
    const cells = screen.getAllByRole('button');
    const lastCell = cells[cells.length - 1];
    if (!lastCell) throw new Error('no cell');
    await userEvent.click(lastCell);
    expect(onUnmark).toHaveBeenCalledWith('2026-05-14');
  });

  it('muestra racha y porcentaje cuando stats existe', () => {
    render(
      <HabitTracker
        habit={fakeHabit()}
        completions={[]}
        stats={fakeStats({ streak: 7, rate: { applicable: 30, completed: 27, rate: 0.9 } })}
        days={SEVEN_DAYS}
        onMark={vi.fn()}
        onUnmark={vi.fn()}
      />,
    );
    expect(screen.getByLabelText(/racha de 7/i)).toBeInTheDocument();
    expect(screen.getByText(/90%/)).toBeInTheDocument();
  });

  it('muestra "Cargando…" cuando stats es null', () => {
    render(
      <HabitTracker
        habit={fakeHabit()}
        completions={[]}
        stats={null}
        days={SEVEN_DAYS}
        onMark={vi.fn()}
        onUnmark={vi.fn()}
      />,
    );
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });
});
