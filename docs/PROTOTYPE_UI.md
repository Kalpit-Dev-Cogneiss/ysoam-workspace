# YSOAM — Prototype UI Specification

**Audience:** Frontend developers implementing or extending the HTML prototype  
**Reference:** Fleetio-style fleet operations UI, adapted to YSOAM tokens in [DESIGN.md](DESIGN.md)  
**Run locally:** `npx serve prototype -l 3456` → `http://localhost:3456`

---

## Design Intent

The prototype mirrors **enterprise fleet SaaS** patterns (dense data tables, filter toolbars, slide-out drawers, card-based forms). Visual language follows YSOAM — not Fleetio green:

| Fleetio pattern | YSOAM token |
|-----------------|-------------|
| Primary CTA / links | `{colors.primary}` `#0052FF` |
| Sidebar | `{colors.sidebar}` `#1E293B` |
| Page canvas | `{colors.canvas}` / `{colors.cloud}` |
| Table hover | `{colors.primary-soft}` |
| Muted text / empty cells | `{colors.steel}` `—` |
| Font | Inter (400 body, 500–600 labels, 600–700 titles) |

**Do not** introduce per-module accent colors. Reuse shared CSS classes in `prototype/css/pages.css` and `prototype/css/components.css`.

---

## Shared File Conventions

| Layer | Location | Notes |
|-------|----------|-------|
| Page shell | `prototype/*.html` | `data-page` on `<body>` for nav highlight; optional `data-subpage` for forms |
| Page logic | `prototype/js/*.js` | IIFE, `'use strict'`, guard init with `data-page` / `data-subpage` |
| Demo data | `prototype/js/*-data.js` | `window.YSOAM_*` global objects |
| Shared nav | `prototype/js/shell.js` | Sidebar + topbar injected into `#sidebar-root` / `#topbar-root` |
| Icons | `prototype/js/icons.js`, `lucide-icons.js` | Sidebar uses `YSOAM_ICONS`; tables/toolbars use Lucide via `data-lucide-icon` |
| Styles | `prototype/css/pages.css` | One block per module: `.content--{module}` |

### Reference implementations (copy these patterns)

| Pattern | Reference files |
|---------|-----------------|
| List + tabs + filters + drawer | `parts.html`, `js/parts.js`, `geofences.html`, `js/geofences.js` |
| Settings secondary nav + panels | `settings.html`, `js/settings.js`, `js/settings-vehicles.js` |
| Filter popovers (select + text) | `js/parts.js`, `js/geofences.js`, `js/vendors.js` |
| Row ⋯ menu | `js/work-orders.js`, `js/vendors.js` |
| Add/Edit form (card sections) | `contact-form.html`, `part-form.html`, `vendor-form.html` |
| Detail page (hero + tabs) | `user-view.html`, `geofence-view.html`, `part-view.html` |
| Split form + map | `geofence-form.html`, `js/geofence-form.js` |

### Constraints

- **Do not modify** `prototype/vehicles.html` or `.content--vehicles` CSS unless explicitly requested.
- Prototype actions (Save, Archive, View) use `window.alert()` stubs — no backend.
- Row click navigates to detail where implemented; links/buttons inside rows call `event.stopPropagation()`.

---

## List Page Pattern

Used by: Parts, Geofences, Vendors, Work Orders, Fuel History, etc.

```
┌─────────────────────────────────────────────────────────────┐
│ Page title                              [secondary] [+ Add] │
├─────────────────────────────────────────────────────────────┤
│ Tabs: All | Tab2 | Tab3 | … | + Add Tab                     │
├─────────────────────────────────────────────────────────────┤
│ [Search] [Filter pill] [Filter pill] … [Filters btn]        │
│                              1–15 of 15  ◀ ▶  ⚙  Save View  │
├─────────────────────────────────────────────────────────────┤
│ Table (scrollable)                          │ Filters drawer│
└─────────────────────────────────────────────────────────────┘
```

### Structure (HTML)

- `main.content.content--{module}`
- `page-header` — title + actions
- `st-view-tabs` — horizontal tabs (`st-view-tab.is-active`)
- `panel.table-panel.{module}-panel` — relative container for popovers
- `{module}-toolbar` — search, filter pills, pagination right cluster
- `{module}-body` — table wrap + `expense-filters-drawer` aside
- `expense-filter-popover` — anchored dropdown(s)
- `expense-table-settings` — gear popover (columns / page size)

