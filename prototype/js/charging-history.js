(function () {
  'use strict';

  var data = window.YSOAM_CHARGING_HISTORY;
  var vehicles = window.YSOAM_VEHICLES;
  var dateFilter = window.YSOAM_DATE_FILTER;

  var POPULAR = [
    { id: 'started', label: 'Started At' },
    { id: 'ended', label: 'Ended At' },
    { id: 'vehicle', label: 'Vehicle' },
    { id: 'vendor', label: 'Vendor' }
  ];

  var defaultStarted = dateFilter.presetRange('last30');

  var state = {
    search: '',
    page: 1,
    pageSize: 50,
    filters: {
      started: { active: true, start: defaultStarted.start, end: defaultStarted.end, preset: 'last30' },
      ended: { active: false, start: null, end: null, preset: null },
      vehicles: [],
      vendors: [],
      minKwh: null
    }
  };

  var draft = null;
  var dateDraft = null;
  var dateUi = null;
  var openFilter = null;

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }

  function filterCount() {
    var f = state.filters;
    var n = 0;
    if (f.started.active) n++;
    if (f.ended.active) n++;
    if (f.vehicles.length) n++;
    if (f.vendors.length) n++;
    if (f.minKwh != null) n++;
    return n;
  }

  function filteredList() {
    var q = state.search.trim().toLowerCase();
    var f = state.filters;
    return data.list.filter(function (row) {
      if (!dateFilter.matchesRange(row.startTime, f.started)) return false;
      if (!dateFilter.matchesRange(row.endTime, f.ended)) return false;
      if (f.vehicles.length && f.vehicles.indexOf(row.vehicleId) === -1) return false;
      if (f.vendors.length && f.vendors.indexOf(row.vendor.id) === -1) return false;
      if (f.minKwh != null && row.totalEnergy <= f.minKwh) return false;
      if (q) {
        var v = vehicles.getById(row.vehicleId);
        var hay = [row.id, row.vendor.name, v && v.name, v && v.id, row.reference].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function vehicleCell(row) {
    var v = vehicles.getById(row.vehicleId);
    if (!v) return dashCell();
    var idx = vehicles.list.indexOf(v);
    var thumb = vehicles.thumbForIndex(idx >= 0 ? idx : 0);
    return (
      '<div class="fh-vehicle-cell">' +
        '<img src="' + escA(thumb) + '" alt="" class="fh-vehicle-thumb" width="40" height="40">' +
        '<div class="fh-vehicle-cell__text">' +
          '<a href="vehicles?id=' + escA(v.id) + '" class="table-cell-link">' + esc(v.name) + '</a>' +
          (row.isSample ? '<span class="fh-sample-badge">Sample</span>' : '') +
        '</div>' +
      '</div>'
    );
  }

  function rowActionIcon(key) {
    var icons = window.YSOAM_ICONS;
    return icons && icons[key] ? icons[key] : '';
  }

  function rowActionsMenu(row) {
    return (
      '<div class="row-actions" data-row-actions="' + escA(row.id) + '">' +
        '<button type="button" class="row-actions__trigger" aria-label="More actions for ' + escA(row.id) + '" aria-haspopup="menu" aria-expanded="false">' +
          '<span class="row-actions__dots" aria-hidden="true"></span>' +
        '</button>' +
        '<div class="row-actions__menu" role="menu" hidden>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="view" role="menuitem">View <span class="row-actions__item-icon">' + rowActionIcon('actionView') + '</span></button>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="edit" role="menuitem">Edit <span class="row-actions__item-icon">' + rowActionIcon('actionEdit') + '</span></button>' +
          '<div class="row-actions__divider" role="separator"></div>' +
          '<button type="button" class="row-actions__item row-actions__item--btn row-actions__item--danger" data-action="delete" role="menuitem">Delete <span class="row-actions__item-icon">' + rowActionIcon('actionDelete') + '</span></button>' +
        '</div>' +
      '</div>'
    );
  }

  function closeAllRowMenus() {
    document.querySelectorAll('.fuel-history-panel .row-actions__menu').forEach(function (m) {
      m.hidden = true;
      m.style.position = '';
      m.style.top = '';
      m.style.left = '';
      m.style.right = '';
    });
    document.querySelectorAll('.fuel-history-panel .row-actions__trigger').forEach(function (b) {
      b.setAttribute('aria-expanded', 'false');
    });
  }

  function positionRowMenu(trigger, menu) {
    var rect = trigger.getBoundingClientRect();
    menu.hidden = false;
    menu.style.position = 'fixed';
    menu.style.top = (rect.bottom + 4) + 'px';
    menu.style.left = Math.max(8, rect.right - 188) + 'px';
    menu.style.right = 'auto';
    menu.style.zIndex = '120';
  }

  function bindRowActions() {
    document.querySelectorAll('.fuel-history-panel .row-actions').forEach(function (wrap) {
      if (wrap.getAttribute('data-bound')) return;
      wrap.setAttribute('data-bound', '1');
      wrap.addEventListener('click', function (e) { e.stopPropagation(); });
    });

    document.querySelectorAll('.fuel-history-panel .row-actions__trigger').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var menu = btn.closest('.row-actions').querySelector('.row-actions__menu');
        var willOpen = menu.hidden;
        closeAllRowMenus();
        if (willOpen) {
          positionRowMenu(btn, menu);
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    document.querySelectorAll('.fuel-history-panel [data-action="view"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        var rowId = btn.closest('[data-row-actions]').getAttribute('data-row-actions');
        closeAllRowMenus();
        window.location.href = 'charging-entry-view?id=' + encodeURIComponent(rowId);
      });
    });

    document.querySelectorAll('.fuel-history-panel [data-action="edit"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        var rowId = btn.closest('[data-row-actions]').getAttribute('data-row-actions');
        closeAllRowMenus();
        window.location.href = 'charging-entry-form?id=' + encodeURIComponent(rowId);
      });
    });

    document.querySelectorAll('.fuel-history-panel [data-action="delete"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        closeAllRowMenus();
        window.alert('Delete charging entry (prototype demo).');
      });
    });
  }

  function vendorCell(vendor) {
    return (
      '<div class="fh-vendor-cell fh-vendor-cell--charge">' +
        '<span class="fh-vendor-charge-icon" data-lucide-icon="zap" data-lucide-icon-size="14" aria-hidden="true"></span>' +
        '<span>' + esc(vendor.name) + '</span>' +
      '</div>'
    );
  }

  function dateLinkCell(iso, rowId) {
    return '<a href="charging-entry-view?id=' + escA(rowId) + '" class="table-cell-link fh-date-link">' +
      esc(data.formatDateTime(iso)) + '</a>';
  }

  function metricCell(value, unit) {
    if (value == null || value === '') return dashCell();
    return '<div class="fh-metric-cell"><span class="tabular-nums">' + esc(value) + '</span><span class="fh-metric-cell__unit">' + esc(unit) + '</span></div>';
  }

  function unitPriceCell(row) {
    return (
      '<div class="fh-total-cell">' +
        '<span class="fh-total-cell__main tabular-nums">' + esc(data.formatUnitPrice(row.unitPrice)) + '</span>' +
        '<span class="fh-total-cell__sub tabular-nums">/ kWh</span>' +
      '</div>'
    );
  }

  function optionalTextCell(value) {
    if (value == null || value === '') return dashCell();
    return '<span class="tabular-nums">' + esc(value) + '</span>';
  }

  function dashCell() {
    return '<span class="fh-cell-empty">—</span>';
  }

  function renderStats(rows) {
    var root = document.getElementById('ch-stats');
    if (!root) return;
    var s = data.computeStats(rows);
    root.innerHTML =
      '<div class="fh-stat-card"><span class="fh-stat-card__label">Total Charging Cost</span><span class="fh-stat-card__value tabular-nums">' + esc(data.formatMoney(s.totalCost)) + '</span></div>' +
      '<div class="fh-stat-card"><span class="fh-stat-card__label">Total Energy</span><span class="fh-stat-card__value tabular-nums">' + s.totalEnergy.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' kWh</span></div>' +
      '<div class="fh-stat-card"><span class="fh-stat-card__label">Average Energy Economy</span><span class="fh-stat-card__value tabular-nums">' + (s.avgEconomy ? s.avgEconomy.toFixed(2) + ' km/kWh' : '—') + '</span></div>' +
      '<div class="fh-stat-card"><span class="fh-stat-card__label">Avg. Cost</span><span class="fh-stat-card__value tabular-nums">' + esc(data.formatMoney(s.avgCost)) + ' / kWh</span></div>';
  }

  function renderTable() {
    var root = document.getElementById('charging-history-table');
    var countEl = document.getElementById('ch-count');
    if (!root) return;

    var all = filteredList();
    renderStats(all);

    var total = all.length;
    var totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    if (state.page > totalPages) state.page = totalPages;
    var start = (state.page - 1) * state.pageSize;
    var rows = all.slice(start, start + state.pageSize);
    var from = total ? start + 1 : 0;
    var to = Math.min(state.page * state.pageSize, total);
    if (countEl) countEl.textContent = from + ' – ' + to + ' of ' + total;

    var html = '<table class="data-table data-table--list data-table--fuel-history data-table--charging-history"><thead><tr>' +
      '<th class="data-table__check-col"><input type="checkbox" aria-label="Select all"></th>' +
      '<th class="fh-col-vehicle">Vehicle</th>' +
      '<th class="fh-col-date fh-col-sortable"><span class="fh-th-sort">Start Time <span data-lucide-icon="chevronDown" data-lucide-icon-size="14" aria-hidden="true"></span></span></th>' +
      '<th class="fh-col-date">End Time</th>' +
      '<th class="fh-col-num fh-col-duration">Duration</th>' +
      '<th class="fh-col-vendor">Vendor</th>' +
      '<th class="fh-col-num fh-col-meter fh-col-link-header">Meter Entry</th>' +
      '<th class="fh-col-num fh-col-usage">Usage</th>' +
      '<th class="fh-col-num fh-col-economy">Economy</th>' +
      '<th class="fh-col-num fh-col-volume">Total Energy</th>' +
      '<th class="fh-col-num fh-col-unit-price">Unit Price</th>' +
      '<th class="fh-col-num fh-col-total">Energy Cost</th>' +
      '<th class="fh-col-num fh-col-cost-meter">Cost Per Meter</th>' +
      '<th class="data-table__actions-col" aria-label="Actions"></th>' +
      '</tr></thead><tbody>';

    if (!rows.length) {
      html += '<tr><td colspan="14" class="service-history-empty">' +
        '<span class="fh-empty-state"><span class="fh-empty-state__icon" data-lucide-icon="search" data-lucide-icon-size="32" aria-hidden="true"></span>No results to show</span></td></tr>';
    } else {
      rows.forEach(function (row) {
        html += '<tr>' +
          '<td class="data-table__check-col"><input type="checkbox" aria-label="Select row"></td>' +
          '<td class="fh-col-vehicle">' + vehicleCell(row) + '</td>' +
          '<td class="fh-col-date">' + dateLinkCell(row.startTime, row.id) + '</td>' +
          '<td class="fh-col-date">' + dateLinkCell(row.endTime, row.id) + '</td>' +
          '<td class="fh-col-num fh-col-duration tabular-nums">' + esc(data.formatDuration(row.durationMin)) + '</td>' +
          '<td class="fh-col-vendor">' + vendorCell(row.vendor) + '</td>' +
          '<td class="fh-col-num fh-col-meter">' + optionalTextCell(row.meterEntry) + '</td>' +
          '<td class="fh-col-num fh-col-usage">' + optionalTextCell(row.usage) + '</td>' +
          '<td class="fh-col-num fh-col-economy">' + metricCell(row.economy, 'km/kWh') + '</td>' +
          '<td class="fh-col-num fh-col-volume">' + metricCell(row.totalEnergy.toFixed(2), 'kWh') + '</td>' +
          '<td class="fh-col-num fh-col-unit-price">' + unitPriceCell(row) + '</td>' +
          '<td class="fh-col-num fh-col-total tabular-nums">' + esc(data.formatMoney(row.energyCost)) + '</td>' +
          '<td class="fh-col-num fh-col-cost-meter">' + metricCell(row.costPerMeter, '₹ / km') + '</td>' +
          '<td class="data-table__actions-col">' + rowActionsMenu(row) + '</td>' +
          '</tr>';
      });
    }
    html += '</tbody></table>';
    root.innerHTML = html;
    initLucide(root);
    bindRowActions();
    updatePills();
  }

  function updatePills() {
    var f = state.filters;
    document.querySelectorAll('.fuel-history-panel .expense-filter-pill').forEach(function (btn) {
      var k = btn.getAttribute('data-filter');
      var on = (k === 'started' && f.started.active) ||
        (k === 'ended' && f.ended.active) ||
        (k === 'vehicle' && f.vehicles.length) ||
        (k === 'vendor' && f.vendors.length);
      btn.classList.toggle('has-filter', !!on);
    });
    var btn = document.getElementById('ch-filters-btn');
    var lbl = document.getElementById('ch-filters-btn-label');
    if (btn) {
      var n = filterCount();
      var open = document.getElementById('ch-filters-drawer').classList.contains('is-open');
      btn.classList.toggle('is-active', n > 0 || open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (lbl) lbl.textContent = n > 0 ? n + ' Filter' + (n === 1 ? '' : 's') : 'Filters';
    }
  }

  function closePop() {
    var p = document.getElementById('ch-filter-popover');
    if (p) {
      p.hidden = true;
      p.classList.remove('is-date-popover');
    }
    document.querySelectorAll('.fuel-history-panel .expense-filter-pill').forEach(function (b) {
      b.classList.remove('is-open');
      b.setAttribute('aria-expanded', 'false');
    });
    openFilter = null;
    draft = null;
    dateDraft = null;
    dateUi = null;
  }

  function positionPop(anchor, pop) {
    var panel = document.querySelector('.fuel-history-panel');
    if (!panel) return;
    var pr = panel.getBoundingClientRect();
    var r = anchor.getBoundingClientRect();
    pop.style.top = (r.bottom - pr.top + 6) + 'px';
    var w = pop.offsetWidth || (openFilter === 'started' || openFilter === 'ended' ? 620 : 360);
    pop.style.left = Math.max(8, Math.min(r.left - pr.left, pr.width - w - 8)) + 'px';
  }

  function isDateFilter(kind) {
    return kind === 'started' || kind === 'ended';
  }

  function selectPopover(kind, selected) {
    var list = '';
    if (kind === 'vehicle') {
      list = vehicles.list.filter(function (v) { return v.assignment !== 'archived'; }).map(function (v, idx) {
        var checked = selected.indexOf(v.id) !== -1;
        var thumb = vehicles.thumbForIndex(idx);
        return '<label class="meter-select-item meter-select-item--vehicle">' +
          '<input type="checkbox" value="' + escA(v.id) + '"' + (checked ? ' checked' : '') + '>' +
          '<img src="' + escA(thumb) + '" alt="" class="meter-select-item__thumb" width="36" height="36">' +
          '<span><strong>' + esc(v.name) + '</strong><small>' + esc(v.type) + ' · ' + esc(v.group) + '</small></span>' +
          (idx < 10 ? '<span class="fh-sample-badge">Sample</span>' : '') +
          '</label>';
      }).join('');
    } else if (kind === 'vendor') {
      list = data.vendors.map(function (v) {
        var checked = selected.indexOf(v.id) !== -1;
        return '<label class="meter-select-item"><input type="checkbox" value="' + escA(v.id) + '"' + (checked ? ' checked' : '') + '><span>' + esc(v.name) + '</span><span class="fh-sample-badge">Sample</span></label>';
      }).join('');
    }
    return '<div class="meter-popover meter-popover--select"><div class="meter-popover__search"><span data-lucide-icon="search" aria-hidden="true"></span>' +
      '<input type="search" class="meter-popover__search-input" placeholder="Select item(s)" data-select-search></div>' +
      '<div class="meter-popover__list" data-select-list>' + list + '</div>' +
      '<div class="meter-popover__footer"><div class="meter-popover__footer-right">' +
      '<button type="button" class="btn btn-text btn-sm" data-popover-cancel>Cancel</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-popover-apply>Apply</button></div></div></div>';
  }

  function bindPop(kind) {
    var pop = document.getElementById('ch-filter-popover');
    if (isDateFilter(kind)) return;

    pop.querySelector('[data-popover-cancel]').onclick = closePop;
    pop.querySelector('[data-popover-apply]').onclick = function () {
      var vals = Array.prototype.map.call(pop.querySelectorAll('[data-select-list] input:checked'), function (el) { return el.value; });
      if (kind === 'vehicle') state.filters.vehicles = vals;
      else if (kind === 'vendor') state.filters.vendors = vals;
      closePop();
      state.page = 1;
      renderTable();
      if (document.getElementById('ch-filters-drawer').classList.contains('is-open')) renderDrawer();
    };
    var input = pop.querySelector('[data-select-search]');
    var list = pop.querySelector('[data-select-list]');
    if (input && list) {
      input.oninput = function () {
        var q = input.value.trim().toLowerCase();
        list.querySelectorAll('.meter-select-item').forEach(function (item) {
          item.hidden = q && item.textContent.toLowerCase().indexOf(q) === -1;
        });
      };
      input.focus();
    }
  }

  function openPop(kind, anchor) {
    closeDrawer();
    closeTableSettings();
    var pop = document.getElementById('ch-filter-popover');
    openFilter = kind;

    if (isDateFilter(kind)) {
      dateDraft = dateFilter.createDraftFromFilter(state.filters[kind]);
      dateUi = {
        calMonth: dateFilter.parseIso(dateDraft.start),
        calPick: 'start'
      };
      pop.innerHTML = dateFilter.renderPopover(dateDraft, dateUi);
      pop.classList.add('is-date-popover');
      pop.hidden = false;
      anchor.classList.add('is-open');
      anchor.setAttribute('aria-expanded', 'true');
      positionPop(anchor, pop);
      dateFilter.bindPopover(pop, dateDraft, dateUi, {
        onCancel: closePop,
        onClear: function () {
          state.filters[kind] = { active: false, start: null, end: null, preset: null };
          closePop();
          state.page = 1;
          renderTable();
          if (document.getElementById('ch-filters-drawer').classList.contains('is-open')) renderDrawer();
        },
        onApply: function (applied) {
          state.filters[kind] = {
            active: true,
            start: applied.start,
            end: applied.end,
            preset: applied.preset
          };
          closePop();
          state.page = 1;
          renderTable();
          if (document.getElementById('ch-filters-drawer').classList.contains('is-open')) renderDrawer();
        }
      });
      return;
    }

    if (kind === 'vehicle') draft = state.filters.vehicles.slice();
    else if (kind === 'vendor') draft = state.filters.vendors.slice();
    pop.classList.remove('is-date-popover');
    pop.innerHTML = selectPopover(kind, draft);
    pop.hidden = false;
    anchor.classList.add('is-open');
    anchor.setAttribute('aria-expanded', 'true');
    positionPop(anchor, pop);
    bindPop(kind);
    initLucide(pop);
  }

  function closeDrawer() {
    document.getElementById('ch-filters-drawer').classList.remove('is-open');
    updatePills();
  }

  function openDrawer() {
    closePop();
    document.getElementById('ch-filters-drawer').classList.add('is-open');
    renderDrawer();
    updatePills();
  }

  function renderDrawer() {
    var body = document.getElementById('ch-filters-drawer-body');
    var f = state.filters;
    var applied = '';
    if (f.started.active) {
      var startedLabel = f.started.preset ? dateFilter.presetLabel(f.started.preset) : (dateFilter.formatDate(f.started.start) + ' – ' + dateFilter.formatDate(f.started.end));
      applied += '<div class="expense-drawer-applied"><span>Charging Entry Started At</span><span>' + esc(startedLabel) + '</span><button type="button" data-clear="started" aria-label="Remove"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    }
    if (f.ended.active) {
      var endedLabel = f.ended.preset ? dateFilter.presetLabel(f.ended.preset) : (dateFilter.formatDate(f.ended.start) + ' – ' + dateFilter.formatDate(f.ended.end));
      applied += '<div class="expense-drawer-applied"><span>Charging Entry Ended At</span><span>' + esc(endedLabel) + '</span><button type="button" data-clear="ended"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    }
    if (f.vehicles.length) applied += '<div class="expense-drawer-applied"><span>Vehicle</span><span>' + f.vehicles.length + ' selected</span><button type="button" data-clear="vehicle"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    if (f.vendors.length) applied += '<div class="expense-drawer-applied"><span>Vendor</span><span>' + f.vendors.length + ' selected</span><button type="button" data-clear="vendor"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    if (f.minKwh != null) applied += '<div class="expense-drawer-applied"><span>Total kWh</span><span>&gt; ' + esc(f.minKwh) + '</span><button type="button" data-clear="kwh"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';

    body.innerHTML =
      '<div class="expense-drawer-rules">' +
        '<div class="expense-drawer-rules__logic"><label>All of…</label></div>' +
        (filterCount() ? applied : '<p class="expense-drawer-empty">No filters applied.</p>') +
      '</div>' +
      '<button type="button" class="btn btn-primary btn-sm expense-drawer-add" id="ch-drawer-add">Add Filter <span data-lucide-icon="chevronDown" data-lucide-icon-size="14" aria-hidden="true"></span></button>' +
      '<div class="expense-drawer-popular"><h3>Popular Filters</h3><ul class="expense-drawer-popular__list">' +
      POPULAR.map(function (p) { return '<li><button type="button" class="expense-drawer-popular__link" data-open="' + p.id + '">' + esc(p.label) + '</button></li>'; }).join('') +
      '</ul></div>' +
      '<button type="button" class="btn btn-primary expense-drawer-apply" id="ch-drawer-apply">Apply</button>';

    body.querySelectorAll('[data-clear]').forEach(function (b) {
      b.onclick = function () {
        var k = b.getAttribute('data-clear');
        if (k === 'started') state.filters.started = { active: false, start: null, end: null, preset: null };
        else if (k === 'ended') state.filters.ended = { active: false, start: null, end: null, preset: null };
        else if (k === 'vehicle') state.filters.vehicles = [];
        else if (k === 'vendor') state.filters.vendors = [];
        else if (k === 'kwh') state.filters.minKwh = null;
        state.page = 1;
        renderTable();
      };
    });
    body.querySelectorAll('[data-open]').forEach(function (b) {
      b.onclick = function () {
        var pill = document.querySelector('.fuel-history-panel .expense-filter-pill[data-filter="' + b.getAttribute('data-open') + '"]');
        if (pill) openPop(b.getAttribute('data-open'), pill);
      };
    });
    document.getElementById('ch-drawer-add').onclick = function () {
      var pill = document.querySelector('.fuel-history-panel .expense-filter-pill[data-filter="started"]');
      if (pill) openPop('started', pill);
    };
    document.getElementById('ch-drawer-apply').onclick = function () {
      if (filterCount() === 1 && state.filters.started.active && state.filters.minKwh == null) {
        state.filters.minKwh = 0;
      }
      closeDrawer();
      state.page = 1;
      renderTable();
    };
    initLucide(body);
  }

  function closeTableSettings() {
    var el = document.getElementById('ch-table-settings');
    if (el) el.hidden = true;
  }

  function openTableSettings(anchor) {
    closePop();
    var el = document.getElementById('ch-table-settings');
    el.innerHTML = '<div class="meter-table-settings__section"><a href="#" class="meter-table-settings__manage">Manage Columns</a></div>' +
      '<div class="meter-table-settings__section"><div class="meter-table-settings__title">Items Per Page</div>' +
      [50, 100, 200].map(function (n) {
        return '<label class="meter-settings-option"><input type="radio" name="ch-page-size" value="' + n + '"' + (state.pageSize === n ? ' checked' : '') + '> ' + n + '</label>';
      }).join('') + '</div>';
    el.hidden = false;
    positionPop(anchor, el);
    el.querySelectorAll('input[name="ch-page-size"]').forEach(function (r) {
      r.onchange = function () { state.pageSize = parseInt(r.value, 10); state.page = 1; renderTable(); };
    });
  }

  function init() {
    if (document.body.getAttribute('data-subpage') !== 'charging-history') return;
    initLucide();

    document.getElementById('ch-search').oninput = function (e) {
      state.search = e.target.value;
      state.page = 1;
      renderTable();
    };

    document.querySelectorAll('.fuel-history-panel .expense-filter-pill').forEach(function (btn) {
      btn.onclick = function () {
        var k = btn.getAttribute('data-filter');
        if (openFilter === k && !document.getElementById('ch-filter-popover').hidden) closePop();
        else openPop(k, btn);
      };
    });

    document.getElementById('ch-filters-btn').onclick = function () {
      if (document.getElementById('ch-filters-drawer').classList.contains('is-open')) closeDrawer();
      else openDrawer();
    };
    document.getElementById('ch-filters-drawer-close').onclick = closeDrawer;

    document.getElementById('ch-pagination').querySelector('[data-page-prev]').onclick = function () {
      if (state.page > 1) { state.page--; renderTable(); }
    };
    document.getElementById('ch-pagination').querySelector('[data-page-next]').onclick = function () {
      var tp = Math.max(1, Math.ceil(filteredList().length / state.pageSize));
      if (state.page < tp) { state.page++; renderTable(); }
    };

    document.getElementById('ch-table-settings-btn').onclick = function (e) {
      var el = document.getElementById('ch-table-settings');
      if (!el.hidden) closeTableSettings();
      else openTableSettings(e.currentTarget);
    };

    document.getElementById('ch-add-btn').onclick = function () {
      window.location.href = 'charging-entry-form';
    };

    document.getElementById('ch-group-btn').onclick = function () {
      window.alert('Group by options (prototype demo).');
    };

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#ch-filter-popover') && !e.target.closest('.fuel-history-panel .expense-filter-pill')) closePop();
      if (!e.target.closest('#ch-table-settings') && !e.target.closest('#ch-table-settings-btn')) closeTableSettings();
      if (!e.target.closest('.fuel-history-panel [data-row-actions]')) closeAllRowMenus();
    });

    renderTable();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
