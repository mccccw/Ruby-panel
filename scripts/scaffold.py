from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def write(path: str, content: str) -> None:
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content.strip() + "\n", encoding="utf-8")


write(
    "package.json",
    r'''
{
  "name": "ruby-panel",
  "version": "0.1.0",
  "private": true,
  "description": "Ruby Panel - Control Beyond Limits. A SaaS-ready Minecraft and web hosting control panel.",
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "dev:socket": "tsx watch src/server/socket.ts",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:socket\"",
    "build": "prisma generate && next build",
    "start": "next start",
    "start:socket": "node dist/server/socket.js",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy",
    "prisma:seed": "tsx prisma/seed.ts"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@auth/prisma-adapter": "2.11.2",
    "@hookform/resolvers": "5.2.2",
    "@monaco-editor/react": "4.7.0",
    "@prisma/client": "6.19.3",
    "@radix-ui/react-dialog": "1.1.15",
    "@radix-ui/react-dropdown-menu": "2.1.16",
    "@radix-ui/react-label": "2.1.8",
    "@radix-ui/react-progress": "1.1.8",
    "@radix-ui/react-select": "2.2.6",
    "@radix-ui/react-separator": "1.1.8",
    "@radix-ui/react-slot": "1.2.4",
    "@radix-ui/react-switch": "1.2.6",
    "@radix-ui/react-tabs": "1.1.13",
    "@radix-ui/react-toast": "1.2.15",
    "@radix-ui/react-tooltip": "1.2.8",
    "@tailwindcss/postcss": "4.3.0",
    "@tanstack/react-query": "5.100.10",
    "@xterm/addon-fit": "0.11.0",
    "@xterm/addon-web-links": "0.12.0",
    "@xterm/xterm": "6.0.0",
    "acme-client": "5.4.0",
    "axios": "1.16.1",
    "bcryptjs": "3.0.3",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "date-fns": "4.1.0",
    "diff2html": "3.4.56",
    "dockerode": "5.0.0",
    "framer-motion": "12.38.0",
    "ioredis": "5.10.1",
    "jszip": "3.10.1",
    "lucide-react": "1.16.0",
    "next": "15.5.18",
    "next-auth": "5.0.0-beta.31",
    "node-cron": "4.2.1",
    "nodemailer": "7.0.13",
    "otplib": "13.4.0",
    "qrcode": "1.5.4",
    "react": "19.2.6",
    "react-dom": "19.2.6",
    "react-hook-form": "7.76.0",
    "recharts": "3.8.1",
    "sharp": "0.34.5",
    "socket.io": "4.8.3",
    "socket.io-client": "4.8.3",
    "sonner": "2.0.7",
    "tailwind-merge": "3.4.0",
    "tailwindcss": "4.3.0",
    "zod": "4.4.3",
    "zustand": "5.0.13"
  },
  "devDependencies": {
    "@types/bcryptjs": "3.0.0",
    "@types/dockerode": "4.0.1",
    "@types/node": "25.8.0",
    "@types/node-cron": "3.0.11",
    "@types/nodemailer": "8.0.0",
    "@types/qrcode": "1.5.6",
    "@types/react": "19.2.14",
    "@types/react-dom": "19.2.3",
    "@typescript-eslint/eslint-plugin": "8.59.3",
    "@typescript-eslint/parser": "8.59.3",
    "concurrently": "9.2.1",
    "eslint": "9.39.4",
    "eslint-config-next": "15.5.18",
    "prisma": "6.19.3",
    "tsx": "4.22.1",
    "typescript": "5.9.3"
  }
}
''',
)

write(
    "tsconfig.json",
    r'''
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
''',
)

write(
    "next.config.ts",
    r'''
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' ws: wss: http://localhost:3001 https://ollama.com https://api.modrinth.com https://api.curseforge.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join("; ")
  }
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb"
    }
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.modrinth.com" },
      { protocol: "https", hostname: "media.forgecdn.net" }
    ]
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    return [
      {
        source: "/socket.io/:path*",
        destination: `${process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001"}/socket.io/:path*`
      }
    ];
  }
};

export default nextConfig;
''',
)

write(
    "tailwind.config.ts",
    r'''
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ruby: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          900: "#881337"
        },
        surface: {
          0: "#080809",
          1: "#0d0d0f",
          2: "#111114",
          3: "#18181c",
          4: "#1e1e23",
          5: "#26262e"
        }
      },
      fontFamily: {
        sans: ["var(--font-geist)", "Geist", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "ui-monospace", "monospace"]
      },
      boxShadow: {
        ruby: "0 0 36px rgba(225,29,72,0.35)",
        glass: "0 0 0 1px rgba(225,29,72,0.05), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
      },
      keyframes: {
        "ruby-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(225,29,72,0.36)" },
          "50%": { boxShadow: "0 0 0 8px rgba(225,29,72,0)" }
        },
        "float-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "ruby-pulse": "ruby-pulse 1.8s ease-in-out infinite",
        "float-up": "float-up 0.35s ease-out both"
      }
    }
  },
  plugins: []
};

export default config;
''',
)

write(
    "postcss.config.mjs",
    r'''
const config = {
  plugins: {
    "@tailwindcss/postcss": {}
  }
};

export default config;
''',
)

write(
    "eslint.config.mjs",
    r'''
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }]
    }
  }
];

export default config;
''',
)

write(
    "docker-compose.yml",
    r'''
services:
  postgres:
    image: postgres:16-alpine
    container_name: ruby-panel-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ruby
      POSTGRES_PASSWORD: ruby_secret
      POSTGRES_DB: rubypanel
    ports:
      - "5432:5432"
    volumes:
      - ruby-postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ruby -d rubypanel"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: ruby-panel-redis
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes"]
    ports:
      - "6379:6379"
    volumes:
      - ruby-redis:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  panel:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ruby-panel
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://ruby:ruby_secret@postgres:5432/rubypanel
      DIRECT_URL: postgresql://ruby:ruby_secret@postgres:5432/rubypanel
      REDIS_URL: redis://redis:6379
      NEXTAUTH_URL: http://localhost:3000
      NEXTAUTH_SECRET: change-me-with-openssl-rand-base64-32
      JWT_SECRET: change-me-with-a-second-random-secret
      SERVER_DATA_ROOT: /opt/ruby-panel/servers
      WEBSITE_DATA_ROOT: /opt/ruby-panel/websites
      NEXT_PUBLIC_SOCKET_URL: http://localhost:3001
    ports:
      - "3000:3000"
      - "3001:3001"
      - "25565-25665:25565-25665"
      - "8100-8200:8100-8200"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ruby-server-data:/opt/ruby-panel/servers
      - ruby-website-data:/opt/ruby-panel/websites
    command: sh -c "npx prisma migrate deploy && npm run start & npm run dev:socket"

volumes:
  ruby-postgres:
  ruby-redis:
  ruby-server-data:
  ruby-website-data:
''',
)

write(
    "Dockerfile",
    r'''
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install

FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
RUN mkdir -p /opt/ruby-panel/servers /opt/ruby-panel/websites && chown -R nextjs:nodejs /opt/ruby-panel
USER nextjs
EXPOSE 3000 3001
CMD ["node", "server.js"]
''',
)

write(
    ".env.example",
    r'''
# Database
DATABASE_URL="postgresql://ruby:ruby_secret@localhost:5432/rubypanel"
DIRECT_URL="postgresql://ruby:ruby_secret@localhost:5432/rubypanel"

# Redis
REDIS_URL="redis://localhost:6379"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
JWT_SECRET="another-random-32-char-secret"

# AI (Ollama Cloud)
OLLAMA_CLOUD_BASE_URL="https://ollama.com/api/chat"
OLLAMA_CLOUD_API_KEY="replace-with-your-ollama-cloud-api-key"
OLLAMA_CLOUD_MODEL="deepseek-v4-pro:cloud"

# Docker
DOCKER_SOCKET="/var/run/docker.sock"
SERVER_DATA_ROOT="/opt/ruby-panel/servers"
WEBSITE_DATA_ROOT="/opt/ruby-panel/websites"

# Ports
MC_PORT_RANGE_START=25565
MC_PORT_RANGE_END=25665
WEB_PORT_RANGE_START=8100
WEB_PORT_RANGE_END=8200

# Plugin APIs
CURSEFORGE_API_KEY="your-curseforge-api-key"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Ruby Panel <noreply@yourpanel.com>"

# Encryption
ENCRYPTION_KEY="32-char-key-for-aes-256-encryption"

# Public app
NEXT_PUBLIC_APP_NAME="Ruby Panel"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
''',
)

write(
    ".env.local",
    r'''
DATABASE_URL="postgresql://ruby:ruby_secret@localhost:5432/rubypanel"
DIRECT_URL="postgresql://ruby:ruby_secret@localhost:5432/rubypanel"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="local-development-secret-change-before-deploying"
JWT_SECRET="local-development-jwt-secret-change-before-deploying"
OLLAMA_CLOUD_BASE_URL="https://ollama.com/api/chat"
OLLAMA_CLOUD_API_KEY=""
OLLAMA_CLOUD_MODEL="deepseek-v4-pro:cloud"
DOCKER_SOCKET="/var/run/docker.sock"
SERVER_DATA_ROOT="./.data/servers"
WEBSITE_DATA_ROOT="./.data/websites"
MC_PORT_RANGE_START=25565
MC_PORT_RANGE_END=25665
WEB_PORT_RANGE_START=8100
WEB_PORT_RANGE_END=8200
CURSEFORGE_API_KEY=""
SMTP_HOST="localhost"
SMTP_PORT=1025
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="Ruby Panel <noreply@localhost>"
ENCRYPTION_KEY="local-32-char-encryption-key-000"
NEXT_PUBLIC_APP_NAME="Ruby Panel"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
''',
)

write(
    "prisma/schema.prisma",
    r'''
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id                 String                   @id @default(cuid())
  email              String                   @unique
  username           String                   @unique
  passwordHash       String
  role               Role                     @default(USER)
  avatarUrl          String?
  totpSecret         String?
  totpEnabled        Boolean                  @default(false)
  isActive           Boolean                  @default(true)
  lastLoginAt        DateTime?
  lastLoginIp        String?
  passwordChangedAt  DateTime                 @default(now())
  servers            ServerUser[]
  websites           WebsiteUser[]
  sessions           UserSession[]
  apiKeys            ApiKey[]
  auditLogs          AuditLog[]
  notifications      NotificationPreference[]
  recoveryCodes      RecoveryCode[]
  passwordResetTokens PasswordResetToken[]
  createdAt          DateTime                 @default(now())
  updatedAt          DateTime                 @updatedAt

  @@index([email])
  @@index([username])
}

enum Role {
  SUPERADMIN
  ADMIN
  MODERATOR
  USER
}

model UserSession {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token        String   @unique
  refreshToken String   @unique
  expiresAt    DateTime
  ipAddress    String?
  userAgent    String?
  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([token])
}

model RecoveryCode {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  codeHash  String    @unique
  usedAt    DateTime?
  createdAt DateTime  @default(now())

  @@index([userId])
}

model PasswordResetToken {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash String    @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())

  @@index([userId])
  @@index([tokenHash])
}

model ApiKey {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  keyHash     String    @unique
  keyPrefix   String
  permissions Json
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  createdAt   DateTime  @default(now())

  @@index([keyHash])
}

model Server {
  id              String               @id @default(cuid())
  name            String
  description     String?
  iconUrl         String?
  type            ServerType
  version         String
  build           String?
  containerId     String?              @unique
  containerName   String               @unique
  status          ServerStatus         @default(STOPPED)
  port            Int                  @unique
  queryPort       Int?
  rconPort        Int?
  rconPassword    String?
  ramMb           Int                  @default(2048)
  cpuPercent      Float                @default(100)
  diskGb          Float                @default(20)
  dataPath        String               @unique
  jvmFlags        String[]             @default([])
  startupScript   String?
  env             Json                 @default("{}")
  autoBackup      Boolean              @default(false)
  backupSchedule  String?
  backupRetention Int                  @default(7)
  users           ServerUser[]
  backups         Backup[]
  tasks           ScheduledTask[]
  snapshots       WorldSnapshot[]
  stats           ServerStatSnapshot[]
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt

  @@index([status])
  @@index([type])
}

enum ServerType {
  VANILLA
  PAPER
  PURPUR
  SPIGOT
  FABRIC
  FORGE
  NEOFORGE
  QUILT
  BEDROCK
  VELOCITY
  WATERFALL
  BUNGEECORD
  CUSTOM
}

enum ServerStatus {
  CREATING
  STARTING
  RUNNING
  STOPPING
  STOPPED
  CRASHED
  ERROR
}

model ServerUser {
  id          String             @id @default(cuid())
  serverId    String
  server      Server             @relation(fields: [serverId], references: [id], onDelete: Cascade)
  userId      String
  user        User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  permissions ServerPermission[]
  createdAt   DateTime           @default(now())

  @@unique([serverId, userId])
}

enum ServerPermission {
  VIEW
  CONSOLE
  FILES_READ
  FILES_WRITE
  PLUGINS
  BACKUPS
  TASKS
  MONITORING
  SETTINGS
  MANAGE
}

model Backup {
  id          String       @id @default(cuid())
  serverId    String
  server      Server       @relation(fields: [serverId], references: [id], onDelete: Cascade)
  name        String
  type        BackupType   @default(MANUAL)
  sizeMb      Float?
  filePath    String?
  checksum    String?
  status      BackupStatus @default(PENDING)
  errorMsg    String?
  createdAt   DateTime     @default(now())
  completedAt DateTime?

  @@index([serverId])
}

enum BackupType {
  MANUAL
  SCHEDULED
}

enum BackupStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}

model ScheduledTask {
  id        String   @id @default(cuid())
  serverId  String
  server    Server   @relation(fields: [serverId], references: [id], onDelete: Cascade)
  name      String
  type      TaskType
  schedule  String
  payload   Json
  isEnabled Boolean  @default(true)
  lastRun   DateTime?
  nextRun   DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([serverId])
}

enum TaskType {
  RESTART
  BACKUP
  COMMAND
  ANNOUNCE
  START
  STOP
}

model WorldSnapshot {
  id        String   @id @default(cuid())
  serverId  String
  server    Server   @relation(fields: [serverId], references: [id], onDelete: Cascade)
  worldName String
  filePath  String
  sizeMb    Float
  createdAt DateTime @default(now())

  @@index([serverId])
}

model ServerStatSnapshot {
  id          String   @id @default(cuid())
  serverId    String
  server      Server   @relation(fields: [serverId], references: [id], onDelete: Cascade)
  cpuPercent  Float
  ramMb       Float
  playerCount Int
  tps         Float?
  entities    Int?
  chunks      Int?
  netRxKb     Float?
  netTxKb     Float?
  timestamp   DateTime @default(now())

  @@index([serverId, timestamp])
}

model Website {
  id           String         @id @default(cuid())
  name         String
  type         SiteType
  containerId  String?        @unique
  status       SiteStatus     @default(STOPPED)
  dataPath     String         @unique
  buildCommand String?
  startCommand String?
  outputDir    String?
  port         Int            @unique
  users        WebsiteUser[]
  domains      Domain[]
  envVars      EnvVariable[]
  databases    SiteDatabase[]
  deployments  Deployment[]
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  @@index([status])
  @@index([type])
}

enum SiteType {
  STATIC
  NODEJS
  PHP
}

enum SiteStatus {
  STOPPED
  RUNNING
  BUILDING
  ERROR
}

model WebsiteUser {
  id        String  @id @default(cuid())
  websiteId String
  website   Website @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  userId    String
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      String  @default("viewer")

  @@unique([websiteId, userId])
}

model Domain {
  id         String   @id @default(cuid())
  websiteId  String
  website    Website  @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  domain     String   @unique
  sslEnabled Boolean  @default(false)
  sslExpiry  DateTime?
  verified   Boolean  @default(false)
  createdAt  DateTime @default(now())

  @@index([websiteId])
}

model EnvVariable {
  id        String  @id @default(cuid())
  websiteId String
  website   Website @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  key       String
  value     String
  isSecret  Boolean @default(false)

  @@unique([websiteId, key])
}

model SiteDatabase {
  id        String   @id @default(cuid())
  websiteId String
  website   Website  @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  name      String   @unique
  username  String   @unique
  password  String
  engine    DBEngine @default(POSTGRES)
  sizeMb    Float?
  createdAt DateTime @default(now())
}

enum DBEngine {
  POSTGRES
  MYSQL
}

model Deployment {
  id          String           @id @default(cuid())
  websiteId   String
  website     Website          @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  commitHash  String?
  branch      String?
  status      DeploymentStatus @default(PENDING)
  logs        String?
  triggeredBy String?
  createdAt   DateTime         @default(now())
  completedAt DateTime?

  @@index([websiteId])
}

enum DeploymentStatus {
  PENDING
  BUILDING
  DEPLOYING
  SUCCESS
  FAILED
}

model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  action     String
  targetType String?
  targetId   String?
  metadata   Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  @@index([userId])
  @@index([action])
  @@index([createdAt])
}

model NotificationPreference {
  id        String         @id @default(cuid())
  userId    String
  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  channel   NotificationCh
  target    String
  events    String[]
  isEnabled Boolean        @default(true)
  createdAt DateTime       @default(now())

  @@index([userId])
}

enum NotificationCh {
  DISCORD
  TELEGRAM
  EMAIL
}

model PanelSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  updatedAt DateTime @updatedAt
}
''',
)

write(
    "prisma/seed.ts",
    r'''
import { Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const settings = [
    ["panel.name", process.env.NEXT_PUBLIC_APP_NAME ?? "Ruby Panel"],
    ["setup.completed", "false"],
    ["panel.tagline", "Control Beyond Limits"],
    ["panel.theme", "ruby"]
  ] as const;

  for (const [key, value] of settings) {
    await prisma.panelSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    const passwordHash = await hash(password, 12);
    await prisma.user.upsert({
      where: { email },
      update: { passwordHash, role: Role.SUPERADMIN, isActive: true },
      create: {
        email,
        username: process.env.SEED_ADMIN_USERNAME ?? "superadmin",
        passwordHash,
        role: Role.SUPERADMIN
      }
    });
    await prisma.panelSetting.upsert({
      where: { key: "setup.completed" },
      update: { value: "true" },
      create: { key: "setup.completed", value: "true" }
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
''',
)

write(
    "src/lib/prisma.ts",
    r'''
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
''',
)

write(
    "src/lib/redis.ts",
    r'''
import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis?: Redis };

export function getRedis(): Redis {
  if (!globalForRedis.redis) {
    globalForRedis.redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
      enableReadyCheck: true
    });
  }
  return globalForRedis.redis;
}

export type RateLimitResult = {
  allowed: boolean;
  count: number;
  remaining: number;
  resetSeconds: number;
};

export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  const redis = getRedis();
  if (redis.status === "wait") {
    await redis.connect();
  }
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }
  const ttl = await redis.ttl(key);
  return {
    allowed: count <= limit,
    count,
    remaining: Math.max(limit - count, 0),
    resetSeconds: ttl > 0 ? ttl : windowSeconds
  };
}

export async function publishJson(channel: string, payload: unknown): Promise<void> {
  const redis = getRedis();
  if (redis.status === "wait") {
    await redis.connect();
  }
  await redis.publish(channel, JSON.stringify(payload));
}
''',
)

