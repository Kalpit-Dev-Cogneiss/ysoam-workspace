---
version: "2.1"
name: YSOAM-design-system
description: YSOAM fleet profitability platform — light-mode enterprise UI anchored by Electric Blue (`#0052FF`) as the primary signal, slate ink (`#1E293B`) for navigation chrome and headlines, Inter sans throughout, semantic traffic-light status colors for maps and fleet ops, and 8–16px rounded cards on a white-and-cloud canvas.

colors:
  primary: "#0052FF"
  primary-bright: "#3375FF"
  primary-deep: "#0041CC"
  primary-soft: "#E6EEFF"
  on-primary: "#ffffff"
  ink: "#1E293B"
  ink-deep: "#0F172A"
  ink-soft: "#334155"
  on-ink: "#ffffff"
  canvas: "#ffffff"
  paper: "#ffffff"
  cloud: "#F4F6F8"
  fog: "#E2E8F0"
  steel: "#94A3B8"
  graphite: "#64748B"
  charcoal: "#475569"
  hairline: "#E2E8F0"
  hairline-strong: "#CBD5E1"
  link: "#0052FF"
  link-pressed: "#0041CC"
  sidebar: "#1E293B"
  on-sidebar: "#F1F5F9"
  sidebar-muted: "#94A3B8"
  status-active: "#16A34A"
  status-active-soft: "#DCFCE7"
  status-idle: "#F59E0B"
  status-idle-soft: "#FEF3C7"
  status-offline: "#DC2626"
  status-offline-soft: "#FEE2E2"
  status-transit: "#0052FF"
  status-transit-soft: "#E6EEFF"
  status-maintenance: "#9333EA"
  status-maintenance-soft: "#F3E8FF"
  status-unknown: "#6B7280"
  status-unknown-soft: "#F3F4F6"
  profit-positive: "#059669"
  profit-negative: "#DC2626"
  profit-neutral: "#64748B"
  profit-highlight: "#0D9488"
  error: "#DC2626"
  warning: "#F59E0B"
  success: "#16A34A"

typography:
  display-xxl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.02em
  display-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.01em
  display-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0
  display-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0
  display-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0
  display-xs:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: 0
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: 0
  body-emphasis:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.43
    letterSpacing: 0
  caption-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  caption-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0
  caption-bold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: 0.02em
  link-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.43
    letterSpacing: 0
  button-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  button-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: 0
  kpi-md:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0
    fontVariantNumeric: tabular-nums

rounded:
  none: 0px
  xs: 2px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 64px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 12px 24px
    height: 40px
  button-primary-pressed:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.on-primary}"
  button-primary-disabled:
    backgroundColor: "{colors.steel}"
    textColor: "{colors.on-primary}"
  button-outline:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 12px 24px
    height: 40px
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 12px 24px
    height: 40px
  button-text-link:
    backgroundColor: transparent
    textColor: "{colors.link}"
    typography: "{typography.link-md}"
    padding: 4px 0
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 10px 16px
    height: 40px
  text-input-focused:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderColor: "{colors.primary}"
  badge-status-active:
    backgroundColor: "{colors.status-active-soft}"
    textColor: "{colors.status-active}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  badge-status-idle:
    backgroundColor: "{colors.status-idle-soft}"
    textColor: "{colors.status-idle}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  badge-status-offline:
    backgroundColor: "{colors.status-offline-soft}"
    textColor: "{colors.status-offline}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  badge-status-transit:
    backgroundColor: "{colors.status-transit-soft}"
    textColor: "{colors.status-transit}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  badge-status-maintenance:
    backgroundColor: "{colors.status-maintenance-soft}"
    textColor: "{colors.status-maintenance}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  card-kpi:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 20px 24px
  card-dashboard:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 24px
  card-alert:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 16px 20px
  card-profit:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 24px
  data-table:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 0
  map-panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 0
  sidebar-nav:
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.on-sidebar}"
    typography: "{typography.body-md}"
    width: 240px
  sidebar-nav-item-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
  top-bar:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    height: 56px
    padding: 0 24px
  nav-link:
    backgroundColor: transparent
    textColor: "{colors.sidebar-muted}"
    typography: "{typography.body-md}"
    padding: 8px 16px
  nav-link-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
  trip-stepper-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
  trip-stepper-complete:
    backgroundColor: "{colors.status-active}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
  trip-stepper-pending:
    backgroundColor: "{colors.fog}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.pill}"
