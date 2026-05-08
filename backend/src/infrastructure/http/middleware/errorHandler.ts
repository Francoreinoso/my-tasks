import type { ErrorRequestHandler } from 'express';
import { TaskNotFoundError, TaskValidationError } from '@/domain/task/errors.js';

/**
 * Convierte errores conocidos del dominio en respuestas HTTP apropiadas.
 * Cualquier error desconocido → 500 con mensaje genérico (no expone internals).
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof TaskNotFoundError) {
    res.status(404).json({
      error: { code: 'TASK_NOT_FOUND', message: err.message },
    });
    return;
  }

  if (err instanceof TaskValidationError) {
    res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: err.message },
    });
    return;
  }

  console.error('[errorHandler] error inesperado:', err);
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Algo salió mal en el servidor' },
  });
};
