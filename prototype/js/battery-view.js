(function () {
  'use strict';

  if (document.body.getAttribute('data-subpage') !== 'battery-view') return;

  var data = window.YSOAM_BATTERY;
  var vehicles = window.YSOAM_VEHICLES;
  var icons = window.YSOAM_ICONS;

  var TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'charging', label: 'Charging History' }
  ];

  var activeTab = 'overview';

  function getId() {
    return new URLSearchParams(window.location.search).get('id');
  }

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function lucide(name, size) { return window.YSOAM_LUCIDE ? window.YSOAM_LUCIDE.icon(name, size || 16) : ''; }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }
  function dash(val) { return val ? esc(val) : '<span class="cd-muted">—</span>'; }

  function statusBadge(row) {
    return '<span class="battery-status battery-status--' + esc(row.status) + '">' + esc(row.statusLabel) + '</span>';
  }

  function socBar(pct, large) {
    var cls = pct < 25 ? 'battery-soc--low' : pct < 50 ? 'battery-soc--mid' : '';
    var barCls = 'battery-soc' + (large ? ' battery-soc--lg' : '') + ' ' + cls;
    return '<div class="battery-soc-cell' + (large ? ' battery-soc-cell--lg' : '') + '">' +
      '<div class="' + barCls.trim() + '"><div class="battery-soc__fill" style="width:' + pct + '%"></div></div>' +
      '<span class="battery-soc__label tabular-nums">' + pct + '%</span>' +
    '</div>';
  }

  function fieldRow(label, html) {
    return (
      '<div class="vd-field-row">' +
        '<span class="vd-field-label">' + esc(label) + '</span>' +
        '<span class="vd-field-val">' + html + '</span>' +
      '</div>'
    );
  }

  function emptyState(msg) {
    return (
      '<div class="vd-empty">' +
        '<svg class="vd-empty__icon" viewBox="0 0 64 64" fill="none"><circle cx="28" cy="28" r="18" stroke="#CBD5E1" stroke-width="3"/><line x1="41" y1="41" x2="56" y2="56" stroke="#CBD5E1" stroke-width="3" stroke-linecap="round"/></svg>' +
        '<p class="vd-empty__msg">' + esc(msg) + '</p>' +
      '</div>'
    );
  }

  function dataTable(heads, rows) {
    return (
      '<div class="data-table-wrap data-table-wrap--scroll">' +
        '<table class="data-table data-table--list">' +
          '<thead><tr>' + heads.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead>' +
          '<tbody>' + (rows || '') + '</tbody>' +
        '</table>' +
      '</div>'
    );
  }

  function listTablePanel(toolbarHtml, tableHtml, emptyHtml) {
    return (
      '<div class="panel table-panel list-table-panel">' +
        toolbarHtml +
        '<div class="panel__body panel__body--flush">' +
          (tableHtml || '') +
          (emptyHtml || '') +
        '</div>' +
      '</div>'
    );
  }

  function renderHero(row) {
    var v = vehicles.getById(row.vehicleId);
    var thumb = v ? v.image : vehicles.thumbForIndex(0);
    return (
      '<div class="vd-hero__thumb">' +
        '<img src="' + escA(thumb) + '" alt="">' +
      '</div>' +
      '<div class="vd-hero__info">' +
        '<h1 class="vd-hero__name">' + esc(row.vehicleName) + '</h1>' +
        '<p class="vd-hero__sub">' + esc(row.packKwh) + ' kWh pack · ' + esc(row.id) + '</p>' +
        '<div class="cd-hero-meta">' +
          '<span class="cd-hero-meta__item"><span class="cd-hero-meta__key">Status</span> ' + statusBadge(row) + '</span>' +
          '<span class="cd-hero-meta__sep">·</span>' +
          '<span class="cd-hero-meta__item"><span class="cd-hero-meta__key">SOC</span> ' + socBar(row.soc, false) + '</span>' +
          '<span class="cd-hero-meta__sep">·</span>' +
          '<span class="cd-hero-meta__item"><span class="cd-hero-meta__key">SOH</span> <span class="tabular-nums">' + esc(row.soh) + '%</span></span>' +
          '<span class="cd-hero-meta__sep">·</span>' +
          '<span class="cd-hero-meta__item"><span class="cd-hero-meta__key">Group</span> ' + dash(row.vehicleGroup) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="vd-hero__actions">' +
        '<a href="charging-history.html" class="btn btn-outline btn-sm">' + lucide('zap', 14) + ' Charging History</a>' +
      '</div>'
    );
  }

  function renderTabs() {
    return TABS.map(function (tab) {
      var active = tab.id === activeTab;
      return '<button type="button" class="vd-tab' + (active ? ' is-active' : '') + '" role="tab" data-battery-tab="' + tab.id + '" aria-selected="' + (active ? 'true' : 'false') + '">' + esc(tab.label) + '</button>';
    }).join('');
  }

  function renderFieldsSection(row) {
    var v = vehicles.getById(row.vehicleId);
    var vehicleHtml = v
      ? '<a href="vehicle-detail.html?id=' + escA(v.id) + '" class="cd-link">' + esc(row.vehicleName) + '</a>'
      : dash(row.vehicleName);

    var rows = [
      fieldRow('Battery ID', dash(row.id)),
      fieldRow('Vehicle', vehicleHtml),
      fieldRow('Vehicle Group', dash(row.vehicleGroup)),
      fieldRow('Pack Capacity', esc(row.packKwh) + ' kWh'),
      fieldRow('Status', statusBadge(row)),
      fieldRow('Last Charge', esc(row.lastCharge)),
      fieldRow('Last Updated', esc(row.lastChargeLabel))
    ].join('');

    return (
      '<div class="cd-section">' +
        '<div class="cd-section__head">' +
          '<span class="cd-section__title">Pack Details</span>' +
          '<a href="#" class="cd-section__action">All Fields</a>' +
        '</div>' +
        '<div class="cd-group">' +
          '<button type="button" class="cd-group__toggle">' +
            '<svg class="cd-group__chevron is-open" width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            'Battery Information' +
          '</button>' +
          '<div class="cd-group__body">' + rows + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function metricsWidget(row) {
    return (
      '<div class="cd-widget">' +
        '<div class="cd-widget__head">' +
          '<span class="cd-widget__title">Live Metrics</span>' +
          '<a href="#" class="cd-widget__viewall" data-battery-tab-link="charging">View Charging</a>' +
        '</div>' +
        '<div class="tb-reading-widget">' +
          '<div class="tb-reading-widget__item"><span class="tb-reading-widget__label">State of Charge</span>' + socBar(row.soc, true) + '</div>' +
          '<div class="tb-reading-widget__item"><span class="tb-reading-widget__label">State of Health</span><span class="tabular-nums">' + esc(row.soh) + '%</span></div>' +
          '<div class="tb-reading-widget__item"><span class="tb-reading-widget__label">Voltage</span><span class="tabular-nums">' + esc(row.voltage.toFixed(1)) + ' V</span></div>' +
          '<div class="tb-reading-widget__item"><span class="tb-reading-widget__label">Temperature</span><span class="tabular-nums">' + esc(row.tempC) + '°C</span></div>' +
          '<div class="tb-reading-widget__item"><span class="tb-reading-widget__label">Est. Range</span><span class="tabular-nums">' + esc(row.rangeKm) + ' km</span></div>' +
          '<div class="tb-reading-widget__item"><span class="tb-reading-widget__label">Charge Cycles</span><span class="tabular-nums">' + esc(row.cycles) + '</span></div>' +
        '</div>' +
      '</div>'
    );
  }

  function healthWidget(row) {
    var tone = row.status === 'critical' ? 'cd-renewal-rel--past' : row.status === 'attention' ? 'cd-renewal-rel--soon' : '';
    return (
      '<div class="cd-widget">' +
        '<div class="cd-widget__head"><span class="cd-widget__title">Health Summary</span></div>' +
        '<div class="tb-health-summary">' +
          '<div class="tb-health-summary__status">' + statusBadge(row) + '</div>' +
          '<p class="tb-health-summary__text' + (tone ? ' ' + tone : '') + '">' +
            (row.status === 'healthy'
              ? 'Battery pack is operating within normal parameters.'
              : row.status === 'attention'
                ? 'Monitor SOC and temperature — schedule inspection soon.'
                : 'Immediate attention required — low SOC or elevated temperature detected.') +
          '</p>' +
        '</div>' +
      '</div>'
    );
  }

  function renderOverview(row) {
    return (
      '<div class="cd-layout">' +
        '<div class="cd-main">' + renderFieldsSection(row) + '</div>' +
        '<div class="cd-side">' + metricsWidget(row) + healthWidget(row) + '</div>' +
      '</div>'
    );
  }

  function renderChargingTab(row) {
    var sessions = data.getChargingSessions(row.id);
    var rows = sessions.map(function (s) {
      return '<tr data-charge-row="' + escA(s.id) + '" style="cursor:pointer">' +
        '<td><a href="charging-history.html" class="table-cell-link" onclick="event.stopPropagation()">' + esc(s.id) + '</a></td>' +
        '<td>' + esc(s.date) + '</td>' +
        '<td class="tabular-nums">' + esc(s.energyKwh) + ' kWh</td>' +
        '<td>' + esc(s.durationLabel) + '</td>' +
        '<td class="tabular-nums">' + esc(s.socStart) + '% → ' + esc(s.socEnd) + '%</td>' +
        '<td>' + esc(s.vendor) + '</td>' +
        '<td class="tabular-nums">' + esc(s.costLabel) + '</td>' +
      '</tr>';
    }).join('');

    var toolbar =
      '<div class="table-panel__toolbar">' +
        '<div class="table-panel__search">' +
          '<span class="table-panel__search-icon" aria-hidden="true">⌕</span>' +
          '<input type="search" class="table-panel__search-input" placeholder="Search" aria-label="Search sessions" disabled>' +
        '</div>' +
        '<a href="charging-history.html" class="table-panel__link">View All ↗</a>' +
        '<span class="table-panel__count tabular-nums">1 – ' + sessions.length + ' of ' + sessions.length + '</span>' +
      '</div>';

    return listTablePanel(
      toolbar,
      sessions.length ? dataTable(['Session', 'Date', 'Energy', 'Duration', 'SOC', 'Vendor', 'Cost'], rows) : '',
      sessions.length ? '' : emptyState('No charging sessions found.')
    );
  }

  function renderPanel(row) {
    if (activeTab === 'charging') return renderChargingTab(row);
    return renderOverview(row);
  }

  function bindTabs(row) {
    document.querySelectorAll('[data-battery-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeTab = btn.getAttribute('data-battery-tab');
        render(row);
      });
    });
    document.querySelectorAll('[data-battery-tab-link]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        activeTab = link.getAttribute('data-battery-tab-link');
        render(row);
      });
    });

    document.querySelectorAll('[data-charge-row]').forEach(function (tr) {
      tr.addEventListener('click', function () {
        window.location.href = 'charging-history.html';
      });
    });
  }

  function injectIcons() {
    if (!icons) return;
    document.querySelectorAll('[data-form-icon]').forEach(function (el) {
      var key = el.getAttribute('data-form-icon');
      if (icons[key]) el.innerHTML = icons[key];
    });
  }

  function render(row) {
    if (!row) {
      window.location.href = 'battery';
      return;
    }

    document.title = row.vehicleName + ' — Battery — YSOAM';

    var hero = document.getElementById('battery-view-hero');
    var tabs = document.getElementById('battery-view-tabs');
    var panel = document.getElementById('battery-view-panel');
    var body = document.getElementById('battery-view-body');

    if (hero) hero.innerHTML = renderHero(row);
    if (tabs) tabs.innerHTML = renderTabs();
    if (panel) panel.innerHTML = renderPanel(row);
    if (body) {
      body.className = activeTab === 'charging' ? 'vd-body vd-body--table' : 'vd-body cd-body';
    }

    initLucide(hero);
    bindTabs(row);
  }

  function init() {
    injectIcons();
    var row = data.getById(getId());
    render(row);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