---

**Canonical design document for YSOAM.**  
**UX rule:** Profitability visible in 5 clicks.  
**Theme:** Light mode only · Primary color `#0052FF`

## Overview

YSOAM reads like an **enterprise fleet operations console** — data-dense, map-centric, profitability-first. The system sits on **pure white** (`{colors.canvas}` — `#ffffff`) with light cloud bands (`{colors.cloud}` — `#F4F6F8`) for page rhythm and a **fixed slate sidebar** (`{colors.sidebar}` — `#1E293B`) for navigation chrome. There is one chromatic action color — **YSOAM Electric Blue** (`{colors.primary}` — `#0052FF`) — reserved for primary CTAs, active nav, links, and in-transit fleet status. Type is a single family everywhere: **Inter** at weight 400 for body and 600/700 for display and KPIs.

The signature gesture is **semantic traffic-light status** — green, amber, red, and blue applied identically on map markers, table badges, and chart legends. Color never decorates; it always means fleet state or profit/loss. Cards round at `{rounded.lg}`–`{rounded.xl}` (12–16px); buttons and inputs sit at `{rounded.md}` (8px). **Light mode only** — no dark mode toggle.

The system breaks into three surface modes: a **white operational body** for dashboards, tables, and forms; a **dark sidebar slab** (`{colors.sidebar}`) for persistent navigation; and **cloud bands** (`{colors.cloud}`) for alternating section backgrounds. `{colors.primary}` appears on filled CTAs, link text, active sidebar items, and in-transit markers — never as a full-page background.

**Engineering reference:** APIs, data model, and stack → [ARCHITECTURE.md](ARCHITECTURE.md)

**Key Characteristics:**
- Pure white canvas (`{colors.canvas}`) with slate ink (`{colors.ink}`) for headlines and body on light surfaces
- YSOAM Electric Blue (`{colors.primary}` — `#0052FF`) is the lone brand CTA fill, link color, and active-nav indicator
- Inter across every surface — display, body, button, caption, KPI — at weights 400 / 500 / 600 / 700
- Cards round at `{rounded.lg}` (12px) and `{rounded.xl}` (16px); buttons at `{rounded.md}` (8px)
- Traffic-light status tokens shared across maps, badges, and charts — never module-specific accent colors
- Dark sidebar (`{colors.sidebar}`) with grayscale icons; active item fills with `{colors.primary}`
- Section rhythm: sidebar + top bar → KPI row → cloud-band content → white cards → map panels

## Colors

> **No Interaction sub-section.** Hover colors are silently filtered. Allowed sub-sections: Brand & Accent, Surface, Text, Semantic.

### Brand & Accent
- **YSOAM Electric Blue** (`{colors.primary}` — `#0052FF`): the system's lone brand signal — primary CTA fill, link color, active sidebar item, in-transit map markers. Reserved.
- **Bright Blue** (`{colors.primary-bright}` — `#3375FF`): hover and emphasis variant on light surfaces.
- **Deep Blue** (`{colors.primary-deep}` — `#0041CC`): pressed state for primary CTA and visited links.
- **Soft Blue** (`{colors.primary-soft}` — `#E6EEFF`): selected table rows, in-transit badge backgrounds, subtle highlights.

### Surface
- **Canvas** (`{colors.canvas}` — `#ffffff`): universal page background on the content area.
- **Paper** (`{colors.paper}` — `#ffffff`): card surfaces — KPI cards, tables, map panels; lifted by hairline border or soft shadow.
- **Cloud** (`{colors.cloud}` — `#F4F6F8`): lightest gray page background behind card groups.
- **Fog** (`{colors.fog}` — `#E2E8F0`): table header bands, dividers, pending stepper backgrounds.
- **Sidebar** (`{colors.sidebar}` — `#1E293B`): fixed left navigation slab — always dark on light content.
- **Steel** (`{colors.steel}` — `#94A3B8`): disabled button fill, placeholder text, muted sidebar icons.