### Filter pills

Pill buttons use class `expense-filter-pill`:

- `has-filter` — active filter applied
- `is-open` — popover open (light primary-soft background)

### Filter popover types

**Multi-select** (`meter-popover--select`)

- Search input placeholder: `Select item(s)`
- Checkbox list in `meter-popover__list`
- Footer: **Cancel** (text) + **Apply** (primary; disabled until ≥1 selected)

**Text search** (`meter-popover--text`)

- Single input placeholder: `Search text`
- Footer: **Cancel** + **Apply** (disabled until non-empty)

**Number** (`meter-popover--number`) — used on Geofences (radius)

- Input placeholder: `Search number`

### Filters drawer

Class `expense-filters-drawer.is-open` slides in from the right.

- Header: **Filters** + close (×)
- Empty state: `No filters applied.`
- **Add Filter** button (primary, with chevron)
- **Popular Filters** — green text links that open the matching pill popover

### Table

- Wrapper: `data-table-wrap data-table-wrap--scroll data-table-wrap--{module}`
- Table: `data-table data-table--list data-table--{module}`
- Checkbox column: `data-table__check-col`
- Row actions: `data-table__actions-col` with `row-actions` component
- Empty cells: `<span class="{module}-cell-empty">—</span>`
- Sample/demo badge: pill `Sample` next to name (grey border, 11px)

### Pagination

- Count: `1 – 15 of 15` (`tabular-nums`)
- Prev/next icon buttons; disabled at bounds
- Default page size: **15** on Vendors; **50** on Parts (configurable via gear popover)

### Row click

Entire `<tr>` is clickable except interactive children (`a`, `button`, `input`, `.row-actions`). Use `cursor: pointer` + hover background `var(--color-surface)`.

---

## Row Actions Menu (⋯)

Floating menu on row trigger (`row-actions__trigger` with `row-actions__dots`).

**Vendors menu** (current spec):

| Item | Behavior |
|------|----------|
| View | Prototype alert (detail page TBD) |
| Edit | Navigate to `vendor-form?id={id}` |
| Merge | **Disabled** — `row-actions__item--disabled` + lock icon |
| Archive | Prototype alert |

Pattern matches Work Orders (`js/work-orders.js`): View/Edit as links or buttons; Merge locked; Archive as button with `lucide('archive')`.

Menu positioning: `position: fixed` below trigger; `z-index: 120`. Close on outside click.

---

## Form Page Pattern

Used by: Contact, Part, Vendor, Geofence, Fuel Entry, etc.

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to list          Title              Cancel  [Save]   │
├─────────────────────────────────────────────────────────────┤
│  ┌─ Card: Section title ─────────────────────────────────┐  │
│  │  form-grid form-grid--2                               │  │
│  │  form-field / form-field--full                        │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌─ Card: Section 2 ────────────────────────────────────┐  │
│  └───────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│ Cancel          [Save & Add Another]  [Save Primary]        │
└─────────────────────────────────────────────────────────────┘
```

### Top bar

- `vehicle-form-topbar` with `vehicle-form-back` (← Module name)
- Title in `<h1>` — **New {Entity}** or **Edit {Entity}**
- Top actions: Cancel (text link) + Save (primary)
- **No breadcrumbs** on vendor form — back link only (product decision)

### Form cards

- `vehicle-form-card` + section `h2.vehicle-form-card__title`
- Fields: `form-grid form-grid--2`; full-width fields use `form-field--full`
- Required: `<span class="required">*</span>` on label
- Hints: `form-field__hint` or `form-hint` below input

### Classification checkboxes (Vendor, Contact)

Reuse `contact-form-class` pattern:

```html
<label class="contact-form-class vendor-form-class">
  <input type="checkbox" name="classification" value="fuel">
  <span class="contact-form-class__body">
    <strong>Fuel</strong>
    <span>Fuel classification allows vendor to be listed on Fuel Entries</span>
  </span>
