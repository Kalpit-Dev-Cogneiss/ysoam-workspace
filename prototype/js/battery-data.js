window.YSOAM_BATTERY = (function () {
  'use strict';

  var STATUSES = [
    { id: 'healthy', label: 'Healthy' },
    { id: 'attention', label: 'Attention' },
    { id: 'critical', label: 'Critical' }
  ];

  var EV_VEHICLES = [
    { id: 'MH-01-EF-7890', packKwh: 120 },
    { id: 'MH-22-LM-6789', packKwh: 150 },
    { id: 'MH-12-JK-2345', packKwh: 100 },
    { id: 'MH-15-PQ-4567', packKwh: 130 }
  ];

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function formatDateTime(d) {
    return pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + '/' + d.getFullYear() + ' ' +
      pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function hoursAgoLabel(h) {
    if (h < 1) return 'Just now';
    if (h < 24) return h + 'h ago';
    return Math.floor(h / 24) + 'd ago';
  }

  function buildList() {
    var vehicles = window.YSOAM_VEHICLES;
    var today = new Date(2026, 5, 15, 14, 0, 0);

    return EV_VEHICLES.map(function (ev, i) {
      var v = vehicles && vehicles.getById ? vehicles.getById(ev.id) : null;
      var soc = 45 + ((i * 17) % 50);
      var soh = 88 + (i % 10);
      var temp = 28 + (i % 12);
      var status = soh < 90 || soc < 25 ? (soc < 20 ? 'critical' : 'attention') : 'healthy';
      if (temp > 38) status = 'critical';
      else if (temp > 34 && status === 'healthy') status = 'attention';
      var hoursAgo = 2 + i * 5;
      var charged = new Date(today.getTime() - hoursAgo * 60 * 60 * 1000);
      var rangeKm = Math.round((soc / 100) * ev.packKwh * 4.2);

      return {
        id: 'BAT-' + (1001 + i),
        vehicleId: ev.id,
        vehicleName: v ? v.name : ev.id,
        vehicleGroup: v ? v.group : '',
        packKwh: ev.packKwh,
        soc: soc,
        soh: soh,
        voltage: 360 + (ev.packKwh * 0.2) + (i * 2),
        tempC: temp,
        cycles: 280 + i * 45,
        lastCharge: formatDateTime(charged),
        lastChargeLabel: hoursAgoLabel(hoursAgo),
        rangeKm: rangeKm,
        status: status,
        statusLabel: STATUSES.filter(function (s) { return s.id === status; })[0].label
      };
    });
  }

  var LIST = null;

  function getList() {
    if (!LIST) LIST = buildList();
    return LIST;
  }

  function getById(id) {
    return getList().filter(function (r) { return r.id === id; })[0] || null;
  }

  function stats() {
    var list = getList();
    return {
      total: list.length,
      healthy: list.filter(function (r) { return r.status === 'healthy'; }).length,
      attention: list.filter(function (r) { return r.status === 'attention'; }).length,
      critical: list.filter(function (r) { return r.status === 'critical'; }).length,
      avgSoc: Math.round(list.reduce(function (s, r) { return s + r.soc; }, 0) / list.length)
    };
  }

  function vehicleOptions() {
    return getList().map(function (r) {
      return { id: r.vehicleId, label: r.vehicleName + ' (' + r.vehicleId + ')' };
    });
  }

  function getChargingSessions(batteryId) {
    var row = getById(batteryId);
    if (!row) return [];
    var sessions = [];
    var today = new Date(2026, 5, 15);
    var count = 3 + (batteryId.length % 3);
    for (var i = 0; i < count; i++) {
      var d = new Date(today);
      d.setDate(d.getDate() - i * 4);
      var socStart = 15 + ((i * 11) % 40);
      var socEnd = Math.min(95, socStart + 25 + (i * 7) % 30);
      var energy = Math.round((socEnd - socStart) / 100 * row.packKwh * 10) / 10;
      sessions.push({
        id: 'CHG-' + (4100 + i),
        date: formatDateTime(d).split(' ')[0],
        energyKwh: energy,
        durationMin: 45 + i * 25,
        durationLabel: Math.floor((45 + i * 25) / 60) + 'h ' + ((45 + i * 25) % 60) + 'm',
        socStart: socStart,
        socEnd: socEnd,
        vendor: ['Tata Power', 'ChargeZone', 'Statiq'][i % 3],
        costLabel: '₹ ' + (energy * 12 + 80).toLocaleString('en-IN')
      });
    }
    return sessions;
  }

  return {
    STATUSES: STATUSES,
    get list() { return getList(); },
    getById: getById,
    getChargingSessions: getChargingSessions,
    stats: stats,
    vehicleOptions: vehicleOptions
  };
})();
