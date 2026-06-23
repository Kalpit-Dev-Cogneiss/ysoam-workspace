(function () {
  'use strict';

  var data = window.YSOAM_CHARGING_HISTORY;
  var vehicles = window.YSOAM_VEHICLES;
  var icons = window.YSOAM_ICONS;

  function getId() {
    return new URLSearchParams(window.location.search).get('id');
  }

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escA(s) {
    return esc(s).replace(/"/g, '&quot;');
  }

  function lucide(name, size) {
    return window.YSOAM_LUCIDE ? window.YSOAM_LUCIDE.icon(name, size || 16) : '';
  }

  function icon(key) {
    return icons && icons[key] ? icons[key] : '';
  }

  function dash(val) {
    return val ? esc(val) : '—';
  }

  function detailRow(label, value) {
    return '<div class="assign-detail-page-row">' +
      '<span class="assign-detail-page-row__label">' + esc(label) + '</span>' +
      '<span class="assign-detail-page-row__value">' + value + '</span>' +
    '</div>';
  }

  function findVehicle(id) {
    return (vehicles.list || []).find(function (v) { return v.id === id; }) || null;
  }

  function metricCard(label, value) {
    return '<div class="fuel-metric-card">' +
      '<span class="fuel-metric-card__label">' + esc(label) + '</span>' +
      '<span class="fuel-metric-card__value tabular-nums">' + value + '</span>' +
    '</div>';
  }

  function vendorHtml(vendor) {
    if (!vendor) return '—';
    return '<span class="fh-vendor-cell fh-vendor-cell--charge">' +
      '<span class="fh-vendor-charge-icon" data-lucide-icon="zap" data-lucide-icon-size="14" aria-hidden="true"></span>' +
      '<span>' + esc(vendor.name) + '</span>' +
    '</span>';
  }

  function mapHtml(row) {
    if (!row.location || !row.coords) {
      return '<div class="fuel-entry-map fuel-entry-map--empty"><p>Location is unknown or not available.</p></div>';
    }
    var lat = row.coords.lat;
    var lng = row.coords.lng;
    var pad = 0.04;
    var bbox = (lng - pad) + '%2C' + (lat - pad) + '%2C' + (lng + pad) + '%2C' + (lat + pad);
    var src = 'https://www.openstreetmap.org/export/embed.html?bbox=' + bbox +
      '&layer=mapnik&marker=' + lat + '%2C' + lng;
    return '<div class="fuel-entry-map">' +
      '<iframe title="Map for ' + escA(row.location) + '" src="' + src + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>' +
      '<div class="fuel-entry-map__label">' + esc(row.location) + '</div>' +
    '</div>';
  }

  function moreMenu() {
    return (
      '<div class="row-actions" data-cev-more>' +
        '<button type="button" class="row-actions__trigger" aria-label="More actions" aria-haspopup="menu" aria-expanded="false">' +
          '<span class="row-actions__dots" aria-hidden="true"></span>' +
        '</button>' +
        '<div class="row-actions__menu" role="menu" hidden>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-cev-print role="menuitem">Print PDF <span class="row-actions__item-icon">' + icon('actionPrint') + '</span></button>' +
          '<div class="row-actions__divider" role="separator"></div>' +
          '<button type="button" class="row-actions__item row-actions__item--btn row-actions__item--danger" data-cev-delete role="menuitem">Delete <span class="row-actions__item-icon">' + icon('actionDelete') + '</span></button>' +
        '</div>' +
      '</div>'
    );
  }

  function closeMoreMenu() {
    var menu = document.querySelector('[data-cev-more] .row-actions__menu');
    var trigger = document.querySelector('[data-cev-more] .row-actions__trigger');
    if (menu) {
      menu.hidden = true;
      menu.style.position = '';
      menu.style.top = '';
      menu.style.left = '';
    }
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function bindHeaderActions(row) {
    var moreWrap = document.querySelector('[data-cev-more]');
    if (moreWrap) {
      var trigger = moreWrap.querySelector('.row-actions__trigger');
      var menu = moreWrap.querySelector('.row-actions__menu');
      if (trigger && menu) {
        trigger.addEventListener('click', function (e) {
          e.stopPropagation();
          var open = menu.hidden;
          closeMoreMenu();
          if (open) {
            var rect = trigger.getBoundingClientRect();
            menu.hidden = false;
            menu.style.position = 'fixed';
            menu.style.top = (rect.bottom + 4) + 'px';
            menu.style.left = Math.max(8, rect.right - 188) + 'px';
            menu.style.zIndex = '120';
            trigger.setAttribute('aria-expanded', 'true');
          }
        });
      }
      moreWrap.querySelector('[data-cev-print]') && moreWrap.querySelector('[data-cev-print]').addEventListener('click', function () {
        closeMoreMenu();
        window.alert('Print PDF (prototype demo).');
      });
      moreWrap.querySelector('[data-cev-delete]') && moreWrap.querySelector('[data-cev-delete]').addEventListener('click', function () {
        closeMoreMenu();
        window.alert('Delete charging entry (prototype demo).');
      });
    }

    document.getElementById('cev-watch-btn') && document.getElementById('cev-watch-btn').addEventListener('click', function () {
      window.alert('Unwatch charging entry (prototype demo).');
    });

    document.getElementById('cev-edit-btn') && document.getElementById('cev-edit-btn').addEventListener('click', function () {
      window.location.href = 'charging-entry-form?id=' + encodeURIComponent(row.id);
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('[data-cev-more]')) closeMoreMenu();
    });
  }

  function render() {
    var root = document.getElementById('charging-entry-view-root');
    if (!root) return;

    var row = data.getById(getId());
    if (!row) {
      window.location.href = 'charging-history';
      return;
    }

    var v = findVehicle(row.vehicleId);
    var sample = row.isSample ? '<span class="service-sample-tag">Sample</span>' : '';

    var vehicleHtml = v ? (
      '<span class="assign-detail-vehicle service-detail-vehicle">' +
        '<img src="' + escA(v.image) + '" alt="">' +
        '<span class="service-detail-vehicle__text">' +
          '<a href="vehicles?id=' + escA(v.id) + '" class="table-cell-link">' + esc(v.name) + '</a>' +
          sample +
        '</span>' +
      '</span>'
    ) : esc(row.vehicleId);

    root.innerHTML =
      '<nav class="assign-detail-breadcrumb" aria-label="Breadcrumb">' +
        '<a href="charging-history">← Charging History</a>' +
      '</nav>' +
      '<div class="assign-detail-page__header fuel-entry-view__header">' +
        '<h1>Charging Entry #' + esc(row.entryNumber) + '</h1>' +
        '<div class="assign-detail-page__actions fuel-entry-view__actions">' +
          '<button type="button" class="btn btn-outline btn-sm fuel-entry-watch-btn" id="cev-watch-btn">' +
            lucide('eye', 14) + ' Unwatch' +
          '</button>' +
          moreMenu() +
          '<button type="button" class="btn btn-outline btn-sm fuel-entry-edit-btn" id="cev-edit-btn">' +
            lucide('pencil', 14) + ' Edit' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="trip-detail-grid trip-detail-grid--fuel-entry">' +
        '<div class="fuel-entry-detail-col">' +
          '<section class="panel">' +
            '<div class="panel__header service-detail-panel__header">' +
              '<h2 class="panel__title">Details</h2>' +
              '<button type="button" class="service-detail-fields-toggle">All Fields <span data-lucide-icon="chevronDown" data-lucide-icon-size="14" aria-hidden="true"></span></button>' +
            '</div>' +
            '<div class="panel__body assign-detail-panel__body">' +
              detailRow('Vehicle', vehicleHtml) +
              detailRow('Charge Started', esc(data.formatShortDateTime(row.startTime))) +
              detailRow('Charge Ended', esc(data.formatShortDateTime(row.endTime))) +
              detailRow('Duration', esc(data.formatDuration(row.durationMin))) +
              detailRow('Odometer', dash(row.meterEntry)) +
              detailRow('Vendor', vendorHtml(row.vendor)) +
              detailRow('Source', esc(row.source || 'Manually Entered')) +
              detailRow('Reference', dash(row.reference)) +
            '</div>' +
          '</section>' +
        '</div>' +
        '<div class="fuel-entry-side-col">' +
          '<section class="panel fuel-entry-metrics-panel">' +
            '<div class="panel__header"><h2 class="panel__title">Cost Breakdown</h2></div>' +
            '<div class="fuel-entry-metrics">' +
              metricCard('Energy', esc(row.totalEnergy.toFixed(1) + ' kWh')) +
              metricCard('Price', esc(data.formatMoney(row.unitPrice) + ' / kWh')) +
              metricCard('Energy Cost', esc(data.formatMoney(row.energyCost))) +
              metricCard('Usage', dash(row.usage)) +
              metricCard('Economy', row.economy ? esc(row.economy + ' km/kWh') : '—') +
              metricCard('Cost / Kilometer', row.costPerMeter ? esc(data.formatMoney(row.costPerMeter) + ' / km') : '—') +
            '</div>' +
          '</section>' +
          '<section class="panel fuel-entry-location-panel">' +
            '<div class="panel__header"><h2 class="panel__title">Location</h2></div>' +
            '<div class="panel__body panel__body--flush">' +
              mapHtml(row) +
            '</div>' +
          '</section>' +
        '</div>' +
      '</div>' +
      '<p class="service-detail-created">' + esc(data.formatRelativeMeta(row.createdAt, row.updatedAt)) + '</p>';

    document.title = 'Charging Entry #' + row.entryNumber + ' — YSOAM';
    if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root);
    bindHeaderActions(row);
  }

  if (document.body.getAttribute('data-subpage') === 'charging-entry-view') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
    else render();
  }
})();
