# YSOAM — API Reference

**Base URL:** `/api/v1`  
**Auth:** `Authorization: Bearer <jwt>`  
**Related:** [ARCHITECTURE.md](ARCHITECTURE.md) · [DATABASE.md](DATABASE.md)

---

## Conventions

| Rule | Value |
|------|-------|
| Base path | `/api/v1` |
| Auth header | `Authorization: Bearer <jwt>` |
| Pagination | `?page=1&limit=20` |
| Sort | `?sort=-created_at` |
| Filter | `?status=active&vehicle_id=uuid` |
| Error shape | `{ "error": { "code": "...", "message": "..." } }` |
| IDs | UUID v4 |
| Timestamps | ISO 8601 UTC |
| Currency | INR (₹), paise as integer |

### WebSocket (GPS)

- Namespace: `/ws/fleet`
- Room: `org:{organization_id}`
- Events: `vehicle:location`, `vehicle:status`, `trip:updated`, `alert:new`

---

## Example Endpoints

### POST /api/v1/auth/login

**Request:**
```json
{
  "email": "manager@fleet.example",
  "password": "********"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "mfa_required": false,
  "user": {
    "id": "uuid",
    "role": "manager",
    "name": "Fleet Manager"
  }
}
```

### POST /api/v1/trips

**Request:**
```json
{
  "origin": "Mumbai",
  "destination": "Pune",
  "customer_id": "uuid",
  "rate_type": "fixed",
  "rate_amount_paise": 450000,
  "vehicle_type": "heavy"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "status": "created",
  "origin": "Mumbai",
  "destination": "Pune",
  "created_at": "2026-06-08T10:00:00Z"
}
```

### POST /api/v1/trips/:id/dispatch

**Request:**
```json
{
  "vehicle_id": "uuid",
  "driver_id": "uuid"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "pickup",
  "vehicle_id": "uuid",
  "driver_id": "uuid"
}
```

### GET /api/v1/gps/vehicles/live

**Response (200):**
```json
{
  "vehicles": [
    {
      "id": "uuid",
      "registration": "MH-12-AB-1234",
      "lat": 19.076,
      "lng": 72.877,
      "speed_kmh": 45,
      "status": "in_transit",
      "driver_name": "Raj Kumar",
      "updated_at": "2026-06-08T10:05:00Z"
    }
  ]
}
```

### GET /api/v1/trips/:id/profitability

**Response (200):**
```json
{
  "trip_id": "uuid",
  "revenue_paise": 450000,
  "fuel_cost_paise": 210000,
  "driver_advance_paise": 50000,
  "maintenance_est_paise": 45000,
  "margin_paise": 145000,
  "margin_percent": 32.2
}
```

### POST /api/v1/invoices/generate-from-trip/:tripId

**Response (201):**
```json
{
  "id": "uuid",
  "trip_id": "uuid",
  "invoice_number": "INV-2026-0042",
  "total_paise": 450000,
  "gst_paise": 81000,
  "status": "draft",
  "pdf_url": "/api/v1/invoices/uuid/pdf"
}
```

---

## Module API Reference (All 19)

### Module 1: Core Platform — `/dashboard`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/login` | Authenticate |
| POST | `/api/v1/auth/mfa/verify` | Verify TOTP |
| POST | `/api/v1/auth/refresh` | Refresh token |
| GET | `/api/v1/dashboard/summary` | KPI summary |
| GET | `/api/v1/notifications` | List notifications |
| PATCH | `/api/v1/notifications/:id/read` | Mark read |
| GET | `/api/v1/users` | List users |
| POST | `/api/v1/users` | Create user |
| PATCH | `/api/v1/users/:id` | Update user |
| GET | `/api/v1/audit-logs` | Activity log |

### Module 2: GPS — `/gps`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/gps/vehicles/live` | All live positions |
| GET | `/api/v1/gps/vehicles/:id/location` | Single vehicle |
| GET | `/api/v1/gps/vehicles/:id/history` | Location history |
| GET | `/api/v1/gps/vehicles/:id/playback` | Playback route |
| POST | `/api/v1/gps/ingest` | Telematics webhook |
| GET/POST | `/api/v1/geofences` | Geofence CRUD (P2) |

### Module 3: Vehicles — `/vehicles`

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/v1/vehicles` | List/create |
| GET/PATCH/DELETE | `/api/v1/vehicles/:id` | CRUD |
| GET | `/api/v1/vehicles/:id/metrics` | Utilization KPIs |
| GET | `/api/v1/vehicles/:id/compliance` | Compliance status |

### Module 4: Drivers — `/drivers`

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/v1/drivers` | List/create |
| GET/PATCH | `/api/v1/drivers/:id` | CRUD |
| POST | `/api/v1/drivers/:id/assign` | Assign to vehicle |
| GET | `/api/v1/drivers/:id/metrics` | Performance KPIs |

