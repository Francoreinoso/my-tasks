# my-tasks

Aplicación personal para gestionar tareas pendientes, planificación semanal, ideas de
estudio y notas. Pensada para uso local desde el escritorio (Windows + WSL).

> Estado actual: **MVP funcional**. Vista de "Tareas" implementada con CRUD completo,
> persistencia atómica a JSON. Las otras vistas (Semana, Estudio, Notas) llegan en
> próximas iteraciones.

## Stack

| Capa | Tecnologías |
|------|-------------|
| Frontend | Vite 8, React 19, TypeScript, Tailwind CSS v4, Zustand, React Router v7, Vitest, Testing Library |
| Backend | Node 20+, Express 5, TypeScript, Zod, Vitest, supertest |
| Persistencia | Archivo JSON con escritura atómica (después: SQLite/Postgres) |
| Tooling | ESLint, Prettier, EditorConfig |

## Estructura del repo

```
my-tasks/
├── backend/         API REST (Clean Architecture liviana)
│   ├── src/
│   │   ├── domain/         entidades + interfaces (sin frameworks)
│   │   ├── application/    casos de uso
│   │   ├── infrastructure/ HTTP + persistencia (Express, JSON)
│   │   └── shared/         schemas Zod, utilidades
│   └── data/        # tasks.json (gitignored, se crea en runtime)
├── frontend/        SPA (Atomic Design)
│   └── src/
│       ├── components/  atoms / molecules / organisms / templates
│       ├── pages/       containers de cada vista
│       ├── hooks/       useTasks, etc.
│       ├── store/       Zustand stores
│       ├── api/         cliente HTTP
│       ├── types/       tipos compartidos
│       └── styles/      tema oscuro/anime con CSS variables
├── scripts/
│   └── start-app.sh    arranca backend + frontend juntos
├── CLAUDE.md
└── README.md
```

## Requisitos

- Node.js >= 20
- npm >= 9
- WSL2 (Ubuntu) si estás en Windows

## Primera vez

```bash
cd backend  && npm install
cd ../frontend && npm install
```

## Arranque (todos los días)

**Opción 1 — script único (recomendado):**

```bash
./scripts/start-app.sh
# o que abra el browser automáticamente:
./scripts/start-app.sh --open
```

Esto arranca:
- Backend en `http://localhost:4000`
- Frontend en `http://localhost:5173`

`Ctrl+C` apaga ambos limpiamente.

**Opción 2 — terminales separadas (debug):**

```bash
# terminal 1
cd backend && npm run dev

# terminal 2
cd frontend && npm run dev
```

**Opción 3 — desde Windows con shortcut en el escritorio:**

Ver `scripts/windows/README.md` para el paso a paso. Resumen:
- `scripts/windows/my-tasks.bat` → launcher simple (ventana de cmd visible).
- `scripts/windows/my-tasks.ps1` → launcher polish (sin ventana, abre browser
  cuando los servers responden).

## Tests

```bash
# backend
cd backend && npm test
# frontend
cd frontend && npm test
```

## Convenciones

- TypeScript estricto (`strict: true`, `exactOptionalPropertyTypes: true`,
  `noUncheckedIndexedAccess: true`).
- `camelCase` para variables/funciones, `PascalCase` para componentes y tipos,
  `UPPER_SNAKE_CASE` para constantes globales.
- Tests cohabitan con el código: `Foo.ts` ↔ `Foo.test.ts`.
- Imports absolutos con alias `@/`.
- Commits convencionales (`feat:`, `fix:`, `refactor:`, `test:`, `chore:`).
- Idioma: español latinoamericano estándar.

## Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` (backend) | `4000` | Puerto del API |
| `FRONTEND_ORIGIN` (backend) | `http://localhost:5173` | Origen permitido por CORS |
| `VITE_API_URL` (frontend) | `http://localhost:4000/api` | Base URL del API |

## Plan de trabajo

Ver `~/.claude/plans/desarrollemos-el-proyecto-my-spicy-beacon.md` para el plan
completo (contexto, decisiones, fases, verificación).
