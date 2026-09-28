#!/bin/bash
set -e

# ==========================================================
# CSWeb Automated Backend Deployment Script
# ==========================================================

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}   🚀 Starting CSWeb Backend Deployment...          ${NC}"
echo -e "${BLUE}====================================================${NC}"

# 1. Resolve project directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -d "$SCRIPT_DIR/backend" ]; then
    ROOT_DIR="$SCRIPT_DIR"
elif [ -f "$SCRIPT_DIR/Dockerfile" ]; then
    ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
else
    ROOT_DIR="$HOME/CSWeb"
fi

BACKEND_DIR="$ROOT_DIR/backend"
echo -e "${BLUE}📁 Project Root:${NC} $ROOT_DIR"
echo -e "${BLUE}📁 Backend Dir:${NC} $BACKEND_DIR"

# 2. Pull latest changes from Git
echo -e "\n${YELLOW}📥 [1/5] Pulling latest code from Git (main branch)...${NC}"
cd "$ROOT_DIR"
git pull origin main

# 3. Build backend Docker image
echo -e "\n${YELLOW}🔨 [2/5] Building Docker image 'csweb-backend'...${NC}"
cd "$BACKEND_DIR"

# Ensure upload directories exist on host so volumes mount cleanly
mkdir -p "$BACKEND_DIR/uploads"
mkdir -p "$BACKEND_DIR/public/uploads"

if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${RED}⚠️  Warning: $BACKEND_DIR/.env not found! Make sure .env exists.${NC}"
fi

docker build -t csweb-backend .

# 4. Stop and remove existing container if running
echo -e "\n${YELLOW}🛑 [3/5] Stopping and removing previous container...${NC}"
docker rm -f csweb_backend 2>/dev/null || true

# 5. Run new container
echo -e "\n${YELLOW}▶️  [4/5] Starting new 'csweb_backend' container...${NC}"
docker run -d --name csweb_backend \
  --restart always \
  -p 5000:5000 \
  --env-file .env \
  -v "$BACKEND_DIR/uploads:/app/uploads" \
  -v "$BACKEND_DIR/public/uploads:/app/public/uploads" \
  csweb-backend

# 6. Clean up dangling images to save disk space
echo -e "\n${YELLOW}🧹 [5/5] Cleaning up unused/dangling Docker images...${NC}"
docker image prune -f

# 7. Check container status
echo -e "\n${GREEN}====================================================${NC}"
echo -e "${GREEN}   ✨ Deployment Completed Successfully!           ${NC}"
echo -e "${GREEN}====================================================${NC}"
docker ps --filter "name=csweb_backend" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo -e "${BLUE}💡 Tip: View live logs anytime with: ${YELLOW}docker logs -f csweb_backend${NC}"
