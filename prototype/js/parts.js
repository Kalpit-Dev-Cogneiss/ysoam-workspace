(function () {
  'use strict';

  var data = window.YSOAM_PARTS;

  var POPULAR = [
    { id: 'mfrPartNumber', label: 'Part Manufacturer Part Number' },
    { id: 'manufacturer', label: 'Part Manufacturer' },
    { id: 'category', label: 'Part Category' },
    { id: 'vendor', label: 'Part Vendor' }
  ];

  var state = {
    tab: 'all',
    search: '',
    page: 1,
    pageSize: 50,
    filters: {
      categories: [],
      manufacturers: [],
      mfrPartNumbers: [],
      vendors: []
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

  function uniqueMfrPartNumbers() {
    var seen = {};
    return data.list.filter(function (p) { return p.mfrPartNumber; }).map(function (p) {
      return { id: p.mfrPartNumber, label: p.mfrPartNumber };
    }).filter(function (item) {
      if (seen[item.id]) return false;
      seen[item.id] = true;
      return true;
    }).sort(function (a, b) { return a.label.localeCompare(b.label); });
  }

  function filterCount() {
    var f = state.filters;
    var n = 0;
    if (f.categories.length) n++;
    if (f.manufacturers.length) n++;
    if (f.mfrPartNumbers.length) n++;
    if (f.vendors.length) n++;
    return n;
  }

  function filteredList() {
    var q = state.search.trim().toLowerCase();
    var f = state.filters;
    return data.list.filter(function (row) {
      if (state.tab === 'archived' && !row.archived) return false;
      if (state.tab === 'all' && row.archived) return false;
      if (f.categories.length && f.categories.indexOf(row.category) === -1) return false;
      if (f.manufacturers.length && f.manufacturers.indexOf(row.manufacturer) === -1) return false;
      if (f.mfrPartNumbers.length && f.mfrPartNumbers.indexOf(row.mfrPartNumber) === -1) return false;
      if (f.vendors.length && f.vendors.indexOf(row.vendor) === -1) return false;
      if (q) {
        var hay = [
          row.partNumber, row.description, row.categoryLabel, row.manufacturerLabel,
          row.mfrPartNumber, row.upc, row.aisleRowBin, row.vendorLabel
        ].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function partThumb(row) {
    return '<span class="parts-thumb" style="--parts-thumb-color:' + escA(row.thumbColor) + '" aria-hidden="true">' +
      lucide('package', 16) + '</span>';
  }

  function partCell(row) {
    return '<span class="parts-part-cell">' + partThumb(row) +
      '<a href="#" class="table-cell-link parts-part-link" data-part-view="' + escA(row.id) + '">' + esc(row.partNumber) + '</a></span>';
  }

  function rowActionsMenu(row) {
    return (
      '<div class="row-actions" data-row-actions="' + escA(row.id) + '">' +
        '<button type="button" class="row-actions__trigger" aria-label="More actions for part ' + escA(row.partNumber) + '" aria-haspopup="menu" aria-expanded="false">' +
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
        window.location.href = 'part-form?id=' + encodeURIComponent(rowId);
      });
    });

    document.querySelectorAll('.parts-panel [data-action="delete"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        closeAllRowMenus();
        window.alert('Delete part (prototype demo).');
      });
    });

    document.querySelectorAll('.parts-panel [data-action="view"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        var rowId = btn.closest('[data-row-actions]').getAttribute('data-row-actions');
        closeAllRowMenus();
        window.location.href = 'part-view?id=' + encodeURIComponent(rowId);
      });
    });
  }

  function columnDataFlags(rows) {
    return {
      description: rows.some(function (r) { return r.description; }),
      aisleRowBin: rows.some(function (r) { return r.aisleRowBin; })
    };
  }

  function renderTable() {
    var root = document.getElementById('parts-table');
    var countEl = document.getElementById('parts-count');
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

    var html = '<table class="data-table data-table--list data-table--parts"><thead><tr>' +
      '<th class="data-table__check-col"><input type="checkbox" aria-label="Select all"></th>' +
      '<th class="parts-col-part">Part <span class="parts-sort-icon" data-lucide-icon="arrowUp" data-lucide-icon-size="12" aria-hidden="true"></span></th>' +
      '<th class="parts-col-desc' + compactColClass(cols.description) + '">Description</th>' +
      '<th class="parts-col-category">Category</th>' +
      '<th class="parts-col-manufacturer">Manufacturer</th>' +
      '<th class="parts-col-mfr">Manufacturer Part Number</th>' +
      '<th class="parts-col-unit">Measurement Unit</th>' +
      '<th class="parts-col-bin' + compactColClass(cols.aisleRowBin) + '">Aisle/Row/Bin</th>' +
      '<th class="parts-col-cost">Unit Cost</th>' +
      '<th class="data-table__actions-col" aria-label="Actions"></th>' +
      '</tr></thead><tbody>';

    if (!rows.length) {
      html += '<tr><td colspan="10" class="service-history-empty">No parts found</td></tr>';
    } else {
      rows.forEach(function (row) {
        html += '<tr>' +
          '<td class="data-table__check-col"><input type="checkbox" aria-label="Select row"></td>' +
          '<td class="parts-col-part">' + partCell(row) + '</td>' +
          '<td class="parts-col-desc' + compactColClass(cols.description) + '">' + (row.description ? esc(row.description) : dashCell()) + '</td>' +
          '<td class="parts-col-category">' + esc(row.categoryLabel) + '</td>' +
          '<td class="parts-col-manufacturer">' + esc(row.manufacturerLabel) + '</td>' +
          '<td class="parts-col-mfr">' + (row.mfrPartNumber ? esc(row.mfrPartNumber) : dashCell()) + '</td>' +
          '<td class="parts-col-unit">' + esc(row.unitShort) + '</td>' +
          '<td class="parts-col-bin' + compactColClass(cols.aisleRowBin) + '">' + (row.aisleRowBin ? esc(row.aisleRowBin) : dashCell()) + '</td>' +
          '<td class="parts-col-cost tabular-nums">' + esc(row.unitCostLabel) + '</td>' +
          '<td class="data-table__actions-col">' + rowActionsMenu(row) + '</td>' +
          '</tr>';
      });
    }
    html += '</tbody></table>';
    root.innerHTML = html;
    bindRowActions();
    root.querySelectorAll('[data-part-view]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = 'part-view?id=' + encodeURIComponent(link.getAttribute('data-part-view'));
      });
    });
    updatePills();
    initLucide(root);
  }

  function updatePills() {
    var f = state.filters;
    document.querySelectorAll('.parts-panel .expense-filter-pill').forEach(function (btn) {
      var k = btn.getAttribute('data-filter');
      var on = (k === 'category' && f.categories.length) ||
        (k === 'manufacturer' && f.manufacturers.length);
      btn.classList.toggle('has-filter', !!on);
    });
    var btn = document.getElementById('parts-filters-btn');
    var lbl = document.getElementById('parts-filters-btn-label');
    if (btn) {
      var n = filterCount();
      var open = document.getElementById('parts-filters-drawer').classList.contains('is-open');
      btn.classList.toggle('is-active', n > 0 || open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (lbl) lbl.textContent = n > 0 ? n + ' Filter' + (n === 1 ? '' : 's') : 'Filters';
    }
  }

  function closePop() {
    var p = document.getElementById('parts-filter-popover');
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

  function optionsHtml(items, selected, valueKey) {
    valueKey = valueKey || 'id';
    return items.map(function (item) {
      var checked = selected.indexOf(item[valueKey]) !== -1;
      return '<label class="meter-select-item"><input type="checkbox" value="' + escA(item[valueKey]) + '"' +
        (checked ? ' checked' : '') + '><span>' + esc(item.label) + '</span></label>';
    }).join('');
  }

  function filterItems(kind) {
    if (kind === 'category') return data.categories;
    if (kind === 'manufacturer') return data.manufacturers;
    if (kind === 'vendor') return data.vendors;
    if (kind === 'mfrPartNumber') return uniqueMfrPartNumbers();
    return [];
  }

  function selectedFor(kind) {
    if (kind === 'category') return state.filters.categories;
    if (kind === 'manufacturer') return state.filters.manufacturers;
    if (kind === 'vendor') return state.filters.vendors;
    if (kind === 'mfrPartNumber') return state.filters.mfrPartNumbers;
    return [];
  }

  function setFilter(kind, vals) {
    if (kind === 'category') state.filters.categories = vals;
    else if (kind === 'manufacturer') state.filters.manufacturers = vals;
    else if (kind === 'vendor') state.filters.vendors = vals;
    else if (kind === 'mfrPartNumber') state.filters.mfrPartNumbers = vals;
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
    var pop = document.getElementById('parts-filter-popover');
    pop.querySelector('[data-popover-cancel]').onclick = closePop;
    pop.querySelector('[data-popover-apply]').onclick = function () {
      var vals = Array.prototype.map.call(pop.querySelectorAll('[data-select-list] input:checked'), function (el) { return el.value; });
      setFilter(kind, vals);
      closePop();
      state.page = 1;
      renderTable();
      if (document.getElementById('parts-filters-drawer').classList.contains('is-open')) renderDrawer();
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
    var pop = document.getElementById('parts-filter-popover');
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
    document.getElementById('parts-filters-drawer').classList.remove('is-open');
    updatePills();
  }

  function openDrawer() {
    closePop();
    document.getElementById('parts-filters-drawer').classList.add('is-open');
    renderDrawer();
    updatePills();
  }

  function renderDrawer() {
    var body = document.getElementById('parts-filters-drawer-body');
    var f = state.filters;
    var applied = '';
    if (f.categories.length) applied += '<div class="expense-drawer-applied"><span>Part Category</span><span>' + f.categories.length + ' selected</span><button type="button" data-clear="category"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    if (f.manufacturers.length) applied += '<div class="expense-drawer-applied"><span>Part Manufacturer</span><span>' + f.manufacturers.length + ' selected</span><button type="button" data-clear="manufacturer"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    if (f.mfrPartNumbers.length) applied += '<div class="expense-drawer-applied"><span>Part Manufacturer Part Number</span><span>' + f.mfrPartNumbers.length + ' selected</span><button type="button" data-clear="mfrPartNumber"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    if (f.vendors.length) applied += '<div class="expense-drawer-applied"><span>Part Vendor</span><span>' + f.vendors.length + ' selected</span><button type="button" data-clear="vendor"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';

    body.innerHTML = (filterCount() ? applied : '<p class="expense-drawer-empty">No filters applied.</p>') +
      '<button type="button" class="btn btn-primary btn-sm expense-drawer-add" id="parts-drawer-add">Add Filter <span data-lucide-icon="chevronDown" data-lucide-icon-size="14" aria-hidden="true"></span></button>' +
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
        var pill = document.querySelector('.parts-panel .expense-filter-pill[data-filter="' + filter + '"]') ||
          document.getElementById('parts-filters-btn');
        openPop(filter, pill);
      };
    });
    document.getElementById('parts-drawer-add').onclick = function () {
      var pill = document.querySelector('.parts-panel .expense-filter-pill[data-filter="category"]');
      if (pill) openPop('category', pill);
    };
    initLucide(body);
  }

  function closeTableSettings() {
    var el = document.getElementById('parts-table-settings');
    if (el) el.hidden = true;
  }

  function openTableSettings(anchor) {
    closePop();
    var el = document.getElementById('parts-table-settings');
    el.innerHTML = '<div class="meter-table-settings__section"><a href="#" class="meter-table-settings__manage">Manage Columns</a></div>' +
      '<div class="meter-table-settings__section"><div class="meter-table-settings__title">Items Per Page</div>' +
      [50, 100, 200].map(function (n) {
        return '<label class="meter-settings-option"><input type="radio" name="parts-page-size" value="' + n + '"' + (state.pageSize === n ? ' checked' : '') + '> ' + n + '</label>';
      }).join('') + '</div>';
    el.hidden = false;
    positionPop(anchor, el);
    el.querySelectorAll('input[name="parts-page-size"]').forEach(function (r) {
      r.onchange = function () { state.pageSize = parseInt(r.value, 10); state.page = 1; renderTable(); };
    });
  }

  function setTab(tab) {
    if (tab === 'add') return;
    state.tab = tab;
    state.page = 1;
    document.querySelectorAll('.parts-tabs .st-view-tab[data-tab]').forEach(function (b) {
      var on = b.getAttribute('data-tab') === tab;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    renderTable();
  }

  function init() {
    if (document.body.getAttribute('data-subpage') !== 'parts-list') return;
    initLucide();

    document.getElementById('parts-search').oninput = function (e) {
      state.search = e.target.value;
      state.page = 1;
      renderTable();
    };

    document.querySelectorAll('.parts-panel .expense-filter-pill').forEach(function (btn) {
      btn.onclick = function () {
        var k = btn.getAttribute('data-filter');
        if (openFilter === k && !document.getElementById('parts-filter-popover').hidden) closePop();
        else openPop(k, btn);
      };
    });

    document.getElementById('parts-filters-btn').onclick = function () {
      if (document.getElementById('parts-filters-drawer').classList.contains('is-open')) closeDrawer();
      else openDrawer();
    };
    document.getElementById('parts-filters-drawer-close').onclick = closeDrawer;

    document.getElementById('parts-pagination').querySelector('[data-page-prev]').onclick = function () {
      if (state.page > 1) { state.page--; renderTable(); }
    };
    document.getElementById('parts-pagination').querySelector('[data-page-next]').onclick = function () {
      var tp = Math.max(1, Math.ceil(filteredList().length / state.pageSize));
      if (state.page < tp) { state.page++; renderTable(); }
    };

    document.getElementById('parts-table-settings-btn').onclick = function (e) {
      var el = document.getElementById('parts-table-settings');
      if (!el.hidden) closeTableSettings();
      else openTableSettings(e.currentTarget);
    };

    document.getElementById('parts-save-view-btn').onclick = function () {
      window.alert('Save view (prototype demo).');
    };

    document.getElementById('parts-more-btn').onclick = function () {
      window.alert('More actions (prototype demo).');
    };

    document.querySelectorAll('.parts-tabs .st-view-tab[data-tab]').forEach(function (b) {
      b.onclick = function () { setTab(b.getAttribute('data-tab')); };
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#parts-filter-popover') && !e.target.closest('.parts-panel .expense-filter-pill')) closePop();
      if (!e.target.closest('#parts-table-settings') && !e.target.closest('#parts-table-settings-btn')) closeTableSettings();
      if (!e.target.closest('.parts-panel [data-row-actions]')) closeAllRowMenus();
    });

    renderTable();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
