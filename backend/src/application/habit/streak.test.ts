import { describe, it, expect } from 'vitest';
import { calculateStreak } from './streak.js';
import { Habit, type HabitFrequency } from '@/domain/habit/Habit.js';
import { HabitCompletion } from '@/domain/habit/HabitCompletion.js';

/**
 * Helper: crea un Habit con createdAt fijo (lejos en el pasado) para que la
 * cota inferior no interfiera en los tests de streak.
 */
function makeHabit(frequency: HabitFrequency = { kind: 'daily' }): Habit {
  return Habit.fromPersistence({
    id: 'h1',
    name: 'X',
    description: null,
    frequency,
    createdAt: new Date('2020-01-01T00:00:00Z'),
    updatedAt: new Date('2020-01-01T00:00:00Z'),
    archivedAt: null,
  });
}

function completion(date: string): HabitCompletion {
  return HabitCompletion.create({ habitId: 'h1', date });
}

describe('calculateStreak', () => {
  it('retorna 0 si no hay completions', () => {
    const habit = makeHabit();
    expect(calculateStreak(habit, [], '2026-05-14')).toBe(0);
  });

  it('daily: cuenta 1 si solo asOfDate está cumplido', () => {
    const habit = makeHabit();
    expect(calculateStreak(habit, [completion('2026-05-14')], '2026-05-14')).toBe(1);
  });

  it('daily: cuenta días consecutivos cumplidos hacia atrás', () => {
    const habit = makeHabit();
    const cs = [
      completion('2026-05-10'),
      completion('2026-05-11'),
      completion('2026-05-12'),
      completion('2026-05-13'),
      completion('2026-05-14'),
    ];
    expect(calculateStreak(habit, cs, '2026-05-14')).toBe(5);
  });

  it('daily: si asOfDate no está cumplido, racha = 0 aunque haya completions anteriores', () => {
    const habit = makeHabit();
    const cs = [completion('2026-05-13'), completion('2026-05-12')];
    expect(calculateStreak(habit, cs, '2026-05-14')).toBe(0);
  });

  it('daily: se corta en el primer día no cumplido', () => {
    const habit = makeHabit();
    const cs = [
      completion('2026-05-12'),
      // 2026-05-13 falta
      completion('2026-05-14'),
    ];
    expect(calculateStreak(habit, cs, '2026-05-14')).toBe(1);
  });

  it('weekdays: skipea sábado/domingo sin romper la racha', () => {
    // 2026-05-11 lunes, 12 martes, 13 mié, 14 jue, 15 vie, 16 sáb, 17 dom
    const habit = makeHabit({ kind: 'weekdays' });
    const cs = [
      completion('2026-05-11'),
      completion('2026-05-12'),
      completion('2026-05-13'),
      completion('2026-05-14'),
      completion('2026-05-15'),
    ];
    // asOfDate domingo: skipea dom y sáb, viernes cumplido, etc.
    expect(calculateStreak(habit, cs, '2026-05-17')).toBe(5);
  });

  it('weekdays: si el viernes no está cumplido, la racha se corta el viernes (no en el sábado)', () => {
    const habit = makeHabit({ kind: 'weekdays' });
    const cs = [
      completion('2026-05-11'),
      completion('2026-05-12'),
      completion('2026-05-13'),
      completion('2026-05-14'),
      // viernes 15 falta
    ];
    expect(calculateStreak(habit, cs, '2026-05-17')).toBe(0);
  });

  it('custom (lun-mié-vie): cuenta solo esos días, skipea el resto', () => {
    // lun=1, mié=3, vie=5
    const habit = makeHabit({ kind: 'custom', days: [1, 3, 5] });
    const cs = [
      completion('2026-05-11'), // lun
      completion('2026-05-13'), // mié
      completion('2026-05-15'), // vie
    ];
    // asOfDate sábado: skipea sáb, vie cumplido, skip jue, mié cumplido, skip mar, lun cumplido
    expect(calculateStreak(habit, cs, '2026-05-16')).toBe(3);
  });

  it('respeta la cota inferior habit.createdAt: no cuenta días anteriores a la creación', () => {
    const habit = Habit.fromPersistence({
      id: 'h1',
      name: 'X',
      description: null,
      frequency: { kind: 'daily' },
      createdAt: new Date('2026-05-12T00:00:00Z'),
      updatedAt: new Date('2026-05-12T00:00:00Z'),
      archivedAt: null,
    });
    const cs = [
      completion('2026-05-10'), // antes de createdAt, no debería contar
      completion('2026-05-12'),
      completion('2026-05-13'),
      completion('2026-05-14'),
    ];
    expect(calculateStreak(habit, cs, '2026-05-14')).toBe(3);
  });

  it('ignora completions de otros hábitos', () => {
    const habit = makeHabit();
    const otra = HabitCompletion.create({ habitId: 'OTRO', date: '2026-05-14' });
    expect(calculateStreak(habit, [otra], '2026-05-14')).toBe(0);
  });

  it('rechaza asOfDate con formato inválido', () => {
    const habit = makeHabit();
    expect(() => calculateStreak(habit, [], 'mañana')).toThrow(/YYYY-MM-DD/);
  });
});
