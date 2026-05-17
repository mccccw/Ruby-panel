#!/usr/bin/env bash
set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}"
echo " ===================================="
echo "  Ruby Panel - Auto Setup"
echo " ===================================="
echo -e "${NC}"

cd "$(dirname "$0")"

# ─── Check Node.js ───────────────────────────────────────
if ! command -v node &>/dev/null; then
    echo -e "${RED}[ERROR] Node.js nicht gefunden!${NC}"
    echo "Installiere Node.js: https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}[OK] Node.js $(node -v) gefunden${NC}"

# ─── Check / Start PostgreSQL ────────────────────────────
if command -v pg_isready &>/dev/null; then
    if pg_isready -h 127.0.0.1 -p 5432 -q 2>/dev/null; then
        echo -e "${GREEN}[OK] PostgreSQL laeuft auf 127.0.0.1:5432${NC}"
    else
        echo -e "${YELLOW}[INFO] PostgreSQL starten...${NC}"
        if command -v systemctl &>/dev/null; then
            sudo systemctl start postgresql 2>/dev/null || true
        elif command -v service &>/dev/null; then
            sudo service postgresql start 2>/dev/null || true
        fi
        sleep 2
        if pg_isready -h 127.0.0.1 -p 5432 -q 2>/dev/null; then
            echo -e "${GREEN}[OK] PostgreSQL gestartet${NC}"
        else
            echo -e "${YELLOW}[WARN] PostgreSQL nicht erreichbar - Panel startet trotzdem${NC}"
        fi
    fi
fi

# ─── .env Datei ──────────────────────────────────────────
if [ ! -f ".env" ]; then
    if [ -f ".env.local" ]; then
        echo 'DATABASE_URL="postgresql://ruby:ruby_secret@127.0.0.1:5432/rubypanel?connect_timeout=5&pool_timeout=5"' > .env
        echo 'DIRECT_URL="postgresql://ruby:ruby_secret@127.0.0.1:5432/rubypanel?connect_timeout=5&pool_timeout=5"' >> .env
        echo -e "${GREEN}[OK] .env Datei erstellt${NC}"
    elif [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo 'DATABASE_URL="postgresql://ruby:ruby_secret@127.0.0.1:5432/rubypanel?connect_timeout=5&pool_timeout=5"' > .env
        echo 'DIRECT_URL="postgresql://ruby:ruby_secret@127.0.0.1:5432/rubypanel?connect_timeout=5&pool_timeout=5"' >> .env
        echo -e "${GREEN}[OK] .env aus .env.example erstellt - bitte .env.local anpassen!${NC}"
    fi
else
    echo -e "${GREEN}[OK] .env Datei vorhanden${NC}"
fi

# ─── PostgreSQL User/DB anlegen (Linux/Mac) ──────────────
if command -v psql &>/dev/null && pg_isready -h 127.0.0.1 -p 5432 -q 2>/dev/null; then
    DB_EXISTS=$(PGPASSWORD=ruby_secret psql -U ruby -h 127.0.0.1 -d rubypanel -c "SELECT 1" 2>/dev/null && echo "yes" || echo "no")
    if [ "$DB_EXISTS" = "no" ]; then
        echo -e "${YELLOW}[INFO] Datenbank einrichten...${NC}"
        sudo -u postgres psql -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='ruby') THEN CREATE USER ruby WITH PASSWORD 'ruby_secret'; END IF; END \$\$;" 2>/dev/null || true
        sudo -u postgres createdb -O ruby rubypanel 2>/dev/null || true
        sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE rubypanel TO ruby;" 2>/dev/null || true
        echo -e "${GREEN}[OK] Datenbank eingerichtet${NC}"
    fi
fi

# ─── node_modules ────────────────────────────────────────
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[INFO] npm install laeuft...${NC}"
    npm install
    echo -e "${GREEN}[OK] Abhaengigkeiten installiert${NC}"
else
    echo -e "${GREEN}[OK] node_modules vorhanden${NC}"
fi

# ─── Prisma ──────────────────────────────────────────────
echo -e "${YELLOW}[INFO] Prisma Schema synchronisieren...${NC}"
npx prisma db push --skip-generate 2>/dev/null && echo -e "${GREEN}[OK] Datenbank Schema aktuell${NC}" || echo -e "${YELLOW}[WARN] Prisma db push fehlgeschlagen${NC}"

# ─── Seed (nur wenn kein User) ───────────────────────────
USER_COUNT=$(node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.user.count().then(n=>{console.log(n);p.\$disconnect()}).catch(()=>console.log(0))" 2>/dev/null || echo "0")
if [ "$USER_COUNT" = "0" ]; then
    echo -e "${YELLOW}[INFO] Admin-User anlegen...${NC}"
    npm run prisma:seed 2>/dev/null && echo -e "${GREEN}[OK] Admin-User erstellt${NC}" || true
else
    echo -e "${GREEN}[OK] Admin-User existiert${NC}"
fi

# ─── Start ───────────────────────────────────────────────
echo ""
echo -e "${CYAN} ====================================${NC}"
echo -e "${CYAN}  Panel startet: http://localhost:3000${NC}"
echo -e "${CYAN}  Login: cattech3d@gmail.com / @a240924${NC}"
echo -e "${CYAN} ====================================${NC}"
echo ""

npm run dev:all
