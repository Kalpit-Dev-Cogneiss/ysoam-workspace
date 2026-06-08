# YSOAM — Deployment

**Platform:** ysoam.com  
**Related:** [ARCHITECTURE.md](ARCHITECTURE.md) · [TESTING.md](TESTING.md) · [AGENTS.md](AGENTS.md)

---

## Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | `dev.ysoam.com` | Active development |
| Staging | `staging.ysoam.com` | QA + client UAT |
| Production | `ysoam.com` | Live fleet operations |

---

## Local Development

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker

### Start infrastructure

```bash
docker compose -f docker/docker-compose.yml up -d
```

Services:
- PostgreSQL on port `5432`
- Redis on port `6379`

### Start application

```bash
pnpm install
nx run api:db-migrate
nx run api:db-seed
nx run-many -t serve -p web,api
```

| Service | Port |
|---------|------|
| Web (Vite) | 5173 |
| API (Fastify) | 3000 |

### Environment files

Copy `.env.example` to `.env` in `apps/web` and `apps/api`. Never commit `.env`.

---

## Production Infrastructure

| Component | Target |
|-----------|--------|
| Cloud | AWS or GCP (TBD) |
| Containers | Docker |
| Orchestration | Docker Compose (Phase 1) · Kubernetes (Phase 2) |
| Database | Managed PostgreSQL |
| Cache | Managed Redis |
| Object storage | S3-compatible (documents, invoices) |
| CDN | CloudFront or Cloud CDN (static assets) |
| SSL | TLS 1.2+ via load balancer |
| DNS | ysoam.com → production load balancer |

---

## CI/CD (GitHub Actions)

Pipeline on every PR to `main`:

1. `pnpm install`
2. `nx run-many -t lint,typecheck,test,build`
3. `nx affected -t lint,typecheck,test,build` (on PRs — changed projects only)

Deploy to staging on merge to `main`. Production deploy requires manual approval gate.

Workflow location: `.github/workflows/ci.yml`

---

## Secrets Management

- All secrets via environment variables or cloud secret manager
- Never store secrets in repo, Dockerfile, or CI logs
- Rotate JWT signing keys and API keys quarterly
- Telematics ingest API keys per organization

---

## SLA Targets

| Metric | Target |
|--------|--------|
| Uptime | 99.5% |
| Dashboard load | < 2 seconds |
| API p95 latency | < 500ms |
| Backup frequency | Daily automated |
| RPO | 24 hours |
| RTO | 4 hours |

---

## Go-Live Checklist (Month 4)

- [ ] All 19 modules operational (Phase 1 + Phase 2)
- [ ] 10-vehicle test fleet running on production
- [ ] Profitability visible in 5 clicks
- [ ] Security audit and penetration test passed
- [ ] Backup and disaster recovery tested
- [ ] DNS ysoam.com pointing to production
- [ ] SSL certificate valid
- [ ] Monitoring and alerting configured
- [ ] Client training completed
- [ ] Data migration from client test data verified

---

## Rollback

1. Revert to previous Docker image tag in deployment config
2. Run down migration only if schema change is backward-compatible
3. Notify client if data-affecting rollback required

---

**Document:** DEPLOYMENT.md  
**Purpose:** Environment setup, CI/CD, and go-live procedures for YSOAM
