import { Router } from 'express';
import type { StudyController } from '@/infrastructure/http/controllers/studyController.js';
import { validateBody } from '@/infrastructure/http/middleware/validateBody.js';
import {
  createTopicSchema,
  updateTopicTitleSchema,
  addItemSchema,
  updateItemSchema,
  addLinkSchema,
  updateLinkSchema,
} from '@/shared/validation/studySchemas.js';

export function makeStudyRouter(controller: StudyController): Router {
  const router = Router();

  // topics
  router.get('/topics', controller.list);
  router.post('/topics', validateBody(createTopicSchema), controller.create);
  router.get('/topics/:id', controller.get);
  router.patch('/topics/:id', validateBody(updateTopicTitleSchema), controller.updateTitle);
  router.delete('/topics/:id', controller.remove);

  // items
  router.post('/topics/:id/items', validateBody(addItemSchema), controller.addItem);
  router.patch(
    '/topics/:id/items/:itemId',
    validateBody(updateItemSchema),
    controller.updateItem,
  );
  router.post('/topics/:id/items/:itemId/toggle', controller.toggleItem);
  router.delete('/topics/:id/items/:itemId', controller.removeItem);

  // links
  router.post('/topics/:id/links', validateBody(addLinkSchema), controller.addLink);
  router.patch(
    '/topics/:id/links/:linkId',
    validateBody(updateLinkSchema),
    controller.updateLink,
  );
  router.delete('/topics/:id/links/:linkId', controller.removeLink);

  return router;
}
