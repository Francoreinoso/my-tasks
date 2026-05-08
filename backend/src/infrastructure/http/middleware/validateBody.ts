import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ZodType } from 'zod';

/**
 * Middleware genérico de validación de body usando un schema de Zod.
 * Si el schema valida → reemplaza req.body por el dato parseado y sigue.
 * Si no valida → responde 400 con los issues de Zod.
 */
export function validateBody<T>(schema: ZodType<T>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: {
          message: 'Body inválido',
          issues: result.error.issues,
        },
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
