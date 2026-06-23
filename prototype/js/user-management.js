(function () {
  'use strict';

  var data = window.YSOAM_USER_MANAGEMENT;

  var state = {
    tab: 'all',
    search: '',
    page: 1,
    pageSize: 50,
    filters: {
      statuses: [],
      types: [],
      unconfirmed: false,
      groups: []
    }
  };

  var draft = null;
  var openFilter = null;

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function lucide(name, size) { return window.YSOAM_LUCIDE ? window.YSOAM_LUCIDE.icon(name, size || 16) : ''; }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }
  function dashCell() { return '<span class="um-cell-empty">—</span>'; }

  function rowActionIcon(key) {
    var icons = window.YSOAM_ICONS;
    return icons && icons[key] ? icons[key] : '';
  }

  function rowActionsMenu(row) {
    return '<div class="row-actions" data-row-actions="' + escA(row.id) + '">' +
      '<button type="button" class="row-actions__trigger" aria-label="More actions for ' + escA(row.name) + '" aria-haspopup="menu" aria-expanded="false">' +
        '<span class="row-actions__dots" aria-hidden="true"></span>' +
      '</button>' +
      '<div class="row-actions__menu" role="menu" hidden>' +
        '<button type="button" class="row-actions__item row-actions__item--btn" data-action="view" role="menuitem">View <span class="row-actions__item-icon">' + rowActionIcon('actionView') + '</span></button>' +
        '<button type="button" class="row-actions__item row-actions__item--btn" data-action="edit" role="menuitem">Edit <span class="row-actions__item-icon">' + rowActionIcon('actionEdit') + '</span></button>' +
        '<button type="button" class="row-actions__item row-actions__item--btn" data-action="archive" role="menuitem">Archive <span class="row-actions__item-icon">' + lucide('archive', 16) + '</span></button>' +
      '</div>' +
    '</div>';
  }

  function closeAllRowMenus() {
    document.querySelectorAll('.um-panel .row-actions__menu').forEach(function (m) {
      m.hidden = true;
      m.style.position = '';
      m.style.top = '';
      m.style.left = '';
      m.style.right = '';
      m.style.zIndex = '';
    });
    document.querySelectorAll('.um-panel .row-actions__trigger').forEach(function (b) {
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
    document.querySelectorAll('.um-panel .row-actions').forEach(function (wrap) {
      if (wrap.getAttribute('data-bound')) return;
      wrap.setAttribute('data-bound', '1');
      wrap.addEventListener('click', function (e) { e.stopPropagation(); });
    });

    document.querySelectorAll('.um-panel .row-actions__trigger').forEach(function (btn) {
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

    document.querySelectorAll('.um-panel [data-action="view"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        var rowId = btn.closest('[data-row-actions]').getAttribute('data-row-actions');
        var row = data.getById ? data.getById(rowId) : null;
        closeAllRowMenus();
        window.alert('View user: ' + (row ? row.name : rowId) + ' (prototype demo).');
      });
    });

    document.querySelectorAll('.um-panel [data-action="edit"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        var rowId = btn.closest('[data-row-actions]').getAttribute('data-row-actions');
        closeAllRowMenus();
        window.location.href = 'contact-form?from=user-management&id=' + encodeURIComponent(rowId);
      });
    });

    document.querySelectorAll('.um-panel [data-action="archive"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        var rowId = btn.closest('[data-row-actions]').getAttribute('data-row-actions');
        var row = data.getById ? data.getById(rowId) : null;
        closeAllRowMenus();
        if (window.confirm('Archive ' + (row ? row.name : 'this user') + '?')) {
          window.alert('User archived (prototype demo).');
        }
      });
    });
  }

  function filterCount() {
    var f = state.filters;
    var n = 0;
    if (f.statuses.length) n++;
    if (f.types.length) n++;
    if (f.unconfirmed) n++;
    if (f.groups.length) n++;
    return n;
  }

  function filteredList() {
    var q = state.search.trim().toLowerCase();
    var f = state.filters;
    return data.list.filter(function (row) {
      if (state.tab === 'users' && !row.hasUserAccess) return false;
      if (state.tab === 'no-access' && (row.hasUserAccess || row.archived)) return false;
      if (state.tab === 'archived' && !row.archived) return false;
      if (state.tab === 'all' && row.archived) return false;
      if (f.statuses.length && f.statuses.indexOf(row.userStatus) === -1) return false;
      if (f.types.length && f.types.indexOf(row.userType) === -1) return false;
      if (f.unconfirmed && !row.unconfirmedEmail) return false;
      if (f.groups.length && (!row.group || f.groups.indexOf(row.group) === -1)) return false;
      if (q) {
        var hay = [
          row.name, row.email, row.userRole, row.city, row.region,
          row.classifications && row.classifications.join(' '),
          row.assignedVehicles && row.assignedVehicles.join(' ')
        ].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function statusCell(statusId) {
    var s = data.statusById(statusId);
    return '<span class="um-status-cell">' +
      '<span class="um-status-dot" style="background:' + esc(s.color) + '" aria-hidden="true"></span>' +
      '<span>' + esc(s.label) + '</span>' +
    '</span>';
  }

  function typeCell(typeId) {
    var t = data.typeById(typeId);
    var icon = typeId === 'owner'
      ? '<span class="um-type-icon" data-lucide-icon="globe" data-lucide-icon-size="14" aria-hidden="true"></span>'
      : '';
    return '<span class="um-type-cell">' + icon + '<span>' + esc(t.label) + '</span></span>';
  }

  function nameCell(row, index) {
    var color = data.avatarColor(index);
    return '<div class="um-name-cell">' +
      '<span class="um-avatar" style="background:' + escA(color) + '" aria-hidden="true">' + esc(data.initials(row.name)) + '</span>' +
      '<a href="roadmap.html" class="table-cell-link">' + esc(row.name) + '</a>' +
    '</div>';
  }

  function listCell(items) {
    if (!items || !items.length) return dashCell();
    return esc(items.join(', '));
  }

  function vehiclesCell(vehicles) {
    if (!vehicles || !vehicles.length) return dashCell();
    return vehicles.map(function (id) {
      return '<a href="vehicles?id=' + escA(id) + '" class="table-cell-link">' + esc(id) + '</a>';
    }).join(', ');
  }

  function groupCell(groupId) {
    if (!groupId) return dashCell();
    var g = data.groupById(groupId);
    return g ? esc(g.label) : esc(groupId);
  }

  function renderTable() {
    var root = document.getElementById('user-management-table');
    var countEl = document.getElementById('um-count');
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

    var html = '<table class="data-table data-table--list data-table--user-management"><thead><tr>' +
      '<th class="data-table__check-col"><input type="checkbox" aria-label="Select all"></th>' +
      '<th class="um-col-name um-col-sortable"><span class="um-th-sort">Name <span data-lucide-icon="chevronUp" data-lucide-icon-size="14" aria-hidden="true"></span></span></th>' +
      '<th class="um-col-email">Email</th>' +
      '<th class="um-col-status">User Status</th>' +
      '<th class="um-col-type">User Type</th>' +
      '<th class="um-col-role">User Role</th>' +
      '<th class="um-col-login">Login Count</th>' +
      '<th class="um-col-class">Classifications</th>' +
      '<th class="um-col-group">Group</th>' +
      '<th class="um-col-vehicles">Assigned Vehicles</th>' +
      '<th class="data-table__actions-col" aria-label="Actions"></th>' +
      '</tr></thead><tbody>';

    if (!rows.length) {
      html += '<tr><td colspan="11" class="service-history-empty">No users match your filters.</td></tr>';
    } else {
      rows.forEach(function (row, idx) {
        html += '<tr>' +
          '<td class="data-table__check-col"><input type="checkbox" aria-label="Select row"></td>' +
          '<td class="um-col-name">' + nameCell(row, start + idx) + '</td>' +
          '<td class="um-col-email"><a href="mailto:' + escA(row.email) + '" class="table-cell-link">' + esc(row.email) + '</a></td>' +
          '<td class="um-col-status">' + statusCell(row.userStatus) + '</td>' +
          '<td class="um-col-type">' + typeCell(row.userType) + '</td>' +
          '<td class="um-col-role">' + (row.userRole ? esc(row.userRole) : dashCell()) + '</td>' +
          '<td class="um-col-login tabular-nums">' + (row.loginCount ? esc(String(row.loginCount)) : dashCell()) + '</td>' +
          '<td class="um-col-class">' + listCell(row.classifications) + '</td>' +
          '<td class="um-col-group">' + groupCell(row.group) + '</td>' +
          '<td class="um-col-vehicles">' + vehiclesCell(row.assignedVehicles) + '</td>' +
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
    document.querySelectorAll('.um-panel .expense-filter-pill').forEach(function (btn) {
      var k = btn.getAttribute('data-filter');
      var on = (k === 'status' && f.statuses.length) ||
        (k === 'type' && f.types.length) ||
        (k === 'unconfirmed' && f.unconfirmed) ||
        (k === 'group' && f.groups.length);
      btn.classList.toggle('has-filter', !!on);
    });
    var btn = document.getElementById('um-filters-btn');
    var lbl = document.getElementById('um-filters-btn-label');
    if (btn) {
      var n = filterCount();
      var open = document.getElementById('um-filters-drawer').classList.contains('is-open');
      btn.classList.toggle('is-active', n > 0 || open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (lbl) lbl.textContent = n > 0 ? n + ' Filter' + (n === 1 ? '' : 's') : 'Filters';
    }
  }

  function closePop() {
    closeAllRowMenus();
    var p = document.getElementById('um-filter-popover');
    if (p) p.hidden = true;
    document.querySelectorAll('.um-panel .expense-filter-pill').forEach(function (b) {
      b.classList.remove('is-open');
      b.setAttribute('aria-expanded', 'false');
    });
    openFilter = null;
    draft = null;
  }

  function positionPop(anchor, pop) {
    var panel = document.querySelector('.um-panel');
    if (!panel) return;
    var pr = panel.getBoundingClientRect();
    var r = anchor.getBoundingClientRect();
    pop.style.top = (r.bottom - pr.top + 6) + 'px';
    var w = pop.offsetWidth || 360;
    pop.style.left = Math.max(8, Math.min(r.left - pr.left, pr.width - w - 8)) + 'px';
  }

  function statusPopover(selected) {
    var list = data.userStatuses.map(function (s) {
      var checked = selected.indexOf(s.id) !== -1;
      return '<label class="meter-select-item meter-select-item--status">' +
        '<input type="checkbox" value="' + escA(s.id) + '"' + (checked ? ' checked' : '') + '>' +
        '<span class="um-status-dot" style="background:' + esc(s.color) + '" aria-hidden="true"></span>' +
        '<span>' + esc(s.label) + '</span></label>';
    }).join('');
    return popoverShell(list);
  }

  function typePopover(selected) {
    var list = data.userTypes.map(function (t) {
      var checked = selected.indexOf(t.id) !== -1;
      return '<label class="meter-select-item"><input type="checkbox" value="' + escA(t.id) + '"' +
        (checked ? ' checked' : '') + '><span>' + esc(t.label) + '</span></label>';
    }).join('');
    return popoverShell(list);
  }

  function unconfirmedPopover(checked) {
    var list = '<label class="meter-select-item"><input type="checkbox" value="1"' + (checked ? ' checked' : '') + '>' +
      '<span>Has Unconfirmed Email</span></label>';
    return popoverShell(list);
  }

  function groupPopover(selected) {
    var list = data.groups.map(function (g) {
      var checked = selected.indexOf(g.id) !== -1;
      return '<label class="meter-select-item meter-select-item--group">' +
        '<input type="checkbox" value="' + escA(g.id) + '"' + (checked ? ' checked' : '') + '>' +
        '<span class="um-group-item"><span>' + esc(g.label) + '</span>' +
        (g.sample ? '<span class="fh-sample-badge">Sample</span>' : '') +
        '</span></label>';
    }).join('');
    return popoverShell(list);
  }

  function popoverShell(listHtml) {
    return '<div class="meter-popover meter-popover--select"><div class="meter-popover__search"><span data-lucide-icon="search" aria-hidden="true"></span>' +
      '<input type="search" class="meter-popover__search-input" placeholder="Select item(s)" data-select-search></div>' +
      '<div class="meter-popover__list" data-select-list>' + listHtml + '</div>' +
      '<div class="meter-popover__footer"><div class="meter-popover__footer-right">' +
      '<button type="button" class="btn btn-text btn-sm" data-popover-cancel>Cancel</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-popover-apply>Apply</button></div></div></div>';
  }

  function bindPop(kind) {
    var pop = document.getElementById('um-filter-popover');
    pop.querySelector('[data-popover-cancel]').onclick = closePop;
    pop.querySelector('[data-popover-apply]').onclick = function () {
      if (kind === 'status') {
        state.filters.statuses = Array.prototype.map.call(pop.querySelectorAll('[data-select-list] input:checked'), function (el) { return el.value; });
      } else if (kind === 'type') {
        state.filters.types = Array.prototype.map.call(pop.querySelectorAll('[data-select-list] input:checked'), function (el) { return el.value; });
      } else if (kind === 'unconfirmed') {
        state.filters.unconfirmed = !!pop.querySelector('[data-select-list] input:checked');
      } else if (kind === 'group') {
        state.filters.groups = Array.prototype.map.call(pop.querySelectorAll('[data-select-list] input:checked'), function (el) { return el.value; });
      }
      closePop();
      state.page = 1;
      renderTable();
      if (document.getElementById('um-filters-drawer').classList.contains('is-open')) renderDrawer();
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
    var pop = document.getElementById('um-filter-popover');
    openFilter = kind;
    var html = '';
    if (kind === 'status') {
      draft = state.filters.statuses.slice();
      html = statusPopover(draft);
    } else if (kind === 'type') {
      draft = state.filters.types.slice();
      html = typePopover(draft);
    } else if (kind === 'unconfirmed') {
      draft = state.filters.unconfirmed;
      html = unconfirmedPopover(draft);
    } else if (kind === 'group') {
      draft = state.filters.groups.slice();
      html = groupPopover(draft);
    }
    pop.innerHTML = html;
    pop.hidden = false;
    anchor.classList.add('is-open');
    anchor.setAttribute('aria-expanded', 'true');
    positionPop(anchor, pop);
    bindPop(kind);
    initLucide(pop);
  }

  function closeDrawer() {
    document.getElementById('um-filters-drawer').classList.remove('is-open');
    updatePills();
  }

  function openDrawer() {
    closePop();
    document.getElementById('um-filters-drawer').classList.add('is-open');
    renderDrawer();
    updatePills();
  }

  function renderDrawer() {
    var body = document.getElementById('um-filters-drawer-body');
    var f = state.filters;
    var applied = '';
    if (f.statuses.length) applied += '<div class="expense-drawer-applied"><span>User Status</span><span>' + f.statuses.length + ' selected</span><button type="button" data-clear="status"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    if (f.types.length) applied += '<div class="expense-drawer-applied"><span>User Type</span><span>' + f.types.length + ' selected</span><button type="button" data-clear="type"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    if (f.unconfirmed) applied += '<div class="expense-drawer-applied"><span>Unconfirmed Email</span><span>Has Unconfirmed Email</span><button type="button" data-clear="unconfirmed"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    if (f.groups.length) applied += '<div class="expense-drawer-applied"><span>Group</span><span>' + f.groups.length + ' selected</span><button type="button" data-clear="group"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';

    body.innerHTML = (filterCount() ? applied : '<p class="expense-drawer-empty">No filters applied.</p>') +
      '<button type="button" class="btn btn-primary btn-sm expense-drawer-add" id="um-drawer-add">Add Filter <span data-lucide-icon="chevronDown" data-lucide-icon-size="14" aria-hidden="true"></span></button>' +
      '<div class="expense-drawer-popular"><h3>Popular Filters</h3><ul class="expense-drawer-popular__list">' +
      data.popularFilters.map(function (p) {
        var openId = p.id === 'role' ? 'type' : p.id === 'unconfirmed' ? 'unconfirmed' : p.id === 'classification' ? 'status' : p.id === 'group' ? 'group' : 'status';
        return '<li><button type="button" class="expense-drawer-popular__link" data-open="' + openId + '">' + esc(p.label) + '</button></li>';
      }).join('') +
      '</ul></div>';

    body.querySelectorAll('[data-clear]').forEach(function (b) {
      b.onclick = function () {
        var k = b.getAttribute('data-clear');
        if (k === 'status') state.filters.statuses = [];
        else if (k === 'type') state.filters.types = [];
        else if (k === 'unconfirmed') state.filters.unconfirmed = false;
        else if (k === 'group') state.filters.groups = [];
        state.page = 1;
        renderTable();
      };
    });
    body.querySelectorAll('[data-open]').forEach(function (b) {
      b.onclick = function () {
        var pill = document.querySelector('.um-panel .expense-filter-pill[data-filter="' + b.getAttribute('data-open') + '"]');
        if (pill) openPop(b.getAttribute('data-open'), pill);
      };
    });
    document.getElementById('um-drawer-add').onclick = function () {
      var pill = document.querySelector('.um-panel .expense-filter-pill[data-filter="status"]');
      if (pill) openPop('status', pill);
    };
    initLucide(body);
  }

  function closeTableSettings() {
    var el = document.getElementById('um-table-settings');
    if (el) el.hidden = true;
  }

  function openTableSettings(anchor) {
    closePop();
    var el = document.getElementById('um-table-settings');
    el.innerHTML = '<div class="meter-table-settings__section"><a href="#" class="meter-table-settings__manage">Manage Columns</a></div>' +
      '<div class="meter-table-settings__section"><div class="meter-table-settings__title">Items Per Page</div>' +
      [50, 100, 200].map(function (n) {
        return '<label class="meter-settings-option"><input type="radio" name="um-page-size" value="' + n + '"' + (state.pageSize === n ? ' checked' : '') + '> ' + n + '</label>';
      }).join('') + '</div>';
    el.hidden = false;
    positionPop(anchor, el);
    el.querySelectorAll('input[name="um-page-size"]').forEach(function (r) {
      r.onchange = function () { state.pageSize = parseInt(r.value, 10); state.page = 1; renderTable(); };
    });
  }

  function initTabs() {
    document.querySelectorAll('[data-um-tab]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('[data-um-tab]').forEach(function (t) {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');
        state.tab = tab.getAttribute('data-um-tab');
        state.page = 1;
        renderTable();
      });
    });
  }

  function init() {
    if (document.body.getAttribute('data-subpage') !== 'user-management') return;
    initLucide();
    initTabs();

    document.getElementById('um-search').oninput = function (e) {
      state.search = e.target.value;
      state.page = 1;
      renderTable();
    };

    document.querySelectorAll('.um-panel .expense-filter-pill').forEach(function (btn) {
      btn.onclick = function () {
        var k = btn.getAttribute('data-filter');
        if (openFilter === k && !document.getElementById('um-filter-popover').hidden) closePop();
        else openPop(k, btn);
      };
    });

    document.getElementById('um-filters-btn').onclick = function () {
      if (document.getElementById('um-filters-drawer').classList.contains('is-open')) closeDrawer();
      else openDrawer();
    };
    document.getElementById('um-filters-drawer-close').onclick = closeDrawer;

    document.getElementById('um-pagination').querySelector('[data-page-prev]').onclick = function () {
      if (state.page > 1) { state.page--; renderTable(); }
    };
    document.getElementById('um-pagination').querySelector('[data-page-next]').onclick = function () {
      var tp = Math.max(1, Math.ceil(filteredList().length / state.pageSize));
      if (state.page < tp) { state.page++; renderTable(); }
    };

    document.getElementById('um-table-settings-btn').onclick = function (e) {
      var el = document.getElementById('um-table-settings');
      if (!el.hidden) closeTableSettings();
      else openTableSettings(e.currentTarget);
    };

    document.getElementById('um-add-btn').onclick = function () {
      window.location.href = 'contact-form?from=user-management';
    };

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#um-filter-popover') && !e.target.closest('.um-panel .expense-filter-pill')) closePop();
      if (!e.target.closest('#um-table-settings') && !e.target.closest('#um-table-settings-btn')) closeTableSettings();
      if (!e.target.closest('.um-panel [data-row-actions]')) closeAllRowMenus();
    });

    renderTable();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
