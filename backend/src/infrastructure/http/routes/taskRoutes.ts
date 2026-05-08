import { Router } from 'express';
import type { TaskController } from '@/infrastructure/http/controllers/taskController.js';
import { validateBody } from '@/infrastructure/http/middleware/validateBody.js';
import {
  createTaskSchema,
  updateTaskSchema,
} from '@/shared/validation/taskSchemas.js';

export function makeTaskRouter(controller: TaskController): Router {
  const router = Router();

  router.get('/', controller.list);
  router.post('/', validateBody(createTaskSchema), controller.create);
  router.patch('/:id', validateBody(updateTaskSchema), controller.update);
  router.delete('/:id', controller.remove);
  router.post('/:id/toggle', controller.toggle);

  return router;
}
