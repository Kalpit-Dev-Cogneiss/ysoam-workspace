window.YSOAM_FUEL_HISTORY = (function () {
  var vehicles = window.YSOAM_VEHICLES;

  var VENDORS = [
    { id: 'hp', name: 'HP Fuel', short: 'HP' },
    { id: 'shell', name: 'Shell', short: 'SH' },
    { id: 'ioc', name: 'Indian Oil', short: 'IO' },
    { id: 'bpcl', name: 'Bharat Petroleum', short: 'BP' },
    { id: 'reliance', name: 'Reliance Petrol', short: 'RP' }
  ];

  var LOCATIONS = [
    'Lonavala, MH', 'Pune, MH', 'Mumbai, MH', 'Khopoli, MH', 'Nashik, MH', null
  ];

  var LIST_SIZE = 50;

  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function formatDateTime(iso) {
    var d = new Date(iso);
    var h = d.getHours();
    var ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() +
      ' ' + h + ':' + pad(d.getMinutes()) + ampm;
  }

  function formatMoney(n) {
    return '₹ ' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function buildList() {
    var list = [];
    var today = new Date(2026, 5, 15, 12, 0, 0);
    var vehicleList = (vehicles && vehicles.list) ? vehicles.list.filter(function (v) {
      return v.assignment !== 'archived';
    }) : [];

    for (var i = 0; i < LIST_SIZE; i++) {
      var v = vehicleList[i % vehicleList.length];
      var vendor = VENDORS[i % VENDORS.length];
      var daysAgo = i % 45;
      var d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      d.setHours(6 + (i % 14), (i * 7) % 60, 0, 0);

      var liters = Math.round((42 + (i * 13) % 95) * 100) / 100;
      var pricePerLiter = Math.round((92 + (i * 3) % 18) * 100) / 100;
      var total = Math.round(liters * pricePerLiter * 100) / 100;
      var meterNum = parseInt(String(v.meter || '50000').replace(/[^\d]/g, ''), 10) || 50000;
      var meter = meterNum - (i * 180);
      var usageKm = 120 + (i * 17) % 280;
      var economy = Math.round((usageKm / liters) * 100) / 100;
      var costPerKm = Math.round((total / usageKm) * 100) / 100;
      var usageHrs = i % 4 === 0 ? Math.round((3 + (i % 8) * 0.5) * 10) / 10 : null;

      list.push({
        id: 'FH-' + (i + 1),
        vehicleId: v.id,
        date: d.toISOString(),
        vendor: vendor,
        meterEntry: meter.toLocaleString('en-IN') + ' km',
        usage: usageHrs ? usageHrs + ' hr' : usageKm + ' km',
        usageKm: usageKm,
        usageHrs: usageHrs,
        volume: liters,
        volumeUnit: 'L',
        total: total,
        pricePerUnit: pricePerLiter,
        fuelEconomy: economy,
        fuelEconomyUnit: 'km/L',
        fuelEconomyHrs: usageHrs ? Math.round((liters / usageHrs) * 100) / 100 : null,
        costPerMeter: costPerKm,
        costPerMeterUnit: '₹ / km',
        alerts: null,
        capacityException: null,
        location: LOCATIONS[i % LOCATIONS.length],
        isSample: i < 12
      });
    }

    list.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    return list;
  }

  function getById(id) {
    return list.find(function (r) { return r.id === id; }) || null;
  }

  function groups() {
    var set = {};
    (vehicles.list || []).forEach(function (v) {
      if (v.group) set[v.group] = true;
    });
    return Object.keys(set).sort();
  }

  function computeStats(rows) {
    if (!rows.length) {
      return { totalCost: 0, totalVolume: 0, avgEconomy: 0, avgEconomyHrs: 0, avgCost: 0 };
    }
    var totalCost = 0;
    var totalVolume = 0;
    var economySum = 0;
    var economyCount = 0;
    var hrsSum = 0;
    var hrsCount = 0;
    rows.forEach(function (r) {
      totalCost += r.total;
      totalVolume += r.volume;
      if (r.fuelEconomy) { economySum += r.fuelEconomy; economyCount++; }
      if (r.fuelEconomyHrs) { hrsSum += r.fuelEconomyHrs; hrsCount++; }
    });
    return {
      totalCost: Math.round(totalCost * 100) / 100,
      totalVolume: Math.round(totalVolume * 100) / 100,
      avgEconomy: economyCount ? Math.round((economySum / economyCount) * 100) / 100 : 0,
      avgEconomyHrs: hrsCount ? Math.round((hrsSum / hrsCount) * 100) / 100 : 0,
      avgCost: totalVolume ? Math.round((totalCost / totalVolume) * 100) / 100 : 0
    };
  }

  var list = buildList();

  return {
    list: list,
    vendors: VENDORS,
    formatDateTime: formatDateTime,
    formatMoney: formatMoney,
    getById: getById,
    groups: groups,
    computeStats: computeStats
  };
})();
