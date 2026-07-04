#!/usr/bin/env python3
"""Generate flat Fleetwyz vs YSOAM comparison from docs/fleetwyz.html."""

from __future__ import annotations

import html
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "fleetwyz.html"
OUTPUT = ROOT / "docs" / "FLEETWYZ_FEATURE_COMPARISON.md"

CARD_RE = re.compile(
    r'<h3[^>]*>\s*(.*?)\s*</h3>.*?<p class="text-sm leading-snug[^"]*">\s*(.*?)\s*</p>',
    re.S,
)


def clean(fragment: str) -> str:
    text = re.sub(r"<[^>]+>", "", fragment)
    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def parse_features() -> list[tuple[str, str]]:
    text = SOURCE.read_text(encoding="utf-8")
    features: list[tuple[str, str]] = []
    for title_raw, desc_raw in CARD_RE.findall(text):
        title = clean(title_raw)
        desc = clean(desc_raw)
        if title and desc:
            features.append((title, desc))
    return features


# (status, label) — status: built | partial | no
EXACT: dict[str, tuple[str, str]] = {
    "Vehicle Records & Lifecycle": ("built", "Vehicles — list, detail, form (`vehicles.html`)"),
    "Live GPS Tracking": ("built", "Live Tracking map (`gps.html`)"),
    "Circular & Polygon Geofences": ("built", "Geofences — list, form, map draw (`geofences.html`, `geofence-form.html`)"),
    "Driver Core Management": ("built", "Drivers — list, detail, form (`drivers.html`)"),
    "Work Orders": ("built", "Work orders — list, form, view (`work-orders.html`)"),
    "Fuel Transaction Recording": ("built", "Fuel history + entry form (`fuel-history.html`, `fuel-entry-form.html`)"),
    "EV Charging Session Recording": ("built", "Charging history + entry form (`charging-history.html`, `charging-entry-form.html`)"),
    "Tyre Inventory & Fitting": ("built", "Tyres — list, view, reading form (`tyres.html`, `tyre-reading-form.html`)"),
    "Battery Health Tracking (EV)": ("built", "Battery module (`battery.html`, `battery-view.html`)"),
    "Parts Inventory Management": ("built", "Parts — list, form, view (`parts.html`)"),
    "Parts Outward / Issue Tracking": ("built", "Part outward (`part-outward.html`, `part-outward-form.html`)"),
    "Vendor Management": ("built", "Vendors — list, form, view (`vendors.html`)"),
    "Document Storage & Management": ("built", "Documents — list, view (`documents.html`)"),
    "Billing & Invoicing": ("built", "Billing module (`billing.html`)"),
    "Fleet Dashboard": ("built", "Dashboard (`dashboard.html`)"),
    "User & Role Management": ("built", "User management (`user-management.html`)"),
    "Mobile Driver Dashboard": ("built", "Driver View mobile UI (`driver.html`)"),
    "Geofence Map Visualization": ("built", "Geofence map draw + live map (`geofence-form.html`, `gps.html`)"),
    "Fleet Map Visualization": ("built", "Live fleet map (`gps.html`)"),
    "Vehicle Odometer Reading": ("built", "Meter history (`meter-history.html`)"),
    "Vehicle Expense Tracking": ("built", "Vehicle expenses (`vehicle-expenses.html`, `vehicle-expense-form.html`)"),
    "Vehicle Replacement Analysis": ("built", "Vehicle replacement (`vehicle-replacement.html`)"),
    "Parts Consumption Analysis": ("built", "Parts consumption (`parts-consumption.html`)"),
    "Settings & Configuration Hub": ("built", "Settings — 30+ panels (`settings.html`)"),
    "Reporting & Analytics Hub": ("built", "Reports module (`reports.html`)"),
    "Alert Management Hub": ("built", "Alerts — list, detail (`alerts.html`, `alert-view.html`)"),
    "Service History": ("built", "Service history (`service-history.html`)"),
    "Service Task Management": ("built", "Service tasks (`service-tasks.html`, `service-task-form.html`)"),
    "Vehicle Assignment Management": ("built", "Vehicle assignments (`vehicle-assignments.html`)"),
    "Contact & Renewal Management": ("built", "Contacts / renewals (`contact-form.html`, `contact-renewal-form.html`)"),
    "Purchase Order Management": ("built", "Purchase orders (`purchase-orders.html`)"),
    "Inventory Management": ("built", "Inventory (`inventory.html`)"),
    "Roadmap Module": ("built", "Roadmap (`roadmap.html`)"),
    "Vehicle Health Score": ("partial", "Alerts + vehicle status — no composite health score"),
    "Stop & Idle Analysis": ("partial", "Alerts — idle monitoring (`alerts.html`)"),
    "Journey History & Filtering": ("partial", "Trips list + filters (`trips.html`)"),
}

