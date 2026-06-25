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
**UI spec:** [PROTOTYPE_UI.md](PROTOTYPE_UI.md) — list pages, filters, forms, Vendors, Geofences, Settings  
**Run:** `npx serve prototype -l 3456` · Demo user: Rajesh Kumar (`rajesh.kumar@ysoam.demo`)

### Shell & navigation
- [x] Scaffold `prototype/` folder with shared CSS tokens from DESIGN.md
- [x] Build sidebar nav linking module screens (MVP + Full editions via `shell.js`)
- [x] Login + edition routing (`mvp.html` / `full.html`)
- [x] MVP sidebar — **Parts & Inventory** submenu (Parts List, Part Outward, Parts Consumption)
- [x] MVP sidebar — **Settings** (main nav) + org menu
- [x] MVP sidebar — **Fuel & Energy** expanded by default (**Tyre Management**, **Battery Management**)
- [x] MVP mobile bottom nav — Tyres + Settings shortcuts
- [x] **Alerts** in sidebar (MVP + Full) + topbar bell → `alerts.html`

### Core module screens
- [x] Dashboard — KPI widgets, alerts, quick links
- [x] GPS — Leaflet live map, nearby panel, trip playback
- [x] Trips — list, create/dispatch modals, trip detail, inline P&L hints
- [x] Reports — profitability hero layout, trip/vehicle/route tabs
- [x] Billing — invoice preview cards, customer ledger, links to trips/reports
- [x] Vehicles — list, detail, form, assignments, meter history, expenses, replacement analysis
- [x] Drivers — list, contact detail/form, user view
- [x] Service — work orders (list/form/view), service history, service tasks
- [x] Fuel & Energy — fuel history, charging history, **Tyre Management**, **Battery Management**
- [x] Parts & Inventory — Parts List (filters, form, detail), **Part Outward** (issue to vehicle), **Parts Consumption Analysis** (vehicle/category analytics); `inventory.html` bulk manage remains stub
- [x] Geofences — list, form (map tools), detail
- [x] Vendors — list, filters, add/edit form, detail, row actions
- [x] Documents — list + document detail
- [x] User Management — list, filters, invite flow (linked from Settings)
- [x] Driver View — mobile-style tabs (trips, fuel, profile, **alerts**)
- [x] **Alerts** — central hub (fuel, documents, maintenance, geofence, idle, harsh driving, breakdowns, trips) with read/unread + severity filters; detail view; driver mobile tab
- [x] Roadmap — future feature placeholders

### Settings hub (`settings.html`)
Fleetio-style secondary sidebar inside app shell. Deep link: `settings?section=<id>`. Demo org: **YSOAM Demo Fleet**.

**User & org**
- [x] User Profile
- [x] Notification Settings (per record type)
- [x] Login & Password
- [ ] Appearance & Theme (nav stub)
- [x] Manage API Keys (+ create modal)
- [x] General Settings
- [x] Billing & Subscriptions (+ plan picker panel)
- [x] Export Account Data

**User access**
- [x] Security (2FA, session timeout, IP allowlist)
- [x] Roles (+ add role modal)
- [x] Record Sets (+ add record set modal)
- [x] Manage Users → external link to `user-management.html`

**Vehicles**
- [x] Vehicle Statuses (+ color picker modal, drag reorder)
- [x] Vehicle Types
- [x] External Vehicle IDs
- [x] Expense Types (+ modal)

**Inspections, issues, reminders**
- [x] Inspection Settings
- [x] Issue Priorities
- [x] Fault Rules (+ modal)
- [x] Service Reminder Settings
- [x] Vehicle Renewal Types (+ modal)
- [x] Contact Renewal Types (+ modal)

**Service**
- [x] Maintenance Settings
- [x] Work Order Statuses
- [x] Reason For Repair Codes (+ modal)
- [x] Repair Priority Class Codes
- [x] System/Assembly/Component Codes (VMRS drill-down)

**Parts & inventory**
- [x] Part Locations (active/archived tabs + modal)
- [x] Part Categories (+ modal)
- [x] Part Manufacturers (+ modal)
- [x] Measurement Units (+ modal)

**Fuel & energy**
- [x] Fuel & Energy Settings
- [x] Fuel Types (+ modal)

**Settings JS:** `settings.js`, `settings-{notifications,login-password,api-keys,general,billing,export,security,roles,record-sets,vehicles,ops,service,parts-fuel}.js` + matching `*-data.js` where needed.

### Module stubs (linked in nav, placeholder card only)
- [ ] Maintenance / Service Programs (`maintenance.html`)
- [ ] Fuel hub landing (`fuel.html` — history screens are built)
- [x] Tyre Management (`tyres.html` — also under Fuel & Energy) — list, view, add/edit reading
- [x] Battery Management (`battery.html` — also under Fuel & Energy) — list, view
- [ ] Admin (`admin.html` — use `user-management.html` for users)
- [ ] AI Intelligence (`ai.html`)
- [ ] IoT & Sensors (`iot.html`)

### Prototype polish (remaining)
- [ ] Mobile responsive pass: 375px, 768px, 1280px
- [ ] Demo flow: GPS → Trip → Profitability → Invoice
- [ ] 5-click profitability path verified end-to-end
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
