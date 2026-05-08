import { describe, it, expect } from 'vitest';
import { Task } from './Task.js';

describe('Task', () => {
  describe('create', () => {
    it('crea una tarea con título válido y valores por defecto', () => {
      const task = Task.create({ title: 'Estudiar React' });

      expect(task.title).toBe('Estudiar React');
      expect(task.description).toBeNull();
      expect(task.status).toBe('pending');
      expect(task.id).toBeTypeOf('string');
      expect(task.id.length).toBeGreaterThan(0);
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeInstanceOf(Date);
    });

    it('acepta una descripción opcional y la guarda', () => {
      const task = Task.create({
        title: 'Leer libro',
        description: 'Clean Architecture, capítulo 5',
      });

      expect(task.description).toBe('Clean Architecture, capítulo 5');
    });

    it('hace trim al título y a la descripción', () => {
      const task = Task.create({
        title: '   Comprar pan   ',
        description: '  con sal marina  ',
      });

      expect(task.title).toBe('Comprar pan');
      expect(task.description).toBe('con sal marina');
    });

    it('convierte descripción vacía o solo-espacios en null', () => {
      const task = Task.create({ title: 'X', description: '   ' });
      expect(task.description).toBeNull();
    });

    it('lanza error si el título está vacío', () => {
      expect(() => Task.create({ title: '' })).toThrow(/título.*vacío/i);
      expect(() => Task.create({ title: '   ' })).toThrow(/título.*vacío/i);
    });

    it('lanza error si el título supera 200 caracteres', () => {
      const longTitle = 'a'.repeat(201);
      expect(() => Task.create({ title: longTitle })).toThrow(/200/);
    });

    it('genera ids únicos para tareas distintas', () => {
      const a = Task.create({ title: 'A' });
      const b = Task.create({ title: 'B' });
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('complete / uncomplete / toggle', () => {
    it('complete devuelve una nueva instancia con status="completed"', () => {
      const task = Task.create({ title: 'Tarea' });
      const completed = task.complete();

      expect(completed.status).toBe('completed');
      expect(task.status).toBe('pending'); // inmutable
      expect(completed.id).toBe(task.id);
      expect(completed.updatedAt.getTime()).toBeGreaterThanOrEqual(task.updatedAt.getTime());
    });

    it('complete sobre una tarea ya completada devuelve la misma instancia', () => {
      const task = Task.create({ title: 'Tarea' }).complete();
      expect(task.complete()).toBe(task);
    });

    it('uncomplete vuelve el status a "pending"', () => {
      const task = Task.create({ title: 'Tarea' }).complete();
      const reopened = task.uncomplete();

      expect(reopened.status).toBe('pending');
      expect(task.status).toBe('completed');
    });

    it('toggle alterna entre pending y completed', () => {
      const task = Task.create({ title: 'Tarea' });
      expect(task.toggle().status).toBe('completed');
      expect(task.toggle().toggle().status).toBe('pending');
    });
  });

  describe('updateTitle / updateDescription', () => {
    it('updateTitle devuelve nueva instancia con el título actualizado', () => {
      const task = Task.create({ title: 'Original' });
      const updated = task.updateTitle('Nuevo título');

      expect(updated.title).toBe('Nuevo título');
      expect(task.title).toBe('Original');
    });

    it('updateTitle hace trim y valida el nuevo título', () => {
      const task = Task.create({ title: 'X' });
      expect(task.updateTitle('   Limpio   ').title).toBe('Limpio');
      expect(() => task.updateTitle('')).toThrow(/título/i);
      expect(() => task.updateTitle('a'.repeat(201))).toThrow(/200/);
    });

    it('updateDescription acepta string o null', () => {
      const task = Task.create({ title: 'X' });
      expect(task.updateDescription('detalles').description).toBe('detalles');
      expect(task.updateDescription(null).description).toBeNull();
    });
  });

  describe('serialización', () => {
    it('toJSON devuelve un objeto plano con todos los campos', () => {
      const task = Task.create({ title: 'X', description: 'd' });
      const json = task.toJSON();

      expect(json).toEqual({
        id: task.id,
        title: 'X',
        description: 'd',
        dueDate: null,
        status: 'pending',
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      });
    });

    it('fromPersistence reconstruye una Task sin pasar por validaciones', () => {
      const original = Task.create({ title: 'X' });
      const restored = Task.fromPersistence(original.toJSON());

      expect(restored.id).toBe(original.id);
      expect(restored.title).toBe(original.title);
      expect(restored.status).toBe(original.status);
      expect(restored).toBeInstanceOf(Task);
    });
  });

  describe('dueDate', () => {
    it('create sin dueDate deja el campo en null', () => {
      const task = Task.create({ title: 'X' });
      expect(task.dueDate).toBeNull();
    });

    it('create acepta una fecha ISO válida', () => {
      const task = Task.create({ title: 'X', dueDate: '2026-05-12' });
      expect(task.dueDate).toBe('2026-05-12');
    });

    it('create rechaza formato no-ISO', () => {
      expect(() => Task.create({ title: 'X', dueDate: '12-05-2026' })).toThrow(
        /YYYY-MM-DD/,
      );
      expect(() => Task.create({ title: 'X', dueDate: '2026/05/12' })).toThrow(
        /YYYY-MM-DD/,
      );
      expect(() => Task.create({ title: 'X', dueDate: 'mañana' })).toThrow(
        /YYYY-MM-DD/,
      );
    });

    it('create rechaza fechas calendario inválidas (ej. 30 de febrero)', () => {
      expect(() => Task.create({ title: 'X', dueDate: '2026-02-30' })).toThrow(
        /inválida/i,
      );
      expect(() => Task.create({ title: 'X', dueDate: '2026-13-01' })).toThrow(
        /inválida/i,
      );
    });

    it('setDueDate asigna una fecha y retorna nueva instancia', () => {
      const task = Task.create({ title: 'X' });
      const dated = task.setDueDate('2026-05-15');
      expect(dated.dueDate).toBe('2026-05-15');
      expect(task.dueDate).toBeNull();
    });

    it('setDueDate(null) borra la fecha', () => {
      const task = Task.create({ title: 'X', dueDate: '2026-05-15' });
      const cleared = task.setDueDate(null);
      expect(cleared.dueDate).toBeNull();
    });

    it('setDueDate con la misma fecha devuelve la misma instancia', () => {
      const task = Task.create({ title: 'X', dueDate: '2026-05-15' });
      expect(task.setDueDate('2026-05-15')).toBe(task);
    });

    it('setDueDate valida igual que create', () => {
      const task = Task.create({ title: 'X' });
      expect(() => task.setDueDate('not-a-date')).toThrow(/YYYY-MM-DD/);
    });

    it('toJSON incluye dueDate', () => {
      const task = Task.create({ title: 'X', dueDate: '2026-05-15' });
      expect(task.toJSON().dueDate).toBe('2026-05-15');
    });
  });
});
