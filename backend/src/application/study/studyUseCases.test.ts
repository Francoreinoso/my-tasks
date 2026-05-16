import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryStudyTopicRepository } from '@/infrastructure/persistence/InMemoryStudyTopicRepository.js';
import { StudyTopic } from '@/domain/study/StudyTopic.js';
import {
  StudyTopicNotFoundError,
  StudyItemNotFoundError,
  StudyLinkNotFoundError,
} from '@/domain/study/errors.js';
import { createTopic } from './createTopic.js';
import { listTopics } from './listTopics.js';
import { getTopic } from './getTopic.js';
import { updateTopicTitle } from './updateTopicTitle.js';
import { deleteTopic } from './deleteTopic.js';
import { addItem } from './addItem.js';
import { updateItem } from './updateItem.js';
import { toggleItem } from './toggleItem.js';
import { removeItem } from './removeItem.js';
import { addLink } from './addLink.js';
import { updateLink } from './updateLink.js';
import { removeLink } from './removeLink.js';

describe('study use cases', () => {
  let repo: InMemoryStudyTopicRepository;

  beforeEach(() => {
    repo = new InMemoryStudyTopicRepository();
  });

  describe('createTopic', () => {
    it('crea y persiste un tema', async () => {
      const topic = await createTopic(repo, { title: 'React' });
      expect(topic.title).toBe('React');
      const stored = await repo.findById(topic.id);
      expect(stored?.title).toBe('React');
    });

    it('propaga validación', async () => {
      await expect(createTopic(repo, { title: '' })).rejects.toThrow(/título/i);
    });
  });

  describe('listTopics', () => {
    it('devuelve [] cuando no hay temas', async () => {
      expect(await listTopics(repo)).toEqual([]);
    });

    it('ordena por createdAt ASC', async () => {
      const a = StudyTopic.create({ title: 'A' });
      await new Promise((r) => setTimeout(r, 5));
      const b = StudyTopic.create({ title: 'B' });
      await new Promise((r) => setTimeout(r, 5));
      const c = StudyTopic.create({ title: 'C' });
      await repo.save(c);
      await repo.save(a);
      await repo.save(b);

      const list = await listTopics(repo);
      expect(list.map((t) => t.title)).toEqual(['A', 'B', 'C']);
    });
  });

  describe('getTopic', () => {
    it('devuelve el tema si existe', async () => {
      const t = StudyTopic.create({ title: 'X' });
      await repo.save(t);
      const found = await getTopic(repo, t.id);
      expect(found.id).toBe(t.id);
    });

    it('lanza StudyTopicNotFoundError si no existe', async () => {
      await expect(getTopic(repo, 'no-existe')).rejects.toThrow(StudyTopicNotFoundError);
    });
  });

  describe('updateTopicTitle', () => {
    it('actualiza el título', async () => {
      const t = StudyTopic.create({ title: 'Original' });
      await repo.save(t);
      const updated = await updateTopicTitle(repo, t.id, 'Nuevo');
      expect(updated.title).toBe('Nuevo');
      expect((await repo.findById(t.id))?.title).toBe('Nuevo');
    });

    it('lanza NotFoundError si no existe', async () => {
      await expect(updateTopicTitle(repo, 'no-existe', 'X')).rejects.toThrow(
        StudyTopicNotFoundError,
      );
    });
  });

  describe('deleteTopic', () => {
    it('borra el tema existente', async () => {
      const t = StudyTopic.create({ title: 'X' });
      await repo.save(t);
      await deleteTopic(repo, t.id);
      expect(await repo.findById(t.id)).toBeNull();
    });

    it('lanza NotFoundError si no existe', async () => {
      await expect(deleteTopic(repo, 'no-existe')).rejects.toThrow(
        StudyTopicNotFoundError,
      );
    });
  });

  describe('items use cases', () => {
    it('addItem agrega y persiste', async () => {
      const t = StudyTopic.create({ title: 'X' });
      await repo.save(t);

      const updated = await addItem(repo, t.id, 'Hooks');
      expect(updated.items[0]?.label).toBe('Hooks');
      expect((await repo.findById(t.id))?.items[0]?.label).toBe('Hooks');
    });

    it('addItem lanza si el tema no existe', async () => {
      await expect(addItem(repo, 'no-existe', 'x')).rejects.toThrow(
        StudyTopicNotFoundError,
      );
    });

    it('updateItem cambia el label', async () => {
      let t = StudyTopic.create({ title: 'X' }).addItem('viejo');
      await repo.save(t);
      const itemId = t.items[0]!.id;

      t = await updateItem(repo, t.id, itemId, { label: 'nuevo' });
      expect(t.items[0]?.label).toBe('nuevo');
    });

    it('updateItem lanza si el item no existe', async () => {
      const t = StudyTopic.create({ title: 'X' });
      await repo.save(t);
      await expect(
        updateItem(repo, t.id, 'no-existe', { label: 'x' }),
      ).rejects.toThrow(StudyItemNotFoundError);
    });

    it('toggleItem invierte completed', async () => {
      let t = StudyTopic.create({ title: 'X' }).addItem('a');
      await repo.save(t);
      const itemId = t.items[0]!.id;

      t = await toggleItem(repo, t.id, itemId);
      expect(t.items[0]?.completed).toBe(true);
      t = await toggleItem(repo, t.id, itemId);
      expect(t.items[0]?.completed).toBe(false);
    });

    it('removeItem quita el item', async () => {
      let t = StudyTopic.create({ title: 'X' }).addItem('a').addItem('b');
      await repo.save(t);
      const itemId = t.items[0]!.id;

      t = await removeItem(repo, t.id, itemId);
      expect(t.items).toHaveLength(1);
      expect(t.items[0]?.label).toBe('b');
    });

    it('removeItem lanza si el item no existe', async () => {
      const t = StudyTopic.create({ title: 'X' });
      await repo.save(t);
      await expect(removeItem(repo, t.id, 'no-existe')).rejects.toThrow(
        StudyItemNotFoundError,
      );
    });
  });

  describe('links use cases', () => {
    it('addLink agrega un link válido', async () => {
      const t = StudyTopic.create({ title: 'X' });
      await repo.save(t);

      const updated = await addLink(repo, t.id, 'Curso', 'https://example.com');
      expect(updated.links[0]?.label).toBe('Curso');
      expect(updated.links[0]?.url).toBe('https://example.com');
    });

    it('addLink valida URL', async () => {
      const t = StudyTopic.create({ title: 'X' });
      await repo.save(t);
      await expect(addLink(repo, t.id, 'lbl', 'no-url')).rejects.toThrow(/url|inválida/i);
    });

    it('addLink lanza si el tema no existe', async () => {
      await expect(addLink(repo, 'no-existe', 'l', 'https://e.com')).rejects.toThrow(
        StudyTopicNotFoundError,
      );
    });

    it('updateLink cambia label y url', async () => {
      let t = StudyTopic.create({ title: 'X' }).addLink('viejo', 'https://old.com');
      await repo.save(t);
      const linkId = t.links[0]!.id;

      t = await updateLink(repo, t.id, linkId, {
        label: 'nuevo',
        url: 'https://new.com',
      });
      expect(t.links[0]?.label).toBe('nuevo');
      expect(t.links[0]?.url).toBe('https://new.com');
    });

    it('updateLink lanza si el link no existe', async () => {
      const t = StudyTopic.create({ title: 'X' });
      await repo.save(t);
      await expect(
        updateLink(repo, t.id, 'no-existe', { label: 'x' }),
      ).rejects.toThrow(StudyLinkNotFoundError);
    });

    it('removeLink quita el link', async () => {
      let t = StudyTopic.create({ title: 'X' }).addLink('a', 'https://a.com');
      await repo.save(t);
      const linkId = t.links[0]!.id;

      t = await removeLink(repo, t.id, linkId);
      expect(t.links).toEqual([]);
    });
  });
});
