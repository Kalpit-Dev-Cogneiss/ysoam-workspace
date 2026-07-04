(function () {
  'use strict';

  var data = window.YSOAM_HISTORICAL_TIME_MACHINE;
  var icons = window.YSOAM_ICONS;
  var map = null;

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getSceneId() {
    return new URLSearchParams(window.location.search).get('id') || 'HTM-DUMKA-001';
  }

  function getCreatedScene() {
    try {
      var raw = sessionStorage.getItem('YSOAM_HTM_CREATED_SCENE');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function statusClass(status) {
    return String(status || '').toLowerCase() === 'moving' ? 'is-moving' : 'is-stopped';
  }

  function statusPill(status) {
    return '<span class="htm-status ' + statusClass(status) + '">' + esc(status) + '</span>';
  }

  function metric(label, value) {
    return '<div class="htm-view-metric"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong></div>';
  }

  function field(label, value) {
    return '<div class="vd-field-row"><span class="vd-field-label">' + esc(label) + '</span><span class="vd-field-val">' + esc(value) + '</span></div>';
  }

  function renderHero(scene) {
    var radiusKm = (scene.radiusM / 1000).toFixed(scene.radiusM % 1000 ? 1 : 0);
    return '<span class="vd-hero__thumb htm-hero-thumb" aria-hidden="true">⏱</span>' +
      '<div class="vd-hero__info">' +
        '<h1 class="vd-hero__name">' + esc(scene.name) + '</h1>' +
        '<div class="cd-hero-meta">' +
          '<span class="cd-hero-meta__item"><span class="cd-hero-meta__key">Type</span> ' + esc(scene.type) + '</span>' +
          '<span class="cd-hero-meta__sep">·</span>' +
          '<span class="cd-hero-meta__item"><span class="cd-hero-meta__key">Scene Time</span> ' + esc(scene.date) + ' ' + esc(scene.timeLabel) + '</span>' +
          '<span class="cd-hero-meta__sep">·</span>' +
          '<span class="cd-hero-meta__item"><span class="cd-hero-meta__key">Radius</span> ' + radiusKm + ' km</span>' +
        '</div>' +
      '</div>' +
      '<div class="vd-hero__actions">' +
        '<a class="btn btn-primary btn-sm" href="accident-control.html">Incident Control</a>' +
        '<a class="btn btn-outline btn-sm" href="historical-time-machine.html">Edit Temporary Check</a>' +
      '</div>';
  }

  function renderDetails(scene) {
    return '<section class="cd-section htm-view-details">' +
      '<div class="cd-section__head"><span class="cd-section__title">Temporary Geofence Details</span></div>' +
      '<div class="cd-group__body">' +
        field('Geofence Name', scene.name) +
        field('Address / Location', scene.address) +
        field('Date', scene.date) +
        field('Time', scene.timeLabel) +
        field('Replay Window', '07:30 PM – 08:30 PM') +
        field('Radius', (scene.radiusM / 1000) + ' km') +
        field('Created By', scene.createdBy) +
      '</div>' +
    '</section>';
  }

  function renderSummary(scene) {
    var summary = scene.summary;
    return '<section class="htm-view-metrics">' +
      metric('Vehicles in Geofence', summary.vehiclesInArea) +
      metric('Moving Vehicles', summary.moving) +
      metric('Stopped Vehicles', summary.stopped) +
      metric('Entries', summary.entries) +
      metric('Exits', summary.exits) +
      metric('Average Speed', summary.averageSpeedKph + ' km/h') +
      metric('Longest Stay', summary.maxDwell) +
      metric('Alerts', summary.alerts) +
    '</section>';
  }

  function renderMap() {
    return '<section class="cd-section htm-view-map-section htm-view-route-section">' +
      '<div class="cd-section__head">' +
        '<span class="cd-section__title">Geofence & Vehicle Routes</span>' +
        '<span class="htm-route-note">Created geofence with all vehicle routes inside the selected time window</span>' +
      '</div>' +
      '<div id="htm-view-map" class="htm-view-map"></div>' +
    '</section>';
  }

  function renderTimeline(scene) {
    return '<section class="cd-section htm-timeline-section">' +
      '<div class="cd-section__head"><span class="cd-section__title">Scene Timeline</span></div>' +
      '<div class="htm-timeline">' +
        scene.timeline.map(function (item) {
          return '<div class="htm-timeline-item">' +
            '<span class="htm-timeline-dot"></span>' +
            '<div><strong>' + esc(item.time) + '</strong><p>' + esc(item.label) + '</p></div>' +
            '<em>' + esc(item.count) + ' vehicles</em>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</section>';
  }

  function renderVehicleRows(scene) {
    return scene.vehicles.map(function (vehicle) {
      return '<tr>' +
        '<td><strong>' + esc(vehicle.vehicleName) + '</strong></td>' +
        '<td>' + esc(vehicle.plate) + '</td>' +
        '<td>' + esc(vehicle.driver) + '</td>' +
        '<td>' + esc(vehicle.route) + '</td>' +
        '<td>' + esc(vehicle.firstSeen) + '</td>' +
        '<td>' + esc(vehicle.entryTime) + '</td>' +
        '<td>' + esc(vehicle.exitTime) + '</td>' +
        '<td>' + esc(vehicle.lastSeen) + '</td>' +
        '<td>' + esc(vehicle.speedKph) + ' km/h</td>' +
        '<td>' + esc(vehicle.dwell) + '</td>' +
        '<td>' + esc(vehicle.distanceInsideKm) + ' km</td>' +
        '<td>' + statusPill(vehicle.status) + '</td>' +
      '</tr>';
    }).join('');
  }

  function renderVehicleTable(scene) {
    return '<section class="panel table-panel htm-view-table-panel">' +
      '<div class="trip-ops-toolbar htm-table-toolbar">' +
        '<div class="trip-ops-toolbar__left">' +
          '<div class="table-panel__search">' +
            '<span class="table-panel__search-icon" aria-hidden="true">⌕</span>' +
            '<input type="search" class="table-panel__search-input" placeholder="Search vehicle visits" aria-label="Search vehicle visits">' +
          '</div>' +
          '<button type="button" class="expense-filter-pill" disabled>Vehicle</button>' +
          '<button type="button" class="expense-filter-pill" disabled>Route</button>' +
          '<button type="button" class="expense-filter-pill" disabled>Time</button>' +
        '</div>' +
        '<div class="trip-ops-toolbar__right">' +
          '<span class="trip-ops-pagination__count tabular-nums">1 – ' + esc(scene.vehicles.length) + ' of ' + esc(scene.vehicles.length) + '</span>' +
          '<button type="button" class="trip-ops-page-btn" disabled aria-label="Previous page">‹</button>' +
          '<button type="button" class="trip-ops-page-btn" disabled aria-label="Next page">›</button>' +
          '<button type="button" class="trip-ops-page-btn" aria-label="Table settings">⚙</button>' +
        '</div>' +
      '</div>' +
      '<div class="data-table-wrap data-table-wrap--scroll">' +
        '<table class="data-table data-table--list htm-table">' +
          '<thead><tr>' +
            '<th>Vehicle Name</th><th>Vehicle No.</th><th>Driver</th><th>Route</th><th>Pass Time</th><th>Entry Time</th><th>Exit Time</th><th>Last Seen</th><th>Speed</th><th>Duration</th><th>Distance Inside</th><th>Status</th>' +
          '</tr></thead>' +
          '<tbody>' + renderVehicleRows(scene) + '</tbody>' +
        '</table>' +
      '</div>' +
    '</section>';
  }

  function markerIcon(vehicle) {
    return L.divIcon({
      className: 'htm-map-marker ' + statusClass(vehicle.status),
      html: '<span>' + esc(vehicle.plate.slice(-2)) + '</span>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  }

  function initMap(scene) {
    var el = document.getElementById('htm-view-map');
    if (!el || typeof L === 'undefined') return;
    if (map) map.remove();

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

    var circle = L.circle([scene.center.lat, scene.center.lng], {
      radius: scene.radiusM,
      color: '#0052ff',
      weight: 2,
      fillColor: '#22c55e',
      fillOpacity: 0.17
    }).addTo(map);

    scene.vehicles.forEach(function (vehicle) {
      L.polyline([[scene.center.lat, scene.center.lng], [vehicle.lat, vehicle.lng]], {
        color: String(vehicle.status).toLowerCase() === 'moving' ? '#0052ff' : '#94a3b8',
        weight: 2,
        opacity: 0.55,
        dashArray: '5 6'
      }).addTo(map);
      L.marker([vehicle.lat, vehicle.lng], { icon: markerIcon(vehicle) })
        .bindPopup('<strong>' + esc(vehicle.vehicleName) + '</strong><br>' +
          esc(vehicle.plate) + '<br>' +
          esc(vehicle.route) + '<br>' +
          esc(vehicle.entryTime) + ' - ' + esc(vehicle.exitTime) + '<br>' +
          esc(vehicle.dwell))
        .addTo(map);
    });

    map.fitBounds(circle.getBounds(), { padding: [28, 28], maxZoom: 14 });
    setTimeout(function () { map.invalidateSize(); }, 100);
  }

  function render(scene) {
    document.getElementById('htm-view-hero').innerHTML = renderHero(scene);
    document.getElementById('htm-view-body').innerHTML =
      renderMap() +
      renderVehicleTable(scene);

    document.title = scene.name + ' — Historical Scene — YSOAM';
    if (icons) {
      document.querySelectorAll('[data-form-icon]').forEach(function (el) {
        var key = el.getAttribute('data-form-icon');
        if (icons[key]) el.innerHTML = icons[key];
      });
    }
    initMap(scene);
  }

  function init() {
    if (document.body.getAttribute('data-subpage') !== 'historical-time-machine-view') return;
    if (!data) return;
    render(getCreatedScene() || data.getScene(getSceneId()));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
