export interface Note {
  id: string;
  title: string | null;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  title?: string | null;
  content?: string | null;
}

export interface UpdateNoteInput {
  title?: string | null;
  content?: string | null;
}
