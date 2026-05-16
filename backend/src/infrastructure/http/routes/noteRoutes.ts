import { Router } from 'express';
import type { NoteController } from '@/infrastructure/http/controllers/noteController.js';
import { validateBody } from '@/infrastructure/http/middleware/validateBody.js';
import {
  createNoteSchema,
  updateNoteSchema,
} from '@/shared/validation/noteSchemas.js';

export function makeNoteRouter(controller: NoteController): Router {
  const router = Router();

  router.get('/', controller.list);
  router.post('/', validateBody(createNoteSchema), controller.create);
  router.get('/:id', controller.get);
  router.patch('/:id', validateBody(updateNoteSchema), controller.update);
  router.delete('/:id', controller.remove);

  return router;
}