### Text
- **Ink** (`{colors.ink}` — `#1E293B`): universal text on white surfaces — headlines, body, table content.
- **Ink Deep** (`{colors.ink-deep}` — `#0F172A`): maximum-contrast headlines on white.
- **Ink Soft** (`{colors.ink-soft}` — `#334155`): secondary emphasis on light surfaces.
- **On Ink** (`{colors.on-ink}` — `#ffffff`): text on dark sidebar and ink-filled buttons.
- **On Sidebar** (`{colors.on-sidebar}` — `#F1F5F9`): primary labels on sidebar.
- **Sidebar Muted** (`{colors.sidebar-muted}` — `#94A3B8`): inactive sidebar icons and labels.
- **Charcoal** (`{colors.charcoal}` — `#475569`): secondary descriptions, helper text.
- **Graphite** (`{colors.graphite}` — `#64748B`): captions, timestamps, table metadata.

### Semantic — Fleet Status
- **Active** (`{colors.status-active}` — `#16A34A` / soft `#DCFCE7`): moving, online, trip complete.
- **Idle** (`{colors.status-idle}` — `#F59E0B` / soft `#FEF3C7`): engine idle, low fuel, doc expiring.
- **Offline** (`{colors.status-offline}` — `#DC2626` / soft `#FEE2E2`): GPS lost, breakdown, overspeed.
- **In Transit** (`{colors.status-transit}` — `#0052FF` / soft `#E6EEFF`): dispatched, en route — shares primary blue.
- **Maintenance** (`{colors.status-maintenance}` — `#9333EA` / soft `#F3E8FF`): in workshop, scheduled service.
- **Unknown** (`{colors.status-unknown}` — `#6B7280` / soft `#F3F4F6`): unassigned, no data.

### Semantic — Profitability
- **Profit Positive** (`{colors.profit-positive}` — `#059669`): margin above target, best routes.
- **Profit Negative** (`{colors.profit-negative}` — `#DC2626`): loss trips, negative margin.
- **Profit Neutral** (`{colors.profit-neutral}` — `#64748B`): break-even band.
- **Profit Highlight** (`{colors.profit-highlight}` — `#0D9488`): top performer accent — distinct from status green.

### Semantic — System
- **Error** (`{colors.error}` — `#DC2626`): form errors, destructive actions.
- **Warning** (`{colors.warning}` — `#F59E0B`): non-blocking alerts.
- **Success** (`{colors.success}` — `#16A34A`): confirmations, save success.

## Typography

### Font Family

The voice is **single-family**: Inter (`system-ui, sans-serif` fallback) across every surface. Inter is neutral, highly legible at dashboard density, and supports tabular numerals for KPI and currency columns. Weight 600 for display and card titles; 400 for body; 700 for KPI stamps.

### Hierarchy

| Token | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| `{typography.display-xxl}` | 48px | 600 | 1.1 | Login hero, marketing headers |
| `{typography.display-xl}` | 36px | 600 | 1.15 | Report section headlines |
| `{typography.display-lg}` | 28px | 600 | 1.2 | Page titles |
| `{typography.display-md}` | 24px | 600 | 1.25 | Module section headers |
| `{typography.display-sm}` | 20px | 600 | 1.3 | Card titles |
| `{typography.display-xs}` | 16px | 600 | 1.35 | Sub-section headers, table group labels |
| `{typography.body-lg}` | 16px | 400 | 1.5 | Lead paragraphs, driver mobile body |
| `{typography.body-md}` | 14px | 400 | 1.43 | Default body, table cells |
| `{typography.body-emphasis}` | 14px | 600 | 1.43 | Bold run-in, active nav labels |
| `{typography.caption-md}` | 12px | 400 | 1.5 | Labels, timestamps, metadata |
| `{typography.caption-bold}` | 12px | 700 | 1.4 | Status badges, column headers |
| `{typography.caption-sm}` | 11px | 400 | 1.45 | Legal lines, footnotes |
| `{typography.link-md}` | 14px | 500 | 1.43 | Inline links |
| `{typography.button-md}` | 14px | 600 | 1.4 | Button labels |
| `{typography.button-sm}` | 12px | 600 | 1.33 | Compact buttons in tables |
| `{typography.kpi-md}` | 28px | 700 | 1.2 | Dashboard KPI values (tabular nums) |

