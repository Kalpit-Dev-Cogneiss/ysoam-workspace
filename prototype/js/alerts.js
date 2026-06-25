(function () {
  'use strict';

  if (document.body.getAttribute('data-page') !== 'alerts' || document.body.getAttribute('data-subpage')) return;

  var data = window.YSOAM_ALERTS;
  var vehicles = window.YSOAM_VEHICLES;

  var POPULAR = [
    { id: 'type', label: 'Alert Type' },
    { id: 'severity', label: 'Severity' },
    { id: 'vehicle', label: 'Vehicle' }
  ];

  var state = {
    readTab: 'all',
    search: '',
    page: 1,
    pageSize: 50,
    filters: {
      types: [],
      severities: [],
      vehicles: []
    }
  };

  var draft = null;
  var openFilter = null;

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function lucide(name, size) { return window.YSOAM_LUCIDE ? window.YSOAM_LUCIDE.icon(name, size || 16) : ''; }
  function rowIcon(key) { return window.YSOAM_ICONS && window.YSOAM_ICONS[key] ? window.YSOAM_ICONS[key] : ''; }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }

  function findVehicle(id) {
    if (!vehicles || !vehicles.list) return null;
    return vehicles.list.find(function (v) { return v.id === id; }) || null;
  }

  function filterCount() {
    var f = state.filters;
    var n = 0;
    if (f.types.length) n++;
    if (f.severities.length) n++;
    if (f.vehicles.length) n++;
    return n;
  }

  function filteredList() {
    var q = state.search.trim().toLowerCase();
    var f = state.filters;
    return data.list.filter(function (row) {
      if (state.readTab === 'unread' && row.read) return false;
      if (state.readTab === 'read' && !row.read) return false;
      if (f.types.length && f.types.indexOf(row.type) === -1) return false;
      if (f.severities.length && f.severities.indexOf(row.severity) === -1) return false;
      if (f.vehicles.length && f.vehicles.indexOf(row.vehicleId) === -1) return false;
      if (q) {
        var hay = [
          row.id, row.title, row.summary, row.typeLabel, row.severityLabel,
          row.vehicleId, row.vehicleName, row.source, row.tripId
        ].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function severityBadge(severity, label) {
    return '<span class="alerts-severity alerts-severity--' + esc(severity) + '">' + esc(label) + '</span>';
  }

  function vehicleCell(row) {
    var v = findVehicle(row.vehicleId);
    if (!v) return esc(row.vehicleId);
    return (
      '<div class="service-vehicle-cell">' +
        '<img class="service-vehicle-thumb" src="' + esc(v.image) + '" alt="">' +
        '<div class="service-vehicle-info">' +
          '<a href="vehicle-detail.html?id=' + escA(row.vehicleId) + '" class="service-vehicle-link">' + esc(row.vehicleName) + '</a>' +
        '</div>' +
      '</div>'
    );
  }

  function rowActionsMenu(row) {
    return (
      '<div class="row-actions" data-row-actions="' + escA(row.id) + '">' +
        '<button type="button" class="row-actions__trigger" aria-label="More actions" aria-haspopup="menu" aria-expanded="false">' +
          '<span class="row-actions__dots" aria-hidden="true"></span>' +
        '</button>' +
        '<div class="row-actions__menu" role="menu" hidden>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="view" role="menuitem">View <span class="row-actions__item-icon">' + rowIcon('actionView') + '</span></button>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="toggle-read" role="menuitem">' +
            (row.read ? 'Mark Unread' : 'Mark Read') + '</button>' +
          '<div class="row-actions__divider" role="separator"></div>' +
          '<button type="button" class="row-actions__item row-actions__item--btn row-actions__item--danger" data-action="dismiss" role="menuitem">Dismiss</button>' +
        '</div>' +
      '</div>'
    );
  }

  function closeAllRowMenus() {
    document.querySelectorAll('.alerts-panel .row-actions__menu').forEach(function (m) {
      m.hidden = true;
      m.style.position = '';
      m.style.top = '';
      m.style.left = '';
    });
    document.querySelectorAll('.alerts-panel .row-actions__trigger').forEach(function (b) {
      b.setAttribute('aria-expanded', 'false');
    });
  }

  function positionRowMenu(trigger, menu) {
    var rect = trigger.getBoundingClientRect();
    menu.hidden = false;
    menu.style.position = 'fixed';
    menu.style.top = (rect.bottom + 4) + 'px';
    menu.style.left = Math.max(8, rect.right - 188) + 'px';
    menu.style.zIndex = '120';
  }

  function bindRowActions() {
    document.querySelectorAll('.alerts-panel .row-actions').forEach(function (wrap) {
      if (wrap.getAttribute('data-bound')) return;
      wrap.setAttribute('data-bound', '1');
      wrap.addEventListener('click', function (e) { e.stopPropagation(); });
    });

    document.querySelectorAll('.alerts-panel .row-actions__trigger').forEach(function (btn) {
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

    document.querySelectorAll('.alerts-panel [data-action="view"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        var id = btn.closest('[data-row-actions]').getAttribute('data-row-actions');
        closeAllRowMenus();
        window.location.href = 'alert-view?id=' + encodeURIComponent(id);
      });
    });

    document.querySelectorAll('.alerts-panel [data-action="toggle-read"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        var id = btn.closest('[data-row-actions]').getAttribute('data-row-actions');
        var row = data.getById(id);
        if (row) row.read = !row.read;
        closeAllRowMenus();
        renderKpis();
        renderTable();
      });
    });

    document.querySelectorAll('.alerts-panel [data-action="dismiss"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        closeAllRowMenus();
        window.alert('Dismiss alert (prototype demo).');
      });
    });
  }

  function renderKpis() {
    var s = data.stats();
    document.getElementById('alerts-kpi-strip').innerHTML =
      '<div class="alerts-kpi"><span class="alerts-kpi__value tabular-nums">' + s.total + '</span><span class="alerts-kpi__label">Total Alerts</span></div>' +
      '<div class="alerts-kpi alerts-kpi--unread"><span class="alerts-kpi__value tabular-nums">' + s.unread + '</span><span class="alerts-kpi__label">Unread</span></div>' +
      '<div class="alerts-kpi alerts-kpi--critical"><span class="alerts-kpi__value tabular-nums">' + s.critical + '</span><span class="alerts-kpi__label">Critical Unread</span></div>' +
      '<div class="alerts-kpi alerts-kpi--high"><span class="alerts-kpi__value tabular-nums">' + s.high + '</span><span class="alerts-kpi__label">High Unread</span></div>';
  }

  function renderTable() {
    var root = document.getElementById('alerts-table');
    var countEl = document.getElementById('alerts-count');
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

    var html = '<table class="data-table data-table--list data-table--alerts"><thead><tr>' +
      '<th class="data-table__check-col"><input type="checkbox" aria-label="Select all"></th>' +
      '<th class="alerts-col-status" aria-label="Read status"></th>' +
      '<th>Severity</th>' +
      '<th>Alert</th>' +
      '<th>Type</th>' +
      '<th>Vehicle</th>' +
      '<th>Triggered ↓</th>' +
      '<th>Source</th>' +
      '<th class="data-table__actions-col" aria-label="Actions"></th>' +
      '</tr></thead><tbody>';

    if (!rows.length) {
      html += '<tr><td colspan="9" class="service-history-empty">No alerts match your filters</td></tr>';
    } else {
      rows.forEach(function (row) {
        var unread = !row.read;
        var rowClass = unread ? ' alerts-row--unread' : '';
        html += '<tr class="' + rowClass.trim() + '" data-alert-id="' + escA(row.id) + '">' +
          '<td class="data-table__check-col"><input type="checkbox" aria-label="Select row"></td>' +
          '<td class="alerts-col-status">' + (unread ? '<span class="alerts-unread-dot" aria-label="Unread"></span>' : '') + '</td>' +
          '<td>' + severityBadge(row.severity, row.severityLabel) + '</td>' +
          '<td class="alerts-col-alert">' +
            '<a href="#" class="table-cell-link alerts-title-link' + (unread ? ' alerts-title-link--unread' : '') + '" data-alert-view="' + escA(row.id) + '">' + esc(row.title) + '</a>' +
            '<div class="alerts-summary">' + esc(row.summary) + '</div>' +
          '</td>' +
          '<td>' + esc(row.typeLabel) + '</td>' +
          '<td>' + vehicleCell(row) + '</td>' +
          '<td class="tabular-nums">' + esc(row.triggeredLabel) + '</td>' +
          '<td>' + esc(row.source) + '</td>' +
          '<td class="data-table__actions-col">' + rowActionsMenu(row) + '</td>' +
          '</tr>';
      });
    }

    html += '</tbody></table>';
    root.innerHTML = html;
    bindRowActions();

    root.querySelectorAll('[data-alert-view]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = 'alert-view?id=' + encodeURIComponent(link.getAttribute('data-alert-view'));
      });
    });

    root.querySelectorAll('tbody tr[data-alert-id]').forEach(function (tr) {
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', function (e) {
        if (e.target.closest('a, button, input, .row-actions')) return;
        window.location.href = 'alert-view?id=' + encodeURIComponent(tr.getAttribute('data-alert-id'));
      });
    });

    updatePills();
    initLucide(root);
  }

  function updatePills() {
    var f = state.filters;
    document.querySelectorAll('.alerts-panel .expense-filter-pill').forEach(function (btn) {
      var k = btn.getAttribute('data-filter');
      var on = (k === 'type' && f.types.length) || (k === 'severity' && f.severities.length) || (k === 'vehicle' && f.vehicles.length);
      btn.classList.toggle('has-filter', !!on);
    });
    var btn = document.getElementById('alerts-filters-btn');
    var lbl = document.getElementById('alerts-filters-btn-label');
    if (btn) {
      var n = filterCount();
      var open = document.getElementById('alerts-filters-drawer').classList.contains('is-open');
      btn.classList.toggle('is-active', n > 0 || open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (lbl) lbl.textContent = n > 0 ? n + ' Filter' + (n === 1 ? '' : 's') : 'Filters';
    }
  }

  function closePop() {
    var p = document.getElementById('alerts-filter-popover');
    if (p) p.hidden = true;
    document.querySelectorAll('.alerts-panel .expense-filter-pill').forEach(function (b) {
      b.classList.remove('is-open');
      b.setAttribute('aria-expanded', 'false');
    });
    openFilter = null;
    draft = null;
  }

  function positionPop(anchor, pop) {
    var panel = document.querySelector('.alerts-panel');
    if (!panel) return;
    var pr = panel.getBoundingClientRect();
    var r = anchor.getBoundingClientRect();
    pop.style.top = (r.bottom - pr.top + 6) + 'px';
    var w = pop.offsetWidth || 360;
    pop.style.left = Math.max(8, Math.min(r.left - pr.left, pr.width - w - 8)) + 'px';
  }

  function filterItems(kind) {
    if (kind === 'type') return data.TYPES;
    if (kind === 'severity') return data.SEVERITIES;
    if (kind === 'vehicle') return data.vehicleOptions();
    return [];
  }

  function selectedFor(kind) {
    if (kind === 'type') return state.filters.types;
    if (kind === 'severity') return state.filters.severities;
    if (kind === 'vehicle') return state.filters.vehicles;
    return [];
  }

  function setFilter(kind, vals) {
    if (kind === 'type') state.filters.types = vals;
    else if (kind === 'severity') state.filters.severities = vals;
    else if (kind === 'vehicle') state.filters.vehicles = vals;
  }

  function optionsHtml(items, selected) {
    return items.map(function (item) {
      var checked = selected.indexOf(item.id) !== -1;
      return '<label class="meter-select-item"><input type="checkbox" value="' + escA(item.id) + '"' +
        (checked ? ' checked' : '') + '><span>' + esc(item.label) + '</span></label>';
    }).join('');
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
    var pop = document.getElementById('alerts-filter-popover');
    pop.querySelector('[data-popover-cancel]').onclick = closePop;
    pop.querySelector('[data-popover-apply]').onclick = function () {
      var vals = Array.prototype.map.call(pop.querySelectorAll('[data-select-list] input:checked'), function (el) { return el.value; });
      setFilter(kind, vals);
      closePop();
      state.page = 1;
      renderTable();
      if (document.getElementById('alerts-filters-drawer').classList.contains('is-open')) renderDrawer();
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
    var pop = document.getElementById('alerts-filter-popover');
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
    document.getElementById('alerts-filters-drawer').classList.remove('is-open');
    updatePills();
  }

  function openDrawer() {
    closePop();
    document.getElementById('alerts-filters-drawer').classList.add('is-open');
    renderDrawer();
    updatePills();
  }

  function renderDrawer() {
    var body = document.getElementById('alerts-filters-drawer-body');
    var f = state.filters;
    var applied = '';
    if (f.types.length) applied += '<div class="expense-drawer-applied"><span>Alert Type</span><span>' + f.types.length + ' selected</span><button type="button" data-clear="type"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    if (f.severities.length) applied += '<div class="expense-drawer-applied"><span>Severity</span><span>' + f.severities.length + ' selected</span><button type="button" data-clear="severity"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    if (f.vehicles.length) applied += '<div class="expense-drawer-applied"><span>Vehicle</span><span>' + f.vehicles.length + ' selected</span><button type="button" data-clear="vehicle"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';

    body.innerHTML = (filterCount() ? applied : '<p class="expense-drawer-empty">No filters applied.</p>') +
      '<button type="button" class="btn btn-primary btn-sm expense-drawer-add" id="alerts-drawer-add">Add Filter <span data-lucide-icon="chevronDown" data-lucide-icon-size="14" aria-hidden="true"></span></button>' +
      '<div class="expense-drawer-popular"><h3>Popular Filters</h3><ul class="expense-drawer-popular__list">' +
      POPULAR.map(function (p) { return '<li><button type="button" class="expense-drawer-popular__link" data-open="' + p.id + '">' + esc(p.label) + '</button></li>'; }).join('') +
      '</ul></div>';

    body.querySelectorAll('[data-clear]').forEach(function (b) {
      b.onclick = function () { setFilter(b.getAttribute('data-clear'), []); state.page = 1; renderTable(); renderDrawer(); };
    });
    body.querySelectorAll('[data-open]').forEach(function (b) {
      b.onclick = function () {
        var pill = document.querySelector('.alerts-panel .expense-filter-pill[data-filter="' + b.getAttribute('data-open') + '"]');
        if (pill) openPop(b.getAttribute('data-open'), pill);
      };
    });
    document.getElementById('alerts-drawer-add').onclick = function () {
      var pill = document.querySelector('.alerts-panel .expense-filter-pill[data-filter="type"]');
      if (pill) openPop('type', pill);
    };
    initLucide(body);
  }

  function closeTableSettings() {
    var el = document.getElementById('alerts-table-settings');
    if (el) el.hidden = true;
  }

  function openTableSettings(anchor) {
    closePop();
    var el = document.getElementById('alerts-table-settings');
    el.innerHTML = '<div class="meter-table-settings__section"><div class="meter-table-settings__title">Items Per Page</div>' +
      [25, 50, 100].map(function (n) {
        return '<label class="meter-settings-option"><input type="radio" name="alerts-page-size" value="' + n + '"' + (state.pageSize === n ? ' checked' : '') + '> ' + n + '</label>';
      }).join('') + '</div>';
    el.hidden = false;
    positionPop(anchor, el);
    el.querySelectorAll('input[name="alerts-page-size"]').forEach(function (r) {
      r.onchange = function () { state.pageSize = parseInt(r.value, 10); state.page = 1; renderTable(); };
    });
  }

  function setReadTab(tab) {
    state.readTab = tab;
    state.page = 1;
    document.querySelectorAll('.alerts-view-tabs [data-read-tab]').forEach(function (btn) {
      var on = btn.getAttribute('data-read-tab') === tab;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    renderTable();
  }

  function init() {
    initLucide();
    renderKpis();
    renderTable();

    document.getElementById('alerts-search').oninput = function (e) {
      state.search = e.target.value;
      state.page = 1;
      renderTable();
    };

    document.querySelectorAll('.alerts-view-tabs [data-read-tab]').forEach(function (btn) {
      btn.onclick = function () { setReadTab(btn.getAttribute('data-read-tab')); };
    });

    document.querySelectorAll('.alerts-panel .expense-filter-pill').forEach(function (btn) {
      btn.onclick = function () {
        var k = btn.getAttribute('data-filter');
        if (openFilter === k && !document.getElementById('alerts-filter-popover').hidden) closePop();
        else openPop(k, btn);
      };
    });

    document.getElementById('alerts-filters-btn').onclick = function () {
      if (document.getElementById('alerts-filters-drawer').classList.contains('is-open')) closeDrawer();
      else openDrawer();
    };
    document.getElementById('alerts-filters-drawer-close').onclick = closeDrawer;

    document.getElementById('alerts-pagination').querySelector('[data-page-prev]').onclick = function () {
      if (state.page > 1) { state.page--; renderTable(); }
    };
    document.getElementById('alerts-pagination').querySelector('[data-page-next]').onclick = function () {
      var tp = Math.max(1, Math.ceil(filteredList().length / state.pageSize));
      if (state.page < tp) { state.page++; renderTable(); }
    };

    document.getElementById('alerts-table-settings-btn').onclick = function (e) {
      var el = document.getElementById('alerts-table-settings');
      if (!el.hidden) closeTableSettings();
      else openTableSettings(e.currentTarget);
    };

    document.getElementById('alerts-mark-all-read').onclick = function () {
      data.list.forEach(function (r) { r.read = true; });
      renderKpis();
      renderTable();
    };

    document.getElementById('alerts-save-view-btn').onclick = function () {
      window.alert('Save view (prototype demo).');
    };
    document.getElementById('alerts-more-btn').onclick = function () {
      window.alert('More actions (prototype demo).');
    };

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#alerts-filter-popover') && !e.target.closest('.expense-filter-pill') &&
          !e.target.closest('#alerts-table-settings') && !e.target.closest('#alerts-table-settings-btn')) {
        closePop();
        closeTableSettings();
      }
      if (!e.target.closest('.row-actions')) closeAllRowMenus();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
