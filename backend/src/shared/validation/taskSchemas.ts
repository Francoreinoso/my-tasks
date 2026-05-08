import { z } from 'zod';

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'dueDate debe estar en formato YYYY-MM-DD');

export const createTaskSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200, 'El título supera los 200 caracteres'),
  description: z.string().nullable().optional(),
  dueDate: isoDateSchema.nullable().optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().nullable().optional(),
    dueDate: isoDateSchema.nullable().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'Debe enviar al menos un campo a actualizar',
  });

export type CreateTaskRequest = z.infer<typeof createTaskSchema>;
export type UpdateTaskRequest = z.infer<typeof updateTaskSchema>;
