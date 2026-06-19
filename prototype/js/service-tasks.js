(function () {
  'use strict';

  var data = window.YSOAM_SERVICE_TASKS;
  var POPULAR = [
    { id: 'category', label: 'Service Task Default Category Code', filter: 'category' },
    { id: 'system', label: 'Service Task Default System Code', filter: 'system' },
    { id: 'reminders', label: 'Has Service Reminders', filter: 'reminders' }
  ];

  var state = {
    tab: 'active',
    search: '',
    page: 1,
    pageSize: 50,
    filters: { types: [], categories: [], systems: [], reminders: null }
  };

  var draft = null;
  var openFilter = null;

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function lucide(name, size) { return window.YSOAM_LUCIDE ? window.YSOAM_LUCIDE.icon(name, size || 16) : ''; }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }

  function filterCount() {
    var f = state.filters, n = 0;
    if (f.types.length) n++;
    if (f.categories.length) n++;
    if (f.systems.length) n++;
    if (f.reminders !== null) n++;
    return n;
  }

  function filteredList() {
    var q = state.search.trim().toLowerCase();
    var f = state.filters;
    return data.list.filter(function (row) {
      if (state.tab === 'active' && row.archived) return false;
      if (state.tab === 'archived' && !row.archived) return false;
      if (f.types.length && f.types.indexOf(row.type) === -1) return false;
      if (f.categories.length && f.categories.indexOf(row.category.code) === -1) return false;
      if (f.systems.length && f.systems.indexOf(row.system.code) === -1) return false;
      if (f.reminders === 'yes' && row.serviceReminders === 0) return false;
      if (f.reminders === 'no' && row.serviceReminders > 0) return false;
      if (q) {
        var hay = [row.name, row.category.label, row.system.label, row.assembly.label].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function countLink(n) {
    return '<a href="#" class="table-cell-link st-count-link">' + n + '</a>';
  }

  function codeCell(label, code) {
    return '<div class="st-code-cell"><span class="st-code-cell__label">' + esc(label) + '</span><span class="st-code-cell__code tabular-nums">' + esc(code) + '</span></div>';
  }

  function rowActionsMenu(row) {
    var editUrl = row.type === 'custom'
      ? 'service-task-form?id=' + encodeURIComponent(row.id)
      : 'service-task-edit?id=' + encodeURIComponent(row.id);
    return (
      '<div class="row-actions" data-row-actions="' + escA(row.id) + '">' +
        '<button type="button" class="row-actions__trigger" aria-label="More actions for ' + escA(row.name) + '" aria-haspopup="menu" aria-expanded="false">' +
          lucide('moreHorizontal', 16) +
        '</button>' +
        '<div class="row-actions__menu row-actions__menu--wide" role="menu" hidden>' +
          '<a class="row-actions__item" href="' + editUrl + '" role="menuitem">Edit <span class="row-actions__item-icon">' + lucide('pencil') + '</span></a>' +
          '<span class="row-actions__item row-actions__item--disabled" role="menuitem" aria-disabled="true">Merge <span class="row-actions__item-icon">' + lucide('lock') + '</span></span>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="archive" role="menuitem">Archive <span class="row-actions__item-icon">' + lucide('archive') + '</span></button>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="history" role="menuitem">View Record History <span class="row-actions__item-icon">' + lucide('history') + '</span></button>' +
        '</div>' +
      '</div>'
    );
  }

  function closeAllRowMenus() {
    document.querySelectorAll('.service-tasks-panel .row-actions__menu').forEach(function (m) {
      m.hidden = true;
      m.style.position = '';
      m.style.top = '';
      m.style.left = '';
    });
    document.querySelectorAll('.service-tasks-panel .row-actions__trigger').forEach(function (b) {
      b.setAttribute('aria-expanded', 'false');
    });
  }

  function positionRowMenu(trigger, menu) {
    var rect = trigger.getBoundingClientRect();
    menu.hidden = false;
    menu.style.position = 'fixed';
    menu.style.top = (rect.bottom + 4) + 'px';
    menu.style.left = Math.max(8, rect.right - 220) + 'px';
    menu.style.zIndex = '120';
  }

  function bindRowActions() {
    document.querySelectorAll('.service-tasks-panel .row-actions').forEach(function (wrap) {
      if (wrap.getAttribute('data-bound')) return;
      wrap.setAttribute('data-bound', '1');
      wrap.addEventListener('click', function (e) { e.stopPropagation(); });
    });
    document.querySelectorAll('.service-tasks-panel .row-actions__trigger').forEach(function (btn) {
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
    document.querySelectorAll('.service-tasks-panel [data-action="archive"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () { closeAllRowMenus(); window.alert('Archive service task (prototype demo).'); });
    });
    document.querySelectorAll('.service-tasks-panel [data-action="history"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () { closeAllRowMenus(); window.alert('View record history (prototype demo).'); });
    });
  }

  function renderTable() {
    var root = document.getElementById('service-tasks-table');
    var countEl = document.getElementById('st-count');
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

    var html = '<table class="data-table data-table--list data-table--service-tasks"><thead><tr>' +
      '<th class="data-table__check-col"><input type="checkbox" aria-label="Select all"></th>' +
      '<th class="st-name-col">Name <span class="st-sort-icon" aria-hidden="true">' + lucide('chevronDown', 12) + '</span></th>' +
      '<th>Description</th><th>Service Entries</th><th>Service Reminders</th><th>Service Programs</th><th>Work Orders</th>' +
      '<th>Default Reason For Repair Code</th><th>Default Category Code</th><th>Default System Code</th>' +
      '<th class="data-table__actions-col" aria-label="Actions"></th></tr></thead><tbody>';

    if (!rows.length) {
      html += '<tr><td colspan="11" class="service-history-empty">No service tasks found</td></tr>';
    } else {
      rows.forEach(function (row) {
        var editUrl = row.type === 'custom'
          ? 'service-task-form?id=' + encodeURIComponent(row.id)
          : 'service-task-edit?id=' + encodeURIComponent(row.id);
        html += '<tr>' +
          '<td class="data-table__check-col"><input type="checkbox"></td>' +
          '<td class="st-name-col"><span class="st-name-cell">' +
            '<span class="st-name-cell__icon" aria-hidden="true">' + lucide('fileText', 14) + '</span>' +
            '<a href="' + editUrl + '" class="table-cell-link">' + esc(row.name) + '</a></span></td>' +
          '<td>' + (row.description ? esc(row.description) : '—') + '</td>' +
          '<td>' + countLink(row.serviceEntries) + '</td>' +
          '<td>' + countLink(row.serviceReminders) + '</td>' +
          '<td>' + countLink(row.servicePrograms) + '</td>' +
          '<td>' + countLink(row.workOrders) + '</td>' +
          '<td>' + (row.reasonCode ? esc(row.reasonCode.label) : '—') + '</td>' +
          '<td>' + codeCell(row.category.label, row.category.code) + '</td>' +
          '<td>' + codeCell(row.system.label, row.system.code) + '</td>' +
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
    document.querySelectorAll('.service-tasks-panel .expense-filter-pill').forEach(function (btn) {
      var k = btn.getAttribute('data-filter');
      var on = (k === 'type' && f.types.length) || (k === 'category' && f.categories.length) ||
        (k === 'system' && f.systems.length) || (k === 'reminders' && f.reminders !== null);
      btn.classList.toggle('has-filter', !!on);
    });
    var btn = document.getElementById('st-filters-btn');
    var lbl = document.getElementById('st-filters-btn-label');
    if (btn) {
      var n = filterCount();
      var open = document.getElementById('st-filters-drawer').classList.contains('is-open');
      btn.classList.toggle('is-active', n > 0 || open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (lbl) lbl.textContent = n > 0 ? n + ' Filter' + (n === 1 ? '' : 's') : 'Filters';
    }
  }

  function closePop() {
    var p = document.getElementById('st-filter-popover');
    if (p) p.hidden = true;
    document.querySelectorAll('.service-tasks-panel .expense-filter-pill').forEach(function (b) {
      b.classList.remove('is-open');
      b.setAttribute('aria-expanded', 'false');
    });
    openFilter = null;
    draft = null;
  }

  function positionPop(anchor, pop) {
    var panel = document.querySelector('.service-tasks-panel');
    if (!panel) return;
    var pr = panel.getBoundingClientRect();
    var r = anchor.getBoundingClientRect();
    pop.style.top = (r.bottom - pr.top + 6) + 'px';
    var w = pop.offsetWidth || 360;
    pop.style.left = Math.max(8, Math.min(r.left - pr.left, pr.width - w - 8)) + 'px';
  }

  function selectPopover(kind, selected) {
    var list = '';
    if (kind === 'type') {
      list = data.taskTypes.map(function (t) {
        var c = selected.indexOf(t.id) !== -1;
        return '<label class="meter-select-item"><input type="checkbox" value="' + escA(t.id) + '"' + (c ? ' checked' : '') + '><span>' + esc(t.label) + '</span></label>';
      }).join('');
    } else if (kind === 'category') {
      list = data.categories.map(function (c) {
        var checked = selected.indexOf(c.code) !== -1;
        return '<label class="meter-select-item"><input type="checkbox" value="' + escA(c.code) + '"' + (checked ? ' checked' : '') + '><span>' + esc(c.code + ' ' + c.label) + '</span></label>';
      }).join('');
    } else if (kind === 'system') {
      var allSystems = [];
      Object.keys(data.systems).forEach(function (k) {
        data.systems[k].forEach(function (s) { allSystems.push(s); });
      });
      list = allSystems.map(function (s) {
        var checked = selected.indexOf(s.code) !== -1;
        return '<label class="meter-select-item"><input type="checkbox" value="' + escA(s.code) + '"' + (checked ? ' checked' : '') + '><span>' + esc(s.code + ' ' + s.label) + '</span></label>';
      }).join('');
    } else if (kind === 'reminders') {
      return '<div class="meter-popover meter-popover--simple">' +
        '<div class="meter-popover__list st-reminder-filter">' +
        '<label class="meter-settings-option"><input type="radio" name="st-reminder" value="yes"' + (selected === 'yes' ? ' checked' : '') + '> Yes</label>' +
        '<label class="meter-settings-option"><input type="radio" name="st-reminder" value="no"' + (selected === 'no' ? ' checked' : '') + '> No</label>' +
        '</div>' +
        '<div class="meter-popover__footer"><div class="meter-popover__footer-right">' +
        '<button type="button" class="btn btn-text btn-sm" data-popover-cancel>Cancel</button>' +
        '<button type="button" class="btn btn-primary btn-sm" data-popover-apply>Apply</button></div></div></div>';
    }
    return '<div class="meter-popover meter-popover--select"><div class="meter-popover__search"><span data-lucide-icon="search" aria-hidden="true"></span>' +
      '<input type="search" class="meter-popover__search-input" placeholder="Select item(s)" data-select-search></div>' +
      '<div class="meter-popover__list" data-select-list>' + list + '</div>' +
      '<div class="meter-popover__footer"><div class="meter-popover__footer-right">' +
      '<button type="button" class="btn btn-text btn-sm" data-popover-cancel>Cancel</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-popover-apply>Apply</button></div></div></div>';
  }

  function bindPop(kind) {
    var pop = document.getElementById('st-filter-popover');
    pop.querySelector('[data-popover-cancel]').onclick = closePop;
    pop.querySelector('[data-popover-apply]').onclick = function () {
      if (kind === 'reminders') {
        var picked = pop.querySelector('input[name="st-reminder"]:checked');
        state.filters.reminders = picked ? picked.value : null;
      } else {
        var vals = Array.prototype.map.call(pop.querySelectorAll('[data-select-list] input:checked'), function (el) { return el.value; });
        if (kind === 'type') state.filters.types = vals;
        else if (kind === 'category') state.filters.categories = vals;
        else if (kind === 'system') state.filters.systems = vals;
      }
      closePop();
      state.page = 1;
      renderTable();
      if (document.getElementById('st-filters-drawer').classList.contains('is-open')) renderDrawer();
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
    var pop = document.getElementById('st-filter-popover');
    openFilter = kind;
    if (kind === 'type') draft = state.filters.types.slice();
    else if (kind === 'category') draft = state.filters.categories.slice();
    else if (kind === 'system') draft = state.filters.systems.slice();
    else draft = state.filters.reminders;
    pop.innerHTML = selectPopover(kind, draft);
    pop.hidden = false;
    anchor.classList.add('is-open');
    anchor.setAttribute('aria-expanded', 'true');
    positionPop(anchor, pop);
    bindPop(kind);
    initLucide(pop);
  }

  function closeDrawer() {
    document.getElementById('st-filters-drawer').classList.remove('is-open');
    updatePills();
  }

  function openDrawer() {
    closePop();
    document.getElementById('st-filters-drawer').classList.add('is-open');
    renderDrawer();
    updatePills();
  }

  function renderDrawer() {
    var body = document.getElementById('st-filters-drawer-body');
    var f = state.filters;
    var applied = '';
    if (f.types.length) applied += '<div class="expense-drawer-applied"><span>Service Task Type</span><span>' + esc(f.types.join(', ')) + '</span><button type="button" data-clear="type" aria-label="Remove"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    if (f.categories.length) applied += '<div class="expense-drawer-applied"><span>Category Code</span><span>' + f.categories.length + ' selected</span><button type="button" data-clear="category"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    if (f.systems.length) applied += '<div class="expense-drawer-applied"><span>System Code</span><span>' + f.systems.length + ' selected</span><button type="button" data-clear="system"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    if (f.reminders !== null) applied += '<div class="expense-drawer-applied"><span>Has Service Reminders</span><span>' + esc(f.reminders) + '</span><button type="button" data-clear="reminders"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    body.innerHTML = (filterCount() ? applied : '<p class="expense-drawer-empty">No filters applied.</p>') +
      '<button type="button" class="btn btn-primary btn-sm expense-drawer-add" id="st-drawer-add">Add Filter <span data-lucide-icon="chevronDown" data-lucide-icon-size="14" aria-hidden="true"></span></button>' +
      '<div class="expense-drawer-popular"><h3>Popular Filters</h3><ul class="expense-drawer-popular__list">' +
      POPULAR.map(function (p) { return '<li><button type="button" class="expense-drawer-popular__link" data-open="' + p.filter + '">' + esc(p.label) + '</button></li>'; }).join('') +
      '</ul></div>';
    body.querySelectorAll('[data-clear]').forEach(function (b) {
      b.onclick = function () {
        var k = b.getAttribute('data-clear');
        if (k === 'type') state.filters.types = [];
        else if (k === 'category') state.filters.categories = [];
        else if (k === 'system') state.filters.systems = [];
        else if (k === 'reminders') state.filters.reminders = null;
        state.page = 1;
        renderTable();
      };
    });
    body.querySelectorAll('[data-open]').forEach(function (b) {
      b.onclick = function () {
        var pill = document.querySelector('.service-tasks-panel .expense-filter-pill[data-filter="' + b.getAttribute('data-open') + '"]');
        if (pill) openPop(b.getAttribute('data-open'), pill);
      };
    });
    document.getElementById('st-drawer-add').onclick = function () {
      var pill = document.querySelector('.service-tasks-panel .expense-filter-pill[data-filter="category"]');
      if (pill) openPop('category', pill);
    };
    initLucide(body);
  }

  function closeTableSettings() {
    var el = document.getElementById('st-table-settings');
    if (el) el.hidden = true;
  }

  function openTableSettings(anchor) {
    closePop();
    var el = document.getElementById('st-table-settings');
    el.innerHTML = '<div class="meter-table-settings__section"><a href="#" class="meter-table-settings__manage">Manage Columns</a></div>' +
      '<div class="meter-table-settings__section"><div class="meter-table-settings__title">Items Per Page</div>' +
      [50, 100, 200].map(function (n) {
        return '<label class="meter-settings-option"><input type="radio" name="st-page-size" value="' + n + '"' + (state.pageSize === n ? ' checked' : '') + '> ' + n + '</label>';
      }).join('') + '</div>';
    el.hidden = false;
    positionPop(anchor, el);
    el.querySelectorAll('input[name="st-page-size"]').forEach(function (r) {
      r.onchange = function () { state.pageSize = parseInt(r.value, 10); state.page = 1; renderTable(); };
    });
  }

  function setTab(tab) {
    state.tab = tab;
    state.page = 1;
    document.querySelectorAll('.st-view-tab[data-tab]').forEach(function (b) {
      var on = b.getAttribute('data-tab') === tab;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    renderTable();
  }

  function init() {
    if (document.body.getAttribute('data-subpage') !== 'service-tasks') return;
    initLucide();

    document.getElementById('st-search').oninput = function (e) {
      state.search = e.target.value;
      state.page = 1;
      renderTable();
    };

    document.querySelectorAll('.service-tasks-panel .expense-filter-pill').forEach(function (btn) {
      btn.onclick = function () {
        var k = btn.getAttribute('data-filter');
        if (openFilter === k && !document.getElementById('st-filter-popover').hidden) closePop();
        else openPop(k, btn);
      };
    });

    document.getElementById('st-filters-btn').onclick = function () {
      if (document.getElementById('st-filters-drawer').classList.contains('is-open')) closeDrawer();
      else openDrawer();
    };
    document.getElementById('st-filters-drawer-close').onclick = closeDrawer;

    document.getElementById('st-pagination').querySelector('[data-page-prev]').onclick = function () {
      if (state.page > 1) { state.page--; renderTable(); }
    };
    document.getElementById('st-pagination').querySelector('[data-page-next]').onclick = function () {
      var tp = Math.max(1, Math.ceil(filteredList().length / state.pageSize));
      if (state.page < tp) { state.page++; renderTable(); }
    };

    document.getElementById('st-table-settings-btn').onclick = function (e) {
      var el = document.getElementById('st-table-settings');
      if (!el.hidden) closeTableSettings();
      else openTableSettings(e.currentTarget);
    };

    document.getElementById('st-add-btn').onclick = function () {
      window.location.href = 'service-task-form';
    };

    document.querySelectorAll('.st-view-tab[data-tab]').forEach(function (b) {
      b.onclick = function () { setTab(b.getAttribute('data-tab')); };
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#st-filter-popover') && !e.target.closest('.service-tasks-panel .expense-filter-pill')) closePop();
      if (!e.target.closest('#st-table-settings') && !e.target.closest('#st-table-settings-btn')) closeTableSettings();
      if (!e.target.closest('.service-tasks-panel [data-row-actions]')) closeAllRowMenus();
    });

    renderTable();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
