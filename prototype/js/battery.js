(function () {
  'use strict';

  if (document.body.getAttribute('data-subpage') !== 'battery') return;

  var data = window.YSOAM_BATTERY;
  var vehicles = window.YSOAM_VEHICLES;

  var state = {
    tab: 'all',
    search: '',
    page: 1,
    pageSize: 50,
    filters: { vehicles: [], statuses: [] }
  };

  var openFilter = null;

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }

  function filterCount() {
    var n = 0;
    if (state.filters.vehicles.length) n++;
    if (state.filters.statuses.length) n++;
    return n;
  }

  function filteredList() {
    return data.list.filter(function (row) {
      if (state.tab !== 'all' && row.status !== state.tab) return false;
      if (state.filters.vehicles.length && state.filters.vehicles.indexOf(row.vehicleId) === -1) return false;
      if (state.filters.statuses.length && state.filters.statuses.indexOf(row.status) === -1) return false;
      if (state.search) {
        var q = state.search.toLowerCase();
        var hay = [row.id, row.vehicleId, row.vehicleName, row.statusLabel, row.vehicleGroup].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function statusBadge(row) {
    return '<span class="battery-status battery-status--' + esc(row.status) + '">' + esc(row.statusLabel) + '</span>';
  }

  function socBar(pct) {
    var cls = pct < 25 ? 'battery-soc--low' : pct < 50 ? 'battery-soc--mid' : '';
    return '<div class="battery-soc ' + cls + '"><div class="battery-soc__fill" style="width:' + pct + '%"></div></div>' +
      '<span class="battery-soc__label tabular-nums">' + pct + '%</span>';
  }

  function vehicleCell(row) {
    var v = vehicles.getById(row.vehicleId);
    var thumb = v ? v.image : vehicles.thumbForIndex(0);
    return (
      '<div class="fh-vehicle-cell">' +
        '<img src="' + escA(thumb) + '" alt="" class="fh-vehicle-thumb" width="40" height="40">' +
        '<div class="fh-vehicle-cell__text">' +
          '<a href="vehicle-detail.html?id=' + escA(row.vehicleId) + '" class="table-cell-link">' + esc(row.vehicleName) + '</a>' +
          '<span class="battery-pack-meta">' + esc(row.packKwh) + ' kWh pack</span>' +
        '</div></div>'
    );
  }

  function renderStats() {
    var s = data.stats();
    document.getElementById('battery-stats').innerHTML =
      '<div class="fh-stat-card"><span class="fh-stat-card__label">EV Fleet</span><span class="fh-stat-card__value tabular-nums">' + s.total + '</span></div>' +
      '<div class="fh-stat-card"><span class="fh-stat-card__label">Avg SOC</span><span class="fh-stat-card__value tabular-nums">' + s.avgSoc + '%</span></div>' +
      '<div class="fh-stat-card"><span class="fh-stat-card__label">Healthy</span><span class="fh-stat-card__value tabular-nums" style="color:var(--color-profit-positive)">' + s.healthy + '</span></div>' +
      '<div class="fh-stat-card"><span class="fh-stat-card__label">Attention</span><span class="fh-stat-card__value tabular-nums" style="color:var(--color-warning)">' + s.attention + '</span></div>' +
      '<div class="fh-stat-card"><span class="fh-stat-card__label">Critical</span><span class="fh-stat-card__value tabular-nums" style="color:#DC2626">' + s.critical + '</span></div>';
  }

  function renderTable() {
    var root = document.getElementById('battery-table');
    var all = filteredList();
    var total = all.length;
    var start = (state.page - 1) * state.pageSize;
    var rows = all.slice(start, start + state.pageSize);
    document.getElementById('battery-count').textContent = (total ? start + 1 : 0) + ' – ' + Math.min(start + state.pageSize, total) + ' of ' + total;

    var html = '<table class="data-table data-table--list data-table--battery"><thead><tr>' +
      '<th class="data-table__check-col"><input type="checkbox" aria-label="Select all"></th>' +
      '<th class="battery-col-vehicle">Vehicle</th><th class="battery-col-soc">SOC</th>' +
      '<th class="tabular-nums battery-col-soh">SOH</th><th class="tabular-nums battery-col-voltage">Voltage</th>' +
      '<th class="tabular-nums battery-col-temp">Temp</th><th class="tabular-nums battery-col-range">Range</th>' +
      '<th class="tabular-nums battery-col-cycles">Cycles</th><th class="battery-col-charge">Last Charge</th>' +
      '<th class="battery-col-status">Status</th></tr></thead><tbody>';

    if (!rows.length) {
      html += '<tr><td colspan="10" class="service-history-empty">No battery records found</td></tr>';
    } else {
      rows.forEach(function (row) {
        html += '<tr data-battery-row="' + escA(row.id) + '" style="cursor:pointer">' +
          '<td class="data-table__check-col"><input type="checkbox" aria-label="Select row" onclick="event.stopPropagation()"></td>' +
          '<td>' + vehicleCell(row) + '</td>' +
          '<td><div class="battery-soc-cell">' + socBar(row.soc) + '</div></td>' +
          '<td class="tabular-nums">' + esc(row.soh) + '%</td>' +
          '<td class="tabular-nums">' + esc(row.voltage.toFixed(1)) + ' V</td>' +
          '<td class="tabular-nums">' + esc(row.tempC) + '°C</td>' +
          '<td class="tabular-nums">' + esc(row.rangeKm) + ' km</td>' +
          '<td class="tabular-nums">' + esc(row.cycles) + '</td>' +
          '<td>' + esc(row.lastChargeLabel) + '</td>' +
          '<td>' + statusBadge(row) + '</td></tr>';
      });
    }
    html += '</tbody></table>';
    root.innerHTML = html;
    root.querySelectorAll('[data-battery-row]').forEach(function (tr) {
      tr.addEventListener('click', function (e) {
        if (e.target.closest('a, input')) return;
        window.location.href = 'battery-view?id=' + encodeURIComponent(tr.getAttribute('data-battery-row'));
      });
    });
    updatePills();
    initLucide(root);
  }

  function updatePills() {
    var f = state.filters;
    document.querySelectorAll('.battery-panel .expense-filter-pill').forEach(function (btn) {
      var k = btn.getAttribute('data-filter');
      btn.classList.toggle('has-filter', (k === 'vehicle' && f.vehicles.length) || (k === 'status' && f.statuses.length));
    });
    var lbl = document.getElementById('battery-filters-btn-label');
    var n = filterCount();
    if (lbl) lbl.textContent = n ? n + ' Filter' + (n === 1 ? '' : 's') : 'Filters';
  }

  function closePop() {
    document.getElementById('battery-filter-popover').hidden = true;
    openFilter = null;
  }

  function positionPop(anchor, pop) {
    var panel = document.querySelector('.battery-panel');
    var pr = panel.getBoundingClientRect();
    var r = anchor.getBoundingClientRect();
    pop.style.top = (r.bottom - pr.top + 6) + 'px';
    pop.style.left = Math.max(8, r.left - pr.left) + 'px';
  }

  function openPop(kind, anchor) {
    var items = kind === 'vehicle' ? data.vehicleOptions() : data.STATUSES;
    var selected = kind === 'vehicle' ? state.filters.vehicles : state.filters.statuses;
    var pop = document.getElementById('battery-filter-popover');
    pop.innerHTML = '<div class="meter-popover meter-popover--select"><div class="meter-popover__list" data-select-list>' +
      items.map(function (item) {
        return '<label class="meter-select-item"><input type="checkbox" value="' + escA(item.id) + '"' +
          (selected.indexOf(item.id) !== -1 ? ' checked' : '') + '><span>' + esc(item.label) + '</span></label>';
      }).join('') +
      '</div><div class="meter-popover__footer"><div class="meter-popover__footer-right">' +
      '<button type="button" class="btn btn-text btn-sm" data-popover-cancel>Cancel</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-popover-apply>Apply</button></div></div></div>';
    pop.hidden = false;
    positionPop(anchor, pop);
    pop.querySelector('[data-popover-cancel]').onclick = closePop;
    pop.querySelector('[data-popover-apply]').onclick = function () {
      var vals = Array.prototype.map.call(pop.querySelectorAll('[data-select-list] input:checked'), function (el) { return el.value; });
      if (kind === 'vehicle') state.filters.vehicles = vals;
      else state.filters.statuses = vals;
      closePop();
      state.page = 1;
      renderTable();
    };
  }

  function setTab(tab) {
    state.tab = tab;
    state.page = 1;
    document.querySelectorAll('.battery-view-tabs [data-tab]').forEach(function (btn) {
      var on = btn.getAttribute('data-tab') === tab;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    renderTable();
  }

  function init() {
    initLucide();
    renderStats();
    renderTable();

    document.getElementById('battery-search').oninput = function (e) { state.search = e.target.value; state.page = 1; renderTable(); };
    document.querySelectorAll('.battery-view-tabs [data-tab]').forEach(function (btn) {
      btn.onclick = function () { setTab(btn.getAttribute('data-tab')); };
    });
    document.querySelectorAll('.battery-panel .expense-filter-pill').forEach(function (btn) {
      btn.onclick = function () { openPop(btn.getAttribute('data-filter'), btn); };
    });
    document.getElementById('battery-filters-drawer-close').onclick = function () {
      document.getElementById('battery-filters-drawer').classList.remove('is-open');
    };
    document.getElementById('battery-pagination').querySelector('[data-page-prev]').onclick = function () {
      if (state.page > 1) { state.page--; renderTable(); }
    };
    document.getElementById('battery-pagination').querySelector('[data-page-next]').onclick = function () {
      var tp = Math.ceil(filteredList().length / state.pageSize);
      if (state.page < tp) { state.page++; renderTable(); }
    };
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#battery-filter-popover') && !e.target.closest('.expense-filter-pill')) closePop();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