### Principles

- KPI and currency values always use `{typography.kpi-md}` with `font-variant-numeric: tabular-nums`
- Currency displayed as ₹ (INR); dates as `DD MMM YYYY`
- Alert copy is direct and urgent; profitability copy leads with the number
- No italic in UI chrome; emphasis via `{typography.body-emphasis}` or weight 700

## Layout

### Spacing System

- **Base unit**: 4px half-step, 8px primary step
- **Tokens**: `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 64px
- **Card padding**: `{spacing.lg}` (24px) standard; `{spacing.md}` (16px) for compact alert rows
- **Section gap**: `{spacing.section}` (64px) between major dashboard bands on desktop

### Grid & Container

- **Desktop**: 240px fixed `sidebar-nav` + fluid content, max-width 1440px
- **KPI row**: 4 columns at ≥1280px, 2×2 at 768–1279px, single column below 768px
- **Map layout**: map panel ≥60% width desktop; vehicle list collapsible on tablet
- **Data tables**: full-width within content area; horizontal scroll below 768px

### Application Shell

```
┌──────────┬────────────────────────────────────────┐
│ sidebar  │  top-bar (search · alerts · profile)   │
│ 240px    ├────────────────────────────────────────┤
│ #1E293B  │  content (#cloud or #canvas)           │
│          │  ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│          │  │ card-kpi│ │ card-kpi│ │ card-kpi│ │
│          │  └─────────┘ └─────────┘ └─────────┘ │
└──────────┴────────────────────────────────────────┘
```

**Mobile:** bottom tabs (Dashboard · Map · Trips · Alerts · More); driver view uses 3-tab simplified layout.

**5-click profitability path:** Dashboard → Reports → Profitability → Trip list → Trip P&L detail

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 — Flat | No border, no shadow | Page bands (`cloud`), sidebar |
| 1 — Hairline | 1px `{colors.hairline}` border | Outlined buttons, table cells |
| 2 — Soft Lift | `0 1px 3px rgba(30, 41, 59, 0.08)` | `card-kpi`, `card-dashboard`, `card-profit` |
| 3 — Floating | `0 8px 24px rgba(30, 41, 59, 0.12)` | Modals, map vehicle hover card, mobile drawer |

Depth is communicated primarily by **surface contrast** (cloud page vs white card) rather than heavy shadows.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Map full-bleed areas |
| `{rounded.sm}` | 4px | Sale chips, tight tags |
| `{rounded.md}` | 8px | Buttons, inputs, active nav item |
| `{rounded.lg}` | 12px | KPI cards, alert cards, tables |
| `{rounded.xl}` | 16px | Map panel outer frame, modals |
| `{rounded.pill}` | 9999px | Status badges, filter chips, stepper dots |

**Philosophy:** buttons stay at `{rounded.md}` (8px); cards stay softer at `{rounded.lg}`–`{rounded.xl}`.

### Map Marker Geometry

Circular markers 12px default, 16px selected. Fill color = fleet status token. White 2px stroke on map for contrast. No decorative marker shapes per module.

## Components

> **No hover states documented.** Default and Active/Pressed states only. Variants live as separate front-matter entries.

### Buttons

**`button-primary`** — YSOAM Electric Blue CTA
- Background `{colors.primary}`, text `{colors.on-primary}`, type `{typography.button-md}`, padding `{spacing.sm} {spacing.lg}`, height 40px, rounded `{rounded.md}`
- Pressed: `button-primary-pressed` — `{colors.primary-deep}`
- Disabled: `button-primary-disabled` — `{colors.steel}`
- Used for: "Create trip", "Dispatch", "Save", "Export report"

**`button-outline`** — blue-text outlined CTA
- Background `{colors.canvas}`, text `{colors.primary}`, 1px `{colors.primary}` border, height 40px, rounded `{rounded.md}`
- Used for: "Cancel", "View details", secondary actions

**`button-ink`** — slate filled CTA on light surfaces
- Background `{colors.ink}`, text `{colors.on-ink}`, height 40px, rounded `{rounded.md}`
- Used for: destructive-neutral actions where blue would compete with map UI

**`button-text-link`** — inline link
- Text `{colors.link}`, type `{typography.link-md}`; pressed `{colors.link-pressed}`

### Status Badges

**`badge-status-active`** · **`badge-status-idle`** · **`badge-status-offline`** · **`badge-status-transit`** · **`badge-status-maintenance`**
- Soft background + saturated text per semantic token; rounded `{rounded.pill}`; type `{typography.caption-bold}`
- Used identically in tables, map list, and trip stepper labels

### Cards

**`card-kpi`** — dashboard metric tile
- Background `{colors.paper}`, rounded `{rounded.lg}`, padding 20px 24px, Soft Lift shadow
- Layout: label in `{typography.caption-md}`, value in `{typography.kpi-md}`, optional sparkline; trend color uses profit or status semantic

**`card-dashboard`** — general content container
- Background `{colors.paper}`, rounded `{rounded.lg}`, padding `{spacing.lg}`

**`card-alert`** — alert feed row
- Left 3px border in status color; `{typography.body-md}` message; timestamp in `{typography.caption-md}`

**`card-profit`** — trip P&L breakdown
- Revenue, cost rows in `{typography.body-md}`; margin in `{typography.kpi-md}` colored `{colors.profit-positive}` or `{colors.profit-negative}`

### Data & Map

**`data-table`**
- Header row background `{colors.cloud}`, text `{typography.caption-bold}`
- Row hover `{colors.primary-soft}`; selected row `{colors.primary-soft}` + 3px left `{colors.primary}` border

**`map-panel`**
- Rounded `{rounded.lg}`; vehicle list panel 320px right dock on desktop
- `VehicleHoverCard`: Soft Lift shadow, `{typography.body-md}`, status badge

**`trip-stepper`**
- Active step: `trip-stepper-active` (`{colors.primary}`)
- Complete: `trip-stepper-complete` (`{colors.status-active}`)
- Pending: `trip-stepper-pending` (`{colors.fog}`)

### Navigation

**`sidebar-nav`**
- Background `{colors.sidebar}`, width 240px
- Items: `nav-link` — muted icon + label `{colors.sidebar-muted}`
- Active: `nav-link-active` / `sidebar-nav-item-active` — fill `{colors.primary}`, text `{colors.on-primary}`, rounded `{rounded.md}`
- Icons grayscale when inactive; never per-module accent colors

**`top-bar`**
- Background `{colors.paper}`, height 56px, 1px `{colors.hairline}` bottom border
- Search input, notification bell, profile avatar right-aligned

### Inputs

**`text-input`** + **`text-input-focused`**
- Background `{colors.canvas}`, 1px `{colors.hairline-strong}` default; focus border `{colors.primary}` 2px, no halo glow
- Error state: border `{colors.error}` + caption in `{colors.error}`

## Do's and Don'ts

### Do
- Reserve `{colors.primary}` (`#0052FF`) for CTAs, links, active nav, and in-transit status — at most two flame elements per viewport besides map markers
- Apply status colors identically on maps, badges, and charts
- Use `{rounded.lg}` for cards, `{rounded.md}` for buttons — keep the split
- Set KPI values in `{typography.kpi-md}` with tabular numerals
- Keep sidebar icons `{colors.sidebar-muted}`; highlight active item with `{colors.primary}` fill only
- Use `{colors.cloud}` page background with white `{colors.paper}` cards for rhythm
- Run light mode only — no theme toggle

