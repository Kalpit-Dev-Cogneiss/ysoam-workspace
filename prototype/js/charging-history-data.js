window.YSOAM_CHARGING_HISTORY = (function () {
  var vehicles = window.YSOAM_VEHICLES;

  var VENDORS = [
    { id: 'tata-power', name: 'Tata Power EZ Charge', short: 'TP' },
    { id: 'statiq', name: 'Statiq', short: 'ST' },
    { id: 'chargezone', name: 'ChargeZone', short: 'CZ' },
    { id: 'ather', name: 'Ather Grid', short: 'AG' },
    { id: 'bpcl-ev', name: 'BPCL EV', short: 'BE' }
  ];

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

  function formatDuration(minutes) {
    if (minutes == null) return '—';
    if (minutes < 60) return minutes + (minutes === 1 ? ' min' : ' mins');
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    if (!m) return h + (h === 1 ? ' hr' : ' hrs');
    return h + ' hr ' + m + ' mins';
  }

  function formatUnitPrice(n) {
    return '₹ ' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
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
    var now = new Date(2026, 5, 23, 12, 0, 0);
    function daysAgo(iso) {
      var d = new Date(iso);
      var days = Math.max(0, Math.floor((now - d) / 86400000));
      if (days === 0) return 'today';
      if (days === 1) return '1 day ago';
      return days + ' days ago';
    }
    return 'Created ' + daysAgo(createdIso) + ' • Updated ' + daysAgo(updatedIso);
  }

  function buildList() {
    var list = [];
    var today = new Date(2026, 5, 15, 12, 0, 0);
    var vehicleList = (vehicles && vehicles.list) ? vehicles.list.filter(function (v) {
      return v.assignment !== 'archived';
    }) : [];

    for (var i = 0; i < 48; i++) {
      var v = vehicleList[i % vehicleList.length];
      var vendor = VENDORS[i % VENDORS.length];
      var daysAgo = i % 40;
      var start = new Date(today);
      start.setDate(start.getDate() - daysAgo);
      start.setHours(7 + (i % 12), (i * 11) % 60, 0, 0);

      var durationMin = 25 + (i * 17) % 140;
      var end = new Date(start.getTime() + durationMin * 60000);
      var energyKwh = Math.round((18 + (i * 9) % 62) * 10) / 10;
      var unitPrice = Math.round((8.5 + (i * 2) % 6) * 100) / 100;
      var energyCost = Math.round(energyKwh * unitPrice * 100) / 100;
      var meterNum = parseInt(String(v.meter || '50000').replace(/[^\d]/g, ''), 10) || 50000;
      var meter = meterNum - (i * 150);
      var usageKm = 90 + (i * 13) % 220;
      var economy = energyKwh ? Math.round((usageKm / energyKwh) * 100) / 100 : null;
      var costPerKm = usageKm ? Math.round((energyCost / usageKm) * 100) / 100 : null;
      var hasMetrics = i % 4 !== 0;

      if (i === 0) {
        start = new Date(2026, 5, 23, 13, 54, 0);
        end = new Date(2026, 5, 23, 15, 0, 0);
        durationMin = 66;
        energyKwh = 200;
        unitPrice = 200;
        energyCost = 40000;
        hasMetrics = false;
      }

      list.push({
        id: 'CH-' + (i + 1),
        entryNumber: String(1756130 - i),
        vehicleId: v.id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        durationMin: durationMin,
        vendor: vendor,
        source: 'Manually Entered',
        meterEntry: hasMetrics ? meter.toLocaleString('en-IN') + ' km' : null,
        meter: hasMetrics ? meter : null,
        usage: hasMetrics ? usageKm + ' km' : null,
        usageKm: hasMetrics ? usageKm : null,
        economy: hasMetrics ? economy : null,
        economyUnit: 'km/kWh',
        totalEnergy: energyKwh,
        unitPrice: unitPrice,
        energyCost: energyCost,
        costPerMeter: hasMetrics ? costPerKm : null,
        costPerMeterUnit: '₹ / km',
        reference: i % 5 === 0 ? null : 'TXN-' + (88000 + i),
        location: i % 6 === 0 ? 'Pune, MH' : null,
        coords: i % 6 === 0 ? { lat: 18.5204, lng: 73.8567 } : null,
        createdAt: new Date(start.getTime() - 86400000 * (1 + (i % 3))).toISOString(),
        updatedAt: new Date(start.getTime() - 86400000 * (i % 2)).toISOString(),
        isSample: i < 10,
        isPersonal: i % 11 === 0
      });
    }

    list.sort(function (a, b) { return new Date(b.startTime) - new Date(a.startTime); });
    return list;
  }

  function getById(id) {
    return list.find(function (r) { return r.id === id; }) || null;
  }

  function computeStats(rows) {
    if (!rows.length) {
      return { totalCost: 0, totalEnergy: 0, avgEconomy: 0, avgCost: 0 };
    }
    var totalCost = 0;
    var totalEnergy = 0;
    var economySum = 0;
    var economyCount = 0;
    rows.forEach(function (r) {
      totalCost += r.energyCost;
      totalEnergy += r.totalEnergy;
      if (r.economy) { economySum += r.economy; economyCount++; }
    });
    return {
      totalCost: Math.round(totalCost * 100) / 100,
      totalEnergy: Math.round(totalEnergy * 10) / 10,
      avgEconomy: economyCount ? Math.round((economySum / economyCount) * 100) / 100 : 0,
      avgCost: totalEnergy ? Math.round((totalCost / totalEnergy) * 100) / 100 : 0
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
    formatUnitPrice: formatUnitPrice,
    formatDuration: formatDuration,
    getById: getById,
    computeStats: computeStats
  };
})();
