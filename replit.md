# Database Line Filter

## Project Overview
A client-side React application that processes .txt database files, removes duplicates, and filters lines by mail, country, date, and other criteria. Built with React/Vite with a matrix/cyberpunk aesthetic.

## Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Radix UI components, TanStack Query, Wouter router, Framer Motion
- **Build**: Vite 7 (frontend bundler)
- **Storage**: Pure client-side (no backend/database required)

## Project Structure

```
client/          - React frontend source
  index.html     - HTML entry point
  src/
    App.tsx      - Main app component with routing
    main.tsx     - React entry point
    index.css    - Global styles (Tailwind v4 + custom cyberpunk theme)
    pages/       - Page components
      home.tsx   - Main database line filter page
      not-found.tsx - 404 page
    components/  - Shared UI components
      ui/        - Shadcn/Radix UI components
    hooks/       - Custom React hooks
      use-toast.ts  - Toast notifications hook
      use-mobile.tsx - Mobile detection hook
    lib/         - Utilities
      utils.ts   - cn() utility function
      queryClient.ts - TanStack Query client
server/          - Express backend (unused in dev, kept for future API routes)
  index.ts       - Server entry point
  routes.ts      - API routes (empty)
  storage.ts     - Storage interface (MemStorage)
  vite.ts        - Vite dev middleware (unused)
  static.ts      - Static file serving (production)
shared/          - Shared types/schema
  schema.ts      - Drizzle ORM schema (users table)
```

## Running the App

- **Development**: `npm run dev` — starts Vite dev server on port 5000
- **Build**: `npm run build` — compiles frontend to dist/public

## Workflow

- Workflow: "Start application" — `npm run dev` on port 5000 (webview)

## Deployment

- Target: static
- Build: `npm run build` (vite build → dist/public)
- Public dir: dist/public

## Notes

- This project was imported from GitHub with scrambled file names (all source files were dumped in root with incorrect names). The proper directory structure was reconstructed during setup.
- The dev script uses Vite directly (not via tsx server/index.ts) due to a Node 20 + Vite 7 ESM compatibility issue with tsx.
