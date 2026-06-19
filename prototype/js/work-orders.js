(function () {
  'use strict';

  var data = window.YSOAM_WORK_ORDERS;
  var vehicles = window.YSOAM_VEHICLES;
  var POPULAR = [
    { id: 'assignee', label: 'Assignee Group' },
    { id: 'labels', label: 'Work Order Labels' },
    { id: 'priority', label: 'Work Order Repair Priority Class' },
    { id: 'vehicle', label: 'Vehicle' },
    { id: 'group', label: 'Vehicle Group' }
  ];

  var state = {
    tab: 'all',
    search: '',
    page: 1,
    pageSize: 50,
    density: 'default',
    filters: { statuses: [], vehicles: [], groups: [], tasks: [] }
  };

  var draft = null;
  var openFilter = null;

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }

  function lucideIcon(name, size) {
    return window.YSOAM_LUCIDE ? window.YSOAM_LUCIDE.icon(name, size || 16) : '';
  }

  function initLucideIcons(root) {
    if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root);
  }

  function rowActionsMenu(row) {
    var viewUrl = 'work-order-view?id=' + encodeURIComponent(row.id);
    var editUrl = 'work-order-form?id=' + encodeURIComponent(row.id);
    return (
      '<div class="row-actions" data-row-actions="' + escA(row.id) + '">' +
        '<button type="button" class="row-actions__trigger" aria-label="More actions for #' + escA(row.number) + '" aria-haspopup="menu" aria-expanded="false">' +
          lucideIcon('moreHorizontal', 16) +
        '</button>' +
        '<div class="row-actions__menu row-actions__menu--wide" role="menu" hidden>' +
          '<a class="row-actions__item" href="' + viewUrl + '" role="menuitem">View <span class="row-actions__item-icon">' + lucideIcon('eye') + '</span></a>' +
          '<a class="row-actions__item" href="' + editUrl + '" role="menuitem">Edit <span class="row-actions__item-icon">' + lucideIcon('pencil') + '</span></a>' +
          '<span class="row-actions__item row-actions__item--disabled" role="menuitem" aria-disabled="true">Merge <span class="row-actions__item-icon">' + lucideIcon('lock') + '</span></span>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="archive" role="menuitem">Archive <span class="row-actions__item-icon">' + lucideIcon('archive') + '</span></button>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="history" role="menuitem">View Record History <span class="row-actions__item-icon">' + lucideIcon('history') + '</span></button>' +
        '</div>' +
      '</div>'
    );
  }

  function closeAllRowMenus() {
    document.querySelectorAll('.work-orders-panel .row-actions__menu').forEach(function (m) {
      m.hidden = true;
      m.style.position = '';
      m.style.top = '';
      m.style.left = '';
      m.style.right = '';
    });
    document.querySelectorAll('.work-orders-panel .row-actions__trigger').forEach(function (b) {
      b.setAttribute('aria-expanded', 'false');
    });
  }

  function positionRowMenu(trigger, menu) {
    var rect = trigger.getBoundingClientRect();
    menu.hidden = false;
    menu.style.position = 'fixed';
    menu.style.top = (rect.bottom + 4) + 'px';
    menu.style.left = Math.max(8, rect.right - 220) + 'px';
    menu.style.right = 'auto';
    menu.style.zIndex = '120';
  }

  function bindRowActions() {
    document.querySelectorAll('.work-orders-panel .row-actions').forEach(function (wrap) {
      if (wrap.getAttribute('data-bound')) return;
      wrap.setAttribute('data-bound', '1');
      wrap.addEventListener('click', function (e) { e.stopPropagation(); });
    });

    document.querySelectorAll('.work-orders-panel .row-actions__trigger').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var wrap = btn.closest('.row-actions');
        var menu = wrap.querySelector('.row-actions__menu');
        var willOpen = menu.hidden;
        closeAllRowMenus();
        if (willOpen) {
          positionRowMenu(btn, menu);
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    document.querySelectorAll('.work-orders-panel [data-action="archive"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        closeAllRowMenus();
        window.alert('Archive work order (prototype demo).');
      });
    });

    document.querySelectorAll('.work-orders-panel [data-action="history"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        closeAllRowMenus();
        window.alert('View record history (prototype demo).');
      });
    });
  }

  function findVehicle(id) {
    return (vehicles.list || []).find(function (v) { return v.id === id; }) || null;
  }

  function statusLabel(s) {
    var m = { active: 'Active', transit: 'In Transit', idle: 'Idle', offline: 'Offline', maintenance: 'Maintenance' };
    return m[s] || s;
  }

  function statusColor(s) {
    var c = window.YSOAM_FLEET && window.YSOAM_FLEET.statusColors;
    return (c && c[s]) || '#64748B';
  }

  function vehicleMeta(v) { return statusLabel(v.status) + ' · ' + v.type + ' · ' + v.group; }

  function filterCount() {
    var f = state.filters, n = 0;
    if (f.statuses.length) n++;
    if (f.vehicles.length) n++;
    if (f.groups.length) n++;
    if (f.tasks.length) n++;
    return n;
  }

  function filteredList() {
    var q = state.search.trim().toLowerCase();
    var f = state.filters;
    return data.list.filter(function (row) {
      if (state.tab !== 'all' && row.status.id !== state.tab) return false;
      if (f.statuses.length && f.statuses.indexOf(row.status.id) === -1) return false;
      var v = findVehicle(row.vehicleId);
      if (f.vehicles.length && f.vehicles.indexOf(row.vehicleId) === -1) return false;
      if (f.groups.length && (!v || f.groups.indexOf(v.group) === -1)) return false;
      if (f.tasks.length && !row.tasks.some(function (t) { return f.tasks.indexOf(t) !== -1; })) return false;
      if (q) {
        var hay = [row.number, v && v.name, row.status.label, row.priority.label, row.tasks.join(' ')].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function tasksCell(tasks) {
    if (!tasks.length) return '—';
    var html = tasks.slice(0, 2).map(function (t) {
      return '<a href="#" class="table-cell-link">' + esc(t) + '</a>';
    }).join('');
    if (tasks.length > 2) html += '<a href="#" class="service-tasks-more">+' + (tasks.length - 2) + ' more</a>';
    return '<div class="data-table__task-cell">' + html + '</div>';
  }

  function vehicleCell(row) {
    var v = findVehicle(row.vehicleId);
    if (!v) return esc(row.vehicleId);
    var sample = row.isSample ? '<span class="service-sample-tag">Sample</span>' : '';
    return '<div class="service-vehicle-cell"><img class="service-vehicle-thumb" src="' + esc(v.image) + '" alt="">' +
      '<div class="service-vehicle-info"><a href="vehicle-detail?id=' + encodeURIComponent(v.id) + '" class="service-vehicle-link">' + esc(v.name) + '</a>' + sample + '</div></div>';
  }

  function renderTable() {
    var root = document.getElementById('work-orders-table');
    var countEl = document.getElementById('wo-count');
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

    var dense = state.density === 'compact' ? ' data-table--compact' : '';
    var html = '<table class="data-table data-table--list data-table--work-orders' + dense + '"><thead><tr>' +
      '<th class="data-table__check-col"><input type="checkbox" aria-label="Select all"></th>' +
      '<th>Vehicle</th><th>Number</th><th>Status</th><th>Repair Priority Class</th><th>Service Tasks</th>' +
      '<th>Issues</th><th>Resolved Issues</th><th>Issue Date</th><th>Scheduled Start Date</th>' +
      '<th>Expected Completion Date</th><th>Assigned To</th><th>Watchers</th><th class="data-table__actions-col" aria-label="Actions"></th></tr></thead><tbody>';

    if (!rows.length) {
      html += '<tr><td colspan="14" class="service-history-empty">No work orders found</td></tr>';
    } else {
      rows.forEach(function (row) {
        html += '<tr>' +
          '<td class="data-table__check-col"><input type="checkbox"></td>' +
          '<td>' + vehicleCell(row) + '</td>' +
          '<td><a href="work-order-view?id=' + encodeURIComponent(row.id) + '" class="table-cell-link">#' + row.number + '</a>' + (row.isSample ? ' <span class="service-sample-tag">Sample</span>' : '') + '</td>' +
          '<td><span class="data-table__status-dot" style="background:' + row.status.dot + '"></span>' + esc(row.status.label) + '</td>' +
          '<td><span class="data-table__status-dot" style="background:' + row.priority.dot + '"></span>' + esc(row.priority.label) + '</td>' +
          '<td>' + tasksCell(row.tasks) + '</td>' +
          '<td>' + (row.issues || '—') + '</td>' +
          '<td>' + (row.resolvedIssues || '—') + '</td>' +
          '<td class="tabular-nums">' + data.formatDate(new Date(row.issueDate)) + '</td>' +
          '<td class="tabular-nums">' + (row.scheduledStart ? data.formatDate(new Date(row.scheduledStart)) : '—') + '</td>' +
          '<td>' + (row.expectedCompletion || '—') + '</td>' +
          '<td>' + (row.assignedTo || '—') + '</td>' +
          '<td>' + (row.watchers || '—') + '</td>' +
          '<td class="data-table__actions-col">' + rowActionsMenu(row) + '</td></tr>';
      });
    }
    html += '</tbody></table>';
    root.innerHTML = html;
    bindRowActions();
    updatePills();
  }

  function updatePills() {
    var f = state.filters;
    document.querySelectorAll('.work-orders-panel .expense-filter-pill').forEach(function (btn) {
      var k = btn.getAttribute('data-filter');
      var on = (k === 'status' && f.statuses.length) || (k === 'vehicle' && f.vehicles.length) ||
        (k === 'group' && f.groups.length) || (k === 'task' && f.tasks.length);
      btn.classList.toggle('has-filter', !!on);
    });
    var btn = document.getElementById('wo-filters-btn');
    var lbl = document.getElementById('wo-filters-btn-label');
    if (btn) {
      var n = filterCount();
      var open = document.getElementById('wo-filters-drawer').classList.contains('is-open');
      btn.classList.toggle('is-active', n > 0 || open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (lbl) lbl.textContent = n > 0 ? n + ' Filter' + (n === 1 ? '' : 's') : 'Filters';
    }
  }

  function closePop() {
    var p = document.getElementById('wo-filter-popover');
    if (p) p.hidden = true;
    document.querySelectorAll('.work-orders-panel .expense-filter-pill').forEach(function (b) {
      b.classList.remove('is-open');
      b.setAttribute('aria-expanded', 'false');
    });
    openFilter = null;
    draft = null;
  }

  function positionPop(anchor, pop) {
    var panel = document.querySelector('.work-orders-panel');
    if (!panel) return;
    var pr = panel.getBoundingClientRect();
    var r = anchor.getBoundingClientRect();
    pop.style.top = (r.bottom - pr.top + 6) + 'px';
    var w = pop.offsetWidth || (openFilter === 'task' ? 420 : 340);
    pop.style.left = Math.max(8, Math.min(r.left - pr.left, pr.width - w - 8)) + 'px';
  }

  function statusPopover(selected) {
    return data.statuses.map(function (s) {
      var c = selected.indexOf(s.id) !== -1;
      return '<label class="meter-select-item meter-select-item--status"><input type="checkbox" value="' + escA(s.id) + '"' + (c ? ' checked' : '') + '>' +
        '<span class="data-table__status-dot" style="background:' + s.dot + '"></span><span>' + esc(s.label) + '</span></label>';
    }).join('');
  }

  function selectPopover(kind, selected) {
    var list = '';
    if (kind === 'vehicle') {
      list = (vehicles.list || []).filter(function (v) { return v.assignment !== 'archived'; }).map(function (v) {
        var c = selected.indexOf(v.id) !== -1;
        return '<label class="meter-select-item meter-select-item--vehicle"><input type="checkbox" value="' + escA(v.id) + '"' + (c ? ' checked' : '') + '>' +
          '<img class="meter-select-item__thumb" src="' + escA(v.image) + '" alt=""><span class="meter-select-item__status" style="background:' + statusColor(v.status) + '"></span>' +
          '<span class="meter-select-item__text"><strong>' + esc(v.name) + '</strong><span>' + esc(vehicleMeta(v)) + '</span></span></label>';
      }).join('');
    } else if (kind === 'group') {
      list = data.groups().map(function (g, i) {
        var c = selected.indexOf(g) !== -1;
        return '<label class="meter-select-item"><input type="checkbox" value="' + escA(g) + '"' + (c ? ' checked' : '') + '><span>' + esc(g) + (i < 2 ? ' <span class="service-sample-tag">Sample</span>' : '') + '</span></label>';
      }).join('');
    } else if (kind === 'task') {
      list = data.tasks.map(function (t) {
        var c = selected.indexOf(t) !== -1;
        return '<label class="meter-select-item"><input type="checkbox" value="' + escA(t) + '"' + (c ? ' checked' : '') + '><span>' + esc(t) + '</span></label>';
      }).join('');
    } else if (kind === 'status') {
      list = statusPopover(selected);
    }
    var cls = kind === 'task' ? 'meter-popover meter-popover--select meter-popover--tasks' : 'meter-popover meter-popover--select';
    return '<div class="' + cls + '"><div class="meter-popover__search"><span data-lucide-icon="search" aria-hidden="true"></span>' +
      '<input type="search" class="meter-popover__search-input" placeholder="Select item(s)" data-select-search></div>' +
      '<div class="meter-popover__list" data-select-list>' + list + '</div>' +
      '<div class="meter-popover__footer"><div class="meter-popover__footer-right">' +
      '<button type="button" class="btn btn-text btn-sm" data-popover-cancel>Cancel</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-popover-apply>Apply</button></div></div></div>';
  }

  function bindPop(kind) {
    var pop = document.getElementById('wo-filter-popover');
    pop.querySelector('[data-popover-cancel]').onclick = closePop;
    pop.querySelector('[data-popover-apply]').onclick = function () {
      var vals = Array.prototype.map.call(pop.querySelectorAll('[data-select-list] input:checked'), function (el) { return el.value; });
      if (kind === 'status') state.filters.statuses = vals;
      else if (kind === 'vehicle') state.filters.vehicles = vals;
      else if (kind === 'group') state.filters.groups = vals;
      else if (kind === 'task') state.filters.tasks = vals;
      closePop();
      state.page = 1;
      renderTable();
      if (document.getElementById('wo-filters-drawer').classList.contains('is-open')) renderDrawer();
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
    closeSaveView();
    var pop = document.getElementById('wo-filter-popover');
    openFilter = kind;
    draft = state.filters[kind === 'status' ? 'statuses' : kind === 'vehicle' ? 'vehicles' : kind === 'group' ? 'groups' : 'tasks'].slice();
    pop.innerHTML = selectPopover(kind, draft);
    pop.hidden = false;
    anchor.classList.add('is-open');
    anchor.setAttribute('aria-expanded', 'true');
    positionPop(anchor, pop);
    bindPop(kind);
    initLucideIcons(pop);
  }

  function closeDrawer() {
    document.getElementById('wo-filters-drawer').classList.remove('is-open');
    updatePills();
  }

  function openDrawer() {
    closePop();
    document.getElementById('wo-filters-drawer').classList.add('is-open');
    renderDrawer();
    updatePills();
  }

  function renderDrawer() {
    var body = document.getElementById('wo-filters-drawer-body');
    var f = state.filters;
    var applied = '';
    if (f.statuses.length) applied += '<div class="expense-drawer-applied"><span>Status</span><span>' + esc(f.statuses.join(', ')) + '</span><button type="button" data-clear="status">×</button></div>';
    if (f.vehicles.length) applied += '<div class="expense-drawer-applied"><span>Vehicle</span><span>' + f.vehicles.length + ' selected</span><button type="button" data-clear="vehicle">×</button></div>';
    if (f.groups.length) applied += '<div class="expense-drawer-applied"><span>Vehicle Group</span><span>' + esc(f.groups.join(', ')) + '</span><button type="button" data-clear="group">×</button></div>';
    if (f.tasks.length) applied += '<div class="expense-drawer-applied"><span>Service Tasks</span><span>' + f.tasks.length + ' selected</span><button type="button" data-clear="task">×</button></div>';
    body.innerHTML = (filterCount() ? applied : '<p class="expense-drawer-empty">No filters applied.</p>') +
      '<button type="button" class="btn btn-primary btn-sm expense-drawer-add" id="wo-drawer-add">Add Filter <span data-lucide-icon="chevronDown" data-lucide-icon-size="14" aria-hidden="true"></span></button>' +
      '<div class="expense-drawer-popular"><h3>Popular Filters</h3><ul class="expense-drawer-popular__list">' +
      POPULAR.map(function (p) { return '<li><button type="button" class="expense-drawer-popular__link" data-open="' + p.id + '">' + esc(p.label) + '</button></li>'; }).join('') +
      '</ul></div>';
    body.querySelectorAll('[data-clear]').forEach(function (b) {
      b.onclick = function () {
        var k = b.getAttribute('data-clear');
        if (k === 'status') state.filters.statuses = [];
        else if (k === 'vehicle') state.filters.vehicles = [];
        else if (k === 'group') state.filters.groups = [];
        else if (k === 'task') state.filters.tasks = [];
        state.page = 1;
        renderTable();
      };
    });
    body.querySelectorAll('[data-open]').forEach(function (b) {
      b.onclick = function () {
        var map = { vehicle: 'vehicle', group: 'group', priority: 'status', labels: 'task', assignee: 'status' };
        var id = b.getAttribute('data-open');
        var pill = document.querySelector('.work-orders-panel .expense-filter-pill[data-filter="' + (map[id] || 'vehicle') + '"]');
        if (pill) openPop(map[id] || id, pill);
      };
    });
    document.getElementById('wo-drawer-add').onclick = function () {
      var pill = document.querySelector('.work-orders-panel .expense-filter-pill[data-filter="status"]');
      if (pill) openPop('status', pill);
    };
    initLucideIcons(body);
  }

  function closeTableSettings() {
    var el = document.getElementById('wo-table-settings');
    if (el) el.hidden = true;
  }

  function openTableSettings(anchor) {
    closePop();
    closeSaveView();
    var el = document.getElementById('wo-table-settings');
    el.innerHTML = '<div class="meter-table-settings__section"><a href="#" class="meter-table-settings__manage">Manage Columns</a></div>' +
      '<div class="meter-table-settings__section"><div class="meter-table-settings__title">Items Per Page</div>' +
      [50, 100, 200].map(function (n) {
        return '<label class="meter-settings-option"><input type="radio" name="wo-page-size" value="' + n + '"' + (state.pageSize === n ? ' checked' : '') + '> ' + n + '</label>';
      }).join('') + '</div>' +
      '<div class="meter-table-settings__section"><div class="meter-table-settings__title">Density</div>' +
      '<label class="meter-settings-option"><input type="radio" name="wo-density" value="default"' + (state.density === 'default' ? ' checked' : '') + '> Default</label>' +
      '<label class="meter-settings-option"><input type="radio" name="wo-density" value="compact"' + (state.density === 'compact' ? ' checked' : '') + '> Compact</label></div>';
    el.hidden = false;
    positionPop(anchor, el);
    el.querySelectorAll('input[name="wo-page-size"]').forEach(function (r) {
      r.onchange = function () { state.pageSize = parseInt(r.value, 10); state.page = 1; renderTable(); };
    });
    el.querySelectorAll('input[name="wo-density"]').forEach(function (r) {
      r.onchange = function () { state.density = r.value; renderTable(); };
    });
  }

  function closeSaveView() {
    var el = document.getElementById('wo-save-view-popover');
    if (el) el.hidden = true;
  }

  function openSaveView(anchor) {
    closePop();
    closeTableSettings();
    var el = document.getElementById('wo-save-view-popover');
    el.hidden = false;
    positionPop(anchor, el);
  }

  function setTab(tab) {
    state.tab = tab;
    state.page = 1;
    document.querySelectorAll('.work-view-tab[data-tab]').forEach(function (b) {
      var on = b.getAttribute('data-tab') === tab;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    renderTable();
  }

  function init() {
    if (document.body.getAttribute('data-subpage') !== 'work-orders') return;
    initLucideIcons();

    document.getElementById('wo-search').oninput = function (e) {
      state.search = e.target.value;
      state.page = 1;
      renderTable();
    };

    document.querySelectorAll('.work-orders-panel .expense-filter-pill').forEach(function (btn) {
      btn.onclick = function () {
        var k = btn.getAttribute('data-filter');
        if (openFilter === k && !document.getElementById('wo-filter-popover').hidden) closePop();
        else openPop(k, btn);
      };
    });

    document.getElementById('wo-filters-btn').onclick = function () {
      if (document.getElementById('wo-filters-drawer').classList.contains('is-open')) closeDrawer();
      else openDrawer();
    };
    document.getElementById('wo-filters-drawer-close').onclick = closeDrawer;

    document.getElementById('wo-pagination').querySelector('[data-page-prev]').onclick = function () {
      if (state.page > 1) { state.page--; renderTable(); }
    };
    document.getElementById('wo-pagination').querySelector('[data-page-next]').onclick = function () {
      var tp = Math.max(1, Math.ceil(filteredList().length / state.pageSize));
      if (state.page < tp) { state.page++; renderTable(); }
    };

    document.getElementById('wo-table-settings-btn').onclick = function (e) {
      var el = document.getElementById('wo-table-settings');
      if (!el.hidden) closeTableSettings();
      else openTableSettings(e.currentTarget);
    };

    document.getElementById('wo-save-view-btn').onclick = function (e) {
      var el = document.getElementById('wo-save-view-popover');
      if (!el.hidden) closeSaveView();
      else openSaveView(e.currentTarget);
    };

    document.getElementById('wo-add-btn').onclick = function () {
      window.location.href = 'work-order-form';
    };

    document.querySelectorAll('.work-view-tab[data-tab]').forEach(function (b) {
      b.onclick = function () { setTab(b.getAttribute('data-tab')); };
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#wo-filter-popover') && !e.target.closest('.work-orders-panel .expense-filter-pill')) closePop();
      if (!e.target.closest('#wo-table-settings') && !e.target.closest('#wo-table-settings-btn')) closeTableSettings();
      if (!e.target.closest('#wo-save-view-popover') && !e.target.closest('#wo-save-view-btn')) closeSaveView();
      if (!e.target.closest('.work-orders-panel [data-row-actions]')) closeAllRowMenus();
    });

    renderTable();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
