window.YSOAM_WORK_ORDERS = (function () {
  var vehicles = window.YSOAM_VEHICLES;
  var sh = window.YSOAM_SERVICE_HISTORY;

  var STATUSES = [
    { id: 'open', label: 'Open', dot: '#2563EB' },
    { id: 'pending', label: 'Pending', dot: '#F59E0B' },
    { id: 'completed', label: 'Completed', dot: '#16A34A' }
  ];

  var PRIORITIES = [
    { id: 'scheduled', label: 'Scheduled', dot: '#16A34A' },
    { id: 'emergency', label: 'Emergency', dot: '#DC2626' }
  ];

  var TASKS = sh ? sh.tasks : [];

  var REASONS = ['Consumption', 'Routine', 'Unplanned', 'Preventive', 'Wear'];
  var CATEGORIES = [
    ['Engine', 'Motor Systems', 'Lubrication'],
    ['Chassis', 'Suspension', 'Tires'],
    ['Electrical', 'Starting / Charging', 'Battery'],
    ['HVAC', 'Climate Control', 'A/C System']
  ];

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function formatDate(d) {
    return pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + '/' + d.getFullYear();
  }

  function formatDateTime(d) {
    var h = d.getHours();
    var ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + '/' + d.getFullYear() + ' ' +
      h + ':' + pad(d.getMinutes()) + ampm;
  }

  function formatDuration(startIso, endIso) {
    var ms = new Date(endIso) - new Date(startIso);
    if (ms <= 0) return '—';
    var mins = Math.floor(ms / 60000);
    var days = Math.floor(mins / (24 * 60));
    mins -= days * 24 * 60;
    var hrs = Math.floor(mins / 60);
    mins -= hrs * 60;
    var parts = [];
    if (days) parts.push(days + ' day' + (days === 1 ? '' : 's'));
    if (hrs) parts.push(hrs + ' hour' + (hrs === 1 ? '' : 's'));
    if (!days && mins) parts.push(mins + ' min' + (mins === 1 ? '' : 's'));
    return parts.length ? parts.join(', ') : '—';
  }

  function formatRelativeCreated(iso) {
    var now = new Date(2026, 5, 15, 12, 0, 0);
    var d = new Date(iso);
    var days = Math.max(0, Math.round((now - d) / 86400000));
    if (days === 0) return 'Created today';
    if (days === 1) return 'Created yesterday';
    return 'Created ' + days + ' days ago';
  }

  function buildLineItems(tasks, total, vi, i) {
    var names = tasks.slice(0, 3);
    if (!names.length) names = ['General Service'];
    var weights = names.map(function (_, idx) { return 1 + ((vi + i + idx) % 4) * 0.15; });
    var weightSum = weights.reduce(function (a, b) { return a + b; }, 0);
    var items = [];
    var running = 0;
    names.forEach(function (name, idx) {
      var share = idx === names.length - 1
        ? Math.round((total - running) * 100) / 100
        : Math.round((total * weights[idx] / weightSum) * 100) / 100;
      running += share;
      var labor = Math.round(share * (0.45 + (idx % 3) * 0.08) * 100) / 100;
      var parts = Math.round((share - labor) * 100) / 100;
      var cat = CATEGORIES[(vi + i + idx) % CATEGORIES.length];
      items.push({
        name: name,
        reason: REASONS[(vi + idx) % REASONS.length] + ' ' + pad((vi + i + idx) % 20 + 1),
        category: cat[0],
        system: cat[1],
        assembly: cat[2],
        labor: labor,
        parts: parts,
        subtotal: share
      });
    });
    return items;
  }

  function enrichRow(row, vi, i) {
    var issue = new Date(row.issueDate);
    row.createdAt = new Date(issue.getTime() - 9 * 86400000).toISOString();
    row.description = null;
    row.vendor = i % 7 === 0 ? 'Pune Service Hub' : null;
    row.labels = null;
    row.invoiceNumber = null;
    row.purchaseOrder = null;
    row.actualStartDate = null;
    row.actualCompletionDate = null;
    row.scheduledCompletionDate = row.scheduledStart ? row.scheduledStart : null;
    row.serviceEntryId = null;
    row.serviceEntryNumber = null;
    row.lineItems = [];
    row.total = 0;

    if (row.status.id === 'completed') {
      row.actualStartDate = new Date(issue.getTime() + 3600000).toISOString();
      row.actualCompletionDate = new Date(issue.getTime() + 40 * 3600000).toISOString();
      var amount = 48.95 + ((vi * 17 + i * 29) % 4500) / 10;
      row.lineItems = buildLineItems(row.tasks, Math.round(amount * 100) / 100, vi, i);
      row.total = row.lineItems.reduce(function (s, it) { return s + it.subtotal; }, 0);
      row.total = Math.round(row.total * 100) / 100;
      row.serviceEntryNumber = String(48900000 + row.number);
      if (sh && sh.list && sh.list.length) {
        var entry = sh.list[(vi + i) % sh.list.length];
        row.serviceEntryId = entry.id;
      }
    }
  }

  function seedHeroWorkOrder(row) {
    var vList = (vehicles && vehicles.list) ? vehicles.list.filter(function (v) {
      return v.assignment !== 'archived';
    }) : [];
    var v = vList[0];
    if (!v) return;

    row.status = STATUSES[2];
    row.priority = PRIORITIES[1];
    row.vehicleId = v.id;
    row.isSample = true;
    row.assignedTo = null;
    row.watchers = null;
    row.issueDate = new Date(2023, 10, 5, 11, 54, 0).toISOString();
    row.actualStartDate = new Date(2023, 10, 5, 11, 54, 0).toISOString();
    row.actualCompletionDate = new Date(2023, 10, 7, 3, 54, 0).toISOString();
    row.scheduledStart = row.issueDate;
    row.scheduledCompletionDate = new Date(2023, 10, 6, 17, 0, 0).toISOString();
    row.createdAt = new Date(2026, 5, 6, 12, 0, 0).toISOString();
    row.serviceEntryNumber = '48902629';
    row.serviceEntryId = sh && sh.list && sh.list[0] ? sh.list[0].id : null;
    row.tasks = ['Engine Oil & Filter Replacement', 'Tire Rotation'];
    row.lineItems = [
      {
        name: 'Engine Oil & Filter Replacement',
        reason: 'Consumption, Oil 03',
        category: 'Engine',
        system: 'Motor Systems',
        assembly: 'Lubrication',
        labor: 18.78,
        parts: 28.05,
        subtotal: 46.83
      },
      {
        name: 'Tire Rotation',
        reason: 'Routine 11',
        category: 'Chassis',
        system: 'Suspension',
        assembly: 'Tires',
        labor: 19.75,
        parts: 0,
        subtotal: 19.75
      }
    ];
    row.total = 66.59;
  }

  function buildList() {
    var list = [];
    var num = 154;
    var today = new Date(2026, 5, 15);
    var vehicleList = (vehicles && vehicles.list) ? vehicles.list.filter(function (v) {
      return v.assignment !== 'archived';
    }) : [];

    vehicleList.forEach(function (v, vi) {
      var count = 14 + (vi % 5);
      for (var i = 0; i < count; i++) {
        var status = STATUSES[(vi + i) % 3];
        if (vi === 0 && i < 8) status = STATUSES[2];
        var priority = (vi === 3 && i === 2) ? PRIORITIES[1] : PRIORITIES[0];
        var daysOffset = (vi * 3 + i * 7) % 200;
        var issueDate = new Date(today);
        issueDate.setDate(issueDate.getDate() - daysOffset);

        var taskCount = 1 + ((vi + i) % 3);
        var tasks = [];
        for (var t = 0; t < taskCount; t++) {
          tasks.push(TASKS[(vi + i + t) % TASKS.length]);
        }

        var row = {
          id: 'WO-' + num,
          number: num,
          vehicleId: v.id,
          status: status,
          priority: priority,
          tasks: tasks,
          issues: null,
          resolvedIssues: null,
          issueDate: issueDate.toISOString(),
          scheduledStart: i % 4 === 0 ? issueDate.toISOString() : null,
          expectedCompletion: null,
          assignedTo: i % 5 === 0 ? 'Demo Manager' : null,
          watchers: i % 6 === 0 ? 'Demo Manager' : null,
          isSample: vi < 4 && i < 3
        };
        enrichRow(row, vi, i);
        list.push(row);
        num -= 1;
      }
    });

    list.sort(function (a, b) { return b.number - a.number; });

    var hero = list.find(function (r) { return r.number === 1; });
    if (hero) seedHeroWorkOrder(hero);

    return list;
  }

  function getById(id) {
    if (!id) return null;
    var row = list.find(function (r) { return r.id === id; });
    if (!row && /^WO-\d+$/i.test(id)) {
      var num = parseInt(id.replace(/^WO-/i, ''), 10);
      row = list.find(function (r) { return r.number === num; });
    }
    if (!row && /^\d+$/.test(id)) {
      row = list.find(function (r) { return r.number === parseInt(id, 10); });
    }
    return row || null;
  }

  var list = buildList();

  return {
    list: list,
    statuses: STATUSES,
    tasks: TASKS,
    formatDate: formatDate,
    formatDateTime: formatDateTime,
    formatDuration: formatDuration,
    formatRelativeCreated: formatRelativeCreated,
    getById: getById,
    groups: function () {
      var set = {};
      (vehicles.list || []).forEach(function (v) {
        if (v.group) set[v.group] = true;
      });
      return Object.keys(set).sort();
    }
  };
})();
