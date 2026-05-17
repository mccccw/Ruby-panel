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

# ─── Docker installieren & starten ───────────────────────
install_docker_linux() {
    echo -e "${YELLOW}[INFO] Docker wird installiert...${NC}"
    if command -v apt-get &>/dev/null; then
        curl -fsSL https://get.docker.com | sudo sh
    elif command -v yum &>/dev/null; then
        sudo yum install -y docker
    elif command -v pacman &>/dev/null; then
        sudo pacman -Sy --noconfirm docker
    else
        curl -fsSL https://get.docker.com | sudo sh
    fi
    sudo systemctl enable docker 2>/dev/null || true
    sudo systemctl start docker 2>/dev/null || true
    sudo usermod -aG docker "$USER" 2>/dev/null || true
    echo -e "${GREEN}[OK] Docker installiert${NC}"
}

start_docker_linux() {
    if command -v systemctl &>/dev/null; then
        sudo systemctl start docker 2>/dev/null || true
    elif command -v service &>/dev/null; then
        sudo service docker start 2>/dev/null || true
    fi
}

# macOS Docker Desktop starten
start_docker_mac() {
    if [ -d "/Applications/Docker.app" ]; then
        echo -e "${YELLOW}[INFO] Docker Desktop wird gestartet...${NC}"
        open -a Docker
        echo -e "${YELLOW}[INFO] Warte auf Docker...${NC}"
        for i in $(seq 1 30); do
            if docker info &>/dev/null 2>&1; then
                echo -e "${GREEN}[OK] Docker laeuft${NC}"
                return 0
            fi
            sleep 2
        done
        echo -e "${YELLOW}[WARN] Docker startet noch - bitte kurz warten und neu versuchen${NC}"
    else
        echo -e "${YELLOW}[INFO] Docker Desktop wird heruntergeladen (macOS)...${NC}"
        if [[ "$(uname -m)" == "arm64" ]]; then
            curl -Lo /tmp/Docker.dmg "https://desktop.docker.com/mac/main/arm64/Docker.dmg"
        else
            curl -Lo /tmp/Docker.dmg "https://desktop.docker.com/mac/main/amd64/Docker.dmg"
        fi
        hdiutil attach /tmp/Docker.dmg -quiet
        sudo cp -R "/Volumes/Docker/Docker.app" /Applications/
        hdiutil detach "/Volumes/Docker" -quiet
        rm /tmp/Docker.dmg
        open -a Docker
        echo -e "${YELLOW}[INFO] Warte auf Docker...${NC}"
        for i in $(seq 1 40); do
            if docker info &>/dev/null 2>&1; then
                echo -e "${GREEN}[OK] Docker installiert und laeuft${NC}"
                return 0
            fi
            sleep 3
        done
        echo -e "${YELLOW}[WARN] Docker startet noch - bitte warten und dann nochmal starten${NC}"
    fi
}

OS="$(uname -s)"
if ! command -v docker &>/dev/null; then
    echo -e "${YELLOW}[INFO] Docker nicht gefunden - wird installiert...${NC}"
    if [ "$OS" = "Darwin" ]; then
        start_docker_mac
    else
        install_docker_linux
    fi
else
    echo -e "${GREEN}[OK] Docker gefunden${NC}"
    if ! docker info &>/dev/null 2>&1; then
        echo -e "${YELLOW}[INFO] Docker laeuft nicht - wird gestartet...${NC}"
        if [ "$OS" = "Darwin" ]; then
            start_docker_mac
        else
            start_docker_linux
            sleep 3
            if docker info &>/dev/null 2>&1; then
                echo -e "${GREEN}[OK] Docker gestartet${NC}"
            else
                echo -e "${YELLOW}[WARN] Docker konnte nicht gestartet werden - bitte manuell starten${NC}"
            fi
        fi
    else
        echo -e "${GREEN}[OK] Docker laeuft${NC}"
    fi
fi

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
        elif [ "$OS" = "Darwin" ]; then
            brew services start postgresql 2>/dev/null || true
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
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        # Set sensible defaults for local development
        sed -i 's|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET="'"$(openssl rand -base64 32 2>/dev/null || echo 'dev-secret-change-me-in-production')"'"|' .env.local
        sed -i 's|JWT_SECRET=.*|JWT_SECRET="'"$(openssl rand -base64 32 2>/dev/null || echo 'dev-jwt-secret-change-me')"'"|' .env.local
        sed -i 's|ENCRYPTION_KEY=.*|ENCRYPTION_KEY="'"$(openssl rand -hex 16 2>/dev/null || echo 'dev-encryption-key-change!')"'"|' .env.local
        sed -i 's|OLLAMA_CLOUD_API_KEY=.*|OLLAMA_CLOUD_API_KEY="replace-with-your-ollama-cloud-api-key"|' .env.local
        echo -e "${GREEN}[OK] .env.local aus .env.example erstellt - bitte anpassen!${NC}"
    fi
fi
if [ ! -f ".env" ]; then
    echo 'DATABASE_URL="postgresql://ruby:ruby_secret@127.0.0.1:5432/rubypanel?connect_timeout=5&pool_timeout=5"' > .env
    echo 'DIRECT_URL="postgresql://ruby:ruby_secret@127.0.0.1:5432/rubypanel?connect_timeout=5&pool_timeout=5"' >> .env
    echo -e "${GREEN}[OK] .env Datei erstellt${NC}"
else
    echo -e "${GREEN}[OK] .env Datei vorhanden${NC}"
fi

# ─── PostgreSQL User/DB anlegen ──────────────────────────
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
echo -e "${YELLOW}[INFO] Prisma Client generieren...${NC}"
npx prisma generate 2>/dev/null && echo -e "${GREEN}[OK] Prisma Client generiert${NC}" || echo -e "${YELLOW}[WARN] Prisma generate fehlgeschlagen${NC}"

echo -e "${YELLOW}[INFO] Prisma Schema synchronisieren...${NC}"
npx prisma db push 2>/dev/null && echo -e "${GREEN}[OK] Datenbank Schema aktuell${NC}" || echo -e "${YELLOW}[WARN] Prisma db push fehlgeschlagen${NC}"

# ─── Seed ────────────────────────────────────────────────
USER_COUNT=$(node --input-type=module -e "import {PrismaClient} from '@prisma/client';const p=new PrismaClient();p.user.count().then(n=>{console.log(n);p.\$disconnect()}).catch(()=>{console.log('0');p.\$disconnect()})" 2>/dev/null || echo "0")
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