# Ordered rules: first match wins. More specific patterns first.
RULES: list[tuple[str, str, str]] = [
    # Dev / CI / platform (not product features)
    (
        r"phpstan|pest v\d|playwright|storybook|gitleaks|knip|mutation test|dead code detect|"
        r"loom (scaffold|generate|audit|floor)|composer (audit|test:arch)|typescript strict|"
        r"lefthook|pre-push hook|pre-commit hook|ci gate|ci workflow|architecture test|"
        r"local foundation package|laravel-resource-loom|laravel-tenant-kit|laravel-branding-kit|"
        r"reverb|horizon|telescope|pulse dashboard|sentry integration|roadmap board controller|"
        r"inertia.*typegen|wayfinder|eslint|prettier|vitest|coverage gate",
        "no",
        "Internal dev/platform tooling — not end-user fleet features",
    ),
    (
        r"demoseeder|companyseeder|tenantdemoseeder|demo catalog|demo hub|demo switchboard|"
        r"demo sign-in|demo site lock|demo company|demo user|stray tenant pruning|"
        r"vehicle volume top-up|pre-onboarding config|unverified email demo|webhook endpoint \+ rule seeding|"
        r"module cross-link seeding|custom field definition \+ value seeding|"
        r"demo data transfer object|fail-closed authorization",
        "no",
        "Fleetwyz demo/seed infrastructure — not end-user features",
    ),
    # Video telematics / ADAS
    (
        r"adas |dashcam|in-cab |video (clip|retention|analysis|footage)|camera inventory|"
        r"on-demand footage|video-to-event|ai video analysis",
        "no",
        "Not in YSOAM — video telematics / ADAS",
    ),
    # Phase 2 stubs
    (r"\bai\b|generative |machine learning|llm|copilot|intake", "partial", "AI Intelligence stub (`ai.html`) — Phase 2"),
    (r"\biot\b|sensor hub|telematics device inventory|device health event|firmware", "partial", "IoT & Sensors stub (`iot.html`) — Phase 2"),
    (r"maintenance hub|predictive maintenance", "partial", "Maintenance hub stub (`maintenance.html`) — Phase 2"),
    # EU/US-specific compliance not in India-first scope
    (
        r"tachograph|hours scheme|cpc qualification|hmrc|clearinghouse|company-car bik|"
        r"operator licence|mot equivalent|dvsa|fmcsa|eld mandate|ifta|us dot|"
        r"multi-jurisdictional|jurisdiction setup",
        "no",
        "Not in YSOAM — EU/US compliance (India-first product)",
    ),
    # Built modules
    (r"live gps|fleet map|telematics dashboard|position history search", "built", "Live Tracking (`gps.html`)"),
    (r"vehicle record|vehicle lifecycle|vehicle registration|vehicle detail|vehicle form", "built", "Vehicles (`vehicles.html`)"),
    (r"geofence|circular.*polygon|depot management|territory management|geofence entry", "partial", "Geofences (`geofences.html`) — entry/exit alerts partial"),
    (r"trip (detect|replay|classification)|journey history|stop.*idle", "partial", "Trips + playback (`trips.html`, `trip-playback.html`)"),
    (r"driver (core|search|license|licence|document|status|export|photo|dashboard|check-in|onboarding)", "partial", "Drivers (`drivers.html`) — advanced compliance partial"),
    (r"harsh (brak|accel)|speeding|cornering|idling|behaviour event|safety scorecard|driver alert", "partial", "Alerts — driving behavior (`alerts.html`)"),
    (r"vehicle alert|alert rule|alert management|compliance alert", "partial", "Alerts hub (`alerts.html`)"),
    (r"work order|maintenance schedule|service (history|task|entry)|inspection schedul", "partial", "Service & work orders (`work-orders.html`, `service-*.html`)"),
    (r"vehicle health score", "partial", "Alerts + vehicle status — no composite health score"),
    (r"defect|vor |walkaround|dvir|roadworthiness|asset condition|pool vehicle check", "partial", "Service/defects — partial; no full DVIR workflow"),
    (r"fuel (transaction|entry|card|fraud)|diesel|petrol|mpg|fuel efficiency", "partial", "Fuel (`fuel-history.html`, `fuel.html`)"),
    (r"charg(e|ing) session|ev classif|battery health|kwh|soc ", "partial", "Charging + battery (`charging-history.html`, `battery.html`)"),
    (r"tyre|tire tread|wheel", "built", "Tyres (`tyres.html`)"),
    (r"part(s)? (inventory|outward|consumption|stock)|spare part", "built", "Parts (`parts.html`, `parts-consumption.html`)"),
    (r"vendor|supplier", "built", "Vendors (`vendors.html`)"),
    (r"document (storage|management|expir|renewal)|contact renewal", "partial", "Documents + contacts (`documents.html`, `contact-*.html`)"),
    (r"invoice|billing|subscription|payment|gst|tax", "partial", "Billing (`billing.html`) — GST; subscriptions partial"),
    (r"report|analytics|export.*report|kpi dashboard", "partial", "Reports (`reports.html`)"),
    (r"dashboard(?!.*builder)", "built", "Dashboard (`dashboard.html`)"),
    (r"user (management|role|permission)|rbac|sso|saml|oauth", "partial", "User management (`user-management.html`, `settings.html`)"),
    (r"settings|configuration hub|branding|notification preference|api key|webhook", "partial", "Settings (`settings.html`)"),
    (r"insurance (policy|claim)", "partial", "Documents/alerts — insurance workflow partial"),
    (r"incident|safety event|fine track|driver fine", "partial", "Alerts + driver records — partial"),
    (r"compliance (score|calendar|task|kpi|scheme)", "partial", "Alerts + settings — India GST/E-Way Bill roadmap"),
    (r"emission|carbon ledger", "partial", "Reports — emissions not built; fuel data exists"),
    (r"announcement|knowledge base|messaging|targeted comm", "no", "Not in YSOAM — internal comms module"),
    (r"telematics (provider|webhook|push|anomaly)|position recording", "partial", "GPS tracking (`gps.html`) — no live telematics ingest"),
    (r"odometer|meter reading", "built", "Meter history (`meter-history.html`)"),
    (r"vehicle expense|cost per mile|tco", "partial", "Vehicle expenses + reports — partial TCO"),
    (r"assignment|allocate vehicle", "built", "Vehicle assignments (`vehicle-assignments.html`)"),
    (r"purchase order|procurement", "partial", "Purchase orders (`purchase-orders.html`)"),
    (r"inventory(?!.*tyre)", "partial", "Inventory (`inventory.html`)"),
    (r"automation rule|workflow builder|rule engine", "partial", "Alerts rules + settings integrations — partial"),
    (r"multi-tenant|tenant isolation|organisation|workspace", "partial", "Multi-company org + MVP/Full edition (`shell.js`)"),
    (r"onboarding wizard", "partial", "Settings General + org branding — partial"),
    (r"e-way bill|eway|gst compliance", "partial", "India GST/E-Way Bill — planned (`PRODUCT.md`)"),
    (r"profitability|margin|revenue per trip", "partial", "Trip profitability engine — YSOAM differentiator (`reports.html`, trip detail)"),
    (r"native (ios|android) app|mobile app store", "no", "Not in YSOAM — responsive web + Driver View only"),
    (r"marketplace|app store|integration catalog", "no", "Not in YSOAM — integration marketplace"),
]

