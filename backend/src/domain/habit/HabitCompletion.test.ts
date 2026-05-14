import { describe, it, expect } from 'vitest';
import { HabitCompletion } from './HabitCompletion.js';

describe('HabitCompletion', () => {
  describe('create', () => {
    it('crea una completion con habitId y date válidos', () => {
      const completion = HabitCompletion.create({
        habitId: 'habit-123',
        date: '2026-05-14',
      });

      expect(completion.habitId).toBe('habit-123');
      expect(completion.date).toBe('2026-05-14');
      expect(completion.id).toBeTypeOf('string');
      expect(completion.id.length).toBeGreaterThan(0);
      expect(completion.createdAt).toBeInstanceOf(Date);
    });

    it('hace trim al habitId y a la date', () => {
      const completion = HabitCompletion.create({
        habitId: '  habit-123  ',
        date: '  2026-05-14  ',
      });
      expect(completion.habitId).toBe('habit-123');
      expect(completion.date).toBe('2026-05-14');
    });

    it('lanza error si habitId está vacío', () => {
      expect(() =>
        HabitCompletion.create({ habitId: '', date: '2026-05-14' }),
      ).toThrow(/habitId.*vacío/i);
      expect(() =>
        HabitCompletion.create({ habitId: '   ', date: '2026-05-14' }),
      ).toThrow(/habitId.*vacío/i);
    });

    it('lanza error si date no está en formato YYYY-MM-DD', () => {
      expect(() =>
        HabitCompletion.create({ habitId: 'x', date: '14-05-2026' }),
      ).toThrow(/YYYY-MM-DD/);
      expect(() =>
        HabitCompletion.create({ habitId: 'x', date: '2026/05/14' }),
      ).toThrow(/YYYY-MM-DD/);
      expect(() =>
        HabitCompletion.create({ habitId: 'x', date: 'hoy' }),
      ).toThrow(/YYYY-MM-DD/);
    });

    it('lanza error si date es una fecha calendario inválida', () => {
      expect(() =>
        HabitCompletion.create({ habitId: 'x', date: '2026-02-30' }),
      ).toThrow(/inválida/i);
      expect(() =>
        HabitCompletion.create({ habitId: 'x', date: '2026-13-01' }),
      ).toThrow(/inválida/i);
    });

    it('genera ids únicos', () => {
      const a = HabitCompletion.create({ habitId: 'x', date: '2026-05-14' });
      const b = HabitCompletion.create({ habitId: 'x', date: '2026-05-15' });
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('serialización', () => {
    it('toJSON devuelve un objeto plano con todos los campos', () => {
      const completion = HabitCompletion.create({
        habitId: 'h1',
        date: '2026-05-14',
      });
      const json = completion.toJSON();

      expect(json).toEqual({
        id: completion.id,
        habitId: 'h1',
        date: '2026-05-14',
        createdAt: completion.createdAt,
      });
    });

    it('fromPersistence reconstruye sin pasar por validaciones', () => {
      const original = HabitCompletion.create({
        habitId: 'h1',
        date: '2026-05-14',
      });
      const restored = HabitCompletion.fromPersistence(original.toJSON());

      expect(restored.id).toBe(original.id);
      expect(restored.habitId).toBe(original.habitId);
      expect(restored.date).toBe(original.date);
      expect(restored).toBeInstanceOf(HabitCompletion);
    });
  });
});