write(
    "src/lib/utils.ts",
    r'''
import path from "node:path";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(pathname: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return new URL(pathname, base).toString();
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function formatPercent(value: number): string {
  return `${Math.max(0, value).toFixed(1)}%`;
}

export function safeJoin(basePath: string, requestedPath: string): string {
  const normalizedBase = path.resolve(basePath);
  const target = path.resolve(normalizedBase, requestedPath.replace(/^[/\\]+/, ""));
  const relative = path.relative(normalizedBase, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Path escapes the server data directory");
  }
  return target;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function assertSameOrigin(request: Request): void {
  const unsafe = !["GET", "HEAD", "OPTIONS"].includes(request.method);
  if (!unsafe) {
    return;
  }
  if (request.headers.get("authorization")?.startsWith("Bearer ruby_")) {
    return;
  }
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    throw new Error("Cross-site mutation blocked");
  }
}

export function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected error";
}

export function parseNumber(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
''',
)

write(
    "src/types/index.ts",
    r'''
import type { Role, ServerPermission, ServerStatus, ServerType, SiteStatus, SiteType } from "@prisma/client";

export type AuthenticatedUser = {
  id: string;
  email: string;
  username: string;
  role: Role;
  apiKeyId?: string;
};

export type ServerSummary = {
  id: string;
  name: string;
  description: string | null;
  type: ServerType;
  version: string;
  status: ServerStatus;
  port: number;
  ramMb: number;
  cpuPercent: number;
  diskGb: number;
  updatedAt: string;
};

export type WebsiteSummary = {
  id: string;
  name: string;
  type: SiteType;
  status: SiteStatus;
  port: number;
  updatedAt: string;
};

export type PermissionCheck = {
  userId: string;
  serverId: string;
  permission: ServerPermission;
};
''',
)

write(
    "src/types/minecraft.ts",
    r'''
import type { ServerType } from "@prisma/client";

export type MinecraftVersion = {
  id: string;
  type: "release" | "snapshot" | "old_beta" | "old_alpha";
  url: string;
  time: string;
  releaseTime: string;
};

export type PaperBuild = {
  project: "paper";
  version: string;
  build: number;
  downloads: {
    application: {
      name: string;
      sha256: string;
    };
  };
};

export type ServerCreationInput = {
  name: string;
  description?: string;
  type: ServerType;
  version: string;
  ramMb: number;
  cpuPercent: number;
  diskGb: number;
  port?: number;
  jvmFlags: string[];
};
''',
)

write(
    "src/types/api.ts",
    r'''
export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type DashboardStats = {
  totalServers: number;
  runningServers: number;
  totalRamUsedMb: number;
  totalPlayersOnline: number;
  activity: Array<{
    id: string;
    action: string;
    targetType: string | null;
    targetId: string | null;
    createdAt: string;
    user: { username: string; email: string } | null;
  }>;
  resourceSeries: Array<{
    timestamp: string;
    cpuPercent: number;
    ramMb: number;
  }>;
};
''',
)

write(
    "src/types/next-auth.d.ts",
    r'''
import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: Role;
  }
}
''',
)

write(
    "src/lib/auth.ts",
    r'''
import crypto from "node:crypto";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authenticator } from "otplib";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/redis";
import { getClientIp } from "@/lib/utils";
import type { AuthenticatedUser } from "@/types";

const credentialSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  totpCode: z.string().optional(),
  remember: z.string().optional()
});

export const setupSchema = z
  .object({
    username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email(),
    password: z.string().min(12),
    confirmPassword: z.string().min(12),
    panelName: z.string().min(2).max(80),
    acceptTerms: z.literal(true)
  })
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords do not match" });
    }
    if (!isStrongPassword(value.password)) {
      context.addIssue({
        code: "custom",
        path: ["password"],
        message: "Password must contain uppercase, lowercase, number, and symbol"
      });
    }
  });

export function isStrongPassword(password: string): boolean {
  return /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^a-zA-Z0-9]/.test(password);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function hashSecret(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function createApiKeySecret(): { raw: string; hash: string; prefix: string } {
  const raw = `ruby_${crypto.randomBytes(32).toString("base64url")}`;
  return { raw, hash: hashSecret(raw), prefix: `${raw.slice(0, 13)}...` };
}

export function generateRecoveryCodes(): string[] {
  return Array.from({ length: 8 }, () => crypto.randomBytes(5).toString("hex").toUpperCase());
}

async function authorizeApiKey(request: Request): Promise<AuthenticatedUser | null> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ruby_")) {
    return null;
  }
  const token = header.slice("Bearer ".length).trim();
  const key = await prisma.apiKey.findUnique({
    where: { keyHash: hashSecret(token) },
    include: { user: true }
  });
  if (!key || key.expiresAt && key.expiresAt < new Date() || !key.user.isActive) {
    return null;
  }
  await prisma.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } });
  return {
    id: key.user.id,
    email: key.user.email,
    username: key.user.username,
    role: key.user.role,
    apiKeyId: key.id
  };
}

export const authConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    Credentials({
      name: "Ruby credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "Authenticator code", type: "text" },
        remember: { label: "Remember me", type: "text" }
      },
      async authorize(rawCredentials, request) {
        const parsed = credentialSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          return null;
        }
        const ip = getClientIp(request);
        const limited = await rateLimit(`auth:login:${ip}:${parsed.data.email.toLowerCase()}`, 5, 15 * 60);
        if (!limited.allowed) {
          throw new Error(`RATE_LIMITED:${limited.resetSeconds}`);
        }
        const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
        if (!user || !user.isActive) {
          throw new Error("INVALID_CREDENTIALS");
        }
        const valid = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!valid) {
          throw new Error("INVALID_CREDENTIALS");
        }
        if (user.totpEnabled) {
          if (!parsed.data.totpCode) {
            throw new Error("TOTP_REQUIRED");
          }
          const token = parsed.data.totpCode.replace(/\s+/g, "");
          const validTotp = user.totpSecret ? authenticator.check(token, user.totpSecret) : false;
          if (!validTotp) {
            const recoveryHash = hashSecret(token.toUpperCase());
            const recovery = await prisma.recoveryCode.findUnique({ where: { codeHash: recoveryHash } });
            if (!recovery || recovery.userId !== user.id || recovery.usedAt) {
              throw new Error("INVALID_TOTP");
            }
            await prisma.recoveryCode.update({ where: { id: recovery.id }, data: { usedAt: new Date() } });
          }
        }
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date(), lastLoginIp: ip }
        });
        return {
          id: user.id,
          email: user.email,
          name: user.username,
          username: user.username,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.role = token.role;
      return session;
    }
  }
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export async function requireUser(request?: Request): Promise<AuthenticatedUser> {
  if (request) {
    const apiUser = await authorizeApiKey(request);
    if (apiUser) {
      return apiUser;
    }
  }
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    username: session.user.username,
    role: session.user.role
  };
}

export function requireRole(user: AuthenticatedUser, roles: Role[]): void {
  if (!roles.includes(user.role)) {
    throw new Error("Insufficient role");
  }
}
''',
)

write(
    "src/lib/audit.ts",
    r'''
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { publishJson } from "@/lib/redis";

export async function auditLog(input: {
  userId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  const entry = await prisma.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: input.metadata,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent
    },
    include: { user: { select: { username: true, email: true } } }
  });
  await publishJson("global:activity", {
    id: entry.id,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId,
    createdAt: entry.createdAt.toISOString(),
    user: entry.user
  });
}
''',
)

write(
    "src/lib/permissions.ts",
    r'''
import { Role, ServerPermission } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AuthenticatedUser } from "@/types";

const elevatedRoles: Role[] = [Role.SUPERADMIN, Role.ADMIN];

export function canAccessAdmin(user: AuthenticatedUser): boolean {
  return elevatedRoles.includes(user.role);
}

export async function hasServerPermission(
  user: AuthenticatedUser,
  serverId: string,
  permission: ServerPermission
): Promise<boolean> {
  if (elevatedRoles.includes(user.role)) {
    return true;
  }
  const link = await prisma.serverUser.findUnique({
    where: { serverId_userId: { serverId, userId: user.id } },
    select: { permissions: true }
  });
  if (!link) {
    return false;
  }
  return link.permissions.includes(ServerPermission.MANAGE) || link.permissions.includes(permission);
}

export async function requireServerPermission(
  user: AuthenticatedUser,
  serverId: string,
  permission: ServerPermission
): Promise<void> {
  const allowed = await hasServerPermission(user, serverId, permission);
  if (!allowed) {
    throw new Error(`Missing server permission: ${permission}`);
  }
}
''',
)

write(
    "src/lib/docker.ts",
    r'''
import fs from "node:fs/promises";
import path from "node:path";
import Docker from "dockerode";
import { ServerStatus, type Server, type ServerType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ContainerStats = {
  cpuPercent: number;
  ramMb: number;
  ramLimitMb: number;
  netRxKb: number;
  netTxKb: number;
};

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET ?? "/var/run/docker.sock" });

function dockerType(type: ServerType): string {
  const map: Record<ServerType, string> = {
    VANILLA: "VANILLA",
    PAPER: "PAPER",
    PURPUR: "PURPUR",
    SPIGOT: "SPIGOT",
    FABRIC: "FABRIC",
    FORGE: "FORGE",
    NEOFORGE: "NEOFORGE",
    QUILT: "QUILT",
    BEDROCK: "BEDROCK",
    VELOCITY: "VELOCITY",
    WATERFALL: "WATERFALL",
    BUNGEECORD: "BUNGEECORD",
    CUSTOM: "CUSTOM"
  };
  return map[type];
}

async function pullImage(image: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    docker.pull(image, (pullError, stream) => {
      if (pullError) {
        reject(pullError);
        return;
      }
      if (!stream) {
        reject(new Error("Docker pull did not return a stream"));
        return;
      }
      docker.modem.followProgress(stream, (progressError: Error | null) => {
        if (progressError) {
          reject(progressError);
          return;
        }
        resolve();
      });
    });
  });
}

export async function ensureServerDataDir(server: Pick<Server, "dataPath">): Promise<void> {
  await fs.mkdir(server.dataPath, { recursive: true });
}

export async function createServerContainer(serverId: string): Promise<string> {
  const server = await prisma.server.findUniqueOrThrow({ where: { id: serverId } });
  await prisma.server.update({ where: { id: serverId }, data: { status: ServerStatus.CREATING } });
  await ensureServerDataDir(server);
  const image = "itzg/minecraft-server:latest";
  await pullImage(image);
  const memoryBytes = server.ramMb * 1024 * 1024;
  const cpuQuota = Math.max(10000, Math.round(server.cpuPercent * 1000));
  const container = await docker.createContainer({
    Image: image,
    name: server.containerName,
    Env: [
      "EULA=TRUE",
      `TYPE=${dockerType(server.type)}`,
      `VERSION=${server.version}`,
      `MEMORY=${server.ramMb}M`,
      `JVM_OPTS=${server.jvmFlags.join(" ")}`,
      ...Object.entries((server.env ?? {}) as Record<string, string>).map(([key, value]) => `${key}=${value}`)
    ],
    ExposedPorts: { "25565/tcp": {} },
    HostConfig: {
      Binds: [`${path.resolve(server.dataPath)}:/data`],
      PortBindings: { "25565/tcp": [{ HostPort: String(server.port) }] },
      Memory: memoryBytes,
      CpuQuota: cpuQuota,
      CpuPeriod: 100000,
      RestartPolicy: { Name: "unless-stopped" }
    }
  });
  await prisma.server.update({
    where: { id: serverId },
    data: { containerId: container.id, status: ServerStatus.STOPPED }
  });
  return container.id;
}

async function containerFor(serverId: string) {
  const server = await prisma.server.findUniqueOrThrow({ where: { id: serverId } });
  if (!server.containerId) {
    const containerId = await createServerContainer(serverId);
    return docker.getContainer(containerId);
  }
  return docker.getContainer(server.containerId);
}

export async function startServer(serverId: string): Promise<void> {
  const container = await containerFor(serverId);
  await prisma.server.update({ where: { id: serverId }, data: { status: ServerStatus.STARTING } });
  await container.start();
  await prisma.server.update({ where: { id: serverId }, data: { status: ServerStatus.RUNNING } });
}

export async function stopServer(serverId: string): Promise<void> {
  const container = await containerFor(serverId);
  await prisma.server.update({ where: { id: serverId }, data: { status: ServerStatus.STOPPING } });
  await container.stop({ t: 30 });
  await prisma.server.update({ where: { id: serverId }, data: { status: ServerStatus.STOPPED } });
}

export async function restartServer(serverId: string): Promise<void> {
  const container = await containerFor(serverId);
  await prisma.server.update({ where: { id: serverId }, data: { status: ServerStatus.STOPPING } });
  await container.restart({ t: 30 });
  await prisma.server.update({ where: { id: serverId }, data: { status: ServerStatus.RUNNING } });
}

export async function killServer(serverId: string): Promise<void> {
  const container = await containerFor(serverId);
  await container.kill();
  await prisma.server.update({ where: { id: serverId }, data: { status: ServerStatus.STOPPED } });
}

export async function deleteServerContainer(serverId: string, deleteData: boolean): Promise<void> {
  const server = await prisma.server.findUniqueOrThrow({ where: { id: serverId } });
  if (server.containerId) {
    const container = docker.getContainer(server.containerId);
    try {
      await container.remove({ force: true, v: true });
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("no such container")) {
        throw error;
      }
    }
  }
  if (deleteData) {
    const root = path.resolve(process.env.SERVER_DATA_ROOT ?? "./.data/servers");
    const target = path.resolve(server.dataPath);
    if (!target.startsWith(root)) {
      throw new Error("Refusing to remove data outside SERVER_DATA_ROOT");
    }
    await fs.rm(target, { recursive: true, force: true });
  }
  await prisma.server.delete({ where: { id: serverId } });
}

export async function execCommand(serverId: string, command: string): Promise<string> {
  const container = await containerFor(serverId);
  const exec = await container.exec({
    AttachStdout: true,
    AttachStderr: true,
    Cmd: ["mc-send-to-console", command]
  });
  const stream = await exec.start({ hijack: true, stdin: false });
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

type RawStats = {
  cpu_stats: { cpu_usage: { total_usage: number; percpu_usage?: number[] }; system_cpu_usage?: number };
  precpu_stats: { cpu_usage: { total_usage: number }; system_cpu_usage?: number };
  memory_stats: { usage?: number; limit?: number };
  networks?: Record<string, { rx_bytes: number; tx_bytes: number }>;
};

export async function getStats(serverId: string): Promise<ContainerStats> {
  const container = await containerFor(serverId);
  const raw = (await container.stats({ stream: false })) as RawStats;
  const cpuDelta = raw.cpu_stats.cpu_usage.total_usage - raw.precpu_stats.cpu_usage.total_usage;
  const systemDelta = (raw.cpu_stats.system_cpu_usage ?? 0) - (raw.precpu_stats.system_cpu_usage ?? 0);
  const onlineCpus = raw.cpu_stats.cpu_usage.percpu_usage?.length ?? 1;
  const cpuPercent = systemDelta > 0 ? (cpuDelta / systemDelta) * onlineCpus * 100 : 0;
  const ramMb = (raw.memory_stats.usage ?? 0) / 1024 / 1024;
  const ramLimitMb = (raw.memory_stats.limit ?? 0) / 1024 / 1024;
  const networkTotals = Object.values(raw.networks ?? {}).reduce(
    (acc, network) => ({ rx: acc.rx + network.rx_bytes, tx: acc.tx + network.tx_bytes }),
    { rx: 0, tx: 0 }
  );
  return {
    cpuPercent,
    ramMb,
    ramLimitMb,
    netRxKb: networkTotals.rx / 1024,
    netTxKb: networkTotals.tx / 1024
  };
}
''',
)

write(
    "src/lib/ai.ts",
    r'''
import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { safeJoin } from "@/lib/utils";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OllamaChunk = {
  message?: { content?: string };
  done?: boolean;
  error?: string;
};

function asOllamaChunk(value: unknown): OllamaChunk {
  if (!value || typeof value !== "object") {
    return {};
  }
  return value as OllamaChunk;
}

async function readIfExists(filePath: string, maxBytes: number): Promise<string> {
  try {
    const buffer = await fs.readFile(filePath);
    return buffer.subarray(Math.max(0, buffer.length - maxBytes)).toString("utf8");
  } catch {
    return "";
  }
}

async function tree(dir: string, depth: number): Promise<string[]> {
  if (depth <= 0) {
    return [];
  }
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const lines: string[] = [];
    for (const entry of entries.slice(0, 80)) {
      lines.push(`${"  ".repeat(2 - depth)}${entry.isDirectory() ? "dir " : "file"} ${entry.name}`);
      if (entry.isDirectory()) {
        lines.push(...(await tree(path.join(dir, entry.name), depth - 1)));
      }
    }
    return lines;
  } catch {
    return [];
  }
}

export async function buildServerAiContext(serverId: string): Promise<string> {
  const server = await prisma.server.findUniqueOrThrow({
    where: { id: serverId },
    include: { stats: { orderBy: { timestamp: "desc" }, take: 1 } }
  });
  const latestStats = server.stats[0];
  const latestLog = await readIfExists(safeJoin(server.dataPath, "logs/latest.log"), 32_000);
  const files = await tree(server.dataPath, 2);
  const configs = await Promise.all(
    ["server.properties", "spigot.yml", "config/paper-global.yml", "config/paper-world-defaults.yml"].map(async (file) => ({
      file,
      content: await readIfExists(safeJoin(server.dataPath, file), 16_000)
    }))
  );
  return JSON.stringify(
    {
      system: "You are Ruby AI, an expert Minecraft server administrator. Give precise operational advice, prefer safe reversible changes, and explain server-impacting changes before proposing them.",
      context: {
        server: {
          name: server.name,
          type: server.type,
          version: server.version,
          status: server.status,
          ramMb: server.ramMb,
          cpuPercent: server.cpuPercent
        },
        stats: latestStats
          ? {
              tps: latestStats.tps,
              players: latestStats.playerCount,
              cpu: latestStats.cpuPercent,
              ram: latestStats.ramMb,
              entities: latestStats.entities,
              chunks: latestStats.chunks
            }
          : null,
        recentLogs: latestLog,
        fileTree: files.join("\n"),
        configs: Object.fromEntries(configs.map((config) => [config.file, config.content]))
      }
    },
    null,
    2
  );
}

export async function streamOllamaChat(messages: ChatMessage[], serverId: string): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();
  const context = await buildServerAiContext(serverId);
  const apiKey = process.env.OLLAMA_CLOUD_API_KEY;
  if (!apiKey) {
    throw new Error("OLLAMA_CLOUD_API_KEY is not configured");
  }
  const response = await fetch(process.env.OLLAMA_CLOUD_BASE_URL ?? "https://ollama.com/api/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OLLAMA_CLOUD_MODEL ?? "deepseek-v4-pro:cloud",
      stream: true,
      messages: [{ role: "system", content: context }, ...messages]
    })
  });
  if (!response.ok || !response.body) {
    throw new Error(`Ollama Cloud request failed with status ${response.status}`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffered = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.enqueue(encoder.encode("event: done\ndata: {}\n\n"));
            controller.close();
            return;
          }
          buffered += decoder.decode(value, { stream: true });
          const lines = buffered.split("\n");
          buffered = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) {
              continue;
            }
            const chunk = asOllamaChunk(JSON.parse(trimmed) as unknown);
            if (chunk.error) {
              controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: chunk.error })}\n\n`));
              continue;
            }
            const token = chunk.message?.content;
            if (token) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
            }
          }
        }
      } catch (error) {
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: error instanceof Error ? error.message : "AI stream failed" })}\n\n`));
        controller.close();
      }
    },
    cancel() {
      void reader.cancel();
    }
  });
}
''',
)

