import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HabitList } from './HabitList';
import type { Habit } from '@/types/habit';

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

const noopProps = {
  onUpdateName: vi.fn(),
  onArchive: vi.fn(),
  onUnarchive: vi.fn(),
  onDelete: vi.fn(),
  onMark: vi.fn(),
  onUnmark: vi.fn(),
  completionsByHabit: {},
  statsByHabit: {},
  trackerDays: ['2026-05-14'],
};

describe('HabitList', () => {
  it('muestra un mensaje cuando no hay hábitos', () => {
    render(<HabitList habits={[]} {...noopProps} />);
    expect(screen.getByText(/tu rutina arranca acá/i)).toBeInTheDocument();
  });

  it('separa hábitos activos y archivados en secciones distintas', () => {
    const habits = [
      fakeHabit({ id: 'a', name: 'Activo' }),
      fakeHabit({ id: 'b', name: 'Archivado', archivedAt: new Date().toISOString() }),
    ];
    render(<HabitList habits={habits} {...noopProps} />);

    const activos = screen.getByRole('region', { name: /hábitos activos/i });
    const archivados = screen.getByRole('region', { name: /hábitos archivados/i });

    // Cada nombre aparece en su sección
    expect(activos.textContent).toContain('Activo');
    expect(archivados.textContent).toContain('Archivado');
    // Verificación cruzada: no se duplican entre secciones
    expect(activos.textContent).not.toContain('Archivado');
  });

  it('no muestra sección de archivados si no hay ninguno', () => {
    render(<HabitList habits={[fakeHabit()]} {...noopProps} />);
    expect(
      screen.queryByRole('region', { name: /hábitos archivados/i }),
    ).not.toBeInTheDocument();
  });
});
