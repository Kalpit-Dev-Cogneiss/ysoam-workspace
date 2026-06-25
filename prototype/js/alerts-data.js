window.YSOAM_ALERTS = (function () {
  'use strict';

  var TYPES = [
    { id: 'fuel_anomaly', label: 'Fuel Anomaly' },
    { id: 'document_expiry', label: 'Document Expiry' },
    { id: 'maintenance_due', label: 'Maintenance Due' },
    { id: 'geofence_breach', label: 'Geofence Breach' },
    { id: 'idle_time', label: 'Idle Time' },
    { id: 'harsh_driving', label: 'Harsh Driving' },
    { id: 'breakdown', label: 'Breakdown' },
    { id: 'trip_exception', label: 'Trip Exception' }
  ];

  var SEVERITIES = [
    { id: 'critical', label: 'Critical' },
    { id: 'high', label: 'High' },
    { id: 'medium', label: 'Medium' },
    { id: 'low', label: 'Low' }
  ];

  var SEED = [
    { type: 'fuel_anomaly', severity: 'high', title: 'Abnormal fuel drop detected', summary: '42 L consumed in 18 km — possible theft or leak', vehicleId: 'MH-14-CD-5678', tripId: 'TRP-2026-0138', source: 'Fuel Analytics', read: false, hoursAgo: 2 },
    { type: 'document_expiry', severity: 'critical', title: 'Insurance expiring in 3 days', summary: 'Policy ends 18 Jun 2026 · HDFC Ergo commercial cover', vehicleId: 'MH-09-FG-9012', source: 'Documents', read: false, hoursAgo: 4 },
    { type: 'maintenance_due', severity: 'medium', title: 'Oil change due soon', summary: 'Service task due at 128,000 km · 1,200 km remaining', vehicleId: 'MH-12-AB-1234', source: 'Service Reminders', read: false, hoursAgo: 6 },
    { type: 'geofence_breach', severity: 'high', title: 'Unauthorized zone entry', summary: 'Vehicle entered Restricted Yard B without clearance', vehicleId: 'MH-04-HI-3456', source: 'Geofencing', read: false, hoursAgo: 8 },
    { type: 'idle_time', severity: 'medium', title: 'Extended idle — 4h 20m', summary: 'Engine on, stationary near Nashik toll plaza', vehicleId: 'MH-43-NO-0123', source: 'GPS Telematics', read: true, hoursAgo: 10 },
    { type: 'harsh_driving', severity: 'high', title: 'Harsh braking event', summary: '3 hard brake events in 15 min on Mumbai–Pune Expressway', vehicleId: 'MH-12-JK-2345', source: 'Driver Safety', read: false, hoursAgo: 12 },
    { type: 'breakdown', severity: 'critical', title: 'Breakdown reported — engine fault', summary: 'Driver reported loss of power · awaiting roadside assist', vehicleId: 'MH-09-FG-9012', source: 'Work Orders', read: false, hoursAgo: 14 },
    { type: 'trip_exception', severity: 'medium', title: 'Route deviation on active trip', summary: '12 km off planned route · TRP-2026-0145', vehicleId: 'MH-22-LM-6789', tripId: 'TRP-2026-0145', source: 'Trip Operations', read: true, hoursAgo: 18 },
    { type: 'fuel_anomaly', severity: 'medium', title: 'Low tank at remote location', summary: '12% fuel remaining · 38 km to nearest depot', vehicleId: 'MH-15-PQ-4567', source: 'Fuel Monitoring', read: true, hoursAgo: 22 },
    { type: 'document_expiry', severity: 'high', title: 'Permit renewal required', summary: 'All-India permit expires 25 Jun 2026', vehicleId: 'MH-01-EF-7890', source: 'Documents', read: false, hoursAgo: 26 },
    { type: 'maintenance_due', severity: 'low', title: 'Annual inspection due', summary: 'Due 30 Jun 2026 · Pune RTO compliance', vehicleId: 'MH-14-CD-5678', source: 'Compliance', read: true, hoursAgo: 30 },
    { type: 'geofence_breach', severity: 'critical', title: 'Depot exit without dispatch', summary: 'Left Pune Depot geofence with no active trip', vehicleId: 'MH-12-AB-1234', source: 'Geofencing', read: false, hoursAgo: 36 },
    { type: 'idle_time', severity: 'low', title: 'Idle threshold exceeded', summary: '45 min idle at customer site · Kalyan', vehicleId: 'MH-07-RS-8901', source: 'GPS Telematics', read: true, hoursAgo: 40 },
    { type: 'harsh_driving', severity: 'medium', title: 'Rapid acceleration detected', summary: 'Speed increased 0–60 km/h in 8 seconds', vehicleId: 'MH-22-LM-6789', source: 'Driver Safety', read: true, hoursAgo: 48 },
    { type: 'breakdown', severity: 'high', title: 'Tyre pressure critical', summary: 'Rear axle inner tyre · 18 PSI (recommended 80 PSI)', vehicleId: 'MH-15-PQ-4567', source: 'IoT Sensors', read: false, hoursAgo: 52 },
    { type: 'trip_exception', severity: 'critical', title: 'Trip SLA breach — late delivery', summary: 'ETA exceeded by 2h 15m · customer notified', vehicleId: 'MH-12-JK-2345', tripId: 'TRP-2026-0140', source: 'Trip Operations', read: false, hoursAgo: 56 },
    { type: 'fuel_anomaly', severity: 'low', title: 'Mileage below fleet average', summary: '4.2 km/L vs fleet avg 5.8 km/L (last 7 days)', vehicleId: 'MH-43-NO-0123', source: 'Fuel Analytics', read: true, hoursAgo: 60 },
    { type: 'document_expiry', severity: 'medium', title: 'Fitness certificate expiring', summary: 'Expires 01 Jul 2026', vehicleId: 'MH-04-HI-3456', source: 'Documents', read: true, hoursAgo: 72 },
    { type: 'maintenance_due', severity: 'high', title: 'Brake inspection overdue', summary: '7 days past due · WO-4412 incomplete', vehicleId: 'MH-09-FG-9012', source: 'Service Reminders', read: false, hoursAgo: 80 },
    { type: 'geofence_breach', severity: 'medium', title: 'Customer site dwell alert', summary: 'Exceeded 2h allowed dwell at Lonavala DC', vehicleId: 'MH-01-EF-7890', source: 'Geofencing', read: true, hoursAgo: 96 },
    { type: 'idle_time', severity: 'high', title: 'Overnight idle with engine on', summary: '6h 10m idle · fuel waste estimated ₹840', vehicleId: 'MH-14-CD-5678', source: 'GPS Telematics', read: false, hoursAgo: 108 },
    { type: 'harsh_driving', severity: 'critical', title: 'Speed limit violation', summary: '92 km/h in 60 km/h zone · camera corroborated', vehicleId: 'MH-12-AB-1234', source: 'Driver Safety', read: false, hoursAgo: 120 },
    { type: 'breakdown', severity: 'medium', title: 'Coolant temperature warning', summary: 'Engine temp 108°C · driver advised to stop', vehicleId: 'MH-22-LM-6789', source: 'IoT Sensors', read: true, hoursAgo: 132 },
    { type: 'trip_exception', severity: 'low', title: 'Checkpoint missed', summary: 'Lonavala weigh bridge checkpoint not logged', vehicleId: 'MH-15-PQ-4567', tripId: 'TRP-2026-0132', source: 'Trip Operations', read: true, hoursAgo: 144 }
  ];

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function triggeredAt(hoursAgo) {
    var now = new Date(2026, 5, 15, 14, 30, 0);
    var d = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' +
      pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':00';
  }

  function formatTriggered(iso) {
    var d = new Date(iso);
    var now = new Date(2026, 5, 15, 14, 30, 0);
    var diffMs = now - d;
    var diffH = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffH < 1) return 'Just now';
    if (diffH < 24) return diffH + 'h ago';
    var diffD = Math.floor(diffH / 24);
    if (diffD === 1) return 'Yesterday';
    if (diffD < 7) return diffD + ' days ago';
    return pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + '/' + d.getFullYear();
  }

  function formatTriggeredFull(iso) {
    var d = new Date(iso);
    return pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + '/' + d.getFullYear() + ' ' +
      pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function labelFor(list, id) {
    var item = list.filter(function (x) { return x.id === id; })[0];
    return item ? item.label : id;
  }

  function buildList() {
    var vehicles = (window.YSOAM_VEHICLES && window.YSOAM_VEHICLES.list) || [];
    return SEED.map(function (row, index) {
      var v = vehicles.filter(function (x) { return x.id === row.vehicleId; })[0];
      return {
        id: 'ALT-' + (10001 + index),
        type: row.type,
        typeLabel: labelFor(TYPES, row.type),
        severity: row.severity,
        severityLabel: labelFor(SEVERITIES, row.severity),
        title: row.title,
        summary: row.summary,
        vehicleId: row.vehicleId,
        vehicleName: v ? v.name : row.vehicleId,
        vehicleImage: v ? v.image : '',
        vehicleGroup: v ? v.group : '',
        tripId: row.tripId || '',
        source: row.source,
        read: row.read,
        triggeredAt: triggeredAt(row.hoursAgo),
        triggeredLabel: formatTriggered(triggeredAt(row.hoursAgo)),
        triggeredFull: formatTriggeredFull(triggeredAt(row.hoursAgo))
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

  function vehicleOptions() {
    var seen = {};
    return getList().map(function (r) { return { id: r.vehicleId, label: r.vehicleName }; })
      .filter(function (o) {
        if (seen[o.id]) return false;
        seen[o.id] = true;
        return true;
      }).sort(function (a, b) { return a.label.localeCompare(b.label); });
  }

  function stats() {
    var list = getList();
    return {
      total: list.length,
      unread: list.filter(function (r) { return !r.read; }).length,
      critical: list.filter(function (r) { return r.severity === 'critical' && !r.read; }).length,
      high: list.filter(function (r) { return r.severity === 'high' && !r.read; }).length
    };
  }

  return {
    TYPES: TYPES,
    SEVERITIES: SEVERITIES,
    get list() { return getList(); },
    getById: getById,
    vehicleOptions: vehicleOptions,
    stats: stats,
    formatTriggered: formatTriggered,
    formatTriggeredFull: formatTriggeredFull
  };
})();