write(
    "src/lib/minecraft/properties.ts",
    r'''
export function parseProperties(input: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of input.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      result[trimmed] = "";
    } else {
      result[trimmed.slice(0, separator).trim()] = trimmed.slice(separator + 1).trim();
    }
  }
  return result;
}

export function serializeProperties(properties: Record<string, string>): string {
  return Object.entries(properties)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}
''',
)

write(
    "src/lib/minecraft/versions.ts",
    r'''
import type { MinecraftVersion, PaperBuild } from "@/types/minecraft";

type VersionManifest = {
  latest: { release: string; snapshot: string };
  versions: MinecraftVersion[];
};

export async function getMinecraftVersions(): Promise<VersionManifest> {
  const response = await fetch("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json", {
    next: { revalidate: 60 * 60 }
  });
  if (!response.ok) {
    throw new Error(`Failed to load Minecraft versions: ${response.status}`);
  }
  return (await response.json()) as VersionManifest;
}

export async function getPaperBuilds(version: string): Promise<PaperBuild[]> {
  const response = await fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds`, {
    next: { revalidate: 60 * 15 }
  });
  if (!response.ok) {
    return [];
  }
  const payload = (await response.json()) as { builds: PaperBuild[] };
  return payload.builds;
}
''',
)

write(
    "src/lib/minecraft/jars.ts",
    r'''
import fs from "node:fs/promises";
import path from "node:path";
import { getPaperBuilds } from "@/lib/minecraft/versions";

export async function downloadPaperJar(version: string, destinationDir: string): Promise<string> {
  const builds = await getPaperBuilds(version);
  const build = builds.at(-1);
  if (!build) {
    throw new Error(`No Paper builds are available for Minecraft ${version}`);
  }
  const jarName = build.downloads.application.name;
  const url = `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build.build}/downloads/${jarName}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download Paper jar: ${response.status}`);
  }
  await fs.mkdir(destinationDir, { recursive: true });
  const target = path.join(destinationDir, jarName);
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(target, buffer);
  return target;
}
''',
)

write(
    "src/lib/plugins/modrinth.ts",
    r'''
import axios from "axios";

export type ModrinthProject = {
  project_id: string;
  title: string;
  description: string;
  icon_url: string | null;
  downloads: number;
  author: string;
  versions: string[];
  loaders: string[];
  date_modified: string;
};

export async function searchModrinth(query: string, facets: string[][] = []): Promise<ModrinthProject[]> {
  const response = await axios.get<{ hits: ModrinthProject[] }>("https://api.modrinth.com/v2/search", {
    params: {
      query,
      limit: 30,
      facets: JSON.stringify(facets)
    }
  });
  return response.data.hits;
}

export async function getModrinthVersions(projectId: string): Promise<Array<{ id: string; name: string; files: Array<{ url: string; filename: string; primary: boolean }> }>> {
  const response = await axios.get<Array<{ id: string; name: string; files: Array<{ url: string; filename: string; primary: boolean }> }>>(
    `https://api.modrinth.com/v2/project/${projectId}/version`
  );
  return response.data;
}
''',
)

write(
    "src/lib/plugins/curseforge.ts",
    r'''
import axios from "axios";

export type CurseForgeMod = {
  id: number;
  name: string;
  summary: string;
  downloadCount: number;
  dateModified: string;
  authors: Array<{ name: string }>;
  logo?: { thumbnailUrl: string };
};

export async function searchCurseForge(query: string): Promise<CurseForgeMod[]> {
  const apiKey = process.env.CURSEFORGE_API_KEY;
  if (!apiKey) {
    return [];
  }
  const response = await axios.get<{ data: CurseForgeMod[] }>("https://api.curseforge.com/v1/mods/search", {
    headers: { "x-api-key": apiKey },
    params: {
      gameId: 432,
      searchFilter: query,
      pageSize: 30,
      sortField: 6,
      sortOrder: "desc"
    }
  });
  return response.data.data;
}
''',
)

write(
    "src/lib/ssl.ts",
    r'''
import * as acme from "acme-client";

export type CertificateRequest = {
  domain: string;
  email: string;
  accountKeyPem: string;
};

export async function createCertificateCsr(domain: string): Promise<{ key: string; csr: string }> {
  const [key, csr] = await acme.crypto.createCsr({
    commonName: domain,
    altNames: [domain]
  });
  return { key: key.toString(), csr: csr.toString() };
}

export function dnsVerificationRecord(domain: string): { name: string; type: "TXT"; valueHint: string } {
  return {
    name: `_acme-challenge.${domain}`,
    type: "TXT",
    valueHint: "Ruby Panel will show the exact ACME challenge token when an order is created."
  };
}
''',
)

write(
    "src/lib/notifications.ts",
    r'''
import nodemailer from "nodemailer";

export async function sendDiscordWebhook(webhookUrl: string, content: string): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content })
  });
  if (!response.ok) {
    throw new Error(`Discord webhook failed: ${response.status}`);
  }
}

export async function sendTelegramMessage(botToken: string, chatId: string, text: string): Promise<void> {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });
  if (!response.ok) {
    throw new Error(`Telegram notification failed: ${response.status}`);
  }
}

export async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      : undefined
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "Ruby Panel <noreply@localhost>",
    to,
    subject,
    text
  });
}
''',
)

write(
    "src/app/globals.css",
    r'''
@import "tailwindcss";

:root {
  --ruby-50: #fff1f2;
  --ruby-100: #ffe4e6;
  --ruby-200: #fecdd3;
  --ruby-400: #fb7185;
  --ruby-500: #f43f5e;
  --ruby-600: #e11d48;
  --ruby-700: #be123c;
  --ruby-900: #881337;
  --surface-0: #080809;
  --surface-1: #0d0d0f;
  --surface-2: #111114;
  --surface-3: #18181c;
  --surface-4: #1e1e23;
  --surface-5: #26262e;
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.1);
  --border-strong: rgba(255, 255, 255, 0.16);
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.6);
  --text-tertiary: rgba(255, 255, 255, 0.35);
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.08);
}

* {
  box-sizing: border-box;
}

html {
  min-height: 100%;
  color-scheme: dark;
  background: var(--surface-0);
}

body {
  min-height: 100%;
  margin: 0;
  color: var(--text-primary);
  background:
    radial-gradient(circle at 15% 10%, rgba(225, 29, 72, 0.2), transparent 34rem),
    radial-gradient(circle at 85% 0%, rgba(251, 113, 133, 0.12), transparent 30rem),
    linear-gradient(180deg, var(--surface-0), var(--surface-1));
  font-family: var(--font-geist), Geist, ui-sans-serif, system-ui, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
textarea,
select {
  font: inherit;
}

::selection {
  background: rgba(225, 29, 72, 0.35);
}

.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(150%);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  box-shadow:
    0 0 0 1px rgba(225, 29, 72, 0.05),
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.ruby-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 38px 38px;
  mask-image: radial-gradient(circle at center, black, transparent 72%);
}

.focus-ruby:focus-visible {
  outline: 2px solid var(--ruby-600);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.001ms !important;
  }
}
''',
)

write(
    "src/app/layout.tsx",
    r'''
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap"
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "Ruby Panel - Control Beyond Limits",
    template: "%s | Ruby Panel"
  },
  description: "A premium Minecraft and web hosting control panel.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#E11D48",
  colorScheme: "dark"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.variable} ${geistMono.variable}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
''',
)

write(
    "src/app/not-found.tsx",
    r'''
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-6">
      <div className="ruby-grid absolute inset-0 opacity-60" />
      <section className="glass-card relative max-w-xl p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-ruby-400">404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">This route slipped beyond the border.</h1>
        <p className="mt-4 text-sm leading-6 text-white/60">
          Ruby Panel could not find that page. Head back to the command deck and we will keep the engines warm.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">Return to dashboard</Link>
        </Button>
      </section>
    </main>
  );
}
''',
)

write(
    "src/app/error.tsx",
    r'''
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center px-6">
      <section className="glass-card max-w-xl p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-ruby-400">Runtime fault</p>
        <h1 className="mt-4 text-3xl font-semibold">Something went wrong.</h1>
        <p className="mt-4 text-sm text-white/60">
          The panel caught the issue before it spread. Try again, and check server logs if the problem persists.
        </p>
        {process.env.NODE_ENV === "development" ? (
          <pre className="mt-6 overflow-auto rounded-lg bg-black/40 p-4 text-left text-xs text-white/70">{error.message}</pre>
        ) : null}
        <Button className="mt-8" onClick={reset}>
          Retry
        </Button>
      </section>
    </main>
  );
}
''',
)

write(
    "src/components/providers/AppProviders.tsx",
    r'''
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors position="top-right" closeButton />
      </QueryClientProvider>
    </SessionProvider>
  );
}
''',
)

write(
    "src/components/ui/button.tsx",
    r'''
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-ruby inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-ruby-600 text-white shadow-ruby hover:bg-ruby-500 active:bg-ruby-700",
        secondary: "border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]",
        ghost: "text-white/70 hover:bg-white/[0.06] hover:text-white",
        destructive: "bg-ruby-700 text-white hover:bg-ruby-600",
        outline: "border border-ruby-600/50 bg-ruby-600/10 text-ruby-100 hover:bg-ruby-600/20"
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-5",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";
''',
)

write(
    "src/components/ui/input.tsx",
    r'''
import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "focus-ruby h-11 w-full rounded-lg border border-white/10 bg-surface-4 px-3 text-sm text-white placeholder:text-white/30 transition-colors hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
''',
)

write(
    "src/components/ui/textarea.tsx",
    r'''
import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "focus-ruby min-h-28 w-full rounded-lg border border-white/10 bg-surface-4 px-3 py-2 text-sm text-white placeholder:text-white/30 transition-colors hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
''',
)

write(
    "src/components/ui/label.tsx",
    r'''
"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root className={cn("text-sm font-medium text-white/80", className)} {...props} />;
}
''',
)

write(
    "src/components/ui/badge.tsx",
    r'''
import { cn } from "@/lib/utils";

const styles = {
  default: "border-white/10 bg-white/[0.06] text-white/70",
  running: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 shadow-[0_0_24px_rgba(52,211,153,0.24)]",
  stopped: "border-white/10 bg-white/[0.04] text-white/45",
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  danger: "border-ruby-500/40 bg-ruby-600/15 text-ruby-100"
};

export function Badge({
  variant = "default",
  className,
  children
}: {
  variant?: keyof typeof styles;
  className?: string;
  children: React.ReactNode;
}) {
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", styles[variant], className)}>{children}</span>;
}
''',
)

write(
    "src/components/ui/progress.tsx",
    r'''
"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <ProgressPrimitive.Root className={cn("relative h-2 overflow-hidden rounded-full bg-white/10", className)} value={clamped}>
      <ProgressPrimitive.Indicator
        className="h-full rounded-full bg-gradient-to-r from-ruby-700 to-ruby-400 transition-transform"
        style={{ transform: `translateX(-${100 - clamped}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
''',
)

write(
    "src/components/ui/dialog.tsx",
    r'''
"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn(
          "glass-card fixed left-1/2 top-1/2 z-50 w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 p-6",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="focus-ruby absolute right-4 top-4 rounded-md p-1 text-white/50 hover:bg-white/10 hover:text-white">
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("text-xl font-semibold text-white", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("text-sm leading-6 text-white/60", className)} {...props} />;
}
''',
)

write(
    "src/components/ui/select.tsx",
    r'''
"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger className={cn("focus-ruby flex h-11 w-full items-center justify-between rounded-lg border border-white/10 bg-surface-4 px-3 text-sm text-white", className)} {...props}>
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown className="h-4 w-4 text-white/50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content className={cn("z-50 overflow-hidden rounded-lg border border-white/10 bg-surface-3 p-1 text-white shadow-2xl", className)} {...props}>
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item className={cn("focus-ruby relative flex cursor-pointer select-none items-center rounded-md px-8 py-2 text-sm outline-none hover:bg-white/10", className)} {...props}>
      <SelectPrimitive.ItemIndicator className="absolute left-2">
        <Check className="h-4 w-4 text-ruby-400" />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
''',
)

write(
    "src/components/ui/tabs.tsx",
    r'''
"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className={cn("inline-flex rounded-xl border border-white/10 bg-white/[0.04] p-1", className)} {...props} />;
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return <TabsPrimitive.Trigger className={cn("focus-ruby rounded-lg px-3 py-2 text-sm text-white/55 data-[state=active]:bg-ruby-600 data-[state=active]:text-white", className)} {...props} />;
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("mt-4", className)} {...props} />;
}
''',
)

write(
    "src/components/ui/switch.tsx",
    r'''
"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root className={cn("focus-ruby relative h-6 w-11 rounded-full bg-white/15 transition-colors data-[state=checked]:bg-ruby-600", className)} {...props}>
      <SwitchPrimitive.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-5" />
    </SwitchPrimitive.Root>
  );
}
''',
)

write(
    "src/components/ui/separator.tsx",
    r'''
import { cn } from "@/lib/utils";

export function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-white/10", className)} />;
}
''',
)

write(
    "src/components/common/GlassCard.tsx",
    r'''
import { cn } from "@/lib/utils";

export function GlassCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("glass-card p-5", className)}>{children}</section>;
}
''',
)

write(
    "src/components/common/AnimatedPage.tsx",
    r'''
"use client";

import { motion } from "framer-motion";

export function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
''',
)

write(
    "src/components/common/LoadingSpinner.tsx",
    r'''
export function LoadingSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-white/60">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-ruby-500 border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}
''',
)

write(
    "src/components/common/StatusBadge.tsx",
    r'''
import type { ServerStatus, SiteStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: ServerStatus | SiteStatus }) {
  if (status === "RUNNING") {
    return <Badge variant="running">RUNNING</Badge>;
  }
  if (status === "CRASHED" || status === "ERROR") {
    return <Badge variant="danger">{status}</Badge>;
  }
  if (status === "STARTING" || status === "STOPPING" || status === "BUILDING") {
    return <Badge variant="warning">{status}</Badge>;
  }
  return <Badge variant="stopped">{status}</Badge>;
}
''',
)

write(
    "src/components/common/ConfirmDialog.tsx",
    r'''
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  requiredText,
  onConfirm,
  children
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  requiredText?: string;
  onConfirm: () => Promise<void> | void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const allowed = !requiredText || typed === requiredText;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {requiredText ? <Input value={typed} onChange={(event) => setTyped(event.target.value)} placeholder={`Type ${requiredText} to confirm`} /> : null}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!allowed || busy}
            onClick={async () => {
              setBusy(true);
              await onConfirm();
              setBusy(false);
              setOpen(false);
            }}
          >
            {busy ? "Working..." : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
''',
)

write(
    "src/components/layout/PageHeader.tsx",
    r'''
export function PageHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.35em] text-ruby-400">{eyebrow}</p> : null}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-5xl">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </header>
  );
}
''',
)

write(
    "src/store/sidebarStore.ts",
    r'''
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SidebarState = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
};

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((state) => ({ collapsed: !state.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed })
    }),
    { name: "ruby-sidebar" }
  )
);
''',
)

write(
    "src/store/serverStore.ts",
    r'''
import { create } from "zustand";

type ServerState = {
  activeServerId: string | null;
  setActiveServerId: (serverId: string | null) => void;
};

export const useServerStore = create<ServerState>((set) => ({
  activeServerId: null,
  setActiveServerId: (activeServerId) => set({ activeServerId })
}));
''',
)

write(
    "src/store/aiStore.ts",
    r'''
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AiChatMessage = {
  id: string;
  serverId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type AiState = {
  messages: AiChatMessage[];
  addMessage: (message: AiChatMessage) => void;
  updateMessage: (id: string, content: string) => void;
  clearServer: (serverId: string) => void;
};

export const useAiStore = create<AiState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      updateMessage: (id, content) =>
        set((state) => ({
          messages: state.messages.map((message) => (message.id === id ? { ...message, content } : message))
        })),
      clearServer: (serverId) => set((state) => ({ messages: state.messages.filter((message) => message.serverId !== serverId) }))
    }),
    { name: "ruby-ai-history" }
  )
);
''',
)

write(
    "src/hooks/useServerStats.ts",
    r'''
"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

export type LiveStats = {
  cpuPercent: number;
  ramMb: number;
  ramLimitMb: number;
  playerCount: number;
  tps: number | null;
  netRxKb: number;
  netTxKb: number;
};

export function useServerStats(serverId: string) {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001", {
      transports: ["websocket"],
      auth: { token: "browser-session" }
    });
    socket.on("connect", () => {
      setConnected(true);
      socket.emit("stats:join", serverId);
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("stats:update", (payload: LiveStats) => setStats(payload));
    return () => {
      socket.disconnect();
    };
  }, [serverId]);

  return { stats, connected };
}
''',
)

write(
    "src/hooks/useConsole.ts",
    r'''
"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

export function useConsole(serverId: string) {
  const [lines, setLines] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001", {
      transports: ["websocket"],
      auth: { token: "browser-session" }
    });
    socket.on("connect", () => {
      setConnected(true);
      socket.emit("console:join", serverId);
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("console:line", (line: string) => setLines((current) => [...current.slice(-999), line]));
    return () => {
      socket.disconnect();
    };
  }, [serverId]);

  return {
    connected,
    lines,
    sendCommand(command: string) {
      const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001", {
        transports: ["websocket"],
        auth: { token: "browser-session" }
      });
      socket.emit("console:command", { serverId, command });
      socket.disconnect();
    },
    clear() {
      setLines([]);
    }
  };
}
''',
)

write(
    "src/hooks/useFileManager.ts",
    r'''
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type FileEntry = {
  name: string;
  path: string;
  type: "file" | "directory";
  size: number;
  modifiedAt: string;
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = (await response.json()) as { ok: boolean; data?: T; error?: string };
  if (!response.ok || !payload.ok || payload.data === undefined) {
    throw new Error(payload.error ?? "File operation failed");
  }
  return payload.data;
}

export function useFileManager(serverId: string, directory: string) {
  const queryClient = useQueryClient();
  const queryKey = ["files", serverId, directory] as const;
  const files = useQuery({
    queryKey,
    queryFn: () => requestJson<FileEntry[]>(`/api/servers/${serverId}/files?path=${encodeURIComponent(directory)}`)
  });
  const writeFile = useMutation({
    mutationFn: ({ path, content }: { path: string; content: string }) =>
      requestJson<{ path: string }>(`/api/servers/${serverId}/files`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "write", path, content })
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });
  const remove = useMutation({
    mutationFn: (path: string) =>
      requestJson<{ path: string }>(`/api/servers/${serverId}/files?path=${encodeURIComponent(path)}`, {
        method: "DELETE"
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });
  return { files, writeFile, remove };
}
''',
)

