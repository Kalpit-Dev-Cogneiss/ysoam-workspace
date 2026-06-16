(function () {
  var vehicles = window.YSOAM_VEHICLES;
  var data = window.YSOAM_ASSIGNMENTS;

  var state = {
    view: 'day',
    cursor: new Date(2026, 5, 15),
    search: '',
    menuAssignmentId: null,
    deleteAssignmentId: null,
    unassignId: null
  };

  var SLOT_W = 75;
  var DAY_SLOTS = 48;
  var DAY_SLOT_MINUTES = 30;
  var DAY_W = 200;
  var MONTH_DAY_W = 56;
  var MIN_ROW_H = 75;
  var VEHICLE_COL = 260;
  var GRID_HEAD_H = 40;
  var DEMO_NOW = new Date(2026, 5, 15, 13, 30);

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function cloneDate(d) { return new Date(d.getTime()); }

  function startOfDay(d) {
    var x = cloneDate(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  function addDays(d, n) {
    var x = cloneDate(d);
    x.setDate(x.getDate() + n);
    return x;
  }

  function startOfWeek(d) {
    var x = startOfDay(d);
    return addDays(x, -x.getDay());
  }

  function isSameDay(a, b) {
    return startOfDay(a).getTime() === startOfDay(b).getTime();
  }

  function formatHourLabel(hour) {
    var t = new Date(2026, 0, 1, hour, 0).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return t.replace(' AM', 'am').replace(' PM', 'pm').replace(' ', '');
  }

  function formatToolbarDate() {
    var range = rangeForView();
    if (state.view === 'day') {
      return state.cursor.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    if (state.view === 'week') {
      var end = addDays(range.start, 6);
      var startStr = range.start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      var endStr = end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      return startStr + ' - ' + endStr;
    }
    return state.cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  function startOfMonth(d) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  function daysInMonth(d) {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  }

  function formatHeaderDate(d) {
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  function formatBarRangeCompact(start, end) {
    var d = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
    return start.toLocaleString('en-US', d) + ' – ' + end.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  function formatDetailDateTime(d) {
    return d.toLocaleString('en-US', {
      month: '2-digit', day: '2-digit', year: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  }

  function formatDuration(ms) {
    if (ms <= 0) return '—';
    var h = Math.floor(ms / 3600000);
    var m = Math.floor((ms % 3600000) / 60000);
    if (h && m) return h + 'h ' + m + 'm';
    if (h) return h + 'h';
    return m + 'm';
  }

  function statusLabel(status) {
    var map = {
      active: 'Active', transit: 'In Transit', idle: 'Idle',
      offline: 'Offline', maintenance: 'Maintenance'
    };
    return map[status] || status;
  }

  function vehicleMeta(v) {
    return statusLabel(v.status) + ' · ' + v.type + ' · ' + v.group;
  }

  function filteredVehicles() {
    var q = state.search.trim().toLowerCase();
    return vehicles.list.filter(function (v) {
      if (v.assignment === 'archived') return false;
      if (!q) return true;
      var hay = [v.name, v.make, v.model, v.group, v.plate, v.operator].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function rangeForView() {
    var c = startOfDay(state.cursor);
    if (state.view === 'day') {
      return { start: c, end: addDays(c, 1), slots: DAY_SLOTS, slotW: SLOT_W };
    }
    if (state.view === 'week') {
      var ws = startOfWeek(c);
      return { start: ws, end: addDays(ws, 7), slots: 7, slotW: DAY_W };
    }
    var ms = startOfMonth(c);
    var n = daysInMonth(c);
    return { start: ms, end: addDays(ms, n), slots: n, slotW: MONTH_DAY_W };
  }

  function overlaps(aStart, aEnd, rStart, rEnd) {
    return aStart < rEnd && aEnd > rStart;
  }

  function findOverlappingAssignment(vehicleId, startIso, endIso, excludeId) {
    var start = new Date(startIso);
    var end = new Date(endIso);
    if (end <= start) return { type: 'invalid' };
    var match = null;
    data.list.some(function (a) {
      if (excludeId && a.id === excludeId) return false;
      if (a.vehicleId !== vehicleId) return false;
      var s = new Date(a.start);
      var e = new Date(a.end);
      if (overlaps(s, e, start, end)) {
        match = a;
        return true;
      }
      return false;
    });
    return match ? { type: 'overlap', assignment: match } : null;
  }

  function splitIsoDateTime(iso) {
    var d = new Date(iso);
    return { date: formatInputDate(d), time: formatInputTime(d) };
  }

  function formatInputTime(d) {
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function buildIso(dateStr, timeStr) {
    return dateStr + 'T' + (timeStr || '00:00') + ':00';
  }

  function showFormError(msg) {
    var el = document.getElementById('assign-form-error');
    if (!el) return;
    el.textContent = msg;
    el.hidden = !msg;
  }

  function clearFormError() {
    showFormError('');
  }

  function assignmentsForVehicle(vehicleId, range) {
    return data.list.filter(function (a) {
      if (a.vehicleId !== vehicleId) return false;
      var s = new Date(a.start);
      var e = new Date(a.end);
      return overlaps(s, e, range.start, range.end);
    });
  }

  function barStyleDay(a, range) {
    var s = new Date(a.start);
    var e = new Date(a.end);
    var dayStart = range.start.getTime();
    var dayEnd = range.end.getTime();
    var visStart = Math.max(s.getTime(), dayStart);
    var visEnd = Math.min(e.getTime(), dayEnd);
    if (visEnd <= visStart) return null;
    var total = dayEnd - dayStart;
    var left = ((visStart - dayStart) / total) * 100;
    var width = ((visEnd - visStart) / total) * 100;
    return { left: left + '%', width: Math.max(width, 0.8) + '%' };
  }

  function barStyleWeek(a, range, slotIndex) {
    var s = new Date(a.start);
    var e = new Date(a.end);
    var slotStart = addDays(range.start, slotIndex);
    var slotEnd = addDays(slotStart, 1);
    if (!overlaps(s, e, slotStart, slotEnd)) return null;
    var visStart = Math.max(s.getTime(), slotStart.getTime());
    var visEnd = Math.min(e.getTime(), slotEnd.getTime());
    var dayMs = slotEnd.getTime() - slotStart.getTime();
    var left = ((visStart - slotStart.getTime()) / dayMs) * 100;
    var width = ((visEnd - visStart) / dayMs) * 100;
    return { left: left + '%', width: Math.max(width, 8) + '%' };
  }

  function barStyleMonth(a, range, slotIndex) {
    var s = new Date(a.start);
    var e = new Date(a.end);
    var slotStart = addDays(range.start, slotIndex);
    var slotEnd = addDays(slotStart, 1);
    if (!overlaps(s, e, slotStart, slotEnd)) return null;
    return { left: '2px', width: 'calc(100% - 4px)' };
  }

  function renderToolbar() {
    var el = document.getElementById('assign-toolbar');
    if (!el) return;
    var range = rangeForView();
    el.innerHTML =
      '<div class="assign-toolbar__left">' +
        '<div class="assign-toolbar__search">' +
          '<span class="assign-toolbar__search-icon" aria-hidden="true">⌕</span>' +
          '<input type="search" class="assign-toolbar__search-input" id="assign-search" placeholder="Search vehicles…" value="' + escapeAttr(state.search) + '">' +
        '</div>' +
        '<button type="button" class="btn btn-outline btn-sm assign-toolbar__filter">Filters</button>' +
      '</div>' +
      '<div class="assign-toolbar__center">' +
        '<button type="button" class="assign-nav-btn" id="assign-prev" aria-label="Previous">‹</button>' +
        '<span class="assign-toolbar__date" id="assign-date-label">' + formatToolbarDate() + '</span>' +
        '<button type="button" class="assign-nav-btn" id="assign-next" aria-label="Next">›</button>' +
      '</div>' +
      '<div class="assign-toolbar__right">' +
        '<button type="button" class="btn btn-outline btn-sm" id="assign-today">Today</button>' +
        '<select class="assign-view-select" id="assign-view" aria-label="Calendar view">' +
          '<option value="day"' + (state.view === 'day' ? ' selected' : '') + '>Day</option>' +
          '<option value="week"' + (state.view === 'week' ? ' selected' : '') + '>Week</option>' +
          '<option value="month"' + (state.view === 'month' ? ' selected' : '') + '>Month</option>' +
        '</select>' +
      '</div>';
  }

  function timelineHeaderHTML(range) {
    var html = '<div class="assign-grid__head assign-grid__head--timeline">';
    var i;
    if (state.view === 'day') {
      for (i = 0; i < 24; i++) {
        html += '<div class="assign-hour-head" style="width:' + (SLOT_W * 2) + 'px">' +
          '<span class="assign-hour-head__label">' + formatHourLabel(i) + '</span></div>';
      }
    } else if (state.view === 'week') {
      for (i = 0; i < 7; i++) {
        var d = addDays(range.start, i);
        var today = isSameDay(d, DEMO_NOW);
        html += '<div class="assign-slot-head assign-slot-head--day' + (today ? ' assign-slot-head--today' : '') + '">' +
          '<span class="assign-slot-head__dow">' + d.toLocaleDateString('en-US', { weekday: 'short' }) + '</span>' +
          '<span class="assign-slot-head__dom">' + d.getDate() + '</span></div>';
      }
    } else {
      for (i = 0; i < range.slots; i++) {
        var md = addDays(range.start, i);
        var todayM = isSameDay(md, DEMO_NOW);
        html += '<div class="assign-slot-head assign-slot-head--month' + (todayM ? ' assign-slot-head--today' : '') + '">' +
          md.getDate() + '</div>';
      }
    }
    html += '</div>';
    return html;
  }

  function getNowMarkerLeft(range) {
    if (!overlaps(DEMO_NOW, addDays(DEMO_NOW, 0), range.start, range.end)) return null;
    if (state.view === 'day') {
      var pct = ((DEMO_NOW.getTime() - range.start.getTime()) / (range.end.getTime() - range.start.getTime())) * 100;
      return pct + '%';
    }
    if (state.view === 'week') {
      var dayIndex = Math.floor((startOfDay(DEMO_NOW).getTime() - range.start.getTime()) / 86400000);
      var dayStart = addDays(range.start, dayIndex);
      var dayPct = (DEMO_NOW.getTime() - dayStart.getTime()) / 86400000;
      return (dayIndex * DAY_W + dayPct * DAY_W) + 'px';
    }
    var mDayIndex = DEMO_NOW.getDate() - 1;
    var dayStartM = addDays(range.start, mDayIndex);
    var dayPctM = (DEMO_NOW.getTime() - dayStartM.getTime()) / 86400000;
    return (mDayIndex * MONTH_DAY_W + dayPctM * MONTH_DAY_W) + 'px';
  }

  function nowMarkerLayerHTML(range, timelineW) {
    var left = getNowMarkerLeft(range);
    if (left === null) return '';
    return '<div class="assign-now-layer" aria-hidden="true">' +
      '<div class="assign-now-marker" style="left:' + left + '">' +
        '<span class="assign-now-marker__arrow"></span>' +
        '<span class="assign-now-marker__line"></span>' +
      '</div></div>';
  }

  function cellAddButtonHTML() {
    return '<button type="button" class="assign-cell__add" aria-label="Add assignment" title="Add assignment">+</button>';
  }

  function renderSchedule() {
    var root = document.getElementById('assign-schedule');
    if (!root) return;
    var range = rangeForView();
    var list = filteredVehicles();
    var timelineW = range.slots * range.slotW;

    var rowH = getRowHeight(list.length);
    var html = '<div class="assign-grid assign-grid--' + state.view + '" style="--vehicle-col:' + VEHICLE_COL + 'px;--row-h:' + rowH + 'px;--grid-head-h:' + GRID_HEAD_H + 'px;--slot-w:' + SLOT_W + 'px;--day-col-w:' + DAY_W + 'px;--month-col-w:' + MONTH_DAY_W + 'px;--timeline-w:' + timelineW + 'px">';
    html += '<div class="assign-grid__corner">';
    html += '<span class="assign-corner-label">Vehicle</span>';
    html += '<button type="button" class="assign-sort-btn" title="Sort A–Z" aria-label="Sort vehicles">A⇅Z</button>';
    html += '</div>';
    html += timelineHeaderHTML(range);

    list.forEach(function (v) {
      html += '<div class="assign-grid__vehicle" data-vehicle-id="' + escapeAttr(v.id) + '">';
      html += '<img class="assign-vehicle-thumb" src="' + escapeAttr(v.image) + '" alt="">';
      html += '<div class="assign-vehicle-info">';
      html += '<a class="assign-vehicle-name" href="vehicle-detail?id=' + encodeURIComponent(v.id) + '">' + escapeHtml(v.name) + '</a>';
      html += '<span class="assign-vehicle-meta">' + escapeHtml(vehicleMeta(v)) + '</span>';
      html += '</div></div>';

      html += '<div class="assign-grid__row">';
      if (state.view === 'day') {
        html += dayCellsHTML();
      } else if (state.view === 'week') {
        for (var w = 0; w < 7; w++) {
          html += '<div class="assign-cell assign-cell--day">' + cellAddButtonHTML() + '</div>';
        }
      } else {
        for (var m = 0; m < range.slots; m++) {
          html += '<div class="assign-cell assign-cell--month">' + cellAddButtonHTML() + '</div>';
        }
      }

      var assigns = assignmentsForVehicle(v.id, range);
      assigns.forEach(function (a) {
        var op = data.getOperator(a.operatorId);
        var style;
        if (state.view === 'day') {
          style = barStyleDay(a, range);
          if (!style) return;
          html += assignmentBarHTML(a, op, style, formatBarRangeCompact(new Date(a.start), new Date(a.end)));
        } else if (state.view === 'week') {
          for (var si = 0; si < 7; si++) {
            style = barStyleWeek(a, range, si);
            if (!style) continue;
            var slotLeft = si * DAY_W;
            var leftPct = parseFloat(style.left);
            var widthPct = parseFloat(style.width);
            html += assignmentBarHTML(a, op, {
              left: (slotLeft + (leftPct / 100) * DAY_W) + 'px',
              width: Math.max((widthPct / 100) * DAY_W, 4) + 'px'
            }, op ? op.name : '—');
          }
        } else {
          for (var mi = 0; mi < range.slots; mi++) {
            style = barStyleMonth(a, range, mi);
            if (!style) continue;
            var mLeft = mi * MONTH_DAY_W;
            html += assignmentBarHTML(a, op, {
              left: (mLeft + 2) + 'px',
              width: (MONTH_DAY_W - 4) + 'px'
            }, op ? op.name : '—');
          }
        }
      });

      html += '</div>';
    });

    var fillerCount = fillerRowCount(list.length, rowH);
    for (var f = 0; f < fillerCount; f++) {
      html += '<div class="assign-grid__vehicle assign-grid__vehicle--filler" aria-hidden="true"></div>';
      html += '<div class="assign-grid__row assign-grid__row--filler">';
      if (state.view === 'day') html += dayCellsHTML();
      else if (state.view === 'week') {
        for (var fw = 0; fw < 7; fw++) html += '<div class="assign-cell assign-cell--day"></div>';
      } else {
        for (var fm = 0; fm < range.slots; fm++) html += '<div class="assign-cell assign-cell--month"></div>';
      }
      html += '</div>';
    }

    html += nowMarkerLayerHTML(range, timelineW);

    if (!list.length) {
      html += '<div class="assign-empty">No vehicles match your search.</div>';
    }

    html += '</div>';
    root.innerHTML = html;
    requestAnimationFrame(function () {
      syncGridRowHeights();
    });
  }

  function getRowHeight(vehicleCount) {
    if (state.view === 'day') return SLOT_W;
    var scroll = document.querySelector('.assign-schedule-scroll');
    if (!scroll || vehicleCount < 1) return MIN_ROW_H;
    var available = scroll.clientHeight - GRID_HEAD_H;
    if (available <= 0) return MIN_ROW_H;
    return Math.max(MIN_ROW_H, Math.floor(available / vehicleCount));
  }

  function fillerRowCount(vehicleCount, rowH) {
    var scroll = document.querySelector('.assign-schedule-scroll');
    if (!scroll) return 0;
    var available = scroll.clientHeight - GRID_HEAD_H;
    if (available <= 0) return 0;
    var used = vehicleCount * rowH;
    if (used >= available) return 0;
    return Math.ceil((available - used) / rowH);
  }

  function dayCellsHTML() {
    var html = '';
    for (var h = 0; h < DAY_SLOTS; h++) {
      var isHourBoundary = h % 2 === 1;
      html += '<div class="assign-cell assign-cell--half' + (isHourBoundary ? ' assign-cell--hour' : '') + '" style="width:' + SLOT_W + 'px">' +
        cellAddButtonHTML() + '</div>';
    }
    return html;
  }

  function assignmentBarHTML(a, op, style, timeLabel) {
    var name = op ? op.name : '—';
    var timeHtml = (state.view === 'day' && timeLabel)
      ? '<span class="assign-bar__time">' + escapeHtml(timeLabel) + '</span>'
      : '';
    var tip = name + (timeLabel ? ' · ' + timeLabel : '');
    return '<div class="assign-bar" data-assignment-id="' + escapeAttr(a.id) + '" style="left:' + style.left + ';width:' + style.width + '">' +
      '<button type="button" class="assign-bar__body" data-assignment-id="' + escapeAttr(a.id) + '" aria-label="' + escapeAttr(tip) + '">' +
        '<span class="assign-bar__name">' + escapeHtml(name) + '</span>' +
        timeHtml +
      '</button>' +
      '<button type="button" class="assign-bar__menu-btn" data-assignment-id="' + escapeAttr(a.id) + '" aria-label="More actions" title="More Actions" aria-haspopup="menu">⋯</button>' +
    '</div>';
  }

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeAttr(s) { return escapeHtml(s).replace(/"/g, '&quot;'); }

  function icon(name) {
    var I = window.YSOAM_ICONS;
    return I && I[name] ? I[name] : '';
  }

  function buildBarPopup() {
    var el = document.getElementById('assign-bar-popup');
    if (!el) return;
    el.innerHTML =
      barPopupItem('view', 'View', 'assignChevron') +
      barPopupItem('edit', 'Edit', 'assignEdit') +
      barPopupItem('unassign', 'Unassign Vehicle', 'assignUnassign') +
      barPopupItem('delete', 'Delete', 'assignDelete', true);
    el.querySelectorAll('[data-action]').forEach(function (btn) {
      btn.onclick = function () {
        handleBarMenuAction(btn.getAttribute('data-action'));
      };
    });
  }

  function barPopupItem(action, label, iconKey, danger) {
    return '<button type="button" class="assign-bar-popup__item' + (danger ? ' assign-bar-popup__item--danger' : '') +
      '" data-action="' + escapeAttr(action) + '" role="menuitem">' +
      '<span class="assign-bar-popup__label">' + escapeHtml(label) + '</span>' +
      '<span class="assign-bar-popup__icon">' + icon(iconKey) + '</span>' +
    '</button>';
  }

  function render() {
    renderToolbar();
    renderSchedule();
    bindToolbarEvents();
    bindScheduleEvents();
  }

  function syncGridRowHeights() {
    var list = filteredVehicles();
    var grid = document.querySelector('.assign-grid');
    if (!grid || !list.length) return;
    grid.style.setProperty('--row-h', getRowHeight(list.length) + 'px');
  }

  function onResize() {
    syncGridRowHeights();
  }

  function bindToolbarEvents() {
    var search = document.getElementById('assign-search');
    if (search) {
      search.oninput = function () {
        state.search = search.value;
        renderSchedule();
        bindScheduleEvents();
      };
    }
    var prev = document.getElementById('assign-prev');
    var next = document.getElementById('assign-next');
    if (prev) prev.onclick = function () { navigate(-1); };
    if (next) next.onclick = function () { navigate(1); };
    var today = document.getElementById('assign-today');
    if (today) today.onclick = function () {
      state.cursor = cloneDate(DEMO_NOW);
      render();
    };
    var view = document.getElementById('assign-view');
    if (view) view.onchange = function () {
      state.view = view.value;
      render();
    };
  }

  function navigate(dir) {
    if (state.view === 'day') state.cursor = addDays(state.cursor, dir);
    else if (state.view === 'week') state.cursor = addDays(state.cursor, dir * 7);
    else state.cursor = new Date(state.cursor.getFullYear(), state.cursor.getMonth() + dir, 15);
    render();
  }

  function bindScheduleEvents() {
    document.querySelectorAll('.assign-bar__body').forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        openAssignmentView(btn.getAttribute('data-assignment-id'));
      };
    });
    document.querySelectorAll('.assign-bar__menu-btn').forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        openBarMenu(btn, btn.getAttribute('data-assignment-id'));
      };
    });
    document.querySelectorAll('.assign-cell__add').forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        openModal();
      };
    });
  }

  function openAssignmentView(id) {
    closeBarMenu();
    window.location.href = 'vehicle-assignment-detail?id=' + encodeURIComponent(id);
  }

  function openBarMenu(anchor, id) {
    var popup = document.getElementById('assign-bar-popup');
    if (!popup) return;
    var rect = anchor.getBoundingClientRect();
    var menuW = 220;
    popup.hidden = false;
    popup.style.top = (rect.bottom + 4) + 'px';
    popup.style.left = Math.max(12, rect.right - menuW) + 'px';
    state.menuAssignmentId = id;
  }

  function closeBarMenu() {
    var popup = document.getElementById('assign-bar-popup');
    if (popup) popup.hidden = true;
    state.menuAssignmentId = null;
  }

  function handleBarMenuAction(action) {
    var id = state.menuAssignmentId;
    closeBarMenu();
    if (!id) return;
    if (action === 'view') openAssignmentView(id);
    else if (action === 'edit') openEditModal(id);
    else if (action === 'unassign') openUnassignModal(id);
    else if (action === 'delete') openDeleteModal(id);
  }

  /* ── Modal ─────────────────────────────────────────────── */
  function openModal() {
    var modal = document.getElementById('add-assignment-modal');
    if (!modal) return;
    resetForm();
    document.getElementById('add-assignment-title').textContent = 'Add Assignment';
    document.getElementById('assign-editing-id').value = '';
    setVehiclePickerReadonly(false);
    var today = state.cursor;
    document.getElementById('assign-start-date').value = formatInputDate(today);
    document.getElementById('assign-end-date').value = formatInputDate(today);
    document.getElementById('assign-start-time').value = '08:00';
    document.getElementById('assign-end-time').value = '18:00';
    modal.classList.add('is-open');
  }

  function openEditModal(id) {
    var a = data.getById(id);
    if (!a) return;
    var modal = document.getElementById('add-assignment-modal');
    if (!modal) return;
    resetForm();
    document.getElementById('add-assignment-title').textContent = 'Edit Vehicle Assignment';
    document.getElementById('assign-editing-id').value = id;
    selectVehicle(a.vehicleId);
    selectOperator(a.operatorId);
    setVehiclePickerReadonly(true);
    var start = splitIsoDateTime(a.start);
    var end = splitIsoDateTime(a.end);
    document.getElementById('assign-start-date').value = start.date;
    document.getElementById('assign-start-time').value = start.time;
    document.getElementById('assign-end-date').value = end.date;
    document.getElementById('assign-end-time').value = end.time;
    document.getElementById('assign-start-odometer').value = a.startOdometer != null ? a.startOdometer : '';
    document.getElementById('assign-end-odometer').value = a.endOdometer != null ? a.endOdometer : '';
    document.getElementById('assign-comment').value = a.comment || '';
    updateSaveButton();
    modal.classList.add('is-open');
  }

  function setVehiclePickerReadonly(readonly) {
    var trigger = document.getElementById('assign-vehicle-trigger');
    var picker = document.getElementById('assign-vehicle-picker');
    if (trigger) trigger.disabled = !!readonly;
    if (picker) picker.classList.toggle('assign-picker--readonly', !!readonly);
  }

  function closeModal() {
    var modal = document.getElementById('add-assignment-modal');
    if (modal) modal.classList.remove('is-open');
    closeAllPickers();
    clearFormError();
    setVehiclePickerReadonly(false);
  }

  function formatInputDate(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function resetForm() {
    document.getElementById('assign-form').reset();
    document.getElementById('assign-vehicle-id').value = '';
    document.getElementById('assign-operator-id').value = '';
    document.getElementById('assign-editing-id').value = '';
    document.getElementById('assign-start-odometer').value = '';
    document.getElementById('assign-end-odometer').value = '';
    setPickerTrigger('assign-vehicle-trigger', null, 'vehicle');
    setPickerTrigger('assign-operator-trigger', null, 'operator');
    clearFormError();
    updateSaveButton();
  }

  function buildPickers() {
    var vMenu = document.getElementById('assign-vehicle-menu');
    var oMenu = document.getElementById('assign-operator-menu');
    if (!vMenu || !oMenu) return;

    vMenu.innerHTML = vehicles.list.filter(function (v) { return v.assignment !== 'archived'; }).map(function (v) {
      return '<button type="button" class="assign-picker__option" role="option" data-vehicle-id="' + escapeAttr(v.id) + '">' +
        '<img src="' + escapeAttr(v.image) + '" alt="">' +
        '<span class="assign-picker__option-text">' +
          '<strong>' + escapeHtml(v.name) + '</strong>' +
          '<small>' + escapeHtml(vehicleMeta(v)) + '</small>' +
        '</span></button>';
    }).join('');

    oMenu.innerHTML = data.operators.map(function (o) {
      return '<button type="button" class="assign-picker__option" role="option" data-operator-id="' + escapeAttr(o.id) + '">' +
        '<span class="assign-picker__avatar">' + escapeHtml(o.initials) + '</span>' +
        '<span class="assign-picker__option-text">' +
          '<strong>' + escapeHtml(o.name) + '</strong>' +
          '<small>' + escapeHtml(o.email) + '</small>' +
        '</span>' +
        '<span class="assign-picker__tag">' + escapeHtml(o.role) + '</span></button>';
    }).join('');

    vMenu.querySelectorAll('[data-vehicle-id]').forEach(function (btn) {
      btn.onclick = function () {
        selectVehicle(btn.getAttribute('data-vehicle-id'));
        closeAllPickers();
      };
    });
    oMenu.querySelectorAll('[data-operator-id]').forEach(function (btn) {
      btn.onclick = function () {
        selectOperator(btn.getAttribute('data-operator-id'));
        closeAllPickers();
      };
    });
  }

  function setPickerTrigger(triggerId, item, kind) {
    var btn = document.getElementById(triggerId);
    if (!btn) return;
    if (!item) {
      btn.innerHTML = '<span class="assign-picker__placeholder">Please select</span>';
      return;
    }
    if (kind === 'vehicle') {
      var v = vehicles.getById(item);
      if (!v) return;
      btn.innerHTML = '<img src="' + escapeAttr(v.image) + '" alt=""><span class="assign-picker__selected">' +
        '<strong>' + escapeHtml(v.name) + '</strong><small>' + escapeHtml(vehicleMeta(v)) + '</small></span>';
    } else {
      var o = data.getOperator(item);
      if (!o) return;
      btn.innerHTML = '<span class="assign-picker__avatar">' + escapeHtml(o.initials) + '</span><span class="assign-picker__selected">' +
        '<strong>' + escapeHtml(o.name) + '</strong><small>' + escapeHtml(o.email) + '</small></span>';
    }
  }

  function selectVehicle(id) {
    document.getElementById('assign-vehicle-id').value = id;
    setPickerTrigger('assign-vehicle-trigger', id, 'vehicle');
    updateSaveButton();
  }

  function selectOperator(id) {
    document.getElementById('assign-operator-id').value = id;
    setPickerTrigger('assign-operator-trigger', id, 'operator');
    updateSaveButton();
  }

  function togglePicker(menuId, triggerId) {
    var menu = document.getElementById(menuId);
    var trigger = document.getElementById(triggerId);
    if (!menu || !trigger) return;
    var open = !menu.hidden;
    closeAllPickers();
    if (!open) {
      menu.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
    }
  }

  function closeAllPickers() {
    document.querySelectorAll('.assign-picker__menu').forEach(function (m) { m.hidden = true; });
    document.querySelectorAll('.assign-picker__trigger').forEach(function (t) { t.setAttribute('aria-expanded', 'false'); });
  }

  function updateSaveButton() {
    var btn = document.getElementById('assign-modal-save');
    var ok = document.getElementById('assign-vehicle-id').value && document.getElementById('assign-operator-id').value;
    if (btn) btn.disabled = !ok;
  }

  function saveAssignment(e) {
    e.preventDefault();
    clearFormError();
    var editingId = document.getElementById('assign-editing-id').value;
    var vehicleId = document.getElementById('assign-vehicle-id').value;
    var operatorId = document.getElementById('assign-operator-id').value;
    var startDate = document.getElementById('assign-start-date').value;
    var startTime = document.getElementById('assign-start-time').value || '00:00';
    var endDate = document.getElementById('assign-end-date').value;
    var endTime = document.getElementById('assign-end-time').value || '23:59';
    var comment = document.getElementById('assign-comment').value.trim();
    var startOdo = document.getElementById('assign-start-odometer').value;
    var endOdo = document.getElementById('assign-end-odometer').value;

    if (!vehicleId || !operatorId || !startDate || !endDate) return;

    var startIso = buildIso(startDate, startTime);
    var endIso = buildIso(endDate, endTime);
    var conflict = findOverlappingAssignment(vehicleId, startIso, endIso, editingId || null);
    if (conflict) {
      if (conflict.type === 'invalid') {
        showFormError('End date/time must be after start date/time.');
        return;
      }
      showFormError('This vehicle already has an assignment during that period. Choose a different time range.');
      return;
    }

    var payload = {
      vehicleId: vehicleId,
      operatorId: operatorId,
      start: startIso,
      end: endIso,
      comment: comment,
      startOdometer: startOdo ? parseFloat(startOdo) : null,
      endOdometer: endOdo ? parseFloat(endOdo) : null
    };

    if (editingId) {
      var existing = data.getById(editingId);
      if (existing) Object.assign(existing, payload);
    } else {
      data.list.push(Object.assign({ id: data.nextId() }, payload));
    }

    closeModal();
    render();
  }

  /* ── Unassign modal ────────────────────────────────────── */
  function openUnassignModal(id) {
    var a = data.getById(id);
    if (!a) return;
    var v = vehicles.getById(a.vehicleId);
    var op = data.getOperator(a.operatorId);
    var start = splitIsoDateTime(a.start);
    document.getElementById('unassign-title').textContent = 'Unassign Operator From ' + (v ? v.name : a.vehicleId);
    document.getElementById('unassign-summary').innerHTML =
      readonlyRow('Assigned Vehicle', v ? (
        '<span class="assign-detail-vehicle"><img src="' + escapeAttr(v.image) + '" alt="">' +
        '<a href="vehicle-detail?id=' + encodeURIComponent(v.id) + '">' + escapeHtml(v.name) + '</a></span>'
      ) : escapeHtml(a.vehicleId)) +
      readonlyRow('Current Operator', op ? (
        '<span class="assign-detail-operator"><span class="assign-picker__avatar">' + escapeHtml(op.initials) + '</span>' +
        '<span>' + escapeHtml(op.name) + '</span></span>'
      ) : '—') +
      readonlyRow('Start Date/Time', formatDetailDateTime(new Date(a.start))) +
      readonlyRow('Starting Odometer', a.startOdometer != null ? a.startOdometer + ' km' : 'No starting odometer entered');
    document.getElementById('unassign-end-date').value = formatInputDate(DEMO_NOW);
    document.getElementById('unassign-end-time').value = formatInputTime(DEMO_NOW);
    document.getElementById('unassign-end-odometer').value = a.endOdometer != null ? a.endOdometer : '';
    document.getElementById('unassign-comment').value = '';
    state.unassignId = id;
    document.getElementById('unassign-modal').classList.add('is-open');
  }

  function closeUnassignModal() {
    document.getElementById('unassign-modal').classList.remove('is-open');
    state.unassignId = null;
  }

  function confirmUnassign(e) {
    e.preventDefault();
    var id = state.unassignId;
    if (!id) return;
    var a = data.getById(id);
    if (!a) return;
    var endDate = document.getElementById('unassign-end-date').value;
    var endTime = document.getElementById('unassign-end-time').value;
    var endOdo = document.getElementById('unassign-end-odometer').value;
    var comment = document.getElementById('unassign-comment').value.trim();
    a.end = buildIso(endDate, endTime);
    if (endOdo) a.endOdometer = parseFloat(endOdo);
    if (comment) a.comment = (a.comment ? a.comment + '\n' : '') + comment;
    closeUnassignModal();
    render();
  }

  function readonlyRow(label, value) {
    return '<div class="assign-readonly-row"><span class="assign-readonly-row__label">' + escapeHtml(label) + '</span>' +
      '<span class="assign-readonly-row__value">' + value + '</span></div>';
  }

  /* ── Delete modal ──────────────────────────────────────── */
  function openDeleteModal(id) {
    state.deleteAssignmentId = id;
    document.getElementById('delete-assignment-modal').classList.add('is-open');
  }

  function closeDeleteModal() {
    document.getElementById('delete-assignment-modal').classList.remove('is-open');
    state.deleteAssignmentId = null;
  }

  function confirmDelete() {
    var id = state.deleteAssignmentId;
    if (!id) return;
    var idx = data.list.findIndex(function (a) { return a.id === id; });
    if (idx !== -1) data.list.splice(idx, 1);
    closeDeleteModal();
    render();
  }

  function init() {
    buildBarPopup();
    buildPickers();
    render();

    document.getElementById('assign-add-btn').onclick = openModal;
    document.getElementById('assign-modal-close').onclick = closeModal;
    document.getElementById('assign-modal-cancel').onclick = closeModal;
    document.getElementById('assign-form').onsubmit = saveAssignment;

    document.getElementById('unassign-modal-close').onclick = closeUnassignModal;
    document.getElementById('unassign-modal-cancel').onclick = closeUnassignModal;
    document.getElementById('unassign-form').onsubmit = confirmUnassign;

    document.getElementById('delete-modal-close').onclick = closeDeleteModal;
    document.getElementById('delete-modal-cancel').onclick = closeDeleteModal;
    document.getElementById('delete-modal-confirm').onclick = confirmDelete;

    document.getElementById('assign-vehicle-trigger').onclick = function () {
      if (this.disabled) return;
      togglePicker('assign-vehicle-menu', 'assign-vehicle-trigger');
    };
    document.getElementById('assign-operator-trigger').onclick = function () {
      togglePicker('assign-operator-menu', 'assign-operator-trigger');
    };

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.assign-picker')) closeAllPickers();
      if (!e.target.closest('.assign-bar-popup') && !e.target.closest('.assign-bar__menu-btn')) {
        closeBarMenu();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeBarMenu();
        closeUnassignModal();
        closeDeleteModal();
        closeModal();
      }
    });

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', closeBarMenu, true);

    var params = new URLSearchParams(window.location.search);
    var editId = params.get('edit');
    if (editId) openEditModal(editId);
  }

  if (document.body.getAttribute('data-subpage') === 'assignments') {
    init();
  }
})();
