(function () {
  var tripsData = window.YSOAM_TRIPS;
  if (!tripsData || typeof L === 'undefined') return;

  var map = null;
  var vehicleMarker = null;
  var points = [];
  var currentIndex = 0;
  var playing = false;
  var playTimer = null;
  var playSpeed = 1;
  var activeTrip = null;

  var TILES = {
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    labels: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png'
  };

  function getTripIdFromUrl() {
    return new URLSearchParams(window.location.search).get('id');
  }

  function findTrip(id) {
    return tripsData.trips.find(function (t) { return t.id === id; });
  }

  function speedColor(speed) {
    if (!speed || speed === 0) return '#9CA3AF';
    if (speed < 30) return '#16A34A';
    if (speed < 60) return '#EAB308';
    if (speed <= 80) return '#F97316';
    return '#DC2626';
  }

  function parseTimeLabel(dateTimeStr) {
    if (!dateTimeStr) return '—';
    var parts = dateTimeStr.split(', ');
    return parts.length > 1 ? parts[1] : dateTimeStr;
  }

  function addMinutesToTime(timeStr, minutes) {
    var bits = timeStr.split(':');
    var h = parseInt(bits[0], 10);
    var m = parseInt(bits[1], 10);
    var s = bits[2] ? parseInt(bits[2], 10) : 0;
    var total = h * 3600 + m * 60 + s + minutes * 60;
    if (total < 0) total = 0;
    h = Math.floor(total / 3600) % 24;
    m = Math.floor((total % 3600) / 60);
    s = total % 60;
    return [h, m, s].map(function (n) { return String(n).padStart(2, '0'); }).join(':');
  }

  function buildPlaybackPoints(trip) {
    var coords = tripsData.routes[trip.routeKey] || [];
    var startTime = parseTimeLabel(trip.startAt);
    var speedPattern = [0, 24, 52, 68, 74, 58, 42, 36, 0];
    var built = [];

    coords.forEach(function (coord, i) {
      var speed = speedPattern[i % speedPattern.length];
      if (trip.avgSpeed && i > 0 && i < coords.length - 1) {
        speed = Math.round(trip.avgSpeed * (0.7 + (i % 3) * 0.15));
      }
      if (i === 0) speed = 0;
      if (i === coords.length - 1) speed = 0;

      built.push({
        lat: coord[0],
        lng: coord[1],
        speed: speed,
        time: addMinutesToTime(startTime, Math.round((i / Math.max(coords.length - 1, 1)) * 120))
      });
    });

    if (built.length < 6) {
      var extra = [];
      built.forEach(function (pt, i) {
        extra.push(pt);
        if (i < built.length - 1) {
          var next = built[i + 1];
          extra.push({
            lat: (pt.lat + next.lat) / 2,
            lng: (pt.lng + next.lng) / 2,
            speed: Math.round((pt.speed + next.speed) / 2) || trip.avgSpeed || 40,
            time: addMinutesToTime(pt.time, 15)
          });
        }
      });
      built = extra;
    }

    return built;
  }

  function createVehicleIcon(speed) {
    var color = speedColor(speed);
    if (window.YSOAM_VEHICLE_ICON && window.YSOAM_VEHICLE_ICON.topView) {
      return L.divIcon({
        className: 'playback-vehicle-marker',
        html: window.YSOAM_VEHICLE_ICON.topView(color, { size: 28, heading: 0, selected: false }),
        iconSize: [1, 1],
        iconAnchor: [0, 0]
      });
    }
    return L.divIcon({
      className: 'playback-vehicle-marker',
      html: '<span class="playback-vehicle-dot" style="background:' + color + '"></span>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  }

  function createEndIcon() {
    return L.divIcon({
      className: 'playback-end-marker',
      html: '<span class="playback-end-dot">E</span>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }

  function initMap(trip) {
    var el = document.getElementById('map-playback');
    if (!el) return;

    if (map) {
      map.remove();
      map = null;
    }

    map = L.map('map-playback', { zoomControl: true }).setView([18.85, 73.35], 10);
    L.tileLayer(TILES.satellite, { maxZoom: 19, attribution: '© Esri' }).addTo(map);
    L.tileLayer(TILES.labels, { subdomains: 'abcd', maxZoom: 19, pane: 'overlayPane' }).addTo(map);

    for (var i = 0; i < points.length - 1; i++) {
      L.polyline(
        [[points[i].lat, points[i].lng], [points[i + 1].lat, points[i + 1].lng]],
        { color: speedColor(points[i + 1].speed), weight: 5, opacity: 0.9 }
      ).addTo(map);
    }

    var last = points[points.length - 1];
    L.marker([last.lat, last.lng], { icon: createEndIcon(), zIndexOffset: 500 }).addTo(map);

    vehicleMarker = L.marker([points[0].lat, points[0].lng], {
      icon: createVehicleIcon(points[0].speed),
      zIndexOffset: 1000
    }).addTo(map);

    var bounds = L.latLngBounds(points.map(function (p) { return [p.lat, p.lng]; }));
    map.fitBounds(bounds, { padding: [40, 40] });
    setTimeout(function () { map.invalidateSize(); }, 200);
  }

  function updateUiAtIndex(index) {
    currentIndex = index;
    var pt = points[index];
    if (!pt) return;

    if (vehicleMarker) {
      vehicleMarker.setLatLng([pt.lat, pt.lng]);
      vehicleMarker.setIcon(createVehicleIcon(pt.speed));
    }

    var speedEl = document.getElementById('playback-current-speed');
    var timeEl = document.getElementById('playback-current-time');
    var labelEl = document.getElementById('playback-point-label');
    var slider = document.getElementById('playback-slider');
    var badge = document.getElementById('playback-live-badge');

    if (speedEl) speedEl.textContent = pt.speed + ' km/h';
    if (timeEl) timeEl.textContent = pt.time;
    if (labelEl) labelEl.textContent = (index + 1) + ' / ' + points.length + ' pts';
    if (slider) slider.value = String(index);

    if (badge) {
      badge.style.background = speedColor(pt.speed);
      badge.style.color = pt.speed > 40 ? '#fff' : 'var(--color-ink-deep)';
    }

    drawSpeedGraph(index);
  }

  function drawSpeedGraph(activeIndex) {
    var canvas = document.getElementById('playback-speed-canvas');
    if (!canvas || !points.length) return;

    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var width = canvas.parentElement.clientWidth;
    var height = 80;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    var maxSpeed = Math.max.apply(null, points.map(function (p) { return p.speed; }).concat([80]));
    var peakEl = document.getElementById('playback-graph-peak');
    if (peakEl) peakEl.textContent = maxSpeed + ' km/h';

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, width, height);

    var padX = 12;
    var padY = 10;
    var graphW = width - padX * 2;
    var graphH = height - padY * 2;

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, padY);
    ctx.lineTo(padX, height - padY);
    ctx.lineTo(width - padX, height - padY);
    ctx.stroke();

    if (points.length < 2) return;

    ctx.beginPath();
    points.forEach(function (pt, i) {
      var x = padX + (i / (points.length - 1)) * graphW;
      var y = height - padY - (pt.speed / maxSpeed) * graphH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#0052FF';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (typeof activeIndex === 'number') {
      var ax = padX + (activeIndex / (points.length - 1)) * graphW;
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(ax, padY);
      ctx.lineTo(ax, height - padY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  function stopPlayback() {
    playing = false;
    if (playTimer) {
      clearInterval(playTimer);
      playTimer = null;
    }
    var btn = document.getElementById('playback-toggle');
    if (btn) btn.textContent = currentIndex >= points.length - 1 ? '↻' : '▶';
  }

  function startPlayback() {
    if (!points.length) return;
    if (currentIndex >= points.length - 1) currentIndex = 0;

    playing = true;
    var btn = document.getElementById('playback-toggle');
    if (btn) btn.textContent = '⏸';

    playTimer = setInterval(function () {
      if (currentIndex >= points.length - 1) {
        stopPlayback();
        return;
      }
      updateUiAtIndex(currentIndex + 1);
      if (map) map.panTo([points[currentIndex].lat, points[currentIndex].lng], { animate: true, duration: 0.35 });
    }, Math.round(800 / playSpeed));
  }

  function togglePlayback() {
    if (playing) stopPlayback();
    else startPlayback();
  }

  function renderHeader(trip) {
    document.title = trip.id + ' — Playback — YSOAM Prototype';
    document.getElementById('playback-trip-id').textContent = trip.id;

    var back = document.getElementById('playback-back');
    if (back) back.href = 'trip-detail.html?id=' + encodeURIComponent(trip.id);

    var chips = document.getElementById('playback-stat-chips');
    if (chips) {
      chips.innerHTML =
        '<span class="playback-chip tabular-nums">' + parseTimeLabel(trip.startAt) + ' → ' + (trip.endAt ? parseTimeLabel(trip.endAt) : '—') + '</span>' +
        '<span class="playback-chip tabular-nums">' + (trip.distance ? trip.distance + ' km' : '—') + '</span>' +
        '<span class="playback-chip tabular-nums">' + trip.duration + '</span>' +
        '<span class="playback-chip tabular-nums">' + (trip.avgSpeed ? trip.avgSpeed.toFixed(1) + ' km/h avg' : '—') + '</span>';
    }

    var row = document.getElementById('playback-stat-row');
    if (row) {
      row.innerHTML =
        '<span>Stops: <strong>' + trip.stops + '</strong> (' + (trip.stops ? '12 min' : '0 min') + ')</span>' +
        '<span>Idle: <strong>' + (trip.idleTime === '—' ? '0' : trip.idleTime.replace('m', '')) + '</strong> (30s+ segments)</span>';
    }

    document.getElementById('playback-time-start').textContent = points[0] ? points[0].time : '—';
    document.getElementById('playback-time-end').textContent = points[points.length - 1] ? points[points.length - 1].time : '—';

    var slider = document.getElementById('playback-slider');
    if (slider) {
      slider.min = '0';
      slider.max = String(Math.max(points.length - 1, 0));
      slider.value = '0';
    }
  }

  function exportTrack(format) {
    if (!activeTrip || !points.length) return;
    var lines = [];
    if (format === 'gpx') {
      lines.push('<?xml version="1.0" encoding="UTF-8"?>');
      lines.push('<gpx version="1.1"><trk><name>' + activeTrip.id + '</name><trkseg>');
      points.forEach(function (p) {
        lines.push('<trkpt lat="' + p.lat + '" lon="' + p.lng + '"><time>' + p.time + '</time></trkpt>');
      });
      lines.push('</trkseg></trk></gpx>');
    } else {
      lines.push('<?xml version="1.0" encoding="UTF-8"?>');
      lines.push('<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>' + activeTrip.id + '</name><Placemark><LineString><coordinates>');
      lines.push(points.map(function (p) { return p.lng + ',' + p.lat + ',0'; }).join(' '));
      lines.push('</coordinates></LineString></Placemark></Document></kml>');
    }
    var blob = new Blob([lines.join('\n')], { type: 'application/xml' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = activeTrip.id + '.' + format;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function showNotFound() {
    var root = document.getElementById('playback-root');
    if (root) {
      root.innerHTML = '<div class="panel"><div class="panel__body"><p>Trip not found.</p><a class="btn btn-primary btn-sm" href="trips.html">Back to trips</a></div></div>';
    }
  }

  function bindEvents() {
    document.getElementById('playback-toggle').addEventListener('click', togglePlayback);

    document.getElementById('playback-step-back').addEventListener('click', function () {
      stopPlayback();
      updateUiAtIndex(Math.max(currentIndex - 1, 0));
    });

    document.getElementById('playback-speed').addEventListener('click', function () {
      var speeds = [1, 2, 4];
      var idx = speeds.indexOf(playSpeed);
      playSpeed = speeds[(idx + 1) % speeds.length];
      this.textContent = playSpeed + '×';
      this.setAttribute('data-speed', String(playSpeed));
      if (playing) {
        stopPlayback();
        startPlayback();
      }
    });

    document.getElementById('playback-slider').addEventListener('input', function () {
      stopPlayback();
      updateUiAtIndex(parseInt(this.value, 10));
    });

    document.getElementById('export-kml').addEventListener('click', function () { exportTrack('kml'); });
    document.getElementById('export-gpx').addEventListener('click', function () { exportTrack('gpx'); });

    window.addEventListener('resize', function () {
      drawSpeedGraph(currentIndex);
      if (map) map.invalidateSize();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var trip = findTrip(getTripIdFromUrl());
    if (!trip) {
      showNotFound();
      return;
    }

    activeTrip = trip;
    points = buildPlaybackPoints(trip);
    renderHeader(trip);
    initMap(trip);
    updateUiAtIndex(0);
    bindEvents();
  });
})();
