(function () {
  var MAP_ID = 'map-gps';
  var nearbyTab = 'vehicles';

  function mapApi() {
    return window.YSOAM_MAP;
  }

  function renderNearbyList() {
    var listEl = document.getElementById('nearby-list');
    var api = mapApi();
    if (!listEl || !api) return;

    var items = api.getNearby(MAP_ID, nearbyTab);

    if (!items.length) {
      listEl.innerHTML =
        '<div class="fleet-map-panel__empty">' +
          '<div class="fleet-map-panel__empty-icon" aria-hidden="true">⌕</div>' +
          '<p>No results found</p>' +
          '<span>Try moving the map or changing filters</span>' +
        '</div>';
      return;
    }

    listEl.innerHTML = items.map(function (item) {
      var dist = item.distance < 1
        ? Math.round(item.distance * 1000) + ' m'
        : item.distance.toFixed(1) + ' km';

      return (
        '<button type="button" class="nearby-item" data-nearby-id="' + item.id + '" data-nearby-kind="' + item.kind + '">' +
          '<span class="nearby-item__title">' + item.title + '</span>' +
          '<span class="nearby-item__meta">' + item.meta + '</span>' +
          '<span class="nearby-item__dist tabular-nums">' + dist + '</span>' +
        '</button>'
      );
    }).join('');

    listEl.querySelectorAll('[data-nearby-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-nearby-id');
        var kind = btn.getAttribute('data-nearby-kind');
        if (kind === 'vehicle') {
          api.selectVehicle(MAP_ID, id);
        } else {
          var entry = api.getMap(MAP_ID);
          if (!entry) return;
          var source = kind === 'place' ? window.YSOAM_FLEET.places : window.YSOAM_FLEET.vendors;
          var found = source.find(function (x) { return x.id === id; });
          if (found) entry.map.setView([found.lat, found.lng], 12, { animate: true });
        }
      });
    });
  }

  function bindNearbyTabs() {
    document.querySelectorAll('[data-nearby-tab]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        nearbyTab = tab.getAttribute('data-nearby-tab');
        document.querySelectorAll('[data-nearby-tab]').forEach(function (t) {
          var active = t === tab;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        renderNearbyList();
      });
    });
  }

  function bindPanelCollapse() {
    var panel = document.getElementById('fleet-map-panel');
    var btn = document.getElementById('fleet-panel-collapse');
    if (!panel || !btn) return;

    btn.addEventListener('click', function () {
      panel.classList.toggle('is-collapsed');
      btn.textContent = panel.classList.contains('is-collapsed') ? '›' : '‹';
      setTimeout(function () {
        var entry = mapApi() && mapApi().getMap(MAP_ID);
        if (entry) entry.map.invalidateSize();
      }, 220);
    });
  }

  function bindLayerPills() {
    document.querySelectorAll('[data-map-layer]').forEach(function (pill) {
      pill.addEventListener('click', function () {
        var layer = pill.getAttribute('data-map-layer');
        var active = !pill.classList.contains('is-active');
        pill.classList.toggle('is-active', active);
        pill.setAttribute('aria-pressed', active ? 'true' : 'false');
        mapApi().toggleLayer(MAP_ID, layer, active);
      });
    });
  }

  function bindFilters() {
    var panel = document.getElementById('fleet-map-filters');
    var toggleBtn = document.querySelector('[data-map-action="filters"]');
    var cancelBtn = document.getElementById('filter-cancel');
    var applyBtn = document.getElementById('filter-apply');

    if (!panel || !toggleBtn) return;

    function closeFilters() {
      panel.hidden = true;
      toggleBtn.setAttribute('aria-expanded', 'false');
    }

    toggleBtn.addEventListener('click', function () {
      var open = panel.hidden;
      panel.hidden = !open;
      toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    if (cancelBtn) cancelBtn.addEventListener('click', closeFilters);
    if (applyBtn) {
      applyBtn.addEventListener('click', function () {
        var status = document.getElementById('filter-status').value;
        mapApi().refreshVehicles(MAP_ID, { status: status || undefined });
        renderNearbyList();
        closeFilters();
      });
    }

    document.addEventListener('click', function (e) {
      if (!panel.hidden && !panel.contains(e.target) && !toggleBtn.contains(e.target)) {
        closeFilters();
      }
    });
  }

  function bindMapOptions() {
    var menu = document.getElementById('map-options-menu');
    var toggle = document.getElementById('map-options-toggle');
    var labels = document.getElementById('map-labels');
    var resetBtn = document.getElementById('map-reset-center');
    var useCenterBtn = document.getElementById('map-use-center');

    if (!menu || !toggle) return;

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = menu.hidden;
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.addEventListener('click', function (e) {
      if (!menu.hidden && !menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.querySelectorAll('input[name="map-type"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        var mode = radio.value;
        var showLabels = labels ? labels.checked : true;
        mapApi().setMapMode(MAP_ID, mode === 'default' ? 'street' : mode, showLabels);
      });
    });

    if (labels) {
      labels.addEventListener('change', function () {
        mapApi().setLabelsVisible(MAP_ID, labels.checked);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        mapApi().resetView(MAP_ID);
        menu.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
      });
    }

    if (useCenterBtn) {
      useCenterBtn.addEventListener('click', function () {
        mapApi().useMapCenter(MAP_ID);
      });
    }
  }

  function bindMapMoveRefresh() {
    var checkbox = document.getElementById('nearby-update-on-move');
    var entry = mapApi() && mapApi().getMap(MAP_ID);
    if (!entry || !checkbox) return;

    entry.map.on('moveend', function () {
      if (checkbox.checked) renderNearbyList();
    });
  }

  function bindSearch() {
    var input = document.getElementById('fleet-map-search');
    if (!input) return;

    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var q = input.value.trim().toLowerCase();
      if (!q) return;

      var fleet = window.YSOAM_FLEET;
      var vehicle = fleet.vehicles.find(function (v) {
        return v.id.toLowerCase().indexOf(q) !== -1 || v.shortId.toLowerCase().indexOf(q) !== -1;
      });
      if (vehicle) {
        mapApi().selectVehicle(MAP_ID, vehicle.id);
        return;
      }

      var place = (fleet.places || []).find(function (p) { return p.name.toLowerCase().indexOf(q) !== -1; });
      if (place) {
        mapApi().getMap(MAP_ID).map.setView([place.lat, place.lng], 12);
        mapApi().toggleLayer(MAP_ID, 'places', true);
        document.querySelector('[data-map-layer="places"]').classList.add('is-active');
        return;
      }

      var vendor = (fleet.vendors || []).find(function (v) { return v.name.toLowerCase().indexOf(q) !== -1; });
      if (vendor) {
        mapApi().getMap(MAP_ID).map.setView([vendor.lat, vendor.lng], 12);
        mapApi().toggleLayer(MAP_ID, 'vendors', true);
        document.querySelector('[data-map-layer="vendors"]').classList.add('is-active');
      }
    });
  }

  function injectPillIcons() {
    var I = window.YSOAM_ICONS;
    if (!I) return;
    var searchIcon = document.getElementById('fleet-map-search-icon');
    var filters = document.getElementById('pill-icon-filters');
    var vehicles = document.getElementById('pill-icon-vehicles');
    var places = document.getElementById('pill-icon-places');
    var vendors = document.getElementById('pill-icon-vendors');
    if (searchIcon) searchIcon.innerHTML = I.search;
    if (filters) filters.innerHTML = I.mapFilter;
    if (vehicles) vehicles.innerHTML = I.mapVehicle;
    if (places) places.innerHTML = I.mapPlace;
    if (vendors) vendors.innerHTML = I.mapVendor;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('map-gps')) return;

    injectPillIcons();

    if (window.YSOAM_MAP) window.YSOAM_MAP.initLiveTracking();

    bindNearbyTabs();
    bindPanelCollapse();
    bindLayerPills();
    bindFilters();
    bindMapOptions();
    bindSearch();

    setTimeout(function () {
      renderNearbyList();
      bindMapMoveRefresh();
      var entry = mapApi() && mapApi().getMap(MAP_ID);
      if (entry) entry.map.invalidateSize();
    }, 200);
  });
})();