write(
    "src/hooks/useAiStream.ts",
    r'''
"use client";

import { useState } from "react";

export function useAiStream(serverId: string) {
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(messages: Array<{ role: "user" | "assistant"; content: string }>, onToken: (token: string) => void) {
    setStreaming(true);
    setError(null);
    try {
      const response = await fetch(`/api/servers/${serverId}/ai`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages })
      });
      if (!response.ok || !response.body) {
        throw new Error(`AI request failed: ${response.status}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const event of events) {
          const data = event.split("\n").find((line) => line.startsWith("data: "));
          if (!data) {
            continue;
          }
          const parsed = JSON.parse(data.slice(6)) as { token?: string; error?: string };
          if (parsed.token) {
            onToken(parsed.token);
          }
          if (parsed.error) {
            throw new Error(parsed.error);
          }
        }
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "AI request failed");
    } finally {
      setStreaming(false);
    }
  }

  return { send, streaming, error };
}
''',
)

write(
    "src/components/layout/Sidebar.tsx",
    r'''
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, Globe2, KeyRound, LayoutDashboard, PanelLeftClose, PanelLeftOpen, Settings, Shield, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebarStore";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/servers", label: "Servers", icon: Boxes },
  { href: "/web-hosting", label: "Web Hosting", icon: Globe2 },
  { href: "/admin/users", label: "Users", icon: Shield },
  { href: "/admin/api-keys", label: "API Keys", icon: KeyRound },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/profile", label: "Profile", icon: UserRound }
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebarStore();
  return (
    <aside className={cn("fixed left-0 top-0 z-40 hidden h-screen border-r border-white/10 bg-surface-1/85 backdrop-blur-xl transition-all md:block", collapsed ? "w-20" : "w-72")}>
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-ruby-600 font-bold shadow-ruby">R</div>
        {!collapsed ? (
          <div>
            <p className="font-semibold">Ruby Panel</p>
            <p className="text-xs text-white/45">Control Beyond Limits</p>
          </div>
        ) : null}
      </div>
      <nav className="space-y-1 p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn("focus-ruby flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors", active ? "bg-ruby-600 text-white shadow-ruby" : "text-white/55 hover:bg-white/[0.06] hover:text-white")}>
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-4 left-3 right-3">
        <Button variant="secondary" className="w-full" onClick={toggle} aria-label="Toggle sidebar">
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          {!collapsed ? "Collapse" : null}
        </Button>
      </div>
    </aside>
  );
}
''',
)

write(
    "src/components/layout/TopBar.tsx",
    r'''
"use client";

import { signOut, useSession } from "next-auth/react";
import { Bell, LogOut, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebarStore } from "@/store/sidebarStore";

export function TopBar() {
  const { data } = useSession();
  const { setCollapsed } = useSidebarStore();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/10 bg-surface-1/70 px-4 backdrop-blur-xl md:px-8">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setCollapsed(false)} aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </Button>
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <Input className="pl-9" placeholder="Search servers, websites, users..." />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="hidden text-right text-sm md:block">
          <p className="font-medium">{data?.user?.username ?? "Operator"}</p>
          <p className="text-xs text-white/45">{data?.user?.role ?? "USER"}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void signOut({ callbackUrl: "/login" })}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </header>
  );
}
''',
)

write(
    "src/components/dashboard/ResourceGauge.tsx",
    r'''
import { Progress } from "@/components/ui/progress";

export function ResourceGauge({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-white/55">{label}</span>
        <span className="text-sm font-semibold text-white">{value.toFixed(1)}%</span>
      </div>
      <Progress value={value} />
      <p className="mt-2 text-xs text-white/40">{detail}</p>
    </div>
  );
}
''',
)

write(
    "src/components/dashboard/ServerCard.tsx",
    r'''
"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Cpu, HardDrive, MemoryStick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/common/GlassCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { ServerSummary } from "@/types";

async function power(serverId: string, action: "start" | "stop" | "restart") {
  const response = await fetch(`/api/servers/${serverId}/power`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action })
  });
  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error ?? "Power action failed");
  }
}

export function ServerCard({ server }: { server: ServerSummary }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (action: "start" | "stop" | "restart") => power(server.id, action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["servers"] })
  });
  return (
    <GlassCard className="group transition-transform hover:-translate-y-1 hover:border-ruby-500/35">
      <Link href={`/servers/${server.id}`} className="block">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{server.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-white/50">{server.description ?? `${server.type} ${server.version}`}</p>
          </div>
          <StatusBadge status={server.status} />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-white/50">
          <span className="flex items-center gap-2"><MemoryStick className="h-4 w-4 text-ruby-400" />{server.ramMb} MB</span>
          <span className="flex items-center gap-2"><Cpu className="h-4 w-4 text-ruby-400" />{server.cpuPercent}%</span>
          <span className="flex items-center gap-2"><HardDrive className="h-4 w-4 text-ruby-400" />{server.diskGb} GB</span>
        </div>
      </Link>
      <div className="mt-6 flex gap-2">
        <Button size="sm" disabled={mutation.isPending || server.status === "RUNNING"} onClick={() => mutation.mutate("start")}>Start</Button>
        <Button size="sm" variant="secondary" disabled={mutation.isPending || server.status !== "RUNNING"} onClick={() => mutation.mutate("restart")}>Restart</Button>
        <Button size="sm" variant="destructive" disabled={mutation.isPending || server.status !== "RUNNING"} onClick={() => mutation.mutate("stop")}>Stop</Button>
      </div>
    </GlassCard>
  );
}
''',
)

write(
    "src/components/dashboard/ActivityFeed.tsx",
    r'''
import { formatDistanceToNow } from "date-fns";
import { GlassCard } from "@/components/common/GlassCard";

export function ActivityFeed({
  entries
}: {
  entries: Array<{ id: string; action: string; targetType: string | null; createdAt: string; user: { username: string; email: string } | null }>;
}) {
  return (
    <GlassCard>
      <h2 className="text-lg font-semibold">Recent activity</h2>
      <div className="mt-5 space-y-4">
        {entries.length === 0 ? <p className="text-sm text-white/45">No activity yet. The first audit trail will appear here.</p> : null}
        {entries.map((entry) => (
          <div key={entry.id} className="flex gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-ruby-500 shadow-ruby" />
            <div>
              <p className="text-sm text-white/80">
                <span className="font-medium">{entry.user?.username ?? "System"}</span> performed <span className="font-mono text-ruby-200">{entry.action}</span>
              </p>
              <p className="mt-1 text-xs text-white/40">
                {entry.targetType ?? "Panel"} · {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
''',
)

write(
    "src/components/dashboard/GlobalStats.tsx",
    r'''
import { Boxes, MemoryStick, PlayCircle, Users } from "lucide-react";
import { GlassCard } from "@/components/common/GlassCard";

const icons = {
  servers: Boxes,
  running: PlayCircle,
  ram: MemoryStick,
  players: Users
};

export function GlobalStats({
  stats
}: {
  stats: {
    totalServers: number;
    runningServers: number;
    totalRamUsedMb: number;
    totalPlayersOnline: number;
  };
}) {
  const items = [
    { label: "Total Servers", value: stats.totalServers, icon: icons.servers },
    { label: "Running Servers", value: stats.runningServers, icon: icons.running },
    { label: "RAM Used", value: `${stats.totalRamUsedMb.toFixed(0)} MB`, icon: icons.ram },
    { label: "Players Online", value: stats.totalPlayersOnline, icon: icons.players }
  ];
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <GlassCard key={item.label}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/50">{item.label}</p>
              <Icon className="h-5 w-5 text-ruby-400" />
            </div>
            <p className="mt-4 text-3xl font-semibold">{item.value}</p>
          </GlassCard>
        );
      })}
    </div>
  );
}
''',
)

write(
    "src/components/server/Console.tsx",
    r'''
"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";
import { io, type Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Console({ serverId }: { serverId: string }) {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const terminal = useRef<Terminal | null>(null);
  const socket = useRef<Socket | null>(null);
  const [command, setCommand] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!terminalRef.current) {
      return;
    }
    const term = new Terminal({
      cursorBlink: true,
      convertEol: true,
      fontFamily: "var(--font-geist-mono), JetBrains Mono, monospace",
      fontSize: 13,
      theme: {
        background: "#080809",
        foreground: "#f8f8f8",
        cursor: "#fb7185",
        selectionBackground: "#e11d4860"
      }
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.loadAddon(new WebLinksAddon());
    term.open(terminalRef.current);
    fit.fit();
    term.writeln("\x1b[31mRuby Console\x1b[0m connected to the panel bridge.");
    terminal.current = term;
    const nextSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001", {
      transports: ["websocket"],
      auth: { token: "browser-session" }
    });
    socket.current = nextSocket;
    nextSocket.on("connect", () => {
      setConnected(true);
      nextSocket.emit("console:join", serverId);
    });
    nextSocket.on("disconnect", () => setConnected(false));
    nextSocket.on("console:history", (lines: string[]) => lines.forEach((line) => term.writeln(line)));
    nextSocket.on("console:line", (line: string) => term.writeln(line));
    const resize = () => fit.fit();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      nextSocket.disconnect();
      term.dispose();
    };
  }, [serverId]);

  function send() {
    const trimmed = command.trim();
    if (!trimmed) {
      return;
    }
    socket.current?.emit("console:command", { serverId, command: trimmed });
    terminal.current?.writeln(`\x1b[90m> ${trimmed}\x1b[0m`);
    setCommand("");
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="font-semibold">Live console</p>
          <p className="text-xs text-white/45">{connected ? "Socket bridge online" : "Waiting for socket bridge"}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => terminal.current?.clear()}>
          Clear
        </Button>
      </div>
      <div ref={terminalRef} className="h-[58vh] bg-black p-3" />
      <form
        className="flex gap-2 border-t border-white/10 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <Input value={command} onChange={(event) => setCommand(event.target.value)} placeholder="say Hello from Ruby Panel" />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
''',
)

write(
    "src/components/server/FileEditor.tsx",
    r'''
"use client";

import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";

export function FileEditor({
  path,
  value,
  onChange,
  onSave,
  saving
}: {
  path: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const extension = path.split(".").pop()?.toLowerCase();
  const language = extension === "yml" || extension === "yaml" ? "yaml" : extension === "properties" ? "ini" : extension === "ts" ? "typescript" : extension === "js" ? "javascript" : extension ?? "plaintext";
  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <p className="font-mono text-sm text-white/70">{path}</p>
        <Button size="sm" onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
      <Editor
        height="520px"
        theme="vs-dark"
        language={language}
        value={value}
        onChange={(next) => onChange(next ?? "")}
        options={{
          minimap: { enabled: true },
          wordWrap: "on",
          fontFamily: "JetBrains Mono, var(--font-geist-mono), monospace",
          fontSize: 13,
          automaticLayout: true
        }}
      />
    </div>
  );
}
''',
)

write(
    "src/components/server/FileManager.tsx",
    r'''
"use client";

import { useState } from "react";
import { File, Folder, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useFileManager } from "@/hooks/useFileManager";
import { FileEditor } from "@/components/server/FileEditor";

export function FileManager({ serverId, initialPath = "." }: { serverId: string; initialPath?: string }) {
  const [directory, setDirectory] = useState(initialPath);
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editorValue, setEditorValue] = useState("");
  const manager = useFileManager(serverId, directory);

  async function openFile(path: string) {
    const response = await fetch(`/api/servers/${serverId}/files?path=${encodeURIComponent(path)}&mode=read`);
    const payload = (await response.json()) as { ok: boolean; data?: { content: string }; error?: string };
    if (!payload.ok || !payload.data) {
      toast.error(payload.error ?? "Unable to read file");
      return;
    }
    setEditingPath(path);
    setEditorValue(payload.data.content);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="glass-card p-4">
        <div className="flex items-center gap-2">
          <Input value={directory} onChange={(event) => setDirectory(event.target.value)} />
          <Button variant="secondary" onClick={() => manager.files.refetch()}>
            Go
          </Button>
        </div>
        <div className="mt-4 space-y-1">
          {manager.files.isLoading ? <LoadingSpinner label="Reading directory" /> : null}
          {manager.files.isError ? <p className="text-sm text-ruby-200">{manager.files.error.message}</p> : null}
          {manager.files.data?.length === 0 ? <p className="text-sm text-white/45">This directory is empty.</p> : null}
          {manager.files.data?.map((entry) => (
            <div key={entry.path} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-white/[0.05]">
              {entry.type === "directory" ? <Folder className="h-4 w-4 text-ruby-300" /> : <File className="h-4 w-4 text-white/45" />}
              <button className="min-w-0 flex-1 truncate text-left" onClick={() => (entry.type === "directory" ? setDirectory(entry.path) : void openFile(entry.path))}>
                {entry.name}
              </button>
              <button
                className="rounded-md p-1 text-white/35 hover:bg-ruby-600/20 hover:text-ruby-100"
                aria-label={`Delete ${entry.name}`}
                onClick={() => manager.remove.mutate(entry.path)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </aside>
      <main className="min-w-0">
        {editingPath ? (
          <FileEditor
            path={editingPath}
            value={editorValue}
            onChange={setEditorValue}
            saving={manager.writeFile.isPending}
            onSave={() =>
              manager.writeFile.mutate(
                { path: editingPath, content: editorValue },
                { onSuccess: () => toast.success("File saved") }
              )
            }
          />
        ) : (
          <div className="glass-card grid min-h-[560px] place-items-center p-6 text-center">
            <div>
              <p className="text-xl font-semibold">Select a file to edit</p>
              <p className="mt-2 text-sm text-white/45">Ruby keeps reads and writes inside this server data directory.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
''',
)

write(
    "src/components/server/AiAssistant.tsx",
    r'''
"use client";

import { nanoid } from "nanoid";
import { Send } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAiStream } from "@/hooks/useAiStream";
import { useAiStore } from "@/store/aiStore";

export function AiAssistant({ serverId }: { serverId: string }) {
  const [input, setInput] = useState("");
  const { messages, addMessage, updateMessage, clearServer } = useAiStore();
  const current = useMemo(() => messages.filter((message) => message.serverId === serverId), [messages, serverId]);
  const stream = useAiStream(serverId);

  async function submit() {
    const text = input.trim();
    if (!text || stream.streaming) {
      return;
    }
    const userMessage = { id: nanoid(), serverId, role: "user" as const, content: text, createdAt: new Date().toISOString() };
    const assistantId = nanoid();
    addMessage(userMessage);
    addMessage({ id: assistantId, serverId, role: "assistant", content: "", createdAt: new Date().toISOString() });
    setInput("");
    let content = "";
    await stream.send(
      [...current, userMessage].map((message) => ({ role: message.role, content: message.content })),
      (token) => {
        content += token;
        updateMessage(assistantId, content);
      }
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <section className="glass-card flex min-h-[650px] flex-col p-0">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-semibold">Ruby AI Assistant</h2>
          <p className="text-sm text-white/45">Context-aware guidance with server metadata, logs, file tree, and configs injected per request.</p>
        </div>
        <div className="flex-1 space-y-4 overflow-auto p-5">
          {current.length === 0 ? <p className="text-sm text-white/45">Ask Ruby to diagnose lag, tune JVM flags, inspect plugins, or prepare safe config changes.</p> : null}
          {current.map((message) => (
            <article key={message.id} className={message.role === "user" ? "ml-auto max-w-2xl rounded-2xl bg-ruby-600 p-4" : "max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-4"}>
              <p className="whitespace-pre-wrap text-sm leading-6">{message.content || (message.role === "assistant" ? "Ruby is thinking..." : "")}</p>
            </article>
          ))}
          {stream.error ? <p className="rounded-lg border border-ruby-500/30 bg-ruby-600/10 p-3 text-sm text-ruby-100">{stream.error}</p> : null}
        </div>
        <form
          className="border-t border-white/10 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <Textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Fix my server lag and explain the safest changes..." />
          <div className="mt-3 flex justify-between">
            <Button type="button" variant="secondary" onClick={() => clearServer(serverId)}>
              Clear
            </Button>
            <Button type="submit" disabled={stream.streaming}>
              <Send className="h-4 w-4" />
              {stream.streaming ? "Streaming..." : "Send"}
            </Button>
          </div>
        </form>
      </section>
      <aside className="glass-card p-5">
        <h3 className="font-semibold">Injected context</h3>
        <ul className="mt-4 space-y-3 text-sm text-white/55">
          <li>Server status, type, version, CPU and RAM limits</li>
          <li>Latest stored stats snapshot</li>
          <li>Last 100 lines of latest.log</li>
          <li>Top two levels of the data directory</li>
          <li>server.properties and Paper/Spigot configs when present</li>
        </ul>
      </aside>
    </div>
  );
}
''',
)

write(
    "src/components/server/DiffViewer.tsx",
    r'''
"use client";

import { Diff2HtmlUI } from "diff2html/lib/ui/js/diff2html-ui-base";
import "diff2html/bundles/css/diff2html.min.css";
import { useEffect, useRef } from "react";

export function DiffViewer({ diff }: { diff: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    ref.current.innerHTML = "";
    const ui = new Diff2HtmlUI(ref.current, diff, {
      drawFileList: false,
      matching: "lines",
      outputFormat: "side-by-side"
    });
    ui.draw();
  }, [diff]);
  return <div className="overflow-auto rounded-xl border border-white/10 bg-white text-black" ref={ref} />;
}
''',
)

write(
    "src/components/server/PluginBrowser.tsx",
    r'''
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

type PluginResult = {
  id: string;
  source: "modrinth" | "curseforge";
  title: string;
  description: string;
  iconUrl: string | null;
  downloads: number;
  updatedAt: string;
};

export function PluginBrowser({ serverId }: { serverId: string }) {
  const [query, setQuery] = useState("luckperms");
  const results = useQuery({
    queryKey: ["plugins", serverId, query],
    queryFn: async () => {
      const response = await fetch(`/api/servers/${serverId}/plugins?q=${encodeURIComponent(query)}`);
      const payload = (await response.json()) as { ok: boolean; data?: PluginResult[]; error?: string };
      if (!payload.ok || !payload.data) {
        throw new Error(payload.error ?? "Plugin search failed");
      }
      return payload.data;
    }
  });
  return (
    <div className="space-y-4">
      <div className="glass-card flex gap-2 p-4">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Modrinth and CurseForge" />
        <Button onClick={() => results.refetch()}>Search</Button>
      </div>
      {results.isLoading ? <LoadingSpinner label="Searching plugin indexes" /> : null}
      {results.isError ? <p className="text-sm text-ruby-200">{results.error.message}</p> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {results.data?.map((plugin) => (
          <article key={`${plugin.source}:${plugin.id}`} className="glass-card p-5">
            <div className="flex gap-4">
              {plugin.iconUrl ? <img src={plugin.iconUrl} alt="" className="h-12 w-12 rounded-xl object-cover" /> : <div className="h-12 w-12 rounded-xl bg-ruby-600/30" />}
              <div>
                <h3 className="font-semibold">{plugin.title}</h3>
                <p className="text-xs uppercase tracking-[0.2em] text-ruby-300">{plugin.source}</p>
              </div>
            </div>
            <p className="mt-4 line-clamp-3 text-sm text-white/55">{plugin.description}</p>
            <div className="mt-5 flex items-center justify-between text-xs text-white/40">
              <span>{plugin.downloads.toLocaleString()} downloads</span>
              <Button size="sm" variant="secondary" disabled>
                <Download className="h-4 w-4" />
                Select version
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
''',
)

