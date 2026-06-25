# YSOAM — Agent Instructions

**Version:** 2.0  
**Platform:** [ysoam.com](https://ysoam.com)  
**Audience:** Cursor, Claude Code, Codex, Kiro, and all AI coding agents

---

## Start Here

Read these files **in order** before writing code:

1. **AGENTS.md** (this file) — rules and commands
2. [PRODUCT.md](PRODUCT.md) — vision, users, 19 modules
3. [ARCHITECTURE.md](ARCHITECTURE.md) — stack, services, conventions
4. [TASKS.md](TASKS.md) — current sprint and checklists

Then consult task-specific docs as needed.

---

## Documentation Map

| File | Purpose | When to read |
|------|---------|--------------|
| [AGENTS.md](AGENTS.md) | Agent rules, roles, commands | Always first |
| [PRODUCT.md](PRODUCT.md) | Vision, personas, modules | New feature context |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Stack, services, security | Backend/infra work |
| [REQUIREMENTS.md](REQUIREMENTS.md) | Features + acceptance criteria | Implementing a feature |
| [TASKS.md](TASKS.md) | Sprint breakdown | What to work on now |
| [DESIGN.md](DESIGN.md) | Brand, tokens, UX patterns | Any UI work |
| [PROTOTYPE_UI.md](PROTOTYPE_UI.md) | HTML prototype patterns, module specs (Vendors, Geofences, etc.) | Prototype / Fleetio-style screens |
| [API.md](API.md) | REST/WebSocket reference | API routes, payloads |
| [DATABASE.md](DATABASE.md) | PostgreSQL schema | Migrations, queries |
| [DECISIONS.md](DECISIONS.md) | ADRs | Architectural choices |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Environments, CI/CD | DevOps, go-live |
| [TESTING.md](TESTING.md) | Test strategy | Writing or running tests |

**Legacy (reference only):** `ysoam_specs.md`, `ysoam_plan.md` — superseded by PRODUCT.md and TASKS.md.

---

## Agent Roles

| Role | Scope | Primary docs |
|------|-------|--------------|
| **Frontend** | React UI, prototype, Tailwind, maps, WebSocket client | DESIGN.md, API.md, TASKS.md |
| **Backend** | Fastify APIs, auth, profitability engine, GPS ingest | ARCHITECTURE.md, API.md, DATABASE.md |
| **DevOps** | Docker, CI/CD, migrations, env config | DEPLOYMENT.md, ARCHITECTURE.md |
| **QA** | Unit, integration, E2E tests | TESTING.md, REQUIREMENTS.md |
| **Architect** | ADRs, schema design, integrations, scale | DECISIONS.md, ARCHITECTURE.md, DATABASE.md |

Check [TASKS.md](TASKS.md) for which role leads each sprint.

---

## Project Context

| Item | Value |
|------|-------|
| Product | Profitability-first fleet platform for India |
| Hero metric | Trip profitability visible in **5 clicks** |
| Market | INR (₹), GST-aware, India fleet operators |
| Theme | **Light mode only** — no dark mode toggle |
| Primary color | `#0052FF` (see DESIGN.md) |
| Stack | React 18 + Vite + Tailwind · Fastify + Node.js + TypeScript |
| Data | PostgreSQL + Redis · Nx Workspace monorepo (pnpm) |
| Modules | 19 (see PRODUCT.md) |
| Timeline | 4 months — prototype → go-live on ysoam.com |

---

## Monorepo Layout

Nx Workspace with pnpm as package manager. See [DECISIONS.md](DECISIONS.md) ADR-003.

```
YSOAM/
├── apps/
│   ├── web/            → React frontend (Vite) — Nx project
│   └── api/            → Fastify backend — Nx project
├── packages/
│   ├── shared/         → Shared types, validators, profitability utils
│   └── ui/             → Shared components (Phase 2+)
├── nx.json             → Nx workspace config
├── tsconfig.base.json  → Shared TypeScript paths
├── prototype/          → HTML mockups (Week 1–2)
├── docker/             → docker-compose.yml (Postgres + Redis)
└── docs/               → AGENTS.md, DESIGN.md, etc.
```

Scaffold may not exist yet — see Month 1 tasks in TASKS.md.

---

## Commands

Use `nx` for project tasks. Root `package.json` may expose shorthand scripts that wrap `nx`.

### Setup

```bash
pnpm install
docker compose -f docker/docker-compose.yml up -d
nx run api:db-migrate
nx run api:db-seed
```

### Development

```bash
nx serve web          # Frontend (port 5173)
nx serve api          # Backend (port 3000)
nx run-many -t serve -p web,api   # Both in parallel
```

### Quality

```bash
nx run-many -t lint
nx run-many -t typecheck
nx run-many -t test              # All projects
nx test api                      # Backend only
nx test web                      # Frontend only
nx run-many -t build
```

Run `nx run-many -t typecheck` and relevant tests before claiming work complete. See [TESTING.md](TESTING.md).

---

## Coding Rules

### General

- **Minimize scope** — smallest correct change; no unrelated refactors
- **Match existing conventions** — read surrounding code before editing
- **Reuse** — extend existing functions and components; don't duplicate logic
- **No hardcoded values** — use env vars, config, or DESIGN.md tokens
- **No `console.log`** unless explicitly requested
- **TypeScript strict** — no `any` without justification
- **Comments** — only for non-obvious business logic

### Frontend

- Follow [DESIGN.md](DESIGN.md) tokens and component patterns
- Primary color: `#0052FF` · Sidebar: `#1E293B` · Light mode only
- Use TanStack Query for server state; Socket.io for GPS realtime
- Mobile breakpoints: 375px, 768px, 1280px
- Currency display: INR with ₹ symbol; store amounts as paise integers in API

### Backend

- Base path: `/api/v1`
- Auth: `Authorization: Bearer <jwt>`
- Error shape: `{ "error": { "code", "message" } }`
- IDs: UUID v4
- RBAC on all protected routes (Admin, Manager, Operator, Driver)
- Audit log on all writes and auth events
- Profitability formula — see ARCHITECTURE.md

### Database

- Migrations only — never edit schema by hand in production
- Tenant columns: `organization_id`, `branch_id` (Phase 2)
- Full schema: [DATABASE.md](DATABASE.md)

---

## Git

- **Conventional Commits:** `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Subject ≤ 72 characters; body explains *why* when not obvious
- **Do not commit** unless the user explicitly asks
- **Never commit** `.env`, credentials, or secrets
- **Never** force-push to `main`/`master`
- **Never** skip hooks (`--no-verify`) unless user requests it

---

## Testing

- Never delete or skip failing tests to pass CI
- Must-have Phase 1 coverage: profitability engine, auth/RBAC, trip lifecycle, GPS ingest, invoice generation
- API integration tests: Supertest
- E2E (Phase 2): Playwright — login → trip → profitability
- Full strategy: [TESTING.md](TESTING.md)

---

## UI / Design

- **DESIGN.md is the source of truth** for colors, typography, spacing, and screen patterns
- Do not invent colors outside the token set
- Sidebar navigation lists all 19 modules
- Status colors: green (active), amber (idle), red (offline/alert)
- Prototype screens live in `prototype/` during Week 1–2
- **Fleetio-style list/form patterns:** see [PROTOTYPE_UI.md](PROTOTYPE_UI.md) before adding or changing prototype modules

---

## Security

- Never log or expose JWTs, passwords, or API keys
- Env files: copy from `.env.example`; never commit `.env`
- Rate limit: 100 req/min per user
- MFA required for Admin role
- See ARCHITECTURE.md Security section

---

## What NOT to Do

- Don't add dark mode
- Don't change primary color from `#0052FF`
- Don't put backend/API details in DESIGN.md (use API.md, DATABASE.md)
- Don't scaffold features outside current TASKS.md sprint without user approval
- Don't create commits or PRs unless asked
- Don't overwrite DECISIONS.md ADRs — add new ADRs for new decisions

---

## Verification Checklist

Before marking a task done:

- [ ] Code matches REQUIREMENTS.md acceptance criteria
- [ ] UI matches DESIGN.md tokens (if applicable)
- [ ] `nx run-many -t typecheck` passes
- [ ] Relevant tests pass (`nx run-many -t test` or `nx test <project>`)
- [ ] No secrets or hardcoded env values committed
- [ ] TASKS.md checkbox updated if user wants progress tracked

---

**Document:** AGENTS.md  
**Purpose:** Single entry point for all AI agents working on YSOAM
