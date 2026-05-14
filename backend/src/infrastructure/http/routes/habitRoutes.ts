import { Router } from 'express';
import type { HabitController } from '@/infrastructure/http/controllers/habitController.js';
import { validateBody } from '@/infrastructure/http/middleware/validateBody.js';
import {
  createHabitSchema,
  updateHabitSchema,
  markCompletionSchema,
} from '@/shared/validation/habitSchemas.js';

export function makeHabitRouter(controller: HabitController): Router {
  const router = Router();

  router.get('/', controller.list);
  router.post('/', validateBody(createHabitSchema), controller.create);

  router.get('/:id/completions', controller.listCompletions);
  router.post(
    '/:id/completions',
    validateBody(markCompletionSchema),
    controller.markCompletion,
  );
  router.delete('/:id/completions', controller.unmarkCompletion);

  router.get('/:id/stats', controller.stats);
  router.post('/:id/archive', controller.archive);
  router.post('/:id/unarchive', controller.unarchive);

  router.get('/:id', controller.get);
  router.patch('/:id', validateBody(updateHabitSchema), controller.update);
  router.delete('/:id', controller.remove);

  return router;
}
