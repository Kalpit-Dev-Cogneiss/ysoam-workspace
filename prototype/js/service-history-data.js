window.YSOAM_SERVICE_HISTORY = (function () {
  var vehicles = window.YSOAM_VEHICLES;

  var TASKS = [
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
          vehicleId: v.id,
          completedAt: d.toISOString(),
          licensePlate: i % 9 === 0 ? v.plate : null,
          summary: null,
          assessment: null,
          watchers: i % 4 === 0 ? WATCHERS[0].label : null,
          priority: priority,
          meter: meter,
          tasks: tasks,
          issues: null,
          vendor: VENDORS[(vi + i) % VENDORS.length],
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

  var list = buildList();

  return {
    list: list,
    tasks: TASKS,
    watchers: WATCHERS,
    formatDateTime: formatDateTime,
    groups: function () {
      var set = {};
      (vehicles.list || []).forEach(function (v) {
        if (v.group) set[v.group] = true;
      });
      return Object.keys(set).sort();
    }
  };
})();
