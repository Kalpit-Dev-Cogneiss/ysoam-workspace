(function () {
  'use strict';

  if (document.body.getAttribute('data-page') !== 'driver') return;

  var data = window.YSOAM_ALERTS;
  var DRIVER_VEHICLE = 'MH-12-AB-1234';

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function render() {
    var panel = document.getElementById('driver-alerts-panel');
    if (!panel || !data) return;

    var rows = data.list.filter(function (r) {
      return r.vehicleId === DRIVER_VEHICLE;
    }).slice(0, 8);

    if (!rows.length) {
      panel.innerHTML = '<div class="card driver-card"><p>No alerts for your vehicle.</p></div>';
      return;
    }

    panel.innerHTML = rows.map(function (row) {
      var unreadClass = row.read ? '' : ' driver-alert-card--unread';
      return (
        '<a class="card driver-card driver-alert-card' + unreadClass + '" href="alert-view?id=' + encodeURIComponent(row.id) + '">' +
          '<div class="driver-alert-card__head">' +
            '<span class="alerts-severity alerts-severity--' + esc(row.severity) + '">' + esc(row.severityLabel) + '</span>' +
            '<span class="driver-alert-card__time">' + esc(row.triggeredLabel) + '</span>' +
          '</div>' +
          '<div class="driver-alert-card__title">' + esc(row.title) + '</div>' +
          '<div class="driver-alert-card__meta">' + esc(row.typeLabel) + ' · ' + esc(row.summary) + '</div>' +
        '</a>'
      );
    }).join('') +
      '<a class="btn btn-outline" href="alerts.html" style="width:100%;min-height:44px;display:flex;align-items:center;justify-content:center;">View All Alerts</a>';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