write(
    "src/components/server/BackupManager.tsx",
    r'''
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

type Backup = {
  id: string;
  name: string;
  type: string;
  status: string;
  sizeMb: number | null;
  createdAt: string;
  errorMsg: string | null;
};

async function request(serverId: string, init?: RequestInit): Promise<void> {
  const response = await fetch(`/api/servers/${serverId}/backups`, init);
  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error ?? "Backup request failed");
  }
}

export function BackupManager({ serverId }: { serverId: string }) {
  const [name, setName] = useState(`backup-${new Date().toISOString().slice(0, 16).replace("T", "-")}`);
  const queryClient = useQueryClient();
  const backups = useQuery({
    queryKey: ["backups", serverId],
    queryFn: async () => {
      const response = await fetch(`/api/servers/${serverId}/backups`);
      const payload = (await response.json()) as { ok: boolean; data?: Backup[]; error?: string };
      if (!payload.ok || !payload.data) {
        throw new Error(payload.error ?? "Unable to load backups");
      }
      return payload.data;
    }
  });
  const create = useMutation({
    mutationFn: () => request(serverId, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) }),
    onSuccess: () => {
      toast.success("Backup created");
      queryClient.invalidateQueries({ queryKey: ["backups", serverId] });
    }
  });
  return (
    <div className="space-y-4">
      <div className="glass-card flex flex-col gap-3 p-4 md:flex-row">
        <Input value={name} onChange={(event) => setName(event.target.value)} />
        <Button onClick={() => create.mutate()} disabled={create.isPending}>{create.isPending ? "Creating..." : "Create backup"}</Button>
      </div>
      <div className="glass-card divide-y divide-white/10 p-0">
        {backups.data?.length === 0 ? <p className="p-5 text-sm text-white/45">No backups yet.</p> : null}
        {backups.data?.map((backup) => (
          <div key={backup.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">{backup.name}</p>
              <p className="text-sm text-white/45">{backup.status} · {backup.sizeMb ? `${backup.sizeMb.toFixed(1)} MB` : "pending size"} · {new Date(backup.createdAt).toLocaleString()}</p>
              {backup.errorMsg ? <p className="mt-1 text-sm text-ruby-200">{backup.errorMsg}</p> : null}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm"><Download className="h-4 w-4" />Download</Button>
              <Button variant="secondary" size="sm"><RotateCcw className="h-4 w-4" />Restore</Button>
              <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" />Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
''',
)

write(
    "src/components/server/TaskScheduler.tsx",
    r'''
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Task = { id: string; name: string; type: string; schedule: string; isEnabled: boolean; lastRun: string | null; nextRun: string | null };

export function TaskScheduler({ serverId }: { serverId: string }) {
  const [name, setName] = useState("Daily restart");
  const [type, setType] = useState("RESTART");
  const [schedule, setSchedule] = useState("0 4 * * *");
  const queryClient = useQueryClient();
  const tasks = useQuery({
    queryKey: ["tasks", serverId],
    queryFn: async () => {
      const response = await fetch(`/api/servers/${serverId}/tasks`);
      const payload = (await response.json()) as { ok: boolean; data?: Task[]; error?: string };
      if (!payload.ok || !payload.data) {
        throw new Error(payload.error ?? "Unable to load tasks");
      }
      return payload.data;
    }
  });
  const create = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/servers/${serverId}/tasks`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, type, schedule, payload: {} })
      });
      if (!response.ok) {
        throw new Error("Unable to create task");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks", serverId] })
  });
  return (
    <div className="space-y-4">
      <div className="glass-card grid gap-3 p-4 md:grid-cols-[1fr_180px_180px_auto]">
        <Input value={name} onChange={(event) => setName(event.target.value)} />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {["RESTART", "BACKUP", "COMMAND", "ANNOUNCE", "START", "STOP"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input value={schedule} onChange={(event) => setSchedule(event.target.value)} />
        <Button onClick={() => create.mutate()} disabled={create.isPending}>Add task</Button>
      </div>
      <div className="glass-card divide-y divide-white/10 p-0">
        {tasks.data?.length === 0 ? <p className="p-5 text-sm text-white/45">No scheduled tasks yet.</p> : null}
        {tasks.data?.map((task) => (
          <div key={task.id} className="grid gap-2 p-5 text-sm md:grid-cols-5">
            <span className="font-medium">{task.name}</span>
            <span className="text-white/55">{task.type}</span>
            <span className="font-mono text-ruby-200">{task.schedule}</span>
            <span className="text-white/45">{task.lastRun ? new Date(task.lastRun).toLocaleString() : "Never run"}</span>
            <span className={task.isEnabled ? "text-emerald-300" : "text-white/35"}>{task.isEnabled ? "Enabled" : "Disabled"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
''',
)

write(
    "src/components/server/MonitoringCharts.tsx",
    r'''
"use client";

import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { timestamp: string; cpuPercent: number; ramMb: number; playerCount: number; tps: number | null };

export function MonitoringCharts({ serverId }: { serverId: string }) {
  const points = useQuery({
    queryKey: ["stats-history", serverId],
    refetchInterval: 10_000,
    queryFn: async () => {
      const response = await fetch(`/api/servers/${serverId}/stats`);
      const payload = (await response.json()) as { ok: boolean; data?: Point[]; error?: string };
      if (!payload.ok || !payload.data) {
        throw new Error(payload.error ?? "Unable to load stats");
      }
      return payload.data.map((point) => ({ ...point, label: new Date(point.timestamp).toLocaleTimeString() }));
    }
  });
  const data = points.data ?? [];
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="glass-card p-5">
        <h3 className="font-semibold">CPU and RAM</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="rubyCpu" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e11d48" stopOpacity={0.6} /><stop offset="100%" stopColor="#e11d48" stopOpacity={0.04} /></linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.35)" />
              <YAxis stroke="rgba(255,255,255,0.35)" />
              <Tooltip contentStyle={{ background: "#111114", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
              <Area type="monotone" dataKey="cpuPercent" stroke="#fb7185" fill="url(#rubyCpu)" />
              <Area type="monotone" dataKey="ramMb" stroke="#fecdd3" fill="rgba(254,205,211,0.08)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="glass-card p-5">
        <h3 className="font-semibold">TPS</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.35)" />
              <YAxis domain={[0, 20]} stroke="rgba(255,255,255,0.35)" />
              <Tooltip contentStyle={{ background: "#111114", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
              <Line type="monotone" dataKey="tps" stroke="#34d399" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
''',
)

write(
    "src/components/server/WorldManager.tsx",
    r'''
"use client";

import { useQuery } from "@tanstack/react-query";
import { Globe2 } from "lucide-react";

type World = { id: string; worldName: string; sizeMb: number; createdAt: string };

export function WorldManager({ serverId }: { serverId: string }) {
  const worlds = useQuery({
    queryKey: ["worlds", serverId],
    queryFn: async () => {
      const response = await fetch(`/api/servers/${serverId}/worlds`);
      const payload = (await response.json()) as { ok: boolean; data?: World[]; error?: string };
      if (!payload.ok || !payload.data) {
        throw new Error(payload.error ?? "Unable to load worlds");
      }
      return payload.data;
    }
  });
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {worlds.data?.length === 0 ? <p className="text-sm text-white/45">No world snapshots have been captured yet.</p> : null}
      {worlds.data?.map((world) => (
        <article key={world.id} className="glass-card p-5">
          <Globe2 className="h-8 w-8 text-ruby-400" />
          <h3 className="mt-4 font-semibold">{world.worldName}</h3>
          <p className="mt-1 text-sm text-white/45">{world.sizeMb.toFixed(1)} MB · {new Date(world.createdAt).toLocaleString()}</p>
        </article>
      ))}
    </div>
  );
}
''',
)

write(
    "src/components/server/LogViewer.tsx",
    r'''
"use client";

import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";

export function LogViewer({ serverId }: { serverId: string }) {
  const [filter, setFilter] = useState("");
  const logs = useQuery({
    queryKey: ["logs", serverId],
    refetchInterval: 5000,
    queryFn: async () => {
      const response = await fetch(`/api/servers/${serverId}/files?path=${encodeURIComponent("logs/latest.log")}&mode=read`);
      const payload = (await response.json()) as { ok: boolean; data?: { content: string }; error?: string };
      if (!payload.ok || !payload.data) {
        return "";
      }
      return payload.data.content;
    }
  });
  const lines = useMemo(() => (logs.data ?? "").split(/\r?\n/).filter((line) => line.toLowerCase().includes(filter.toLowerCase())), [logs.data, filter]);
  return (
    <div className="glass-card p-4">
      <Input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter log lines..." />
      <pre className="mt-4 max-h-[70vh] overflow-auto rounded-xl bg-black p-4 font-mono text-xs leading-6 text-white/75">
        {lines.length ? lines.join("\n") : "No matching log lines."}
      </pre>
    </div>
  );
}
''',
)

write(
    "src/components/server/ServerCreationWizard.tsx",
    r'''
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ServerType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(2).max(64),
  description: z.string().max(280).optional(),
  type: z.nativeEnum(ServerType),
  version: z.string().min(2),
  ramMb: z.coerce.number().min(512).max(32768),
  cpuPercent: z.coerce.number().min(10).max(800),
  diskGb: z.coerce.number().min(1).max(2048),
  port: z.coerce.number().int().min(1).max(65535).optional()
});

type FormValues = z.infer<typeof schema>;

export function ServerCreationWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      type: ServerType.PAPER,
      version: "1.21.4",
      ramMb: 2048,
      cpuPercent: 100,
      diskGb: 20
    }
  });
  const values = form.watch();
  async function submit(data: FormValues) {
    const response = await fetch("/api/servers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...data, jvmFlags: [] })
    });
    const payload = (await response.json()) as { ok: boolean; data?: { id: string }; error?: string };
    if (!payload.ok || !payload.data) {
      toast.error(payload.error ?? "Unable to create server");
      return;
    }
    toast.success("Server created");
    router.push(`/servers/${payload.data.id}`);
  }
  return (
    <form className="glass-card p-6" onSubmit={form.handleSubmit(submit)}>
      <div className="mb-6 flex gap-2">
        {["Basic", "Software", "Resources", "Review"].map((label, index) => (
          <button key={label} type="button" onClick={() => setStep(index)} className={`rounded-full px-3 py-1 text-xs ${step === index ? "bg-ruby-600 text-white" : "bg-white/10 text-white/45"}`}>{label}</button>
        ))}
      </div>
      {step === 0 ? (
        <div className="grid gap-4">
          <Label>Name<Input className="mt-2" {...form.register("name")} /></Label>
          <Label>Description<Textarea className="mt-2" {...form.register("description")} /></Label>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Label>Server Type
            <Select value={values.type} onValueChange={(value) => form.setValue("type", value as ServerType)}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>{Object.values(ServerType).map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
            </Select>
          </Label>
          <Label>Minecraft Version<Input className="mt-2" {...form.register("version")} /></Label>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Label>RAM MB<Input className="mt-2" type="number" {...form.register("ramMb")} /></Label>
          <Label>CPU %<Input className="mt-2" type="number" {...form.register("cpuPercent")} /></Label>
          <Label>Disk GB<Input className="mt-2" type="number" {...form.register("diskGb")} /></Label>
          <Label>Port<Input className="mt-2" type="number" {...form.register("port")} placeholder="Auto" /></Label>
        </div>
      ) : null}
      {step === 3 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/65">
          <p className="text-lg font-semibold text-white">{values.name || "Unnamed Server"}</p>
          <p className="mt-2">{values.type} {values.version} · {values.ramMb} MB RAM · {values.cpuPercent}% CPU · {values.diskGb} GB disk</p>
          <p className="mt-4">Ruby will allocate a port, create an isolated Docker container, mount the server volume, and persist the configuration in PostgreSQL.</p>
        </div>
      ) : null}
      <div className="mt-8 flex justify-between">
        <Button type="button" variant="secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Back</Button>
        {step < 3 ? <Button type="button" onClick={() => setStep(step + 1)}>Next</Button> : <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Creating..." : "Create Server"}</Button>}
      </div>
    </form>
  );
}
''',
)

write(
    "src/components/dashboard/DashboardClient.tsx",
    r'''
"use client";

import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { GlobalStats } from "@/components/dashboard/GlobalStats";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/layout/PageHeader";
import type { DashboardStats } from "@/types/api";

async function fetchDashboard(): Promise<DashboardStats> {
  const response = await fetch("/api/dashboard");
  const payload = (await response.json()) as { ok: boolean; data?: DashboardStats; error?: string };
  if (!payload.ok || !payload.data) {
    throw new Error(payload.error ?? "Unable to load dashboard");
  }
  return payload.data;
}

export function DashboardClient() {
  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: fetchDashboard, refetchInterval: 5000 });
  if (dashboard.isLoading) {
    return <LoadingSpinner label="Loading command deck" />;
  }
  if (dashboard.isError) {
    return <p className="rounded-xl border border-ruby-500/30 bg-ruby-600/10 p-4 text-ruby-100">{dashboard.error.message}</p>;
  }
  const data = dashboard.data;
  return (
    <div>
      <PageHeader eyebrow="Command deck" title="Control Beyond Limits" description="Live infrastructure overview for Minecraft servers, web deployments, users, resources, and audit events." />
      <GlobalStats stats={data} />
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="glass-card p-5">
          <h2 className="text-lg font-semibold">Resource overview</h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.resourceSeries.map((point) => ({ ...point, label: new Date(point.timestamp).toLocaleTimeString() }))}>
                <defs>
                  <linearGradient id="resourceRuby" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e11d48" stopOpacity={0.7} /><stop offset="100%" stopColor="#e11d48" stopOpacity={0.03} /></linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.35)" />
                <YAxis stroke="rgba(255,255,255,0.35)" />
                <Tooltip contentStyle={{ background: "#111114", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
                <Area type="monotone" dataKey="cpuPercent" stroke="#fb7185" fill="url(#resourceRuby)" />
                <Area type="monotone" dataKey="ramMb" stroke="#fecdd3" fill="rgba(254,205,211,0.08)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <ActivityFeed entries={data.activity} />
      </div>
    </div>
  );
}
''',
)

write(
    "src/components/dashboard/ServerList.tsx",
    r'''
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { ServerCard } from "@/components/dashboard/ServerCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ServerSummary } from "@/types";

async function fetchServers(): Promise<ServerSummary[]> {
  const response = await fetch("/api/servers");
  const payload = (await response.json()) as { ok: boolean; data?: ServerSummary[]; error?: string };
  if (!payload.ok || !payload.data) {
    throw new Error(payload.error ?? "Unable to load servers");
  }
  return payload.data;
}

export function ServerList() {
  const [search, setSearch] = useState("");
  const servers = useQuery({ queryKey: ["servers"], queryFn: fetchServers, refetchInterval: 10_000 });
  const filtered = useMemo(
    () => (servers.data ?? []).filter((server) => `${server.name} ${server.type} ${server.version}`.toLowerCase().includes(search.toLowerCase())),
    [servers.data, search]
  );
  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, type, version..." />
        <Button asChild>
          <Link href="/servers/new"><Plus className="h-4 w-4" />New server</Link>
        </Button>
      </div>
      {servers.isLoading ? <LoadingSpinner label="Loading servers" /> : null}
      {servers.isError ? <p className="rounded-xl border border-ruby-500/30 bg-ruby-600/10 p-4 text-ruby-100">{servers.error.message}</p> : null}
      {filtered.length === 0 && !servers.isLoading ? <p className="glass-card p-8 text-center text-white/50">No servers match this view.</p> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((server) => <ServerCard key={server.id} server={server} />)}
      </div>
    </div>
  );
}
''',
)

write(
    "src/app/(dashboard)/layout.tsx",
    r'''
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="md:pl-72">
        <TopBar />
        <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
''',
)

write(
    "src/app/(dashboard)/page.tsx",
    r'''
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default function DashboardPage() {
  return <DashboardClient />;
}
''',
)

write(
    "src/app/(dashboard)/servers/page.tsx",
    r'''
import { ServerList } from "@/components/dashboard/ServerList";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ServersPage() {
  return (
    <>
      <PageHeader eyebrow="Minecraft" title="Servers" description="Search, monitor, and control every isolated Docker-backed Minecraft server." />
      <ServerList />
    </>
  );
}
''',
)

write(
    "src/app/(dashboard)/servers/new/page.tsx",
    r'''
import { PageHeader } from "@/components/layout/PageHeader";
import { ServerCreationWizard } from "@/components/server/ServerCreationWizard";

export default function NewServerPage() {
  return (
    <>
      <PageHeader eyebrow="Provision" title="Create server" description="Configure software, resources, ports, and Docker isolation in one guided flow." />
      <ServerCreationWizard />
    </>
  );
}
''',
)

write(
    "src/components/server/ServerSubnav.tsx",
    r'''
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  ["", "Overview"],
  ["console", "Console"],
  ["files", "Files"],
  ["ai", "Ruby AI"],
  ["plugins", "Plugins"],
  ["backups", "Backups"],
  ["tasks", "Tasks"],
  ["monitoring", "Monitoring"],
  ["worlds", "Worlds"],
  ["logs", "Logs"],
  ["users", "Users"],
  ["settings", "Settings"]
] as const;

export function ServerSubnav({ serverId }: { serverId: string }) {
  const pathname = usePathname();
  return (
    <nav className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-2">
      {tabs.map(([segment, label]) => {
        const href = `/servers/${serverId}${segment ? `/${segment}` : ""}`;
        const active = pathname === href;
        return <Link key={segment || "overview"} href={href} className={cn("shrink-0 rounded-xl px-3 py-2 text-sm transition-colors", active ? "bg-ruby-600 text-white" : "text-white/50 hover:bg-white/10 hover:text-white")}>{label}</Link>;
      })}
    </nav>
  );
}
''',
)

write(
    "src/app/(dashboard)/servers/[serverId]/layout.tsx",
    r'''
import { ServerSubnav } from "@/components/server/ServerSubnav";

export default async function ServerLayout({ children, params }: { children: React.ReactNode; params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;
  return (
    <div>
      <ServerSubnav serverId={serverId} />
      {children}
    </div>
  );
}
''',
)

