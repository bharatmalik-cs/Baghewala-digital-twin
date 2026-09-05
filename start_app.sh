#!/bin/bash

# Baghewala Field Digital Twin Launcher
echo "======================================================================"
echo "   LAUNCHING BAGHEWALA FIELD DIGITAL TWIN (CSS & SRP OPTIMIZATION)   "
echo "======================================================================"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
API_PORT="${APP_API_PORT:-8000}"
WEB_PORT="${APP_WEB_PORT:-3000}"

# Start Python FastAPI Backend
echo "[1/2] Starting Python FastAPI Backend Server on http://localhost:${API_PORT}..."
cd "$DIR/backend"
./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port "$API_PORT" &
BACKEND_PID=$!

sleep 2

# Start Vite React Frontend
echo "[2/2] Starting Vite React Frontend Dev Server on http://localhost:${WEB_PORT}..."
cd "$DIR/frontend"
VITE_API_BASE="http://localhost:${API_PORT}" npm run dev -- --port "$WEB_PORT" --host &
FRONTEND_PID=$!

echo "======================================================================"
echo "   DIGITAL TWIN IS LIVE!"
echo "   - Frontend UI: http://localhost:${WEB_PORT}"
echo "   - Backend API: http://localhost:${API_PORT}"
echo "   Press [CTRL+C] to stop all servers."
echo "======================================================================"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
