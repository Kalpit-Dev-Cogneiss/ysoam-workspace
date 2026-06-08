# YSOAM — Database Schema

**Database:** PostgreSQL 15+  
**Migrations:** `nx run api:db-migrate`  
**Seed:** `nx run api:db-seed` (10-vehicle Mumbai/Pune sample fleet)  
**Related:** [ARCHITECTURE.md](ARCHITECTURE.md) · [API.md](API.md)

---

## Entity Relationship

```
Organization ──┬── Branch (Phase 2)
               ├── User ── Role
               ├── Vehicle ──┬── Driver (assignment)
               │             ├── Trip
               │             ├── FuelEntry
               │             ├── MaintenanceRecord
               │             ├── Tyre
               │             └── BatteryReading
               ├── Customer ── Invoice
               ├── Geofence (Phase 2)
               ├── InventoryItem
               └── Document
```

---

## Core Tables

### organizations

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | VARCHAR(255) | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### users

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| organization_id | UUID FK → organizations | |
| email | VARCHAR(255) UNIQUE | |
| password_hash | VARCHAR | |
| role | ENUM | admin, manager, operator, driver |
| name | VARCHAR(255) | |
| mfa_secret | VARCHAR NULL | TOTP |
| created_at | TIMESTAMPTZ | |

**Index:** `(organization_id, email)`

### vehicles

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| organization_id | UUID FK | |
| branch_id | UUID FK NULL | Phase 2 |
| registration | VARCHAR(20) | e.g. MH-12-AB-1234 |
| make | VARCHAR(100) | |
| model | VARCHAR(100) | |
| vehicle_type | ENUM | light, heavy |
| capacity_kg | INTEGER | |
| status | ENUM | active, inactive, maintenance |
| created_at | TIMESTAMPTZ | |

**Index:** `(organization_id, status)`

### drivers

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| organization_id | UUID FK | |
| name | VARCHAR(255) | |
| phone | VARCHAR(20) | |
| license_number | VARCHAR(50) | |
| license_expires_at | DATE | |
| status | ENUM | active, on_leave, terminated |
| created_at | TIMESTAMPTZ | |

### vehicle_driver_assignments

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| vehicle_id | UUID FK → vehicles | |
| driver_id | UUID FK → drivers | |
| assigned_at | TIMESTAMPTZ | |
| unassigned_at | TIMESTAMPTZ NULL | |

### trips

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| organization_id | UUID FK | |
| vehicle_id | UUID FK NULL | set on dispatch |
| driver_id | UUID FK NULL | set on dispatch |
| customer_id | UUID FK → customers | |
| origin | VARCHAR(255) | |
| destination | VARCHAR(255) | |
| route_key | VARCHAR(64) | hash(origin+destination) |
| status | ENUM | created, pickup, in_transit, delivery, completed |
| rate_type | ENUM | fixed, per_km |
| rate_amount_paise | INTEGER | |
| distance_km | DECIMAL | |
| started_at | TIMESTAMPTZ NULL | |
| completed_at | TIMESTAMPTZ NULL | |
| created_at | TIMESTAMPTZ | |

**Index:** `(organization_id, status, created_at DESC)`

### trip_checkpoints

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| trip_id | UUID FK → trips | |
| type | ENUM | loading, unloading |
| location | VARCHAR(255) | |
| recorded_at | TIMESTAMPTZ | |

### gps_locations

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| vehicle_id | UUID FK → vehicles | |
| lat | DECIMAL(10,7) | |
| lng | DECIMAL(10,7) | |
| speed_kmh | DECIMAL | |
| ignition_on | BOOLEAN | |
| recorded_at | TIMESTAMPTZ | |

**Index:** `(vehicle_id, recorded_at DESC)` — playback queries

### fuel_entries

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| vehicle_id | UUID FK | |
| trip_id | UUID FK NULL | |
| liters | DECIMAL | |
| cost_paise | INTEGER | |
| odometer_km | DECIMAL | |
| recorded_at | TIMESTAMPTZ | |

### customers

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| organization_id | UUID FK | |
| name | VARCHAR(255) | |
| gstin | VARCHAR(15) NULL | |
| created_at | TIMESTAMPTZ | |

### invoices

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| organization_id | UUID FK | |
| customer_id | UUID FK | |
| trip_id | UUID FK NULL | |
| invoice_number | VARCHAR(50) | |
| subtotal_paise | INTEGER | |
| gst_paise | INTEGER | |
| total_paise | INTEGER | |
| status | ENUM | draft, sent, paid, overdue |
| issued_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

### invoice_line_items

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| invoice_id | UUID FK | |
| description | VARCHAR(255) | |
| amount_paise | INTEGER | |
| gst_rate_percent | DECIMAL | |

### profitability_snapshots

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| trip_id | UUID FK NULL | |
| vehicle_id | UUID FK NULL | |
| route_key | VARCHAR(64) NULL | |
| revenue_paise | INTEGER | |
| fuel_cost_paise | INTEGER | |
| driver_advance_paise | INTEGER | |
| maintenance_est_paise | INTEGER | |
| margin_paise | INTEGER | |
| margin_percent | DECIMAL | |
| computed_at | TIMESTAMPTZ | |

**Index:** `(route_key, computed_at DESC)`

---

## Additional Tables (Reference)

| Table | Purpose |
|-------|---------|
| `branches` | Multi-location (Phase 2) |
| `customer_ledger_entries` | Customer balance tracking |
| `driver_advances` | Advance per trip |
| `maintenance_records` | Breakdowns and repairs |
| `workshops` | Repair workshop contacts |
| `maintenance_schedules` | Preventive service calendar |
| `tyres` | Tyre allocation and lifecycle |
| `tyre_replacements` | Replacement history |
| `inventory_items` | Spare parts stock |
| `inventory_transactions` | Stock adjustments |
| `documents` | File metadata (polymorphic entity) |
| `fuel_anomalies` | Theft detection flags |
| `geofences` | Zone definitions (P2) |
| `geofence_events` | Entry/exit events (P2) |
| `audit_logs` | User action audit trail |
| `notifications` | In-app alerts |
| `iot_devices` | Sensor registry |
| `sensor_readings` | IoT data |
| `battery_readings` | EV battery telemetry |
| `battery_replacements` | Battery replacement history |
| `ai_recommendations` | ML recommendations |
| `driver_risk_scores` | Driver risk 0–100 |

---

## Indexing Priorities

- `gps_locations(vehicle_id, recorded_at DESC)` — route playback
- `trips(organization_id, status, created_at)` — dashboard filters
- `profitability_snapshots(route_key, computed_at)` — route analytics
- `documents(entity_type, entity_id, expires_at)` — expiry alerts

---

## Migrations

- Tool: node-pg-migrate or Drizzle (TBD at scaffold)
- Location: `apps/api/migrations/`
- Naming: `YYYYMMDDHHMMSS_description.sql`
- Never edit applied migrations — create new ones

---

## Seed Data

`nx run api:db-seed` loads:

- 1 organization (demo fleet operator)
- 4 users (admin, manager, operator, driver)
- 10 vehicles (MH registration plates)
- 5 drivers
- Sample trips: Mumbai → Pune, Mumbai → Delhi
- GPS location history for playback demo
- 3 customers with ledger entries

---

**Document:** DATABASE.md  
**Purpose:** PostgreSQL schema reference for YSOAM