write(
    "src/app/(dashboard)/servers/[serverId]/page.tsx",
    r'''
import { notFound } from "next/navigation";
import { Cpu, HardDrive, MemoryStick, Network } from "lucide-react";
import { GlassCard } from "@/components/common/GlassCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";

export default async function ServerOverviewPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;
  const server = await prisma.server.findUnique({ where: { id: serverId }, include: { stats: { orderBy: { timestamp: "desc" }, take: 1 } } });
  if (!server) {
    notFound();
  }
  const latest = server.stats[0];
  return (
    <>
      <PageHeader eyebrow={server.type} title={server.name} description={server.description ?? `Minecraft ${server.version} on port ${server.port}`} actions={<StatusBadge status={server.status} />} />
      <div className="grid gap-4 md:grid-cols-4">
        <GlassCard><MemoryStick className="h-5 w-5 text-ruby-400" /><p className="mt-4 text-2xl font-semibold">{latest?.ramMb.toFixed(0) ?? 0} MB</p><p className="text-sm text-white/45">RAM used of {server.ramMb} MB</p></GlassCard>
        <GlassCard><Cpu className="h-5 w-5 text-ruby-400" /><p className="mt-4 text-2xl font-semibold">{latest?.cpuPercent.toFixed(1) ?? 0}%</p><p className="text-sm text-white/45">CPU usage</p></GlassCard>
        <GlassCard><Network className="h-5 w-5 text-ruby-400" /><p className="mt-4 text-2xl font-semibold">{latest?.playerCount ?? 0}</p><p className="text-sm text-white/45">Players online</p></GlassCard>
        <GlassCard><HardDrive className="h-5 w-5 text-ruby-400" /><p className="mt-4 text-2xl font-semibold">{server.diskGb} GB</p><p className="text-sm text-white/45">Disk quota</p></GlassCard>
      </div>
    </>
  );
}
''',
)

write(
    "src/app/(dashboard)/servers/[serverId]/console/page.tsx",
    r'''
import { Console } from "@/components/server/Console";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function ServerConsolePage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;
  return (
    <>
      <PageHeader eyebrow="Terminal" title="Live console" description="Attach to Docker stdout/stdin through the Ruby socket bridge." />
      <Console serverId={serverId} />
    </>
  );
}
''',
)

write(
    "src/app/(dashboard)/servers/[serverId]/files/page.tsx",
    r'''
import { FileManager } from "@/components/server/FileManager";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function ServerFilesPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;
  return (
    <>
      <PageHeader eyebrow="Storage" title="File manager" description="Browse, edit, delete, and write files inside the server volume with path traversal protection." />
      <FileManager serverId={serverId} />
    </>
  );
}
''',
)

write(
    "src/app/(dashboard)/servers/[serverId]/files/[...path]/page.tsx",
    r'''
import { FileManager } from "@/components/server/FileManager";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function DeepFilesPage({ params }: { params: Promise<{ serverId: string; path: string[] }> }) {
  const { serverId, path } = await params;
  return (
    <>
      <PageHeader eyebrow="Storage" title="File manager" description="Deep path navigation inside this server data volume." />
      <FileManager serverId={serverId} initialPath={path.join("/")} />
    </>
  );
}
''',
)

write(
    "src/app/(dashboard)/servers/[serverId]/ai/page.tsx",
    r'''
import { AiAssistant } from "@/components/server/AiAssistant";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function ServerAiPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;
  return (
    <>
      <PageHeader eyebrow="Ruby intelligence" title="AI assistant" description="Streaming operational help with server-aware context injection." />
      <AiAssistant serverId={serverId} />
    </>
  );
}
''',
)

server_page_components = {
    "plugins": ("PluginBrowser", "Plugin browser", "Search Modrinth and CurseForge for compatible plugins and mods.", "plugins"),
    "backups": ("BackupManager", "Backups", "Create, inspect, download, restore, and delete server backups.", "backups"),
    "tasks": ("TaskScheduler", "Task scheduler", "Schedule restarts, backups, announcements, commands, starts, and stops.", "tasks"),
    "monitoring": ("MonitoringCharts", "Monitoring", "CPU, RAM, TPS, players, and network history from Docker and stored snapshots.", "monitoring"),
    "worlds": ("WorldManager", "Worlds", "Manage captured world snapshots and world data operations.", "worlds"),
    "logs": ("LogViewer", "Logs", "Filter and inspect the latest server log with live refresh.", "logs"),
}

for segment, (component, title, description, file_name) in server_page_components.items():
    write(
        f"src/app/(dashboard)/servers/[serverId]/{segment}/page.tsx",
        f'''
import {{ {component} }} from "@/components/server/{component}";
import {{ PageHeader }} from "@/components/layout/PageHeader";

export default async function {component}Page({{ params }}: {{ params: Promise<{{ serverId: string }}> }}) {{
  const {{ serverId }} = await params;
  return (
    <>
      <PageHeader eyebrow="Server" title="{title}" description="{description}" />
      <{component} serverId={{serverId}} />
    </>
  );
}}
''',
    )

write(
    "src/app/(dashboard)/servers/[serverId]/users/page.tsx",
    r'''
import { ServerPermission } from "@prisma/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/common/GlassCard";
import { prisma } from "@/lib/prisma";

export default async function ServerUsersPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;
  const grants = await prisma.serverUser.findMany({ where: { serverId }, include: { user: true }, orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageHeader eyebrow="Access" title="Server users" description="Per-server permission grants with RBAC-aware enforcement on API routes." />
      <div className="glass-card divide-y divide-white/10 p-0">
        {grants.length === 0 ? <p className="p-5 text-sm text-white/45">No delegated users yet. Admins and superadmins retain global access.</p> : null}
        {grants.map((grant) => (
          <div key={grant.id} className="grid gap-2 p-5 md:grid-cols-[1fr_2fr]">
            <div>
              <p className="font-semibold">{grant.user.username}</p>
              <p className="text-sm text-white/45">{grant.user.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {grant.permissions.map((permission) => <span key={permission} className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-white/60">{permission}</span>)}
            </div>
          </div>
        ))}
      </div>
      <GlassCard className="mt-4">
        <p className="text-sm text-white/55">Available permissions: {Object.values(ServerPermission).join(", ")}</p>
      </GlassCard>
    </>
  );
}
''',
)

write(
    "src/app/(dashboard)/servers/[serverId]/settings/page.tsx",
    r'''
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/common/GlassCard";
import { prisma } from "@/lib/prisma";

export default async function ServerSettingsPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;
  const server = await prisma.server.findUniqueOrThrow({ where: { id: serverId } });
  return (
    <>
      <PageHeader eyebrow="Configuration" title="Server settings" description="Container, resource, backup, JVM, and startup configuration." />
      <GlassCard>
        <dl className="grid gap-4 md:grid-cols-2">
          {[
            ["Container", server.containerName],
            ["Port", String(server.port)],
            ["RAM", `${server.ramMb} MB`],
            ["CPU", `${server.cpuPercent}%`],
            ["Disk", `${server.diskGb} GB`],
            ["Data path", server.dataPath],
            ["Auto backup", server.autoBackup ? "Enabled" : "Disabled"],
            ["Retention", `${server.backupRetention} backups`]
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <dt className="text-xs uppercase tracking-[0.2em] text-white/35">{label}</dt>
              <dd className="mt-2 break-all text-sm text-white/75">{value}</dd>
            </div>
          ))}
        </dl>
      </GlassCard>
    </>
  );
}
''',
)

write(
    "src/app/(dashboard)/web-hosting/page.tsx",
    r'''
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function WebHostingPage() {
  const sites = await prisma.website.findMany({ orderBy: { updatedAt: "desc" }, include: { domains: true } });
  return (
    <>
      <PageHeader eyebrow="Web" title="Web hosting" description="Static, Node.js, and PHP sites with domains, SSL, environments, Git deploys, and per-site databases." actions={<Button asChild><Link href="/web-hosting/new"><Plus className="h-4 w-4" />New site</Link></Button>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sites.length === 0 ? <p className="glass-card p-8 text-white/45">No websites yet.</p> : null}
        {sites.map((site) => (
          <Link key={site.id} href={`/web-hosting/${site.id}`} className="glass-card p-5 transition-transform hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div><h3 className="font-semibold">{site.name}</h3><p className="mt-1 text-sm text-white/45">{site.type} · port {site.port}</p></div>
              <StatusBadge status={site.status} />
            </div>
            <p className="mt-5 text-sm text-white/50">{site.domains[0]?.domain ?? "No domain attached"}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
''',
)

write(
    "src/app/(dashboard)/web-hosting/new/page.tsx",
    r'''
import { PageHeader } from "@/components/layout/PageHeader";
import { WebsiteCreationForm } from "@/components/web/WebsiteCreationForm";

export default function NewWebsitePage() {
  return (
    <>
      <PageHeader eyebrow="Deploy" title="Create website" description="Provision an isolated website runtime with ports, commands, domain metadata, and environment support." />
      <WebsiteCreationForm />
    </>
  );
}
''',
)

write(
    "src/components/web/WebsiteCreationForm.tsx",
    r'''
"use client";

import { SiteType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function WebsiteCreationForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<SiteType>(SiteType.STATIC);
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const response = await fetch("/api/web-hosting", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, type, domain: domain || undefined })
    });
    const payload = (await response.json()) as { ok: boolean; data?: { id: string }; error?: string };
    setBusy(false);
    if (!payload.ok || !payload.data) {
      toast.error(payload.error ?? "Unable to create website");
      return;
    }
    toast.success("Website created");
    router.push(`/web-hosting/${payload.data.id}`);
  }
  return (
    <form className="glass-card grid gap-4 p-6" onSubmit={submit}>
      <Label>Name<Input className="mt-2" value={name} onChange={(event) => setName(event.target.value)} required /></Label>
      <Label>Type<Select value={type} onValueChange={(value) => setType(value as SiteType)}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent>{Object.values(SiteType).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></Label>
      <Label>Initial domain<Input className="mt-2" value={domain} onChange={(event) => setDomain(event.target.value)} placeholder="play.example.com" /></Label>
      <Button disabled={busy}>{busy ? "Creating..." : "Create website"}</Button>
    </form>
  );
}
''',
)

web_pages = {
    "": ("Site overview", "Runtime, domains, deployments, and resource configuration."),
    "files": ("Site files", "Browse and manage website assets in the site volume."),
    "domains": ("Domains and SSL", "Verify DNS, attach domains, and track certificate state."),
    "env": ("Environment variables", "Manage encrypted key-value runtime configuration."),
    "database": ("Site database", "Per-site database credentials and capacity."),
    "git": ("Git integration", "Repository settings, branch, deploy history, and webhook state."),
    "settings": ("Site settings", "Build, start, output, container, and ownership configuration."),
}

for segment, (title, description) in web_pages.items():
    path_part = f"{segment}/" if segment else ""
    write(
        f"src/app/(dashboard)/web-hosting/[siteId]/{path_part}page.tsx",
        f'''
import {{ PageHeader }} from "@/components/layout/PageHeader";
import {{ GlassCard }} from "@/components/common/GlassCard";
import {{ prisma }} from "@/lib/prisma";

export default async function SitePage({{ params }}: {{ params: Promise<{{ siteId: string }}> }}) {{
  const {{ siteId }} = await params;
  const site = await prisma.website.findUniqueOrThrow({{ where: {{ id: siteId }}, include: {{ domains: true, envVars: true, databases: true, deployments: {{ orderBy: {{ createdAt: "desc" }}, take: 10 }} }} }});
  return (
    <>
      <PageHeader eyebrow={{site.type}} title="{title}" description="{description}" />
      <GlassCard>
        <div className="grid gap-4 md:grid-cols-2">
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/65">Name: <span className="font-semibold text-white">{{site.name}}</span></p>
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/65">Status: <span className="font-semibold text-white">{{site.status}}</span></p>
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/65">Port: <span className="font-semibold text-white">{{site.port}}</span></p>
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/65">Domains: <span className="font-semibold text-white">{{site.domains.length}}</span></p>
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/65">Env vars: <span className="font-semibold text-white">{{site.envVars.length}}</span></p>
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/65">Deployments: <span className="font-semibold text-white">{{site.deployments.length}}</span></p>
        </div>
      </GlassCard>
    </>
  );
}}
''',
    )

write(
    "src/app/(dashboard)/admin/users/page.tsx",
    r'''
import { Role } from "@prisma/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageHeader eyebrow="Admin" title="Users" description="Manage roles, status, 2FA posture, and account lifecycle." />
      <div className="glass-card overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-white/45"><tr><th className="p-4">User</th><th>Role</th><th>2FA</th><th>Last login</th><th>Status</th></tr></thead>
          <tbody className="divide-y divide-white/10">
            {users.map((user) => (
              <tr key={user.id}><td className="p-4"><p className="font-semibold">{user.username}</p><p className="text-white/45">{user.email}</p></td><td>{user.role}</td><td>{user.totpEnabled ? "Enabled" : "Disabled"}</td><td>{user.lastLoginAt?.toLocaleString() ?? "Never"}</td><td>{user.isActive ? "Active" : "Suspended"}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-white/45">Available roles: {Object.values(Role).join(", ")}</p>
    </>
  );
}
''',
)

write(
    "src/app/(dashboard)/admin/audit/page.tsx",
    r'''
import { PageHeader } from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";

export default async function AuditPage() {
  const entries = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { user: true } });
  return (
    <>
      <PageHeader eyebrow="Admin" title="Audit log" description="Chronological trail of authentication, server, file, backup, and admin events." />
      <div className="glass-card divide-y divide-white/10 p-0">
        {entries.map((entry) => (
          <div key={entry.id} className="grid gap-2 p-5 text-sm md:grid-cols-[180px_1fr_180px]">
            <span className="text-white/45">{entry.createdAt.toLocaleString()}</span>
            <span><span className="font-medium">{entry.user?.username ?? "System"}</span> · <span className="font-mono text-ruby-200">{entry.action}</span></span>
            <span className="text-white/45">{entry.targetType ?? "Panel"}</span>
          </div>
        ))}
      </div>
    </>
  );
}
''',
)

for admin_segment, title, description in [
    ("api-keys", "API keys", "Create and revoke hashed API keys for external integrations."),
    ("notifications", "Notifications", "Configure Discord, Telegram, and email notification targets."),
    ("settings", "Panel settings", "Global product name, setup state, theme, and operational settings."),
]:
    write(
        f"src/app/(dashboard)/admin/{admin_segment}/page.tsx",
        f'''
import {{ PageHeader }} from "@/components/layout/PageHeader";
import {{ GlassCard }} from "@/components/common/GlassCard";
import {{ prisma }} from "@/lib/prisma";

export default async function AdminPage() {{
  const settings = await prisma.panelSetting.findMany({{ orderBy: {{ key: "asc" }} }});
  return (
    <>
      <PageHeader eyebrow="Admin" title="{title}" description="{description}" />
      <GlassCard>
        <div className="grid gap-3">
          {{settings.map((setting) => (
            <div key={{setting.id}} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
              <span className="font-mono text-ruby-200">{{setting.key}}</span>
              <span className="text-white/60">{{setting.value}}</span>
            </div>
          ))}}
        </div>
      </GlassCard>
    </>
  );
}}
''',
    )

write(
    "src/app/(dashboard)/profile/page.tsx",
    r'''
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/common/GlassCard";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session?.user.id } });
  const secret = user.totpSecret ?? authenticator.generateSecret();
  const otpauth = authenticator.keyuri(user.email, "Ruby Panel", secret);
  const qr = await QRCode.toDataURL(otpauth);
  return (
    <>
      <PageHeader eyebrow="Account" title="Profile and 2FA" description="Manage account security, authenticator setup, and recovery posture." />
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h2 className="text-lg font-semibold">{user.username}</h2>
          <p className="mt-1 text-sm text-white/45">{user.email}</p>
          <p className="mt-4 text-sm text-white/60">Role: {user.role}</p>
          <p className="mt-1 text-sm text-white/60">2FA: {user.totpEnabled ? "Enabled" : "Not enabled"}</p>
        </GlassCard>
        <GlassCard>
          <h2 className="text-lg font-semibold">Authenticator setup</h2>
          <p className="mt-2 text-sm text-white/55">Scan this QR code, then verify a 6-digit token through the profile API before enabling 2FA.</p>
          <img src={qr} alt="TOTP QR code" className="mt-4 h-48 w-48 rounded-xl bg-white p-2" />
          <p className="mt-3 break-all font-mono text-xs text-white/45">{secret}</p>
        </GlassCard>
      </div>
    </>
  );
}
''',
)

write(
    "src/app/(auth)/setup/page.tsx",
    r'''
import { notFound } from "next/navigation";
import { SetupForm } from "@/components/auth/SetupForm";
import { prisma } from "@/lib/prisma";

export default async function SetupPage() {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    notFound();
  }
  return <SetupForm />;
}
''',
)

write(
    "src/components/auth/SetupForm.tsx",
    r'''
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email(),
    password: z.string().min(12),
    confirmPassword: z.string().min(12),
    panelName: z.string().min(2),
    acceptTerms: z.boolean().refine(Boolean, "Terms must be accepted")
  })
  .refine((value) => value.password === value.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

type FormValues = z.infer<typeof schema>;

export function SetupForm() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", email: "", password: "", confirmPassword: "", panelName: "Ruby Panel", acceptTerms: false }
  });
  const password = form.watch("password");
  const strength = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z0-9]/, /.{12,}/].filter((test) => test.test(password)).length;
  async function submit(values: FormValues) {
    const response = await fetch("/api/setup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values)
    });
    const payload = (await response.json()) as { ok: boolean; error?: string };
    if (!payload.ok) {
      toast.error(payload.error ?? "Setup failed");
      return;
    }
    const login = await signIn("credentials", { email: values.email, password: values.password, redirect: false });
    if (login?.error) {
      toast.error("Setup finished, but automatic login failed. Please sign in.");
      router.push("/login");
      return;
    }
    router.push("/");
  }
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      <div className="ruby-grid absolute inset-0 opacity-80" />
      <form className="glass-card relative w-full max-w-xl p-8" onSubmit={form.handleSubmit(submit)}>
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ruby-600 text-xl font-bold shadow-ruby">R</div>
          <h1 className="mt-5 text-3xl font-semibold">Welcome. Let&apos;s get started.</h1>
          <p className="mt-2 text-sm text-white/50">Create the first super admin and lock in the panel identity.</p>
        </div>
        <div className="grid gap-4">
          <Label>Username<Input className="mt-2" {...form.register("username")} /></Label>
          <Label>Email<Input className="mt-2" type="email" {...form.register("email")} /></Label>
          <Label>Password<Input className="mt-2" type="password" {...form.register("password")} /></Label>
          <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-ruby-600 transition-all" style={{ width: `${strength * 20}%` }} /></div>
          <Label>Confirm Password<Input className="mt-2" type="password" {...form.register("confirmPassword")} /></Label>
          <Label>Panel Name<Input className="mt-2" {...form.register("panelName")} /></Label>
          <label className="flex items-center gap-3 text-sm text-white/65"><input type="checkbox" {...form.register("acceptTerms")} /> I accept responsibility for securing this panel.</label>
        </div>
        <Button className="mt-8 w-full" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Creating..." : "Create super admin"}</Button>
      </form>
    </main>
  );
}
''',
)

write(
    "src/app/(auth)/login/page.tsx",
    r'''
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return <LoginForm />;
}
''',
)

