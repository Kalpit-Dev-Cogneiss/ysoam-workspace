window.YSOAM_EXPENSES = (function () {
  var vehicles = window.YSOAM_VEHICLES;

  var TYPES = [
    'Insurance',
    'Tolls',
    'Telematics Device',
    'Vehicle Registration and Taxes',
    'Fines',
    'Fuel',
    'Service',
    'Tyres',
    'Permit',
    'Parking'
  ];

  var VENDORS = [
    'Pune Service Hub',
    'Expressway Motors',
    'Mumbai Fleet Parts',
    'Western Logistics Co.'
  ];

  var FILTER_TYPES = [
    'Annual Inspection Fees',
    'Depreciation',
    'Down Payment',
    'Fines',
    'Insurance',
    'Lease',
    'Legal/Court Costs',
    'Loan',
    'Tolls',
    'Telematics Device',
    'Vehicle Registration and Taxes',
    'Fuel',
    'Service',
    'Tyres',
    'Permit',
    'Parking'
  ];

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function formatDate(d) {
    return pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + '/' + d.getFullYear();
  }

  function buildList() {
    var list = [];
    var id = 50001;
    var today = new Date(2026, 5, 15);

    (vehicles.list || []).forEach(function (v, vi) {
      if (v.assignment === 'archived') return;
      var count = 8 + (vi % 5);
      for (var i = 0; i < count; i++) {
        var daysOffset = (vi * 3 + i * 7) % 90;
        var isFuture = i % 11 === 0;
        var d = new Date(today);
        if (isFuture) d.setDate(d.getDate() + 5 + (i % 20));
        else d.setDate(d.getDate() - daysOffset);

        var type = TYPES[(vi + i) % TYPES.length];
        var amount = 48.95 + ((vi * 17 + i * 31) % 4200) / 10;
        var vendor = (i % 4 === 0) ? 'Pune Service Hub' : null;

        list.push({
          id: 'EXP-' + id,
          vehicleId: v.id,
          date: d.toISOString().slice(0, 10),
          period: isFuture ? 'future' : 'past',
          type: type,
          vendor: vendor,
          source: 'Manually Entered',
          amount: Math.round(amount * 100) / 100,
          watchers: null,
          watcherId: i % 2 === 0 ? 'demo-manager' : null
        });
        id += 1;
      }
    });

    list.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    return list;
  }

  var list = buildList();
  var nextId = 60000 + list.length;

  function addEntry(entry) {
    var demoToday = new Date(2026, 5, 15);
    var entryDate = entry.date ? new Date(entry.date + 'T12:00:00') : demoToday;
    var period = entryDate > demoToday ? 'future' : 'past';

    list.unshift({
      id: 'EXP-' + (nextId++),
      vehicleId: entry.vehicleId,
      date: entry.date,
      period: period,
      type: entry.type,
      vendor: entry.vendor || null,
      source: 'Manually Entered',
      amount: Math.round(entry.amount * 100) / 100,
      watchers: null,
      watcherId: 'demo-manager',
      notes: entry.notes || null,
      frequency: entry.frequency || 'single'
    });

    list.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    return list[0];
  }

  return {
    list: list,
    types: TYPES,
    filterTypes: FILTER_TYPES,
    vendors: VENDORS,
    addEntry: addEntry,
    formatDate: formatDate,

    formatAmount: function (amount) {
      return '₹ ' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  };
})();
