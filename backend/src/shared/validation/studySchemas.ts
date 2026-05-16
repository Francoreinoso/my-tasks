import { z } from 'zod';

export const createTopicSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido')
    .max(200, 'El título supera los 200 caracteres'),
});

export const updateTopicTitleSchema = z.object({
  title: z.string().min(1).max(200),
});

export const addItemSchema = z.object({
  label: z.string().min(1).max(200),
});

export const updateItemSchema = z.object({
  label: z.string().min(1).max(200),
});

export const addLinkSchema = z.object({
  label: z.string().min(1).max(100),
  url: z.string().min(1),
});

export const updateLinkSchema = z
  .object({
    label: z.string().min(1).max(100).optional(),
    url: z.string().min(1).optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'Debe enviar al menos un campo a actualizar',
  });

export type CreateTopicRequest = z.infer<typeof createTopicSchema>;
export type UpdateTopicTitleRequest = z.infer<typeof updateTopicTitleSchema>;
export type AddItemRequest = z.infer<typeof addItemSchema>;
export type UpdateItemRequest = z.infer<typeof updateItemSchema>;
export type AddLinkRequest = z.infer<typeof addLinkSchema>;
export type UpdateLinkRequest = z.infer<typeof updateLinkSchema>;
