import type { Request, Response } from 'express';
import type { CreateHabitInput } from '@/domain/habit/Habit.js';
import type { HabitRepository } from '@/domain/habit/HabitRepository.js';
import type { HabitCompletionRepository } from '@/domain/habit/HabitCompletionRepository.js';
import { createHabit } from '@/application/habit/createHabit.js';
import {
  listActiveHabits,
  listArchivedHabits,
} from '@/application/habit/listHabits.js';
import { getHabit } from '@/application/habit/getHabit.js';
import { updateHabit, type UpdateHabitInput } from '@/application/habit/updateHabit.js';
import { archiveHabit } from '@/application/habit/archiveHabit.js';
import { unarchiveHabit } from '@/application/habit/unarchiveHabit.js';
import { deleteHabit } from '@/application/habit/deleteHabit.js';
import { markHabitDay } from '@/application/habit/markHabitDay.js';
import { unmarkHabitDay } from '@/application/habit/unmarkHabitDay.js';
import { calculateStreak } from '@/application/habit/streak.js';
import { calculateCompletionRate } from '@/application/habit/completionRate.js';
import type {
  CreateHabitRequest,
  UpdateHabitRequest,
  MarkCompletionRequest,
} from '@/shared/validation/habitSchemas.js';
import { QueryValidationError } from '@/infrastructure/http/errors.js';

type IdParams = { id: string };

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function requireIsoDate(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || !ISO_DATE_REGEX.test(value)) {
    throw new QueryValidationError(
      `Parámetro "${fieldName}" debe ser una fecha YYYY-MM-DD`,
    );
  }
  return value;
}

export function makeHabitController(
  habitRepo: HabitRepository,
  completionsRepo: HabitCompletionRepository,
) {
  return {
    list: async (req: Request, res: Response): Promise<void> => {
      const archived = req.query['archived'] === 'true';
      const habits = archived
        ? await listArchivedHabits(habitRepo)
        : await listActiveHabits(habitRepo);
      res.json(habits.map((h) => h.toJSON()));
    },

    create: async (req: Request, res: Response): Promise<void> => {
      const body = req.body as CreateHabitRequest;
      const input: CreateHabitInput = { name: body.name };
      if (body.description !== undefined) input.description = body.description;
      if (body.frequency !== undefined) input.frequency = body.frequency;
      const habit = await createHabit(habitRepo, input);
      res.status(201).json(habit.toJSON());
    },

    get: async (req: Request<IdParams>, res: Response): Promise<void> => {
      const habit = await getHabit(habitRepo, req.params.id);
      res.json(habit.toJSON());
    },

    update: async (req: Request<IdParams>, res: Response): Promise<void> => {
      const body = req.body as UpdateHabitRequest;
      const input: UpdateHabitInput = {};
      if (body.name !== undefined) input.name = body.name;
      if (body.description !== undefined) input.description = body.description;
      if (body.frequency !== undefined) input.frequency = body.frequency;
      const habit = await updateHabit(habitRepo, req.params.id, input);
      res.json(habit.toJSON());
    },

    archive: async (req: Request<IdParams>, res: Response): Promise<void> => {
      const habit = await archiveHabit(habitRepo, req.params.id);
      res.json(habit.toJSON());
    },

    unarchive: async (req: Request<IdParams>, res: Response): Promise<void> => {
      const habit = await unarchiveHabit(habitRepo, req.params.id);
      res.json(habit.toJSON());
    },

    remove: async (req: Request<IdParams>, res: Response): Promise<void> => {
      await deleteHabit(habitRepo, completionsRepo, req.params.id);
      res.status(204).send();
    },

    listCompletions: async (
      req: Request<IdParams>,
      res: Response,
    ): Promise<void> => {
      const from = requireIsoDate(req.query['from'], 'from');
      const to = requireIsoDate(req.query['to'], 'to');
      const completions = await completionsRepo.findByHabitInRange(
        req.params.id,
        from,
        to,
      );
      res.json(completions.map((c) => c.toJSON()));
    },

    markCompletion: async (
      req: Request<IdParams>,
      res: Response,
    ): Promise<void> => {
      const body = req.body as MarkCompletionRequest;
      const completion = await markHabitDay(
        habitRepo,
        completionsRepo,
        req.params.id,
        body.date,
      );
      res.status(201).json(completion.toJSON());
    },

    unmarkCompletion: async (
      req: Request<IdParams>,
      res: Response,
    ): Promise<void> => {
      const date = requireIsoDate(req.query['date'], 'date');
      await unmarkHabitDay(habitRepo, completionsRepo, req.params.id, date);
      res.status(204).send();
    },

    stats: async (req: Request<IdParams>, res: Response): Promise<void> => {
      const from = requireIsoDate(req.query['from'], 'from');
      const to = requireIsoDate(req.query['to'], 'to');
      const asOf = requireIsoDate(req.query['asOf'], 'asOf');

      const habit = await getHabit(habitRepo, req.params.id);
      // La racha puede extenderse a marcas retroactivas, así que necesita
      // TODAS las completions del hábito, no solo las del rango pedido.
      const allCompletions = await completionsRepo.findByHabit(habit.id);
      const rangeCompletions = allCompletions.filter(
        (c) => c.date >= from && c.date <= to,
      );

      const streak = calculateStreak(habit, allCompletions, asOf);
      const rate = calculateCompletionRate(habit, rangeCompletions, from, to);

      res.json({
        habitId: habit.id,
        streak,
        rate,
        asOf,
        range: { from, to },
      });
    },
  };
}

export type HabitController = ReturnType<typeof makeHabitController>;
