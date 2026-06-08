# YSOAM — Current Sprint Tasks

**Timeline:** 4 months (18 weeks) · **Platform:** ysoam.com  
**Related:** [REQUIREMENTS.md](REQUIREMENTS.md) · [AGENTS.md](AGENTS.md)

---

## Sprint Overview

| Sprint | Weeks | Focus | Lead Agents |
|--------|-------|-------|-------------|
| Prototype | 1–2 | HTML mockups, design sign-off | Frontend |
| Month 1 | 3–6 | Backend, DB, core APIs | Backend, DevOps |
| Month 2 | 7–10 | React UI, integration | Frontend, QA |
| Month 3 | 11–14 | Advanced backend features | Backend, Architect |
| Month 4 | 15–18 | Phase 2 UI, E2E, go-live | All |

---

## Week 1–2: Prototype

**Agent:** Frontend  
**Gate:** Client sign-off before Month 1

- [ ] Scaffold `prototype/` folder with shared CSS tokens from DESIGN.md
- [ ] Build sidebar nav linking all 19 module screens
- [ ] Dashboard — KPI row, alerts, mini map
- [ ] GPS — live map mockup, vehicle list, playback modal
- [ ] Trips — create form, dispatch modal, status stepper, inline P&L
- [ ] Profitability dashboard — trip/vehicle/route tabs
- [ ] Billing — invoice preview, customer ledger
- [ ] Remaining 14 module screens (per DESIGN.md checklist)
- [ ] Mobile responsive: 375px, 768px, 1280px
- [ ] Demo flow: GPS → Trip → Profitability → Invoice
- [ ] Client review and sign-off

---

## Month 1: Backend Foundation

**Agents:** Backend, DevOps

### DevOps
- [ ] Scaffold Nx Workspace monorepo (`apps/web`, `apps/api`, `packages/shared`)
- [ ] Configure `nx.json`, `tsconfig.base.json`, and per-project `project.json` targets
- [ ] `docker/docker-compose.yml` — Postgres + Redis
- [ ] `.env.example` files for web and api
- [ ] GitHub Actions CI: lint, typecheck, test, build
- [ ] `api` Nx targets: `db-migrate` and `db-seed`

### Database
- [ ] Core migrations: organizations, users, vehicles, drivers, trips
- [ ] GPS, fuel, invoices, profitability_snapshots tables
- [ ] Seed 10-vehicle Mumbai/Pune sample fleet

### Auth
- [ ] `POST /api/v1/auth/login`, refresh, MFA verify
- [ ] JWT middleware + RBAC by role
- [ ] User CRUD endpoints
- [ ] Audit log on writes

### Core APIs
- [ ] Vehicles CRUD + metrics
- [ ] Drivers CRUD + assign
- [ ] Trips CRUD + dispatch + status workflow
- [ ] GPS ingest webhook + live positions + history
- [ ] Fuel entries + consumption calc
- [ ] Profitability engine (trip margin on complete)
- [ ] Invoices generate-from-trip
- [ ] Dashboard summary KPIs

### Testing
- [ ] Profitability unit tests
- [ ] Auth/RBAC integration tests
- [ ] Trip lifecycle Supertest suite

**Checkpoint:** Backend APIs tested. Ready for frontend integration.

---

## Month 2: Frontend + Integration

**Agents:** Frontend, QA

- [ ] Vite + React + Tailwind scaffold in `apps/web`
- [ ] Apply DESIGN.md tokens (Tailwind config)
- [ ] App shell: sidebar, top bar, routing
- [ ] Dashboard with live KPI cards
- [ ] GPS map (Google Maps) + WebSocket live updates
- [ ] Trip create/dispatch/complete flows
- [ ] Profitability dashboard (hero — 5-click path)
- [ ] Billing invoice list + PDF preview
- [ ] Driver & vehicle management screens
- [ ] Fuel entry form + consumption chart
- [ ] Reports hub + export
- [ ] Mobile responsive + driver view
- [ ] E2E smoke tests for critical flows
- [ ] Client UAT with 10-vehicle test data

**Checkpoint:** Live UI with real data. Production-ready for core features.

---

## Month 3: Advanced Backend

**Agents:** Backend, Architect

- [ ] Geofencing service + alerts
- [ ] Multi-branch schema + APIs
- [ ] E-Way Bill 2.0 integration
- [ ] GST automation on invoices
- [ ] Advanced reporting data warehouse prep
- [ ] IoT sensor framework (pluggable ingest)
- [ ] Maintenance prediction (basic ML)
- [ ] Load testing (100+ vehicles)
- [ ] Security penetration test

**Checkpoint:** Phase 2 backend ready. Scale-tested.

---

## Month 4: Go-Live

**Agents:** All

- [ ] Phase 2 UI: geofencing, multi-branch, E-Way Bill screens
- [ ] Advanced inventory + IoT dashboard
- [ ] Playwright E2E: login → trip → profitability
- [ ] Performance optimization (< 2s dashboard)
- [ ] Production deployment to ysoam.com
- [ ] Backup and DR verification
- [ ] Client training sessions
- [ ] Data migration from client fleet
- [ ] Go-live checklist (see DEPLOYMENT.md)
- [ ] Buffer week: bug fixes, polish

**Checkpoint:** YSOAM live on ysoam.com.

---

## Backlog (Post-Launch)

- Native Android/iOS apps
- Payment gateway integration
- Power BI / Tableau connectors
- Scale to 100+ vehicle enterprise fleets

---

**Document:** TASKS.md  
**Purpose:** Sprint task breakdown and agent assignments for YSOAM
