import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JsonTaskRepository } from '@/infrastructure/persistence/JsonTaskRepository.js';
import { createApp } from '@/infrastructure/http/server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env['PORT'] ?? 4000);
const DATA_FILE = path.resolve(__dirname, '../data/tasks.json');
const FRONTEND_ORIGIN = process.env['FRONTEND_ORIGIN'] ?? 'http://localhost:5173';

async function main(): Promise<void> {
  const taskRepository = await JsonTaskRepository.load(DATA_FILE);
  const app = createApp({ taskRepository, corsOrigin: FRONTEND_ORIGIN });

  app.listen(PORT, () => {
    console.log(`my-tasks backend escuchando en http://localhost:${String(PORT)}`);
    console.log(`Datos en: ${DATA_FILE}`);
    console.log(`CORS permitido para: ${FRONTEND_ORIGIN}`);
  });
}

main().catch((err: unknown) => {
  console.error('Error fatal al arrancar:', err);
  process.exit(1);
});
