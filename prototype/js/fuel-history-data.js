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

  var LOCATION_COORDS = {
    'Lonavala, MH': { lat: 18.7546, lng: 73.4062 },
    'Pune, MH': { lat: 18.5204, lng: 73.8567 },
    'Mumbai, MH': { lat: 19.076, lng: 72.8777 },
    'Khopoli, MH': { lat: 18.7856, lng: 73.3459 },
    'Nashik, MH': { lat: 19.9975, lng: 73.7898 }
  };

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

  function formatShortDateTime(iso) {
    var d = new Date(iso);
    var h = d.getHours();
    var ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + '/' + d.getFullYear() +
      ' ' + h + ':' + pad(d.getMinutes()) + ampm;
  }

  function formatRelativeMeta(createdIso, updatedIso) {
    var now = new Date(2026, 5, 22, 12, 0, 0);
    function daysAgo(iso) {
      var d = new Date(iso);
      var days = Math.max(0, Math.floor((now - d) / 86400000));
      if (days === 0) return 'today';
      if (days === 1) return '1 day ago';
      return days + ' days ago';
    }
    return 'Created ' + daysAgo(createdIso) + ' • Updated ' + daysAgo(updatedIso);
  }

  function compareMetric(current, previous, higherIsBad) {
    if (previous == null || previous === 0) {
      if (!current) return null;
      return { delta: current, pct: null, up: true, good: !higherIsBad };
    }
    var delta = Math.round((current - previous) * 1000) / 1000;
    var pct = Math.round(Math.abs((delta / previous) * 100) * 10) / 10;
    var up = delta > 0;
    var good = higherIsBad ? !up : up;
    if (delta < 0 && !higherIsBad) good = true;
    if (delta < 0 && higherIsBad) good = true;
    return { delta: Math.abs(delta), pct: pct, up: up, good: good };
  }

  function buildComparisons(row, previous) {
    if (!previous) {
      return {
        volume: row.volume ? { delta: row.volume, pct: null, up: true, good: false } : null,
        price: row.pricePerUnit ? { delta: row.pricePerUnit, pct: null, up: true, good: false } : null,
        total: row.total ? { delta: row.total, pct: 0, up: true, good: false } : null,
        usage: row.usageKm ? { delta: row.usageKm, pct: null, up: true, good: true } : null,
        economy: row.fuelEconomy ? { delta: row.fuelEconomy, pct: null, up: true, good: true } : null,
        cost: row.costPerMeter ? { delta: row.costPerMeter, pct: null, up: false, good: true } : null
      };
    }
    return {
      volume: compareMetric(row.volume, previous.volume, true),
      price: compareMetric(row.pricePerUnit, previous.pricePerUnit, true),
      total: compareMetric(row.total, previous.total, true),
      usage: compareMetric(row.usageKm, previous.usageKm, false),
      economy: compareMetric(row.fuelEconomy, previous.fuelEconomy, false),
      cost: compareMetric(row.costPerMeter, previous.costPerMeter, true)
    };
  }

  function assignPreviousEntries(list) {
    var byVehicle = {};
    list.forEach(function (r) {
      if (!byVehicle[r.vehicleId]) byVehicle[r.vehicleId] = [];
      byVehicle[r.vehicleId].push(r);
    });
    Object.keys(byVehicle).forEach(function (vid) {
      var entries = byVehicle[vid].sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });
      entries.forEach(function (r, i) {
        r.previousEntry = entries[i + 1] || null;
        r.comparisons = buildComparisons(r, r.previousEntry);
      });
    });
  }

  function getCoords(location) {
    return location && LOCATION_COORDS[location] ? LOCATION_COORDS[location] : null;
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
        entryNumber: String(214695700 + i + 1),
        vehicleId: v.id,
        date: d.toISOString(),
        createdAt: new Date(d.getTime() - 86400000 * (1 + (i % 3))).toISOString(),
        updatedAt: new Date(d.getTime() - 86400000 * (i % 2)).toISOString(),
        vendor: vendor,
        meterEntry: meter.toLocaleString('en-IN') + ' km',
        meter: meter,
        usage: usageHrs ? usageHrs + ' hr' : usageKm + ' km',
        usageKm: usageKm,
        usageHrs: usageHrs,
        volume: liters,
        volumeUnit: 'L',
        total: total,
        pricePerUnit: pricePerLiter,
        fuelType: i % 7 === 0 ? null : 'Diesel',
        fuelCard: i % 5 === 0,
        reference: i % 4 === 0 ? null : 'INV-' + (10000 + i),
        fuelEconomy: economy,
        fuelEconomyUnit: 'km/L',
        fuelEconomyHrs: usageHrs ? Math.round((liters / usageHrs) * 100) / 100 : null,
        costPerMeter: costPerKm,
        costPerMeterUnit: '₹ / km',
        alerts: null,
        capacityException: null,
        location: LOCATIONS[i % LOCATIONS.length],
        coords: getCoords(LOCATIONS[i % LOCATIONS.length]),
        isSample: i < 12
      });
    }

    list.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    assignPreviousEntries(list);
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
    formatShortDateTime: formatShortDateTime,
    formatRelativeMeta: formatRelativeMeta,
    formatMoney: formatMoney,
    getById: getById,
    getCoords: getCoords,
    groups: groups,
    computeStats: computeStats
  };
})();
