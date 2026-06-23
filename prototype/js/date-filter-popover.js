window.YSOAM_DATE_FILTER = (function () {
  'use strict';

  var MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  var PRESETS = [
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

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function referenceNow() {
    return new Date(2026, 5, 23);
  }

  function toIso(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function parseIso(s) {
    var p = String(s || '').split('-');
    return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
  }

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function endOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  }

  function presetRange(id) {
    var now = referenceNow();
    var start;
    var end = endOfDay(now);

    if (id === 'today') start = startOfDay(now);
    else if (id === 'yesterday') {
      var y = new Date(now);
      y.setDate(y.getDate() - 1);
      start = startOfDay(y);
      end = endOfDay(y);
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

    return { start: toIso(start), end: toIso(end), preset: id };
  }

  function formatDate(iso) {
    var d = parseIso(iso);
    return MONTHS_SHORT[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  function formatChip(iso, edge) {
    return formatDate(iso) + (edge === 'end' ? ' 11:59pm' : ' 12:00am');
  }

  function presetLabel(id) {
    var p = PRESETS.find(function (item) { return item.id === id; });
    return p ? p.label : 'Custom';
  }

  function matchesRange(isoDateTime, filter) {
    if (!filter || !filter.active || !filter.start || !filter.end) return true;
    var d = new Date(isoDateTime);
    return d >= startOfDay(parseIso(filter.start)) && d <= endOfDay(parseIso(filter.end));
  }

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function dayCell(iso, label, range, calPick, outside) {
    var cls = 'meter-cal__day';
    if (outside) cls += ' is-outside';
    if (iso === toIso(referenceNow())) cls += ' is-today';
    if (iso === range.start || iso === range.end) cls += ' is-endpoint';
    if (iso >= range.start && iso <= range.end) cls += ' is-in-range';
    if (iso === (calPick === 'start' ? range.start : range.end)) cls += ' is-selected';
    return '<button type="button" class="' + cls + '" data-date="' + iso + '">' + label + '</button>';
  }

  function renderCalendar(monthDate, range, calPick) {
    var y = monthDate.getFullYear();
    var m = monthDate.getMonth();
    var first = new Date(y, m, 1);
    var startWd = first.getDay();
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var cells = '';
    var i;

    var prevMonthDays = new Date(y, m, 0).getDate();
    for (i = startWd - 1; i >= 0; i--) {
      var prevDay = prevMonthDays - i;
      cells += dayCell(toIso(new Date(y, m - 1, prevDay)), prevDay, range, calPick, true);
    }

    for (i = 1; i <= daysInMonth; i++) {
      cells += dayCell(toIso(new Date(y, m, i)), i, range, calPick, false);
    }

    var totalCells = startWd + daysInMonth;
    var trailing = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (i = 1; i <= trailing; i++) {
      cells += dayCell(toIso(new Date(y, m + 1, i)), i, range, calPick, true);
    }

    var monthOptions = MONTHS_LONG.map(function (name, idx) {
      return '<option value="' + idx + '"' + (idx === m ? ' selected' : '') + '>' + name + '</option>';
    }).join('');

    var yearOptions = '';
    for (i = y - 5; i <= y + 5; i++) {
      yearOptions += '<option value="' + i + '"' + (i === y ? ' selected' : '') + '>' + i + '</option>';
    }

    return (
      '<div class="meter-cal">' +
        '<div class="meter-cal__nav meter-cal__nav--selects">' +
          '<div class="meter-cal__selects">' +
            '<select class="meter-cal__month-select" data-cal-month aria-label="Month">' + monthOptions + '</select>' +
            '<select class="meter-cal__year-select" data-cal-year aria-label="Year">' + yearOptions + '</select>' +
          '</div>' +
          '<div class="meter-cal__nav-arrows">' +
            '<button type="button" class="meter-cal__nav-btn" data-cal-prev aria-label="Previous month">‹</button>' +
            '<button type="button" class="meter-cal__nav-btn" data-cal-next aria-label="Next month">›</button>' +
          '</div>' +
        '</div>' +
        '<div class="meter-cal__weekdays"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div>' +
        '<div class="meter-cal__grid">' + cells + '</div>' +
      '</div>'
    );
  }

  function renderPopover(draft, ui) {
    var range = draft;
    var calMonth = ui.calMonth;
    var calPick = ui.calPick;

    var presetHtml = PRESETS.map(function (p) {
      return '<button type="button" class="meter-date-preset' + (range.preset === p.id ? ' is-active' : '') + '" data-preset="' + p.id + '">' + esc(p.label) + '</button>';
    }).join('');

    return (
      '<div class="meter-popover meter-popover--date">' +
        '<div class="meter-popover__date-layout">' +
          '<div class="meter-date-presets">' + presetHtml + '</div>' +
          '<div class="meter-date-cal-wrap">' +
            '<div class="meter-drawer-field-picker meter-date-select-field">' +
              '<input type="text" class="meter-date-select-input" value="" placeholder="Select Date(s)" readonly aria-label="Select dates">' +
            '</div>' +
            renderCalendar(calMonth, range, calPick) +
            '<div class="meter-date-range-inputs">' +
              '<button type="button" class="meter-date-chip' + (calPick === 'start' ? ' is-active' : '') + '" data-cal-pick="start">' + esc(formatChip(range.start, 'start')) + '</button>' +
              '<span class="meter-date-range-sep">–</span>' +
              '<button type="button" class="meter-date-chip' + (calPick === 'end' ? ' is-active' : '') + '" data-cal-pick="end">' + esc(formatChip(range.end, 'end')) + '</button>' +
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

  function bindPopover(pop, draft, ui, callbacks) {
    function refresh() {
      pop.innerHTML = renderPopover(draft, ui);
      var input = pop.querySelector('.meter-date-select-input');
      if (input) {
        input.value = formatDate(draft.start) + ' – ' + formatDate(draft.end);
      }
      bindPopover(pop, draft, ui, callbacks);
    }

    pop.querySelector('[data-popover-cancel]') && pop.querySelector('[data-popover-cancel]').addEventListener('click', function () {
      if (callbacks.onCancel) callbacks.onCancel();
    });

    pop.querySelector('[data-popover-clear]') && pop.querySelector('[data-popover-clear]').addEventListener('click', function () {
      if (callbacks.onClear) callbacks.onClear();
    });

    pop.querySelector('[data-popover-apply]') && pop.querySelector('[data-popover-apply]').addEventListener('click', function () {
      if (draft.start > draft.end) {
        var tmp = draft.start;
        draft.start = draft.end;
        draft.end = tmp;
      }
      if (callbacks.onApply) callbacks.onApply(draft);
    });

    pop.querySelectorAll('[data-preset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var picked = presetRange(btn.getAttribute('data-preset'));
        draft.start = picked.start;
        draft.end = picked.end;
        draft.preset = picked.preset;
        ui.calMonth = parseIso(draft.start);
        refresh();
      });
    });

    var prev = pop.querySelector('[data-cal-prev]');
    if (prev) {
      prev.addEventListener('click', function () {
        ui.calMonth = new Date(ui.calMonth.getFullYear(), ui.calMonth.getMonth() - 1, 1);
        refresh();
      });
    }

    var next = pop.querySelector('[data-cal-next]');
    if (next) {
      next.addEventListener('click', function () {
        ui.calMonth = new Date(ui.calMonth.getFullYear(), ui.calMonth.getMonth() + 1, 1);
        refresh();
      });
    }

    var monthSelect = pop.querySelector('[data-cal-month]');
    if (monthSelect) {
      monthSelect.addEventListener('change', function () {
        ui.calMonth = new Date(ui.calMonth.getFullYear(), parseInt(monthSelect.value, 10), 1);
        refresh();
      });
    }

    var yearSelect = pop.querySelector('[data-cal-year]');
    if (yearSelect) {
      yearSelect.addEventListener('change', function () {
        ui.calMonth = new Date(parseInt(yearSelect.value, 10), ui.calMonth.getMonth(), 1);
        refresh();
      });
    }

    pop.querySelectorAll('[data-cal-pick]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        ui.calPick = btn.getAttribute('data-cal-pick');
        pop.querySelectorAll('[data-cal-pick]').forEach(function (b) {
          b.classList.toggle('is-active', b.getAttribute('data-cal-pick') === ui.calPick);
        });
      });
    });

    pop.querySelectorAll('[data-date]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var iso = btn.getAttribute('data-date');
        if (ui.calPick === 'start') draft.start = iso;
        else draft.end = iso;
        draft.preset = null;
        ui.calMonth = parseIso(iso);
        refresh();
      });
    });

    var input = pop.querySelector('.meter-date-select-input');
    if (input) {
      input.value = formatDate(draft.start) + ' – ' + formatDate(draft.end);
    }
  }

  function createDraftFromFilter(filter) {
    if (!filter || !filter.start || !filter.end) {
      var def = presetRange('last30');
      return { start: def.start, end: def.end, preset: filter && filter.preset ? filter.preset : 'last30' };
    }
    return { start: filter.start, end: filter.end, preset: filter.preset || null };
  }

  return {
    PRESETS: PRESETS,
    presetRange: presetRange,
    presetLabel: presetLabel,
    formatDate: formatDate,
    toIso: toIso,
    parseIso: parseIso,
    matchesRange: matchesRange,
    createDraftFromFilter: createDraftFromFilter,
    renderPopover: renderPopover,
    bindPopover: bindPopover
  };
})();
