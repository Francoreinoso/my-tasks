import { z } from 'zod';

const MAX_TITLE = 200;
const MAX_CONTENT = 10000;

export const createNoteSchema = z
  .object({
    title: z.string().max(MAX_TITLE).nullable().optional(),
    content: z.string().max(MAX_CONTENT).nullable().optional(),
  })
  .refine(
    (obj) =>
      (obj.title !== undefined && obj.title !== null && obj.title.trim().length > 0) ||
      (obj.content !== undefined && obj.content !== null && obj.content.trim().length > 0),
    { message: 'La nota debe tener al menos un título o un contenido' },
  );

export const updateNoteSchema = z
  .object({
    title: z.string().max(MAX_TITLE).nullable().optional(),
    content: z.string().max(MAX_CONTENT).nullable().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'Debe enviar al menos un campo a actualizar',
  });

export type CreateNoteRequest = z.infer<typeof createNoteSchema>;
export type UpdateNoteRequest = z.infer<typeof updateNoteSchema>;
