(function () {
  var vehicles = window.YSOAM_VEHICLES;
  var data = window.YSOAM_EXPENSES;

  var WATCHERS = [
    { id: 'demo-manager', label: 'Demo Manager', initials: 'DM' }
  ];

  var DATE_PRESETS = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'last7', label: 'Last 7 Days' },
    { id: 'last30', label: 'Last 30 Days' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'lastMonth', label: 'Last Month' },
    { id: 'thisQuarter', label: 'This Quarter' },
    { id: 'lastQuarter', label: 'Last Quarter' },
    { id: 'thisYear', label: 'This Year' },
    { id: 'lastYear', label: 'Last Year' }
  ];

  var POPULAR_FILTERS = [
    { id: 'vehicle', label: 'Vehicle' },
    { id: 'group', label: 'Vehicle Group' },
    { id: 'vendor', label: 'Vendor' },
    { id: 'vendor-contact', label: 'Vendor Contact Name' },
    { id: 'vendor-phone', label: 'Vendor Contact Phone' },
    { id: 'vendor-labels', label: 'Vendor Labels' }
  ];

  var defaultDateRange = presetRange('last30');

  var state = {
    tab: 'past',
    search: '',
    page: 1,
    pageSize: 50,
    filters: {
      date: { active: false, start: defaultDateRange.start, end: defaultDateRange.end, preset: null },
      vehicles: [],
      types: [],
      watchers: []
    }
  };

  var draft = null;
  var openFilter = null;
  var calMonth = new Date(2026, 5, 1);
  var calPick = 'start';

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function toIso(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function parseIso(s) {
    var p = String(s || '').split('-');
    return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
  }

  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

  function endOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999); }

  function presetRange(id) {
    var now = new Date(2026, 5, 15);
    var start, end;
    end = endOfDay(now);
    if (id === 'today') start = startOfDay(now);
    else if (id === 'yesterday') {
      var y = new Date(now); y.setDate(y.getDate() - 1);
      start = startOfDay(y); end = endOfDay(y);
    } else if (id === 'last7') {
      start = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
    } else if (id === 'last30') {
      start = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29));
    } else if (id === 'thisMonth') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (id === 'lastMonth') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
    } else if (id === 'thisQuarter') {
      var q = Math.floor(now.getMonth() / 3) * 3;
      start = new Date(now.getFullYear(), q, 1);
    } else if (id === 'lastQuarter') {
      var cq = Math.floor(now.getMonth() / 3) * 3;
      start = new Date(now.getFullYear(), cq - 3, 1);
      end = endOfDay(new Date(now.getFullYear(), cq, 0));
    } else if (id === 'thisYear') {
      start = new Date(now.getFullYear(), 0, 1);
    } else if (id === 'lastYear') {
      start = new Date(now.getFullYear() - 1, 0, 1);
      end = endOfDay(new Date(now.getFullYear() - 1, 11, 31));
    } else {
      start = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29));
    }
    return { start: toIso(start), end: toIso(end) };
  }

  function formatRangeLabel(start, end) {
    return data.formatDate(parseIso(start)) + ' 12:00am – ' + data.formatDate(parseIso(end)) + ' 11:59pm';
  }

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

  function activeFilterCount() {
    var n = 0;
    var f = state.filters;
    if (f.date.active) n += 1;
    if (f.vehicles.length) n += 1;
    if (f.types.length) n += 1;
    if (f.watchers.length) n += 1;
    return n;
  }

  function filteredList() {
    var q = state.search.trim().toLowerCase();
    var f = state.filters;
    return data.list.filter(function (e) {
      if (e.period !== state.tab) return false;
      if (f.date.active && (e.date < f.date.start || e.date > f.date.end)) return false;
      if (f.vehicles.length && f.vehicles.indexOf(e.vehicleId) === -1) return false;
      if (f.types.length && f.types.indexOf(e.type) === -1) return false;
      if (f.watchers.length) {
        var wid = e.watcherId || 'demo-manager';
        if (f.watchers.indexOf(wid) === -1) return false;
      }
      if (!q) return true;
      var v = vehicles.getById(e.vehicleId);
      var hay = [
        e.id, e.type, e.source, e.vendor,
        v && v.name, v && v.make, v && v.model, v && v.group
      ].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function updateFilterPills() {
    var f = state.filters;
    document.querySelectorAll('.expense-filter-pill').forEach(function (btn) {
      var key = btn.getAttribute('data-filter');
      var on = false;
      if (key === 'date') on = f.date.active;
      else if (key === 'vehicle') on = f.vehicles.length > 0;
      else if (key === 'type') on = f.types.length > 0;
      else if (key === 'watcher') on = f.watchers.length > 0;
      btn.classList.toggle('has-filter', on);
    });
    var filtersBtn = document.getElementById('expense-filters-btn');
    var labelEl = document.getElementById('expense-filters-btn-label');
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

  function renderTable() {
    var root = document.getElementById('expense-entries-table');
    var countEl = document.getElementById('expense-count');
    if (!root) return;

    var all = filteredList();
    var total = all.length;
    var totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    if (state.page > totalPages) state.page = totalPages;
    var start = (state.page - 1) * state.pageSize;
    var rows = all.slice(start, start + state.pageSize);
    var from = total ? start + 1 : 0;
    var to = Math.min(state.page * state.pageSize, total);

    var html = '<table class="data-table data-table--list data-table--expense-entries">' +
      '<thead><tr>' +
        '<th class="data-table__check-col"><input type="checkbox" aria-label="Select all"></th>' +
        '<th>Vehicle</th><th>Date</th><th>Type</th><th>Vendor</th><th>Source</th><th>Amount</th><th>Watchers</th>' +
      '</tr></thead><tbody>';

    if (!rows.length) {
      html += '<tr><td colspan="8" class="expense-entries-empty">No expense entries match your filters.</td></tr>';
    } else {
      rows.forEach(function (e) {
        var v = vehicles.getById(e.vehicleId);
        if (!v) return;
        var dot = statusColor(v.status);
        var detailUrl = 'vehicle-detail?id=' + encodeURIComponent(v.id);
        html += '<tr>' +
          '<td class="data-table__check-col"><input type="checkbox"></td>' +
          '<td><div class="expense-vehicle-cell">' +
            '<img class="expense-vehicle-thumb" src="' + escapeHtml(v.image) + '" alt="">' +
            '<span class="expense-vehicle-status" style="background:' + dot + '"></span>' +
            '<div class="expense-vehicle-info">' +
              '<a class="expense-vehicle-link" href="' + detailUrl + '">' + escapeHtml(v.name) + '</a>' +
              '<span class="expense-vehicle-meta">' + escapeHtml(vehicleMeta(v)) + '</span>' +
            '</div></div></td>' +
          '<td class="tabular-nums">' + escapeHtml(data.formatDate(parseIso(e.date))) + '</td>' +
          '<td>' + escapeHtml(e.type) + '</td>' +
          '<td>' + (e.vendor ? escapeHtml(e.vendor) : '—') + '</td>' +
          '<td>' + escapeHtml(e.source) + '</td>' +
          '<td class="tabular-nums expense-amount">' + escapeHtml(data.formatAmount(e.amount)) + '</td>' +
          '<td>' + (e.watchers != null ? escapeHtml(String(e.watchers)) : '—') + '</td>' +
        '</tr>';
      });
    }

    html += '</tbody></table>';
    root.innerHTML = html;
    if (countEl) countEl.textContent = from + ' – ' + to + ' of ' + total;
    var pageEl = document.getElementById('expense-pagination');
    if (pageEl) {
      pageEl.querySelector('[data-page-prev]').disabled = state.page <= 1;
      pageEl.querySelector('[data-page-next]').disabled = state.page >= totalPages;
    }
    updateFilterPills();
    if (isDrawerOpen()) renderDrawerBody();
  }

  /* ── Popovers ─────────────────────────────────────────────── */
  function closePopover() {
    var pop = document.getElementById('expense-filter-popover');
    if (pop) pop.hidden = true;
    document.querySelectorAll('.expense-filter-pill').forEach(function (b) {
      b.setAttribute('aria-expanded', 'false');
      b.classList.remove('is-open');
    });
    openFilter = null;
    draft = null;
  }

  function positionPopover(anchor, pop) {
    var panel = document.querySelector('.expense-entries-panel');
    if (!panel) return;
    var panelRect = panel.getBoundingClientRect();
    var rect = anchor.getBoundingClientRect();
    var top = rect.bottom - panelRect.top + 6;
    var left = rect.left - panelRect.left;
    var maxLeft = panelRect.width - (pop.offsetWidth || 340) - 8;
    pop.style.top = Math.max(0, top) + 'px';
    pop.style.left = Math.max(8, Math.min(left, maxLeft)) + 'px';
  }

  function renderCalendar(monthDate, range) {
    var y = monthDate.getFullYear();
    var m = monthDate.getMonth();
    var first = new Date(y, m, 1);
    var startWd = first.getDay();
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var cells = '';
    var i;
    for (i = 0; i < startWd; i++) cells += '<span class="meter-cal__day meter-cal__day--empty"></span>';
    for (i = 1; i <= daysInMonth; i++) {
      var iso = toIso(new Date(y, m, i));
      var cls = 'meter-cal__day';
      if (iso === range.start || iso === range.end) cls += ' is-endpoint';
      if (iso >= range.start && iso <= range.end) cls += ' is-in-range';
      if (iso === (calPick === 'start' ? range.start : range.end)) cls += ' is-selected';
      cells += '<button type="button" class="' + cls + '" data-date="' + iso + '">' + i + '</button>';
    }
    var monthLabel = monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    return (
      '<div class="meter-cal">' +
        '<div class="meter-cal__nav">' +
          '<button type="button" class="meter-cal__nav-btn" data-cal-prev aria-label="Previous month">‹</button>' +
          '<span class="meter-cal__title">' + monthLabel + '</span>' +
          '<button type="button" class="meter-cal__nav-btn" data-cal-next aria-label="Next month">›</button>' +
        '</div>' +
        '<div class="meter-cal__weekdays"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div>' +
        '<div class="meter-cal__grid">' + cells + '</div>' +
      '</div>'
    );
  }

  function renderDatePopover() {
    var range = draft;
    var presetHtml = DATE_PRESETS.map(function (p) {
      return '<button type="button" class="meter-date-preset' + (range.preset === p.id ? ' is-active' : '') + '" data-preset="' + p.id + '">' + p.label + '</button>';
    }).join('');
    return (
      '<div class="meter-popover meter-popover--date">' +
        '<div class="meter-popover__date-layout">' +
          '<div class="meter-date-presets">' + presetHtml + '</div>' +
          '<div class="meter-date-cal-wrap">' +
            '<div class="meter-drawer-field-picker" style="margin-bottom:10px">' +
              '<button type="button" class="meter-drawer-field-picker__trigger is-open" disabled>Select Date(s)</button>' +
            '</div>' +
            renderCalendar(calMonth, range) +
            '<div class="meter-date-range-inputs">' +
              '<button type="button" class="meter-date-chip' + (calPick === 'start' ? ' is-active' : '') + '" data-cal-pick="start">' + data.formatDate(parseIso(range.start)) + '</button>' +
              '<span class="meter-date-range-sep">–</span>' +
              '<button type="button" class="meter-date-chip' + (calPick === 'end' ? ' is-active' : '') + '" data-cal-pick="end">' + data.formatDate(parseIso(range.end)) + '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="meter-popover__footer">' +
          '<button type="button" class="btn btn-text btn-sm" data-popover-clear>Clear</button>' +
          '<div class="meter-popover__footer-right">' +
            '<button type="button" class="btn btn-text btn-sm" data-popover-cancel>Cancel</button>' +
            '<button type="button" class="btn btn-primary btn-sm" data-popover-apply>Apply</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderSelectPopover(kind, options, selected, searchPlaceholder) {
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
    } else if (kind === 'type') {
      list = options.map(function (opt) {
        var checked = selected.indexOf(opt) !== -1;
        return '<label class="meter-select-item"><input type="checkbox" value="' + escapeAttr(opt) + '"' + (checked ? ' checked' : '') + '><span>' + escapeHtml(opt) + '</span></label>';
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

    return (
      '<div class="meter-popover meter-popover--select">' +
        '<div class="meter-popover__search"><span aria-hidden="true">⌕</span>' +
          '<input type="search" class="meter-popover__search-input" placeholder="' + escapeHtml(searchPlaceholder) + '" data-select-search></div>' +
        '<div class="meter-popover__list" data-select-list>' + list + '</div>' +
        '<div class="meter-popover__footer"><div class="meter-popover__footer-right">' +
          '<button type="button" class="btn btn-text btn-sm" data-popover-cancel>Cancel</button>' +
          '<button type="button" class="btn btn-primary btn-sm" data-popover-apply>Apply</button>' +
        '</div></div></div>'
    );
  }

  function openFilterPopover(kind, anchor) {
    var pop = document.getElementById('expense-filter-popover');
    if (!pop) return;
    openFilter = kind;
    if (kind === 'date') {
      draft = { active: true, start: state.filters.date.start, end: state.filters.date.end, preset: state.filters.date.preset };
      calMonth = parseIso(draft.start);
      calPick = 'start';
      pop.innerHTML = renderDatePopover();
    } else if (kind === 'vehicle') {
      draft = state.filters.vehicles.slice();
      pop.innerHTML = renderSelectPopover('vehicle', [], draft, 'Select item(s)');
    } else if (kind === 'type') {
      draft = state.filters.types.slice();
      pop.innerHTML = renderSelectPopover('type', data.filterTypes, draft, 'Select item(s)');
    } else if (kind === 'watcher') {
      draft = state.filters.watchers.slice();
      pop.innerHTML = renderSelectPopover('watcher', WATCHERS, draft, 'Select item(s)');
    }
    pop.hidden = false;
    anchor.setAttribute('aria-expanded', 'true');
    anchor.classList.add('is-open');
    positionPopover(anchor, pop);
    bindPopoverEvents(kind);
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

  function bindDatePopoverEvents(pop) {
    pop.querySelectorAll('[data-preset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var r = presetRange(btn.getAttribute('data-preset'));
        draft.start = r.start; draft.end = r.end; draft.preset = btn.getAttribute('data-preset');
        calMonth = parseIso(draft.start);
        pop.innerHTML = renderDatePopover();
        bindPopoverEvents('date');
      });
    });
    pop.querySelector('[data-cal-prev]') && pop.querySelector('[data-cal-prev]').addEventListener('click', function () {
      calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1);
      pop.innerHTML = renderDatePopover();
      bindPopoverEvents('date');
    });
    pop.querySelector('[data-cal-next]') && pop.querySelector('[data-cal-next]').addEventListener('click', function () {
      calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1);
      pop.innerHTML = renderDatePopover();
      bindPopoverEvents('date');
    });
    pop.querySelectorAll('[data-cal-pick]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        calPick = btn.getAttribute('data-cal-pick');
        pop.querySelectorAll('[data-cal-pick]').forEach(function (b) {
          b.classList.toggle('is-active', b.getAttribute('data-cal-pick') === calPick);
        });
      });
    });
    pop.querySelectorAll('[data-date]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var iso = btn.getAttribute('data-date');
        if (calPick === 'start') draft.start = iso;
        else draft.end = iso;
        draft.preset = null;
        pop.innerHTML = renderDatePopover();
        bindPopoverEvents('date');
      });
    });
  }

  function bindPopoverEvents(kind) {
    var pop = document.getElementById('expense-filter-popover');
    if (!pop) return;

    pop.querySelector('[data-popover-cancel]') && pop.querySelector('[data-popover-cancel]').addEventListener('click', closePopover);
    pop.querySelector('[data-popover-clear]') && pop.querySelector('[data-popover-clear]').addEventListener('click', function () {
      if (kind === 'date') {
        state.filters.date = { active: false, start: defaultDateRange.start, end: defaultDateRange.end, preset: null };
        closePopover();
        state.page = 1;
        renderTable();
      }
    });
    pop.querySelector('[data-popover-apply]') && pop.querySelector('[data-popover-apply]').addEventListener('click', function () {
      if (kind === 'date') {
        state.filters.date = { active: true, start: draft.start, end: draft.end, preset: draft.preset };
        if (draft.start > draft.end) {
          var t = state.filters.date.start;
          state.filters.date.start = state.filters.date.end;
          state.filters.date.end = t;
        }
      } else if (kind === 'vehicle') state.filters.vehicles = getCheckedValues(pop);
      else if (kind === 'type') state.filters.types = getCheckedValues(pop);
      else if (kind === 'watcher') state.filters.watchers = getCheckedValues(pop);
      closePopover();
      state.page = 1;
      renderTable();
    });

    if (kind === 'date') bindDatePopoverEvents(pop);
    else bindSelectSearch(pop);
  }

  /* ── Filters drawer ──────────────────────────────────────── */
  function isDrawerOpen() {
    var drawer = document.getElementById('expense-filters-drawer');
    return drawer && drawer.classList.contains('is-open');
  }

  function openDrawer() {
    closePopover();
    closeTableSettings();
    var drawer = document.getElementById('expense-filters-drawer');
    if (drawer) {
      drawer.classList.add('is-open');
      renderDrawerBody();
      updateFilterPills();
    }
  }

  function closeDrawer() {
    var drawer = document.getElementById('expense-filters-drawer');
    if (drawer) drawer.classList.remove('is-open');
    updateFilterPills();
  }

  function renderDrawerBody() {
    var body = document.getElementById('expense-filters-drawer-body');
    if (!body) return;
    var f = state.filters;
    var count = activeFilterCount();
    var applied = '';

    if (f.date.active) {
      applied += '<div class="expense-drawer-applied"><span>Date</span><span>' + escapeHtml(formatRangeLabel(f.date.start, f.date.end)) + '</span>' +
        '<button type="button" data-clear-filter="date" aria-label="Remove">×</button></div>';
    }
    if (f.vehicles.length) {
      applied += '<div class="expense-drawer-applied"><span>Vehicle</span><span>' + f.vehicles.length + ' selected</span>' +
        '<button type="button" data-clear-filter="vehicle">×</button></div>';
    }
    if (f.types.length) {
      applied += '<div class="expense-drawer-applied"><span>Type</span><span>' + escapeHtml(f.types.join(', ')) + '</span>' +
        '<button type="button" data-clear-filter="type">×</button></div>';
    }
    if (f.watchers.length) {
      applied += '<div class="expense-drawer-applied"><span>Watcher</span><span>' + escapeHtml(f.watchers.join(', ')) + '</span>' +
        '<button type="button" data-clear-filter="watcher">×</button></div>';
    }

    body.innerHTML =
      (count ? applied : '<p class="expense-drawer-empty">No filters applied.</p>') +
      '<button type="button" class="btn btn-primary btn-sm expense-drawer-add" id="expense-drawer-add">Add Filter <span aria-hidden="true">▾</span></button>' +
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
        if (key === 'date') state.filters.date.active = false;
        else if (key === 'vehicle') state.filters.vehicles = [];
        else if (key === 'type') state.filters.types = [];
        else if (key === 'watcher') state.filters.watchers = [];
        state.page = 1;
        renderTable();
      });
    });

    body.querySelectorAll('[data-open-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-open-filter');
        var pillMap = { vehicle: 'vehicle', group: 'vehicle', vendor: 'type', 'vendor-contact': 'type', 'vendor-phone': 'type', 'vendor-labels': 'type' };
        var pill = document.querySelector('.expense-filter-pill[data-filter="' + (pillMap[id] || 'vehicle') + '"]');
        if (pill) openFilterPopover(pillMap[id] || id, pill);
      });
    });

    var addBtn = document.getElementById('expense-drawer-add');
    if (addBtn) {
      addBtn.onclick = function () {
        var pill = document.querySelector('.expense-filter-pill[data-filter="vehicle"]');
        if (pill) openFilterPopover('vehicle', pill);
      };
    }
  }

  function bindDrawerEvents() {
    var drawer = document.getElementById('expense-filters-drawer');
    if (!drawer || drawer.getAttribute('data-bound')) return;
    drawer.setAttribute('data-bound', '1');
    document.getElementById('expense-filters-drawer-close') && document.getElementById('expense-filters-drawer-close').addEventListener('click', closeDrawer);
    document.getElementById('expense-filters-btn') && document.getElementById('expense-filters-btn').addEventListener('click', function () {
      if (isDrawerOpen()) closeDrawer();
      else openDrawer();
    });
  }

  /* ── Table settings ────────────────────────────────────────── */
  function closeTableSettings() {
    var el = document.getElementById('expense-table-settings');
    if (el) el.hidden = true;
  }

  function renderTableSettings(anchor) {
    var el = document.getElementById('expense-table-settings');
    if (!el) return;
    var sizes = [50, 100, 200];
    el.innerHTML =
      '<div class="meter-table-settings__section"><div class="meter-table-settings__title">Items Per Page</div>' +
      sizes.map(function (n) {
        return '<label class="meter-settings-option"><input type="radio" name="exp-page-size" value="' + n + '"' + (state.pageSize === n ? ' checked' : '') + '> ' + n + '</label>';
      }).join('') + '</div>';
    el.hidden = false;
    positionPopover(anchor, el);
  }

  function setTab(tab) {
    state.tab = tab;
    state.page = 1;
    document.querySelectorAll('.expense-segment-tab').forEach(function (btn) {
      var on = btn.getAttribute('data-tab') === tab;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    renderTable();
  }

  function bindEvents() {
    document.querySelectorAll('.expense-segment-tab').forEach(function (btn) {
      btn.addEventListener('click', function () { setTab(btn.getAttribute('data-tab')); });
    });

    var search = document.getElementById('expense-search');
    if (search) {
      search.addEventListener('input', function () {
        state.search = search.value;
        state.page = 1;
        renderTable();
      });
    }

    var pageEl = document.getElementById('expense-pagination');
    if (pageEl) {
      pageEl.querySelector('[data-page-prev]').addEventListener('click', function () {
        if (state.page > 1) { state.page -= 1; renderTable(); }
      });
      pageEl.querySelector('[data-page-next]').addEventListener('click', function () {
        state.page += 1;
        renderTable();
      });
    }

    document.querySelectorAll('.expense-filter-pill').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var kind = btn.getAttribute('data-filter');
        if (openFilter === kind && !document.getElementById('expense-filter-popover').hidden) {
          closePopover();
          return;
        }
        closePopover();
        closeTableSettings();
        openFilterPopover(kind, btn);
      });
    });

    var settingsBtn = document.getElementById('expense-table-settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        closePopover();
        var el = document.getElementById('expense-table-settings');
        if (!el.hidden) { closeTableSettings(); return; }
        renderTableSettings(settingsBtn);
      });
    }

    document.getElementById('expense-table-settings') && document.getElementById('expense-table-settings').addEventListener('change', function (e) {
      if (e.target.name === 'exp-page-size') {
        state.pageSize = parseInt(e.target.value, 10);
        state.page = 1;
        renderTable();
      }
    });

    document.addEventListener('click', function (e) {
      var pop = document.getElementById('expense-filter-popover');
      var settings = document.getElementById('expense-table-settings');
      if (pop && !pop.hidden && !pop.contains(e.target) && !e.target.closest('.expense-filter-pill')) closePopover();
      if (settings && !settings.hidden && !settings.contains(e.target) && !e.target.closest('#expense-table-settings-btn')) closeTableSettings();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closePopover();
        closeTableSettings();
        closeDrawer();
      }
    });

    bindDrawerEvents();
    document.getElementById('expense-add-btn') && document.getElementById('expense-add-btn').addEventListener('click', function () {
      window.location.href = 'vehicle-expense-form';
    });
  }

  function init() {
    var iconEl = document.getElementById('expense-filters-btn-icon');
    if (iconEl && window.YSOAM_ICONS && window.YSOAM_ICONS.mapFilter) {
      iconEl.innerHTML = window.YSOAM_ICONS.mapFilter;
    }
    setTab('past');
    bindEvents();
  }

  if (document.body.getAttribute('data-subpage') === 'expense-history') {
    init();
  }
})();
