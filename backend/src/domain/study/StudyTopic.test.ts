import { describe, it, expect } from 'vitest';
import { StudyTopic } from './StudyTopic.js';
import {
  StudyItemNotFoundError,
  StudyLinkNotFoundError,
} from './errors.js';

describe('StudyTopic', () => {
  describe('create', () => {
    it('crea un tema con título y sin items ni links', () => {
      const topic = StudyTopic.create({ title: 'React' });

      expect(topic.title).toBe('React');
      expect(topic.items).toEqual([]);
      expect(topic.links).toEqual([]);
      expect(topic.id).toBeTypeOf('string');
      expect(topic.id.length).toBeGreaterThan(0);
      expect(topic.createdAt).toBeInstanceOf(Date);
      expect(topic.updatedAt).toBeInstanceOf(Date);
    });

    it('hace trim al título', () => {
      const topic = StudyTopic.create({ title: '   React   ' });
      expect(topic.title).toBe('React');
    });

    it('lanza error si el título está vacío', () => {
      expect(() => StudyTopic.create({ title: '' })).toThrow(/título.*vacío/i);
      expect(() => StudyTopic.create({ title: '   ' })).toThrow(/título.*vacío/i);
    });

    it('lanza error si el título supera 200 caracteres', () => {
      const long = 'a'.repeat(201);
      expect(() => StudyTopic.create({ title: long })).toThrow(/200/);
    });

    it('genera ids únicos para temas distintos', () => {
      const a = StudyTopic.create({ title: 'A' });
      const b = StudyTopic.create({ title: 'B' });
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('updateTitle', () => {
    it('devuelve nueva instancia con título actualizado', () => {
      const topic = StudyTopic.create({ title: 'Viejo' });
      const updated = topic.updateTitle('Nuevo');

      expect(updated.title).toBe('Nuevo');
      expect(topic.title).toBe('Viejo');
    });

    it('hace trim y valida largo máximo', () => {
      const topic = StudyTopic.create({ title: 'X' });
      expect(topic.updateTitle('   Limpio   ').title).toBe('Limpio');
      expect(() => topic.updateTitle('')).toThrow(/título.*vacío/i);
      expect(() => topic.updateTitle('a'.repeat(201))).toThrow(/200/);
    });

    it('con el mismo título devuelve la misma instancia', () => {
      const topic = StudyTopic.create({ title: 'Igual' });
      expect(topic.updateTitle('Igual')).toBe(topic);
    });
  });

  describe('items', () => {
    it('addItem agrega un item nuevo con completed=false', () => {
      const topic = StudyTopic.create({ title: 'React' });
      const updated = topic.addItem('Hooks básicos');

      expect(updated.items).toHaveLength(1);
      expect(updated.items[0]?.label).toBe('Hooks básicos');
      expect(updated.items[0]?.completed).toBe(false);
      expect(updated.items[0]?.id).toBeTypeOf('string');
      expect(topic.items).toEqual([]); // original inmutable
    });

    it('addItem hace trim y valida no vacío', () => {
      const topic = StudyTopic.create({ title: 'X' });
      expect(topic.addItem('   Hooks   ').items[0]?.label).toBe('Hooks');
      expect(() => topic.addItem('')).toThrow(/label.*vacío|vacío.*label/i);
      expect(() => topic.addItem('a'.repeat(201))).toThrow(/200/);
    });

    it('addItem preserva los items anteriores y agrega al final', () => {
      const topic = StudyTopic.create({ title: 'X' })
        .addItem('Uno')
        .addItem('Dos')
        .addItem('Tres');

      expect(topic.items.map((i) => i.label)).toEqual(['Uno', 'Dos', 'Tres']);
    });

    it('toggleItem cambia el estado completed del item indicado', () => {
      const topic = StudyTopic.create({ title: 'X' }).addItem('A').addItem('B');
      const itemA = topic.items[0];
      if (!itemA) throw new Error('test fixture');

      const toggled = topic.toggleItem(itemA.id);

      expect(toggled.items[0]?.completed).toBe(true);
      expect(toggled.items[1]?.completed).toBe(false);
      // re-toggle vuelve a false
      expect(toggled.toggleItem(itemA.id).items[0]?.completed).toBe(false);
    });

    it('toggleItem lanza ItemNotFoundError si el id no existe', () => {
      const topic = StudyTopic.create({ title: 'X' });
      expect(() => topic.toggleItem('no-existe')).toThrow(StudyItemNotFoundError);
    });

    it('updateItem cambia el label de un item', () => {
      const topic = StudyTopic.create({ title: 'X' }).addItem('viejo');
      const item = topic.items[0];
      if (!item) throw new Error('test fixture');

      const updated = topic.updateItem(item.id, { label: 'nuevo' });
      expect(updated.items[0]?.label).toBe('nuevo');
    });

    it('updateItem valida el label nuevo', () => {
      const topic = StudyTopic.create({ title: 'X' }).addItem('x');
      const item = topic.items[0];
      if (!item) throw new Error('test fixture');

      expect(() => topic.updateItem(item.id, { label: '' })).toThrow(/vacío/i);
    });

    it('updateItem lanza ItemNotFoundError si no existe', () => {
      const topic = StudyTopic.create({ title: 'X' });
      expect(() => topic.updateItem('no-existe', { label: 'x' })).toThrow(
        StudyItemNotFoundError,
      );
    });

    it('removeItem quita el item indicado', () => {
      const topic = StudyTopic.create({ title: 'X' })
        .addItem('A')
        .addItem('B')
        .addItem('C');
      const itemB = topic.items[1];
      if (!itemB) throw new Error('test fixture');

      const updated = topic.removeItem(itemB.id);
      expect(updated.items.map((i) => i.label)).toEqual(['A', 'C']);
    });

    it('removeItem lanza ItemNotFoundError si no existe', () => {
      const topic = StudyTopic.create({ title: 'X' });
      expect(() => topic.removeItem('no-existe')).toThrow(StudyItemNotFoundError);
    });
  });

  describe('links', () => {
    it('addLink agrega un link con label y URL válidos', () => {
      const topic = StudyTopic.create({ title: 'React' });
      const updated = topic.addLink('Curso JS Total', 'https://example.com/curso');

      expect(updated.links).toHaveLength(1);
      expect(updated.links[0]?.label).toBe('Curso JS Total');
      expect(updated.links[0]?.url).toBe('https://example.com/curso');
      expect(updated.links[0]?.id).toBeTypeOf('string');
    });

    it('addLink hace trim al label y a la URL', () => {
      const topic = StudyTopic.create({ title: 'X' });
      const updated = topic.addLink(
        '   Curso   ',
        '   https://example.com  ',
      );
      expect(updated.links[0]?.label).toBe('Curso');
      expect(updated.links[0]?.url).toBe('https://example.com');
    });

    it('addLink rechaza label vacío', () => {
      const topic = StudyTopic.create({ title: 'X' });
      expect(() => topic.addLink('', 'https://example.com')).toThrow(/label/i);
    });

    it('addLink rechaza label > 100 caracteres', () => {
      const topic = StudyTopic.create({ title: 'X' });
      expect(() => topic.addLink('a'.repeat(101), 'https://example.com')).toThrow(
        /100/,
      );
    });

    it('addLink rechaza URL inválida', () => {
      const topic = StudyTopic.create({ title: 'X' });
      expect(() => topic.addLink('lbl', 'no-es-url')).toThrow(/url|inválida/i);
      expect(() => topic.addLink('lbl', '')).toThrow(/url|vacía/i);
    });

    it('addLink acepta http y https', () => {
      const topic = StudyTopic.create({ title: 'X' });
      expect(() => topic.addLink('a', 'http://example.com')).not.toThrow();
      expect(() => topic.addLink('b', 'https://example.com')).not.toThrow();
    });

    it('addLink rechaza protocolos peligrosos', () => {
      const topic = StudyTopic.create({ title: 'X' });
      expect(() => topic.addLink('mal', 'javascript:alert(1)')).toThrow(/protocolo|http/i);
      expect(() => topic.addLink('mal', 'file:///etc/passwd')).toThrow(/protocolo|http/i);
    });

    it('updateLink cambia label y/o url', () => {
      const topic = StudyTopic.create({ title: 'X' }).addLink(
        'viejo',
        'https://old.com',
      );
      const link = topic.links[0];
      if (!link) throw new Error('test fixture');

      const updated = topic.updateLink(link.id, {
        label: 'nuevo',
        url: 'https://new.com',
      });
      expect(updated.links[0]?.label).toBe('nuevo');
      expect(updated.links[0]?.url).toBe('https://new.com');
    });

    it('updateLink valida los campos nuevos', () => {
      const topic = StudyTopic.create({ title: 'X' }).addLink(
        'x',
        'https://e.com',
      );
      const link = topic.links[0];
      if (!link) throw new Error('test fixture');

      expect(() => topic.updateLink(link.id, { url: 'mal' })).toThrow(/url|inválida/i);
      expect(() => topic.updateLink(link.id, { label: '' })).toThrow(/label/i);
    });

    it('updateLink lanza LinkNotFoundError si no existe', () => {
      const topic = StudyTopic.create({ title: 'X' });
      expect(() => topic.updateLink('no-existe', { label: 'x' })).toThrow(
        StudyLinkNotFoundError,
      );
    });

    it('removeLink quita el link indicado', () => {
      const topic = StudyTopic.create({ title: 'X' })
        .addLink('A', 'https://a.com')
        .addLink('B', 'https://b.com');
      const linkA = topic.links[0];
      if (!linkA) throw new Error('test fixture');

      const updated = topic.removeLink(linkA.id);
      expect(updated.links.map((l) => l.label)).toEqual(['B']);
    });

    it('removeLink lanza LinkNotFoundError si no existe', () => {
      const topic = StudyTopic.create({ title: 'X' });
      expect(() => topic.removeLink('no-existe')).toThrow(StudyLinkNotFoundError);
    });
  });

  describe('serialización', () => {
    it('toJSON devuelve un objeto plano con todos los campos', () => {
      const topic = StudyTopic.create({ title: 'React' })
        .addItem('Hooks')
        .addLink('Curso', 'https://example.com');

      const json = topic.toJSON();
      expect(json.id).toBe(topic.id);
      expect(json.title).toBe('React');
      expect(json.items).toHaveLength(1);
      expect(json.items[0]?.label).toBe('Hooks');
      expect(json.items[0]?.completed).toBe(false);
      expect(json.links).toHaveLength(1);
      expect(json.links[0]?.label).toBe('Curso');
      expect(json.links[0]?.url).toBe('https://example.com');
      expect(json.createdAt).toBeInstanceOf(Date);
      expect(json.updatedAt).toBeInstanceOf(Date);
    });

    it('fromPersistence reconstruye un StudyTopic sin pasar por validaciones', () => {
      const original = StudyTopic.create({ title: 'X' }).addItem('a');
      const restored = StudyTopic.fromPersistence(original.toJSON());

      expect(restored.id).toBe(original.id);
      expect(restored.title).toBe(original.title);
      expect(restored.items).toEqual(original.items);
      expect(restored).toBeInstanceOf(StudyTopic);
    });
  });
});