</label>
```

### Footer

- `vehicle-form-footer` — Cancel left; primary actions right
- **New mode:** Save & Add Another (outline) + Save (primary)
- **Edit mode:** Save & Add Another hidden; Save only

### Edit mode

- URL: `{entity}-form.html?id={id}`
- Load record from `*-data.js` → `getFormRecord(id)`
- `document.title` and `<h1>` switch to **Edit …**
- Same form markup as create — no separate edit template

---

## Vendors Module

**Nav:** Sidebar → **Vendors** (`vendors.html`, `data-page="vendors"`)  
**Files:**

| File | Purpose |
|------|---------|
| `vendors.html` | List page |
| `js/vendors.js` | List logic, filters, table render |
| `js/vendors-data.js` | 16 sample vendors + filter metadata |
| `vendor-form.html` | Add / Edit form |
| `js/vendor-form.js` | Form init, validation stub, edit load |
| `vendor-view.html` | Detail page (Overview + classification tabs) |
| `js/vendor-view.js` | Detail hero, tabs, fields, map |
| `css/pages.css` | `.content--vendors`, `.content--vendor-form`, `.content--vendor-view` blocks |

### List page header

- Title: **Vendors**
- Actions: **Find Shops** (text + map pin), ⋯ more menu, **+ Add Vendor** (primary → `vendor-form.html`)

### Tabs

Use **`segment-tabs` / `segment-tab`** (same as Drivers page) — folder-style active tab connected to the table panel below, not underline `st-view-tab` style.

`All` · `Charging` · `Fuel` · `Service` · `Vehicle` · `Archived` · `+ Add Tab` (disabled)

Tab filters by `classifications[]` on each vendor. Archived tab shows `archived: true` only.

### Toolbar filters

| Pill | Popover type | Notes |
|------|--------------|-------|
| Classification | Multi-select | Charging, Fuel, Service, Vehicle |
| Contact Name | Text | Substring match on `contactName` |
| Contact Phone | Text | Substring match on `phone` |
| Labels | Multi-select | Shows **No options** when empty |
| Filters | Drawer | Popular: Contact Name, Contact Phone, Vendor Labels |

### Table columns

Checkbox · Name (sortable ↑) · Full Address · Phone · Website · Contact Name · Contact Email · Labels · Rating · Archived At · ⋯

### Full Address — two-line display

**Required layout** (list table only):

| Line | Content | Style |
|------|---------|-------|
| 1 | Street (`addressLine1`) | `font-weight: 500`, `color: ink` |
| 2 | City, State Zip, Country | `font-weight: 400`, `color: charcoal` |

Example:

```
2751 N Monroe St
Tallahassee, FL 32303, United States of America
```

Implementation:

- Data: structured fields `addressLine1`, `addressLine2`, `city`, `state`, `zip`, `country`
- Display: `buildDisplayAddress()` in `vendors-data.js` for legacy single string
- Markup: `.vendors-address__line1` + `.vendors-address__line2`

### Name column

- Vendor name `font-weight: 600`
- **Sample** badge when `sample: true`

### Phone & Website

Green primary links (`vendors-link` / `table-cell-link`), `target="_blank"` for website.

### Vendor form sections

**Details**

- Name * · Phone · Website (row)
- Labels (select, placeholder “Please select”)
- Address * + hint · Address Line 2 + hint
- City * · State/Province/Region *
- Zip * · Country * (select)
- Notes (textarea)

**Contact Person**

- Contact Name
- Phone (hint: direct line) · Email

**Classification**

- Charging · Fuel · Service · Vehicle (checkboxes with descriptions)

### Edit sample data

`vendor-form.html?id=VND-001` loads **Chevron**:

- 2751 N Monroe St, Tallahassee, FL 32303, United States of America
- Phone 850-385-2974 · Contact Jamie McDonald · Fuel checked

### Vendor detail (`vendor-view.html`)

Uses **`content--vehicle-detail`** scaffold — same spacing, margins, and **`vd-tab`** folder tabs as [contact-detail.html](../prototype/contact-detail.html) (driver detail).

| Area | Pattern |
|------|---------|
| Back link | `vd-back` → Vendors |
| Hero | `vd-hero` — avatar, name, Edit Labels, Watch / ⋯ / Edit actions |
| Tabs | `vd-tabs` + `vd-tab.is-active` (connected to white `vd-body`) |
| Overview | `cd-layout` — left **Details** field list, right **map** + location card |
| Entry tabs | Fuel / Charging / Service Entries — `cd-body--table` + `list-table-panel` |
| Footer meta | `cd-footer-meta` — Created … |

Open: `vendor-view.html?id=VND-001` or row click / View from list.

Location card under map: line 1 city/state (**500**), line 2 full street line (**400**).

---

## Geofences Module (summary)

**Files:** `geofences.html`, `geofence-form.html`, `geofence-view.html`, `js/geofences*.js`

| Screen | Notes |
|--------|-------|
| List | Row click → `geofence-view?id=`; filters + drawer like Parts |
| Form | **40%** form / **60%** map; tools: Hand, Circle (click-drag radius), Polygon |
| Detail | Layout matches `user-view.html` (`vd-sheet`, `vd-tabs`, `cd-layout`) |

Default demo map center: Mumbai area. Radius presets: 100, 200, 500, 1000, 2890 m + custom.

---

## Parts & Inventory (summary)

**Nav (MVP + Full):** Sidebar → **Parts & Inventory** submenu

| Screen | Files | Notes |
|--------|-------|-------|
| Parts List | `parts.html`, `part-form.html`, `part-view.html`, `js/parts*.js` | Canonical list-page reference |
| Part Outward | `part-outward.html`, `part-outward-form.html`, `part-outward-view.html`, `js/part-outward*.js` | List (parts-style table), add/edit form with part issuance history, detail view |
| Parts Consumption | `parts-consumption.html`, `js/parts-consumption.js` | Top vehicles by parts cost; category breakdown by period |

Filter popovers and drawer on Parts List are the template for Part Outward list, Vendors, and Geofences.

### Part Outward

Record which vehicle each part is issued to from stock.

| Screen | Route | Notes |
|--------|-------|-------|
| List | `part-outward.html` | Same table pattern as Parts List (checkbox, filters drawer, row actions, row click → view) |
| Add / Edit | `part-outward-form.html` | Form + sidebar showing vehicles that used the selected part |
| View | `part-outward-view.html?id=` | Overview, Part Issuance History, Vehicle Parts History tabs |

- Demo data generated from `YSOAM_PARTS` + `YSOAM_VEHICLES`

### Parts Consumption Analysis

Analytics for maintenance planning — vehicles consuming the most parts by period, category, and cost.

- Period: Last 30 Days · Last 90 Days · Year to Date
- Category filter (all or single category)
- KPI row: total cost, issue count, vehicles with usage, highest consumer
- **Top Vehicles by Parts Cost** table with % of fleet spend
- **Cost by Category** horizontal bar chart

---

## Fuel & Energy — Tyre & Battery Management

**Nav (MVP + Full):** Sidebar → **Fuel & Energy** submenu (MVP: group expanded by default)  
- Fuel History · Charging History · **Tyre Management** · **Battery Management**

**MVP mobile bottom nav:** Tyres → `tyres.html` (Battery via Fuel & Energy submenu on sidebar)

Also linked from Vehicles → Tyre Management (`tyres.html`).

| Screen | Files | Notes |
|--------|-------|-------|
| Tyre Management | `tyres.html`, `js/tyres-data.js`, `js/tyres.js` | Fleet tyre inventory & readings |
| Battery Management | `battery.html`, `js/battery-data.js`, `js/battery.js` | EV battery health (SOC, SOH, cycles) |

Same list-page pattern as Fuel History: KPI strip (`fh-stat-card`), view tabs, filter pills + drawer, `fuel-history-panel` for popover positioning.

### Tyre Management (`tyres.html`)

- **Tabs:** All · On Vehicle · In Stock · Replace Soon · Retired
- **Filters:** Vehicle, Brand (+ drawer)
- **KPIs:** Total tyres, on vehicle, in stock, replace soon
- **Table:** ID, serial, position, vehicle, brand, size, tread depth, pressure, status, cost
- Status badges: `tyre-status--ok`, `--warning`, `--info`, `--muted`
- Tread depth highlights: `tyre-tread--low` / `--mid` when below thresholds

### Battery Management (`battery.html`)

- **Tabs:** All · Healthy · Attention · Critical
- **Filters:** Vehicle, Status (+ drawer)
- **KPIs:** EV fleet count, avg SOC, healthy / attention / critical counts
- **Table:** Vehicle, pack ID, SOC bar, SOH, voltage, temp, range, cycles, status
- SOC bar: `battery-soc` with `--mid` / `--low` fill variants
- Header link to Charging History

Demo data from `YSOAM_VEHICLES` (EV subset for batteries).

| Screen | Route | Notes |
|--------|-------|-------|
| List | `tyres.html` | Tabs, filters, KPI strip |
| View | `tyre-view.html?id=` | Overview + Reading History tabs |
| Add / Edit Reading | `tyre-reading-form.html` · `?id=` for edit | Vehicle, position, tread, pressure, serial, brand, size |
| Battery List | `battery.html` | SOC bars, health tabs |
| Battery View | `battery-view.html?id=` | Overview + Charging History tabs |

---

## Alerts Module

**Nav:** Sidebar → **Alerts** (`alerts.html`, `data-page="alerts"`) · Topbar bell  
**Mobile:** Driver View → **Alerts** tab + header link

Central alerts hub for fleet exceptions.

| Alert type | Examples |
|------------|----------|
| Fuel Anomaly | Theft, low tank, mileage drop |
| Document Expiry | Insurance, permit, fitness |
| Maintenance Due | Service tasks, inspections |
| Geofence Breach | Unauthorized zone entry |
| Idle Time | Extended engine-on idle |
| Harsh Driving | Hard brake, speed violation |
| Breakdown | Engine fault, tyre pressure |
| Trip Exception | Route deviation, SLA breach |

### List (`alerts.html`)

Same pattern as Service History: KPI strip, read tabs (All / Unread / Read), filter pills (Type, Severity, Vehicle), filters drawer, data table with row actions.

- **Mark All Read** in page header
- Row actions: View, Mark Read/Unread, Dismiss
- Severity badges: Critical, High, Medium, Low

### Detail (`alert-view.html?id=`)

Overview panels + **View Related** (trip, documents, work orders, map, etc.)

**Files:** `alerts.html`, `alert-view.html`, `js/alerts-data.js`, `js/alerts.js`, `js/alert-view.js`, `js/driver-alerts.js`

---

## Settings Module

**Nav:** Org menu → **Settings** (`settings.html`, `data-page="settings"`) · **MVP:** main sidebar link + org menu (footer is Log Out only)  
**Demo user:** Rajesh Kumar · **YSOAM Demo Fleet**

Fleetio-style **secondary in-page sidebar** (primary `app-shell` sidebar stays). Right panel scrolls independently.

### Layout

```
┌──────────────┬────────────────────────────────────────────┐
│ Settings     │  Panel title                    [actions]  │
│ sidebar      │  ─────────────────────────────────────────  │
│ (search +    │  Panel body (forms, tables, toggles)      │
│  nav groups) │                                            │
└──────────────┴────────────────────────────────────────────┘
```

| CSS class | Role |
|-----------|------|
| `.content--settings` | Full-height shell (`calc(100vh - topbar)`) |
| `.settings-shell` | Flex row |
| `.settings-sidebar` | 300px nav + search |
| `.settings-main` | Scrollable panel area |

### Routing

- Default panel: `user-profile`
- Deep link: `settings?section=<panel-id>` (e.g. `settings?section=vehicle-statuses`)
- `billing-plans` keeps sidebar highlight on `billing-subscriptions`
- `manage-users` is an external nav link → `user-management.html`

### Files

| File | Purpose |
|------|---------|
| `settings.html` | Shell, all built panels, modals |
| `js/settings.js` | `NAV_GROUPS`, `showPanel()`, search, URL routing; exports `window.YSOAM_SETTINGS.showPanel` |
| `js/settings-*.js` | Per-domain panel logic (see groups below) |
| `js/settings-*-data.js` | Demo data for vehicles, ops, service, parts-fuel |
| `css/pages.css` | `.content--settings` and module blocks |

**Script load order (end of `settings.html`):** feature modules → `settings.js` last.

### Built panels (by nav group)

| Group | Panel IDs | JS |
|-------|-----------|-----|
| User | `user-profile`, `notification-settings`, `login-password`, `api-keys` | inline + `settings-notifications.js`, `settings-login-password.js`, `settings-api-keys.js` |
| Organization | `general-settings`, `billing-subscriptions`, `billing-plans`, `export-data` | `settings-general.js`, `settings-billing.js`, `settings-export.js` |
| User Access | `security`, `roles`, `record-sets` | `settings-security.js`, `settings-roles.js`, `settings-record-sets.js` |
| Vehicles | `vehicle-statuses`, `vehicle-types`, `external-vehicle-ids`, `expense-types` | `settings-vehicles.js` + `settings-vehicles-data.js` |
| Inspections / Issues / Reminders | `inspection-settings`, `issue-priorities`, `fault-rules`, `service-reminder-settings`, `vehicle-renewal-types`, `contact-renewal-types` | `settings-ops.js` + `settings-ops-data.js` |
| Service | `maintenance-settings`, `work-order-statuses`, `repair-codes`, `repair-priority-codes`, `vmrs-codes` | `settings-service.js` + `settings-service-data.js` |
| Parts & Inventory | `part-locations`, `part-categories`, `part-manufacturers`, `measurement-units` | `settings-parts-fuel.js` + `settings-parts-fuel-data.js` |
| Fuel & Energy | `fuel-settings`, `fuel-types` | same |

**Stub only:** `appearance` (Appearance & Theme) — nav item renders generic stub panel on click.

### Panel patterns

**List + Add modal** — Roles, Record Sets, Expense Types, Fault Rules, renewal types, repair codes, part categories, fuel types, etc.

- Table or card list in panel body
- **+ Add** opens `modal-overlay` + `is-open` (see `api-key-modal` pattern)
- Cancel / Save footer; prototype saves use `alert()` stubs

**Reorderable statuses** — Vehicle Statuses, Work Order Statuses

- Drag handle (`gripVertical` icon) in name column
- Lock icon for system defaults

**VMRS codes** — `vmrs-codes` panel uses three-level drill-down (System → Assembly → Component).

**Part Locations** — Active / Archived tabs; archive toggle in row actions.

**Billing** — `billing-subscriptions` current plan card; `billing-plans` comparison table (sidebar stays on Billing).

### Adding a new settings panel

1. Add nav link to `NAV_GROUPS` in `js/settings.js`
2. Add panel markup (+ modal if needed) in `settings.html`
3. Create or extend `settings-{domain}.js`; optional `settings-{domain}-data.js`
4. Register panel id in `builtIn` array inside `showPanel()` in `settings.js`
5. Call domain `init()` when panel is shown (same file pattern as existing modules)
6. Add CSS under `/* Settings — … */` in `pages.css`
7. Document panel here and check off in [TASKS.md](TASKS.md)

---

## Detail Page Pattern

**Layout:** `content--vehicle-detail` + entity modifier (e.g. `content--geofence-view`)

- `vd-back` link
- `vd-sheet` → `vd-hero` (title, meta, actions)
- `vd-tabs` (Overview, secondary tabs)
- `cd-body` / `cd-layout` — two-column widget grid on overview
- List sub-tabs reuse `list-table-panel` + `table-panel__toolbar`

Match spacing to `user-view.html` — do not invent a new detail layout per module.

---

## Adding a New List Module — Checklist

1. Add `*-data.js` with demo rows + filter option helpers
2. Create `{module}.html` copying `parts.html` structure
3. Create `js/{module}.js` — state, `filteredList()`, `renderTable()`, filter popover binders, drawer
4. Add CSS block `.content--{module}` at end of `pages.css`
5. Register nav link in `shell.js` (MVP + Full editions as needed)
6. Set `data-page` on `<body>` for active nav
7. Wire **+ Add** → `{module}-form.html`; row **Edit** → `{module}-form.html?id=`
8. Document the module in this file

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [DESIGN.md](DESIGN.md) | Brand tokens, typography, global components |
| [AGENTS.md](AGENTS.md) | Agent workflow, coding rules |
| [TASKS.md](TASKS.md) | Sprint status |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Production React/API target (post-prototype) |

---

**Document:** PROTOTYPE_UI.md  
**Purpose:** Handoff spec for HTML prototype UI patterns and module implementations
