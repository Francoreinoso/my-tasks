import type { Request, Response } from 'express';
import type { CreateNoteInput } from '@/domain/note/Note.js';
import type { NoteRepository } from '@/domain/note/NoteRepository.js';
import { createNote } from '@/application/note/createNote.js';
import { listNotes } from '@/application/note/listNotes.js';
import { getNote } from '@/application/note/getNote.js';
import { updateNote, type UpdateNoteInput } from '@/application/note/updateNote.js';
import { deleteNote } from '@/application/note/deleteNote.js';
import type {
  CreateNoteRequest,
  UpdateNoteRequest,
} from '@/shared/validation/noteSchemas.js';

type IdParams = { id: string };

export function makeNoteController(noteRepo: NoteRepository) {
  return {
    list: async (_req: Request, res: Response): Promise<void> => {
      const notes = await listNotes(noteRepo);
      res.json(notes.map((n) => n.toJSON()));
    },

    create: async (req: Request, res: Response): Promise<void> => {
      const body = req.body as CreateNoteRequest;
      const input: CreateNoteInput = {};
      if (body.title !== undefined) input.title = body.title;
      if (body.content !== undefined) input.content = body.content;
      const note = await createNote(noteRepo, input);
      res.status(201).json(note.toJSON());
    },

    get: async (req: Request<IdParams>, res: Response): Promise<void> => {
      const note = await getNote(noteRepo, req.params.id);
      res.json(note.toJSON());
    },

    update: async (req: Request<IdParams>, res: Response): Promise<void> => {
      const body = req.body as UpdateNoteRequest;
      const input: UpdateNoteInput = {};
      if (body.title !== undefined) input.title = body.title;
      if (body.content !== undefined) input.content = body.content;
      const note = await updateNote(noteRepo, req.params.id, input);
      res.json(note.toJSON());
    },

    remove: async (req: Request<IdParams>, res: Response): Promise<void> => {
      await deleteNote(noteRepo, req.params.id);
      res.status(204).send();
    },
  };
}

export type NoteController = ReturnType<typeof makeNoteController>;
