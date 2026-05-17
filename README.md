# Ruby Panel

Control Beyond Limits: a premium Minecraft and web hosting control panel built with Next.js, Prisma, PostgreSQL, Redis, Socket.io, and Docker.

## Development

1. Start infrastructure: `docker compose up -d postgres redis`
2. Install dependencies: `npm install`
3. Run migrations: `npm run prisma:migrate`
4. Start app and socket bridge: `npm run dev:all`
5. Open `http://localhost:3000` and complete first-run setup.

The Docker socket is required for Minecraft container lifecycle operations.