### Don't
- Don't assign a unique accent color per module (Fuel orange, Trips purple, etc.)
- Don't use red/green outside status or profit/loss meaning
- Don't place `{colors.primary}` as a full-section background
- Don't round buttons above `{rounded.md}` for primary actions
- Don't use colorful sidebar icons — grayscale inactive, primary fill active only
- Don't drop text opacity for hierarchy — use `{colors.graphite}` or `{colors.charcoal}` instead

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 768px | Bottom nav; stacked KPIs; full-width map; tables scroll horizontally |
| Tablet | 768–1279px | Collapsible sidebar; 2-column KPI grid |
| Desktop | ≥ 1280px | Fixed sidebar; 4-column KPI row; map + list split view |

### Touch Targets

Minimum 44×44px on mobile for driver view and bottom nav. `button-primary` meets target at 40px height + extended tap padding on touch screens.

## Module Routes (Information Architecture)

| # | Module | Route | Nav group |
|---|--------|-------|-----------|
| 1 | Dashboard | `/dashboard` | Overview |
| 2 | GPS Tracking | `/gps` | Operations |
| 3 | Vehicles | `/vehicles` | Fleet |
| 4 | Drivers | `/drivers` | Fleet |
| 5 | Trips | `/trips` | Operations |
| 6 | Fuel | `/fuel` | Costs |
| 7 | Tyres | `/tyres` | Fleet |
| 8 | Maintenance | `/maintenance` | Fleet |
| 9 | Billing | `/billing` | Finance |
| 10 | Inventory | `/inventory` | Operations |
| 11 | Documents | `/documents` | Compliance |
| 12 | Reports | `/reports` | Analytics |
| 13 | AI Intelligence | `/ai` | Analytics |
| 14 | IoT & Sensors | `/iot` | Operations |
| 15 | Driver View | `/driver` | Mobile |
| 16 | Admin | `/admin` | Settings |
| 17 | Battery | `/battery` | Fleet |
| 18 | Settings | `/settings` | Settings |
| 19 | Roadmap | `/roadmap` | Settings |

