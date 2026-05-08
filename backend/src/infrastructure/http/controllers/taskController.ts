import type { Request, Response } from 'express';
import type { TaskRepository } from '@/domain/task/TaskRepository.js';
import type { CreateTaskInput } from '@/domain/task/Task.js';
import { createTask } from '@/application/task/createTask.js';
import { listTasks } from '@/application/task/listTasks.js';
import { updateTask, type UpdateTaskInput } from '@/application/task/updateTask.js';
import { deleteTask } from '@/application/task/deleteTask.js';
import { toggleTaskStatus } from '@/application/task/toggleTaskStatus.js';
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
} from '@/shared/validation/taskSchemas.js';

type IdParams = { id: string };

export function makeTaskController(repo: TaskRepository) {
  return {
    list: async (_req: Request, res: Response): Promise<void> => {
      const tasks = await listTasks(repo);
      res.json(tasks.map((t) => t.toJSON()));
    },

    create: async (req: Request, res: Response): Promise<void> => {
      const body = req.body as CreateTaskRequest;
      const input: CreateTaskInput = { title: body.title };
      if (body.description !== undefined) input.description = body.description;
      if (body.dueDate !== undefined) input.dueDate = body.dueDate;
      const task = await createTask(repo, input);
      res.status(201).json(task.toJSON());
    },

    update: async (req: Request<IdParams>, res: Response): Promise<void> => {
      const body = req.body as UpdateTaskRequest;
      const input: UpdateTaskInput = {};
      if (body.title !== undefined) input.title = body.title;
      if (body.description !== undefined) input.description = body.description;
      if (body.dueDate !== undefined) input.dueDate = body.dueDate;
      const task = await updateTask(repo, req.params.id, input);
      res.json(task.toJSON());
    },

    remove: async (req: Request<IdParams>, res: Response): Promise<void> => {
      await deleteTask(repo, req.params.id);
      res.status(204).send();
    },

    toggle: async (req: Request<IdParams>, res: Response): Promise<void> => {
      const task = await toggleTaskStatus(repo, req.params.id);
      res.json(task.toJSON());
    },
  };
}

export type TaskController = ReturnType<typeof makeTaskController>;
