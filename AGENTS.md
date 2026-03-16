# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Copilot Auto-Responder — a Next.js 14 app (App Router) that provides automatic message responses for the Copilot platform. It runs as an embedded app within Copilot workspaces, allowing workspace admins to configure auto-responses to client messages (always on, outside working hours, or off).

## Commands

```bash
yarn dev              # Start dev server
yarn build            # Build for production
yarn lint:check       # ESLint check
yarn lint:fix         # ESLint auto-fix
yarn prettier:check   # Prettier check
yarn prettier:fix     # Prettier auto-fix
yarn db:migrate       # Run Prisma migrations (uses .env.development.local)
yarn db:seed          # Seed/resolve initial migration
```

Vercel build runs `prisma generate && next build`. Husky pre-commit runs `lint-staged` (lint:fix + prettier:fix on staged `src/**/*.{ts,tsx}`).

## Architecture

### Data Flow

1. **Settings UI** (`src/app/page.tsx` — server component) renders the `AutoResponder` client component with current settings
2. **Save** uses a server action that calls `SettingService.save()` to persist to PostgreSQL via Prisma
3. **Webhook** (`POST /api/messages/webhook`) receives `message.sent` events from Copilot, validates HMAC signature, then `MessageService` decides whether to auto-respond based on the workspace's settings
4. **Rate limiting**: at most one auto-response per hour per channel per client, tracked in the `Message` table

### Key Services

- **`SettingService`** (`src/app/api/settings/services/setting.service.ts`) — CRUD for workspace auto-responder settings (one Setting row per workspace)
- **`MessageService`** (`src/app/api/messages/services/message.service.ts`) — webhook handler logic: checks setting type (ENABLED/DISABLED/OUTSIDE_WORKING_HOURS), rate-limits, and sends auto-responses
- **`CopilotAPI`** (`src/utils/copilotApiUtils.ts`) — wrapper around `copilot-node-sdk` for workspace/client/user/message API calls

### Database (Prisma + PostgreSQL/Neon)

Schema in `schema.prisma` (root). Two models:
- **Setting** — one per workspace: type (ENABLED/DISABLED/OUTSIDE_WORKING_HOURS), timezone, workingHours (JSONB), message text, senderId
- **Message** — log of sent auto-responses, used for hourly rate-limiting per channel/client

Prisma client is a singleton via `src/lib/db.ts`.

### Working Hours Logic

Uses `@js-joda/core` + `@js-joda/timezone` for timezone-aware day/time comparisons (`src/utils/common.ts:isWithinWorkingHours`). Working hours stored as array of `{weekday, startTime, endTime}` in JSONB.

### API Routes

- `POST /api/messages/webhook` — Copilot webhook receiver (signature-verified)
- `GET /api/internal-users` — proxies internal user list from Copilot API
- `GET /api/health-check` — health endpoint

### Frontend

- `AutoResponder` component (`src/app/components/AutoResponder.tsx`) — main form using React Hook Form + Zod validation
- UI: Tailwind CSS + MUI Select + Radix UI Select + react-timezone-select
- Form validation: response 10–2000 chars, at least 1 day selected for outside-working-hours mode

### Auth & Multi-tenancy

Token-based via `?token=` query param from Copilot embedding. `CopilotAPI` uses both an API key (`COPILOT_API_KEY`) and the session token. Workspace ID from the token payload scopes all data.

## Code Conventions

- Path aliases: `@/` maps to `src/`
- Prettier: single quotes, trailing commas, 125 char width
- Zod schemas colocated with types in `src/types/` — all API responses validated at parse time
- Environment config centralized in `src/config/app.ts`
- SVGs imported as React components via `next-plugin-svgr`
