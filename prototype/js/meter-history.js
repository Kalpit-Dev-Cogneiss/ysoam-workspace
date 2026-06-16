(function () {
  var vehicles = window.YSOAM_VEHICLES;
  var data = window.YSOAM_METER_HISTORY;

  var VOID_OPTIONS = [
    { id: 'all-voided', label: 'All Voided' },
    { id: 'manual', label: 'Manually Voided' },
    { id: 'auto', label: 'Auto Voided' },
    { id: 'none', label: 'Not Voided' }
  ];

  var FILTER_FIELDS = [
    { type: 'header', label: 'METER ENTRY' },
    { id: 'conflict', label: 'Conflicting Meters Caused By ID' },
    { id: 'created', label: 'Created On' },
    { id: 'meterDate', label: 'Meter Date' },
    { id: 'meterType', label: 'Meter Type' },
    { id: 'meterValue', label: 'Meter Value' },
    { id: 'vehicle', label: 'Vehicle' },
    { id: 'void', label: 'Void Status' }
  ];

  var ICON_LOCK = '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="5" y="9" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M7 9V7a3 3 0 016 0v2" stroke="currentColor" stroke-width="1.4"/></svg>';
  var ICON_TRASH = '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M8 3h4l1 2h4v2H3V5h4l1-2zM6 9v8h8V9H6z" fill="currentColor"/></svg>';

  var drawerUi = {
    bannerDismissed: false,
    builderLogic: 'all',
    seq: 1,
    customFilters: [],
    filterGroups: []
  };

  var METER_TYPES = [
    { id: 'Primary', label: 'Primary Meter' },
    { id: 'Secondary', label: 'Secondary Meter' }
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

  var defaultDateRange = presetRange('last30');

  var state = {
    search: '',
    page: 1,
    pageSize: 50,
    density: 'default',
    filters: {
      date: { active: false, start: defaultDateRange.start, end: defaultDateRange.end, preset: null },
      vehicles: [],
      meterTypes: [],
      void: []
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

  function statusLabel(status) {
    var map = {
      active: 'Active', transit: 'In Transit', idle: 'Idle',
      offline: 'Offline', maintenance: 'Maintenance'
    };
    return map[status] || status;
  }

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, '&quot;');
  }

  function vehicleMeta(v) {
    return statusLabel(v.status) + ' · ' + v.type + ' · ' + v.group;
  }

  function activeFilterCount() {
    var n = 0;
    if (state.filters.date.active) n += 1;
    if (state.filters.vehicles.length) n += 1;
    if (state.filters.meterTypes.length) n += 1;
    if (state.filters.void.length) n += 1;
    return n;
  }

  function matchesVoid(entry) {
    var sel = state.filters.void;
    if (!sel.length) return true;
    return sel.some(function (id) {
      if (id === 'all-voided') return entry.void;
      if (id === 'manual') return entry.voidType === 'manual';
      if (id === 'auto') return entry.voidType === 'auto';
      if (id === 'none') return !entry.void;
      return false;
    });
  }

  function filteredList() {
    var q = state.search.trim().toLowerCase();
    var f = state.filters;
    return data.list.filter(function (e) {
      if (f.date.active) {
        var d = e.meterDate;
        if (d < f.date.start || d > f.date.end) return false;
      }
      if (f.vehicles.length && f.vehicles.indexOf(e.vehicleId) === -1) return false;
      if (f.meterTypes.length && f.meterTypes.indexOf(e.meterType) === -1) return false;
      if (!matchesVoid(e)) return false;
      if (!q) return true;
      var v = vehicles.getById(e.vehicleId);
      var hay = [
        e.id, e.vehicleId, v && v.make, v && v.model, v && v.group,
        e.source && e.source.label, e.meterType
      ].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function pagedList(list) {
    var start = (state.page - 1) * state.pageSize;
    return list.slice(start, start + state.pageSize);
  }

  function sourceCell(source) {
    if (!source) return '—';
    if (source.href) {
      return '<a class="meter-source-link" href="' + escapeHtml(source.href) + '">' + escapeHtml(source.label) + '</a>';
    }
    return escapeHtml(source.label);
  }

  function updateFilterPills() {
    var f = state.filters;
    document.querySelectorAll('.meter-filter-pill').forEach(function (btn) {
      var key = btn.getAttribute('data-filter');
      var on = false;
      if (key === 'date') on = f.date.active;
      else if (key === 'vehicle') on = f.vehicles.length > 0;
      else if (key === 'type') on = f.meterTypes.length > 0;
      else if (key === 'void') on = f.void.length > 0;
      btn.classList.toggle('has-filter', on);
    });
    var badge = document.getElementById('meter-filter-badge');
    var count = activeFilterCount();
    if (badge) {
      badge.textContent = count + ' Filter' + (count === 1 ? '' : 's');
      badge.hidden = count < 1;
    }
  }

  function renderTable() {
    var root = document.getElementById('meter-history-table');
    var countEl = document.getElementById('meter-count');
    var pageEl = document.getElementById('meter-pagination');
    if (!root) return;

    var all = filteredList();
    var total = all.length;
    var totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    if (state.page > totalPages) state.page = totalPages;
    var rows = pagedList(all);
    var start = total ? (state.page - 1) * state.pageSize + 1 : 0;
    var end = Math.min(state.page * state.pageSize, total);
    var compact = state.density === 'compact';

    var html = '<table class="data-table data-table--list data-table--meter-history' + (compact ? ' data-table--compact' : '') + '">' +
      '<thead><tr>' +
        '<th class="data-table__check-col"><input type="checkbox" aria-label="Select all"></th>' +
        '<th>Vehicle</th>' +
        '<th>Meter Date</th>' +
        '<th>Meter Value</th>' +
        '<th>Meter Type</th>' +
        '<th>Void</th>' +
        '<th>Source</th>' +
        '<th>Auto-Void Reason</th>' +
      '</tr></thead><tbody>';

    if (!rows.length) {
      html += '<tr><td colspan="8" class="meter-history-empty">No meter entries match your filters.</td></tr>';
    } else {
      rows.forEach(function (e) {
        var v = vehicles.getById(e.vehicleId);
        if (!v) return;
        var dotColor = data.statusColor(v.status);
        var detailUrl = 'vehicle-detail?id=' + encodeURIComponent(v.id) + '#meter';
        html += '<tr>' +
          '<td class="data-table__check-col"><input type="checkbox" aria-label="Select row"></td>' +
          '<td><div class="meter-vehicle-cell">' +
            '<img class="meter-vehicle-thumb" src="' + escapeHtml(v.image) + '" alt="">' +
            '<span class="meter-vehicle-status" style="background:' + dotColor + '" aria-hidden="true"></span>' +
            '<div class="meter-vehicle-info">' +
              '<a class="meter-vehicle-link" href="' + detailUrl + '">' + escapeHtml(v.name) + '</a>' +
              '<span class="meter-vehicle-meta">' + escapeHtml(statusLabel(v.status) + ' · ' + v.type + ' · ' + v.group) + '</span>' +
            '</div>' +
          '</div></td>' +
          '<td class="tabular-nums"><a class="meter-date-link" href="#">' + escapeHtml(data.formatDate(parseIso(e.meterDate))) + '</a></td>' +
          '<td><div class="meter-value-cell">' +
            '<strong class="meter-value-cell__main tabular-nums">' + escapeHtml(data.formatValue(e)) + '</strong>' +
            '<span class="meter-value-cell__sub">' + escapeHtml(data.valueSubtext(e, all)) + '</span>' +
          '</div></td>' +
          '<td>' + escapeHtml(e.meterType) + '</td>' +
          '<td>' + (e.void ? 'Yes' : '—') + '</td>' +
          '<td>' + sourceCell(e.source) + '</td>' +
          '<td>' + (e.autoVoidReason ? escapeHtml(e.autoVoidReason) : '—') + '</td>' +
        '</tr>';
      });
    }

    html += '</tbody></table>';
    root.innerHTML = html;

    if (countEl) countEl.textContent = start + ' – ' + end + ' of ' + total;
    if (pageEl) {
      pageEl.querySelector('[data-page-prev]').disabled = state.page <= 1;
      pageEl.querySelector('[data-page-next]').disabled = state.page >= totalPages;
    }
    updateFilterPills();
    if (isDrawerOpen()) renderDrawerBody();
  }

  function isDrawerOpen() {
    var drawer = document.getElementById('meter-filters-drawer');
    return drawer && drawer.classList.contains('is-open');
  }

  /* ── Popover positioning ─────────────────────────────────── */
  function closePopover() {
    var pop = document.getElementById('meter-filter-popover');
    if (pop) pop.hidden = true;
    document.querySelectorAll('.meter-filter-pill').forEach(function (b) {
      b.setAttribute('aria-expanded', 'false');
      b.classList.remove('is-open');
    });
    openFilter = null;
    draft = null;
  }

  function positionPopover(anchor, pop) {
    var panel = document.querySelector('.meter-history-panel');
    if (!panel) return;
    var panelRect = panel.getBoundingClientRect();
    var rect = anchor.getBoundingClientRect();
    var top = rect.bottom - panelRect.top + 6;
    var left = rect.left - panelRect.left;
    var maxLeft = panelRect.width - pop.offsetWidth - 8;
    pop.style.top = Math.max(0, top) + 'px';
    pop.style.left = Math.max(8, Math.min(left, maxLeft)) + 'px';
  }

  function closeTableSettings() {
    var el = document.getElementById('meter-table-settings');
    if (el) el.hidden = true;
    var btn = document.getElementById('meter-table-settings-btn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function positionTableSettings(anchor, pop) {
    var panel = document.querySelector('.meter-history-panel');
    if (!panel) return;
    var panelRect = panel.getBoundingClientRect();
    var rect = anchor.getBoundingClientRect();
    pop.style.top = (rect.bottom - panelRect.top + 6) + 'px';
    pop.style.right = '8px';
    pop.style.left = 'auto';
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
            renderCalendar(calMonth, range) +
            '<div class="meter-date-range-inputs">' +
              '<button type="button" class="meter-date-chip' + (calPick === 'start' ? ' is-active' : '') + '" data-cal-pick="start">' + data.formatDate(parseIso(range.start)) + ' 12:00am</button>' +
              '<span class="meter-date-range-sep">–</span>' +
              '<button type="button" class="meter-date-chip' + (calPick === 'end' ? ' is-active' : '') + '" data-cal-pick="end">' + data.formatDate(parseIso(range.end)) + ' 11:59pm</button>' +
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
    var list = options.map(function (opt) {
      var checked = selected.indexOf(opt.id) !== -1;
      return (
        '<label class="meter-select-item">' +
          '<input type="checkbox" value="' + escapeHtml(opt.id) + '"' + (checked ? ' checked' : '') + '>' +
          '<span>' + escapeHtml(opt.label) + '</span>' +
        '</label>'
      );
    }).join('');

    if (kind === 'vehicle') {
      list = (vehicles.list || []).filter(function (v) { return v.assignment !== 'archived'; }).map(function (v) {
        var checked = selected.indexOf(v.id) !== -1;
        var dot = data.statusColor(v.status);
        return (
          '<label class="meter-select-item meter-select-item--vehicle">' +
            '<input type="checkbox" value="' + escapeHtml(v.id) + '"' + (checked ? ' checked' : '') + '>' +
            '<img class="meter-select-item__thumb" src="' + escapeHtml(v.image) + '" alt="">' +
            '<span class="meter-select-item__status" style="background:' + dot + '"></span>' +
            '<span class="meter-select-item__text">' +
              '<strong>' + escapeHtml(v.name) + '</strong>' +
              '<span>' + escapeHtml(statusLabel(v.status) + ' · ' + v.type + ' · ' + v.group) + '</span>' +
            '</span>' +
          '</label>'
        );
      }).join('');
    }

    return (
      '<div class="meter-popover meter-popover--select">' +
        '<div class="meter-popover__search">' +
          '<span aria-hidden="true">⌕</span>' +
          '<input type="search" class="meter-popover__search-input" placeholder="' + escapeHtml(searchPlaceholder) + '" data-select-search>' +
        '</div>' +
        '<div class="meter-popover__list" data-select-list>' + list + '</div>' +
        '<div class="meter-popover__footer">' +
          '<div class="meter-popover__footer-right">' +
            '<button type="button" class="btn btn-text btn-sm" data-popover-cancel>Cancel</button>' +
            '<button type="button" class="btn btn-primary btn-sm" data-popover-apply>Apply</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function openFilterPopover(kind, anchor) {
    var pop = document.getElementById('meter-filter-popover');
    if (!pop) return;
    openFilter = kind;
    if (kind === 'date') {
      draft = {
        active: true,
        start: state.filters.date.start,
        end: state.filters.date.end,
        preset: state.filters.date.preset
      };
      calMonth = parseIso(draft.start);
      calPick = 'start';
      pop.innerHTML = renderDatePopover();
    } else if (kind === 'vehicle') {
      draft = state.filters.vehicles.slice();
      pop.innerHTML = renderSelectPopover('vehicle', [], draft, 'Select item(s)');
    } else if (kind === 'type') {
      draft = state.filters.meterTypes.slice();
      pop.innerHTML = renderSelectPopover('type', METER_TYPES, draft, 'Select Item(s)');
    } else if (kind === 'void') {
      draft = state.filters.void.slice();
      pop.innerHTML = renderSelectPopover('void', VOID_OPTIONS, draft, 'Select item(s)');
    }
    pop.hidden = false;
    anchor.setAttribute('aria-expanded', 'true');
    anchor.classList.add('is-open');
    positionPopover(anchor, pop);
    bindPopoverEvents(kind);
  }

  function bindPopoverEvents(kind) {
    var pop = document.getElementById('meter-filter-popover');
    if (!pop) return;

    pop.querySelector('[data-popover-cancel]') && pop.querySelector('[data-popover-cancel]').addEventListener('click', closePopover);
    pop.querySelector('[data-popover-clear]') && pop.querySelector('[data-popover-clear]').addEventListener('click', function () {
      if (kind === 'date') {
        draft = { active: false, start: defaultDateRange.start, end: defaultDateRange.end, preset: null };
        state.filters.date = { active: false, start: draft.start, end: draft.end, preset: null };
        closePopover();
        state.page = 1;
        renderTable();
      }
    });

    pop.querySelector('[data-popover-apply]') && pop.querySelector('[data-popover-apply]').addEventListener('click', function () {
      if (kind === 'date') {
        state.filters.date = {
          active: true,
          start: draft.start,
          end: draft.end,
          preset: draft.preset
        };
        if (draft.start > draft.end) {
          var t = draft.start; draft.start = draft.end; draft.end = t;
          state.filters.date.start = draft.start;
          state.filters.date.end = draft.end;
        }
      } else if (kind === 'vehicle') {
        state.filters.vehicles = getCheckedValues(pop);
      } else if (kind === 'type') {
        state.filters.meterTypes = getCheckedValues(pop);
      } else if (kind === 'void') {
        state.filters.void = getCheckedValues(pop);
      }
      closePopover();
      state.page = 1;
      renderTable();
    });

    if (kind === 'date') bindDatePopoverEvents(pop);
    else bindSelectSearch(pop);
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
        var text = item.textContent.toLowerCase();
        item.hidden = q && text.indexOf(q) === -1;
      });
    });
  }

  function bindDatePopoverEvents(pop) {
    pop.querySelectorAll('[data-preset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var r = presetRange(btn.getAttribute('data-preset'));
        draft.start = r.start;
        draft.end = r.end;
        draft.preset = btn.getAttribute('data-preset');
        draft.active = true;
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

  /* ── Table settings ────────────────────────────────────────── */
  function renderTableSettings() {
    var el = document.getElementById('meter-table-settings');
    if (!el) return;
    var sizes = [50, 100, 200];
    var sizeHtml = sizes.map(function (n) {
      return '<label class="meter-settings-option"><input type="radio" name="page-size" value="' + n + '"' + (state.pageSize === n ? ' checked' : '') + '> ' + n + '</label>';
    }).join('');
    var densities = [
      { id: 'default', label: 'Default' },
      { id: 'compact', label: 'Compact' }
    ];
    var densityHtml = densities.map(function (d) {
      return '<label class="meter-settings-option"><input type="radio" name="density" value="' + d.id + '"' + (state.density === d.id ? ' checked' : '') + '> ' + d.label + '</label>';
    }).join('');
    el.innerHTML =
      '<div class="meter-table-settings__section">' +
        '<div class="meter-table-settings__title">Items Per Page</div>' + sizeHtml +
      '</div>' +
      '<div class="meter-table-settings__section">' +
        '<div class="meter-table-settings__title">Density</div>' + densityHtml +
      '</div>';
    el.hidden = false;
  }

  function bindTableSettings() {
    var el = document.getElementById('meter-table-settings');
    if (!el) return;
    el.addEventListener('change', function (e) {
      if (e.target.name === 'page-size') {
        state.pageSize = parseInt(e.target.value, 10);
        state.page = 1;
        renderTable();
      }
      if (e.target.name === 'density') {
        state.density = e.target.value;
        renderTable();
      }
    });
  }

  /* ── Filters drawer ────────────────────────────────────────── */
  function nextDrawerId() {
    return 'df-' + (drawerUi.seq++);
  }

  function newDrawerFilter() {
    return { id: nextDrawerId(), field: '', fieldLabel: '', open: false, op: 'is', value: '' };
  }

  function findDrawerFilter(id) {
    var i, f;
    for (i = 0; i < drawerUi.customFilters.length; i++) {
      if (drawerUi.customFilters[i].id === id) return drawerUi.customFilters[i];
    }
    for (i = 0; i < drawerUi.filterGroups.length; i++) {
      for (f = 0; f < drawerUi.filterGroups[i].filters.length; f++) {
        if (drawerUi.filterGroups[i].filters[f].id === id) return drawerUi.filterGroups[i].filters[f];
      }
    }
    return null;
  }

  function drawerCanApply() {
    var ok = true;
    drawerUi.customFilters.forEach(function (f) {
      if (!f.field) ok = false;
    });
    drawerUi.filterGroups.forEach(function (g) {
      g.filters.forEach(function (f) {
        if (!f.field) ok = false;
      });
    });
    return ok;
  }

  function renderConnector() {
    return (
      '<div class="meter-drawer-connector" title="This must be AND when in a group with a required filter.">' +
        '<span class="meter-drawer-connector__line"></span>' +
        '<span class="meter-drawer-logic-pill">' +
          '<span>AND</span>' +
          '<span class="meter-drawer-rule__lock">' + ICON_LOCK + '</span>' +
        '</span>' +
        '<span class="meter-drawer-connector__line"></span>' +
      '</div>'
    );
  }

  function renderFieldPicker(filter) {
    var menu = FILTER_FIELDS.map(function (field) {
      if (field.type === 'header') {
        return '<div class="meter-drawer-field-menu__header">' + escapeHtml(field.label) + '</div>';
      }
      return (
        '<button type="button" class="meter-drawer-field-menu__item' + (filter.field === field.id ? ' is-selected' : '') + '" data-pick-field="' + field.id + '" data-filter-id="' + filter.id + '">' +
          escapeHtml(field.label) +
        '</button>'
      );
    }).join('');

    return (
      '<div class="meter-drawer-field-picker">' +
        '<button type="button" class="meter-drawer-field-picker__trigger' + (filter.open ? ' is-open' : '') + '" data-toggle-field="' + filter.id + '">' +
          '<span>' + escapeHtml(filter.fieldLabel || 'Select field') + '</span>' +
          '<span class="meter-drawer-field-picker__chevron">▾</span>' +
        '</button>' +
        '<div class="meter-drawer-field-menu' + (filter.open ? ' is-open' : '') + '" data-field-menu="' + filter.id + '">' +
          '<div class="meter-drawer-field-menu__search-wrap">' +
            '<input type="search" class="meter-drawer-field-menu__search" placeholder="Search fields" data-field-search="' + filter.id + '">' +
          '</div>' +
          '<div class="meter-drawer-field-menu__list" data-field-list="' + filter.id + '">' + menu + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderFilterRule(filter, opts) {
    opts = opts || {};
    var title = opts.title || (filter.fieldLabel || 'New Filter');
    var head =
      '<div class="meter-drawer-rule__head">' +
        '<span class="meter-drawer-rule__title">' + escapeHtml(title) + '</span>' +
        (opts.locked
          ? '<span class="meter-drawer-rule__lock" title="Required filter — cannot be removed">' + ICON_LOCK + '</span>'
          : '<button type="button" class="meter-drawer-rule__delete" data-delete-filter="' + filter.id + '" aria-label="Remove filter">' + ICON_TRASH + '</button>') +
      '</div>';

    var body;
    if (opts.locked) {
      body =
        '<select class="text-input meter-drawer-rule__op" disabled><option>is between</option></select>' +
        '<input type="text" class="text-input meter-drawer-rule__value" readonly value="' + escapeHtml(opts.rangeLabel || '') + '">';
    } else if (!filter.field) {
      body = renderFieldPicker(filter);
    } else {
      body =
        renderFieldPicker(filter) +
        '<select class="text-input meter-drawer-rule__op" data-filter-op="' + filter.id + '">' +
          '<option value="is"' + (filter.op === 'is' ? ' selected' : '') + '>is</option>' +
          '<option value="contains"' + (filter.op === 'contains' ? ' selected' : '') + '>contains</option>' +
        '</select>' +
        '<input type="text" class="text-input meter-drawer-rule__value" placeholder="Enter value" value="' + escapeHtml(filter.value) + '" data-filter-value="' + filter.id + '">';
    }

    return (
      '<div class="meter-drawer-rule' + (opts.locked ? ' meter-drawer-rule--locked' : '') + '" data-rule-id="' + filter.id + '">' +
        head + body +
      '</div>'
    );
  }

  function renderLockedDateRule() {
    var f = state.filters.date;
    var start = f.start || defaultDateRange.start;
    var end = f.end || defaultDateRange.end;
    return renderFilterRule(
      { id: 'locked-date' },
      { locked: true, title: 'Meter Date', rangeLabel: formatRangeLabel(start, end) }
    );
  }

  function renderFilterGroup(group) {
    var rulesHtml = '';
    group.filters.forEach(function (filter, idx) {
      if (idx > 0) rulesHtml += renderConnector();
      rulesHtml += renderFilterRule(filter, { title: filter.fieldLabel || 'New Filter' });
    });

    return (
      '<div class="meter-drawer-group" data-group-id="' + group.id + '">' +
        '<div class="meter-drawer-group__head">' +
          '<select class="meter-drawer-group__logic" data-group-logic="' + group.id + '">' +
            '<option value="all"' + (group.logic === 'all' ? ' selected' : '') + '>All of...</option>' +
            '<option value="any"' + (group.logic === 'any' ? ' selected' : '') + '>Any of...</option>' +
          '</select>' +
          '<button type="button" class="meter-drawer-rule__delete" data-delete-group="' + group.id + '" aria-label="Remove filter group">' + ICON_TRASH + '</button>' +
        '</div>' +
        '<div class="meter-drawer-group__body">' + rulesHtml + '</div>' +
      '</div>'
    );
  }

  function openDrawer() {
    var drawer = document.getElementById('meter-filters-drawer');
    if (!drawer) return;
    closePopover();
    closeTableSettings();
    if (!state.filters.date.active) {
      state.filters.date = {
        active: false,
        start: defaultDateRange.start,
        end: defaultDateRange.end,
        preset: 'last30'
      };
    }
    drawer.classList.add('is-open');
    renderDrawerBody();
  }

  function closeDrawer() {
    var drawer = document.getElementById('meter-filters-drawer');
    if (drawer) drawer.classList.remove('is-open');
    closeAllFieldMenus();
  }

  function closeAllFieldMenus() {
    drawerUi.customFilters.forEach(function (f) { f.open = false; });
    drawerUi.filterGroups.forEach(function (g) {
      g.filters.forEach(function (f) { f.open = false; });
    });
  }

  function renderDrawerBody() {
    var body = document.getElementById('meter-filters-drawer-body');
    var applyBtn = document.getElementById('meter-drawer-apply');
    if (!body) return;

    var rulesHtml = renderLockedDateRule();
    var extras = [];

    drawerUi.customFilters.forEach(function (filter) {
      extras.push({ type: 'filter', data: filter });
    });
    drawerUi.filterGroups.forEach(function (group) {
      extras.push({ type: 'group', data: group });
    });

    extras.forEach(function (item) {
      rulesHtml += renderConnector();
      if (item.type === 'filter') {
        rulesHtml += renderFilterRule(item.data);
      } else {
        rulesHtml += renderFilterGroup(item.data);
      }
    });

    var banner = '';
    if (!drawerUi.bannerDismissed) {
      banner =
        '<div class="meter-drawer-banner">' +
          '<p>You can create up to 3 &ldquo;OR&rdquo; filter types. To add more filters, use &ldquo;AND&rdquo; within the filter builder.</p>' +
          '<button type="button" class="meter-drawer-banner__close" data-dismiss-banner aria-label="Dismiss">×</button>' +
        '</div>';
    }

    body.innerHTML =
      banner +
      '<div class="meter-drawer-builder">' +
        '<select class="meter-drawer-builder__logic" disabled>' +
          '<option>All of...</option>' +
        '</select>' +
        '<div class="meter-drawer-builder__rules">' + rulesHtml + '</div>' +
        '<div class="meter-drawer-builder__actions">' +
          '<button type="button" class="meter-drawer-builder__add" data-add-filter>+ Add Filter</button>' +
          '<button type="button" class="meter-drawer-builder__add" data-add-filter-group>+ Add Filter Group</button>' +
        '</div>' +
      '</div>';

    if (applyBtn) {
      var canApply = drawerCanApply();
      applyBtn.disabled = !canApply;
      applyBtn.classList.toggle('is-disabled', !canApply);
      applyBtn.innerHTML = canApply ? 'Apply' : ('Apply <span class="meter-drawer-apply-lock">' + ICON_LOCK + '</span>');
    }
  }

  function applyDrawerFilters() {
    if (!drawerCanApply()) return;
    state.filters.date.active = true;
    if (!state.filters.date.preset) state.filters.date.preset = 'last30';
    state.page = 1;
    closeDrawer();
    renderTable();
  }

  function clearDrawerFilters() {
    drawerUi.customFilters = [];
    drawerUi.filterGroups = [];
    state.filters.date = {
      active: false,
      start: defaultDateRange.start,
      end: defaultDateRange.end,
      preset: 'last30'
    };
    state.filters.vehicles = [];
    state.filters.meterTypes = [];
    state.filters.void = [];
    state.page = 1;
    renderDrawerBody();
    renderTable();
  }

  function bindDrawerEvents() {
    var drawer = document.getElementById('meter-filters-drawer');
    if (!drawer || drawer.getAttribute('data-bound')) return;
    drawer.setAttribute('data-bound', '1');

    drawer.addEventListener('click', function (e) {
      var addFilter = e.target.closest('[data-add-filter]');
      var addGroup = e.target.closest('[data-add-filter-group]');
      var delFilter = e.target.closest('[data-delete-filter]');
      var delGroup = e.target.closest('[data-delete-group]');
      var toggleField = e.target.closest('[data-toggle-field]');
      var pickField = e.target.closest('[data-pick-field]');
      var dismissBanner = e.target.closest('[data-dismiss-banner]');

      if (addFilter) {
        var nf = newDrawerFilter();
        nf.open = true;
        drawerUi.customFilters.push(nf);
        closeAllFieldMenus();
        nf.open = true;
        renderDrawerBody();
        return;
      }

      if (addGroup) {
        var gf = newDrawerFilter();
        gf.open = true;
        drawerUi.filterGroups.push({
          id: nextDrawerId(),
          logic: 'all',
          filters: [gf]
        });
        renderDrawerBody();
        return;
      }

      if (delFilter) {
        var fid = delFilter.getAttribute('data-delete-filter');
        drawerUi.customFilters = drawerUi.customFilters.filter(function (f) { return f.id !== fid; });
        drawerUi.filterGroups.forEach(function (g) {
          g.filters = g.filters.filter(function (f) { return f.id !== fid; });
        });
        drawerUi.filterGroups = drawerUi.filterGroups.filter(function (g) { return g.filters.length > 0; });
        renderDrawerBody();
        return;
      }

      if (delGroup) {
        var gid = delGroup.getAttribute('data-delete-group');
        drawerUi.filterGroups = drawerUi.filterGroups.filter(function (g) { return g.id !== gid; });
        renderDrawerBody();
        return;
      }

      if (dismissBanner) {
        drawerUi.bannerDismissed = true;
        renderDrawerBody();
        return;
      }

      if (toggleField) {
        var tid = toggleField.getAttribute('data-toggle-field');
        var tf = findDrawerFilter(tid);
        if (!tf) return;
        var wasOpen = tf.open;
        closeAllFieldMenus();
        tf.open = !wasOpen;
        renderDrawerBody();
        return;
      }

      if (pickField) {
        var pid = pickField.getAttribute('data-filter-id');
        var fieldId = pickField.getAttribute('data-pick-field');
        var pf = findDrawerFilter(pid);
        if (!pf) return;
        FILTER_FIELDS.forEach(function (field) {
          if (field.id === fieldId) {
            pf.field = field.id;
            pf.fieldLabel = field.label;
          }
        });
        pf.open = false;
        renderDrawerBody();
        return;
      }
    });

    drawer.addEventListener('input', function (e) {
      if (e.target.matches('[data-filter-value]')) {
        var vf = findDrawerFilter(e.target.getAttribute('data-filter-value'));
        if (vf) vf.value = e.target.value;
      }
      if (e.target.matches('[data-field-search]')) {
        var q = e.target.value.trim().toLowerCase();
        var list = drawer.querySelector('[data-field-list="' + e.target.getAttribute('data-field-search') + '"]');
        if (!list) return;
        list.querySelectorAll('.meter-drawer-field-menu__item').forEach(function (item) {
          item.hidden = q && item.textContent.toLowerCase().indexOf(q) === -1;
        });
      }
    });

    drawer.addEventListener('change', function (e) {
      if (e.target.matches('[data-filter-op]')) {
        var of = findDrawerFilter(e.target.getAttribute('data-filter-op'));
        if (of) of.op = e.target.value;
      }
      if (e.target.matches('[data-group-logic]')) {
        var gid = e.target.getAttribute('data-group-logic');
        drawerUi.filterGroups.forEach(function (g) {
          if (g.id === gid) g.logic = e.target.value;
        });
      }
    });
  }

  /* ── Add Meter Entry modal ─────────────────────────────────── */
  function buildMeterEntryVehicleList() {
    var listEl = document.getElementById('meter-entry-vehicle-list');
    if (!listEl) return;

    listEl.innerHTML = (vehicles.list || []).filter(function (v) {
      return v.assignment !== 'archived';
    }).map(function (v) {
      return (
        '<button type="button" class="assign-picker__option" role="option" data-meter-vehicle-id="' + escapeAttr(v.id) + '">' +
          '<img src="' + escapeAttr(v.image) + '" alt="">' +
          '<span class="assign-picker__option-text">' +
            '<strong>' + escapeHtml(v.name) + '</strong>' +
            '<small>' + escapeHtml(vehicleMeta(v)) + '</small>' +
          '</span>' +
        '</button>'
      );
    }).join('');

    listEl.querySelectorAll('[data-meter-vehicle-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectMeterEntryVehicle(btn.getAttribute('data-meter-vehicle-id'));
        closeMeterEntryPicker();
      });
    });
  }

  function setMeterEntryVehicleTrigger(vehicleId) {
    var trigger = document.getElementById('meter-entry-vehicle-trigger');
    if (!trigger) return;
    if (!vehicleId) {
      trigger.innerHTML =
        '<span class="assign-picker__placeholder">Please select</span>' +
        '<span class="assign-picker__chevron" aria-hidden="true">▾</span>';
      return;
    }
    var v = vehicles.getById(vehicleId);
    if (!v) return;
    trigger.innerHTML =
      '<img src="' + escapeAttr(v.image) + '" alt="">' +
      '<span class="assign-picker__selected">' +
        '<strong>' + escapeHtml(v.name) + '</strong>' +
        '<small>' + escapeHtml(vehicleMeta(v)) + '</small>' +
      '</span>' +
      '<span class="assign-picker__chevron" aria-hidden="true">▾</span>';
  }

  function parseKm(meter) {
    return parseInt(String(meter || '').replace(/[^\d]/g, ''), 10) || 0;
  }

  function demoTodayIso() {
    return '2026-06-15';
  }

  function latestMeterForVehicle(vehicleId) {
    var latest = null;
    data.list.forEach(function (e) {
      if (e.vehicleId === vehicleId && !e.void) {
        if (!latest || new Date(e.meterDate) >= new Date(latest.meterDate)) latest = e;
      }
    });
    if (latest) return latest;
    var v = vehicles.getById(vehicleId);
    return {
      value: parseKm(v && v.meter),
      meterDate: demoTodayIso()
    };
  }

  function populateMeterEntryDetails(vehicleId) {
    var details = document.getElementById('meter-entry-details');
    if (!details) return;
    if (!vehicleId) {
      details.hidden = true;
      return;
    }
    details.hidden = false;

    var last = latestMeterForVehicle(vehicleId);
    var meterInput = document.getElementById('meter-entry-value');
    var dateInput = document.getElementById('meter-entry-date');
    var hint = document.getElementById('meter-entry-last-updated');
    var voidCheck = document.getElementById('meter-entry-void');

    if (meterInput) meterInput.value = String(last.value);
    if (dateInput) dateInput.value = demoTodayIso();
    if (voidCheck) voidCheck.checked = false;
    if (hint) {
      hint.textContent = 'Last updated: ' + last.value.toLocaleString('en-IN') + ' km (Today)';
    }
  }

  function meterEntryFormValid() {
    var vehicleId = document.getElementById('meter-entry-vehicle-id').value;
    if (!vehicleId) return false;
    var details = document.getElementById('meter-entry-details');
    if (details && details.hidden) return false;
    var value = document.getElementById('meter-entry-value').value;
    var date = document.getElementById('meter-entry-date').value;
    return value !== '' && !isNaN(parseFloat(value)) && parseFloat(value) >= 0 && !!date;
  }

  function selectMeterEntryVehicle(vehicleId) {
    var input = document.getElementById('meter-entry-vehicle-id');
    if (input) input.value = vehicleId || '';
    setMeterEntryVehicleTrigger(vehicleId);
    populateMeterEntryDetails(vehicleId);
    updateMeterEntrySaveButtons();
  }

  function updateMeterEntrySaveButtons() {
    var ok = meterEntryFormValid();
    var save = document.getElementById('meter-entry-save');
    var another = document.getElementById('meter-entry-save-another');
    if (save) save.disabled = !ok;
    if (another) another.disabled = !ok;
  }

  function closeMeterEntryPicker() {
    var menu = document.getElementById('meter-entry-vehicle-menu');
    var trigger = document.getElementById('meter-entry-vehicle-trigger');
    if (menu) menu.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function toggleMeterEntryPicker() {
    var menu = document.getElementById('meter-entry-vehicle-menu');
    var trigger = document.getElementById('meter-entry-vehicle-trigger');
    if (!menu || !trigger) return;
    var open = menu.hidden;
    closeMeterEntryPicker();
    if (open) {
      menu.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      var search = document.getElementById('meter-entry-vehicle-search');
      if (search) {
        search.value = '';
        filterMeterEntryVehicleList('');
        search.focus();
      }
    }
  }

  function filterMeterEntryVehicleList(q) {
    var listEl = document.getElementById('meter-entry-vehicle-list');
    if (!listEl) return;
    q = q.trim().toLowerCase();
    listEl.querySelectorAll('.assign-picker__option').forEach(function (btn) {
      var text = btn.textContent.toLowerCase();
      btn.hidden = q && text.indexOf(q) === -1;
    });
  }

  function resetMeterEntryForm() {
    var form = document.getElementById('meter-entry-form');
    if (form) form.reset();
    var details = document.getElementById('meter-entry-details');
    if (details) details.hidden = true;
    selectMeterEntryVehicle('');
    closeMeterEntryPicker();
  }

  function openMeterEntryModal() {
    var modal = document.getElementById('add-meter-entry-modal');
    if (!modal) return;
    closePopover();
    closeTableSettings();
    closeDrawer();
    closeMoreMenu();
    resetMeterEntryForm();
    buildMeterEntryVehicleList();
    modal.classList.add('is-open');
  }

  function closeMeterEntryModal() {
    var modal = document.getElementById('add-meter-entry-modal');
    if (modal) modal.classList.remove('is-open');
    closeMeterEntryPicker();
  }

  function saveMeterEntry(andAnother) {
    if (!meterEntryFormValid()) return;
    var vehicleId = document.getElementById('meter-entry-vehicle-id').value;
    var value = parseFloat(document.getElementById('meter-entry-value').value);
    var meterDate = document.getElementById('meter-entry-date').value;
    var isVoid = document.getElementById('meter-entry-void').checked;
    data.addEntry(vehicleId, { value: value, meterDate: meterDate, void: isVoid });
    state.page = 1;
    renderTable();
    if (andAnother) {
      resetMeterEntryForm();
      buildMeterEntryVehicleList();
      var menu = document.getElementById('meter-entry-vehicle-menu');
      var trigger = document.getElementById('meter-entry-vehicle-trigger');
      if (menu && trigger) {
        menu.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        var search = document.getElementById('meter-entry-vehicle-search');
        if (search) search.focus();
      }
    } else {
      closeMeterEntryModal();
    }
  }

  function bindMeterEntryModal() {
    var addBtn = document.getElementById('meter-add-btn');
    var modal = document.getElementById('add-meter-entry-modal');
    if (!modal) return;

    if (addBtn) addBtn.addEventListener('click', openMeterEntryModal);

    document.getElementById('meter-entry-modal-close') && document.getElementById('meter-entry-modal-close').addEventListener('click', closeMeterEntryModal);
    document.getElementById('meter-entry-cancel') && document.getElementById('meter-entry-cancel').addEventListener('click', closeMeterEntryModal);
    document.getElementById('meter-entry-save') && document.getElementById('meter-entry-save').addEventListener('click', function () {
      saveMeterEntry(false);
    });
    document.getElementById('meter-entry-save-another') && document.getElementById('meter-entry-save-another').addEventListener('click', function () {
      saveMeterEntry(true);
    });

    document.getElementById('meter-entry-vehicle-trigger') && document.getElementById('meter-entry-vehicle-trigger').addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMeterEntryPicker();
    });

    document.getElementById('meter-entry-vehicle-search') && document.getElementById('meter-entry-vehicle-search').addEventListener('input', function (e) {
      filterMeterEntryVehicleList(e.target.value);
    });

    ['meter-entry-value', 'meter-entry-date'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', updateMeterEntrySaveButtons);
    });
    var voidEl = document.getElementById('meter-entry-void');
    if (voidEl) voidEl.addEventListener('change', updateMeterEntrySaveButtons);

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeMeterEntryModal();
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#meter-entry-vehicle-picker')) closeMeterEntryPicker();
    });
  }

  /* ── Header more menu ──────────────────────────────────────── */
  function closeMoreMenu() {
    var panel = document.getElementById('meter-more-panel');
    var btn = document.getElementById('meter-more-btn');
    if (panel) panel.hidden = true;
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function bindEvents() {
    var search = document.getElementById('meter-search');
    if (search) {
      search.oninput = function () {
        state.search = search.value;
        state.page = 1;
        renderTable();
      };
    }

    var pageEl = document.getElementById('meter-pagination');
    if (pageEl) {
      pageEl.querySelector('[data-page-prev]').onclick = function () {
        if (state.page > 1) { state.page -= 1; renderTable(); }
      };
      pageEl.querySelector('[data-page-next]').onclick = function () {
        state.page += 1;
        renderTable();
      };
    }

    document.querySelectorAll('.meter-filter-pill').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var kind = btn.getAttribute('data-filter');
        if (openFilter === kind && !document.getElementById('meter-filter-popover').hidden) {
          closePopover();
          return;
        }
        closePopover();
        closeTableSettings();
        openFilterPopover(kind, btn);
      });
    });

    var badge = document.getElementById('meter-filter-badge');
    if (badge) badge.addEventListener('click', openDrawer);

    var settingsBtn = document.getElementById('meter-table-settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        closePopover();
        var el = document.getElementById('meter-table-settings');
        if (!el.hidden) { closeTableSettings(); return; }
        renderTableSettings();
        el.hidden = false;
        positionTableSettings(settingsBtn, el);
        settingsBtn.setAttribute('aria-expanded', 'true');
      });
    }

    document.getElementById('meter-filters-drawer-close') && document.getElementById('meter-filters-drawer-close').addEventListener('click', closeDrawer);
    document.getElementById('meter-drawer-apply') && document.getElementById('meter-drawer-apply').addEventListener('click', applyDrawerFilters);
    document.getElementById('meter-drawer-clear') && document.getElementById('meter-drawer-clear').addEventListener('click', clearDrawerFilters);
    document.getElementById('meter-open-drawer') && document.getElementById('meter-open-drawer').addEventListener('click', function () {
      closeMoreMenu();
      openDrawer();
    });

    bindDrawerEvents();

    var moreBtn = document.getElementById('meter-more-btn');
    var morePanel = document.getElementById('meter-more-panel');
    if (moreBtn && morePanel) {
      moreBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = morePanel.hidden;
        morePanel.hidden = !open;
        moreBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    document.addEventListener('click', function (e) {
      var pop = document.getElementById('meter-filter-popover');
      var settings = document.getElementById('meter-table-settings');
      if (pop && !pop.hidden && !pop.contains(e.target) && !e.target.closest('.meter-filter-pill')) closePopover();
      if (settings && !settings.hidden && !settings.contains(e.target) && !e.target.closest('#meter-table-settings-btn')) closeTableSettings();
      if (morePanel && !morePanel.hidden && !e.target.closest('#meter-header-menu')) closeMoreMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closePopover();
        closeTableSettings();
        closeDrawer();
        closeMoreMenu();
        closeMeterEntryModal();
      }
    });

    bindTableSettings();
    bindMeterEntryModal();
  }

  function init() {
    renderTable();
    bindEvents();
  }

  if (document.body.getAttribute('data-subpage') === 'meter-history') {
    init();
  }
})();
