window.YSOAM_METER_HISTORY = (function () {
  var vehicles = window.YSOAM_VEHICLES;
  var fleet = window.YSOAM_FLEET;

  function parseKm(meter) {
    return parseInt(String(meter || '').replace(/[^\d]/g, ''), 10) || 0;
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function formatDate(d) {
    return pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + '/' + d.getFullYear();
  }

  function buildList() {
    var list = [];
    var sources = [
      { type: 'service', prefix: 'Service Entry #', base: 49902000 },
      { type: 'fuel', prefix: 'Fuel Entry #', base: 214690000 },
      { type: 'gps', label: 'GPS Telematics' },
      { type: 'manual', label: 'Manual Entry' }
    ];
    var id = 10001;

    (vehicles.list || []).forEach(function (v, vi) {
      if (v.assignment === 'archived') return;
      var current = parseKm(v.meter);
      var steps = 6 + (vi % 4);
      for (var i = 0; i < steps; i++) {
        var daysAgo = i * (8 + ((vi + i) % 12));
        var d = new Date(2026, 5, 15);
        d.setDate(d.getDate() - daysAgo);
        var delta = i === 0 ? 0 : 1200 + ((vi * 7 + i * 13) % 4800);
        var value = Math.max(0, current - delta * i);
        var src = sources[i % sources.length];
        var source;
        if (src.type === 'service') {
          source = { type: 'service', label: src.prefix + (src.base + id), href: 'maintenance.html' };
        } else if (src.type === 'fuel') {
          source = { type: 'fuel', label: src.prefix + (src.base + id), href: 'fuel.html' };
        } else {
          source = { type: src.type, label: src.label, href: null };
        }
        var entry = {
          id: 'MTR-' + id,
          vehicleId: v.id,
          meterDate: d.toISOString().slice(0, 10),
          value: value,
          unit: 'km',
          isCurrent: i === 0,
          meterType: 'Primary',
          void: false,
          voidType: 'none',
          source: source,
          autoVoidReason: null
        };
        if (i === 2 && vi % 3 === 0) entry.meterType = 'Secondary';
        if (i === 4 && vi % 4 === 1) {
          entry.void = true;
          entry.voidType = 'manual';
          entry.isCurrent = false;
        }
        if (i === 5 && vi % 5 === 2) {
          entry.void = true;
          entry.voidType = 'auto';
          entry.autoVoidReason = 'Duplicate reading detected';
          entry.isCurrent = false;
        }
        list.push(entry);
        id += 1;
      }
    });

    list.sort(function (a, b) {
      return new Date(b.meterDate) - new Date(a.meterDate) || b.value - a.value;
    });

    return list;
  }

  var list = buildList();

  return {
    list: list,

    getById: function (id) {
      return list.find(function (e) { return e.id === id; }) || null;
    },

    formatDate: formatDate,

    formatValue: function (entry) {
      return entry.value.toLocaleString('en-IN') + ' ' + entry.unit;
    },

    valueSubtext: function (entry, allForVehicle) {
      if (entry.isCurrent) return 'Current mileage';
      var same = allForVehicle.filter(function (e) {
        return e.vehicleId === entry.vehicleId;
      }).sort(function (a, b) {
        return new Date(b.meterDate) - new Date(a.meterDate) || b.value - a.value;
      });
      var idx = -1;
      for (var i = 0; i < same.length; i++) {
        if (same[i].id === entry.id) { idx = i; break; }
      }
      if (idx <= 0) return '—';
      var prev = same[idx - 1];
      var diff = prev.value - entry.value;
      if (diff <= 0) return '—';
      return diff.toLocaleString('en-IN') + ' ' + entry.unit + ' ago';
    },

    statusColor: function (status) {
      var colors = fleet && fleet.statusColors ? fleet.statusColors : {};
      return colors[status] || '#64748B';
    },

    addEntry: function (vehicleId, opts) {
      opts = opts || {};
      var v = vehicles.getById(vehicleId);
      if (!v) return null;
      var value = opts.value != null ? opts.value : parseKm(v.meter);
      var meterDate = opts.meterDate || new Date(2026, 5, 15).toISOString().slice(0, 10);
      var isVoid = !!opts.void;
      var nextId = 100000 + list.length + 1;

      if (!isVoid) {
        list.forEach(function (e) {
          if (e.vehicleId === vehicleId) e.isCurrent = false;
        });
      }

      var entry = {
        id: 'MTR-' + nextId,
        vehicleId: vehicleId,
        meterDate: meterDate,
        value: value,
        unit: 'km',
        isCurrent: !isVoid,
        meterType: 'Primary',
        void: isVoid,
        voidType: isVoid ? 'manual' : 'none',
        source: { type: 'manual', label: 'Manual Entry', href: null },
        autoVoidReason: null
      };

      list.unshift(entry);
      list.sort(function (a, b) {
        return new Date(b.meterDate) - new Date(a.meterDate) || b.value - a.value;
      });
      return entry;
    }
  };
})();
