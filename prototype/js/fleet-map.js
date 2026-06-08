(function () {
  var fleet = window.YSOAM_FLEET;
  if (!fleet || typeof L === 'undefined') return;

  var maps = {};

  function statusColor(status) {
    return fleet.statusColors[status] || '#64748B';
  }

  function createMarkerIcon(status, selected) {
    var color = statusColor(status);
    var size = selected ? 16 : 12;
    var ring = selected ? '0 0 0 3px rgba(0,82,255,0.25)' : '0 2px 6px rgba(15,23,42,0.25)';
    return L.divIcon({
      className: 'fleet-marker-wrap',
      html: '<span class="fleet-marker" style="width:' + size + 'px;height:' + size + 'px;background:' + color + ';box-shadow:' + ring + '"></span>',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }

  function addVehicleMarkers(map, markersLayer, options) {
    options = options || {};
    markersLayer.clearLayers();
    fleet.vehicles.forEach(function (vehicle) {
      var marker = L.marker([vehicle.lat, vehicle.lng], {
        icon: createMarkerIcon(vehicle.status, options.selectedId === vehicle.id)
      });
      marker.vehicleId = vehicle.id;
      marker.bindPopup(
        '<div class="map-popup">' +
          '<strong>' + vehicle.id + '</strong><br>' +
          '<span>' + vehicle.label + '</span>' +
          (options.linkTrips ? '<br><a href="trips.html">View trip</a>' : '') +
        '</div>'
      );
      if (options.onSelect) {
        marker.on('click', function () {
          options.onSelect(vehicle.id);
        });
      }
      markersLayer.addLayer(marker);
    });
  }

  function initMap(containerId, options) {
    var el = document.getElementById(containerId);
    if (!el || maps[containerId]) return null;

    options = options || {};
    var center = options.center || [18.85, 73.35];
    var zoom = options.zoom || 8;

    var map = L.map(containerId, {
      zoomControl: !options.mini,
      scrollWheelZoom: !options.mini,
      attributionControl: true
    }).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var markersLayer = L.layerGroup().addTo(map);
    var routeLayer = null;

    if (options.showRoute) {
      routeLayer = L.polyline(fleet.route, {
        color: '#0052FF',
        weight: 4,
        opacity: 0.75,
        dashArray: options.routeDashed ? '8 6' : null
      }).addTo(map);
    }

    addVehicleMarkers(map, markersLayer, options);

    if (options.fitBounds) {
      var bounds = L.latLngBounds(fleet.route);
      fleet.vehicles.forEach(function (v) { bounds.extend([v.lat, v.lng]); });
      map.fitBounds(bounds, { padding: [24, 24] });
    }

    maps[containerId] = {
      map: map,
      markers: markersLayer,
      route: routeLayer,
      onSelect: options.onSelect
    };
    setTimeout(function () { map.invalidateSize(); }, 100);
    return maps[containerId];
  }

  function selectVehicle(containerId, vehicleId) {
    var entry = maps[containerId];
    if (!entry) return;
    addVehicleMarkers(entry.map, entry.markers, {
      selectedId: vehicleId,
      linkTrips: true,
      onSelect: entry.onSelect
    });
    var vehicle = fleet.vehicles.find(function (v) { return v.id === vehicleId; });
    if (vehicle) entry.map.panTo([vehicle.lat, vehicle.lng]);
  }

  window.YSOAM_MAP = {
    initDashboard: function () {
      initMap('map-dashboard', { mini: true, zoom: 7, fitBounds: true, showRoute: true });
    },
    initGps: function () {
      var onSelect = function (id) {
        document.querySelectorAll('[data-vehicle-id]').forEach(function (el) {
          el.classList.toggle('is-selected', el.getAttribute('data-vehicle-id') === id);
        });
        selectVehicle('map-gps', id);
      };

      initMap('map-gps', {
        zoom: 8,
        fitBounds: true,
        showRoute: true,
        selectedId: 'MH-12-AB-1234',
        linkTrips: true,
        onSelect: onSelect
      });

      document.querySelectorAll('[data-vehicle-id]').forEach(function (el) {
        el.addEventListener('click', function () {
          onSelect(el.getAttribute('data-vehicle-id'));
        });
      });
    },
    initPlayback: function () {
      initMap('map-playback', {
        zoom: 9,
        showRoute: true,
        routeDashed: false,
        selectedId: 'MH-12-AB-1234',
        fitBounds: true
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('map-dashboard')) window.YSOAM_MAP.initDashboard();
    if (document.getElementById('map-gps')) window.YSOAM_MAP.initGps();
    if (document.getElementById('map-playback')) window.YSOAM_MAP.initPlayback();

    document.querySelectorAll('[data-modal-open="playback-modal"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setTimeout(function () {
          if (maps['map-playback']) maps['map-playback'].map.invalidateSize();
          else window.YSOAM_MAP.initPlayback();
        }, 200);
      });
    });
  });
})();
