(function () {
  'use strict';

  if (document.body.getAttribute('data-subpage') !== 'tyre-view') return;

  var data = window.YSOAM_TYRES;
  var vehicles = window.YSOAM_VEHICLES;
  var icons = window.YSOAM_ICONS;

  var TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'history', label: 'Reading History' }
  ];

  var activeTab = 'overview';

  function getId() {
    return new URLSearchParams(window.location.search).get('id');
  }

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function lucide(name, size) { return window.YSOAM_LUCIDE ? window.YSOAM_LUCIDE.icon(name, size || 16) : ''; }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }
  function dash(val) { return val && val !== '—' ? esc(val) : '<span class="cd-muted">—</span>'; }

  function statusBadge(row) {
    var mod = row.status === 'replace_soon' ? 'warning' : row.status === 'retired' ? 'muted' : row.status === 'in_stock' ? 'info' : 'ok';
    return '<span class="tyre-status tyre-status--' + mod + '">' + esc(row.statusLabel) + '</span>';
  }

  function treadCell(mm) {
    var cls = mm <= 3 ? 'tyre-tread tyre-tread--low' : mm <= 5 ? 'tyre-tread tyre-tread--mid' : 'tyre-tread';
    return '<span class="' + cls + ' tabular-nums">' + esc(mm) + ' mm</span>';
  }

  function fieldRow(label, html) {
    return (
      '<div class="vd-field-row">' +
        '<span class="vd-field-label">' + esc(label) + '</span>' +
        '<span class="vd-field-val">' + html + '</span>' +
      '</div>'
    );
  }

  function vehicleLink(row) {
    if (!row.vehicleId) return dash('');
    return '<a href="vehicle-detail.html?id=' + escA(row.vehicleId) + '" class="cd-link">' + esc(row.vehicleName) + '</a>';
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
    return (
      '<div class="tb-hero-icon" aria-hidden="true">' + lucide('circle', 28) + '</div>' +
      '<div class="vd-hero__info">' +
        '<h1 class="vd-hero__name">' + esc(row.id) + '</h1>' +
        '<div class="cd-hero-meta">' +
          '<span class="cd-hero-meta__item"><span class="cd-hero-meta__key">Serial</span> ' + dash(row.serialNumber) + '</span>' +
          '<span class="cd-hero-meta__sep">·</span>' +
          '<span class="cd-hero-meta__item"><span class="cd-hero-meta__key">Position</span> ' + dash(row.position) + '</span>' +
          '<span class="cd-hero-meta__sep">·</span>' +
          '<span class="cd-hero-meta__item"><span class="cd-hero-meta__key">Vehicle</span> ' + vehicleLink(row) + '</span>' +
          '<span class="cd-hero-meta__sep">·</span>' +
          '<span class="cd-hero-meta__item"><span class="cd-hero-meta__key">Status</span> ' + statusBadge(row) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="vd-hero__actions">' +
        '<a href="tyre-reading-form?id=' + escA(row.id) + '" class="btn btn-outline btn-sm">Edit</a>' +
        '<a href="tyre-reading-form" class="btn btn-primary btn-sm">+ Add Reading</a>' +
      '</div>'
    );
  }

  function renderTabs() {
    return TABS.map(function (tab) {
      var active = tab.id === activeTab;
      return '<button type="button" class="vd-tab' + (active ? ' is-active' : '') + '" role="tab" data-tyre-tab="' + tab.id + '" aria-selected="' + (active ? 'true' : 'false') + '">' + esc(tab.label) + '</button>';
    }).join('');
  }

  function renderFieldsSection(row) {
    var rows = [
      fieldRow('Tyre ID', dash(row.id)),
      fieldRow('Serial Number', dash(row.serialNumber)),
      fieldRow('Position', dash(row.position)),
      fieldRow('Vehicle', vehicleLink(row)),
      fieldRow('Brand', dash(row.brand)),
      fieldRow('Size', dash(row.size)),
      fieldRow('Status', statusBadge(row)),
      fieldRow('Installed On', dash(row.installedOn)),
      fieldRow('Unit Cost', esc(row.costLabel))
    ].join('');

    return (
      '<div class="cd-section">' +
        '<div class="cd-section__head">' +
          '<span class="cd-section__title">Details</span>' +
          '<a href="#" class="cd-section__action">All Fields</a>' +
        '</div>' +
        '<div class="cd-group">' +
          '<button type="button" class="cd-group__toggle" type="button">' +
            '<svg class="cd-group__chevron is-open" width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            'Tyre Information' +
          '</button>' +
          '<div class="cd-group__body">' + rows + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function readingsWidget(row) {
    return (
      '<div class="cd-widget">' +
        '<div class="cd-widget__head">' +
          '<span class="cd-widget__title">Current Readings</span>' +
          '<span class="cd-widget__acts">' +
            '<a href="tyre-reading-form?id=' + escA(row.id) + '" class="cd-widget__add">+ Add Reading</a>' +
            '<a href="#" class="cd-widget__viewall" data-tyre-tab-link="history">View All</a>' +
          '</span>' +
        '</div>' +
        '<div class="tb-reading-widget">' +
          '<div class="tb-reading-widget__item"><span class="tb-reading-widget__label">Tread Depth</span>' + treadCell(row.treadDepthMm) + '</div>' +
          '<div class="tb-reading-widget__item"><span class="tb-reading-widget__label">Pressure</span><span class="tabular-nums">' + esc(row.pressurePsi) + ' PSI</span></div>' +
          '<div class="tb-reading-widget__item"><span class="tb-reading-widget__label">Replace Threshold</span><span>&lt; 3 mm</span></div>' +
          '<div class="tb-reading-widget__item"><span class="tb-reading-widget__label">Recommended PSI</span><span>75 – 85 PSI</span></div>' +
        '</div>' +
      '</div>'
    );
  }

  function vehicleWidget(row) {
    if (!row.vehicleId) {
      return (
        '<div class="cd-widget">' +
          '<div class="cd-widget__head"><span class="cd-widget__title">Assigned Vehicle</span></div>' +
          '<div class="cd-empty-state cd-empty-state--compact">' +
            '<p class="cd-empty-text">This tyre is not currently assigned to a vehicle.</p>' +
          '</div>' +
        '</div>'
      );
    }
    var v = vehicles.getById(row.vehicleId);
    if (!v) return '';
    return (
      '<div class="cd-widget">' +
        '<div class="cd-widget__head">' +
          '<span class="cd-widget__title">Assigned Vehicle</span>' +
          '<a href="vehicle-detail.html?id=' + escA(v.id) + '" class="cd-widget__viewall">View Vehicle</a>' +
        '</div>' +
        '<div class="cd-assign-row">' +
          '<img class="cd-assign-thumb" src="' + escA(v.image) + '" alt="">' +
          '<div class="cd-assign-info">' +
            '<a href="vehicle-detail.html?id=' + escA(v.id) + '" class="cd-assign-name">' + esc(v.name) + '</a>' +
            '<span class="cd-assign-meta">' + esc(v.make + ' ' + v.model + ' · ' + v.year) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderOverview(row) {
    return (
      '<div class="cd-layout">' +
        '<div class="cd-main">' + renderFieldsSection(row) + '</div>' +
        '<div class="cd-side">' + readingsWidget(row) + vehicleWidget(row) + '</div>' +
      '</div>'
    );
  }

  function renderHistoryTab(row) {
    var readings = data.getReadings(row.id);
    var rows = readings.map(function (r) {
      return '<tr>' +
        '<td>' + esc(r.date) + '</td>' +
        '<td>' + treadCell(r.treadDepthMm) + '</td>' +
        '<td class="tabular-nums">' + esc(r.pressurePsi) + ' PSI</td>' +
        '<td>' + esc(r.recordedBy) + '</td>' +
        '<td>' + esc(r.source) + '</td>' +
      '</tr>';
    }).join('');

    var toolbar =
      '<div class="table-panel__toolbar">' +
        '<div class="table-panel__search">' +
          '<span class="table-panel__search-icon" aria-hidden="true">⌕</span>' +
          '<input type="search" class="table-panel__search-input" placeholder="Search" aria-label="Search readings" disabled>' +
        '</div>' +
        '<a href="tyre-reading-form?id=' + escA(row.id) + '" class="table-panel__link">+ Add Reading</a>' +
        '<span class="table-panel__count tabular-nums">1 – ' + readings.length + ' of ' + readings.length + '</span>' +
      '</div>';

    return listTablePanel(
      toolbar,
      readings.length ? dataTable(['Date', 'Tread', 'Pressure', 'Recorded By', 'Source'], rows) : '',
      readings.length ? '' : emptyState('No readings recorded.')
    );
  }

  function renderPanel(row) {
    if (activeTab === 'history') return renderHistoryTab(row);
    return renderOverview(row);
  }

  function bindTabs(row) {
    document.querySelectorAll('[data-tyre-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeTab = btn.getAttribute('data-tyre-tab');
        render(row);
      });
    });
    document.querySelectorAll('[data-tyre-tab-link]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        activeTab = link.getAttribute('data-tyre-tab-link');
        render(row);
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
      window.location.href = 'tyres';
      return;
    }

    document.title = row.id + ' — Tyre Management — YSOAM';

    var hero = document.getElementById('tyre-view-hero');
    var tabs = document.getElementById('tyre-view-tabs');
    var panel = document.getElementById('tyre-view-panel');
    var body = document.getElementById('tyre-view-body');

    if (hero) hero.innerHTML = renderHero(row);
    if (tabs) tabs.innerHTML = renderTabs();
    if (panel) panel.innerHTML = renderPanel(row);
    if (body) {
      body.className = activeTab === 'history' ? 'vd-body vd-body--table' : 'vd-body cd-body';
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
