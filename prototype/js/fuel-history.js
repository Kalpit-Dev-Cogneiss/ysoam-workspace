(function () {
  'use strict';

  var data = window.YSOAM_FUEL_HISTORY;
  var vehicles = window.YSOAM_VEHICLES;

  var POPULAR = [
    { id: 'date', label: 'Date' },
    { id: 'vehicle', label: 'Vehicle' },
    { id: 'group', label: 'Vehicle Group' },
    { id: 'vendor', label: 'Vendor' }
  ];

  var DATE_PRESETS = [
    { id: 'last7', label: 'Last 7 Days' },
    { id: 'last30', label: 'Last 30 Days' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'lastMonth', label: 'Last Month' },
    { id: 'thisYear', label: 'This Year' }
  ];

  function presetRange(id) {
    var now = new Date(2026, 5, 15);
    var start;
    var end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    if (id === 'last7') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    } else if (id === 'last30') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    } else if (id === 'thisMonth') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (id === 'lastMonth') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (id === 'thisYear') {
      start = new Date(now.getFullYear(), 0, 1);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    }
    return { start: start, end: end, preset: id };
  }

  var defaultDate = presetRange('last30');

  var state = {
    search: '',
    page: 1,
    pageSize: 50,
    filters: {
      date: { active: true, start: defaultDate.start, end: defaultDate.end, preset: 'last30' },
      vehicles: [],
      groups: [],
      vendors: []
    }
  };

  var draft = null;
  var openFilter = null;

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function lucide(name, size) { return window.YSOAM_LUCIDE ? window.YSOAM_LUCIDE.icon(name, size || 16) : ''; }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }

  function toDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function filterCount() {
    var f = state.filters;
    var n = 0;
    if (f.date.active) n++;
    if (f.vehicles.length) n++;
    if (f.groups.length) n++;
    if (f.vendors.length) n++;
    return n;
  }

  function filteredList() {
    var q = state.search.trim().toLowerCase();
    var f = state.filters;
    return data.list.filter(function (row) {
      var v = vehicles.getById(row.vehicleId);
      if (f.date.active) {
        var d = new Date(row.date);
        if (d < f.date.start || d > f.date.end) return false;
      }
      if (f.vehicles.length && f.vehicles.indexOf(row.vehicleId) === -1) return false;
      if (f.groups.length && (!v || f.groups.indexOf(v.group) === -1)) return false;
      if (f.vendors.length && f.vendors.indexOf(row.vendor.id) === -1) return false;
      if (q) {
        var hay = [
          row.id, row.vendor.name, v && v.name, v && v.id, v && v.group, row.location
        ].join(' ').toLowerCase();
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
        closeAllRowMenus();
        window.alert('View fuel entry (prototype demo).');
      });
    });

    document.querySelectorAll('.fuel-history-panel [data-action="edit"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        closeAllRowMenus();
        window.alert('Edit fuel entry (prototype demo).');
      });
    });

    document.querySelectorAll('.fuel-history-panel [data-action="delete"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        closeAllRowMenus();
        window.alert('Delete fuel entry (prototype demo).');
      });
    });
  }

  function vendorCell(vendor) {
    return (
      '<div class="fh-vendor-cell">' +
        '<span class="fh-vendor-badge" aria-hidden="true">' + esc(vendor.short) + '</span>' +
        '<span>' + esc(vendor.name) + '</span>' +
      '</div>'
    );
  }

  function totalCell(row) {
    return (
      '<div class="fh-total-cell">' +
        '<span class="fh-total-cell__main tabular-nums">' + esc(data.formatMoney(row.total)) + '</span>' +
        '<span class="fh-total-cell__sub tabular-nums">' + esc(data.formatMoney(row.pricePerUnit)) + ' / L</span>' +
      '</div>'
    );
  }

  function metricCell(value, unit) {
    if (value == null || value === '') return dashCell();
    return '<div class="fh-metric-cell"><span class="tabular-nums">' + esc(value) + '</span><span class="fh-metric-cell__unit">' + esc(unit) + '</span></div>';
  }

  function dashCell() {
    return '<span class="fh-cell-empty">—</span>';
  }

  function compactColClass(hasData) {
    return hasData ? '' : ' fh-col-compact';
  }

  function columnDataFlags(rows) {
    return {
      alerts: rows.some(function (r) { return r.alerts != null && r.alerts !== ''; }),
      capacity: rows.some(function (r) { return r.capacityException != null && r.capacityException !== ''; }),
      location: rows.some(function (r) { return r.location != null && r.location !== ''; })
    };
  }

  function renderStats(rows) {
    var root = document.getElementById('fh-stats');
    if (!root) return;
    var s = data.computeStats(rows);
    root.innerHTML =
      '<div class="fh-stat-card"><span class="fh-stat-card__label">Total Fuel Cost</span><span class="fh-stat-card__value tabular-nums">' + esc(data.formatMoney(s.totalCost)) + '</span></div>' +
      '<div class="fh-stat-card"><span class="fh-stat-card__label">Total Volume</span><span class="fh-stat-card__value tabular-nums">' + s.totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' L</span></div>' +
      '<div class="fh-stat-card"><span class="fh-stat-card__label">Avg. Fuel Economy (Distance)</span><span class="fh-stat-card__value tabular-nums">' + s.avgEconomy.toFixed(2) + ' km/L</span></div>' +
      '<div class="fh-stat-card"><span class="fh-stat-card__label">Avg. Fuel Economy (Hours)</span><span class="fh-stat-card__value tabular-nums">' + (s.avgEconomyHrs ? s.avgEconomyHrs.toFixed(2) + ' L/hr' : '—') + '</span></div>' +
      '<div class="fh-stat-card"><span class="fh-stat-card__label">Avg. Cost</span><span class="fh-stat-card__value tabular-nums">' + esc(data.formatMoney(s.avgCost)) + ' / L</span></div>';
  }

  function renderTable() {
    var root = document.getElementById('fuel-history-table');
    var countEl = document.getElementById('fh-count');
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

    var cols = columnDataFlags(all);

    var html = '<table class="data-table data-table--list data-table--fuel-history"><thead><tr>' +
      '<th class="data-table__check-col"><input type="checkbox" aria-label="Select all"></th>' +
      '<th class="fh-col-vehicle">Vehicle</th>' +
      '<th class="fh-col-date">Date</th>' +
      '<th class="fh-col-vendor">Vendor</th>' +
      '<th class="fh-col-num fh-col-meter">Meter Entry</th>' +
      '<th class="fh-col-num fh-col-usage">Usage</th>' +
      '<th class="fh-col-num fh-col-volume">Volume</th>' +
      '<th class="fh-col-num fh-col-total">Total</th>' +
      '<th class="fh-col-num fh-col-economy">Fuel Economy</th>' +
      '<th class="fh-col-num fh-col-cost-meter">Cost per Meter</th>' +
      '<th class="fh-col-alerts' + compactColClass(cols.alerts) + '">Alerts</th>' +
      '<th class="fh-col-num fh-col-capacity' + compactColClass(cols.capacity) + '"' +
        (cols.capacity ? '' : ' title="Capacity Exception Volume"') + '>' +
        (cols.capacity ? 'Capacity Exception Volume' : 'Cap. Excep.') + '</th>' +
      '<th class="fh-col-location' + compactColClass(cols.location) + '">Location</th>' +
      '<th class="data-table__actions-col" aria-label="Actions"></th>' +
      '</tr></thead><tbody>';

    if (!rows.length) {
      html += '<tr><td colspan="14" class="service-history-empty">No fuel entries found</td></tr>';
    } else {
      rows.forEach(function (row) {
        html += '<tr>' +
          '<td class="data-table__check-col"><input type="checkbox" aria-label="Select row"></td>' +
          '<td class="fh-col-vehicle">' + vehicleCell(row) + '</td>' +
          '<td class="fh-col-date">' + esc(data.formatDateTime(row.date)) + '</td>' +
          '<td class="fh-col-vendor">' + vendorCell(row.vendor) + '</td>' +
          '<td class="fh-col-num fh-col-meter tabular-nums">' + esc(row.meterEntry) + '</td>' +
          '<td class="fh-col-num fh-col-usage tabular-nums">' + esc(row.usage) + '</td>' +
          '<td class="fh-col-num fh-col-volume tabular-nums">' + row.volume.toFixed(2) + ' L</td>' +
          '<td class="fh-col-num fh-col-total">' + totalCell(row) + '</td>' +
          '<td class="fh-col-num fh-col-economy">' + metricCell(row.fuelEconomy, 'km/L') + '</td>' +
          '<td class="fh-col-num fh-col-cost-meter">' + metricCell(row.costPerMeter, '₹ / km') + '</td>' +
          '<td class="fh-col-alerts' + compactColClass(cols.alerts) + '">' + (row.alerts ? esc(row.alerts) : dashCell()) + '</td>' +
          '<td class="fh-col-num fh-col-capacity' + compactColClass(cols.capacity) + '">' +
            (row.capacityException != null ? esc(row.capacityException) : dashCell()) + '</td>' +
          '<td class="fh-col-location' + compactColClass(cols.location) + '">' +
            (row.location ? esc(row.location) : dashCell()) + '</td>' +
          '<td class="data-table__actions-col">' + rowActionsMenu(row) + '</td>' +
          '</tr>';
      });
    }
    html += '</tbody></table>';
    root.innerHTML = html;
    bindRowActions();
    updatePills();
  }

  function updatePills() {
    var f = state.filters;
    document.querySelectorAll('.fuel-history-panel .expense-filter-pill').forEach(function (btn) {
      var k = btn.getAttribute('data-filter');
      var on = (k === 'date' && f.date.active) ||
        (k === 'vehicle' && f.vehicles.length) ||
        (k === 'group' && f.groups.length) ||
        (k === 'vendor' && f.vendors.length);
      btn.classList.toggle('has-filter', !!on);
    });
    var btn = document.getElementById('fh-filters-btn');
    var lbl = document.getElementById('fh-filters-btn-label');
    if (btn) {
      var n = filterCount();
      var open = document.getElementById('fh-filters-drawer').classList.contains('is-open');
      btn.classList.toggle('is-active', n > 0 || open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (lbl) lbl.textContent = n > 0 ? n + ' Filter' + (n === 1 ? '' : 's') : 'Filters';
    }
  }

  function closePop() {
    var p = document.getElementById('fh-filter-popover');
    if (p) p.hidden = true;
    document.querySelectorAll('.fuel-history-panel .expense-filter-pill').forEach(function (b) {
      b.classList.remove('is-open');
      b.setAttribute('aria-expanded', 'false');
    });
    openFilter = null;
    draft = null;
  }

  function positionPop(anchor, pop) {
    var panel = document.querySelector('.fuel-history-panel');
    if (!panel) return;
    var pr = panel.getBoundingClientRect();
    var r = anchor.getBoundingClientRect();
    pop.style.top = (r.bottom - pr.top + 6) + 'px';
    var w = pop.offsetWidth || 360;
    pop.style.left = Math.max(8, Math.min(r.left - pr.left, pr.width - w - 8)) + 'px';
  }

  function selectPopover(kind, selected) {
    var list = '';
    if (kind === 'date') {
      return '<div class="meter-popover meter-popover--simple">' +
        '<div class="meter-popover__list st-reminder-filter">' +
        DATE_PRESETS.map(function (p) {
          return '<label class="meter-settings-option"><input type="radio" name="fh-date" value="' + escA(p.id) + '"' +
            (selected === p.id ? ' checked' : '') + '> ' + esc(p.label) + '</label>';
        }).join('') +
        '<label class="meter-settings-option"><input type="radio" name="fh-date" value="clear"' + (selected === 'clear' ? ' checked' : '') + '> All dates</label>' +
        '</div>' +
        '<div class="meter-popover__footer"><div class="meter-popover__footer-right">' +
        '<button type="button" class="btn btn-text btn-sm" data-popover-cancel>Cancel</button>' +
        '<button type="button" class="btn btn-primary btn-sm" data-popover-apply>Apply</button></div></div></div>';
    }
    if (kind === 'vehicle') {
      list = vehicles.list.filter(function (v) { return v.assignment !== 'archived'; }).map(function (v) {
        var checked = selected.indexOf(v.id) !== -1;
        return '<label class="meter-select-item"><input type="checkbox" value="' + escA(v.id) + '"' + (checked ? ' checked' : '') + '><span>' + esc(v.name) + '</span></label>';
      }).join('');
    } else if (kind === 'group') {
      list = data.groups().map(function (g) {
        var checked = selected.indexOf(g) !== -1;
        return '<label class="meter-select-item"><input type="checkbox" value="' + escA(g) + '"' + (checked ? ' checked' : '') + '><span>' + esc(g) + '</span></label>';
      }).join('');
    } else if (kind === 'vendor') {
      list = data.vendors.map(function (v) {
        var checked = selected.indexOf(v.id) !== -1;
        return '<label class="meter-select-item"><input type="checkbox" value="' + escA(v.id) + '"' + (checked ? ' checked' : '') + '><span>' + esc(v.name) + '</span></label>';
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
    var pop = document.getElementById('fh-filter-popover');
    pop.querySelector('[data-popover-cancel]').onclick = closePop;
    pop.querySelector('[data-popover-apply]').onclick = function () {
      if (kind === 'date') {
        var picked = pop.querySelector('input[name="fh-date"]:checked');
        if (!picked || picked.value === 'clear') {
          state.filters.date.active = false;
          state.filters.date.preset = null;
        } else {
          var range = presetRange(picked.value);
          state.filters.date = { active: true, start: range.start, end: range.end, preset: picked.value };
        }
      } else {
        var vals = Array.prototype.map.call(pop.querySelectorAll('[data-select-list] input:checked'), function (el) { return el.value; });
        if (kind === 'vehicle') state.filters.vehicles = vals;
        else if (kind === 'group') state.filters.groups = vals;
        else if (kind === 'vendor') state.filters.vendors = vals;
      }
      closePop();
      state.page = 1;
      renderTable();
      if (document.getElementById('fh-filters-drawer').classList.contains('is-open')) renderDrawer();
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
    var pop = document.getElementById('fh-filter-popover');
    openFilter = kind;
    if (kind === 'date') draft = state.filters.date.preset || (state.filters.date.active ? 'last30' : 'clear');
    else if (kind === 'vehicle') draft = state.filters.vehicles.slice();
    else if (kind === 'group') draft = state.filters.groups.slice();
    else if (kind === 'vendor') draft = state.filters.vendors.slice();
    pop.innerHTML = selectPopover(kind, draft);
    pop.hidden = false;
    anchor.classList.add('is-open');
    anchor.setAttribute('aria-expanded', 'true');
    positionPop(anchor, pop);
    bindPop(kind);
    initLucide(pop);
  }

  function closeDrawer() {
    document.getElementById('fh-filters-drawer').classList.remove('is-open');
    updatePills();
  }

  function openDrawer() {
    closePop();
    document.getElementById('fh-filters-drawer').classList.add('is-open');
    renderDrawer();
    updatePills();
  }

  function renderDrawer() {
    var body = document.getElementById('fh-filters-drawer-body');
    var f = state.filters;
    var applied = '';
    if (f.date.active) {
      var preset = DATE_PRESETS.find(function (p) { return p.id === f.date.preset; });
      applied += '<div class="expense-drawer-applied"><span>Date</span><span>' + esc(preset ? preset.label : 'Custom') + '</span><button type="button" data-clear="date" aria-label="Remove"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    }
    if (f.vehicles.length) applied += '<div class="expense-drawer-applied"><span>Vehicle</span><span>' + f.vehicles.length + ' selected</span><button type="button" data-clear="vehicle"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    if (f.groups.length) applied += '<div class="expense-drawer-applied"><span>Vehicle Group</span><span>' + f.groups.length + ' selected</span><button type="button" data-clear="group"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    if (f.vendors.length) applied += '<div class="expense-drawer-applied"><span>Vendor</span><span>' + f.vendors.length + ' selected</span><button type="button" data-clear="vendor"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';

    body.innerHTML = (filterCount() ? applied : '<p class="expense-drawer-empty">No filters applied.</p>') +
      '<button type="button" class="btn btn-primary btn-sm expense-drawer-add" id="fh-drawer-add">Add Filter <span data-lucide-icon="chevronDown" data-lucide-icon-size="14" aria-hidden="true"></span></button>' +
      '<div class="expense-drawer-popular"><h3>Popular Filters</h3><ul class="expense-drawer-popular__list">' +
      POPULAR.map(function (p) { return '<li><button type="button" class="expense-drawer-popular__link" data-open="' + p.id + '">' + esc(p.label) + '</button></li>'; }).join('') +
      '</ul></div>';

    body.querySelectorAll('[data-clear]').forEach(function (b) {
      b.onclick = function () {
        var k = b.getAttribute('data-clear');
        if (k === 'date') state.filters.date.active = false;
        else if (k === 'vehicle') state.filters.vehicles = [];
        else if (k === 'group') state.filters.groups = [];
        else if (k === 'vendor') state.filters.vendors = [];
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
    document.getElementById('fh-drawer-add').onclick = function () {
      var pill = document.querySelector('.fuel-history-panel .expense-filter-pill[data-filter="vehicle"]');
      if (pill) openPop('vehicle', pill);
    };
    initLucide(body);
  }

  function closeTableSettings() {
    var el = document.getElementById('fh-table-settings');
    if (el) el.hidden = true;
  }

  function openTableSettings(anchor) {
    closePop();
    var el = document.getElementById('fh-table-settings');
    el.innerHTML = '<div class="meter-table-settings__section"><a href="#" class="meter-table-settings__manage">Manage Columns</a></div>' +
      '<div class="meter-table-settings__section"><div class="meter-table-settings__title">Items Per Page</div>' +
      [50, 100, 200].map(function (n) {
        return '<label class="meter-settings-option"><input type="radio" name="fh-page-size" value="' + n + '"' + (state.pageSize === n ? ' checked' : '') + '> ' + n + '</label>';
      }).join('') + '</div>';
    el.hidden = false;
    positionPop(anchor, el);
    el.querySelectorAll('input[name="fh-page-size"]').forEach(function (r) {
      r.onchange = function () { state.pageSize = parseInt(r.value, 10); state.page = 1; renderTable(); };
    });
  }

  function init() {
    if (document.body.getAttribute('data-subpage') !== 'fuel-history') return;
    initLucide();

    document.getElementById('fh-search').oninput = function (e) {
      state.search = e.target.value;
      state.page = 1;
      renderTable();
    };

    document.querySelectorAll('.fuel-history-panel .expense-filter-pill').forEach(function (btn) {
      btn.onclick = function () {
        var k = btn.getAttribute('data-filter');
        if (openFilter === k && !document.getElementById('fh-filter-popover').hidden) closePop();
        else openPop(k, btn);
      };
    });

    document.getElementById('fh-filters-btn').onclick = function () {
      if (document.getElementById('fh-filters-drawer').classList.contains('is-open')) closeDrawer();
      else openDrawer();
    };
    document.getElementById('fh-filters-drawer-close').onclick = closeDrawer;

    document.getElementById('fh-pagination').querySelector('[data-page-prev]').onclick = function () {
      if (state.page > 1) { state.page--; renderTable(); }
    };
    document.getElementById('fh-pagination').querySelector('[data-page-next]').onclick = function () {
      var tp = Math.max(1, Math.ceil(filteredList().length / state.pageSize));
      if (state.page < tp) { state.page++; renderTable(); }
    };

    document.getElementById('fh-table-settings-btn').onclick = function (e) {
      var el = document.getElementById('fh-table-settings');
      if (!el.hidden) closeTableSettings();
      else openTableSettings(e.currentTarget);
    };

    document.getElementById('fh-add-btn').onclick = function () {
      window.alert('Add fuel entry form (prototype demo).');
    };

    document.getElementById('fh-group-btn').onclick = function () {
      window.alert('Group by options (prototype demo).');
    };

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#fh-filter-popover') && !e.target.closest('.fuel-history-panel .expense-filter-pill')) closePop();
      if (!e.target.closest('#fh-table-settings') && !e.target.closest('#fh-table-settings-btn')) closeTableSettings();
      if (!e.target.closest('.fuel-history-panel [data-row-actions]')) closeAllRowMenus();
    });

    renderTable();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