### Module 5: Trips — `/trips`

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/v1/trips` | List/create |
| GET/PATCH | `/api/v1/trips/:id` | CRUD |
| POST | `/api/v1/trips/:id/dispatch` | Assign driver/vehicle |
| PATCH | `/api/v1/trips/:id/status` | Update status |
| GET | `/api/v1/trips/:id/profitability` | Trip P&L |
| POST | `/api/v1/trips/:id/checkpoints` | Add checkpoint |

### Module 6: Fuel — `/fuel`

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/v1/fuel/entries` | List/create entries |
| GET | `/api/v1/fuel/vehicles/:id/consumption` | Consumption stats |
| GET | `/api/v1/fuel/anomalies` | Flagged anomalies |

### Module 7: Tyres — `/tyres`

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/v1/tyres` | List/create |
| PATCH | `/api/v1/tyres/:id/allocate` | Assign to position |
| GET | `/api/v1/tyres/vehicles/:id` | Tyres on vehicle |
| POST | `/api/v1/tyres/:id/replace` | Record replacement |

### Module 8: Maintenance — `/maintenance`

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/v1/maintenance/breakdowns` | Breakdown CRUD |
| GET/POST | `/api/v1/maintenance/repairs` | Repair records |
| GET | `/api/v1/maintenance/schedules` | Service schedules |
| GET | `/api/v1/maintenance/downtime` | Downtime analytics |

### Module 9: Billing — `/billing`

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/v1/invoices` | List/create |
| GET | `/api/v1/invoices/:id/pdf` | Download PDF |
| POST | `/api/v1/invoices/generate-from-trip/:tripId` | Auto-generate |
| GET | `/api/v1/customers/:id/ledger` | Customer balance |
| GET/POST | `/api/v1/driver-advances` | Advance CRUD |
| POST | `/api/v1/eway-bill/generate` | E-Way Bill (P2) |

### Module 10: Inventory — `/inventory`

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/v1/inventory/items` | CRUD |
| PATCH | `/api/v1/inventory/items/:id/adjust` | Stock adjustment |
| GET | `/api/v1/inventory/low-stock` | Below threshold |
| GET | `/api/v1/inventory/audit-log` | Change history |

### Module 11: Documents — `/documents`

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/v1/documents` | List/upload |
| GET | `/api/v1/documents/:id/download` | Download file |
| GET | `/api/v1/documents/expiring` | Expiring soon |
| DELETE | `/api/v1/documents/:id` | Remove |

### Module 12: Reports — `/reports`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/reports/profitability/trips` | Trip margins |
| GET | `/api/v1/reports/profitability/vehicles` | Vehicle margins |
| GET | `/api/v1/reports/profitability/routes` | Route margins |
| GET | `/api/v1/reports/fuel` | Fuel report |
| GET | `/api/v1/reports/idle` | Idle report |
| POST | `/api/v1/reports/export` | PDF/Excel export |

### Module 13: AI — `/ai`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/ai/recommendations` | Active recommendations |
| GET | `/api/v1/ai/drivers/:id/risk-score` | Driver risk 0–100 |
| GET | `/api/v1/ai/anomalies` | Detected anomalies |

### Module 14: IoT — `/iot`

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/v1/iot/devices` | Device registry |
| POST | `/api/v1/iot/ingest` | Sensor data webhook |
| GET | `/api/v1/iot/devices/:id/readings` | Recent readings |

### Module 15: Driver View — `/driver`

Reuses `/api/v1/trips` and `/api/v1/fuel/entries` with Driver RBAC scope.

### Module 16: Admin — `/admin`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/admin/health` | System health |
| GET/POST | `/api/v1/admin/api-keys` | API key management |
| GET | `/api/v1/admin/backups` | Backup status |

### Module 17: Battery — `/battery`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/battery/vehicles/:id` | Battery status |
| GET | `/api/v1/battery/vehicles/:id/history` | Reading history |
| GET | `/api/v1/battery/alerts` | Low/critical alerts |

### Module 18: Settings — `/settings`

| Method | Path | Description |
|--------|------|-------------|
| GET/PATCH | `/api/v1/settings/organization` | Org settings |
| GET/PATCH | `/api/v1/settings/notifications` | Notification prefs |
| GET/POST | `/api/v1/settings/integrations` | Integration config |

### Module 19: Roadmap — `/roadmap`

No backend in MVP — UI placeholder only.

---

**Document:** API.md  
**Purpose:** REST and WebSocket API reference for YSOAM
