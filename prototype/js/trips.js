(function () {
  'use strict';

  var data = window.YSOAM_TRIPS;

  var POPULAR = [
    { id: 'status', label: 'Status' },
    { id: 'route', label: 'Route' }
  ];

  var state = {
    tab: 'all',
    search: '',
    page: 1,
    pageSize: 50,
    filters: {
      statuses: [],
      routes: []
    }
  };

  var draft = null;
  var openFilter = null;

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function lucide(name, size) { return window.YSOAM_LUCIDE ? window.YSOAM_LUCIDE.icon(name, size || 16) : ''; }
  function rowIcon(key) { return window.YSOAM_ICONS && window.YSOAM_ICONS[key] ? window.YSOAM_ICONS[key] : ''; }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }

  function dashCell() { return '<span class="trip-ops-cell-empty">—</span>'; }

  function statusBadge(trip) {
    var badge = data.statusBadge[trip.status] || 'badge-idle';
    var label = data.statusLabels[trip.status] || trip.status;
    return '<span class="badge ' + badge + '">' + esc(label) + '</span>';
  }

  function tabMatch(trip) {
    if (state.tab === 'all') return true;
    if (state.tab === 'active') return trip.status === 'transit' || trip.status === 'dispatched';
    if (state.tab === 'complete') return trip.status === 'complete';
    if (state.tab === 'created') return trip.status === 'created';
    if (state.tab === 'cancelled') return trip.status === 'cancelled';
    return true;
  }

  function filterCount() {
    var f = state.filters;
    var n = 0;
    if (f.statuses.length) n++;
    if (f.routes.length) n++;
    return n;
  }

  function filteredList() {
    var q = state.search.trim().toLowerCase();
    var f = state.filters;
    return data.trips.filter(function (trip) {
      if (!tabMatch(trip)) return false;
      if (f.statuses.length && f.statuses.indexOf(trip.status) === -1) return false;
      if (f.routes.length && f.routes.indexOf(trip.route) === -1) return false;
      if (q) {
        var hay = [
          trip.id, trip.route, trip.origin, trip.destination, trip.vehicleId,
          trip.driver, trip.customer, trip.loadType, trip.invoiceId
        ].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function renderSummary() {
    var root = document.getElementById('trip-ops-summary');
    if (!root) return;

    var all = data.trips;
    var active = all.filter(function (t) { return t.status === 'transit' || t.status === 'dispatched'; }).length;
    var complete = all.filter(function (t) { return t.status === 'complete'; }).length;
    var totalKm = all.reduce(function (sum, t) { return sum + (t.distance || 0); }, 0);
    var margins = all.filter(function (t) { return t.margin !== null && t.margin !== undefined; });
    var avgMargin = margins.length
      ? Math.round(margins.reduce(function (s, t) { return s + t.margin; }, 0) / margins.length)
      : 0;

    root.innerHTML =
      '<div class="trip-ops-stat"><span class="trip-ops-stat__label">Active trips</span><strong class="trip-ops-stat__value tabular-nums">' + active + '</strong></div>' +
      '<div class="trip-ops-stat"><span class="trip-ops-stat__label">Completed</span><strong class="trip-ops-stat__value tabular-nums">' + complete + '</strong></div>' +
      '<div class="trip-ops-stat"><span class="trip-ops-stat__label">Total distance</span><strong class="trip-ops-stat__value tabular-nums">' + totalKm.toLocaleString('en-IN') + ' km</strong></div>' +
      '<div class="trip-ops-stat"><span class="trip-ops-stat__label">Avg margin</span><strong class="trip-ops-stat__value tabular-nums">' + (margins.length ? avgMargin + '%' : '—') + '</strong></div>';
  }

  function rowActionsMenu(trip) {
    var playback = data.canPlayback(trip)
      ? '<button type="button" class="row-actions__item row-actions__item--btn" data-action="playback" role="menuitem">Route Playback <span class="row-actions__item-icon">' + lucide('play', 16) + '</span></button>'
      : '<button type="button" class="row-actions__item row-actions__item--btn" data-action="playback" role="menuitem" disabled>Route Playback <span class="row-actions__item-icon">' + lucide('play', 16) + '</span></button>';

    return (
      '<div class="row-actions" data-row-actions="' + escA(trip.id) + '">' +
        '<button type="button" class="row-actions__trigger" aria-label="More actions for ' + escA(trip.id) + '" aria-haspopup="menu" aria-expanded="false">' +
          '<span class="row-actions__dots" aria-hidden="true"></span>' +
        '</button>' +
        '<div class="row-actions__menu" role="menu" hidden>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="view" role="menuitem">View Trip <span class="row-actions__item-icon">' + rowIcon('actionView') + '</span></button>' +
          playback +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="map" role="menuitem">View on Map <span class="row-actions__item-icon">' + lucide('mapPin', 16) + '</span></button>' +
          '<div class="row-actions__divider" role="separator"></div>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="dispatch" role="menuitem"' + (trip.status === 'created' ? '' : ' disabled') + '>Dispatch <span class="row-actions__item-icon">' + lucide('send', 16) + '</span></button>' +
          '<button type="button" class="row-actions__item row-actions__item--btn row-actions__item--danger" data-action="cancel" role="menuitem"' + (trip.status === 'cancelled' || trip.status === 'complete' ? ' disabled' : '') + '>Cancel Trip <span class="row-actions__item-icon">' + rowIcon('actionDelete') + '</span></button>' +
        '</div>' +
      '</div>'
    );
  }

  function closeAllRowMenus() {
    document.querySelectorAll('.trip-ops-panel .row-actions__menu').forEach(function (m) {
      m.hidden = true;
      m.style.position = '';
      m.style.top = '';
      m.style.left = '';
    });
    document.querySelectorAll('.trip-ops-panel .row-actions__trigger').forEach(function (b) {
      b.setAttribute('aria-expanded', 'false');
    });
  }

  function positionRowMenu(trigger, menu) {
    var rect = trigger.getBoundingClientRect();
    menu.hidden = false;
    menu.style.position = 'fixed';
    menu.style.top = (rect.bottom + 4) + 'px';
    menu.style.left = Math.max(8, rect.right - 200) + 'px';
    menu.style.zIndex = '120';
  }

  function bindRowActions() {
    document.querySelectorAll('.trip-ops-panel .row-actions').forEach(function (wrap) {
      if (wrap.getAttribute('data-bound')) return;
      wrap.setAttribute('data-bound', '1');
      wrap.addEventListener('click', function (e) { e.stopPropagation(); });
    });

    document.querySelectorAll('.trip-ops-panel .row-actions__trigger').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var menu = btn.closest('.row-actions').querySelector('.row-actions__menu');
        var willOpen = menu.hidden;
        closeAllRowMenus();
        if (willOpen) { positionRowMenu(btn, menu); btn.setAttribute('aria-expanded', 'true'); }
      });
    });

    document.querySelectorAll('.trip-ops-panel [data-action="view"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        var id = btn.closest('[data-row-actions]').getAttribute('data-row-actions');
        closeAllRowMenus();
        window.location.href = 'trip-detail?id=' + encodeURIComponent(id);
      });
    });

    document.querySelectorAll('.trip-ops-panel [data-action="playback"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound') || btn.disabled) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        var id = btn.closest('[data-row-actions]').getAttribute('data-row-actions');
        closeAllRowMenus();
        window.location.href = 'trip-playback?id=' + encodeURIComponent(id);
      });
    });

    document.querySelectorAll('.trip-ops-panel [data-action="map"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        var id = btn.closest('[data-row-actions]').getAttribute('data-row-actions');
        closeAllRowMenus();
        window.location.href = 'gps?trip=' + encodeURIComponent(id);
      });
    });

    ['dispatch', 'cancel'].forEach(function (action) {
      document.querySelectorAll('.trip-ops-panel [data-action="' + action + '"]').forEach(function (btn) {
        if (btn.getAttribute('data-bound') || btn.disabled) return;
        btn.setAttribute('data-bound', '1');
        btn.addEventListener('click', function () {
          closeAllRowMenus();
          window.alert(action.charAt(0).toUpperCase() + action.slice(1) + ' trip (prototype demo).');
        });
      });
    });
  }

  function renderTable() {
    var root = document.getElementById('trip-ops-table');
    var countEl = document.getElementById('trip-ops-count');
    if (!root) return;

    var all = filteredList();
    var total = all.length;
    var totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    if (state.page > totalPages) state.page = totalPages;
    var start = (state.page - 1) * state.pageSize;
    var rows = all.slice(start, start + state.pageSize);
    var from = total ? start + 1 : 0;
    var to = Math.min(state.page * state.pageSize, total);
    if (countEl) countEl.textContent = from + ' – ' + to + ' of ' + total;

    var html = '<table class="data-table data-table--list data-table--trip-ops"><thead><tr>' +
      '<th class="data-table__check-col"><input type="checkbox" aria-label="Select all"></th>' +
      '<th class="trip-ops-col-id">Trip ID</th>' +
      '<th class="trip-ops-col-route">Route</th>' +
      '<th class="trip-ops-col-vehicle">Vehicle</th>' +
      '<th class="trip-ops-col-driver">Driver</th>' +
      '<th class="trip-ops-col-customer">Customer</th>' +
      '<th class="trip-ops-col-status">Status</th>' +
      '<th class="trip-ops-col-started">Started</th>' +
      '<th class="trip-ops-col-completed">Completed</th>' +
      '<th class="trip-ops-col-distance">Distance</th>' +
      '<th class="trip-ops-col-duration">Duration</th>' +
      '<th class="trip-ops-col-margin">Margin</th>' +
      '<th class="data-table__actions-col" aria-label="Actions"></th>' +
      '</tr></thead><tbody>';

    if (!rows.length) {
      html += '<tr><td colspan="13" class="service-history-empty">No trips found</td></tr>';
    } else {
      rows.forEach(function (trip) {
        var playbackLink = data.canPlayback(trip)
          ? ' <a href="trip-playback?id=' + escA(trip.id) + '" class="table-cell-link trip-ops-playback-link" title="Route playback">' + lucide('play', 14) + '</a>'
          : '';

        html += '<tr>' +
          '<td class="data-table__check-col"><input type="checkbox" aria-label="Select row"></td>' +
          '<td class="trip-ops-col-id tabular-nums">' +
            '<a href="trip-detail?id=' + escA(trip.id) + '" class="table-cell-link trip-ops-id-link">' + esc(trip.id) + '</a>' +
            playbackLink +
          '</td>' +
          '<td class="trip-ops-col-route">' + esc(trip.route) + '</td>' +
          '<td class="trip-ops-col-vehicle"><a href="gps" class="table-cell-link">' + esc(trip.vehicleId) + '</a></td>' +
          '<td class="trip-ops-col-driver">' + (trip.driver && trip.driver !== '—' ? esc(trip.driver) : dashCell()) + '</td>' +
          '<td class="trip-ops-col-customer">' + esc(trip.customer) + '</td>' +
          '<td class="trip-ops-col-status">' + statusBadge(trip) + '</td>' +
          '<td class="trip-ops-col-started tabular-nums">' + esc(trip.startAt) + '</td>' +
          '<td class="trip-ops-col-completed tabular-nums">' + (trip.endAt ? esc(trip.endAt) : dashCell()) + '</td>' +
          '<td class="trip-ops-col-distance tabular-nums">' + (trip.distance ? esc(trip.distance + ' km') : dashCell()) + '</td>' +
          '<td class="trip-ops-col-duration tabular-nums">' + (trip.duration && trip.duration !== '—' ? esc(trip.duration) : dashCell()) + '</td>' +
          '<td class="trip-ops-col-margin">' + data.formatMargin(trip) + '</td>' +
          '<td class="data-table__actions-col">' + rowActionsMenu(trip) + '</td>' +
          '</tr>';
      });
    }
    html += '</tbody></table>';
    root.innerHTML = html;
    bindRowActions();
    updatePills();
    initLucide(root);
  }

  function updatePills() {
    var f = state.filters;
    document.querySelectorAll('.trip-ops-panel .expense-filter-pill').forEach(function (btn) {
      var k = btn.getAttribute('data-filter');
      var on = (k === 'status' && f.statuses.length) || (k === 'route' && f.routes.length);
      btn.classList.toggle('has-filter', !!on);
    });
    var btn = document.getElementById('trip-ops-filters-btn');
    var lbl = document.getElementById('trip-ops-filters-btn-label');
    if (btn) {
      var n = filterCount();
      var open = document.getElementById('trip-ops-filters-drawer').classList.contains('is-open');
      btn.classList.toggle('is-active', n > 0 || open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (lbl) lbl.textContent = n > 0 ? n + ' Filter' + (n === 1 ? '' : 's') : 'Filters';
    }
  }

  function closePop() {
    var p = document.getElementById('trip-ops-filter-popover');
    if (p) p.hidden = true;
    document.querySelectorAll('.trip-ops-panel .expense-filter-pill').forEach(function (b) {
      b.classList.remove('is-open');
      b.setAttribute('aria-expanded', 'false');
    });
    openFilter = null;
    draft = null;
  }

  function positionPop(anchor, pop) {
    var panel = document.querySelector('.trip-ops-panel');
    if (!panel) return;
    var pr = panel.getBoundingClientRect();
    var r = anchor.getBoundingClientRect();
    pop.style.top = (r.bottom - pr.top + 6) + 'px';
    var w = pop.offsetWidth || 360;
    pop.style.left = Math.max(8, Math.min(r.left - pr.left, pr.width - w - 8)) + 'px';
  }

  function optionsHtml(items, selected, valueKey) {
    valueKey = valueKey || 'id';
    return items.map(function (item) {
      var checked = selected.indexOf(item[valueKey]) !== -1;
      return '<label class="meter-select-item"><input type="checkbox" value="' + escA(item[valueKey]) + '"' +
        (checked ? ' checked' : '') + '><span>' + esc(item.label) + '</span></label>';
    }).join('');
  }

  function filterItems(kind) {
    if (kind === 'status') return data.statusOptions;
    if (kind === 'route') return data.routeOptions;
    return [];
  }

  function selectedFor(kind) {
    if (kind === 'status') return state.filters.statuses;
    if (kind === 'route') return state.filters.routes;
    return [];
  }

  function setFilter(kind, vals) {
    if (kind === 'status') state.filters.statuses = vals;
    else if (kind === 'route') state.filters.routes = vals;
  }

  function selectPopover(kind, selected) {
    return '<div class="meter-popover meter-popover--select"><div class="meter-popover__search"><span data-lucide-icon="search" aria-hidden="true"></span>' +
      '<input type="search" class="meter-popover__search-input" placeholder="Select item(s)" data-select-search></div>' +
      '<div class="meter-popover__list" data-select-list>' + optionsHtml(filterItems(kind), selected) + '</div>' +
      '<div class="meter-popover__footer"><div class="meter-popover__footer-right">' +
      '<button type="button" class="btn btn-text btn-sm" data-popover-cancel>Cancel</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-popover-apply>Apply</button></div></div></div>';
  }

  function bindPop(kind) {
    var pop = document.getElementById('trip-ops-filter-popover');
    pop.querySelector('[data-popover-cancel]').onclick = closePop;
    pop.querySelector('[data-popover-apply]').onclick = function () {
      var vals = Array.prototype.map.call(pop.querySelectorAll('[data-select-list] input:checked'), function (el) { return el.value; });
      setFilter(kind, vals);
      closePop();
      state.page = 1;
      renderTable();
      if (document.getElementById('trip-ops-filters-drawer').classList.contains('is-open')) renderDrawer();
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
    var pop = document.getElementById('trip-ops-filter-popover');
    openFilter = kind;
    draft = selectedFor(kind).slice();
    pop.innerHTML = selectPopover(kind, draft);
    pop.hidden = false;
    anchor.classList.add('is-open');
    anchor.setAttribute('aria-expanded', 'true');
    positionPop(anchor, pop);
    bindPop(kind);
    initLucide(pop);
  }

  function closeDrawer() {
    document.getElementById('trip-ops-filters-drawer').classList.remove('is-open');
    updatePills();
  }

  function openDrawer() {
    closePop();
    document.getElementById('trip-ops-filters-drawer').classList.add('is-open');
    renderDrawer();
    updatePills();
  }

  function renderDrawer() {
    var body = document.getElementById('trip-ops-filters-drawer-body');
    var f = state.filters;
    var applied = '';
    if (f.statuses.length) applied += '<div class="expense-drawer-applied"><span>Status</span><span>' + f.statuses.length + ' selected</span><button type="button" data-clear="status"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    if (f.routes.length) applied += '<div class="expense-drawer-applied"><span>Route</span><span>' + f.routes.length + ' selected</span><button type="button" data-clear="route"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';

    body.innerHTML = (filterCount() ? applied : '<p class="expense-drawer-empty">No filters applied.</p>') +
      '<button type="button" class="btn btn-primary btn-sm expense-drawer-add" id="trip-ops-drawer-add">Add Filter <span data-lucide-icon="chevronDown" data-lucide-icon-size="14" aria-hidden="true"></span></button>' +
      '<div class="expense-drawer-popular"><h3>Popular Filters</h3><ul class="expense-drawer-popular__list">' +
      POPULAR.map(function (p) { return '<li><button type="button" class="expense-drawer-popular__link" data-open="' + p.id + '">' + esc(p.label) + '</button></li>'; }).join('') +
      '</ul></div>';

    body.querySelectorAll('[data-clear]').forEach(function (b) {
      b.onclick = function () {
        setFilter(b.getAttribute('data-clear'), []);
        state.page = 1;
        renderTable();
      };
    });
    body.querySelectorAll('[data-open]').forEach(function (b) {
      b.onclick = function () {
        var filter = b.getAttribute('data-open');
        var pill = document.querySelector('.trip-ops-panel .expense-filter-pill[data-filter="' + filter + '"]');
        if (pill) openPop(filter, pill);
      };
    });
    document.getElementById('trip-ops-drawer-add').onclick = function () {
      var pill = document.querySelector('.trip-ops-panel .expense-filter-pill[data-filter="status"]');
      if (pill) openPop('status', pill);
    };
    initLucide(body);
  }

  function closeTableSettings() {
    var el = document.getElementById('trip-ops-table-settings');
    if (el) el.hidden = true;
  }

  function openTableSettings(anchor) {
    closePop();
    var el = document.getElementById('trip-ops-table-settings');
    el.innerHTML = '<div class="meter-table-settings__section"><a href="#" class="meter-table-settings__manage">Manage Columns</a></div>' +
      '<div class="meter-table-settings__section"><div class="meter-table-settings__title">Items Per Page</div>' +
      [25, 50, 100].map(function (n) {
        return '<label class="meter-settings-option"><input type="radio" name="trip-ops-page-size" value="' + n + '"' + (state.pageSize === n ? ' checked' : '') + '> ' + n + '</label>';
      }).join('') + '</div>';
    el.hidden = false;
    positionPop(anchor, el);
    el.querySelectorAll('input[name="trip-ops-page-size"]').forEach(function (r) {
      r.onchange = function () { state.pageSize = parseInt(r.value, 10); state.page = 1; renderTable(); };
    });
  }

  function setTab(tab) {
    state.tab = tab;
    state.page = 1;
    document.querySelectorAll('.trip-ops-tabs .st-view-tab[data-tab]').forEach(function (b) {
      var on = b.getAttribute('data-tab') === tab;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    renderTable();
  }

  function bindCreateModal() {
    var modal = document.getElementById('trip-ops-create-modal');
    var vehicleSel = document.getElementById('trip-create-vehicle');
    var driverSel = document.getElementById('trip-create-driver');

    var vehicles = [];
    var drivers = [];
    data.trips.forEach(function (t) {
      if (vehicles.indexOf(t.vehicleId) === -1) vehicles.push(t.vehicleId);
      if (t.driver && t.driver !== '—' && drivers.indexOf(t.driver) === -1) drivers.push(t.driver);
    });
    vehicles.forEach(function (v) {
      var opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      vehicleSel.appendChild(opt);
    });
    drivers.forEach(function (d) {
      var opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      driverSel.appendChild(opt);
    });

    function openModal() { modal.classList.add('is-open'); }
    function closeModal() { modal.classList.remove('is-open'); }

    document.getElementById('trip-ops-create-btn').onclick = openModal;
    document.getElementById('trip-ops-create-close').onclick = closeModal;
    document.getElementById('trip-ops-create-cancel').onclick = closeModal;
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    document.getElementById('trip-ops-create-save').onclick = function () {
      closeModal();
      window.alert('Trip created (prototype demo).');
    };
    document.getElementById('trip-ops-dispatch-btn').onclick = function () {
      window.alert('Select a scheduled trip to dispatch (prototype demo).');
    };
  }

  function init() {
    if (document.body.getAttribute('data-subpage') !== 'trip-ops') return;
    initLucide();
    renderSummary();

    document.getElementById('trip-ops-search').oninput = function (e) {
      state.search = e.target.value;
      state.page = 1;
      renderTable();
    };

    document.querySelectorAll('.trip-ops-panel .expense-filter-pill').forEach(function (btn) {
      btn.onclick = function () {
        var k = btn.getAttribute('data-filter');
        if (openFilter === k && !document.getElementById('trip-ops-filter-popover').hidden) closePop();
        else openPop(k, btn);
      };
    });

    document.getElementById('trip-ops-filters-btn').onclick = function () {
      if (document.getElementById('trip-ops-filters-drawer').classList.contains('is-open')) closeDrawer();
      else openDrawer();
    };
    document.getElementById('trip-ops-filters-drawer-close').onclick = closeDrawer;

    document.getElementById('trip-ops-pagination').querySelector('[data-page-prev]').onclick = function () {
      if (state.page > 1) { state.page--; renderTable(); }
    };
    document.getElementById('trip-ops-pagination').querySelector('[data-page-next]').onclick = function () {
      var tp = Math.max(1, Math.ceil(filteredList().length / state.pageSize));
      if (state.page < tp) { state.page++; renderTable(); }
    };

    document.getElementById('trip-ops-table-settings-btn').onclick = function (e) {
      var el = document.getElementById('trip-ops-table-settings');
      if (!el.hidden) closeTableSettings();
      else openTableSettings(e.currentTarget);
    };

    document.querySelectorAll('.trip-ops-tabs .st-view-tab[data-tab]').forEach(function (b) {
      b.onclick = function () { setTab(b.getAttribute('data-tab')); };
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#trip-ops-filter-popover') && !e.target.closest('.trip-ops-panel .expense-filter-pill')) closePop();
      if (!e.target.closest('#trip-ops-table-settings') && !e.target.closest('#trip-ops-table-settings-btn')) closeTableSettings();
      if (!e.target.closest('.trip-ops-panel [data-row-actions]')) closeAllRowMenus();
    });

    bindCreateModal();
    renderTable();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
