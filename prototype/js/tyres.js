(function () {
  'use strict';

  if (document.body.getAttribute('data-subpage') !== 'tyres') return;

  var data = window.YSOAM_TYRES;
  var vehicles = window.YSOAM_VEHICLES;

  var POPULAR = [
    { id: 'vehicle', label: 'Vehicle' },
    { id: 'brand', label: 'Brand' }
  ];

  var state = {
    tab: 'all',
    search: '',
    page: 1,
    pageSize: 50,
    filters: { vehicles: [], brands: [] }
  };

  var openFilter = null;

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function lucide(name, size) { return window.YSOAM_LUCIDE ? window.YSOAM_LUCIDE.icon(name, size || 16) : ''; }
  function rowIcon(key) { return window.YSOAM_ICONS && window.YSOAM_ICONS[key] ? window.YSOAM_ICONS[key] : ''; }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }
  function dash() { return '<span class="fh-cell-empty">—</span>'; }

  function filterCount() {
    var n = 0;
    if (state.filters.vehicles.length) n++;
    if (state.filters.brands.length) n++;
    return n;
  }

  function filteredList() {
    return data.list.filter(function (row) {
      if (state.tab !== 'all' && row.status !== state.tab) return false;
      if (state.filters.vehicles.length && state.filters.vehicles.indexOf(row.vehicleId) === -1) return false;
      if (state.filters.brands.length && state.filters.brands.indexOf(row.brand) === -1) return false;
      if (state.search) {
        var q = state.search.toLowerCase();
        var hay = [row.id, row.serialNumber, row.position, row.vehicleId, row.vehicleName, row.brand, row.size, row.statusLabel].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function statusBadge(row) {
    var mod = row.status === 'replace_soon' ? 'warning' : row.status === 'retired' ? 'muted' : row.status === 'in_stock' ? 'info' : 'ok';
    return '<span class="tyre-status tyre-status--' + mod + '">' + esc(row.statusLabel) + '</span>';
  }

  function treadCell(mm) {
    var cls = mm <= 3 ? 'tyre-tread tyre-tread--low' : mm <= 5 ? 'tyre-tread tyre-tread--mid' : 'tyre-tread';
    return '<span class="' + cls + ' tabular-nums">' + esc(mm) + ' mm</span>';
  }

  function vehicleCell(row) {
    if (!row.vehicleId) return dash();
    var v = vehicles.getById(row.vehicleId);
    var thumb = v ? v.image : vehicles.thumbForIndex(0);
    return (
      '<div class="fh-vehicle-cell">' +
        '<img src="' + escA(thumb) + '" alt="" class="fh-vehicle-thumb" width="40" height="40">' +
        '<div class="fh-vehicle-cell__text">' +
          '<a href="vehicle-detail.html?id=' + escA(row.vehicleId) + '" class="table-cell-link">' + esc(row.vehicleName) + '</a>' +
        '</div></div>'
    );
  }

  function rowActionsMenu(row) {
    return (
      '<div class="row-actions" data-row-actions="' + escA(row.id) + '">' +
        '<button type="button" class="row-actions__trigger" aria-label="More actions" aria-haspopup="menu" aria-expanded="false">' +
          '<span class="row-actions__dots" aria-hidden="true"></span></button>' +
        '<div class="row-actions__menu" role="menu" hidden>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="view" role="menuitem">View</button>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="edit" role="menuitem">Edit</button>' +
        '</div></div>'
    );
  }

  function closeAllRowMenus() {
    document.querySelectorAll('.tyres-panel .row-actions__menu').forEach(function (m) { m.hidden = true; });
  }

  function bindRowActions() {
    document.querySelectorAll('.tyres-panel .row-actions__trigger').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var menu = btn.closest('.row-actions').querySelector('.row-actions__menu');
        var open = menu.hidden;
        closeAllRowMenus();
        if (open) { menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); }
      });
    });
    document.querySelectorAll('.tyres-panel [data-action]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        closeAllRowMenus();
        var id = btn.closest('.row-actions').getAttribute('data-row-actions');
        if (btn.getAttribute('data-action') === 'view') {
          window.location.href = 'tyre-view?id=' + encodeURIComponent(id);
        } else if (btn.getAttribute('data-action') === 'edit') {
          window.location.href = 'tyre-reading-form?id=' + encodeURIComponent(id);
        }
      });
    });
  }

  function renderStats() {
    var s = data.stats();
    document.getElementById('tyres-stats').innerHTML =
      '<div class="fh-stat-card"><span class="fh-stat-card__label">Total Tyres</span><span class="fh-stat-card__value tabular-nums">' + s.total + '</span></div>' +
      '<div class="fh-stat-card"><span class="fh-stat-card__label">On Vehicle</span><span class="fh-stat-card__value tabular-nums">' + s.onVehicle + '</span></div>' +
      '<div class="fh-stat-card"><span class="fh-stat-card__label">In Stock</span><span class="fh-stat-card__value tabular-nums">' + s.inStock + '</span></div>' +
      '<div class="fh-stat-card"><span class="fh-stat-card__label">Replace Soon</span><span class="fh-stat-card__value tabular-nums" style="color:var(--color-warning)">' + s.replaceSoon + '</span></div>';
  }

  function renderTable() {
    var root = document.getElementById('tyres-table');
    var all = filteredList();
    var total = all.length;
    var start = (state.page - 1) * state.pageSize;
    var rows = all.slice(start, start + state.pageSize);
    document.getElementById('tyres-count').textContent = (total ? start + 1 : 0) + ' – ' + Math.min(start + state.pageSize, total) + ' of ' + total;

    var html = '<table class="data-table data-table--list data-table--tyres"><thead><tr>' +
      '<th class="data-table__check-col"><input type="checkbox" aria-label="Select all"></th>' +
      '<th class="tyre-col-id">Tyre ID</th><th class="tyre-col-serial">Serial #</th><th class="tyre-col-position">Position</th>' +
      '<th class="tyre-col-vehicle">Vehicle</th><th class="tyre-col-brand">Brand</th><th class="tyre-col-size">Size</th>' +
      '<th class="tabular-nums tyre-col-tread">Tread</th><th class="tabular-nums tyre-col-pressure">Pressure</th>' +
      '<th class="tyre-col-status">Status</th><th class="tyre-col-installed">Installed</th><th class="tabular-nums tyre-col-cost">Cost</th>' +
      '<th class="data-table__actions-col"></th></tr></thead><tbody>';

    if (!rows.length) {
      html += '<tr><td colspan="13" class="service-history-empty">No tyres found</td></tr>';
    } else {
      rows.forEach(function (row) {
        html += '<tr>' +
          '<td class="data-table__check-col"><input type="checkbox" aria-label="Select row"></td>' +
          '<td><a href="tyre-view?id=' + escA(row.id) + '" class="table-cell-link">' + esc(row.id) + '</a></td>' +
          '<td>' + esc(row.serialNumber) + '</td>' +
          '<td>' + (row.position === '—' ? dash() : esc(row.position)) + '</td>' +
          '<td>' + vehicleCell(row) + '</td>' +
          '<td>' + esc(row.brand) + '</td>' +
          '<td>' + esc(row.size) + '</td>' +
          '<td>' + treadCell(row.treadDepthMm) + '</td>' +
          '<td class="tabular-nums">' + esc(row.pressurePsi) + ' PSI</td>' +
          '<td>' + statusBadge(row) + '</td>' +
          '<td>' + (row.installedOn === '—' ? dash() : esc(row.installedOn)) + '</td>' +
          '<td class="tabular-nums">' + esc(row.costLabel) + '</td>' +
          '<td class="data-table__actions-col">' + rowActionsMenu(row) + '</td></tr>';
      });
    }
    html += '</tbody></table>';
    root.innerHTML = html;
    bindRowActions();
    initLucide(root);
    updatePills();
  }

  function updatePills() {
    var f = state.filters;
    document.querySelectorAll('.tyres-panel .expense-filter-pill').forEach(function (btn) {
      var k = btn.getAttribute('data-filter');
      btn.classList.toggle('has-filter', (k === 'vehicle' && f.vehicles.length) || (k === 'brand' && f.brands.length));
    });
    var lbl = document.getElementById('tyres-filters-btn-label');
    var n = filterCount();
    if (lbl) lbl.textContent = n ? n + ' Filter' + (n === 1 ? '' : 's') : 'Filters';
  }

  function closePop() {
    document.getElementById('tyres-filter-popover').hidden = true;
    openFilter = null;
  }

  function positionPop(anchor, pop) {
    var panel = document.querySelector('.tyres-panel');
    var pr = panel.getBoundingClientRect();
    var r = anchor.getBoundingClientRect();
    pop.style.top = (r.bottom - pr.top + 6) + 'px';
    pop.style.left = Math.max(8, r.left - pr.left) + 'px';
  }

  function openPop(kind, anchor) {
    var items = kind === 'vehicle' ? data.vehicleOptions() : data.BRANDS.map(function (b) { return { id: b, label: b }; });
    var selected = kind === 'vehicle' ? state.filters.vehicles : state.filters.brands;
    var pop = document.getElementById('tyres-filter-popover');
    pop.innerHTML = '<div class="meter-popover meter-popover--select"><div class="meter-popover__search"><input type="search" class="meter-popover__search-input" placeholder="Select item(s)" data-select-search></div>' +
      '<div class="meter-popover__list" data-select-list>' +
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
      else state.filters.brands = vals;
      closePop();
      state.page = 1;
      renderTable();
    };
    initLucide(pop);
  }

  function setTab(tab) {
    state.tab = tab;
    state.page = 1;
    document.querySelectorAll('.tyres-view-tabs [data-tab]').forEach(function (btn) {
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

    document.getElementById('tyres-search').oninput = function (e) { state.search = e.target.value; state.page = 1; renderTable(); };
    document.querySelectorAll('.tyres-view-tabs [data-tab]').forEach(function (btn) {
      btn.onclick = function () { setTab(btn.getAttribute('data-tab')); };
    });
    document.querySelectorAll('.tyres-panel .expense-filter-pill').forEach(function (btn) {
      btn.onclick = function () { openPop(btn.getAttribute('data-filter'), btn); };
    });
    document.getElementById('tyres-filters-drawer-close').onclick = function () {
      document.getElementById('tyres-filters-drawer').classList.remove('is-open');
    };
    document.getElementById('tyres-add-btn').onclick = function () {
      window.location.href = 'tyre-reading-form';
    };
    document.getElementById('tyres-pagination').querySelector('[data-page-prev]').onclick = function () {
      if (state.page > 1) { state.page--; renderTable(); }
    };
    document.getElementById('tyres-pagination').querySelector('[data-page-next]').onclick = function () {
      var tp = Math.ceil(filteredList().length / state.pageSize);
      if (state.page < tp) { state.page++; renderTable(); }
    };
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#tyres-filter-popover') && !e.target.closest('.expense-filter-pill')) closePop();
      if (!e.target.closest('.row-actions')) closeAllRowMenus();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
