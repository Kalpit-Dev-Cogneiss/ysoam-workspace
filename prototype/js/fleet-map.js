(function () {
  var fleet = window.YSOAM_FLEET;
  if (!fleet || typeof L === 'undefined') return;

  var maps = {};

  var TILES = {
    street: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      options: {
        subdomains: 'abcd',
        maxZoom: 19,
        attribution: '&copy; OSM &copy; CARTO'
      }
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      options: {
        maxZoom: 19,
        attribution: '&copy; Esri'
      }
    },
    labels: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
      options: {
        subdomains: 'abcd',
        maxZoom: 19,
        pane: 'overlayPane'
      }
    }
  };

  var POPUP_OPTIONS = {
    className: 'vehicle-telemetry-popup',
    maxWidth: 300,
    offset: [0, -28],
    autoPan: true,
    closeButton: true
  };

  function statusColor(status) {
    return fleet.statusColors[status] || '#64748B';
  }

  function findVehicle(id) {
    return fleet.vehicles.find(function (v) { return v.id === id; });
  }

  function formatCoords(vehicle) {
    return vehicle.lat.toFixed(4) + ', ' + vehicle.lng.toFixed(4);
  }

  function renderTelemetryPopup(vehicle) {
    var color = statusColor(vehicle.status);
    var statusText = fleet.statusLabels[vehicle.status] || vehicle.status;
    var ignitionOn = vehicle.ignition === true;
    var ignitionClass = ignitionOn ? 'telemetry-ignition--on' : 'telemetry-ignition--off';
    var ignitionText = ignitionOn ? 'On' : 'Off';
    var signalClass = vehicle.signal === 'No Signal' ? 'telemetry-signal--bad' : 'telemetry-signal--ok';

    return (
      '<div class="vehicle-telemetry vehicle-telemetry--popup">' +
        '<div class="vehicle-telemetry__header">' +
          '<div class="vehicle-telemetry__plate">' + vehicle.id + '</div>' +
          '<span class="badge" style="background:' + color + '22;color:' + color + '">' + statusText + '</span>' +
        '</div>' +
        '<div class="vehicle-telemetry__grid">' +
          '<div class="telemetry-item"><span class="telemetry-item__label">Speed</span><span class="telemetry-item__value tabular-nums">' + vehicle.speed + ' km/h</span></div>' +
          '<div class="telemetry-item"><span class="telemetry-item__label">Coordinates</span><span class="telemetry-item__value tabular-nums">' + formatCoords(vehicle) + '</span></div>' +
          '<div class="telemetry-item"><span class="telemetry-item__label">Altitude</span><span class="telemetry-item__value tabular-nums">' + vehicle.altitude + ' m</span></div>' +
          '<div class="telemetry-item"><span class="telemetry-item__label">Battery</span><span class="telemetry-item__value tabular-nums">' + vehicle.battery + '%</span></div>' +
          '<div class="telemetry-item"><span class="telemetry-item__label">Heading</span><span class="telemetry-item__value">' + vehicle.headingLabel + ' (' + vehicle.heading + '°)</span></div>' +
          '<div class="telemetry-item"><span class="telemetry-item__label">Ignition</span><span class="telemetry-item__value ' + ignitionClass + '">' + ignitionText + '</span></div>' +
          '<div class="telemetry-item"><span class="telemetry-item__label">Updated</span><span class="telemetry-item__value">' + vehicle.updatedAt + '</span></div>' +
          '<div class="telemetry-item"><span class="telemetry-item__label">Signal</span><span class="telemetry-item__value ' + signalClass + '">' + vehicle.signal + '</span></div>' +
        '</div>' +
      '</div>'
    );
  }

  function iconAspectRatio() {
    var icons = window.YSOAM_VEHICLE_ICON;
    return icons && icons.aspectRatio ? icons.aspectRatio : 74 / 36;
  }

  function markerDimensions(selected, showLabel) {
    var iconW = selected ? 30 : 26;
    var iconH = Math.round(iconW * iconAspectRatio());
    var hoverPad = showLabel ? 32 : 0;

    return { iconW: iconW, iconH: iconH, wrapW: iconW, wrapH: iconH + hoverPad };
  }

  function vehicleIconHtml(vehicle, selected, size) {
    var icons = window.YSOAM_VEHICLE_ICON;
    if (!icons || !icons.topView) return '';

    return icons.topView(statusColor(vehicle.status), {
      size: size || (selected ? 30 : 26),
      heading: vehicle.heading || 0,
      selected: selected
    });
  }

  function createMarkerIcon(vehicle, selected, showLabel) {
    var color = statusColor(vehicle.status);
    var shortId = vehicle.shortId || vehicle.id;
    var statusText = fleet.statusLabels[vehicle.status] || vehicle.status;
    var dims = markerDimensions(selected, showLabel);
    var iconHtml = vehicleIconHtml(vehicle, selected, dims.iconW);

    if (showLabel) {
      return L.divIcon({
        className: 'vehicle-marker-wrap' + (selected ? ' vehicle-marker-wrap--selected' : ''),
        html:
          '<div class="vehicle-marker">' +
            '<div class="vehicle-marker__icon-slot" style="height:' + dims.iconH + 'px">' +
              iconHtml +
              '<div class="vehicle-marker__card">' +
                '<span class="vehicle-marker__reg">' + shortId + '</span>' +
                '<span class="vehicle-marker__status" style="color:' + color + '">' + statusText + '</span>' +
              '</div>' +
            '</div>' +
          '</div>',
        iconSize: [dims.wrapW, dims.wrapH],
        iconAnchor: [dims.wrapW / 2, dims.iconH / 2]
      });
    }

    return L.divIcon({
      className: 'vehicle-marker-wrap',
      html:
        '<div class="vehicle-marker vehicle-marker--icon-only">' +
          '<div class="vehicle-marker__icon-slot" style="height:' + dims.iconH + 'px">' +
            iconHtml +
          '</div>' +
        '</div>',
      iconSize: [dims.wrapW, dims.wrapH],
      iconAnchor: [dims.wrapW / 2, dims.iconH / 2]
    });
  }

  function attachMarker(marker, vehicle, options) {
    marker.vehicleId = vehicle.id;
    marker.bindPopup(renderTelemetryPopup(vehicle), POPUP_OPTIONS);
    marker.on('click', function () {
      if (options.onSelect) options.onSelect(vehicle.id);
    });
  }

  function updateMarkerAppearance(marker, vehicle, selected, showLabels) {
    marker.setIcon(createMarkerIcon(vehicle, selected, showLabels));
    marker.setZIndexOffset(selected ? 1000 : 0);
    marker.setPopupContent(renderTelemetryPopup(vehicle));
  }

  function addVehicleMarkers(map, markersLayer, options) {
    options = options || {};
    var markerById = {};
    markersLayer.clearLayers();

    var vehicles = fleet.vehicles;
    if (options.vehicleId) {
      vehicles = fleet.vehicles.filter(function (v) { return v.id === options.vehicleId; });
    }

    vehicles.forEach(function (vehicle) {
      var selected = options.selectedId === vehicle.id;
      var marker = L.marker([vehicle.lat, vehicle.lng], {
        icon: createMarkerIcon(vehicle, selected, options.showLabels),
        zIndexOffset: selected ? 1000 : 0
      });

      attachMarker(marker, vehicle, options);
      markersLayer.addLayer(marker);
      markerById[vehicle.id] = marker;
    });

    return markerById;
  }

  function refreshMarkerSelection(entry, vehicleId) {
    fleet.vehicles.forEach(function (vehicle) {
      var marker = entry.markerById[vehicle.id];
      if (!marker) return;
      updateMarkerAppearance(
        marker,
        vehicle,
        vehicle.id === vehicleId,
        entry.options.showLabels
      );
    });
  }

  function addTileLayers(map, mode) {
    var layers = { base: [], overlay: [] };

    if (mode === 'satellite') {
      layers.base.push(L.tileLayer(TILES.satellite.url, TILES.satellite.options).addTo(map));
      layers.overlay.push(L.tileLayer(TILES.labels.url, TILES.labels.options).addTo(map));
    } else {
      layers.base.push(L.tileLayer(TILES.street.url, TILES.street.options).addTo(map));
    }

    return layers;
  }

  function setMapMode(containerId, mode) {
    var entry = maps[containerId];
    if (!entry) return;

    entry.tileLayers.base.forEach(function (l) { entry.map.removeLayer(l); });
    entry.tileLayers.overlay.forEach(function (l) { entry.map.removeLayer(l); });
    entry.tileLayers = addTileLayers(entry.map, mode);
    entry.mode = mode;
  }

  function destroyMap(containerId) {
    var entry = maps[containerId];
    if (!entry) return;
    entry.map.remove();
    delete maps[containerId];
  }

  function initMap(containerId, options) {
    var el = document.getElementById(containerId);
    if (!el) return null;
    if (maps[containerId]) destroyMap(containerId);

    options = options || {};
    var center = options.center || [18.85, 73.35];
    var zoom = options.zoom || 8;
    var mode = options.mapMode || 'satellite';

    var map = L.map(containerId, {
      zoomControl: options.zoomControl !== false,
      scrollWheelZoom: true,
      attributionControl: !options.hideAttribution
    }).setView(center, zoom);

    if (options.zoomControl !== false && options.zoomPosition) {
      map.zoomControl.setPosition(options.zoomPosition);
    }

    var tileLayers = addTileLayers(map, mode);
    var markersLayer = L.layerGroup().addTo(map);
    var markerById = addVehicleMarkers(map, markersLayer, options);
    var routeLayer = null;

    var routeCoords = options.route || fleet.route;

    if (options.showRoute) {
      routeLayer = L.polyline(routeCoords, {
        color: '#0052FF',
        weight: 4,
        opacity: 0.85
      }).addTo(map);
    }

    if (options.fitBounds) {
      var bounds = L.latLngBounds(routeCoords);
      if (!options.routeOnlyBounds) {
        fleet.vehicles.forEach(function (v) { bounds.extend([v.lat, v.lng]); });
      }
      map.fitBounds(bounds, { padding: options.fitPadding || [40, 40] });
    }

    maps[containerId] = {
      map: map,
      markers: markersLayer,
      markerById: markerById,
      route: routeLayer,
      tileLayers: tileLayers,
      mode: mode,
      onSelect: options.onSelect,
      options: options
    };

    setTimeout(function () { map.invalidateSize(); }, 150);
    return maps[containerId];
  }

  function openVehiclePopup(containerId, vehicleId) {
    var entry = maps[containerId];
    if (!entry) return;

    var marker = entry.markerById[vehicleId];
    if (marker) marker.openPopup();
  }

  function selectVehicle(containerId, vehicleId, openPopup) {
    var entry = maps[containerId];
    if (!entry) return;

    entry.options.selectedId = vehicleId;
    refreshMarkerSelection(entry, vehicleId);

    var vehicle = findVehicle(vehicleId);
    if (vehicle) {
      entry.map.setView([vehicle.lat, vehicle.lng], Math.max(entry.map.getZoom(), 10), { animate: true });
    }

    if (openPopup !== false) {
      openVehiclePopup(containerId, vehicleId);
    }

    if (containerId === 'map-dashboard') {
      document.querySelectorAll('[data-map-vehicle]').forEach(function (el) {
        el.classList.toggle('is-selected', el.getAttribute('data-map-vehicle') === vehicleId);
      });
    }
  }

  function bindMapModeToggle(containerId) {
    var mapEl = document.getElementById(containerId);
    if (!mapEl) return;
    var root = mapEl.closest('[data-map-root]') || document;
    root.querySelectorAll('[data-map-mode]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-map-mode');
        setMapMode(containerId, mode);
        root.querySelectorAll('[data-map-mode]').forEach(function (b) {
          b.classList.toggle('is-active', b.getAttribute('data-map-mode') === mode);
        });
      });
    });
  }

  function bindVehicleStrip(containerId) {
    document.querySelectorAll('[data-map-vehicle]').forEach(function (el) {
      el.addEventListener('click', function () {
        selectVehicle(containerId, el.getAttribute('data-map-vehicle'));
      });
    });
  }

  function makeOnSelect(containerId) {
    return function (id) {
      selectVehicle(containerId, id);
    };
  }

  window.YSOAM_MAP = {
    initDashboard: function () {
      initMap('map-dashboard', {
        zoom: 8,
        fitBounds: true,
        showRoute: true,
        showLabels: true,
        mapMode: 'satellite',
        onSelect: makeOnSelect('map-dashboard')
      });
      bindMapModeToggle('map-dashboard');
      bindVehicleStrip('map-dashboard');
    },
    initLiveTracking: function () {
      initMap('map-gps', {
        zoom: 9,
        fitBounds: true,
        showRoute: true,
        showLabels: true,
        mapMode: 'satellite',
        hideAttribution: false,
        zoomPosition: 'bottomright',
        fitPadding: [20, 20],
        onSelect: makeOnSelect('map-gps')
      });
      bindMapModeToggle('map-gps');
    },
    initTripPlayback: function (containerId, trip) {
      if (!trip) return;
      var tripsData = window.YSOAM_TRIPS;
      var route = trip.routePath || (tripsData && tripsData.routes[trip.routeKey]) || fleet.route;

      initMap(containerId, {
        zoom: 9,
        showRoute: true,
        route: route,
        routeOnlyBounds: true,
        showLabels: true,
        vehicleId: trip.vehicleId,
        mapMode: 'satellite',
        selectedId: trip.vehicleId,
        fitBounds: true,
        fitPadding: [28, 28],
        onSelect: null
      });
    },
    getMap: function (containerId) {
      return maps[containerId] || null;
    },
    selectVehicle: selectVehicle,
    setMapMode: setMapMode,
    destroyMap: destroyMap
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('map-dashboard')) window.YSOAM_MAP.initDashboard();
    if (document.getElementById('map-gps')) window.YSOAM_MAP.initLiveTracking();
  });
})();
