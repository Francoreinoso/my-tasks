import express, { type Express } from 'express';
import cors from 'cors';
import type { TaskRepository } from '@/domain/task/TaskRepository.js';
import type { HabitRepository } from '@/domain/habit/HabitRepository.js';
import type { HabitCompletionRepository } from '@/domain/habit/HabitCompletionRepository.js';
import type { NoteRepository } from '@/domain/note/NoteRepository.js';
import { makeTaskController } from './controllers/taskController.js';
import { makeTaskRouter } from './routes/taskRoutes.js';
import { makeHabitController } from './controllers/habitController.js';
import { makeHabitRouter } from './routes/habitRoutes.js';
import { makeNoteController } from './controllers/noteController.js';
import { makeNoteRouter } from './routes/noteRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export interface ServerDeps {
  taskRepository: TaskRepository;
  habitRepository: HabitRepository;
  habitCompletionRepository: HabitCompletionRepository;
  noteRepository: NoteRepository;
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

  const habitController = makeHabitController(
    deps.habitRepository,
    deps.habitCompletionRepository,
  );
  app.use('/api/habits', makeHabitRouter(habitController));

  const noteController = makeNoteController(deps.noteRepository);
  app.use('/api/notes', makeNoteRouter(noteController));

  app.use(errorHandler);

  return app;
}
