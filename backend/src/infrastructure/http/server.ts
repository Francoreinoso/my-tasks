import express, { type Express } from 'express';
import cors from 'cors';
import type { TaskRepository } from '@/domain/task/TaskRepository.js';
import { makeTaskController } from './controllers/taskController.js';
import { makeTaskRouter } from './routes/taskRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export interface ServerDeps {
  taskRepository: TaskRepository;
  corsOrigin: string | string[];
}

/**
 * Construye la app Express. NO la arranca — solo la devuelve, para que
 * pueda ser usada tanto desde index.ts (production) como desde tests.
 */
export function createApp(deps: ServerDeps): Express {
  const app = express();

  app.use(cors({ origin: deps.corsOrigin }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const taskController = makeTaskController(deps.taskRepository);
  app.use('/api/tasks', makeTaskRouter(taskController));

  app.use(errorHandler);

  return app;
}
