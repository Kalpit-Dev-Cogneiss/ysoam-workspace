window.YSOAM_TYRES = (function () {
  'use strict';

  var BRANDS = ['MRF', 'Apollo', 'Bridgestone', 'CEAT', 'JK Tyre'];
  var SIZES = ['295/80R22.5', '11R22.5', '10.00R20', '825R16'];
  var POSITIONS = [
    'Steer Left', 'Steer Right',
    'Drive Left Outer', 'Drive Left Inner',
    'Drive Right Inner', 'Drive Right Outer'
  ];

  var STATUSES = [
    { id: 'on_vehicle', label: 'On Vehicle' },
    { id: 'in_stock', label: 'In Stock' },
    { id: 'replace_soon', label: 'Replace Soon' },
    { id: 'retired', label: 'Retired' }
  ];

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function formatDate(d) {
    return pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + '/' + d.getFullYear();
  }

  function formatMoney(n) {
    return '₹ ' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function buildList() {
    var vehicles = (window.YSOAM_VEHICLES && window.YSOAM_VEHICLES.list) || [];
    var active = vehicles.filter(function (v) { return v.assignment !== 'archived'; });
    var list = [];
    var id = 1;
    var today = new Date(2026, 5, 15);

    active.forEach(function (v, vi) {
      var posCount = 4 + (vi % 3);
      for (var p = 0; p < posCount; p++) {
        var tread = 2 + ((vi + p) % 12);
        var status = tread <= 3 ? 'replace_soon' : 'on_vehicle';
        var daysInstalled = 60 + (vi * 20 + p * 15);
        var installed = new Date(today);
        installed.setDate(installed.getDate() - daysInstalled);
        list.push({
          id: 'TYR-' + pad(id++),
          serialNumber: 'SN' + (880000 + id * 17),
          position: POSITIONS[p % POSITIONS.length],
          vehicleId: v.id,
          vehicleName: v.name,
          brand: BRANDS[(vi + p) % BRANDS.length],
          size: SIZES[vi % SIZES.length],
          treadDepthMm: tread,
          pressurePsi: 78 + (p % 8),
          status: status,
          statusLabel: status === 'replace_soon' ? 'Replace Soon' : 'On Vehicle',
          installedOn: formatDate(installed),
          cost: 18500 + (vi % 4) * 1200,
          costLabel: formatMoney(18500 + (vi % 4) * 1200)
        });
      }
    });

    var stockCount = 8;
    for (var s = 0; s < stockCount; s++) {
      list.push({
        id: 'TYR-' + pad(id++),
        serialNumber: 'SN' + (880000 + id * 13),
        position: '—',
        vehicleId: '',
        vehicleName: '',
        brand: BRANDS[s % BRANDS.length],
        size: SIZES[s % SIZES.length],
        treadDepthMm: 10 + (s % 4),
        pressurePsi: 80,
        status: 'in_stock',
        statusLabel: 'In Stock',
        installedOn: '—',
        cost: 19200,
        costLabel: formatMoney(19200)
      });
    }

    for (var r = 0; r < 4; r++) {
      list.push({
        id: 'TYR-' + pad(id++),
        serialNumber: 'SN' + (770000 + r * 11),
        position: 'Drive Left Outer',
        vehicleId: '',
        vehicleName: '',
        brand: BRANDS[r % BRANDS.length],
        size: SIZES[0],
        treadDepthMm: 1,
        pressurePsi: 0,
        status: 'retired',
        statusLabel: 'Retired',
        installedOn: '01/15/2024',
        cost: 16800,
        costLabel: formatMoney(16800)
      });
    }

    return list;
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
      onVehicle: list.filter(function (r) { return r.status === 'on_vehicle'; }).length,
      inStock: list.filter(function (r) { return r.status === 'in_stock'; }).length,
      replaceSoon: list.filter(function (r) { return r.status === 'replace_soon'; }).length
    };
  }

  function vehicleOptions() {
    var seen = {};
    return getList().filter(function (r) { return r.vehicleId; }).map(function (r) {
      return { id: r.vehicleId, label: r.vehicleName };
    }).filter(function (o) {
      if (seen[o.id]) return false;
      seen[o.id] = true;
      return true;
    });
  }

  function getReadings(tyreId) {
    var tyre = getById(tyreId);
    if (!tyre) return [];
    var readings = [];
    var today = new Date(2026, 5, 15);
    var count = 3 + (tyreId.length % 4);
    var recorders = ['Rajesh Kumar', 'Amit Patel', 'Priya Sharma', 'System IoT'];
    for (var i = 0; i < count; i++) {
      var d = new Date(today);
      d.setDate(d.getDate() - i * 28);
      readings.push({
        id: 'RD-' + tyreId.replace(/[^A-Z0-9]/gi, '') + '-' + (i + 1),
        date: formatDate(d),
        treadDepthMm: Math.max(1, tyre.treadDepthMm + i),
        pressurePsi: Math.max(0, tyre.pressurePsi + (i % 3) - 1),
        recordedBy: recorders[i % recorders.length],
        source: i % 2 === 0 ? 'Manual' : 'IoT Sensor'
      });
    }
    return readings;
  }

  function vehicleList() {
    var vehicles = (window.YSOAM_VEHICLES && window.YSOAM_VEHICLES.list) || [];
    return vehicles.filter(function (v) { return v.assignment !== 'archived'; }).map(function (v) {
      return { id: v.id, label: v.name + ' (' + v.id + ')' };
    });
  }

  return {
    BRANDS: BRANDS,
    SIZES: SIZES,
    POSITIONS: POSITIONS,
    STATUSES: STATUSES,
    get list() { return getList(); },
    getById: getById,
    getReadings: getReadings,
    stats: stats,
    vehicleOptions: vehicleOptions,
    vehicleList: vehicleList,
    formatMoney: formatMoney
  };
})();
