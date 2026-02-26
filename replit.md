# Database Line Filter

## Project Overview
A full-stack web application built with Express (backend) and React/Vite (frontend), running together on a single port (5000) in development mode. The server uses Express in development with Vite middleware for hot reloading.

## Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Radix UI components, TanStack Query, Wouter router
- **Backend**: Express 5 (Node.js), TypeScript via tsx
- **Build**: Vite 7 (frontend bundler), esbuild (server bundler)
- **Storage**: In-memory (MemStorage) by default; Drizzle ORM + PostgreSQL available via DATABASE_URL
- **Auth**: Passport.js (passport-local) with express-session

## Project Structure

```
client/          - React frontend source
  src/
    App.tsx      - Main app component
    pages/       - Page components
    components/  - Shared UI components
    hooks/       - Custom hooks
    lib/         - Utilities
server/          - Express backend
  index.ts       - Server entry point
  routes.ts      - API routes
  storage.ts     - Storage interface (MemStorage / DB)
  vite.ts        - Vite dev middleware integration
  static.ts      - Static file serving (production)
shared/          - Shared types/schema
  schema.ts      - Drizzle ORM schema (users table)
script/
  build.ts       - Production build script
```

## Running the App

- **Development**: `npm run dev` — starts Express + Vite middleware on port 5000
- **Build**: `npm run build` — compiles frontend + server to dist/
- **Production**: `npm start` — runs compiled dist/index.cjs

## Workflow

- Workflow: "Start application" — `npm run dev` on port 5000 (webview)

## Deployment

- Target: autoscale
- Build: `npm run build`
- Run: `node dist/index.cjs`
