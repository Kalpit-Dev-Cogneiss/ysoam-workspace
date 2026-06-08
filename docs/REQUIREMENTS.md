# YSOAM — Requirements

**Related:** [PRODUCT.md](PRODUCT.md) · [TESTING.md](TESTING.md) · [API.md](API.md)

Format: Fields · Permissions · Acceptance Criteria per feature.

---

## Phase 1 — Hero Features (Full Detail)

### Authentication & RBAC

**Fields:** email, password, TOTP code (if MFA enabled)  
**Roles:** Admin, Manager, Operator, Driver  
**Permissions:**
- Admin: full access + user management
- Manager: all ops + reports
- Operator: trips, GPS, fuel, assigned fleet
- Driver: own trips, fuel log, mobile view

**Acceptance Criteria:**
- [ ] User logs in with email/password
- [ ] Admin prompted for MFA on login
- [ ] JWT issued with role claim
- [ ] API returns 403 for unauthorized role
- [ ] Driver cannot access billing or admin routes

---

### Create Trip

**Fields:** origin, destination, customer_id, rate_type (fixed/per_km), rate_amount, vehicle_type (light/heavy)  
**Permissions:** Admin, Manager, Operator

**Acceptance Criteria:**
- [ ] Trip saved with status `created`
- [ ] Origin and destination stored; route_key computed
- [ ] Trip appears in trip list immediately
- [ ] Validation rejects missing customer or zero rate

---

### Dispatch Trip

**Fields:** vehicle_id, driver_id  
**Permissions:** Admin, Manager, Operator

**Acceptance Criteria:**
- [ ] Status changes to `pickup`
- [ ] Vehicle and driver assigned
- [ ] Vehicle appears on GPS map as in-transit
- [ ] Driver receives notification (web push Phase 1)

---

### Trip Lifecycle

**Status flow:** `created → pickup → in_transit → delivery → completed`  
**Permissions:** Admin, Manager, Operator (Driver: update own trip checkpoints)

**Acceptance Criteria:**
- [ ] Status transitions follow valid flow only
- [ ] Checkpoints recorded with timestamp
- [ ] On `completed`, profitability engine runs
- [ ] Completed trip shows inline P&L

---

### GPS Live Tracking

**Fields:** lat, lng, speed, ignition, vehicle_id  
**Permissions:** Admin, Manager, Operator (Driver: own vehicle)

**Acceptance Criteria:**
- [ ] All active vehicles visible on map within 30s of update
- [ ] Markers color-coded by status (DESIGN.md tokens)
- [ ] Offline alert when no signal > 5 min
- [ ] Playback shows historical route for date range

---

### Trip Profitability

**Formula:** Revenue − (Fuel + Advance + Maintenance Est.)  
**Maintenance:** ₹2/km light · ₹3/km heavy  
**Permissions:** Admin, Manager, Operator (view); Owner via reports

**Acceptance Criteria:**
- [ ] Margin computed on trip completion
- [ ] P&L breakdown shows each cost line
- [ ] Margin % displayed; negative margin in red
- [ ] Recalculates when fuel entry linked post-completion

---

### Auto-Invoice from Trip

**Fields:** trip_id → invoice with GST line items  
**Permissions:** Admin, Manager, Accountant role (Manager in Phase 1)

**Acceptance Criteria:**
- [ ] Invoice auto-generated from completed trip
- [ ] GST line items included
- [ ] PDF downloadable
- [ ] Customer ledger updated with outstanding balance

---

### Profitability Dashboard

**Views:** Trip list, Vehicle ranking, Route ranking  
**Permissions:** Admin, Manager, Owner  
**UX:** 5-click path from dashboard to trip P&L detail

**Acceptance Criteria:**
- [ ] Trip tab shows margin per trip, sortable
- [ ] Vehicle tab shows cumulative profit and avg/trip
- [ ] Route tab shows best/worst routes by margin
- [ ] Drill-down from trip row to P&L breakdown
- [ ] Export to PDF/Excel

---

## Phase 1 — Supporting Modules (Summary)

| Module | Phase 1 Requirements | Acceptance |
|--------|---------------------|------------|
| Vehicles | CRUD, status, capacity | List, detail, status badge |
| Drivers | CRUD, assign to vehicle | Profile, license expiry alert |
| Fuel | Manual entry, consumption calc | km/L shown, anomaly flag |
| Maintenance | Breakdown log, repair history | Downtime duration tracked |
| Billing | Invoice list, customer ledger | Ledger balance correct |
| Inventory | Stock list, low-stock alert | Alert when below threshold |
| Documents | Upload, expiry date | Expiry warning 30 days before |
| Reports | Daily vehicle, fuel reports | Export works |
| Admin | User CRUD, activity log | Role assignment enforced |
| Driver View | Mobile trip list, fuel log | Touch-friendly, 44px targets |

---

## Phase 2 — Advanced (Summary)

| Module | Key Requirements |
|--------|-----------------|
| GPS | Geofencing, route optimization, heatmaps |
| Vehicles | RC/insurance/permit expiry tracking |
| Drivers | Attendance, behavior scoring |
| Trips | Auto-assign, multi-stop routing |
| Fuel | Sensor integration, AdBlue |
| Billing | E-Way Bill 2.0, payment gateway |
| AI | Predictive maintenance, NL assistant |
| IoT | Live fuel sensor, CAN bus |
| Mobile | Native Android/iOS apps |
| Multi-branch | Branch selector, per-branch fleet |

---

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Dashboard load | < 2 seconds |
| Uptime | 99.5% |
| Concurrent vehicles (MVP) | 10 (scale to 1000+) |
| Theme | Light mode only |
| Primary color | `#0052FF` |
| Accessibility | WCAG 2.1 AA |
| Data residency | India cloud region preferred |

---

**Document:** REQUIREMENTS.md  
**Owner:** QA Agent (acceptance criteria) · Product (scope)  
**Purpose:** Feature requirements and acceptance criteria for YSOAM
