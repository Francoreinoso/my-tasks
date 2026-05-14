import { describe, it, expect } from 'vitest';
import { Habit } from './Habit.js';

describe('Habit', () => {
  describe('create', () => {
    it('crea un hábito con nombre válido y frecuencia diaria por defecto', () => {
      const habit = Habit.create({ name: 'Entrenar' });

      expect(habit.name).toBe('Entrenar');
      expect(habit.description).toBeNull();
      expect(habit.frequency).toEqual({ kind: 'daily' });
      expect(habit.archivedAt).toBeNull();
      expect(habit.id).toBeTypeOf('string');
      expect(habit.id.length).toBeGreaterThan(0);
      expect(habit.createdAt).toBeInstanceOf(Date);
      expect(habit.updatedAt).toBeInstanceOf(Date);
    });

    it('acepta una descripción opcional y la guarda', () => {
      const habit = Habit.create({
        name: 'Estudiar',
        description: 'Mínimo 30 min',
      });
      expect(habit.description).toBe('Mínimo 30 min');
    });

    it('hace trim al nombre y a la descripción', () => {
      const habit = Habit.create({
        name: '   Leer   ',
        description: '  20 páginas  ',
      });
      expect(habit.name).toBe('Leer');
      expect(habit.description).toBe('20 páginas');
    });

    it('convierte descripción vacía o solo-espacios en null', () => {
      const habit = Habit.create({ name: 'X', description: '   ' });
      expect(habit.description).toBeNull();
    });

    it('lanza error si el nombre está vacío', () => {
      expect(() => Habit.create({ name: '' })).toThrow(/nombre.*vacío/i);
      expect(() => Habit.create({ name: '   ' })).toThrow(/nombre.*vacío/i);
    });

    it('lanza error si el nombre supera 200 caracteres', () => {
      const longName = 'a'.repeat(201);
      expect(() => Habit.create({ name: longName })).toThrow(/200/);
    });

    it('genera ids únicos para hábitos distintos', () => {
      const a = Habit.create({ name: 'A' });
      const b = Habit.create({ name: 'B' });
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('frequency', () => {
    it('acepta frecuencia daily explícita', () => {
      const habit = Habit.create({ name: 'X', frequency: { kind: 'daily' } });
      expect(habit.frequency).toEqual({ kind: 'daily' });
    });

    it('acepta frecuencia weekdays', () => {
      const habit = Habit.create({ name: 'X', frequency: { kind: 'weekdays' } });
      expect(habit.frequency).toEqual({ kind: 'weekdays' });
    });

    it('acepta frecuencia custom con días válidos', () => {
      const habit = Habit.create({
        name: 'X',
        frequency: { kind: 'custom', days: [1, 3, 5] },
      });
      expect(habit.frequency).toEqual({ kind: 'custom', days: [1, 3, 5] });
    });

    it('ordena los días de custom para mantener forma canónica', () => {
      const habit = Habit.create({
        name: 'X',
        frequency: { kind: 'custom', days: [5, 1, 3] },
      });
      expect(habit.frequency).toEqual({ kind: 'custom', days: [1, 3, 5] });
    });

    it('rechaza custom sin días', () => {
      expect(() =>
        Habit.create({ name: 'X', frequency: { kind: 'custom', days: [] } }),
      ).toThrow(/al menos un día/i);
    });

    it('rechaza custom con días duplicados', () => {
      expect(() =>
        Habit.create({ name: 'X', frequency: { kind: 'custom', days: [1, 1, 3] } }),
      ).toThrow(/duplicad/i);
    });

    it('rechaza custom con días fuera de rango 0-6', () => {
      expect(() =>
        Habit.create({
          name: 'X',
          frequency: { kind: 'custom', days: [7] as never },
        }),
      ).toThrow(/0.*6/);
      expect(() =>
        Habit.create({
          name: 'X',
          frequency: { kind: 'custom', days: [-1] as never },
        }),
      ).toThrow(/0.*6/);
    });
  });

  describe('isApplicableOn', () => {
    it('daily aplica todos los días', () => {
      const habit = Habit.create({ name: 'X', frequency: { kind: 'daily' } });
      expect(habit.isApplicableOn('2026-05-11')).toBe(true); // lunes
      expect(habit.isApplicableOn('2026-05-16')).toBe(true); // sábado
      expect(habit.isApplicableOn('2026-05-17')).toBe(true); // domingo
    });

    it('weekdays aplica solo lun-vie', () => {
      const habit = Habit.create({ name: 'X', frequency: { kind: 'weekdays' } });
      expect(habit.isApplicableOn('2026-05-11')).toBe(true);  // lunes
      expect(habit.isApplicableOn('2026-05-15')).toBe(true);  // viernes
      expect(habit.isApplicableOn('2026-05-16')).toBe(false); // sábado
      expect(habit.isApplicableOn('2026-05-17')).toBe(false); // domingo
    });

    it('custom aplica solo los días configurados', () => {
      // lun (1), mié (3), vie (5)
      const habit = Habit.create({
        name: 'X',
        frequency: { kind: 'custom', days: [1, 3, 5] },
      });
      expect(habit.isApplicableOn('2026-05-11')).toBe(true);  // lunes
      expect(habit.isApplicableOn('2026-05-12')).toBe(false); // martes
      expect(habit.isApplicableOn('2026-05-13')).toBe(true);  // miércoles
      expect(habit.isApplicableOn('2026-05-14')).toBe(false); // jueves
      expect(habit.isApplicableOn('2026-05-15')).toBe(true);  // viernes
      expect(habit.isApplicableOn('2026-05-17')).toBe(false); // domingo
    });

    it('rechaza fechas con formato inválido', () => {
      const habit = Habit.create({ name: 'X' });
      expect(() => habit.isApplicableOn('14-05-2026')).toThrow(/YYYY-MM-DD/);
      expect(() => habit.isApplicableOn('mañana')).toThrow(/YYYY-MM-DD/);
    });

    it('rechaza fechas calendario inválidas', () => {
      const habit = Habit.create({ name: 'X' });
      expect(() => habit.isApplicableOn('2026-02-30')).toThrow(/inválida/i);
    });
  });

  describe('archive / unarchive', () => {
    it('archive marca archivedAt con timestamp', () => {
      const habit = Habit.create({ name: 'X' });
      const archived = habit.archive();

      expect(archived.archivedAt).toBeInstanceOf(Date);
      expect(habit.archivedAt).toBeNull(); // original inmutable
      expect(archived.isArchived).toBe(true);
      expect(habit.isArchived).toBe(false);
    });

    it('archive sobre un hábito ya archivado devuelve la misma instancia', () => {
      const habit = Habit.create({ name: 'X' }).archive();
      expect(habit.archive()).toBe(habit);
    });

    it('unarchive vuelve archivedAt a null', () => {
      const habit = Habit.create({ name: 'X' }).archive();
      const restored = habit.unarchive();
      expect(restored.archivedAt).toBeNull();
      expect(restored.isArchived).toBe(false);
    });

    it('unarchive sobre un hábito activo devuelve la misma instancia', () => {
      const habit = Habit.create({ name: 'X' });
      expect(habit.unarchive()).toBe(habit);
    });
  });

  describe('updateName / updateDescription / updateFrequency', () => {
    it('updateName devuelve nueva instancia con el nombre actualizado', () => {
      const habit = Habit.create({ name: 'Original' });
      const updated = habit.updateName('Nuevo');

      expect(updated.name).toBe('Nuevo');
      expect(habit.name).toBe('Original');
    });

    it('updateName hace trim y valida igual que create', () => {
      const habit = Habit.create({ name: 'X' });
      expect(habit.updateName('   Limpio   ').name).toBe('Limpio');
      expect(() => habit.updateName('')).toThrow(/nombre/i);
      expect(() => habit.updateName('a'.repeat(201))).toThrow(/200/);
    });

    it('updateName con el mismo nombre devuelve la misma instancia', () => {
      const habit = Habit.create({ name: 'Igual' });
      expect(habit.updateName('Igual')).toBe(habit);
    });

    it('updateDescription acepta string o null', () => {
      const habit = Habit.create({ name: 'X' });
      expect(habit.updateDescription('detalles').description).toBe('detalles');
      expect(habit.updateDescription(null).description).toBeNull();
    });

    it('updateFrequency cambia la frecuencia', () => {
      const habit = Habit.create({ name: 'X' });
      const weekly = habit.updateFrequency({ kind: 'weekdays' });
      expect(weekly.frequency).toEqual({ kind: 'weekdays' });
      expect(habit.frequency).toEqual({ kind: 'daily' });
    });

    it('updateFrequency valida igual que create', () => {
      const habit = Habit.create({ name: 'X' });
      expect(() =>
        habit.updateFrequency({ kind: 'custom', days: [] }),
      ).toThrow(/al menos un día/i);
    });
  });

  describe('serialización', () => {
    it('toJSON devuelve un objeto plano con todos los campos', () => {
      const habit = Habit.create({
        name: 'Leer',
        description: 'd',
        frequency: { kind: 'weekdays' },
      });
      const json = habit.toJSON();

      expect(json).toEqual({
        id: habit.id,
        name: 'Leer',
        description: 'd',
        frequency: { kind: 'weekdays' },
        createdAt: habit.createdAt,
        updatedAt: habit.updatedAt,
        archivedAt: null,
      });
    });

    it('fromPersistence reconstruye un Habit sin pasar por validaciones', () => {
      const original = Habit.create({ name: 'X' });
      const restored = Habit.fromPersistence(original.toJSON());

      expect(restored.id).toBe(original.id);
      expect(restored.name).toBe(original.name);
      expect(restored.frequency).toEqual(original.frequency);
      expect(restored).toBeInstanceOf(Habit);
    });

    it('toJSON incluye archivedAt cuando está archivado', () => {
      const habit = Habit.create({ name: 'X' }).archive();
      expect(habit.toJSON().archivedAt).toBeInstanceOf(Date);
    });
  });
});