write(
    "src/components/auth/LoginForm.tsx",
    r'''
"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [needsTotp, setNeedsTotp] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await signIn("credentials", { email, password, totpCode: needsTotp ? totpCode : undefined, remember: remember ? "true" : "false", redirect: false });
    setBusy(false);
    if (result?.error) {
      if (result.error.includes("TOTP_REQUIRED")) {
        setNeedsTotp(true);
        return;
      }
      setError(result.error.replace("CredentialsSignin", "Invalid email, password, or authenticator code"));
      return;
    }
    router.push(search.get("callbackUrl") ?? "/");
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      <div className="ruby-grid absolute inset-0 opacity-70" />
      <form className="glass-card relative w-full max-w-md p-8" onSubmit={submit}>
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ruby-600 text-xl font-bold shadow-ruby">R</div>
          <h1 className="mt-5 text-3xl font-semibold">Ruby Panel</h1>
          <p className="mt-2 text-sm text-white/50">{needsTotp ? "Enter your authenticator code to continue." : "Sign in to the command deck."}</p>
        </div>
        <div className="grid gap-4">
          <Label>Email<Input className="mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={needsTotp} required /></Label>
          <Label>Password<Input className="mt-2" type="password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={needsTotp} required /></Label>
          {needsTotp ? <Label>2FA Code<Input className="mt-2" inputMode="numeric" value={totpCode} onChange={(event) => setTotpCode(event.target.value)} required /></Label> : null}
          <label className="flex items-center gap-3 text-sm text-white/60"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember this device</label>
          {error ? <p className="rounded-lg border border-ruby-500/30 bg-ruby-600/10 p-3 text-sm text-ruby-100">{error}</p> : null}
        </div>
        <Button className="mt-8 w-full" disabled={busy}>{busy ? "Checking..." : needsTotp ? "Verify and enter" : "Sign in"}</Button>
      </form>
    </main>
  );
}
''',
)

write(
    "src/app/(auth)/reset-password/page.tsx",
    r'''
import { PasswordResetForm } from "@/components/auth/PasswordResetForm";

export default function ResetPasswordPage() {
  return <PasswordResetForm />;
}
''',
)

write(
    "src/components/auth/PasswordResetForm.tsx",
    r'''
"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordResetForm() {
  const search = useSearchParams();
  const token = search.get("token");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const response = await fetch("/api/auth/password-reset", {
      method: token ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(token ? { token, password } : { email })
    });
    const payload = (await response.json()) as { ok: boolean; error?: string };
    setBusy(false);
    if (!payload.ok) {
      toast.error(payload.error ?? "Password reset failed");
      return;
    }
    toast.success(token ? "Password updated" : "If the account exists, a reset email was sent");
  }
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form className="glass-card w-full max-w-md p-8" onSubmit={submit}>
        <h1 className="text-3xl font-semibold">{token ? "Choose a new password" : "Reset password"}</h1>
        <p className="mt-2 text-sm text-white/50">{token ? "This will invalidate old sessions." : "We will send a one-hour reset link if the account exists."}</p>
        <div className="mt-6 grid gap-4">
          {token ? <Label>New password<Input className="mt-2" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></Label> : <Label>Email<Input className="mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></Label>}
        </div>
        <Button className="mt-8 w-full" disabled={busy}>{busy ? "Working..." : "Continue"}</Button>
      </form>
    </main>
  );
}
''',
)

write(
    "src/lib/api.ts",
    r'''
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { assertSameOrigin, toErrorMessage } from "@/lib/utils";

export function ok<T>(data: T, init?: ResponseInit): NextResponse<{ ok: true; data: T }> {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(error: unknown, status = 400): NextResponse<{ ok: false; error: string }> {
  return NextResponse.json({ ok: false, error: toErrorMessage(error) }, { status });
}

export function guarded(request: Request): void {
  assertSameOrigin(request);
}

export function jsonObject(value: unknown): Prisma.InputJsonValue {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Prisma.InputJsonObject;
}
''',
)

write(
    "src/app/api/auth/[...nextauth]/route.ts",
    r'''
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
''',
)

write(
    "src/app/api/auth/password-reset/route.ts",
    r'''
import crypto from "node:crypto";
import { addHours } from "date-fns";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { hashPassword, hashSecret, isStrongPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/notifications";
import { absoluteUrl } from "@/lib/utils";

const requestSchema = z.object({ email: z.string().email() });
const resetSchema = z.object({ token: z.string().min(20), password: z.string().min(12) });

export async function POST(request: Request) {
  try {
    guarded(request);
    const body = requestSchema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (user) {
      const token = crypto.randomBytes(32).toString("base64url");
      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash: hashSecret(token), expiresAt: addHours(new Date(), 1) }
      });
      await sendEmail(user.email, "Ruby Panel password reset", `Reset your password: ${absoluteUrl(`/reset-password?token=${token}`)}`);
      await auditLog({ userId: user.id, action: "auth.password_reset.request", targetType: "User", targetId: user.id });
    }
    return ok({ sent: true });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    guarded(request);
    const body = resetSchema.parse(await request.json());
    if (!isStrongPassword(body.password)) {
      throw new Error("Password must contain uppercase, lowercase, number, and symbol");
    }
    const token = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashSecret(body.token) } });
    if (!token || token.usedAt || token.expiresAt < new Date()) {
      throw new Error("Reset token is invalid or expired");
    }
    await prisma.$transaction([
      prisma.user.update({ where: { id: token.userId }, data: { passwordHash: await hashPassword(body.password), passwordChangedAt: new Date() } }),
      prisma.passwordResetToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
      prisma.userSession.deleteMany({ where: { userId: token.userId } })
    ]);
    await auditLog({ userId: token.userId, action: "auth.password_reset.complete", targetType: "User", targetId: token.userId });
    return ok({ reset: true });
  } catch (error) {
    return fail(error);
  }
}
''',
)

write(
    "src/app/api/setup/route.ts",
    r'''
import { Role } from "@prisma/client";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { hashPassword, setupSchema } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    guarded(request);
    const existing = await prisma.user.count();
    if (existing > 0) {
      return fail(new Error("Setup has already been completed"), 404);
    }
    const input = setupSchema.parse(await request.json());
    const passwordHash = await hashPassword(input.password);
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: input.email.toLowerCase(),
          username: input.username,
          passwordHash,
          role: Role.SUPERADMIN
        }
      });
      await tx.panelSetting.upsert({ where: { key: "panel.name" }, update: { value: input.panelName }, create: { key: "panel.name", value: input.panelName } });
      await tx.panelSetting.upsert({ where: { key: "setup.completed" }, update: { value: "true" }, create: { key: "setup.completed", value: "true" } });
      await tx.panelSetting.upsert({ where: { key: "panel.tagline" }, update: { value: "Control Beyond Limits" }, create: { key: "panel.tagline", value: "Control Beyond Limits" } });
      return created;
    });
    await auditLog({ userId: user.id, action: "setup.complete", targetType: "User", targetId: user.id });
    return ok({ id: user.id });
  } catch (error) {
    return fail(error);
  }
}
''',
)

write(
    "src/app/api/dashboard/route.ts",
    r'''
import { ServerStatus } from "@prisma/client";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    await requireUser(request);
    const [totalServers, runningServers, latestStats, activity] = await Promise.all([
      prisma.server.count(),
      prisma.server.count({ where: { status: ServerStatus.RUNNING } }),
      prisma.serverStatSnapshot.findMany({ orderBy: { timestamp: "desc" }, take: 180 }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { username: true, email: true } } }
      })
    ]);
    const resourceSeries = latestStats
      .slice()
      .reverse()
      .map((point) => ({ timestamp: point.timestamp.toISOString(), cpuPercent: point.cpuPercent, ramMb: point.ramMb }));
    return ok({
      totalServers,
      runningServers,
      totalRamUsedMb: latestStats.reduce((sum, point) => sum + point.ramMb, 0),
      totalPlayersOnline: latestStats.reduce((sum, point) => sum + point.playerCount, 0),
      activity: activity.map((entry) => ({
        id: entry.id,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        createdAt: entry.createdAt.toISOString(),
        user: entry.user
      })),
      resourceSeries
    });
  } catch (error) {
    return fail(error, 401);
  }
}
''',
)

write(
    "src/app/api/servers/route.ts",
    r'''
import path from "node:path";
import { Prisma, Role, ServerPermission, ServerStatus, ServerType } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { createServerContainer } from "@/lib/docker";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const createSchema = z.object({
  name: z.string().min(2).max(64),
  description: z.string().max(280).optional(),
  type: z.nativeEnum(ServerType),
  version: z.string().min(2),
  ramMb: z.number().int().min(512).max(32768),
  cpuPercent: z.number().min(10).max(800),
  diskGb: z.number().min(1).max(2048),
  port: z.number().int().min(1).max(65535).optional(),
  jvmFlags: z.array(z.string()).default([])
});

async function allocatePort(preferred?: number): Promise<number> {
  if (preferred) {
    const used = await prisma.server.findUnique({ where: { port: preferred } });
    if (used) {
      throw new Error(`Port ${preferred} is already allocated`);
    }
    return preferred;
  }
  const start = Number(process.env.MC_PORT_RANGE_START ?? 25565);
  const end = Number(process.env.MC_PORT_RANGE_END ?? 25665);
  const used = new Set((await prisma.server.findMany({ select: { port: true } })).map((server) => server.port));
  for (let port = start; port <= end; port += 1) {
    if (!used.has(port)) {
      return port;
    }
  }
  throw new Error("No free Minecraft ports are available");
}

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const where = user.role === Role.USER || user.role === Role.MODERATOR ? { users: { some: { userId: user.id } } } : {};
    const servers = await prisma.server.findMany({ where, orderBy: { updatedAt: "desc" } });
    return ok(
      servers.map((server) => ({
        id: server.id,
        name: server.name,
        description: server.description,
        type: server.type,
        version: server.version,
        status: server.status,
        port: server.port,
        ramMb: server.ramMb,
        cpuPercent: server.cpuPercent,
        diskGb: server.diskGb,
        updatedAt: server.updatedAt.toISOString()
      }))
    );
  } catch (error) {
    return fail(error, 401);
  }
}

export async function POST(request: Request) {
  try {
    guarded(request);
    const user = await requireUser(request);
    const input = createSchema.parse(await request.json());
    const port = await allocatePort(input.port);
    const idSeed = `${slugify(input.name)}-${Date.now().toString(36)}`;
    const dataRoot = process.env.SERVER_DATA_ROOT ?? "./.data/servers";
    const server = await prisma.server.create({
      data: {
        name: input.name,
        description: input.description,
        type: input.type,
        version: input.version,
        status: ServerStatus.CREATING,
        containerName: `ruby-${idSeed}`,
        port,
        ramMb: input.ramMb,
        cpuPercent: input.cpuPercent,
        diskGb: input.diskGb,
        dataPath: path.resolve(dataRoot, idSeed),
        jvmFlags: input.jvmFlags,
        env: {} as Prisma.InputJsonObject,
        users: {
          create: {
            userId: user.id,
            permissions: Object.values(ServerPermission)
          }
        }
      }
    });
    try {
      await createServerContainer(server.id);
    } catch (containerError) {
      await prisma.server.update({ where: { id: server.id }, data: { status: ServerStatus.ERROR } });
      throw containerError;
    }
    await auditLog({ userId: user.id, action: "server.create", targetType: "Server", targetId: server.id, metadata: { port, type: input.type } });
    return ok({ id: server.id }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
''',
)

write(
    "src/app/api/servers/[serverId]/route.ts",
    r'''
import { ServerPermission } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { deleteServerContainer } from "@/lib/docker";
import { requireServerPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  name: z.string().min(2).max(64).optional(),
  description: z.string().max(280).nullable().optional(),
  ramMb: z.number().int().min(512).max(32768).optional(),
  cpuPercent: z.number().min(10).max(800).optional(),
  diskGb: z.number().min(1).max(2048).optional(),
  autoBackup: z.boolean().optional(),
  backupSchedule: z.string().nullable().optional(),
  backupRetention: z.number().int().min(1).max(365).optional()
});

export async function GET(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.VIEW);
    const server = await prisma.server.findUniqueOrThrow({ where: { id: serverId } });
    return ok(server);
  } catch (error) {
    return fail(error, 404);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    guarded(request);
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.SETTINGS);
    const input = patchSchema.parse(await request.json());
    const server = await prisma.server.update({ where: { id: serverId }, data: input });
    await auditLog({ userId: user.id, action: "server.update", targetType: "Server", targetId: serverId, metadata: input });
    return ok(server);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    guarded(request);
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.MANAGE);
    const url = new URL(request.url);
    await deleteServerContainer(serverId, url.searchParams.get("deleteData") === "true");
    await auditLog({ userId: user.id, action: "server.delete", targetType: "Server", targetId: serverId });
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
''',
)

write(
    "src/app/api/servers/[serverId]/power/route.ts",
    r'''
import { ServerPermission } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { killServer, restartServer, startServer, stopServer } from "@/lib/docker";
import { requireServerPermission } from "@/lib/permissions";

const schema = z.object({ action: z.enum(["start", "stop", "restart", "kill"]) });

export async function POST(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    guarded(request);
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.MANAGE);
    const { action } = schema.parse(await request.json());
    if (action === "start") await startServer(serverId);
    if (action === "stop") await stopServer(serverId);
    if (action === "restart") await restartServer(serverId);
    if (action === "kill") await killServer(serverId);
    await auditLog({ userId: user.id, action: `server.${action}`, targetType: "Server", targetId: serverId });
    return ok({ action });
  } catch (error) {
    return fail(error);
  }
}
''',
)

write(
    "src/app/api/servers/[serverId]/files/route.ts",
    r'''
import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { ServerPermission } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { requireServerPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { safeJoin } from "@/lib/utils";

const writeSchema = z.object({
  action: z.enum(["write", "mkdir", "extractZip"]),
  path: z.string().min(1),
  content: z.string().optional()
});

async function basePath(serverId: string): Promise<string> {
  const server = await prisma.server.findUniqueOrThrow({ where: { id: serverId } });
  await fs.mkdir(server.dataPath, { recursive: true });
  return server.dataPath;
}

export async function GET(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.FILES_READ);
    const url = new URL(request.url);
    const requested = url.searchParams.get("path") ?? ".";
    const target = safeJoin(await basePath(serverId), requested);
    if (url.searchParams.get("mode") === "read") {
      const content = await fs.readFile(target, "utf8");
      return ok({ path: requested, content });
    }
    const entries = await fs.readdir(target, { withFileTypes: true });
    const data = await Promise.all(
      entries.map(async (entry) => {
        const full = path.join(target, entry.name);
        const stat = await fs.stat(full);
        return {
          name: entry.name,
          path: path.posix.join(requested === "." ? "" : requested.replaceAll("\\", "/"), entry.name),
          type: entry.isDirectory() ? "directory" as const : "file" as const,
          size: stat.size,
          modifiedAt: stat.mtime.toISOString()
        };
      })
    );
    return ok(data.sort((left, right) => Number(right.type === "directory") - Number(left.type === "directory") || left.name.localeCompare(right.name)));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    guarded(request);
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.FILES_WRITE);
    const base = await basePath(serverId);
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      const uploadPath = String(form.get("path") ?? ".");
      if (!(file instanceof File)) {
        throw new Error("Missing upload file");
      }
      const target = safeJoin(base, path.join(uploadPath, file.name));
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, Buffer.from(await file.arrayBuffer()));
      await auditLog({ userId: user.id, action: "file.upload", targetType: "Server", targetId: serverId, metadata: { path: uploadPath, file: file.name } });
      return ok({ path: uploadPath });
    }
    const body = writeSchema.parse(await request.json());
    const target = safeJoin(base, body.path);
    if (body.action === "mkdir") {
      await fs.mkdir(target, { recursive: true });
    }
    if (body.action === "write") {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, body.content ?? "", "utf8");
    }
    if (body.action === "extractZip") {
      const zip = await JSZip.loadAsync(await fs.readFile(target));
      for (const [name, entry] of Object.entries(zip.files)) {
        const destination = safeJoin(base, name);
        if (entry.dir) {
          await fs.mkdir(destination, { recursive: true });
        } else {
          await fs.mkdir(path.dirname(destination), { recursive: true });
          await fs.writeFile(destination, Buffer.from(await entry.async("uint8array")));
        }
      }
    }
    await auditLog({ userId: user.id, action: `file.${body.action}`, targetType: "Server", targetId: serverId, metadata: { path: body.path } });
    return ok({ path: body.path });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    guarded(request);
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.FILES_WRITE);
    const url = new URL(request.url);
    const requested = url.searchParams.get("path");
    if (!requested) {
      throw new Error("Path is required");
    }
    await fs.rm(safeJoin(await basePath(serverId), requested), { recursive: true, force: true });
    await auditLog({ userId: user.id, action: "file.delete", targetType: "Server", targetId: serverId, metadata: { path: requested } });
    return ok({ path: requested });
  } catch (error) {
    return fail(error);
  }
}
''',
)

write(
    "src/app/api/servers/[serverId]/ai/route.ts",
    r'''
import { ServerPermission } from "@prisma/client";
import { z } from "zod";
import { fail, guarded } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { streamOllamaChat } from "@/lib/ai";
import { requireServerPermission } from "@/lib/permissions";

const schema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1) })).min(1)
});

export async function POST(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    guarded(request);
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.VIEW);
    const body = schema.parse(await request.json());
    const stream = await streamOllamaChat(body.messages, serverId);
    await auditLog({ userId: user.id, action: "ai.chat", targetType: "Server", targetId: serverId });
    return new Response(stream, {
      headers: {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive"
      }
    });
  } catch (error) {
    return fail(error);
  }
}
''',
)

write(
    "src/app/api/servers/[serverId]/plugins/route.ts",
    r'''
import fs from "node:fs/promises";
import path from "node:path";
import { ServerPermission } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { getModrinthVersions, searchModrinth } from "@/lib/plugins/modrinth";
import { searchCurseForge } from "@/lib/plugins/curseforge";
import { requireServerPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { safeJoin } from "@/lib/utils";

const installSchema = z.object({
  source: z.literal("modrinth"),
  projectId: z.string().min(1),
  versionId: z.string().optional()
});

export async function GET(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.PLUGINS);
    const query = new URL(request.url).searchParams.get("q") ?? "";
    const [modrinth, curseforge] = await Promise.all([searchModrinth(query), searchCurseForge(query)]);
    return ok([
      ...modrinth.map((item) => ({ id: item.project_id, source: "modrinth" as const, title: item.title, description: item.description, iconUrl: item.icon_url, downloads: item.downloads, updatedAt: item.date_modified })),
      ...curseforge.map((item) => ({ id: String(item.id), source: "curseforge" as const, title: item.name, description: item.summary, iconUrl: item.logo?.thumbnailUrl ?? null, downloads: item.downloadCount, updatedAt: item.dateModified }))
    ]);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    guarded(request);
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.PLUGINS);
    const body = installSchema.parse(await request.json());
    const server = await prisma.server.findUniqueOrThrow({ where: { id: serverId } });
    const versions = await getModrinthVersions(body.projectId);
    const selected = versions.find((version) => version.id === body.versionId) ?? versions[0];
    const file = selected?.files.find((candidate) => candidate.primary) ?? selected?.files[0];
    if (!file) {
      throw new Error("No downloadable plugin file was found");
    }
    const response = await fetch(file.url);
    if (!response.ok) {
      throw new Error(`Plugin download failed: ${response.status}`);
    }
    const folder = server.type === "FABRIC" || server.type === "FORGE" || server.type === "NEOFORGE" || server.type === "QUILT" ? "mods" : "plugins";
    const target = safeJoin(server.dataPath, path.join(folder, file.filename));
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, Buffer.from(await response.arrayBuffer()));
    await auditLog({ userId: user.id, action: "plugin.install", targetType: "Server", targetId: serverId, metadata: { source: body.source, projectId: body.projectId, file: file.filename } });
    return ok({ installed: file.filename, restartRequired: true });
  } catch (error) {
    return fail(error);
  }
}
''',
)

