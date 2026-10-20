#!/usr/bin/env bash

# ==============================================================================
# SupplyRight AI — Instant Run & Port Conflict Resolver
# ==============================================================================
# Skrip ini:
# 1. Mendeteksi dan mematikan proses lama di port 3001 (Backend) & 5173 (Frontend).
# 2. Menjalankan Backend & Frontend secara bersih.
# 3. Menunggu kedua service responsif.
# 4. Membuka otomatis browser pada http://localhost:5173.
# 5. Membersihkan semua background process saat pengguna menekan Ctrl+C.
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT=3001
FRONTEND_PORT=5173
FRONTEND_URL="http://localhost:${FRONTEND_PORT}"

echo "=================================================================="
echo " SupplyRight AI — Autonomous On-Chain Protection Engine"
echo "=================================================================="

# Fungsi untuk mengecek dan mematikan proses pada port tertentu
kill_port() {
  local port=$1
  local pids
  pids=$(lsof -ti :"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "[WARN] Port $port sedang digunakan oleh PID: $pids"
    echo "       Mematikan proses lama agar tidak terjadi konflik..."
    kill -9 $pids 2>/dev/null || true
    sleep 1
    echo "[OK]   Port $port berhasil dibersihkan."
  else
    echo "[OK]   Port $port tersedia (bebas konflik)."
  fi
}

# Bersihkan port 3001 dan 5173
echo ""
echo "[CHECK] Memeriksa ketersediaan port..."
kill_port "$BACKEND_PORT"
kill_port "$FRONTEND_PORT"

# Handler untuk membersihkan proses saat script dihentikan (Ctrl+C)
cleanup() {
  echo ""
  echo "[STOP] Menghentikan SupplyRight AI services..."
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ -n "$FRONTEND_PID" ]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  kill_port "$BACKEND_PORT" >/dev/null 2>&1 || true
  kill_port "$FRONTEND_PORT" >/dev/null 2>&1 || true
  echo "[DONE] Semua service berhasil dimatikan. Selesai."
  exit 0
}

trap cleanup SIGINT SIGTERM

echo ""
echo "[START] Menjalankan Backend Service (Port $BACKEND_PORT)..."
cd "$DIR/backend"
npm run dev > /tmp/supplyright-backend.log 2>&1 &
BACKEND_PID=$!

echo "[WAIT]  Menunggu Backend siap di http://localhost:$BACKEND_PORT..."
for i in {1..30}; do
  if curl -s "http://localhost:$BACKEND_PORT/api/health" >/dev/null 2>&1; then
    echo "[OK]    Backend aktif & sehat! (PID: $BACKEND_PID)"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "[ERROR] Timeout menunggu Backend. Cek log di: /tmp/supplyright-backend.log"
    cat /tmp/supplyright-backend.log
    exit 1
  fi
  sleep 0.5
done

echo ""
echo "[START] Menjalankan Frontend Next.js (Port $FRONTEND_PORT)..."
cd "$DIR/frontend"
npm run dev > /tmp/supplyright-frontend.log 2>&1 &
FRONTEND_PID=$!

echo "[WAIT]  Menunggu Frontend siap di $FRONTEND_URL..."
for i in {1..30}; do
  if curl -s "$FRONTEND_URL" >/dev/null 2>&1; then
    echo "[OK]    Frontend aktif! (PID: $FRONTEND_PID)"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "[ERROR] Timeout menunggu Frontend. Cek log di: /tmp/supplyright-frontend.log"
    cat /tmp/supplyright-frontend.log
    exit 1
  fi
  sleep 0.5
done

echo ""
echo "=================================================================="
echo " SupplyRight AI Berhasil Dijalankan"
echo "=================================================================="
echo " - Dashboard URL : $FRONTEND_URL"
echo " - Backend API   : http://localhost:$BACKEND_PORT/api/health"
echo " - SSE Stream    : http://localhost:$BACKEND_PORT/api/events/stream"
echo " - Backend Log   : /tmp/supplyright-backend.log"
echo " - Frontend Log  : /tmp/supplyright-frontend.log"
echo "=================================================================="
echo " Tekan [Ctrl + C] kapan saja di terminal ini untuk mematikan semua service."
echo "=================================================================="
echo ""

# Buka browser secara otomatis sesuai OS
if command -v open >/dev/null 2>&1; then
  # macOS
  echo "[OPEN] Membuka browser: $FRONTEND_URL ..."
  open "$FRONTEND_URL"
elif command -v xdg-open >/dev/null 2>&1; then
  # Linux
  echo "[OPEN] Membuka browser: $FRONTEND_URL ..."
  xdg-open "$FRONTEND_URL"
elif command -v start >/dev/null 2>&1; then
  # Windows git-bash
  start "$FRONTEND_URL"
fi

# Tahan proses utama agar tetap berjalan dan menangkap Ctrl+C
wait
