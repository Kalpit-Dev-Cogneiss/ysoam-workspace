window.YSOAM_SERVICE_HISTORY = (function () {
  var vehicles = window.YSOAM_VEHICLES;

  var TASKS = [
    'ABS Control Module Replacement',
    'A/C Accumulator Replacement',
    'Accelerator Pedal Inspect',
    'Accessories/Upfitting (Miscellaneous)',
    'A/C Compressor Replacement',
    'A/C Condenser Replacement',
    'A/C Evaporator Core Replacement',
    'A/C Expansion Valve Replacement',
    'Engine Air Filter Replacement',
    'Diesel Exhaust Fluid Pump Filter Replacement',
    'Tire Rotation',
    'Brake Inspection',
    'Spark Plugs Replacement',
    'Engine Oil & Filter Replacement',
    'Engine Coolant Drain & Refill',
    'Transmission Fluid Drain & Refill',
    'AC Service',
    'Battery Inspection',
    'Wheel Alignment',
    'Fuel Filter Replacement'
  ];

  var VENDORS = [
    'Pune Service Hub',
    'Expressway Motors',
    'Mumbai Fleet Parts',
    'Western Logistics Co.',
    null
  ];

  var PRIORITIES = [
    { id: 'scheduled', label: 'Scheduled', dot: '#16A34A' },
    { id: 'emergency', label: 'Emergency', dot: '#DC2626' }
  ];

  var WATCHERS = [
    { id: 'demo-manager', label: 'Demo Manager' },
    { id: 'fleet-admin', label: 'Fleet Admin' }
  ];

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function formatDateTime(d) {
    var h = d.getHours();
    var ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + '/' + d.getFullYear() + ' ' +
      h + ':' + pad(d.getMinutes()) + ampm;
  }

  function buildList() {
    var list = [];
    var wo = 134;
    var today = new Date(2026, 5, 15, 12, 0, 0);
    var vehicleList = (vehicles && vehicles.list) ? vehicles.list.filter(function (v) {
      return v.assignment !== 'archived';
    }) : [];

    vehicleList.forEach(function (v, vi) {
      var count = 16 + (vi % 6);
      for (var i = 0; i < count; i++) {
        var daysOffset = (vi * 4 + i * 5) % 120;
        var d = new Date(today);
        d.setDate(d.getDate() - daysOffset);
        d.setHours(6 + ((vi + i) % 14), (i * 11) % 60, 0, 0);

        var taskCount = 1 + ((vi + i) % 4);
        var tasks = [];
        for (var t = 0; t < taskCount; t++) {
          tasks.push(TASKS[(vi + i + t) % TASKS.length]);
        }

        var priority = (vi === 2 && i === 3) ? PRIORITIES[1] : PRIORITIES[0];
        var amount = 48.95 + ((vi * 23 + i * 37) % 4500) / 10;
        var meterNum = parseInt(String(v.meter || '0').replace(/[^\d]/g, ''), 10) || 20000;
        var meterVal = meterNum - (i * 420) - (vi * 80);
        var useHours = vi % 5 === 0 && i % 7 === 0;
        var meter = useHours ? ((i % 24) + 1) + ' hr' : meterVal.toLocaleString('en-IN') + ' km';

        list.push({
          id: 'SH-' + wo,
          entryNumber: String(49900000 + wo),
          vehicleId: v.id,
          startedAt: new Date(d.getTime() - ((priority.id === 'emergency' ? 0 : 2) * 86400000) - 3600000).toISOString(),
          completedAt: d.toISOString(),
          createdAt: new Date(d.getTime() - 9 * 86400000).toISOString(),
          createdBy: 'Demo Manager',
          licensePlate: i % 9 === 0 ? v.plate : null,
          summary: null,
          assessment: null,
          watchers: i % 4 === 0 ? WATCHERS[0].label : null,
          priority: priority,
          meter: meter,
          tasks: tasks,
          lineItems: buildLineItems(tasks, Math.round(amount * 100) / 100, vi, i),
          issues: null,
          vendor: VENDORS[(vi + i) % VENDORS.length],
          reference: null,
          notes: null,
          total: Math.round(amount * 100) / 100,
          workOrder: '#' + wo,
          labels: null,
          isSample: vi < 3 && i < 2
        });
        wo -= 1;
      }
    });

    list.sort(function (a, b) {
      return new Date(b.completedAt) - new Date(a.completedAt);
    });

    return list;
  }

  function buildLineItems(tasks, total, vi, i) {
    var names = tasks.slice();
    if (names.length === 3 && names.indexOf('Diesel Emissions Fluid Fill') === -1) {
      names[2] = 'Diesel Emissions Fluid Fill';
    }
    var weights = names.map(function (_, idx) { return 1 + ((vi + i + idx) % 4) * 0.15; });
    var weightSum = weights.reduce(function (a, b) { return a + b; }, 0);
    var items = [];
    var running = 0;
    names.forEach(function (name, idx) {
      var share = idx === names.length - 1
        ? Math.round((total - running) * 100) / 100
        : Math.round((total * weights[idx] / weightSum) * 100) / 100;
      running += share;
      var labor = Math.round(share * (0.3 + (idx % 3) * 0.05) * 100) / 100;
      var parts = Math.round((share - labor) * 100) / 100;
      items.push({
        name: name,
        reason: 'Unplanned',
        category: 'Preventive Maintenance',
        system: 'Other',
        assembly: 'Other',
        labor: labor,
        parts: parts,
        subtotal: share
      });
    });
    return items;
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
    if (hrs) parts.push(hrs + ' hr' + (hrs === 1 ? '' : 's'));
    parts.push(mins + ' min' + (mins === 1 ? '' : 's'));
    return parts.join(' ');
  }

  function formatRelativeCreated(iso) {
    var now = new Date(2026, 5, 15, 12, 0, 0);
    var d = new Date(iso);
    var days = Math.max(0, Math.round((now - d) / 86400000));
    if (days === 0) return 'Created today';
    if (days === 1) return 'Created yesterday';
    return 'Created ' + days + ' days ago';
  }

  function getById(id) {
    return list.find(function (row) { return row.id === id; }) || null;
  }

  var list = buildList();

  return {
    list: list,
    tasks: TASKS,
    watchers: WATCHERS,
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
