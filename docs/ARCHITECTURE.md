# YSOAM — Architecture

**Version:** 1.0  
**Date:** 2026-06-08  
**Audience:** Engineers, Architect Agent

**See also:** [API.md](API.md) · [DATABASE.md](DATABASE.md) · [DEPLOYMENT.md](DEPLOYMENT.md) · [DECISIONS.md](DECISIONS.md)

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18+, TypeScript, Tailwind CSS, Vite |
| State / data fetching | TanStack Query |
| Realtime | Socket.io client |
| Maps | Google Maps API |
| Charts | Recharts |
| Backend | Node.js, Fastify, TypeScript |
| Database | PostgreSQL |
| Cache / pub-sub | Redis |
| Job queue | BullMQ |
| Auth | JWT + TOTP MFA |
| File storage | S3-compatible (AWS/GCP) |
| CI/CD | GitHub Actions |
| Containers | Docker (Kubernetes Phase 2) |
| Monorepo | Nx Workspace (pnpm package manager) |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Client: React Web App (light mode) + PWA Driver View   │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTPS / WSS
┌─────────────────────────▼───────────────────────────────┐
│  API Gateway (Fastify) — /api/v1/*                      │
│  ├── Auth Service                                       │
│  ├── GPS Service (+ WebSocket)                          │
│  ├── Trip Service                                       │
│  ├── Profitability Engine                               │
│  ├── Billing Service                                    │
│  └── [Module Services...]                               │
└──────┬──────────────────┬──────────────────┬────────────┘
       │                  │                  │
  PostgreSQL            Redis              S3
```

### Monorepo Layout

Nx Workspace — each app and package is an Nx project with `project.json` targets.

```
apps/web          → React frontend (nx serve web)
apps/api          → Fastify backend (nx serve api)
packages/shared   → Types, validators, profitability utils
packages/ui       → Shared components (Phase 2+)
nx.json           → Workspace config, task pipeline, caching
tsconfig.base.json → Path aliases (@ysoam/shared, etc.)
```

**Nx targets:** `serve`, `build`, `test`, `lint`, `typecheck` per project; custom targets on `api` for `db-migrate` and `db-seed`.

---

## API Conventions

Full endpoint reference: [API.md](API.md)

| Rule | Value |
|------|-------|
| Base path | `/api/v1` |
| Auth | `Authorization: Bearer <jwt>` |
| Pagination | `?page=1&limit=20` |
| Error shape | `{ "error": { "code", "message" } }` |
| IDs | UUID v4 |
| Currency | INR paise as integer |

---

## Realtime (GPS)

- WebSocket namespace: `/ws/fleet`
- Room per organization: `org:{organization_id}`
- Events: `vehicle:location`, `vehicle:status`, `trip:updated`, `alert:new`
- Ingest: `POST /api/v1/gps/ingest` → store → publish event

---

## Security

- RBAC middleware on all protected routes
- Roles: Admin, Manager, Operator, Driver
- MFA required for Admin
- Audit log on all writes and auth events
- Rate limit: 100 req/min per user
- TLS 1.2+ everywhere

---

## Multi-Tenancy

| Phase | Model |
|-------|-------|
| Phase 1 | Single org, single branch |
| Phase 2 | `organization_id` + `branch_id` on tenant-scoped tables |

---

## Profitability Engine

```
Trip Margin = Revenue − (Fuel + Driver Advance + Maintenance Est.)

Maintenance Est. = km × rate (₹2/km light, ₹3/km heavy)
Margin %         = (Trip Margin / Revenue) × 100
```

**Triggers:**
- Trip completed → compute and store snapshot
- Fuel linked to trip → recalculate
- Nightly batch → vehicle and route rollups

Full schema: [DATABASE.md](DATABASE.md) (`profitability_snapshots`)

---

## Integrations

| Integration | Phase | Purpose |
|-------------|-------|---------|
| Google Maps | 1 | Geocoding, routing, map tiles |
| Telematics devices | 1 | GPS webhook ingest |
| Email (SMTP/SES) | 1 | Notifications, invoices |
| E-Way Bill 2.0 | 2 | GST compliance |
| GST tax engine | 2 | ITC, RCM on invoices |
| Payment gateway | 2 | Customer payments |
| IoT sensors | 2 | Fuel, temperature, CAN bus |
| SSO (Google/Microsoft) | 2 | Enterprise login |

---

## Module Services (19)

| # | Module | Primary service |
|---|--------|-----------------|
| 1 | Dashboard | Auth, notifications, KPI aggregation |
| 2 | GPS | Location ingest, live positions, playback |
| 3 | Vehicles | Fleet master, compliance |
| 4 | Drivers | Profiles, assignment |
| 5 | Trips | Lifecycle, dispatch, checkpoints |
| 6 | Fuel | Entries, consumption, anomalies |
| 7 | Tyres | Allocation, lifecycle |
| 8 | Maintenance | Breakdowns, repairs, schedules |
| 9 | Billing | Invoices, ledger, advances |
| 10 | Inventory | Stock, low-stock alerts |
| 11 | Documents | Upload, expiry tracking |
| 12 | Reports | Profitability aggregation, export |
| 13 | AI | Recommendations, risk scores |
| 14 | IoT | Sensor registry, ingest |
| 15 | Driver View | Scoped trip/fuel APIs |
| 16 | Admin | Health, API keys, backups |
| 17 | Battery | EV telemetry |
| 18 | Settings | Org config, integrations |
| 19 | Roadmap | UI placeholder only |

---

**Document:** ARCHITECTURE.md  
**Purpose:** High-level technical architecture hub for YSOAM