## Week 1-2 Prototype Checklist

**Deliverable:** Static HTML in `prototype/` using tokens from front matter. Light mode only.  
**Status:** See [TASKS.md](TASKS.md) for per-module completion.

- [x] Primary `#0052FF` on all CTAs and active nav
- [x] Sidebar `#1E293B` with grayscale icons
- [x] Status badges use semantic soft+solid pairs
- [x] All 19 routes linked (9 module stubs with placeholder cards)
- [x] Settings hub — 30+ config panels (Fleetio-style secondary sidebar)
- [ ] Responsive: 375px, 768px, 1280px
- [ ] Demo flow: GPS → Trip → Profitability → Invoice
- [ ] 5-click profitability path verified

## Related Documents

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | APIs, data model, stack |
| [PROTOTYPE_UI.md](PROTOTYPE_UI.md) | HTML prototype UI patterns and module specs |
| [ysoam_plan.md](ysoam_plan.md) | Timeline |
| [ysoam_specs.md](ysoam_specs.md) | Feature benefits |
| [DESIGN-hp.md](DESIGN-hp.md) | Format reference |

## Iteration Guide

1. Edit tokens in YAML front matter first — prose references `{colors.*}` and `{typography.*}` tokens
2. Add component variants as separate front-matter entries (`-pressed`, `-disabled`, `-focused`)
3. Keep `{colors.primary}` scarce outside map markers — max two brand-flame elements per viewport
4. New fleet status? Add to `colors` front matter + matching `badge-status-*` component entry
5. Run `npx @google/design.md lint DESIGN.md` after edits if using design.md tooling
6. Engineering changes go in [ARCHITECTURE.md](ARCHITECTURE.md) — not this file

---

**Document:** DESIGN.md  
**Format:** design.md (YAML front matter + token prose)  
**Primary color:** `#0052FF`  
**Purpose:** YSOAM brand identity, visual tokens, and UX component specifications
