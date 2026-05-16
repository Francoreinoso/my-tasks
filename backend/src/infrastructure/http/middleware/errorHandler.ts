import type { ErrorRequestHandler } from 'express';
import { TaskNotFoundError, TaskValidationError } from '@/domain/task/errors.js';
import {
  HabitNotFoundError,
  HabitValidationError,
  HabitArchivedError,
  HabitCompletionNotFoundError,
  HabitCompletionValidationError,
} from '@/domain/habit/errors.js';
import { NoteNotFoundError, NoteValidationError } from '@/domain/note/errors.js';
import {
  StudyTopicNotFoundError,
  StudyTopicValidationError,
  StudyItemNotFoundError,
  StudyLinkNotFoundError,
} from '@/domain/study/errors.js';
import { QueryValidationError } from '@/infrastructure/http/errors.js';

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

  if (err instanceof HabitNotFoundError) {
    res.status(404).json({
      error: { code: 'HABIT_NOT_FOUND', message: err.message },
    });
    return;
  }

  if (err instanceof HabitCompletionNotFoundError) {
    res.status(404).json({
      error: { code: 'HABIT_COMPLETION_NOT_FOUND', message: err.message },
    });
    return;
  }

  if (err instanceof HabitArchivedError) {
    res.status(409).json({
      error: { code: 'HABIT_ARCHIVED', message: err.message },
    });
    return;
  }

  if (err instanceof NoteNotFoundError) {
    res.status(404).json({
      error: { code: 'NOTE_NOT_FOUND', message: err.message },
    });
    return;
  }

  if (err instanceof StudyTopicNotFoundError) {
    res.status(404).json({
      error: { code: 'STUDY_TOPIC_NOT_FOUND', message: err.message },
    });
    return;
  }

  if (err instanceof StudyItemNotFoundError) {
    res.status(404).json({
      error: { code: 'STUDY_ITEM_NOT_FOUND', message: err.message },
    });
    return;
  }

  if (err instanceof StudyLinkNotFoundError) {
    res.status(404).json({
      error: { code: 'STUDY_LINK_NOT_FOUND', message: err.message },
    });
    return;
  }

  if (
    err instanceof HabitValidationError ||
    err instanceof HabitCompletionValidationError ||
    err instanceof NoteValidationError ||
    err instanceof StudyTopicValidationError ||
    err instanceof QueryValidationError
  ) {
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