def clean_refs(text: str) -> str:
    """Remove parenthetical page references like (`vehicles.html`)."""
    text = re.sub(r"\s*\(`[^`]*\.html[^`]*`(?:,\s*`[^`]*`)*\)", "", text)
    text = text.replace(".html", "")
    return re.sub(r"\s{2,}", " ", text).strip(" ,—")


def split_label(label: str) -> tuple[str, str]:
    """Split a YSOAM label into (title, description) on the first em dash."""
    if "—" in label:
        head, tail = label.split("—", 1)
        return head.strip(), tail.strip()
    return label.strip(), ""


def map_feature(title: str, desc: str) -> tuple[str, str, str]:
    if title in EXACT:
        status, label = EXACT[title]
        t, d = split_label(label)
        return status, t, d

    text = f"{title} {desc}".lower()

    for pattern, status, label in RULES:
        if re.search(pattern, text, re.I):
            t, d = split_label(label)
            return status, t, d

    return "no", "Not in YSOAM", ""


def esc_cell(s: str) -> str:
    return s.replace("|", "\\|")


def cell(title: str, desc: str) -> str:
    title = esc_cell(title)
    desc = esc_cell(desc)
    if desc:
        return f"**{title}**<br>{desc}"
    return f"**{title}**"


def ysoam_cell(status: str, title: str, desc: str) -> str:
    title = clean_refs(title)
    desc = clean_refs(desc)
    base = cell(title, desc)
    if status == "no":
        return f"❌ {base}"
    return base


