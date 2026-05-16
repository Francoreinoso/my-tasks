import type { Request, Response } from 'express';
import type { StudyTopicRepository } from '@/domain/study/StudyTopicRepository.js';
import { createTopic } from '@/application/study/createTopic.js';
import { listTopics } from '@/application/study/listTopics.js';
import { getTopic } from '@/application/study/getTopic.js';
import { updateTopicTitle } from '@/application/study/updateTopicTitle.js';
import { deleteTopic } from '@/application/study/deleteTopic.js';
import { addItem } from '@/application/study/addItem.js';
import { updateItem } from '@/application/study/updateItem.js';
import { toggleItem } from '@/application/study/toggleItem.js';
import { removeItem } from '@/application/study/removeItem.js';
import { addLink } from '@/application/study/addLink.js';
import { updateLink } from '@/application/study/updateLink.js';
import { removeLink } from '@/application/study/removeLink.js';
import type {
  CreateTopicRequest,
  UpdateTopicTitleRequest,
  AddItemRequest,
  UpdateItemRequest,
  AddLinkRequest,
  UpdateLinkRequest,
} from '@/shared/validation/studySchemas.js';

type IdParams = { id: string };
type ItemParams = { id: string; itemId: string };
type LinkParams = { id: string; linkId: string };

export function makeStudyController(repo: StudyTopicRepository) {
  return {
    list: async (_req: Request, res: Response): Promise<void> => {
      const topics = await listTopics(repo);
      res.json(topics.map((t) => t.toJSON()));
    },

    create: async (req: Request, res: Response): Promise<void> => {
      const body = req.body as CreateTopicRequest;
      const topic = await createTopic(repo, { title: body.title });
      res.status(201).json(topic.toJSON());
    },

    get: async (req: Request<IdParams>, res: Response): Promise<void> => {
      const topic = await getTopic(repo, req.params.id);
      res.json(topic.toJSON());
    },

    updateTitle: async (req: Request<IdParams>, res: Response): Promise<void> => {
      const body = req.body as UpdateTopicTitleRequest;
      const topic = await updateTopicTitle(repo, req.params.id, body.title);
      res.json(topic.toJSON());
    },

    remove: async (req: Request<IdParams>, res: Response): Promise<void> => {
      await deleteTopic(repo, req.params.id);
      res.status(204).send();
    },

    addItem: async (req: Request<IdParams>, res: Response): Promise<void> => {
      const body = req.body as AddItemRequest;
      const topic = await addItem(repo, req.params.id, body.label);
      res.status(201).json(topic.toJSON());
    },

    updateItem: async (req: Request<ItemParams>, res: Response): Promise<void> => {
      const body = req.body as UpdateItemRequest;
      const topic = await updateItem(repo, req.params.id, req.params.itemId, {
        label: body.label,
      });
      res.json(topic.toJSON());
    },

    toggleItem: async (req: Request<ItemParams>, res: Response): Promise<void> => {
      const topic = await toggleItem(repo, req.params.id, req.params.itemId);
      res.json(topic.toJSON());
    },

    removeItem: async (req: Request<ItemParams>, res: Response): Promise<void> => {
      const topic = await removeItem(repo, req.params.id, req.params.itemId);
      res.json(topic.toJSON());
    },

    addLink: async (req: Request<IdParams>, res: Response): Promise<void> => {
      const body = req.body as AddLinkRequest;
      const topic = await addLink(repo, req.params.id, body.label, body.url);
      res.status(201).json(topic.toJSON());
    },

    updateLink: async (req: Request<LinkParams>, res: Response): Promise<void> => {
      const body = req.body as UpdateLinkRequest;
      const changes: { label?: string; url?: string } = {};
      if (body.label !== undefined) changes.label = body.label;
      if (body.url !== undefined) changes.url = body.url;
      const topic = await updateLink(repo, req.params.id, req.params.linkId, changes);
      res.json(topic.toJSON());
    },

    removeLink: async (req: Request<LinkParams>, res: Response): Promise<void> => {
      const topic = await removeLink(repo, req.params.id, req.params.linkId);
      res.json(topic.toJSON());
    },
  };
}

export type StudyController = ReturnType<typeof makeStudyController>;
