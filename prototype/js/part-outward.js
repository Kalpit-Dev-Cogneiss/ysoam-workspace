(function () {
  'use strict';

  var data = window.YSOAM_PART_OUTWARD;

  var POPULAR = [
    { id: 'vehicle', label: 'Vehicle' },
    { id: 'category', label: 'Part Category' },
    { id: 'period', label: 'Period' }
  ];

  var state = {
    tab: 'all',
    search: '',
    page: 1,
    pageSize: 50,
    filters: {
      vehicles: [],
      categories: [],
      period: 'last30'
    }
  };

  var draft = null;
  var openFilter = null;

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function lucide(name, size) { return window.YSOAM_LUCIDE ? window.YSOAM_LUCIDE.icon(name, size || 16) : ''; }
  function rowIcon(key) { return window.YSOAM_ICONS && window.YSOAM_ICONS[key] ? window.YSOAM_ICONS[key] : ''; }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }

  function dashCell() { return '<span class="parts-cell-empty">—</span>'; }
  function compactColClass(hasData) { return hasData ? '' : ' parts-col-compact'; }

  function filterCount() {
    var f = state.filters;
    var n = 0;
    if (f.vehicles.length) n++;
    if (f.categories.length) n++;
    if (f.period !== 'last30') n++;
    return n;
  }

  function queryOpts() {
    var range = data.periodRange(state.filters.period);
    return {
      search: state.search,
      start: range.start,
      end: range.end,
      vehicleId: state.filters.vehicles.length === 1 ? state.filters.vehicles[0] : null,
      category: state.filters.categories.length === 1 ? state.filters.categories[0] : null
    };
  }

  function filteredList() {
    var rows = data.filterEntries(queryOpts());
    var f = state.filters;
    if (f.vehicles.length > 1) {
      rows = rows.filter(function (r) { return f.vehicles.indexOf(r.vehicleId) !== -1; });
    }
    if (f.categories.length > 1) {
      rows = rows.filter(function (r) { return f.categories.indexOf(r.category) !== -1; });
    }
    return rows;
  }

  function partThumb(row) {
    return '<span class="parts-thumb" style="--parts-thumb-color:' + escA(row.thumbColor || '#0ea5e9') + '" aria-hidden="true">' +
      lucide('package', 16) + '</span>';
  }

  function partCell(row) {
    return '<span class="parts-part-cell">' + partThumb(row) +
      '<a href="#" class="table-cell-link parts-part-link" data-part-link="' + escA(row.partId) + '">' + esc(row.partNumber) + '</a></span>';
  }

  function outwardLink(row) {
    return '<a href="#" class="table-cell-link" data-outward-view="' + escA(row.id) + '">' + esc(row.id) + '</a>';
  }

  function vehicleCell(row) {
    return '<a href="vehicle-detail.html?id=' + escA(row.vehicleId) + '" class="table-cell-link">' + esc(row.vehicleName) + '</a>';
  }

  function rowActionsMenu(row) {
    return (
      '<div class="row-actions" data-row-actions="' + escA(row.id) + '">' +
        '<button type="button" class="row-actions__trigger" aria-label="More actions" aria-haspopup="menu" aria-expanded="false">' +
          '<span class="row-actions__dots" aria-hidden="true"></span>' +
        '</button>' +
        '<div class="row-actions__menu" role="menu" hidden>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="view" role="menuitem">View <span class="row-actions__item-icon">' + rowIcon('actionView') + '</span></button>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="edit" role="menuitem">Edit <span class="row-actions__item-icon">' + rowIcon('actionEdit') + '</span></button>' +
          '<div class="row-actions__divider" role="separator"></div>' +
          '<button type="button" class="row-actions__item row-actions__item--btn row-actions__item--danger" data-action="delete" role="menuitem">Delete <span class="row-actions__item-icon">' + rowIcon('actionDelete') + '</span></button>' +
        '</div>' +
      '</div>'
    );
  }

  function closeAllRowMenus() {
    document.querySelectorAll('.parts-panel .row-actions__menu').forEach(function (m) {
      m.hidden = true;
      m.style.position = '';
      m.style.top = '';
      m.style.left = '';
    });
    document.querySelectorAll('.parts-panel .row-actions__trigger').forEach(function (b) {
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
    document.querySelectorAll('.parts-panel .row-actions').forEach(function (wrap) {
      if (wrap.getAttribute('data-bound')) return;
      wrap.setAttribute('data-bound', '1');
      wrap.addEventListener('click', function (e) { e.stopPropagation(); });
    });

    document.querySelectorAll('.parts-panel .row-actions__trigger').forEach(function (btn) {
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

    document.querySelectorAll('.parts-panel [data-action="edit"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        var rowId = btn.closest('[data-row-actions]').getAttribute('data-row-actions');
        closeAllRowMenus();
        window.location.href = 'part-outward-form?id=' + encodeURIComponent(rowId);
      });
    });

    document.querySelectorAll('.parts-panel [data-action="view"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        var rowId = btn.closest('[data-row-actions]').getAttribute('data-row-actions');
        closeAllRowMenus();
        window.location.href = 'part-outward-view?id=' + encodeURIComponent(rowId);
      });
    });

    document.querySelectorAll('.parts-panel [data-action="delete"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        closeAllRowMenus();
        window.alert('Delete part outward entry (prototype demo).');
      });
    });
  }

  function bindRowClicks() {
    document.querySelectorAll('.data-table--part-outward tbody tr').forEach(function (tr) {
      if (tr.querySelector('.data-table__empty') || tr.getAttribute('data-bound')) return;
      tr.setAttribute('data-bound', '1');
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', function (e) {
        if (e.target.closest('a, button, input, .row-actions')) return;
        var link = tr.querySelector('[data-outward-view]');
        if (link) window.location.href = 'part-outward-view?id=' + encodeURIComponent(link.getAttribute('data-outward-view'));
      });
    });
  }

  function columnDataFlags(rows) {
    return {
      description: rows.some(function (r) { return r.partDescription; }),
      workOrder: rows.some(function (r) { return r.workOrder; })
    };
  }

  function renderTable() {
    var root = document.getElementById('part-outward-table');
    var countEl = document.getElementById('part-outward-count');
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

    var cols = columnDataFlags(all);

    var html = '<table class="data-table data-table--list data-table--parts data-table--part-outward"><thead><tr>' +
      '<th class="data-table__check-col"><input type="checkbox" aria-label="Select all"></th>' +
      '<th class="parts-col-part">Outward # <span class="parts-sort-icon" data-lucide-icon="arrowUp" data-lucide-icon-size="12" aria-hidden="true"></span></th>' +
      '<th class="parts-col-part">Part</th>' +
      '<th class="parts-col-desc' + compactColClass(cols.description) + '">Description</th>' +
      '<th class="parts-col-category">Category</th>' +
      '<th class="parts-col-manufacturer">Vehicle</th>' +
      '<th class="parts-col-mfr">Manufacturer</th>' +
      '<th class="parts-col-unit">Qty</th>' +
      '<th class="parts-col-cost">Unit Cost</th>' +
      '<th class="parts-col-cost">Total</th>' +
      '<th class="parts-col-bin' + compactColClass(cols.workOrder) + '">Issue Date</th>' +
      '<th class="data-table__actions-col" aria-label="Actions"></th>' +
      '</tr></thead><tbody>';

    if (!rows.length) {
      html += '<tr><td colspan="12" class="service-history-empty">No part outward entries found</td></tr>';
    } else {
      rows.forEach(function (row) {
        html += '<tr>' +
          '<td class="data-table__check-col"><input type="checkbox" aria-label="Select row"></td>' +
          '<td class="parts-col-part">' + outwardLink(row) + '</td>' +
          '<td class="parts-col-part">' + partCell(row) + '</td>' +
          '<td class="parts-col-desc' + compactColClass(cols.description) + '">' + (row.partDescription ? esc(row.partDescription) : dashCell()) + '</td>' +
          '<td class="parts-col-category">' + esc(row.categoryLabel) + '</td>' +
          '<td class="parts-col-manufacturer">' + vehicleCell(row) + '</td>' +
          '<td class="parts-col-mfr">' + esc(row.manufacturerLabel) + '</td>' +
          '<td class="parts-col-unit tabular-nums">' + esc(row.quantity) + ' ' + esc(row.unitShort || row.unit) + '</td>' +
          '<td class="parts-col-cost tabular-nums">' + esc(row.unitCostLabel) + '</td>' +
          '<td class="parts-col-cost tabular-nums">' + esc(row.totalCostLabel) + '</td>' +
          '<td class="parts-col-bin' + compactColClass(cols.workOrder) + '">' + esc(data.formatDateDisplay(row.issuedOn)) + '</td>' +
          '<td class="data-table__actions-col">' + rowActionsMenu(row) + '</td>' +
          '</tr>';
      });
    }

    html += '</tbody></table>';
    root.innerHTML = html;
    bindRowActions();
    bindRowClicks();

    root.querySelectorAll('[data-outward-view]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = 'part-outward-view?id=' + encodeURIComponent(link.getAttribute('data-outward-view'));
      });
    });
    root.querySelectorAll('[data-part-link]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = 'part-view?id=' + encodeURIComponent(link.getAttribute('data-part-link'));
      });
    });

    updatePills();
    initLucide(root);
  }

  function updatePills() {
    var f = state.filters;
    document.querySelectorAll('.parts-panel .expense-filter-pill').forEach(function (btn) {
      var k = btn.getAttribute('data-filter');
      var on = (k === 'vehicle' && f.vehicles.length) ||
        (k === 'category' && f.categories.length) ||
        (k === 'period' && f.period !== 'last30');
      btn.classList.toggle('has-filter', !!on);
    });
    var btn = document.getElementById('part-outward-filters-btn');
    var lbl = document.getElementById('part-outward-filters-btn-label');
    if (btn) {
      var n = filterCount();
      var open = document.getElementById('part-outward-filters-drawer').classList.contains('is-open');
      btn.classList.toggle('is-active', n > 0 || open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (lbl) lbl.textContent = n > 0 ? n + ' Filter' + (n === 1 ? '' : 's') : 'Filters';
    }
  }

  function closePop() {
    var p = document.getElementById('part-outward-filter-popover');
    if (p) p.hidden = true;
    document.querySelectorAll('.parts-panel .expense-filter-pill').forEach(function (b) {
      b.classList.remove('is-open');
      b.setAttribute('aria-expanded', 'false');
    });
    openFilter = null;
    draft = null;
  }

  function positionPop(anchor, pop) {
    var panel = document.querySelector('.parts-panel');
    if (!panel) return;
    var pr = panel.getBoundingClientRect();
    var r = anchor.getBoundingClientRect();
    pop.style.top = (r.bottom - pr.top + 6) + 'px';
    var w = pop.offsetWidth || 360;
    pop.style.left = Math.max(8, Math.min(r.left - pr.left, pr.width - w - 8)) + 'px';
  }

  function optionsHtml(items, selected) {
    return items.map(function (item) {
      var checked = selected.indexOf(item.id) !== -1;
      return '<label class="meter-select-item"><input type="checkbox" value="' + escA(item.id) + '"' +
        (checked ? ' checked' : '') + '><span>' + esc(item.label) + '</span></label>';
    }).join('');
  }

  function periodPopover() {
    var options = [
      { id: 'last30', label: 'Last 30 Days' },
      { id: 'last90', label: 'Last 90 Days' },
      { id: 'ytd', label: 'Year to Date' }
    ];
    return '<div class="meter-popover meter-popover--select"><div class="meter-popover__list">' +
      options.map(function (opt) {
        var checked = state.filters.period === opt.id ? ' checked' : '';
        return '<label class="meter-select-item"><input type="radio" name="po-period" value="' + escA(opt.id) + '"' + checked + '><span>' + esc(opt.label) + '</span></label>';
      }).join('') +
      '</div><div class="meter-popover__footer"><div class="meter-popover__footer-right">' +
      '<button type="button" class="btn btn-text btn-sm" data-popover-cancel>Cancel</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-popover-apply>Apply</button></div></div></div>';
  }

  function selectPopover(kind, selected) {
    if (kind === 'period') return periodPopover();
    var items = kind === 'vehicle' ? data.vehicleOptions() : data.categoryOptions();
    return '<div class="meter-popover meter-popover--select"><div class="meter-popover__search"><span data-lucide-icon="search" aria-hidden="true"></span>' +
      '<input type="search" class="meter-popover__search-input" placeholder="Select item(s)" data-select-search></div>' +
      '<div class="meter-popover__list" data-select-list>' + optionsHtml(items, selected) + '</div>' +
      '<div class="meter-popover__footer"><div class="meter-popover__footer-right">' +
      '<button type="button" class="btn btn-text btn-sm" data-popover-cancel>Cancel</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-popover-apply>Apply</button></div></div></div>';
  }

  function selectedFor(kind) {
    if (kind === 'vehicle') return state.filters.vehicles;
    if (kind === 'category') return state.filters.categories;
    return [];
  }

  function bindPop(kind) {
    var pop = document.getElementById('part-outward-filter-popover');
    pop.querySelector('[data-popover-cancel]').onclick = closePop;
    pop.querySelector('[data-popover-apply]').onclick = function () {
      if (kind === 'period') {
        var picked = pop.querySelector('input[name="po-period"]:checked');
        if (picked) state.filters.period = picked.value;
      } else {
        var vals = Array.prototype.map.call(pop.querySelectorAll('[data-select-list] input:checked'), function (el) { return el.value; });
        if (kind === 'vehicle') state.filters.vehicles = vals;
        if (kind === 'category') state.filters.categories = vals;
      }
      closePop();
      state.page = 1;
      renderTable();
      if (document.getElementById('part-outward-filters-drawer').classList.contains('is-open')) renderDrawer();
    };
    if (kind !== 'period') {
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
  }

  function openPop(kind, anchor) {
    closeDrawer();
    closeTableSettings();
    var pop = document.getElementById('part-outward-filter-popover');
    openFilter = kind;
    draft = kind === 'period' ? state.filters.period : selectedFor(kind).slice();
    pop.innerHTML = selectPopover(kind, draft);
    pop.hidden = false;
    anchor.classList.add('is-open');
    anchor.setAttribute('aria-expanded', 'true');
    positionPop(anchor, pop);
    bindPop(kind);
    initLucide(pop);
  }

  function closeDrawer() {
    document.getElementById('part-outward-filters-drawer').classList.remove('is-open');
    updatePills();
  }

  function openDrawer() {
    closePop();
    document.getElementById('part-outward-filters-drawer').classList.add('is-open');
    renderDrawer();
    updatePills();
  }

  function renderDrawer() {
    var body = document.getElementById('part-outward-filters-drawer-body');
    var f = state.filters;
    var applied = '';
    if (f.vehicles.length) applied += '<div class="expense-drawer-applied"><span>Vehicle</span><span>' + f.vehicles.length + ' selected</span><button type="button" data-clear="vehicle"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    if (f.categories.length) applied += '<div class="expense-drawer-applied"><span>Part Category</span><span>' + f.categories.length + ' selected</span><button type="button" data-clear="category"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    if (f.period !== 'last30') applied += '<div class="expense-drawer-applied"><span>Period</span><span>' + esc(f.period) + '</span><button type="button" data-clear="period"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';

    body.innerHTML = (filterCount() ? applied : '<p class="expense-drawer-empty">No filters applied.</p>') +
      '<button type="button" class="btn btn-primary btn-sm expense-drawer-add" id="po-drawer-add">Add Filter <span data-lucide-icon="chevronDown" data-lucide-icon-size="14" aria-hidden="true"></span></button>' +
      '<div class="expense-drawer-popular"><h3>Popular Filters</h3><ul class="expense-drawer-popular__list">' +
      POPULAR.map(function (p) { return '<li><button type="button" class="expense-drawer-popular__link" data-open="' + p.id + '">' + esc(p.label) + '</button></li>'; }).join('') +
      '</ul></div>';

    body.querySelectorAll('[data-clear]').forEach(function (b) {
      b.onclick = function () {
        var k = b.getAttribute('data-clear');
        if (k === 'vehicle') state.filters.vehicles = [];
        if (k === 'category') state.filters.categories = [];
        if (k === 'period') state.filters.period = 'last30';
        state.page = 1;
        renderTable();
        renderDrawer();
      };
    });
    body.querySelectorAll('[data-open]').forEach(function (b) {
      b.onclick = function () {
        var filter = b.getAttribute('data-open');
        var pill = document.querySelector('.parts-panel .expense-filter-pill[data-filter="' + filter + '"]');
        if (pill) openPop(filter, pill);
      };
    });
    document.getElementById('po-drawer-add').onclick = function () {
      var pill = document.querySelector('.parts-panel .expense-filter-pill[data-filter="vehicle"]');
      if (pill) openPop('vehicle', pill);
    };
    initLucide(body);
  }

  function closeTableSettings() {
    var el = document.getElementById('part-outward-table-settings');
    if (el) el.hidden = true;
  }

  function openTableSettings(anchor) {
    closePop();
    var el = document.getElementById('part-outward-table-settings');
    el.innerHTML = '<div class="meter-table-settings__section"><div class="meter-table-settings__title">Items Per Page</div>' +
      [50, 100, 200].map(function (n) {
        return '<label class="meter-settings-option"><input type="radio" name="po-page-size" value="' + n + '"' + (state.pageSize === n ? ' checked' : '') + '> ' + n + '</label>';
      }).join('') + '</div>';
    el.hidden = false;
    positionPop(anchor, el);
    el.querySelectorAll('input[name="po-page-size"]').forEach(function (r) {
      r.onchange = function () { state.pageSize = parseInt(r.value, 10); state.page = 1; renderTable(); };
    });
  }

  function init() {
    if (document.body.getAttribute('data-subpage') !== 'part-outward') return;
    initLucide();

    document.getElementById('part-outward-search').oninput = function (e) {
      state.search = e.target.value;
      state.page = 1;
      renderTable();
    };

    document.querySelectorAll('.parts-panel .expense-filter-pill').forEach(function (btn) {
      btn.onclick = function () {
        var k = btn.getAttribute('data-filter');
        if (openFilter === k && !document.getElementById('part-outward-filter-popover').hidden) closePop();
        else openPop(k, btn);
      };
    });

    document.getElementById('part-outward-filters-btn').onclick = function () {
      if (document.getElementById('part-outward-filters-drawer').classList.contains('is-open')) closeDrawer();
      else openDrawer();
    };
    document.getElementById('part-outward-filters-drawer-close').onclick = closeDrawer;

    document.getElementById('part-outward-pagination').querySelector('[data-page-prev]').onclick = function () {
      if (state.page > 1) { state.page--; renderTable(); }
    };
    document.getElementById('part-outward-pagination').querySelector('[data-page-next]').onclick = function () {
      var tp = Math.max(1, Math.ceil(filteredList().length / state.pageSize));
      if (state.page < tp) { state.page++; renderTable(); }
    };

    document.getElementById('part-outward-table-settings-btn').onclick = function (e) {
      var el = document.getElementById('part-outward-table-settings');
      if (!el.hidden) closeTableSettings();
      else openTableSettings(e.currentTarget);
    };

    document.getElementById('part-outward-save-view-btn').onclick = function () {
      window.alert('Save view (prototype demo).');
    };

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#part-outward-filter-popover') && !e.target.closest('.expense-filter-pill') &&
          !e.target.closest('#part-outward-table-settings') && !e.target.closest('#part-outward-table-settings-btn')) {
        closePop();
        closeTableSettings();
      }
      if (!e.target.closest('.row-actions')) closeAllRowMenus();
    });

    renderTable();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
