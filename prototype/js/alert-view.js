(function () {
  'use strict';

  if (document.body.getAttribute('data-subpage') !== 'alert-view') return;

  var data = window.YSOAM_ALERTS;

  function getId() {
    return new URLSearchParams(window.location.search).get('id');
  }

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function lucide(name, size) { return window.YSOAM_LUCIDE ? window.YSOAM_LUCIDE.icon(name, size || 16) : ''; }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }

  function dash(val) { return val ? esc(val) : '—'; }

  function severityBadge(row) {
    return '<span class="alerts-severity alerts-severity--' + esc(row.severity) + ' alerts-severity--lg">' + esc(row.severityLabel) + '</span>';
  }

  function detailRow(label, value) {
    return '<div class="assign-detail-page-row">' +
      '<span class="assign-detail-page-row__label">' + esc(label) + '</span>' +
      '<span class="assign-detail-page-row__value">' + value + '</span>' +
    '</div>';
  }

  function relatedLink(row) {
    if (row.tripId) {
      return '<a href="trip-detail.html?id=' + escA(row.tripId) + '" class="table-cell-link">' + esc(row.tripId) + '</a>';
    }
    if (row.type === 'document_expiry') {
      return '<a href="documents.html" class="table-cell-link">View Documents</a>';
    }
    if (row.type === 'maintenance_due' || row.type === 'breakdown') {
      return '<a href="work-orders.html" class="table-cell-link">View Work Orders</a>';
    }
    if (row.type === 'geofence_breach') {
      return '<a href="geofences.html" class="table-cell-link">View Geofences</a>';
    }
    if (row.type === 'fuel_anomaly') {
      return '<a href="fuel-history.html" class="table-cell-link">View Fuel History</a>';
    }
    return '<a href="gps.html" class="table-cell-link">View on Map</a>';
  }

  function render() {
    var root = document.getElementById('alert-view-root');
    var row = data.getById(getId());
    if (!row) {
      window.location.href = 'alerts';
      return;
    }

    root.innerHTML =
      '<nav class="assign-detail-breadcrumb part-view-breadcrumb" aria-label="Breadcrumb">' +
        '<a href="alerts">← Alerts</a>' +
      '</nav>' +
      '<header class="alert-view-header">' +
        '<div class="alert-view-header__main">' +
          '<span class="alert-view-icon" data-lucide-icon="alertTriangle" data-lucide-icon-size="28" aria-hidden="true"></span>' +
          '<div class="alert-view-header__text">' +
            '<div class="alert-view-header__badges">' + severityBadge(row) +
              (row.read ? '<span class="alerts-read-badge">Read</span>' : '<span class="alerts-unread-badge">Unread</span>') +
            '</div>' +
            '<h1>' + esc(row.title) + '</h1>' +
            '<p class="alert-view-summary">' + esc(row.summary) + '</p>' +
            '<dl class="part-view-meta-row">' +
              '<div><dt>Type</dt><dd>' + dash(row.typeLabel) + '</dd></div>' +
              '<div><dt>Vehicle</dt><dd><a href="vehicle-detail.html?id=' + escA(row.vehicleId) + '" class="table-cell-link">' + esc(row.vehicleName) + '</a></dd></div>' +
              '<div><dt>Triggered</dt><dd>' + esc(row.triggeredFull) + '</dd></div>' +
              '<div><dt>Source</dt><dd>' + dash(row.source) + '</dd></div>' +
            '</dl>' +
          '</div>' +
        '</div>' +
        '<div class="alert-view-header__actions">' +
          '<button type="button" class="btn btn-outline btn-sm" id="alert-toggle-read">' + (row.read ? 'Mark Unread' : 'Mark Read') + '</button>' +
          '<button type="button" class="btn btn-primary btn-sm" id="alert-view-related">View Related</button>' +
        '</div>' +
      '</header>' +
      '<div class="alert-view-grid">' +
        '<section class="panel">' +
          '<div class="panel__header"><h2 class="panel__title">Details</h2></div>' +
          '<div class="panel__body assign-detail-panel__body">' +
            detailRow('Alert ID', dash(row.id)) +
            detailRow('Severity', severityBadge(row)) +
            detailRow('Status', row.read ? 'Read' : 'Unread') +
            detailRow('Vehicle Group', dash(row.vehicleGroup)) +
            detailRow('Trip', row.tripId ? '<a href="trip-detail.html?id=' + escA(row.tripId) + '" class="table-cell-link">' + esc(row.tripId) + '</a>' : '—') +
            detailRow('Recommended Action', relatedLink(row)) +
          '</div>' +
        '</section>' +
        '<section class="panel">' +
          '<div class="panel__header"><h2 class="panel__title">Context</h2></div>' +
          '<div class="panel__body assign-detail-panel__body">' +
            detailRow('Description', dash(row.summary)) +
            detailRow('Detected By', dash(row.source)) +
            detailRow('Fleet Group', dash(row.vehicleGroup)) +
            detailRow('Platform', 'Web &amp; Mobile') +
          '</div>' +
        '</section>' +
      '</div>';

    document.title = row.title + ' — Alerts — YSOAM';
    initLucide(root);

    document.getElementById('alert-toggle-read').onclick = function () {
      row.read = !row.read;
      render();
    };

    document.getElementById('alert-view-related').onclick = function () {
      var link = relatedLink(row);
      var a = document.createElement('div');
      a.innerHTML = link;
      var href = a.querySelector('a');
      if (href) window.location.href = href.getAttribute('href');
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
