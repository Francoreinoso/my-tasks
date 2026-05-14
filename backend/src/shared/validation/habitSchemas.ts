import { z } from 'zod';

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe estar en formato YYYY-MM-DD');

const weekdaySchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);

const frequencySchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('daily') }),
  z.object({ kind: z.literal('weekdays') }),
  z.object({
    kind: z.literal('custom'),
    days: z.array(weekdaySchema).min(1, 'Custom requiere al menos un día'),
  }),
]);

export const createHabitSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(200, 'El nombre supera los 200 caracteres'),
  description: z.string().nullable().optional(),
  frequency: frequencySchema.optional(),
});

export const updateHabitSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().nullable().optional(),
    frequency: frequencySchema.optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'Debe enviar al menos un campo a actualizar',
  });

export const markCompletionSchema = z.object({
  date: isoDateSchema,
});

export type CreateHabitRequest = z.infer<typeof createHabitSchema>;
export type UpdateHabitRequest = z.infer<typeof updateHabitSchema>;
export type MarkCompletionRequest = z.infer<typeof markCompletionSchema>;