write(
    "src/app/api/servers/[serverId]/backups/route.ts",
    r'''
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { BackupStatus, BackupType, ServerPermission } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { requireServerPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const schema = z.object({ name: z.string().min(2).max(120) });

function runTar(source: string, target: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("tar", ["-czf", target, "-C", source, "."], { stdio: "ignore" });
    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`tar exited with ${code}`))));
  });
}

export async function GET(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.BACKUPS);
    const backups = await prisma.backup.findMany({ where: { serverId }, orderBy: { createdAt: "desc" } });
    return ok(backups.map((backup) => ({ ...backup, createdAt: backup.createdAt.toISOString(), completedAt: backup.completedAt?.toISOString() ?? null })));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    guarded(request);
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.BACKUPS);
    const body = schema.parse(await request.json());
    const server = await prisma.server.findUniqueOrThrow({ where: { id: serverId } });
    const backup = await prisma.backup.create({ data: { serverId, name: body.name, type: BackupType.MANUAL, status: BackupStatus.RUNNING } });
    const backupRoot = path.resolve(process.env.SERVER_DATA_ROOT ?? "./.data/servers", "..", "backups", serverId);
    await fs.mkdir(backupRoot, { recursive: true });
    const filePath = path.join(backupRoot, `${backup.id}.tar.gz`);
    try {
      await runTar(server.dataPath, filePath);
      const file = await fs.readFile(filePath);
      const checksum = crypto.createHash("sha256").update(file).digest("hex");
      const stat = await fs.stat(filePath);
      await prisma.backup.update({ where: { id: backup.id }, data: { status: BackupStatus.COMPLETED, filePath, sizeMb: stat.size / 1024 / 1024, checksum, completedAt: new Date() } });
    } catch (error) {
      await prisma.backup.update({ where: { id: backup.id }, data: { status: BackupStatus.FAILED, errorMsg: error instanceof Error ? error.message : "Backup failed" } });
      throw error;
    }
    await auditLog({ userId: user.id, action: "backup.create", targetType: "Server", targetId: serverId, metadata: { backupId: backup.id } });
    return ok({ id: backup.id }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
''',
)

write(
    "src/app/api/servers/[serverId]/tasks/route.ts",
    r'''
import { ServerPermission, TaskType } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, jsonObject, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { requireServerPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(120),
  type: z.nativeEnum(TaskType),
  schedule: z.string().min(5),
  payload: z.unknown().optional()
});

export async function GET(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.TASKS);
    const tasks = await prisma.scheduledTask.findMany({ where: { serverId }, orderBy: { createdAt: "desc" } });
    return ok(tasks.map((task) => ({ ...task, createdAt: task.createdAt.toISOString(), updatedAt: task.updatedAt.toISOString(), lastRun: task.lastRun?.toISOString() ?? null, nextRun: task.nextRun?.toISOString() ?? null })));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    guarded(request);
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.TASKS);
    const body = schema.parse(await request.json());
    const task = await prisma.scheduledTask.create({ data: { serverId, name: body.name, type: body.type, schedule: body.schedule, payload: jsonObject(body.payload) } });
    await auditLog({ userId: user.id, action: "task.create", targetType: "Server", targetId: serverId, metadata: { taskId: task.id, type: body.type } });
    return ok({ id: task.id }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
''',
)

write(
    "src/app/api/servers/[serverId]/stats/route.ts",
    r'''
import { ServerPermission } from "@prisma/client";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getStats } from "@/lib/docker";
import { requireServerPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.MONITORING);
    const url = new URL(request.url);
    if (url.searchParams.get("live") === "true") {
      const stats = await getStats(serverId);
      return ok(stats);
    }
    const points = await prisma.serverStatSnapshot.findMany({ where: { serverId }, orderBy: { timestamp: "desc" }, take: 180 });
    return ok(points.reverse().map((point) => ({ ...point, timestamp: point.timestamp.toISOString() })));
  } catch (error) {
    return fail(error);
  }
}
''',
)

write(
    "src/app/api/servers/[serverId]/worlds/route.ts",
    r'''
import { ServerPermission } from "@prisma/client";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { requireServerPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.FILES_READ);
    const worlds = await prisma.worldSnapshot.findMany({ where: { serverId }, orderBy: { createdAt: "desc" } });
    return ok(worlds.map((world) => ({ ...world, createdAt: world.createdAt.toISOString() })));
  } catch (error) {
    return fail(error);
  }
}
''',
)

write(
    "src/app/api/servers/[serverId]/console/route.ts",
    r'''
import { ServerPermission } from "@prisma/client";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { requireServerPermission } from "@/lib/permissions";

export async function GET(request: Request, context: { params: Promise<{ serverId: string }> }) {
  try {
    const { serverId } = await context.params;
    const user = await requireUser(request);
    await requireServerPermission(user, serverId, ServerPermission.CONSOLE);
    return ok({ socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001", room: `server:${serverId}:console` });
  } catch (error) {
    return fail(error);
  }
}
''',
)

write(
    "src/app/api/web-hosting/route.ts",
    r'''
import path from "node:path";
import { Prisma, SiteStatus, SiteType } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2).max(80),
  type: z.nativeEnum(SiteType),
  domain: z.string().min(3).optional(),
  buildCommand: z.string().optional(),
  startCommand: z.string().optional(),
  outputDir: z.string().optional()
});

async function allocateWebPort(): Promise<number> {
  const start = Number(process.env.WEB_PORT_RANGE_START ?? 8100);
  const end = Number(process.env.WEB_PORT_RANGE_END ?? 8200);
  const used = new Set((await prisma.website.findMany({ select: { port: true } })).map((site) => site.port));
  for (let port = start; port <= end; port += 1) {
    if (!used.has(port)) return port;
  }
  throw new Error("No free web ports are available");
}

export async function GET(request: Request) {
  try {
    await requireUser(request);
    const sites = await prisma.website.findMany({ orderBy: { updatedAt: "desc" }, include: { domains: true } });
    return ok(sites);
  } catch (error) {
    return fail(error, 401);
  }
}

export async function POST(request: Request) {
  try {
    guarded(request);
    const user = await requireUser(request);
    const body = schema.parse(await request.json());
    const idSeed = `${slugify(body.name)}-${Date.now().toString(36)}`;
    const site = await prisma.website.create({
      data: {
        name: body.name,
        type: body.type,
        status: SiteStatus.STOPPED,
        dataPath: path.resolve(process.env.WEBSITE_DATA_ROOT ?? "./.data/websites", idSeed),
        buildCommand: body.buildCommand,
        startCommand: body.startCommand,
        outputDir: body.outputDir,
        port: await allocateWebPort(),
        users: { create: { userId: user.id, role: "owner" } },
        domains: body.domain ? { create: { domain: body.domain } } : undefined
      }
    });
    await auditLog({ userId: user.id, action: "website.create", targetType: "Website", targetId: site.id, metadata: { type: body.type } as Prisma.InputJsonObject });
    return ok({ id: site.id }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
''',
)

write(
    "src/app/api/web-hosting/[siteId]/route.ts",
    r'''
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(80).optional(),
  buildCommand: z.string().nullable().optional(),
  startCommand: z.string().nullable().optional(),
  outputDir: z.string().nullable().optional()
});

export async function GET(request: Request, context: { params: Promise<{ siteId: string }> }) {
  try {
    await requireUser(request);
    const { siteId } = await context.params;
    return ok(await prisma.website.findUniqueOrThrow({ where: { id: siteId }, include: { domains: true, envVars: true, deployments: true, databases: true } }));
  } catch (error) {
    return fail(error, 404);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ siteId: string }> }) {
  try {
    guarded(request);
    const user = await requireUser(request);
    const { siteId } = await context.params;
    const body = schema.parse(await request.json());
    const site = await prisma.website.update({ where: { id: siteId }, data: body });
    await auditLog({ userId: user.id, action: "website.update", targetType: "Website", targetId: siteId });
    return ok(site);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ siteId: string }> }) {
  try {
    guarded(request);
    const user = await requireUser(request);
    const { siteId } = await context.params;
    await prisma.website.delete({ where: { id: siteId } });
    await auditLog({ userId: user.id, action: "website.delete", targetType: "Website", targetId: siteId });
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
''',
)

for route_name, action_name in [
    ("deploy", "website.deploy"),
    ("ssl", "website.ssl"),
    ("git", "website.git"),
]:
    write(
        f"src/app/api/web-hosting/[siteId]/{route_name}/route.ts",
        f'''
import {{ fail, guarded, ok }} from "@/lib/api";
import {{ auditLog }} from "@/lib/audit";
import {{ requireUser }} from "@/lib/auth";

export async function POST(request: Request, context: {{ params: Promise<{{ siteId: string }}> }}) {{
  try {{
    guarded(request);
    const user = await requireUser(request);
    const {{ siteId }} = await context.params;
    await auditLog({{ userId: user.id, action: "{action_name}", targetType: "Website", targetId: siteId }});
    return ok({{ accepted: true, siteId }});
  }} catch (error) {{
    return fail(error);
  }}
}}
''',
    )

write(
    "src/app/api/admin/users/route.ts",
    r'''
import { Role } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { hashPassword, requireRole, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(32),
  password: z.string().min(12),
  role: z.nativeEnum(Role)
});

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    requireRole(user, [Role.SUPERADMIN, Role.ADMIN]);
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return ok(users);
  } catch (error) {
    return fail(error, 403);
  }
}

export async function POST(request: Request) {
  try {
    guarded(request);
    const user = await requireUser(request);
    requireRole(user, [Role.SUPERADMIN, Role.ADMIN]);
    const body = schema.parse(await request.json());
    const created = await prisma.user.create({ data: { email: body.email.toLowerCase(), username: body.username, passwordHash: await hashPassword(body.password), role: body.role } });
    await auditLog({ userId: user.id, action: "user.create", targetType: "User", targetId: created.id });
    return ok({ id: created.id }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
''',
)

write(
    "src/app/api/admin/audit/route.ts",
    r'''
import { Role } from "@prisma/client";
import { fail, ok } from "@/lib/api";
import { requireRole, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    requireRole(user, [Role.SUPERADMIN, Role.ADMIN, Role.MODERATOR]);
    const url = new URL(request.url);
    const action = url.searchParams.get("action") ?? undefined;
    const logs = await prisma.auditLog.findMany({ where: { action }, orderBy: { createdAt: "desc" }, take: 500, include: { user: true } });
    return ok(logs);
  } catch (error) {
    return fail(error, 403);
  }
}
''',
)

write(
    "src/app/api/admin/api-keys/route.ts",
    r'''
import { Role } from "@prisma/client";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { createApiKeySecret, requireRole, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(80),
  permissions: z.record(z.string(), z.unknown()).default({})
});

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    requireRole(user, [Role.SUPERADMIN, Role.ADMIN]);
    const keys = await prisma.apiKey.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { username: true, email: true } } } });
    return ok(keys.map((key) => ({ ...key, keyHash: undefined })));
  } catch (error) {
    return fail(error, 403);
  }
}

export async function POST(request: Request) {
  try {
    guarded(request);
    const user = await requireUser(request);
    requireRole(user, [Role.SUPERADMIN, Role.ADMIN]);
    const body = schema.parse(await request.json());
    const secret = createApiKeySecret();
    const key = await prisma.apiKey.create({ data: { userId: user.id, name: body.name, keyHash: secret.hash, keyPrefix: secret.prefix, permissions: body.permissions } });
    await auditLog({ userId: user.id, action: "api_key.create", targetType: "ApiKey", targetId: key.id });
    return ok({ id: key.id, key: secret.raw, keyPrefix: secret.prefix }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
''',
)

write(
    "src/app/api/profile/2fa/route.ts",
    r'''
import { authenticator } from "otplib";
import { z } from "zod";
import { fail, guarded, ok } from "@/lib/api";
import { auditLog } from "@/lib/audit";
import { generateRecoveryCodes, hashSecret, requireUser, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const enableSchema = z.object({ secret: z.string().min(16), code: z.string().min(6).max(10) });
const disableSchema = z.object({ password: z.string().min(1), code: z.string().min(6).max(10) });

export async function POST(request: Request) {
  try {
    guarded(request);
    const user = await requireUser(request);
    const body = enableSchema.parse(await request.json());
    if (!authenticator.check(body.code.replace(/\s+/g, ""), body.secret)) {
      throw new Error("Authenticator code is invalid");
    }
    const recoveryCodes = generateRecoveryCodes();
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { totpSecret: body.secret, totpEnabled: true } }),
      prisma.recoveryCode.deleteMany({ where: { userId: user.id } }),
      prisma.recoveryCode.createMany({ data: recoveryCodes.map((code) => ({ userId: user.id, codeHash: hashSecret(code) })) })
    ]);
    await auditLog({ userId: user.id, action: "auth.2fa.enable", targetType: "User", targetId: user.id });
    return ok({ recoveryCodes });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request) {
  try {
    guarded(request);
    const user = await requireUser(request);
    const body = disableSchema.parse(await request.json());
    const record = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    if (!(await verifyPassword(body.password, record.passwordHash))) {
      throw new Error("Password is invalid");
    }
    if (!record.totpSecret || !authenticator.check(body.code.replace(/\s+/g, ""), record.totpSecret)) {
      throw new Error("Authenticator code is invalid");
    }
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { totpSecret: null, totpEnabled: false } }),
      prisma.recoveryCode.deleteMany({ where: { userId: user.id } })
    ]);
    await auditLog({ userId: user.id, action: "auth.2fa.disable", targetType: "User", targetId: user.id });
    return ok({ disabled: true });
  } catch (error) {
    return fail(error);
  }
}
''',
)

write(
    "src/server/socket.ts",
    r'''
import { createServer } from "node:http";
import { Server } from "socket.io";
import { ServerStatus } from "@prisma/client";
import { execCommand, getStats } from "@/lib/docker";
import { prisma } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";

type ClientToServerEvents = {
  "console:join": (serverId: string) => void;
  "console:command": (payload: { serverId: string; command: string }) => void;
  "stats:join": (serverId: string) => void;
};

type ServerToClientEvents = {
  "console:history": (lines: string[]) => void;
  "console:line": (line: string) => void;
  "stats:update": (payload: { cpuPercent: number; ramMb: number; ramLimitMb: number; playerCount: number; tps: number | null; netRxKb: number; netTxKb: number }) => void;
};

const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    credentials: true
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (typeof token === "string" && token.length > 0) {
    next();
    return;
  }
  next(new Error("Missing socket auth token"));
});

io.on("connection", (socket) => {
  socket.on("console:join", async (serverId) => {
    await socket.join(`server:${serverId}:console`);
    const redis = getRedis();
    if (redis.status === "wait") await redis.connect();
    const history = await redis.lrange(`console:${serverId}`, -1000, -1);
    socket.emit("console:history", history);
  });

  socket.on("stats:join", async (serverId) => {
    await socket.join(`server:${serverId}:stats`);
  });

  socket.on("console:command", async ({ serverId, command }) => {
    try {
      const output = await execCommand(serverId, command);
      const line = output.trim() || `Command sent: ${command}`;
      const redis = getRedis();
      if (redis.status === "wait") await redis.connect();
      await redis.rpush(`console:${serverId}`, line);
      await redis.ltrim(`console:${serverId}`, -1000, -1);
      io.to(`server:${serverId}:console`).emit("console:line", line);
    } catch (error) {
      io.to(`server:${serverId}:console`).emit("console:line", `Ruby socket error: ${error instanceof Error ? error.message : "command failed"}`);
    }
  });
});

setInterval(() => {
  void (async () => {
    const servers = await prisma.server.findMany({ where: { status: ServerStatus.RUNNING } });
    for (const server of servers) {
      try {
        const stats = await getStats(server.id);
        const snapshot = await prisma.serverStatSnapshot.create({
          data: {
            serverId: server.id,
            cpuPercent: stats.cpuPercent,
            ramMb: stats.ramMb,
            playerCount: 0,
            tps: null,
            netRxKb: stats.netRxKb,
            netTxKb: stats.netTxKb
          }
        });
        io.to(`server:${server.id}:stats`).emit("stats:update", {
          ...stats,
          playerCount: snapshot.playerCount,
          tps: snapshot.tps
        });
      } catch (error) {
        console.error(`Stats collection failed for ${server.id}`, error);
      }
    }
  })();
}, 10_000);

const port = Number(process.env.SOCKET_PORT ?? 3001);
httpServer.listen(port, () => {
  console.log(`Ruby Panel socket bridge listening on ${port}`);
});
''',
)

write(
    "middleware.ts",
    r'''
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.startsWith("/manifest") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }
  const userCount = await prisma.user.count();
  if (userCount === 0 && pathname !== "/setup") {
    return NextResponse.redirect(new URL("/setup", request.url));
  }
  if (userCount > 0 && pathname === "/setup") {
    return NextResponse.rewrite(new URL("/404", request.url));
  }
  const session = await auth();
  if (!session?.user && !pathname.startsWith("/login") && !pathname.startsWith("/reset-password")) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sw.js).*)"]
};
''',
)

write(
    "public/logo.svg",
    r'''
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="30" fill="#080809"/>
  <rect x="10" y="10" width="108" height="108" rx="24" fill="url(#paint0_radial)" stroke="rgba(255,255,255,0.14)"/>
  <path d="M37 88V35h32.5c12.4 0 21 7.2 21 18.2 0 7.4-3.9 13-10.4 15.8L93 88H74.7L63.6 71.2H53.2V88H37Zm16.2-29.7h14.5c4.4 0 7.1-2.2 7.1-5.8 0-3.7-2.7-5.9-7.1-5.9H53.2v11.7Z" fill="white"/>
  <defs>
    <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(34 24) rotate(50.2) scale(118)">
      <stop stop-color="#FB7185"/>
      <stop offset="0.45" stop-color="#E11D48"/>
      <stop offset="1" stop-color="#881337"/>
    </radialGradient>
  </defs>
</svg>
''',
)

write(
    "public/manifest.json",
    r'''
{
  "name": "Ruby Panel",
  "short_name": "Ruby",
  "description": "Control Beyond Limits",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#E11D48",
  "background_color": "#080809",
  "icons": [
    {
      "src": "/logo.svg",
      "sizes": "128x128",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
''',
)

write(
    "public/sw.js",
    r'''
const CACHE_NAME = "ruby-panel-static-v1";
const STATIC_ASSETS = ["/", "/manifest.json", "/logo.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
''',
)

write(
    "README.md",
    r'''
# Ruby Panel

Control Beyond Limits: a premium Minecraft and web hosting control panel built with Next.js, Prisma, PostgreSQL, Redis, Socket.io, and Docker.

## Development

1. Start infrastructure: `docker compose up -d postgres redis`
2. Install dependencies: `npm install`
3. Run migrations: `npm run prisma:migrate`
4. Start app and socket bridge: `npm run dev:all`
5. Open `http://localhost:3000` and complete first-run setup.

The Docker socket is required for Minecraft container lifecycle operations.
''',
)

print("Ruby Panel scaffold written.")
