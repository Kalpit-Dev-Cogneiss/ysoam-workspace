# YSOAM — Architecture Decision Records

**Format:** Context → Decision → Consequences → Status

---

## ADR-001: PostgreSQL over MongoDB

**Status:** Accepted

**Context:** YSOAM stores relational fleet data — trips, invoices, ledger entries, GPS history — with strict consistency requirements for billing.

**Decision:** Use PostgreSQL as the primary database.

**Consequences:**
- ACID transactions for invoice + ledger writes
- Strong foreign keys across fleet entities
- Mature migration tooling
- Trade-off: schema migrations required for structural changes

---

## ADR-002: React + Fastify TypeScript Monorepo

**Status:** Accepted

**Context:** Team needs shared types between frontend and backend. End-to-end TypeScript reduces integration bugs.

**Decision:** React 18 (Vite) frontend + Fastify backend in an Nx Workspace monorepo with `packages/shared`.

**Consequences:**
- Single language across stack
- Shared validators and types
- Trade-off: monorepo tooling overhead at scaffold time

---

## ADR-003: Nx Workspace

**Status:** Accepted

**Context:** Multiple apps and packages (`apps/web`, `apps/api`, `packages/shared`) need linked dependencies, consistent task running, and build caching across the 4-month delivery timeline.

**Decision:** Use Nx Workspace with pnpm 9+ as the package manager. Each project has `project.json` targets; workspace config in `nx.json`.

**Consequences:**
- Task orchestration: `nx serve`, `nx build`, `nx test`, `nx run-many`
- Computation caching and affected-project builds in CI
- pnpm handles fast installs and strict dependency resolution
- Trade-off: Nx config surface (`nx.json`, `project.json`) at scaffold time

---

## ADR-004: Primary Color #0052FF, Light Mode Only

**Status:** Accepted

**Context:** Fleet management UIs use semantic status colors on a light canvas. Client chose no dark mode toggle.

**Decision:** Brand primary `#0052FF`. Light mode only. Dark sidebar `#1E293B` on light content area.

**Consequences:**
- Simpler design system — no theme switching logic
- Status colors (green/amber/red) consistent across maps and tables
- Documented in [DESIGN.md](DESIGN.md)

---

## ADR-005: Profitability Inline Calc + Snapshots

**Status:** Accepted

**Context:** Hero feature requires fast trip P&L on completion and aggregated route/vehicle dashboards.

**Decision:** Compute trip margin on completion event. Store in `profitability_snapshots`. Nightly batch for vehicle/route rollups.

**Consequences:**
- Fast reads for dashboards
- Historical margin preserved even if rates change later
- Trade-off: batch job for aggregates

---

## ADR-006: JWT + TOTP MFA

**Status:** Accepted

**Context:** Enterprise fleet operators require role-based access with admin security baseline.

**Decision:** JWT for API auth. TOTP MFA required for Admin role. RBAC middleware on all protected routes.

**Consequences:**
- Stateless API scaling
- MFA setup flow required in admin UI
- Audit log all auth events

---

## ADR-007: Google Maps for Geocoding and Routing

**Status:** Accepted

**Context:** India market requires reliable geocoding and route display. Team familiarity with Google Maps API.

**Decision:** Google Maps API for map tiles, geocoding, and routing in Phase 1.

**Consequences:**
- API key management via env vars
- Usage-based billing from Google
- Fallback evaluation deferred to Phase 2 if needed

---

**Document:** DECISIONS.md  
**Owner:** Architect Agent  
**Purpose:** Record of significant technical and product decisions for YSOAM
