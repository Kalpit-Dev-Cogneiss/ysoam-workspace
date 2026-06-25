window.YSOAM_PART_OUTWARD = (function () {
  'use strict';

  var ISSUERS = ['Rajesh Kumar', 'Priya Desai', 'Amit Sharma', 'Demo Manager'];
  var LIST = null;

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function toIso(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function parseIso(s) {
    var p = String(s || '').split('-');
    return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
  }

  function formatDateDisplay(iso) {
    var d = parseIso(iso);
    return pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + '/' + d.getFullYear();
  }

  function formatMoney(amount) {
    return '₹ ' + Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function buildList() {
    var parts = (window.YSOAM_PARTS && window.YSOAM_PARTS.list) || [];
    var vehicles = (window.YSOAM_VEHICLES && window.YSOAM_VEHICLES.list) || [];
    var activeParts = parts.filter(function (p) { return !p.archived; });
    var activeVehicles = vehicles.filter(function (v) { return v.assignment !== 'archived'; });
    if (!activeParts.length || !activeVehicles.length) return [];

    var today = new Date(2026, 5, 15);
    var list = [];
    var id = 80001;

    activeVehicles.forEach(function (v, vi) {
      var issueCount = 5 + (vi % 6);
      for (var i = 0; i < issueCount; i++) {
        var part = activeParts[(vi * 3 + i * 5) % activeParts.length];
        var daysAgo = (vi * 4 + i * 9) % 120;
        var d = new Date(today);
        d.setDate(d.getDate() - daysAgo);
        var qty = 1 + ((vi + i) % 4);
        var unitCost = part.unitCost || 0;
        list.push({
          id: 'PO-' + id++,
          issuedOn: toIso(d),
          partId: part.id,
          partNumber: part.partNumber,
          partDescription: part.description,
          category: part.category,
          categoryLabel: part.categoryLabel,
          manufacturer: part.manufacturer,
          manufacturerLabel: part.manufacturerLabel,
          mfrPartNumber: part.mfrPartNumber,
          thumbColor: part.thumbColor,
          vehicleId: v.id,
          vehicleName: v.name,
          vehiclePlate: v.plate || v.id,
          vehicleType: v.type,
          vehicleGroup: v.group,
          quantity: qty,
          unit: part.unit,
          unitLabel: part.unitLabel,
          unitShort: part.unitShort,
          unitCost: unitCost,
          unitCostLabel: formatMoney(unitCost),
          totalCost: qty * unitCost,
          totalCostLabel: formatMoney(qty * unitCost),
          workOrder: i % 3 === 0 ? 'WO-' + (4200 + vi * 10 + i) : '',
          issuedBy: ISSUERS[(vi + i) % ISSUERS.length],
          notes: i % 5 === 0 ? 'Issued during scheduled service' : '',
          createdDaysAgo: daysAgo
        });
      }
    });

    return list.sort(function (a, b) {
      return b.issuedOn.localeCompare(a.issuedOn);
    });
  }

  function getList() {
    if (!LIST) LIST = buildList();
    return LIST;
  }

  function getById(id) {
    return getList().filter(function (r) { return r.id === id; })[0] || null;
  }

  function getFormRecord(id) {
    var row = getById(id);
    if (!row) return null;
    return {
      partId: row.partId,
      vehicleId: row.vehicleId,
      quantity: row.quantity,
      issuedOn: row.issuedOn,
      workOrder: row.workOrder || '',
      issuedBy: row.issuedBy,
      notes: row.notes || ''
    };
  }

  function getHistoryForPart(partId, excludeId) {
    return getList().filter(function (r) {
      return r.partId === partId && r.id !== excludeId;
    });
  }

  function getHistoryForVehicle(vehicleId, excludeId) {
    return getList().filter(function (r) {
      return r.vehicleId === vehicleId && r.id !== excludeId;
    });
  }

  function inDateRange(iso, startIso, endIso) {
    if (!iso) return false;
    if (startIso && iso < startIso) return false;
    if (endIso && iso > endIso) return false;
    return true;
  }

  function filterEntries(opts) {
    opts = opts || {};
    return getList().filter(function (row) {
      if (opts.vehicleId && row.vehicleId !== opts.vehicleId) return false;
      if (opts.category && row.category !== opts.category) return false;
      if (opts.partId && row.partId !== opts.partId) return false;
      if (!inDateRange(row.issuedOn, opts.start, opts.end)) return false;
      if (opts.search) {
        var q = opts.search.toLowerCase();
        var hay = [
          row.id, row.partNumber, row.partDescription, row.vehicleId, row.vehicleName,
          row.workOrder, row.issuedBy, row.categoryLabel, row.manufacturerLabel
        ].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function aggregateByVehicle(opts) {
    var map = {};
    filterEntries(opts).forEach(function (row) {
      if (!map[row.vehicleId]) {
        map[row.vehicleId] = {
          vehicleId: row.vehicleId,
          vehicleName: row.vehicleName,
          issueCount: 0,
          quantity: 0,
          totalCost: 0,
          categories: {}
        };
      }
      var agg = map[row.vehicleId];
      agg.issueCount += 1;
      agg.quantity += row.quantity;
      agg.totalCost += row.totalCost;
      agg.categories[row.category] = (agg.categories[row.category] || 0) + row.totalCost;
    });

    return Object.keys(map).map(function (k) {
      var item = map[k];
      var topCat = '';
      var topCost = 0;
      Object.keys(item.categories).forEach(function (cat) {
        if (item.categories[cat] > topCost) {
          topCost = item.categories[cat];
          topCat = cat;
        }
      });
      var partsData = window.YSOAM_PARTS;
      var catLabel = topCat;
      if (partsData && partsData.categories) {
        var found = partsData.categories.filter(function (c) { return c.id === topCat; })[0];
        if (found) catLabel = found.label;
      }
      item.topCategory = catLabel;
      return item;
    }).sort(function (a, b) { return b.totalCost - a.totalCost; });
  }

  function aggregateByCategory(opts) {
    var map = {};
    var total = 0;
    filterEntries(opts).forEach(function (row) {
      total += row.totalCost;
      if (!map[row.category]) {
        map[row.category] = { category: row.category, categoryLabel: row.categoryLabel, totalCost: 0, quantity: 0 };
      }
      map[row.category].totalCost += row.totalCost;
      map[row.category].quantity += row.quantity;
    });

    return Object.keys(map).map(function (k) {
      var item = map[k];
      item.sharePct = total > 0 ? Math.round((item.totalCost / total) * 1000) / 10 : 0;
      return item;
    }).sort(function (a, b) { return b.totalCost - a.totalCost; });
  }

  function periodRange(id) {
    var now = new Date(2026, 5, 15);
    var start;
    var end = toIso(now);
    if (id === 'last30') {
      start = toIso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29));
    } else if (id === 'last90') {
      start = toIso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 89));
    } else if (id === 'ytd') {
      start = toIso(new Date(now.getFullYear(), 0, 1));
    } else {
      start = toIso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29));
    }
    return { start: start, end: end };
  }

  function vehicleOptions() {
    return ((window.YSOAM_VEHICLES && window.YSOAM_VEHICLES.list) || [])
      .filter(function (v) { return v.assignment !== 'archived'; })
      .map(function (v) { return { id: v.id, label: v.name + ' (' + v.id + ')' }; });
  }

  function partOptions() {
    return ((window.YSOAM_PARTS && window.YSOAM_PARTS.list) || [])
      .filter(function (p) { return !p.archived; })
      .map(function (p) {
        return { id: p.id, label: p.partNumber + (p.description ? ' — ' + p.description : '') };
      });
  }

  function categoryOptions() {
    return (window.YSOAM_PARTS && window.YSOAM_PARTS.categories) || [];
  }

  return {
    get list() { return getList(); },
    ISSUERS: ISSUERS,
    getById: getById,
    getFormRecord: getFormRecord,
    getHistoryForPart: getHistoryForPart,
    getHistoryForVehicle: getHistoryForVehicle,
    formatDateDisplay: formatDateDisplay,
    formatMoney: formatMoney,
    filterEntries: filterEntries,
    aggregateByVehicle: aggregateByVehicle,
    aggregateByCategory: aggregateByCategory,
    periodRange: periodRange,
    vehicleOptions: vehicleOptions,
    partOptions: partOptions,
    categoryOptions: categoryOptions
  };
})();