def main() -> None:
    features = parse_features()
    if not features:
        raise SystemExit(f"No features parsed from {SOURCE}")

    rows: list[str] = []

    for title, desc in features:
        status, y_title, y_desc = map_feature(title, desc)
        left = cell(title, desc)
        right = ysoam_cell(status, y_title, y_desc)
        rows.append(f"| {left} | {right} |")

    today = date.today().isoformat()
    lines = [
        "# Fleetwyz vs YSOAM — Full Feature Comparison",
        "",
        f"**Source:** All features extracted from `docs/fleetwyz.html` ({len(features)} capabilities)",
        f"**Generated:** {today}",
        "",
        "Flat list — no categories. Each row pairs a Fleetwyz feature (title + description) "
        "with the matching YSOAM feature (title + description).",
        "",
        "| Fleetwyz | YSOAM |",
        "|----------|-------|",
        *rows,
        "",
        "---",
        "",
        "## Extra YSOAM features (not in Fleetwyz catalog)",
        "",
        "| YSOAM Feature | Description |",
        "|---------------|-------------|",
        "| **Trip profitability engine** | Revenue − fuel − advance − maintenance margin per trip |",
        "| **5-click profitability path** | Dashboard → trip → P&L breakdown |",
        "| **Auto-invoice from completed trips** | Billing module + GST structure |",
        "| **Route profitability ranking** | Reports — route margin tab |",
        "| **Geofence map drawing tools** | geofence-form polygon/circle draw |",
        "| **MVP vs Full product editions** | shell.js edition toggle |",
        "| **India-first (INR, GST, E-Way Bill roadmap)** | PRODUCT.md market focus |",
        "| **Roadmap module** | roadmap |",
        "| **Driver View mobile UI** | driver responsive driver app |",
        "",
    ]

    OUTPUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {len(features)} rows to {OUTPUT}")


if __name__ == "__main__":
    main()
