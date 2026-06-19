(function () {
  'use strict';

  var data = window.YSOAM_SERVICE_HISTORY;
  var vehicles = window.YSOAM_VEHICLES;

  var WATCHERS = [
    { id: 'demo-manager', label: 'Demo Manager', initials: 'DM' },
    { id: 'fleet-admin', label: 'Fleet Admin', initials: 'FA' }
  ];

  var POPULAR_FILTERS = [
    { id: 'labels', label: 'Service Entry Labels' },
    { id: 'priority', label: 'Service Entry Repair Priority Class' },
    { id: 'vehicle', label: 'Vehicle' },
    { id: 'group', label: 'Vehicle Group' }
  ];

  var state = {
    search: '',
    page: 1,
    pageSize: 50,
    filters: {
      vehicles: [],
      groups: [],
      tasks: [],
      watchers: []
    }
  };

  var draft = null;
  var openFilter = null;

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, '&quot;');
  }

  function statusLabel(status) {
    var map = {
      active: 'Active', transit: 'In Transit', idle: 'Idle',
      offline: 'Offline', maintenance: 'Maintenance'
    };
    return map[status] || status;
  }

  function statusColor(status) {
    var fleet = window.YSOAM_FLEET;
    var colors = fleet && fleet.statusColors ? fleet.statusColors : {};
    return colors[status] || '#64748B';
  }

  function vehicleMeta(v) {
    return statusLabel(v.status) + ' · ' + v.type + ' · ' + v.group;
  }

  function findVehicle(id) {
    if (!vehicles || !vehicles.list) return null;
    return vehicles.list.find(function (v) { return v.id === id; }) || null;
  }

  function watcherIdForRow(row) {
    if (!row.watchers) return null;
    var match = WATCHERS.find(function (w) { return w.label === row.watchers; });
    return match ? match.id : null;
  }

  function activeFilterCount() {
    var f = state.filters;
    var n = 0;
    if (f.vehicles.length) n += 1;
    if (f.groups.length) n += 1;
    if (f.tasks.length) n += 1;
    if (f.watchers.length) n += 1;
    return n;
  }

  function filteredList() {
    var q = state.search.trim().toLowerCase();
    var f = state.filters;
    return data.list.filter(function (row) {
      var v = findVehicle(row.vehicleId);
      if (f.vehicles.length && f.vehicles.indexOf(row.vehicleId) === -1) return false;
      if (f.groups.length && (!v || f.groups.indexOf(v.group) === -1)) return false;
      if (f.tasks.length) {
        var hasTask = row.tasks.some(function (t) { return f.tasks.indexOf(t) !== -1; });
        if (!hasTask) return false;
      }
      if (f.watchers.length) {
        var wid = watcherIdForRow(row);
        if (!wid || f.watchers.indexOf(wid) === -1) return false;
      }
      if (q) {
        var hay = [
          row.vehicleId,
          v && v.name,
          v && v.group,
          row.workOrder,
          row.vendor,
          row.tasks.join(' '),
          row.priority.label,
          row.licensePlate
        ].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function updateFilterPills() {
    var f = state.filters;
    document.querySelectorAll('.service-history-panel .expense-filter-pill').forEach(function (btn) {
      var key = btn.getAttribute('data-filter');
      var on = false;
      if (key === 'vehicle') on = f.vehicles.length > 0;
      else if (key === 'group') on = f.groups.length > 0;
      else if (key === 'task') on = f.tasks.length > 0;
      else if (key === 'watcher') on = f.watchers.length > 0;
      btn.classList.toggle('has-filter', on);
    });
    var filtersBtn = document.getElementById('service-filters-btn');
    var labelEl = document.getElementById('service-filters-btn-label');
    if (filtersBtn) {
      var n = activeFilterCount();
      var drawerOpen = isDrawerOpen();
      filtersBtn.classList.toggle('is-active', n > 0 || drawerOpen);
      filtersBtn.setAttribute('aria-expanded', drawerOpen ? 'true' : 'false');
      if (labelEl) {
        labelEl.textContent = n > 0 ? (n + ' Filter' + (n === 1 ? '' : 's')) : 'Filters';
      }
    }
  }

  function rowActionIcon(key) {
    var icons = window.YSOAM_ICONS;
    return icons && icons[key] ? icons[key] : '';
  }

  function rowActionsMenu(row) {
    var viewUrl = 'service-detail?id=' + encodeURIComponent(row.id);
    return (
      '<div class="row-actions" data-row-actions="' + escapeAttr(row.id) + '">' +
        '<button type="button" class="row-actions__trigger" aria-label="More actions for ' + escapeAttr(row.workOrder) + '" aria-haspopup="menu" aria-expanded="false">' +
          '<span class="row-actions__dots" aria-hidden="true"></span>' +
        '</button>' +
        '<div class="row-actions__menu row-actions__menu--wide" role="menu" hidden>' +
          '<a class="row-actions__item" href="' + viewUrl + '" role="menuitem">View <span class="row-actions__item-icon">' + rowActionIcon('actionView') + '</span></a>' +
          '<span class="row-actions__item row-actions__item--disabled" role="menuitem" aria-disabled="true">Edit <span class="row-actions__item-icon">' + rowActionIcon('actionLock') + '</span></span>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="print-pdf" role="menuitem">Print PDF <span class="row-actions__item-icon">' + rowActionIcon('actionPrint') + '</span></button>' +
          '<span class="row-actions__item row-actions__item--disabled" role="menuitem" aria-disabled="true">Delete <span class="row-actions__item-icon">' + rowActionIcon('actionLock') + '</span></span>' +
        '</div>' +
      '</div>'
    );
  }

  function closeAllRowMenus() {
    document.querySelectorAll('.service-history-panel .row-actions__menu').forEach(function (m) {
      m.hidden = true;
      m.style.position = '';
      m.style.top = '';
      m.style.left = '';
      m.style.right = '';
    });
    document.querySelectorAll('.service-history-panel .row-actions__trigger').forEach(function (b) {
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
    document.querySelectorAll('.service-history-panel .row-actions').forEach(function (wrap) {
      if (wrap.getAttribute('data-bound')) return;
      wrap.setAttribute('data-bound', '1');
      wrap.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    });

    document.querySelectorAll('.service-history-panel .row-actions__trigger').forEach(function (btn) {
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

    document.querySelectorAll('.service-history-panel [data-action="print-pdf"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        closeAllRowMenus();
        window.alert('Print PDF (prototype demo).');
      });
    });
  }

  function formatTotal(amount) {
    return '₹ ' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function tasksCell(tasks) {
    if (!tasks.length) return '—';
    var visible = tasks.slice(0, 2);
    var html = visible.map(function (t) {
      return '<a href="#" class="table-cell-link">' + escapeHtml(t) + '</a>';
    }).join('');
    if (tasks.length > 2) {
      html += '<a href="#" class="service-tasks-more">+' + (tasks.length - 2) + ' more</a>';
    }
    return '<div class="data-table__task-cell">' + html + '</div>';
  }

  function vehicleCell(row) {
    var v = findVehicle(row.vehicleId);
    if (!v) return escapeHtml(row.vehicleId);
    var sample = row.isSample ? '<span class="service-sample-tag">Sample</span>' : '';
    return (
      '<div class="service-vehicle-cell">' +
        '<img class="service-vehicle-thumb" src="' + escapeHtml(v.image) + '" alt="">' +
        '<div class="service-vehicle-info">' +
          '<a href="vehicle-detail?id=' + encodeURIComponent(v.id) + '#service-history" class="service-vehicle-link">' + escapeHtml(v.name) + '</a>' +
          sample +
        '</div>' +
      '</div>'
    );
  }

  function renderTable() {
    var root = document.getElementById('service-history-table');
    var countEl = document.getElementById('service-count');
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

    var html = '<table class="data-table data-table--list data-table--service-history">' +
      '<thead><tr>' +
        '<th class="data-table__check-col"><input type="checkbox" aria-label="Select all"></th>' +
        '<th>Vehicle</th>' +
        '<th>Actual Completion Date ↓</th>' +
        '<th>License Plate</th>' +
        '<th>Summary</th>' +
        '<th>Assessment</th>' +
        '<th>Watchers</th>' +
        '<th>Repair Priority Class</th>' +
        '<th>Meter</th>' +
        '<th>Service Tasks</th>' +
        '<th>Issues</th>' +
        '<th>Vendor</th>' +
        '<th>Total</th>' +
        '<th>Work Order</th>' +
        '<th>Labels</th>' +
        '<th class="data-table__actions-col" aria-label="Actions"></th>' +
      '</tr></thead><tbody>';

    if (!rows.length) {
      html += '<tr><td colspan="16" class="service-history-empty">No service entries found</td></tr>';
    } else {
      rows.forEach(function (row) {
        html += '<tr>' +
          '<td class="data-table__check-col"><input type="checkbox" aria-label="Select entry"></td>' +
          '<td>' + vehicleCell(row) + '</td>' +
          '<td class="tabular-nums service-date-cell">' + escapeHtml(data.formatDateTime(new Date(row.completedAt))) + '</td>' +
          '<td>' + (row.licensePlate ? escapeHtml(row.licensePlate) : '—') + '</td>' +
          '<td>' + (row.summary || '—') + '</td>' +
          '<td>' + (row.assessment || '—') + '</td>' +
          '<td>' + (row.watchers || '—') + '</td>' +
          '<td><span class="data-table__status-dot" style="background:' + row.priority.dot + '"></span>' + escapeHtml(row.priority.label) + '</td>' +
          '<td class="tabular-nums">' + escapeHtml(row.meter) + '</td>' +
          '<td>' + tasksCell(row.tasks) + '</td>' +
          '<td>' + (row.issues || '—') + '</td>' +
          '<td>' + (row.vendor ? escapeHtml(row.vendor) : '—') + '</td>' +
          '<td class="tabular-nums service-total-cell">' + formatTotal(row.total) + '</td>' +
          '<td><span class="data-table__status-dot" style="background:#16A34A"></span><a href="service-detail?id=' + encodeURIComponent(row.id) + '" class="table-cell-link">' + escapeHtml(row.workOrder) + '</a></td>' +
          '<td>' + (row.labels || '—') + '</td>' +
          '<td class="data-table__actions-col">' + rowActionsMenu(row) + '</td>' +
        '</tr>';
      });
    }

    html += '</tbody></table>';
    root.innerHTML = html;
    bindRowActions();
    updateFilterPills();
  }

  /* ── Popovers ─────────────────────────────────────────────── */
  function closePopover() {
    var pop = document.getElementById('service-filter-popover');
    if (pop) pop.hidden = true;
    document.querySelectorAll('.service-history-panel .expense-filter-pill').forEach(function (b) {
      b.setAttribute('aria-expanded', 'false');
      b.classList.remove('is-open');
    });
    openFilter = null;
    draft = null;
  }

  function positionPopover(anchor, pop) {
    var panel = document.querySelector('.service-history-panel');
    if (!panel) return;
    var panelRect = panel.getBoundingClientRect();
    var rect = anchor.getBoundingClientRect();
    var top = rect.bottom - panelRect.top + 6;
    var left = rect.left - panelRect.left;
    var popWidth = pop.offsetWidth || (openFilter === 'task' ? 420 : 340);
    var maxLeft = panelRect.width - popWidth - 8;
    pop.style.top = Math.max(0, top) + 'px';
    pop.style.left = Math.max(8, Math.min(left, maxLeft)) + 'px';
  }

  function renderSelectPopover(kind, selected) {
    var list = '';
    if (kind === 'vehicle') {
      list = (vehicles.list || []).filter(function (v) { return v.assignment !== 'archived'; }).map(function (v) {
        var checked = selected.indexOf(v.id) !== -1;
        var dot = statusColor(v.status);
        return (
          '<label class="meter-select-item meter-select-item--vehicle">' +
            '<input type="checkbox" value="' + escapeAttr(v.id) + '"' + (checked ? ' checked' : '') + '>' +
            '<img class="meter-select-item__thumb" src="' + escapeAttr(v.image) + '" alt="">' +
            '<span class="meter-select-item__status" style="background:' + dot + '"></span>' +
            '<span class="meter-select-item__text"><strong>' + escapeHtml(v.name) + '</strong>' +
            '<span>' + escapeHtml(vehicleMeta(v)) + '</span></span></label>'
        );
      }).join('');
    } else if (kind === 'group') {
      var groups = data.groups();
      list = groups.map(function (g, i) {
        var checked = selected.indexOf(g) !== -1;
        var sample = i < 2 ? ' <span class="service-sample-tag">Sample</span>' : '';
        return (
          '<label class="meter-select-item">' +
            '<input type="checkbox" value="' + escapeAttr(g) + '"' + (checked ? ' checked' : '') + '>' +
            '<span>' + escapeHtml(g) + sample + '</span></label>'
        );
      }).join('');
    } else if (kind === 'task') {
      list = data.tasks.map(function (t) {
        var checked = selected.indexOf(t) !== -1;
        return (
          '<label class="meter-select-item">' +
            '<input type="checkbox" value="' + escapeAttr(t) + '"' + (checked ? ' checked' : '') + '>' +
            '<span>' + escapeHtml(t) + '</span></label>'
        );
      }).join('');
    } else if (kind === 'watcher') {
      list = '<div class="meter-drawer-field-menu__header">CURRENT USER</div>' +
        WATCHERS.map(function (w) {
          var checked = selected.indexOf(w.id) !== -1;
          return (
            '<label class="meter-select-item meter-select-item--watcher">' +
              '<input type="checkbox" value="' + escapeAttr(w.id) + '"' + (checked ? ' checked' : '') + '>' +
              '<span class="expense-watcher-avatar">' + escapeHtml(w.initials) + '</span>' +
              '<span>' + escapeHtml(w.label) + '</span></label>'
          );
        }).join('');
    }

    var popClass = kind === 'task' ? 'meter-popover meter-popover--select meter-popover--tasks' : 'meter-popover meter-popover--select';

    return (
      '<div class="' + popClass + '">' +
        '<div class="meter-popover__search"><span aria-hidden="true">⌕</span>' +
          '<input type="search" class="meter-popover__search-input" placeholder="Select item(s)" data-select-search></div>' +
        '<div class="meter-popover__list" data-select-list>' + list + '</div>' +
        '<div class="meter-popover__footer"><div class="meter-popover__footer-right">' +
          '<button type="button" class="btn btn-text btn-sm" data-popover-cancel>Cancel</button>' +
          '<button type="button" class="btn btn-primary btn-sm" data-popover-apply>Apply</button>' +
        '</div></div></div>'
    );
  }

  function getCheckedValues(pop) {
    return Array.prototype.map.call(pop.querySelectorAll('[data-select-list] input:checked'), function (el) {
      return el.value;
    });
  }

  function bindSelectSearch(pop) {
    var input = pop.querySelector('[data-select-search]');
    var list = pop.querySelector('[data-select-list]');
    if (!input || !list) return;
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      list.querySelectorAll('.meter-select-item').forEach(function (item) {
        item.hidden = q && item.textContent.toLowerCase().indexOf(q) === -1;
      });
    });
  }

  function bindPopoverEvents(kind) {
    var pop = document.getElementById('service-filter-popover');
    if (!pop) return;

    pop.querySelector('[data-popover-cancel]') && pop.querySelector('[data-popover-cancel]').addEventListener('click', closePopover);
    pop.querySelector('[data-popover-apply]') && pop.querySelector('[data-popover-apply]').addEventListener('click', function () {
      var values = getCheckedValues(pop);
      if (kind === 'vehicle') state.filters.vehicles = values;
      else if (kind === 'group') state.filters.groups = values;
      else if (kind === 'task') state.filters.tasks = values;
      else if (kind === 'watcher') state.filters.watchers = values;
      closePopover();
      state.page = 1;
      renderTable();
      if (isDrawerOpen()) renderDrawerBody();
    });

    bindSelectSearch(pop);
  }

  function openFilterPopover(kind, anchor) {
    var pop = document.getElementById('service-filter-popover');
    if (!pop) return;
    closeDrawer();
    openFilter = kind;
    if (kind === 'vehicle') draft = state.filters.vehicles.slice();
    else if (kind === 'group') draft = state.filters.groups.slice();
    else if (kind === 'task') draft = state.filters.tasks.slice();
    else if (kind === 'watcher') draft = state.filters.watchers.slice();
    pop.innerHTML = renderSelectPopover(kind, draft);
    pop.hidden = false;
    anchor.setAttribute('aria-expanded', 'true');
    anchor.classList.add('is-open');
    positionPopover(anchor, pop);
    bindPopoverEvents(kind);
    var searchInput = pop.querySelector('[data-select-search]');
    if (searchInput) searchInput.focus();
  }

  /* ── Filters drawer ──────────────────────────────────────── */
  function isDrawerOpen() {
    var drawer = document.getElementById('service-filters-drawer');
    return drawer && drawer.classList.contains('is-open');
  }

  function openDrawer() {
    closePopover();
    var drawer = document.getElementById('service-filters-drawer');
    if (drawer) {
      drawer.classList.add('is-open');
      renderDrawerBody();
      updateFilterPills();
    }
  }

  function closeDrawer() {
    var drawer = document.getElementById('service-filters-drawer');
    if (drawer) drawer.classList.remove('is-open');
    updateFilterPills();
  }

  function renderDrawerBody() {
    var body = document.getElementById('service-filters-drawer-body');
    if (!body) return;
    var f = state.filters;
    var count = activeFilterCount();
    var applied = '';

    if (f.vehicles.length) {
      applied += '<div class="expense-drawer-applied"><span>Vehicle</span><span>' + f.vehicles.length + ' selected</span>' +
        '<button type="button" data-clear-filter="vehicle" aria-label="Remove">×</button></div>';
    }
    if (f.groups.length) {
      applied += '<div class="expense-drawer-applied"><span>Vehicle Group</span><span>' + escapeHtml(f.groups.join(', ')) + '</span>' +
        '<button type="button" data-clear-filter="group">×</button></div>';
    }
    if (f.tasks.length) {
      applied += '<div class="expense-drawer-applied"><span>Service Tasks</span><span>' + f.tasks.length + ' selected</span>' +
        '<button type="button" data-clear-filter="task">×</button></div>';
    }
    if (f.watchers.length) {
      var labels = f.watchers.map(function (id) {
        var w = WATCHERS.find(function (x) { return x.id === id; });
        return w ? w.label : id;
      });
      applied += '<div class="expense-drawer-applied"><span>Watcher</span><span>' + escapeHtml(labels.join(', ')) + '</span>' +
        '<button type="button" data-clear-filter="watcher">×</button></div>';
    }

    body.innerHTML =
      (count ? applied : '<p class="expense-drawer-empty">No filters applied.</p>') +
      '<button type="button" class="btn btn-primary btn-sm expense-drawer-add" id="service-drawer-add">Add Filter <span aria-hidden="true">▾</span></button>' +
      '<div class="expense-drawer-popular">' +
        '<h3>Popular Filters</h3>' +
        '<ul class="expense-drawer-popular__list">' +
          POPULAR_FILTERS.map(function (p) {
            return '<li><button type="button" class="expense-drawer-popular__link" data-open-filter="' + p.id + '">' + escapeHtml(p.label) + '</button></li>';
          }).join('') +
        '</ul>' +
      '</div>';

    body.querySelectorAll('[data-clear-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-clear-filter');
        if (key === 'vehicle') state.filters.vehicles = [];
        else if (key === 'group') state.filters.groups = [];
        else if (key === 'task') state.filters.tasks = [];
        else if (key === 'watcher') state.filters.watchers = [];
        state.page = 1;
        renderTable();
      });
    });

    body.querySelectorAll('[data-open-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-open-filter');
        var pillMap = { vehicle: 'vehicle', group: 'group', labels: 'task', priority: 'task' };
        var pill = document.querySelector('.service-history-panel .expense-filter-pill[data-filter="' + (pillMap[id] || 'vehicle') + '"]');
        if (pill) openFilterPopover(pillMap[id] || id, pill);
      });
    });

    var addBtn = document.getElementById('service-drawer-add');
    if (addBtn) {
      addBtn.onclick = function () {
        var pill = document.querySelector('.service-history-panel .expense-filter-pill[data-filter="vehicle"]');
        if (pill) openFilterPopover('vehicle', pill);
      };
    }
  }

  function bindEvents() {
    var search = document.getElementById('service-search');
    if (search) {
      search.addEventListener('input', function () {
        state.search = search.value;
        state.page = 1;
        renderTable();
      });
    }

    document.querySelectorAll('.service-history-panel .expense-filter-pill').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var kind = btn.getAttribute('data-filter');
        if (openFilter === kind && !document.getElementById('service-filter-popover').hidden) {
          closePopover();
        } else {
          openFilterPopover(kind, btn);
        }
      });
    });

    var pageEl = document.getElementById('service-pagination');
    if (pageEl) {
      pageEl.querySelector('[data-page-prev]').addEventListener('click', function () {
        if (state.page > 1) {
          state.page -= 1;
          renderTable();
        }
      });
      pageEl.querySelector('[data-page-next]').addEventListener('click', function () {
        var totalPages = Math.max(1, Math.ceil(filteredList().length / state.pageSize));
        if (state.page < totalPages) {
          state.page += 1;
          renderTable();
        }
      });
    }

    var drawer = document.getElementById('service-filters-drawer');
    if (drawer && !drawer.getAttribute('data-bound')) {
      drawer.setAttribute('data-bound', '1');
      document.getElementById('service-filters-drawer-close') && document.getElementById('service-filters-drawer-close').addEventListener('click', closeDrawer);
      document.getElementById('service-filters-btn') && document.getElementById('service-filters-btn').addEventListener('click', function () {
        if (isDrawerOpen()) closeDrawer();
        else openDrawer();
      });
    }

    document.addEventListener('click', function (e) {
      var pop = document.getElementById('service-filter-popover');
      if (!pop || pop.hidden) return;
      if (pop.contains(e.target)) return;
      if (e.target.closest('.service-history-panel .expense-filter-pill')) return;
      closePopover();
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.service-history-panel [data-row-actions]')) {
        closeAllRowMenus();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closePopover();
        closeDrawer();
        closeAllRowMenus();
      }
    });

    window.addEventListener('scroll', function (e) {
      if (e.target && e.target.closest && e.target.closest('.data-table-wrap--service-history')) {
        closeAllRowMenus();
      }
    }, true);
  }

  function init() {
    if (document.body.getAttribute('data-subpage') !== 'service-history') return;
    var iconEl = document.getElementById('service-filters-btn-icon');
    if (iconEl && window.YSOAM_ICONS && window.YSOAM_ICONS.mapFilter) {
      iconEl.innerHTML = window.YSOAM_ICONS.mapFilter;
    }
    bindEvents();
    renderTable();

    document.getElementById('service-add-btn') && document.getElementById('service-add-btn').addEventListener('click', function () {
      window.location.href = 'service-entry-form';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
