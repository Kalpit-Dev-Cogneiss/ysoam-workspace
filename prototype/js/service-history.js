(function () {
  'use strict';

  var data = window.YSOAM_SERVICE_HISTORY;
  var vehicles = window.YSOAM_VEHICLES;

  var state = {
    search: '',
    vehicleId: '',
    group: '',
    task: '',
    watcher: '',
    page: 1,
    pageSize: 50
  };

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function findVehicle(id) {
    if (!vehicles || !vehicles.list) return null;
    return vehicles.list.find(function (v) { return v.id === id; }) || null;
  }

  function filteredList() {
    var q = state.search.trim().toLowerCase();
    return data.list.filter(function (row) {
      var v = findVehicle(row.vehicleId);
      if (state.vehicleId && row.vehicleId !== state.vehicleId) return false;
      if (state.group && (!v || v.group !== state.group)) return false;
      if (state.task && row.tasks.indexOf(state.task) === -1) return false;
      if (state.watcher && row.watchers !== state.watcher) return false;
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
      '</tr></thead><tbody>';

    if (!rows.length) {
      html += '<tr><td colspan="15" class="service-history-empty">No service entries found</td></tr>';
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
          '<td><span class="data-table__status-dot" style="background:#16A34A"></span><a href="#" class="table-cell-link">' + escapeHtml(row.workOrder) + '</a></td>' +
          '<td>' + (row.labels || '—') + '</td>' +
        '</tr>';
      });
    }

    html += '</tbody></table>';
    root.innerHTML = html;
  }

  function populateFilters() {
    var vehicleSel = document.getElementById('service-filter-vehicle');
    var groupSel = document.getElementById('service-filter-group');
    var taskSel = document.getElementById('service-filter-task');
    var watcherSel = document.getElementById('service-filter-watcher');

    if (vehicleSel && vehicles && vehicles.list) {
      vehicles.list.forEach(function (v) {
        if (v.assignment === 'archived') return;
        var opt = document.createElement('option');
        opt.value = v.id;
        opt.textContent = v.name;
        vehicleSel.appendChild(opt);
      });
    }

    if (groupSel && data.groups) {
      data.groups().forEach(function (g) {
        var opt = document.createElement('option');
        opt.value = g;
        opt.textContent = g;
        groupSel.appendChild(opt);
      });
    }

    if (taskSel && data.tasks) {
      data.tasks.forEach(function (t) {
        var opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        taskSel.appendChild(opt);
      });
    }

    if (watcherSel && data.watchers) {
      data.watchers.forEach(function (w) {
        var opt = document.createElement('option');
        opt.value = w.label;
        opt.textContent = w.label;
        watcherSel.appendChild(opt);
      });
    }
  }

  function bindFilters() {
    var search = document.getElementById('service-search');
    if (search) {
      search.addEventListener('input', function () {
        state.search = search.value;
        state.page = 1;
        renderTable();
      });
    }

    var map = [
      ['service-filter-vehicle', 'vehicleId'],
      ['service-filter-group', 'group'],
      ['service-filter-task', 'task'],
      ['service-filter-watcher', 'watcher']
    ];

    map.forEach(function (pair) {
      var el = document.getElementById(pair[0]);
      if (!el) return;
      el.addEventListener('change', function () {
        state[pair[1]] = el.value;
        state.page = 1;
        el.classList.toggle('has-value', !!el.value);
        renderTable();
      });
    });

    document.querySelectorAll('[data-page-prev]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (state.page > 1) {
          state.page -= 1;
          renderTable();
        }
      });
    });

    document.querySelectorAll('[data-page-next]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var totalPages = Math.max(1, Math.ceil(filteredList().length / state.pageSize));
        if (state.page < totalPages) {
          state.page += 1;
          renderTable();
        }
      });
    });
  }

  function init() {
    if (document.body.getAttribute('data-subpage') !== 'service-history') return;
    populateFilters();
    bindFilters();
    renderTable();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
