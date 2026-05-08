#!/usr/bin/env bash
# Arranca backend (:4000) y frontend (:5173) en paralelo.
# Ctrl+C apaga ambos limpiamente.
#
# Uso:
#   ./scripts/start-app.sh
#   ./scripts/start-app.sh --open    # también abre el browser

set -euo pipefail

# Resolvemos la raíz del proyecto a partir de la ubicación del script,
# así el script funciona aunque lo invoques desde cualquier carpeta.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

OPEN_BROWSER=false
for arg in "$@"; do
  case "$arg" in
    --open) OPEN_BROWSER=true ;;
    *) echo "Argumento desconocido: $arg"; exit 2 ;;
  esac
done

# ---- Validaciones de entorno ---------------------------------------------
if [ ! -d "$ROOT_DIR/backend/node_modules" ]; then
  echo "✖ Falta instalar deps del backend. Corré:"
  echo "    cd $ROOT_DIR/backend && pnpm install"
  exit 1
fi
if [ ! -d "$ROOT_DIR/frontend/node_modules" ]; then
  echo "✖ Falta instalar deps del frontend. Corré:"
  echo "    cd $ROOT_DIR/frontend && pnpm install"
  exit 1
fi

# ---- Cleanup al recibir Ctrl+C / EXIT ------------------------------------
# Mata TODO el árbol de procesos descendientes. No alcanza con matar los
# hijos directos: tsx y vite son nietos (pnpm dev → sh → tsx) y quedan
# huérfanos si solo apagás al subshell.
kill_tree() {
  local parent=$1
  local child
  for child in $(pgrep -P "$parent" 2>/dev/null); do
    kill_tree "$child"
  done
  kill -TERM "$parent" 2>/dev/null || true
}

cleanup() {
  echo ""
  echo "→ Apagando servers..."
  # Evita re-entrar a cleanup si SIGTERM nos llega mientras limpiamos
  trap '' EXIT INT TERM

  # Apagar el árbol de cada subshell que arrancamos
  local pid
  for pid in $(jobs -p); do
    kill_tree "$pid"
  done

  # Dar un instante para shutdown ordenado
  sleep 0.5

  # Hammer SIGKILL a cualquier descendiente que sobreviva
  for pid in $(pgrep -P $$ 2>/dev/null); do
    kill -KILL "$pid" 2>/dev/null || true
  done

  wait 2>/dev/null || true
  echo "✓ Listo."
}
trap cleanup EXIT INT TERM

# ---- Arranque -------------------------------------------------------------
echo "============================================================"
echo "  my-tasks  →  arrancando servers"
echo "============================================================"
echo "  backend  → http://localhost:4000"
echo "  frontend → http://localhost:5173"
echo "  Ctrl+C   para apagar ambos"
echo "============================================================"

(cd "$ROOT_DIR/backend" && pnpm dev) &
BACKEND_PID=$!

(cd "$ROOT_DIR/frontend" && pnpm dev) &
FRONTEND_PID=$!

# ---- Health check + abrir browser opcional -------------------------------
if [ "$OPEN_BROWSER" = true ]; then
  (
    # Esperamos a que ambos respondan antes de abrir
    until curl -s http://localhost:4000/health > /dev/null 2>&1 \
       && curl -s http://localhost:5173        > /dev/null 2>&1; do
      sleep 0.3
    done
    # En WSL, abrimos el navegador del HOST Windows
    if command -v wslview > /dev/null 2>&1; then
      wslview http://localhost:5173
    elif command -v explorer.exe > /dev/null 2>&1; then
      explorer.exe http://localhost:5173 || true
    elif command -v xdg-open > /dev/null 2>&1; then
      xdg-open http://localhost:5173
    fi
  ) &
fi

# Esperamos a que termine cualquier proceso. Si uno muere, el trap mata al otro.
wait -n "$BACKEND_PID" "$FRONTEND_PID"
