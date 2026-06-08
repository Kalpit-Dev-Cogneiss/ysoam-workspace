# YSOAM Workspace

Profitability-first fleet platform for India — GPS, ERP, billing, and trip margin analytics.

**Platform:** [ysoam.com](https://ysoam.com)

---

## Repository structure

```
ysoam-workspace/
├── docs/           → Product, architecture, design, API, tasks (all documentation)
├── prototype/      → Week 1–2 static HTML prototype (open dashboard.html in browser)
└── README.md
```

---

## Documentation

All project docs live in [`docs/`](docs/). Start here:

| Doc | Purpose |
|-----|---------|
| [docs/AGENTS.md](docs/AGENTS.md) | AI agent instructions — read first |
| [docs/PRODUCT.md](docs/PRODUCT.md) | Vision, users, 19 modules |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Stack, services, Nx monorepo |
| [docs/DESIGN.md](docs/DESIGN.md) | Brand, UX tokens (`#0052FF`) |
| [docs/TASKS.md](docs/TASKS.md) | Sprint checklists |

---

## HTML prototype

Open locally (no server required):

```
prototype/dashboard.html
```

Maps use Leaflet + OpenStreetMap (requires internet for tiles).

---

## Stack (planned)

- **Frontend:** React 18, Vite, Tailwind, TanStack Query
- **Backend:** Fastify, Node.js, TypeScript
- **Data:** PostgreSQL, Redis
- **Monorepo:** Nx Workspace + pnpm

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full details.
