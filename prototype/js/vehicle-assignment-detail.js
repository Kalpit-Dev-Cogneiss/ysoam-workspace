(function () {
  var vehicles = window.YSOAM_VEHICLES;
  var data = window.YSOAM_ASSIGNMENTS;
  var DEMO_NOW = new Date(2026, 5, 15, 13, 30);

  function getId() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    if (id) return id;
    var hash = window.location.hash.replace(/^#/, '');
    if (hash.indexOf('id=') === 0) return decodeURIComponent(hash.slice(3));
    return null;
  }

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeAttr(s) { return escapeHtml(s).replace(/"/g, '&quot;'); }

  function formatDateTime(d) {
    return d.toLocaleString('en-US', {
      month: '2-digit', day: '2-digit', year: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  }

  function formatDuration(ms) {
    if (ms <= 0) return '—';
    var h = Math.floor(ms / 3600000);
    var m = Math.floor((ms % 3600000) / 60000);
    var parts = [];
    if (h) parts.push(h + ' hour' + (h === 1 ? '' : 's'));
    if (m) parts.push(m + ' minute' + (m === 1 ? '' : 's'));
    return parts.join(', ') || '—';
  }

  function isCurrent(a) {
    var start = new Date(a.start);
    var end = new Date(a.end);
    return DEMO_NOW >= start && DEMO_NOW <= end;
  }

  function render() {
    var root = document.getElementById('assignment-detail-content');
    if (!root) return;
    var id = getId();
    var a = id ? data.getById(id) : null;
    if (!a) {
      window.location.href = 'vehicle-assignments';
      return;
    }

    var v = vehicles.getById(a.vehicleId);
    var op = data.getOperator(a.operatorId);
    var start = new Date(a.start);
    var end = new Date(a.end);
    var num = a.id.replace('ASN-', '');
    var current = isCurrent(a);

    root.innerHTML =
      '<nav class="assign-detail-breadcrumb" aria-label="Breadcrumb">' +
        '<a href="vehicles">Vehicles</a>' +
        '<span aria-hidden="true">›</span>' +
        (v ? '<a href="vehicle-detail?id=' + encodeURIComponent(v.id) + '">' + escapeHtml(v.name) + '</a>' : '<span>—</span>') +
        '<span aria-hidden="true">›</span>' +
        '<a href="vehicle-assignments">Vehicle Assignments</a>' +
      '</nav>' +
      '<div class="assign-detail-page__header">' +
        '<h1>Vehicle Assignment #' + escapeHtml(num) + '</h1>' +
        '<div class="assign-detail-page__actions">' +
          '<button type="button" class="btn btn-outline btn-sm" id="assign-detail-unwatch">Unwatch</button>' +
          '<button type="button" class="btn btn-outline btn-sm" id="assign-detail-more" aria-label="More">⋯</button>' +
          '<a class="btn btn-outline btn-sm" href="vehicle-assignments?edit=' + encodeURIComponent(a.id) + '" id="assign-detail-edit">Edit</a>' +
        '</div>' +
      '</div>' +
      '<section class="panel assign-detail-panel">' +
        '<div class="panel__header"><h2 class="panel__title">Details</h2></div>' +
        '<div class="panel__body assign-detail-panel__body">' +
          detailRow('Operator', op ? (
            '<span class="assign-detail-operator-row">' +
              '<span class="assign-picker__avatar">' + escapeHtml(op.initials) + '</span>' +
              '<a href="#">' + escapeHtml(op.name) + '</a>' +
              (current ? '<span class="badge badge--success">Current</span>' : '') +
            '</span>'
          ) : '—') +
          detailRow('Start Date/Time', formatDateTime(start)) +
          detailRow('End Date/Time', formatDateTime(end)) +
          detailRow('Duration', formatDuration(end - start)) +
          detailRow('Start Meter', a.startOdometer != null ? a.startOdometer + ' km' : '—') +
          detailRow('End Meter', a.endOdometer != null ? a.endOdometer + ' km' : '—') +
          detailRow('Distance', (a.startOdometer != null && a.endOdometer != null)
            ? (a.endOdometer - a.startOdometer).toFixed(1) + ' km' : '—') +
          (a.comment ? detailRow('Comment', escapeHtml(a.comment)) : '') +
        '</div>' +
      '</section>';
  }

  function detailRow(label, value) {
    return '<div class="assign-detail-page-row">' +
      '<span class="assign-detail-page-row__label">' + escapeHtml(label) + '</span>' +
      '<span class="assign-detail-page-row__value">' + value + '</span>' +
    '</div>';
  }

  if (document.body.getAttribute('data-subpage') === 'assignment-detail') {
    render();
  }
})();
