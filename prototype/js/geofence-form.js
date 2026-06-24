(function () {
  'use strict';

  var map = null;
  var markerLayer = null;
  var circleLayer = null;
  var polygonLayer = null;
  var previewLine = null;
  var previewPolygon = null;
  var activeTool = 'hand';
  var polygonPoints = [];
  var polygonVertices = [];
  var circleDraw = null;
  var geofenceShape = '';

  var DEFAULT_CENTER = { lat: 19.05040384323184, lng: 72.84595486370135, zoom: 13 };
  var CIRCLE_STYLE = { color: '#1a73e8', weight: 2, fillColor: '#1a73e8', fillOpacity: 0.18 };
  var POLYGON_STYLE = { color: '#1a73e8', weight: 2, fillColor: '#1a73e8', fillOpacity: 0.18 };
  var MIN_RADIUS = 50;

  function initLucide(root) {
    if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root);
  }

  function radiusInput() {
    return document.getElementById('geofence-radius');
  }

  function shapeInput() {
    return document.getElementById('geofence-shape');
  }

  function getRadiusM() {
    var raw = radiusInput().value.replace(/[^\d]/g, '');
    var val = parseInt(raw, 10);
    return isNaN(val) || val < MIN_RADIUS ? null : val;
  }

  function setGeofenceShape(shape) {
    geofenceShape = shape || '';
    shapeInput().value = geofenceShape;
    var isPolygon = geofenceShape === 'polygon';
    var radiusWrap = document.getElementById('geofence-radius-wrap');
    var radiusRequired = document.getElementById('geofence-radius-required');
    var radiusHint = document.getElementById('geofence-radius-hint');
    var polygonNote = document.getElementById('geofence-polygon-note');
    if (radiusWrap) radiusWrap.classList.toggle('is-polygon-mode', isPolygon);
    if (radiusRequired) radiusRequired.hidden = isPolygon;
    if (radiusHint) radiusHint.hidden = isPolygon;
    if (polygonNote) polygonNote.hidden = !isPolygon;
    if (isPolygon) {
      radiusInput().removeAttribute('required');
      radiusInput().setCustomValidity('');
    } else {
      radiusInput().setAttribute('required', '');
    }
  }

  function setRadiusM(meters, closeMenu, fitMap) {
    radiusInput().value = String(meters);
    highlightRadiusOption(meters);
    setGeofenceShape('circle');
    applyCircle(fitMap !== false);
    if (closeMenu !== false) closeRadiusMenu();
  }

  function getLatLng() {
    var lat = parseFloat(document.getElementById('geofence-lat').value);
    var lng = parseFloat(document.getElementById('geofence-lng').value);
    if (isNaN(lat) || isNaN(lng)) return L.latLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
    return L.latLng(lat, lng);
  }

  function setLatLngFields(latlng) {
    document.getElementById('geofence-lat').value = String(latlng.lat);
    document.getElementById('geofence-lng').value = String(latlng.lng);
  }

  function clearCircle() {
    if (circleLayer) {
      map.removeLayer(circleLayer);
      circleLayer = null;
    }
  }

  function clearPolygonPreview() {
    if (previewLine) {
      map.removeLayer(previewLine);
      previewLine = null;
    }
    if (previewPolygon) {
      map.removeLayer(previewPolygon);
      previewPolygon = null;
    }
  }

  function clearPolygonInProgress() {
    polygonPoints = [];
    polygonVertices.forEach(function (m) { map.removeLayer(m); });
    polygonVertices = [];
    clearPolygonPreview();
  }

  function clearPolygon() {
    clearPolygonInProgress();
    if (polygonLayer) {
      map.removeLayer(polygonLayer);
      polygonLayer = null;
    }
  }

  function clearMarker() {
    if (markerLayer) {
      map.removeLayer(markerLayer);
      markerLayer = null;
    }
  }

  function placeMarker(latlng) {
    clearMarker();
    markerLayer = L.marker(latlng).addTo(map);
  }

  function buildCircle(latlng, radiusM) {
    return L.circle(latlng, {
      radius: radiusM,
      color: CIRCLE_STYLE.color,
      weight: CIRCLE_STYLE.weight,
      fillColor: CIRCLE_STYLE.fillColor,
      fillOpacity: CIRCLE_STYLE.fillOpacity
    });
  }

  function applyCircle(fitMap) {
    if (geofenceShape === 'polygon') return;
    var latlng = getLatLng();
    var radiusM = getRadiusM();
    placeMarker(latlng);
    if (!radiusM) {
      clearCircle();
      return;
    }
    if (circleLayer) {
      circleLayer.setLatLng(latlng);
      circleLayer.setRadius(radiusM);
    } else {
      clearCircle();
      circleLayer = buildCircle(latlng, radiusM).addTo(map);
    }
    if (fitMap && circleLayer) {
      map.fitBounds(circleLayer.getBounds(), { padding: [48, 48], maxZoom: 15 });
    }
  }

  function syncCircle(fitBounds) {
    if (geofenceShape === 'polygon') return;
    clearPolygon();
    setGeofenceShape('circle');
    applyCircle(fitBounds);
  }

  function updateCircleRadius(fitBounds) {
    if (geofenceShape === 'polygon') return;
    setGeofenceShape('circle');
    applyCircle(fitBounds);
  }

  function refreshPolygonPreview(cursorLatLng) {
    clearPolygonPreview();
    if (!polygonPoints.length) return;
    var pts = polygonPoints.slice();
    if (cursorLatLng) pts.push(cursorLatLng);
    if (pts.length >= 2) {
      previewLine = L.polyline(pts, {
        color: CIRCLE_STYLE.color,
        weight: 2,
        dashArray: '6 6',
        opacity: 0.9
      }).addTo(map);
    }
    if (pts.length >= 3) {
      previewPolygon = L.polygon(pts, {
        color: CIRCLE_STYLE.color,
        weight: 2,
        fillColor: CIRCLE_STYLE.fillColor,
        fillOpacity: 0.1,
        dashArray: '4 4'
      }).addTo(map);
    }
  }

  function finishPolygon() {
    if (polygonPoints.length < 3) return;
    clearPolygonPreview();
    clearCircle();
    radiusInput().value = '';
    highlightRadiusOption(null);

    if (polygonLayer) map.removeLayer(polygonLayer);
    polygonLayer = L.polygon(polygonPoints, POLYGON_STYLE).addTo(map);

    var bounds = polygonLayer.getBounds();
    setLatLngFields(bounds.getCenter());
    placeMarker(bounds.getCenter());
    setGeofenceShape('polygon');
    map.fitBounds(bounds, { padding: [40, 40] });

    polygonPoints = [];
    polygonVertices.forEach(function (m) { map.removeLayer(m); });
    polygonVertices = [];
    setTool('hand');
  }

  function addPolygonPoint(latlng) {
    polygonPoints.push(latlng);
    var vertex = L.circleMarker(latlng, {
      radius: 6,
      color: '#fff',
      weight: 2,
      fillColor: CIRCLE_STYLE.color,
      fillOpacity: 1
    }).addTo(map);
    polygonVertices.push(vertex);
    refreshPolygonPreview();
  }

  function onMapClick(e) {
    if (activeTool === 'hand') {
      if (geofenceShape === 'polygon') return;
      setLatLngFields(e.latlng);
      syncCircle(!!getRadiusM());
      if (!getRadiusM()) map.panTo(e.latlng);
      return;
    }
    if (activeTool === 'polygon') {
      L.DomEvent.stopPropagation(e);
      var pts = polygonPoints;
      if (pts.length >= 3) {
        var first = pts[0];
        if (map.distance(e.latlng, first) < 50) {
          finishPolygon();
          return;
        }
      }
      if (pts.length === 0) {
        clearCircle();
        clearPolygon();
        setGeofenceShape('polygon');
        radiusInput().value = '';
      }
      addPolygonPoint(e.latlng);
    }
  }

  function onMapDblClick(e) {
    if (activeTool === 'polygon') {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      finishPolygon();
    }
  }

  function onPolygonMouseMove(e) {
    if (activeTool !== 'polygon' || !polygonPoints.length) return;
    refreshPolygonPreview(e.latlng);
  }

  function updateCircleFromDrag(center, edgeLatLng) {
    var radiusM = Math.max(MIN_RADIUS, Math.round(map.distance(center, edgeLatLng)));
    radiusInput().value = String(radiusM);
    highlightRadiusOption(radiusM);
    setGeofenceShape('circle');
    setLatLngFields(center);
    placeMarker(center);
    if (circleLayer) {
      circleLayer.setLatLng(center);
      circleLayer.setRadius(radiusM);
    } else {
      clearCircle();
      circleLayer = buildCircle(center, radiusM).addTo(map);
    }
  }

  function onCircleMouseMove(e) {
    if (!circleDraw) return;
    circleDraw.dragged = true;
    updateCircleFromDrag(circleDraw.center, e.latlng);
  }

  function endCircleDraw() {
    if (!circleDraw) return;
    map.off('mousemove', onCircleMouseMove);
    document.removeEventListener('mouseup', onCircleMouseUp);
    map.dragging.enable();
    map.doubleClickZoom.enable();
    if (!circleDraw.dragged) {
      radiusInput().value = String(MIN_RADIUS);
      highlightRadiusOption(MIN_RADIUS);
      setGeofenceShape('circle');
      if (circleLayer) circleLayer.setRadius(MIN_RADIUS);
    } else {
      setGeofenceShape('circle');
    }
    closeRadiusMenu();
    circleDraw = null;
  }

  function onCircleMouseUp() {
    endCircleDraw();
  }

  function onCircleMouseDown(e) {
    if (activeTool !== 'circle') return;
    if (e.originalEvent.button !== 0) return;
    L.DomEvent.stopPropagation(e);
    L.DomEvent.preventDefault(e);

    endCircleDraw();
    clearPolygon();
    setGeofenceShape('circle');

    var center = e.latlng;
    circleDraw = { center: center, dragged: false };
    map.dragging.disable();
    map.doubleClickZoom.disable();

    setLatLngFields(center);
    placeMarker(center);
    clearCircle();
    circleLayer = buildCircle(center, MIN_RADIUS).addTo(map);
    radiusInput().value = String(MIN_RADIUS);

    map.on('mousemove', onCircleMouseMove);
    document.addEventListener('mouseup', onCircleMouseUp);
  }

  function bindCircleDraw(enable) {
    map.off('mousedown', onCircleMouseDown);
    if (enable) {
      map.on('mousedown', onCircleMouseDown);
    } else {
      endCircleDraw();
    }
  }

  function bindPolygonDraw(enable) {
    map.off('mousemove', onPolygonMouseMove);
    if (enable) {
      map.on('mousemove', onPolygonMouseMove);
      map.doubleClickZoom.disable();
    } else {
      clearPolygonPreview();
      if (activeTool !== 'circle') map.doubleClickZoom.enable();
    }
  }

  function detachMapHandlers() {
    map.off('click', onMapClick);
    map.off('dblclick', onMapDblClick);
  }

  function attachMapHandlers() {
    detachMapHandlers();
    if (activeTool === 'hand' || activeTool === 'polygon') {
      map.on('click', onMapClick);
      if (activeTool === 'polygon') map.on('dblclick', onMapDblClick);
    }
  }

  function setTool(tool) {
    activeTool = tool;
    document.querySelectorAll('[data-map-tool]').forEach(function (btn) {
      var on = btn.getAttribute('data-map-tool') === tool;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var polygonHint = document.getElementById('geofence-polygon-hint');
    var circleHint = document.getElementById('geofence-circle-hint');
    if (polygonHint) polygonHint.hidden = tool !== 'polygon';
    if (circleHint) circleHint.hidden = tool !== 'circle';

    bindCircleDraw(false);
    bindPolygonDraw(false);

    if (tool === 'hand') {
      map.dragging.enable();
      map.getContainer().style.cursor = '';
      clearPolygonInProgress();
      map.doubleClickZoom.enable();
    } else if (tool === 'circle') {
      map.dragging.enable();
      map.getContainer().style.cursor = 'crosshair';
      clearPolygonInProgress();
      bindCircleDraw(true);
    } else if (tool === 'polygon') {
      map.dragging.enable();
      map.getContainer().style.cursor = 'crosshair';
      clearPolygonInProgress();
      bindPolygonDraw(true);
    }
    attachMapHandlers();
  }

  function openRadiusMenu() {
    if (geofenceShape === 'polygon') return;
    var menu = document.getElementById('geofence-radius-menu');
    var input = radiusInput();
    var toggle = document.getElementById('geofence-radius-toggle');
    menu.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-expanded', 'true');
    document.getElementById('geofence-radius-field').classList.add('is-open');
  }

  function closeRadiusMenu() {
    var menu = document.getElementById('geofence-radius-menu');
    var input = radiusInput();
    var toggle = document.getElementById('geofence-radius-toggle');
    menu.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-expanded', 'false');
    document.getElementById('geofence-radius-field').classList.remove('is-open');
  }

  function toggleRadiusMenu() {
    if (geofenceShape === 'polygon') return;
    var menu = document.getElementById('geofence-radius-menu');
    if (menu.hidden) openRadiusMenu();
    else closeRadiusMenu();
  }

  function highlightRadiusOption(meters) {
    document.querySelectorAll('.geofence-radius-option').forEach(function (btn) {
      btn.classList.toggle('is-active', meters != null && parseInt(btn.getAttribute('data-radius'), 10) === meters);
    });
  }

  function hasValidGeofence() {
    if (geofenceShape === 'polygon') return !!polygonLayer;
    if (geofenceShape === 'circle') return !!circleLayer && !!getRadiusM();
    return !!(circleLayer && getRadiusM()) || !!polygonLayer;
  }

  function initMap() {
    var el = document.getElementById('geofence-map');
    if (!el || typeof L === 'undefined') return;

    map = L.map(el, {
      center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
      zoom: DEFAULT_CENTER.zoom,
      zoomControl: true,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '&copy; OSM &copy; CARTO'
    }).addTo(map);

    placeMarker(getLatLng());
    map.setView(getLatLng(), DEFAULT_CENTER.zoom);
    setGeofenceShape('');

    document.querySelectorAll('[data-map-tool]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setTool(btn.getAttribute('data-map-tool'));
      });
    });
  }

  function bindForm() {
    var latInput = document.getElementById('geofence-lat');
    var lngInput = document.getElementById('geofence-lng');
    var input = radiusInput();
    var addressInput = document.getElementById('geofence-address');

    function syncFromFields() {
      if (geofenceShape === 'polygon') {
        placeMarker(getLatLng());
        map.setView(getLatLng(), map.getZoom());
        return;
      }
      syncCircle(!!getRadiusM());
    }

    latInput.addEventListener('change', syncFromFields);
    lngInput.addEventListener('change', syncFromFields);

    addressInput.addEventListener('change', function () {
      if (addressInput.value.toLowerCase().indexOf('vadodara') !== -1) {
        latInput.value = '22.3222';
        lngInput.value = '73.1586';
      } else if (addressInput.value.toLowerCase().indexOf('pune') !== -1) {
        latInput.value = '18.5204';
        lngInput.value = '73.8567';
      } else {
        latInput.value = String(DEFAULT_CENTER.lat);
        lngInput.value = String(DEFAULT_CENTER.lng);
      }
      syncFromFields();
    });

    document.getElementById('geofence-radius-toggle').addEventListener('click', function (e) {
      e.preventDefault();
      toggleRadiusMenu();
    });

    input.addEventListener('focus', openRadiusMenu);

    input.addEventListener('input', function () {
      if (geofenceShape === 'polygon') return;
      highlightRadiusOption(getRadiusM());
      updateCircleRadius(true);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        closeRadiusMenu();
        if (geofenceShape !== 'polygon') updateCircleRadius(true);
      }
      if (e.key === 'Escape') closeRadiusMenu();
    });

    document.querySelectorAll('.geofence-radius-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setRadiusM(parseInt(btn.getAttribute('data-radius'), 10), true, true);
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#geofence-radius-field')) closeRadiusMenu();
    });

    document.getElementById('geofence-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var form = e.target;
      if (!hasValidGeofence()) {
        window.alert('Draw a circle or polygon geofence on the map before saving.');
        return;
      }
      if (geofenceShape === 'circle' && !getRadiusM()) {
        input.setCustomValidity('Please select or input a radius in meters.');
        input.reportValidity();
        return;
      }
      input.setCustomValidity('');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      window.location.href = 'geofences';
    });
  }

  function init() {
    if (document.body.getAttribute('data-subpage') !== 'geofence-form') return;

    if (window.YSOAM_ICONS) {
      document.querySelectorAll('[data-form-icon]').forEach(function (el) {
        var key = el.getAttribute('data-form-icon');
        if (window.YSOAM_ICONS[key]) el.innerHTML = window.YSOAM_ICONS[key];
      });
    }

    initMap();
    bindForm();
    initLucide(document.querySelector('.content--geofence-form'));
    setTimeout(function () { if (map) map.invalidateSize(); }, 100);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
