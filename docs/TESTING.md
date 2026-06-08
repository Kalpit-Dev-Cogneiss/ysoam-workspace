# YSOAM — Testing Strategy

**Related:** [REQUIREMENTS.md](REQUIREMENTS.md) · [AGENTS.md](AGENTS.md) · [API.md](API.md)

---

## Overview

YSOAM uses a layered testing strategy. Agents must run tests before claiming work complete. Never delete failing tests to pass CI.

---

## Test Layers

| Layer | Tool | Scope |
|-------|------|-------|
| API unit | Vitest | Services, profitability calc, validators |
| Web unit | Vitest + React Testing Library | Components, hooks |
| API integration | Supertest | `/api/v1/*` routes, auth, RBAC |
| E2E (Phase 2) | Playwright | Critical user flows |

---

## Commands

| Command | Purpose |
|---------|---------|
| `nx run-many -t test` | Run all project tests |
| `nx test api` | Backend tests only |
| `nx test web` | Frontend tests only |
| `nx run-many -t typecheck` | TypeScript validation (run with tests) |
| `nx affected -t test` | Tests for changed projects only (CI) |

---

## Coverage Priorities

### Must have tests (Phase 1)

1. **Profitability engine** — trip margin, vehicle rollup, route average
2. **Auth + RBAC** — login, JWT validation, role middleware
3. **Trip lifecycle** — create → dispatch → status transitions → complete
4. **GPS ingest** — webhook payload validation, location storage
5. **Invoice generation** — auto-invoice from completed trip

### Phase 2

- Geofence entry/exit events
- E-Way Bill generation
- Playwright E2E: login → create trip → view profitability → export report

---

## Profitability Test Cases

```
Given: trip revenue ₹4,500, fuel ₹2,100, advance ₹500, 225km heavy vehicle
When: margin calculated
Then: maintenance est = 225 × ₹3 = ₹675
      margin = 4500 - 2100 - 500 - 675 = ₹1,225
      margin % ≈ 27.2%
```

```
Given: trip with zero revenue
When: margin calculated
Then: margin is negative; margin_percent handled without division by zero
```

---

## API Integration Test Pattern

```typescript
// Example structure — apps/api/tests/trips.test.ts
describe('POST /api/v1/trips', () => {
  it('creates trip with status created', async () => {
    const res = await request(app)
      .post('/api/v1/trips')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ origin: 'Mumbai', destination: 'Pune', ... });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('created');
  });

  it('rejects operator creating trip for other org', async () => {
    // RBAC negative test
  });
});
```

---

## Frontend Test Pattern

- Test `KpiCard`, `StatusBadge`, `ProfitBreakdownCard` render correct colors per DESIGN.md tokens
- Test trip stepper shows correct step for each status
- Mock TanStack Query and Socket.io — do not hit live API in unit tests

---

## E2E Flows (Phase 2)

| Flow | Steps |
|------|-------|
| Profitability hero | Login → Reports → Profitability → click trip → see P&L |
| Trip ops | Login → Create trip → Dispatch → Complete → Invoice generated |
| GPS | Login → Map → select vehicle → playback route |

---

## Acceptance Criteria Traceability

Each feature in [REQUIREMENTS.md](REQUIREMENTS.md) should map to at least one test:

| Requirement | Test location |
|-------------|---------------|
| Create Trip | `apps/api/tests/trips.test.ts` |
| Trip profitability | `apps/api/tests/profitability.test.ts` |
| RBAC | `apps/api/tests/auth.test.ts` |
| Profitability dashboard | `apps/web/src/...` component tests |

---

## Agent Rules

- Run `nx run-many -t test,typecheck` before marking task done
- Add tests when changing profitability, auth, or RBAC
- Do not skip or delete failing tests
- Do not claim CI passes without local verification
- QA Agent owns this document and test coverage gaps

---

**Document:** TESTING.md  
**Purpose:** Testing strategy and agent rules for YSOAM quality assurance
