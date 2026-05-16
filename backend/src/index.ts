import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JsonTaskRepository } from '@/infrastructure/persistence/JsonTaskRepository.js';
import { JsonHabitRepository } from '@/infrastructure/persistence/JsonHabitRepository.js';
import { JsonHabitCompletionRepository } from '@/infrastructure/persistence/JsonHabitCompletionRepository.js';
import { JsonNoteRepository } from '@/infrastructure/persistence/JsonNoteRepository.js';
import { createApp } from '@/infrastructure/http/server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env['PORT'] ?? 4000);
const DATA_DIR = path.resolve(__dirname, '../data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const HABITS_FILE = path.join(DATA_DIR, 'habits.json');
const HABIT_COMPLETIONS_FILE = path.join(DATA_DIR, 'habit-completions.json');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');
const FRONTEND_ORIGIN = process.env['FRONTEND_ORIGIN'] ?? 'http://localhost:5173';

async function main(): Promise<void> {
  const taskRepository = await JsonTaskRepository.load(TASKS_FILE);
  const habitRepository = await JsonHabitRepository.load(HABITS_FILE);
  const habitCompletionRepository = await JsonHabitCompletionRepository.load(
    HABIT_COMPLETIONS_FILE,
  );
  const noteRepository = await JsonNoteRepository.load(NOTES_FILE);
  const app = createApp({
    taskRepository,
    habitRepository,
    habitCompletionRepository,
    noteRepository,
    corsOrigin: FRONTEND_ORIGIN,
  });

  app.listen(PORT, () => {
    console.log(`my-tasks backend escuchando en http://localhost:${String(PORT)}`);
    console.log(`Datos en: ${DATA_DIR}`);
    console.log(`CORS permitido para: ${FRONTEND_ORIGIN}`);
  });
}

main().catch((err: unknown) => {
  console.error('Error fatal al arrancar:', err);
  process.exit(1);
});
