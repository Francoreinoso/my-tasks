import { describe, it, expect } from 'vitest';
import { Note } from './Note.js';

describe('Note', () => {
  describe('create', () => {
    it('crea una nota con título y contenido', () => {
      const note = Note.create({ title: 'Lista compras', content: '- pan\n- leche' });

      expect(note.title).toBe('Lista compras');
      expect(note.content).toBe('- pan\n- leche');
      expect(note.id).toBeTypeOf('string');
      expect(note.id.length).toBeGreaterThan(0);
      expect(note.createdAt).toBeInstanceOf(Date);
      expect(note.updatedAt).toBeInstanceOf(Date);
    });

    it('acepta título vacío (opcional) si hay contenido', () => {
      const note = Note.create({ title: '', content: 'algo' });
      expect(note.title).toBeNull();
      expect(note.content).toBe('algo');
    });

    it('acepta título null explícito si hay contenido', () => {
      const note = Note.create({ title: null, content: 'algo' });
      expect(note.title).toBeNull();
    });

    it('acepta contenido vacío si hay título', () => {
      const note = Note.create({ title: 'Solo título', content: '' });
      expect(note.title).toBe('Solo título');
      expect(note.content).toBeNull();
    });

    it('hace trim al título y al contenido', () => {
      const note = Note.create({ title: '   Lista   ', content: '  texto  ' });
      expect(note.title).toBe('Lista');
      expect(note.content).toBe('texto');
    });

    it('preserva saltos de línea internos del contenido', () => {
      const note = Note.create({ title: 'X', content: 'línea1\nlínea2\nlínea3' });
      expect(note.content).toBe('línea1\nlínea2\nlínea3');
    });

    it('lanza error si título y contenido están ambos vacíos', () => {
      expect(() => Note.create({ title: '', content: '' })).toThrow(/título.*contenido|contenido.*título/i);
      expect(() => Note.create({ title: null, content: null })).toThrow(/título.*contenido|contenido.*título/i);
      expect(() => Note.create({ title: '   ', content: '   ' })).toThrow(/título.*contenido|contenido.*título/i);
    });

    it('lanza error si el título supera 200 caracteres', () => {
      const longTitle = 'a'.repeat(201);
      expect(() => Note.create({ title: longTitle, content: 'x' })).toThrow(/200/);
    });

    it('lanza error si el contenido supera 10000 caracteres', () => {
      const longContent = 'a'.repeat(10001);
      expect(() => Note.create({ title: 'X', content: longContent })).toThrow(/10000/);
    });

    it('genera ids únicos para notas distintas', () => {
      const a = Note.create({ title: 'A', content: 'x' });
      const b = Note.create({ title: 'B', content: 'x' });
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('updateTitle', () => {
    it('devuelve nueva instancia con el título actualizado', () => {
      const note = Note.create({ title: 'Original', content: 'x' });
      const updated = note.updateTitle('Nuevo');

      expect(updated.title).toBe('Nuevo');
      expect(note.title).toBe('Original');
    });

    it('hace trim y valida largo máximo', () => {
      const note = Note.create({ title: 'X', content: 'x' });
      expect(note.updateTitle('   Limpio   ').title).toBe('Limpio');
      expect(() => note.updateTitle('a'.repeat(201))).toThrow(/200/);
    });

    it('acepta null o vacío para limpiar el título si hay contenido', () => {
      const note = Note.create({ title: 'X', content: 'tiene contenido' });
      expect(note.updateTitle(null).title).toBeNull();
      expect(note.updateTitle('').title).toBeNull();
    });

    it('rechaza limpiar el título si el contenido también está vacío', () => {
      const note = Note.create({ title: 'X', content: '' });
      expect(() => note.updateTitle(null)).toThrow(/título.*contenido|contenido.*título/i);
    });

    it('con el mismo título devuelve la misma instancia', () => {
      const note = Note.create({ title: 'Igual', content: 'x' });
      expect(note.updateTitle('Igual')).toBe(note);
    });
  });

  describe('updateContent', () => {
    it('devuelve nueva instancia con contenido actualizado', () => {
      const note = Note.create({ title: 'X', content: 'viejo' });
      const updated = note.updateContent('nuevo');

      expect(updated.content).toBe('nuevo');
      expect(note.content).toBe('viejo');
    });

    it('acepta null o vacío para limpiar contenido si hay título', () => {
      const note = Note.create({ title: 'Tiene título', content: 'x' });
      expect(note.updateContent(null).content).toBeNull();
      expect(note.updateContent('').content).toBeNull();
    });

    it('rechaza limpiar contenido si el título también está vacío', () => {
      const note = Note.create({ title: null, content: 'algo' });
      expect(() => note.updateContent(null)).toThrow(/título.*contenido|contenido.*título/i);
    });

    it('valida largo máximo de 10000 caracteres', () => {
      const note = Note.create({ title: 'X', content: 'x' });
      expect(() => note.updateContent('a'.repeat(10001))).toThrow(/10000/);
    });

    it('con el mismo contenido devuelve la misma instancia', () => {
      const note = Note.create({ title: 'X', content: 'igual' });
      expect(note.updateContent('igual')).toBe(note);
    });
  });

  describe('serialización', () => {
    it('toJSON devuelve un objeto plano con todos los campos', () => {
      const note = Note.create({ title: 'T', content: 'C' });
      const json = note.toJSON();

      expect(json).toEqual({
        id: note.id,
        title: 'T',
        content: 'C',
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      });
    });

    it('toJSON preserva título o contenido null', () => {
      const note = Note.create({ title: null, content: 'solo contenido' });
      expect(note.toJSON().title).toBeNull();
    });

    it('fromPersistence reconstruye un Note sin pasar por validaciones', () => {
      const original = Note.create({ title: 'X', content: 'y' });
      const restored = Note.fromPersistence(original.toJSON());

      expect(restored.id).toBe(original.id);
      expect(restored.title).toBe(original.title);
      expect(restored.content).toBe(original.content);
      expect(restored).toBeInstanceOf(Note);
    });
  });
});
