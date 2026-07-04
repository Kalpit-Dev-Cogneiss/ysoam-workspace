(function () {
  'use strict';

  if (document.body.getAttribute('data-page') !== 'accident-control') return;

  var data = window.YSOAM_ACCIDENT_CONTROL;
  var map = null;
  var circleLayer = null;
  var routeLayer = null;
  var selectedId = data && data.accidents[0] ? data.accidents[0].id : null;
  var search = '';

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function severityClass(severity) {
    return 'accident-severity accident-severity--' + esc(severity);
  }

  function statusPill(status) {
    return '<span class="accident-status">' + esc(status) + '</span>';
  }

  function renderKpis() {
    var stats = data.stats();
    document.getElementById('accident-kpi-strip').innerHTML =
      '<div class="alerts-kpi accident-kpi"><span class="alerts-kpi__value tabular-nums">' + stats.total + '</span><span class="alerts-kpi__label">Incidents</span></div>' +
      '<div class="alerts-kpi accident-kpi accident-kpi--critical"><span class="alerts-kpi__value tabular-nums">' + stats.critical + '</span><span class="alerts-kpi__label">Critical</span></div>' +
      '<div class="alerts-kpi accident-kpi accident-kpi--active"><span class="alerts-kpi__value tabular-nums">' + stats.active + '</span><span class="alerts-kpi__label">Open Cases</span></div>' +
      '<div class="alerts-kpi accident-kpi"><span class="alerts-kpi__value tabular-nums">' + stats.vehiclesPassed + '</span><span class="alerts-kpi__label">Vehicles in Area</span></div>' +
      '<div class="alerts-kpi accident-kpi accident-kpi--active"><span class="alerts-kpi__value tabular-nums">' + stats.emergencyAvailable + '</span><span class="alerts-kpi__label">Emergency Services</span></div>';
  }

  function filteredAccidents() {
    var q = search.trim().toLowerCase();
    if (!q) return data.accidents.slice();
    return data.accidents.filter(function (row) {
      return [
        row.id, row.title, row.severityLabel, row.status, row.geofenceName,
        row.location, row.involvedVehicle, row.involvedVehicleName, row.route
      ].join(' ').toLowerCase().indexOf(q) !== -1;
    });
  }

  function renderTable() {
    var rows = filteredAccidents();
    var count = document.getElementById('accident-count');
    var root = document.getElementById('accident-table');
    if (count) count.textContent = (rows.length ? '1 – ' + rows.length : '0') + ' of ' + rows.length;

    var html = '<table class="data-table data-table--list accident-table"><thead><tr>' +
      '<th>Severity</th>' +
      '<th>Incident Case</th>' +
      '<th>Type</th>' +
      '<th>Geofence</th>' +
      '<th>Vehicle</th>' +
      '<th>Entry Time</th>' +
      '<th>Speed</th>' +
      '<th>Vehicles Passed</th>' +
      '<th>Status</th>' +
      '</tr></thead><tbody>';

    if (!rows.length) {
      html += '<tr><td colspan="9" class="service-history-empty">No incident cases match your search.</td></tr>';
    } else {
      rows.forEach(function (row) {
        html += '<tr class="' + (row.id === selectedId ? 'is-selected' : '') + '" data-accident-id="' + esc(row.id) + '">' +
          '<td><span class="' + severityClass(row.severity) + '">' + esc(row.severityLabel) + '</span></td>' +
          '<td><a href="#" class="table-cell-link" data-accident-select="' + esc(row.id) + '">' + esc(row.title) + '</a><div class="accident-table-sub">' + esc(row.reportedAt) + '</div></td>' +
          '<td>' + esc(row.caseType) + '</td>' +
          '<td>' + esc(row.geofenceName) + '</td>' +
          '<td><strong>' + esc(row.involvedVehicle) + '</strong><div class="accident-table-sub">' + esc(row.involvedVehicleName) + '</div></td>' +
          '<td class="tabular-nums">' + esc(row.entryTime) + '</td>' +
          '<td class="tabular-nums">' + esc(row.speedKph) + ' km/h</td>' +
          '<td class="tabular-nums">' + esc(row.vehiclesPassed) + '</td>' +
          '<td>' + statusPill(row.status) + '</td>' +
        '</tr>';
      });
    }

    html += '</tbody></table>';
    root.innerHTML = html;

    root.querySelectorAll('[data-accident-select], tbody tr[data-accident-id]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var id = el.getAttribute('data-accident-select') || el.getAttribute('data-accident-id');
        selectedId = id;
        renderSelected();
        renderTable();
      });
    });
  }

  function detailRow(label, value) {
    return '<div class="accident-detail-row"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong></div>';
  }

  function renderCaseStrip(row) {
    document.getElementById('incident-case-strip').innerHTML =
      '<div class="incident-case-card"><span>Case ID</span><strong>' + esc(row.id) + '</strong></div>' +
      '<div class="incident-case-card"><span>Case Type</span><strong>' + esc(row.caseType) + '</strong></div>' +
      '<div class="incident-case-card"><span>Priority</span><strong class="incident-priority">' + esc(row.priority) + '</strong></div>' +
      '<div class="incident-case-card"><span>Status</span><strong>' + esc(row.status) + '</strong></div>' +
      '<div class="incident-case-card"><span>Created On</span><strong>' + esc(row.reportedAt) + '</strong></div>';
  }

  function quickAction(label) {
    return '<button type="button" class="incident-action-btn"><span aria-hidden="true">▻</span>' + esc(label) + '</button>';
  }

  function renderQuickActions(row) {
    document.getElementById('incident-quick-actions').innerHTML = row.quickActions.map(quickAction).join('');
  }

  function renderTimeline(row) {
    document.getElementById('incident-timeline').innerHTML = row.timeline.map(function (item) {
      return '<div class="incident-timeline-row incident-timeline-row--' + esc(item.level) + '">' +
        '<span class="incident-timeline-dot"></span>' +
        '<strong>' + esc(item.time) + '</strong>' +
        '<span>' + esc(item.label) + '</span>' +
      '</div>';
    }).join('');
  }

  function renderVehicles(row) {
    var scene = data.scene;
    var involved = scene ? scene.vehicles.filter(function (vehicle) {
      return vehicle.plate === row.involvedVehicle || row.nearbyVehicles.some(function (nearby) { return nearby.plate === vehicle.plate; });
    }) : [];
    document.getElementById('incident-vehicles').innerHTML = involved.map(function (vehicle) {
      return '<div class="incident-mini-row">' +
        '<div><strong>' + esc(vehicle.plate) + '</strong><span>' + esc(vehicle.vehicleName) + ' · ' + esc(vehicle.driver) + '</span></div>' +
        '<em>' + esc(vehicle.speedKph) + ' km/h</em>' +
      '</div>';
    }).join('');
  }

  function renderEmergencyServices(row) {
    document.getElementById('incident-services').innerHTML = row.emergencyServices.map(function (service) {
      return '<div class="incident-mini-row">' +
        '<div><strong>' + esc(service.name) + '</strong><span>' + esc(service.type) + ' · ETA ' + esc(service.eta) + '</span></div>' +
        '<em>' + esc(service.status) + '</em>' +
      '</div>';
    }).join('');
  }

  function renderNearbyVehicles(row) {
    document.getElementById('incident-nearby').innerHTML = row.nearbyVehicles.map(function (vehicle) {
      return '<div class="incident-mini-row">' +
        '<div><strong>' + esc(vehicle.plate) + '</strong><span>' + esc(vehicle.vehicleName) + ' · ' + esc(vehicle.role) + '</span></div>' +
        '<em>' + esc(vehicle.distance) + '</em>' +
      '</div>';
    }).join('');
  }

  function renderSelected() {
    var row = data.getById(selectedId);
    renderCaseStrip(row);
    renderQuickActions(row);
    renderTimeline(row);
    renderVehicles(row);
    renderEmergencyServices(row);
    renderNearbyVehicles(row);
    document.getElementById('accident-map-title').textContent = row.geofenceName + ' Incident Zone';
    document.getElementById('accident-map-subtitle').textContent = row.title + ' · ' + row.reportedAt;
    document.getElementById('accident-detail-panel').innerHTML =
      '<div class="panel__header"><div><h2 class="panel__title">Incident Details</h2><p class="accident-panel-subtitle">' + esc(row.title) + '</p></div><span class="' + severityClass(row.severity) + '">' + esc(row.severityLabel) + '</span></div>' +
      '<div class="accident-detail-body">' +
        detailRow('Location', row.location) +
        detailRow('Date & Time', row.sceneDate + ' ' + row.sceneTime) +
        detailRow('Vehicles Involved', row.vehiclesInvolved) +
        detailRow('Moving Vehicles Nearby', row.movingNearby) +
        detailRow('Witness Vehicles', row.witnessVehicles) +
        detailRow('CCTV Available', row.cctvAvailable) +
        detailRow('Breakdown / Incident', row.breakdown) +
        detailRow('Status', row.status) +
        detailRow('Vehicle', row.involvedVehicle + ' · ' + row.involvedVehicleName) +
        detailRow('Route', row.route) +
        detailRow('Entry Time', row.entryTime) +
        detailRow('Exit / Duration', row.exitTime + ' · ' + row.duration) +
        detailRow('Speed', row.speedKph + ' km/h') +
        detailRow('Vehicles passed area', row.vehiclesPassed) +
        detailRow('Average / Max Speed', row.averageSpeedKph + ' / ' + row.maxSpeedKph + ' km/h') +
        detailRow('Evidence', row.evidence) +
        '<div class="accident-response-note">' + esc(row.responseStatus) + '</div>' +
        '<a class="btn btn-outline btn-sm accident-history-link" href="historical-time-machine-view.html?id=' + encodeURIComponent(row.historicalSceneId) + '">Open Historical Replay</a>' +
      '</div>';
    renderMap(row);
  }

  function markerIcon(vehicle, active) {
    return L.divIcon({
      className: 'htm-map-marker ' + (active ? 'is-accident' : 'is-moving'),
      html: '<span>' + esc(vehicle.plate.slice(-2)) + '</span>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  }

  function renderMap(accident) {
    var scene = data.scene;
    var el = document.getElementById('accident-map');
    if (!scene || !el || typeof L === 'undefined') return;

    if (!map) {
      map = L.map(el, {
        center: [scene.center.lat, scene.center.lng],
        zoom: 13,
        scrollWheelZoom: false
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
        attribution: '&copy; OSM &copy; CARTO'
      }).addTo(map);
    }

    if (circleLayer) circleLayer.remove();
    if (routeLayer) routeLayer.remove();

    circleLayer = L.circle([scene.center.lat, scene.center.lng], {
      radius: scene.radiusM,
      color: '#dc2626',
      weight: 2,
      fillColor: '#dc2626',
      fillOpacity: 0.12
    }).addTo(map);

    routeLayer = L.layerGroup(scene.vehicles.reduce(function (layers, vehicle) {
      var active = vehicle.plate === accident.involvedVehicle;
      layers.push(L.polyline([[scene.center.lat, scene.center.lng], [vehicle.lat, vehicle.lng]], {
        color: active ? '#dc2626' : '#0052ff',
        weight: active ? 4 : 2,
        opacity: active ? 0.85 : 0.42,
        dashArray: active ? '' : '5 6'
      }));
      layers.push(L.marker([vehicle.lat, vehicle.lng], { icon: markerIcon(vehicle, active) })
        .bindPopup('<strong>' + esc(vehicle.vehicleName) + '</strong><br>' +
          esc(vehicle.plate) + '<br>' +
          esc(vehicle.route) + '<br>' +
          esc(vehicle.entryTime) + ' - ' + esc(vehicle.exitTime) + '<br>' +
          esc(vehicle.speedKph) + ' km/h'));
      return layers;
    }, [])).addTo(map);

    map.fitBounds(circleLayer.getBounds(), { padding: [28, 28], maxZoom: 14 });
    setTimeout(function () { map.invalidateSize(); }, 80);
  }

  function bindSearch() {
    var input = document.getElementById('accident-search');
    if (!input) return;
    input.addEventListener('input', function () {
      search = input.value;
      renderTable();
    });
  }

  function init() {
    if (!data) return;
    renderKpis();
    renderSelected();
    renderTable();
    bindSearch();
    if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(document);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
