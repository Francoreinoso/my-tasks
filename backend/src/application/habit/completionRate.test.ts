import { describe, it, expect } from 'vitest';
import { calculateCompletionRate } from './completionRate.js';
import { Habit, type HabitFrequency } from '@/domain/habit/Habit.js';
import { HabitCompletion } from '@/domain/habit/HabitCompletion.js';

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

describe('calculateCompletionRate', () => {
  it('daily, todo cumplido en el rango → rate = 1', () => {
    const habit = makeHabit();
    const cs = [
      completion('2026-05-10'),
      completion('2026-05-11'),
      completion('2026-05-12'),
    ];
    const r = calculateCompletionRate(habit, cs, '2026-05-10', '2026-05-12');
    expect(r).toEqual({ applicable: 3, completed: 3, rate: 1 });
  });

  it('daily, nada cumplido → rate = 0 pero applicable > 0', () => {
    const habit = makeHabit();
    const r = calculateCompletionRate(habit, [], '2026-05-10', '2026-05-12');
    expect(r).toEqual({ applicable: 3, completed: 0, rate: 0 });
  });

  it('daily, mitad cumplido → rate = 0.5', () => {
    const habit = makeHabit();
    const cs = [completion('2026-05-10'), completion('2026-05-11')];
    const r = calculateCompletionRate(habit, cs, '2026-05-10', '2026-05-13');
    expect(r.applicable).toBe(4);
    expect(r.completed).toBe(2);
    expect(r.rate).toBe(0.5);
  });

  it('weekdays: ignora sábado y domingo en applicable y completed', () => {
    // 2026-05-11 lun → 17 dom (7 días, 5 aplicables)
    const habit = makeHabit({ kind: 'weekdays' });
    const cs = [
      completion('2026-05-11'), // lun
      completion('2026-05-15'), // vie
      completion('2026-05-16'), // sáb (marcado pero no aplicable: no cuenta)
    ];
    const r = calculateCompletionRate(habit, cs, '2026-05-11', '2026-05-17');
    expect(r.applicable).toBe(5);
    expect(r.completed).toBe(2);
  });

  it('custom (lun-mié-vie): cuenta solo esos días en el rango', () => {
    const habit = makeHabit({ kind: 'custom', days: [1, 3, 5] });
    // semana 2026-05-11..17: lun, mié, vie aplicables (3 días)
    const cs = [completion('2026-05-13')]; // mié cumplido
    const r = calculateCompletionRate(habit, cs, '2026-05-11', '2026-05-17');
    expect(r.applicable).toBe(3);
    expect(r.completed).toBe(1);
  });

  it('rango sin días aplicables → rate = 0 con applicable = 0', () => {
    // weekdays, rango sólo de fin de semana
    const habit = makeHabit({ kind: 'weekdays' });
    const r = calculateCompletionRate(habit, [], '2026-05-16', '2026-05-17');
    expect(r).toEqual({ applicable: 0, completed: 0, rate: 0 });
  });

  it('from > to → todo cero', () => {
    const habit = makeHabit();
    const r = calculateCompletionRate(habit, [], '2026-05-14', '2026-05-10');
    expect(r).toEqual({ applicable: 0, completed: 0, rate: 0 });
  });

  it('ignora completions de otros hábitos', () => {
    const habit = makeHabit();
    const otra = HabitCompletion.create({ habitId: 'OTRO', date: '2026-05-10' });
    const r = calculateCompletionRate(habit, [otra], '2026-05-10', '2026-05-10');
    expect(r).toEqual({ applicable: 1, completed: 0, rate: 0 });
  });

  it('rechaza fechas con formato inválido', () => {
    const habit = makeHabit();
    expect(() => calculateCompletionRate(habit, [], 'mañana', '2026-05-10')).toThrow(
      /YYYY-MM-DD/,
    );
  });
});
