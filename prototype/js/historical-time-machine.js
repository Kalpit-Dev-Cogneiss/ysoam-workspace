(function () {
  'use strict';

  var data = window.YSOAM_HISTORICAL_TIME_MACHINE;
  var map = null;
  var circle = null;
  var markerLayer = null;

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function statusClass(status) {
    return String(status || '').toLowerCase() === 'moving' ? 'is-moving' : 'is-stopped';
  }

  function statusPill(status) {
    return '<span class="htm-status ' + statusClass(status) + '">' + esc(status) + '</span>';
  }

  function summaryRow(label, value) {
    return '<div class="htm-summary-row"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong></div>';
  }

  function summaryStat(label, value, meta) {
    return '<div class="trip-ops-stat htm-summary-stat">' +
      '<span class="trip-ops-stat__label">' + esc(label) + '</span>' +
      '<strong class="trip-ops-stat__value">' + esc(value) + '</strong>' +
      '<span class="htm-summary-stat__meta">' + esc(meta) + '</span>' +
    '</div>';
  }

  function renderSummary(scene) {
    var summary = scene.summary;
    var el = document.getElementById('htm-summary-list');
    var strip = document.getElementById('htm-summary-strip');

    if (strip) {
      strip.innerHTML = [
        summaryStat('Vehicle Visits', summary.vehiclesInArea, scene.radiusM + ' m geofence radius'),
        summaryStat('Moving', summary.moving, 'at ' + scene.timeLabel),
        summaryStat('Stopped', summary.stopped, 'inside created geofence'),
        summaryStat('Entry / Exit', summary.entries + ' / ' + summary.exits, 'selected time window')
      ].join('');
    }

    if (el) {
      el.innerHTML = [
        summaryRow('Vehicle visits', summary.vehiclesInArea),
        summaryRow('Moving', summary.moving),
        summaryRow('Stopped', summary.stopped),
        summaryRow('Average speed', summary.averageSpeedKph + ' km/h'),
        summaryRow('Entry count', summary.entries),
        summaryRow('Exit count', summary.exits),
        summaryRow('Longest duration', summary.maxDwell),
        summaryRow('Alerts', summary.alerts)
      ].join('');
    }
  }

  function renderRows(scene) {
    var el = document.getElementById('htm-vehicle-rows');
    if (!el) return;

    el.innerHTML = scene.vehicles.map(function (vehicle) {
      return '<tr>' +
        '<td><a class="table-cell-link" href="historical-time-machine-view.html?id=' + encodeURIComponent(scene.id) + '&vehicle=' + encodeURIComponent(vehicle.plate) + '">' + esc(vehicle.vehicleName) + '</a></td>' +
        '<td>' + esc(vehicle.plate) + '</td>' +
        '<td>' + esc(vehicle.driver) + '</td>' +
        '<td>' + esc(vehicle.route) + '</td>' +
        '<td>' + esc(vehicle.firstSeen) + '</td>' +
        '<td>' + esc(vehicle.entryTime) + '</td>' +
        '<td>' + esc(vehicle.exitTime) + '</td>' +
        '<td>' + esc(vehicle.speedKph) + ' km/h</td>' +
        '<td>' + esc(vehicle.dwell) + '</td>' +
        '<td>' + statusPill(vehicle.status) + '</td>' +
      '</tr>';
    }).join('');
  }

  function markerIcon(vehicle) {
    var moving = String(vehicle.status).toLowerCase() === 'moving';
    return L.divIcon({
      className: 'htm-map-marker ' + (moving ? 'is-moving' : 'is-stopped'),
      html: '<span>' + esc(vehicle.plate.slice(-2)) + '</span>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  }

  function vehicleLayers(scene) {
    return scene.vehicles.reduce(function (layers, vehicle) {
      layers.push(L.polyline([[scene.center.lat, scene.center.lng], [vehicle.lat, vehicle.lng]], {
        color: String(vehicle.status).toLowerCase() === 'moving' ? '#0052ff' : '#94a3b8',
        weight: 2,
        opacity: 0.55,
        dashArray: '5 6'
      }));
      layers.push(L.marker([vehicle.lat, vehicle.lng], { icon: markerIcon(vehicle) })
        .bindPopup('<strong>' + esc(vehicle.vehicleName) + '</strong><br>' +
          esc(vehicle.plate) + '<br>' +
          esc(vehicle.route) + '<br>' +
          esc(vehicle.entryTime) + ' - ' + esc(vehicle.exitTime)));
      return layers;
    }, []);
  }

  function initMap(scene, includeVehicles) {
    var el = document.getElementById('htm-map');
    if (!el || typeof L === 'undefined') return;

    if (!map) {
      map = L.map(el, {
        center: [scene.center.lat, scene.center.lng],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
        attribution: '&copy; OSM &copy; CARTO'
      }).addTo(map);
    }

    if (circle) circle.remove();
    if (markerLayer) markerLayer.remove();

    map.setView([scene.center.lat, scene.center.lng], 13);
    circle = L.circle([scene.center.lat, scene.center.lng], {
      radius: scene.radiusM,
      color: '#0052ff',
      weight: 2,
      fillColor: '#22c55e',
      fillOpacity: 0.17
    }).addTo(map);

    markerLayer = L.layerGroup(includeVehicles ? vehicleLayers(scene) : [
      L.marker([scene.center.lat, scene.center.lng])
    ]).addTo(map);

    map.fitBounds(circle.getBounds(), { padding: [26, 26], maxZoom: 14 });
    setTimeout(function () { map.invalidateSize(); }, 100);
  }

  function render(scene) {
    var title = document.getElementById('htm-scene-title');
    var subtitle = document.getElementById('htm-scene-subtitle');
    if (title) title.textContent = scene.name;
    if (subtitle) {
      subtitle.textContent = 'Vehicle visits on ' + scene.date + ' at ' + scene.timeLabel;
    }
    renderSummary(scene);
    renderRows(scene);
    initMap(scene, true);
  }

  function cloneScene(scene) {
    return JSON.parse(JSON.stringify(scene));
  }

  function timeLabel(value) {
    if (!value) return '08:00 PM';
    var parts = value.split(':');
    var hour = Number(parts[0] || 0);
    var minute = parts[1] || '00';
    var suffix = hour >= 12 ? 'PM' : 'AM';
    var displayHour = hour % 12 || 12;
    return String(displayHour).padStart(2, '0') + ':' + minute + ' ' + suffix;
  }

  function createdSceneFromForm(baseScene) {
    var scene = cloneScene(baseScene);
    var date = document.getElementById('htm-date');
    var time = document.getElementById('htm-time');
    var name = document.getElementById('htm-name');
    var address = document.getElementById('htm-address');
    var lat = document.getElementById('htm-lat');
    var lng = document.getElementById('htm-lng');
    var radius = document.getElementById('htm-radius');

    if (date && date.value) scene.date = date.value;
    if (time && time.value) {
      scene.time = time.value;
      scene.timeLabel = timeLabel(time.value);
    }
    if (name && name.value) {
      scene.id = 'HTM-TEMP-001';
      scene.name = name.value;
    }
    if (address && address.value) {
      scene.address = address.value;
    }
    if (lat && lng && lat.value && lng.value) {
      var parsedLat = parseFloat(lat.value);
      var parsedLng = parseFloat(lng.value);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        scene.center = { lat: parsedLat, lng: parsedLng };
      }
    }
    if (radius && radius.value) scene.radiusM = Number(radius.value);

    return scene;
  }

  function showResults() {
    var results = document.getElementById('htm-results-stack');

    if (results) results.hidden = false;
  }

  function saveCreatedScene(scene) {
    try {
      sessionStorage.setItem('YSOAM_HTM_CREATED_SCENE', JSON.stringify(scene));
    } catch (e) {
      /* ignore storage errors in prototype */
    }
  }

  function bindControls(scene) {
    var button = document.getElementById('htm-reconstruct');
    var form = document.getElementById('htm-geofence-form');
    var range = document.getElementById('htm-range');
    var replayTime = document.getElementById('htm-replay-time');

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var createdScene = createdSceneFromForm(scene);
        saveCreatedScene(createdScene);
        if (button) {
          button.textContent = 'Creating...';
          button.classList.add('is-complete');
        }
        window.location.href = 'historical-time-machine-view.html?id=' + encodeURIComponent(createdScene.id);
      });
    }

    if (range && replayTime) {
      range.addEventListener('input', function () {
        var minutes = Number(range.value || 0);
        var hour = minutes >= 30 ? 8 : 7;
        var displayMinute = minutes >= 30 ? minutes - 30 : minutes + 30;
        replayTime.textContent = String(hour).padStart(2, '0') + ':' + String(displayMinute).padStart(2, '0') + ' PM';
      });
    }
  }

  function initFormIcons() {
    if (!window.YSOAM_ICONS) return;
    document.querySelectorAll('[data-form-icon]').forEach(function (el) {
      var key = el.getAttribute('data-form-icon');
      if (window.YSOAM_ICONS[key]) el.innerHTML = window.YSOAM_ICONS[key];
    });
  }

  function init() {
    if (document.body.getAttribute('data-page') !== 'historical-time-machine') return;
    if (!data) return;

    var scene = data.getScene('HTM-DUMKA-001');
    initFormIcons();
    initMap(scene, false);
    bindControls(scene);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
