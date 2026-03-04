# replit.md

## Overview

This is a **Netflix Usage Tracker** — a full-stack web application that lets users log and visualize their streaming viewing sessions. Users can manually add viewing sessions or use AI (Anthropic Claude) to generate realistic mock data. The dashboard displays usage statistics, a bar chart of daily viewing time, and a scrollable session history list. Sessions exceeding 3 hours trigger "excessive usage" alerts. The app has a dark cyberpunk/Netflix-inspired UI theme.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State Management / Data Fetching**: TanStack React Query for server state, with custom hooks in `client/src/hooks/use-usage.ts`
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives, stored in `client/src/components/ui/`
- **Styling**: Tailwind CSS with CSS variables for theming (dark cyberpunk theme defined in `client/src/index.css`)
- **Charts**: Recharts for bar chart visualization of daily usage
- **Animations**: Framer Motion for transitions and list animations
- **Date Handling**: date-fns
- **Build Tool**: Vite with React plugin
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend
- **Framework**: Express.js on Node.js with TypeScript
- **Runtime**: tsx for development, esbuild for production builds
- **API Structure**: RESTful API with routes defined in `shared/routes.ts` as a typed route contract (path, method, input/output schemas using Zod)
- **AI Integration**: Anthropic Claude (claude-haiku-4-5) for generating realistic mock viewing sessions. Configured via `AI_INTEGRATIONS_ANTHROPIC_API_KEY` and `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` environment variables.
- **Replit Integrations**: Located in `server/replit_integrations/` — includes batch processing utilities and a chat module (conversations + messages with Claude)

### Data Storage
- **Database**: PostgreSQL via `DATABASE_URL` environment variable
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in `shared/schema.ts` — main table is `usage_sessions` with columns: `id`, `show_name`, `duration_minutes`, `watched_at`
- **Additional Models**: `shared/models/chat.ts` defines `conversations` and `messages` tables for the chat integration
- **Schema Validation**: drizzle-zod generates Zod schemas from Drizzle table definitions
- **Migrations**: Use `npm run db:push` (drizzle-kit push) to sync schema to database

### API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/usage` | List all usage sessions |
| POST | `/api/usage` | Create a manual session |
| POST | `/api/usage/generate` | AI-generate a random session |
| DELETE | `/api/usage/:id` | Delete a session |

Chat integration routes (registered separately):
- CRUD for `/api/conversations` and `/api/conversations/:id/messages`

### Project Structure
```
client/           → React frontend
  src/
    components/   → App components (SessionList, StatCard, UsageChart)
    components/ui/→ shadcn/ui primitives
    hooks/        → Custom React hooks (use-usage, use-toast, use-mobile)
    lib/          → Utilities (queryClient, cn helper)
    pages/        → Page components (Dashboard, not-found)
server/           → Express backend
  index.ts        → Server entry point
  routes.ts       → API route handlers
  storage.ts      → Database access layer (IStorage interface + DatabaseStorage)
  db.ts           → Drizzle/pg pool setup
  static.ts       → Production static file serving
  vite.ts         → Dev mode Vite middleware
  replit_integrations/ → Chat and batch processing utilities
shared/           → Shared between client and server
  schema.ts       → Drizzle table definitions + Zod schemas
  routes.ts       → Typed API route contracts
  models/         → Additional data models (chat)
script/
  build.ts        → Production build script (Vite + esbuild)
```

### Key Design Decisions
1. **Shared route contracts**: `shared/routes.ts` defines API paths, methods, and Zod schemas in one place, used by both client hooks and server handlers for type safety.
2. **Storage abstraction**: `IStorage` interface in `server/storage.ts` abstracts database access, making it possible to swap implementations.
3. **Single-page app with API proxy**: In development, Vite middleware handles frontend; in production, Express serves static files from `dist/public` with SPA fallback.
4. **No authentication**: The app currently has no auth layer — all endpoints are public.

## External Dependencies

- **PostgreSQL**: Required. Connection string via `DATABASE_URL` environment variable. Used with Drizzle ORM and `connect-pg-simple` for session storage.
- **Anthropic Claude API**: Used for AI-generated viewing sessions. Requires `AI_INTEGRATIONS_ANTHROPIC_API_KEY` and `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` environment variables. Uses `claude-haiku-4-5` model.
- **Google Fonts**: Inter and Outfit fonts loaded via CDN in `client/index.html` and `client/src/index.css`.
- **Replit Plugins** (dev only): `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner` — active only in development on Replit.