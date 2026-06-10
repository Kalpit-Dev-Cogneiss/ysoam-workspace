(function () {
  var tripsData = window.YSOAM_TRIPS;
  var icons = window.YSOAM_ICONS;
  if (!tripsData) return;

  function statusBadge(trip) {
    var badge = tripsData.statusBadge[trip.status] || 'badge-idle';
    var label = tripsData.statusLabels[trip.status] || trip.status;
    return '<span class="badge ' + badge + '">' + label + '</span>';
  }

  function renderTable() {
    var tbody = document.getElementById('trips-table-body');
    if (!tbody) return;

    tbody.innerHTML = tripsData.trips.map(function (trip) {
      return (
        '<tr data-trip-id="' + trip.id + '">' +
          '<td class="tabular-nums"><strong>' + trip.id + '</strong></td>' +
          '<td><a href="gps.html">' + trip.vehicleId + '</a></td>' +
          '<td>' + trip.driver + '</td>' +
          '<td>' + trip.customer + '</td>' +
          '<td>' + statusBadge(trip) + '</td>' +
          '<td class="tabular-nums">' + trip.startAt + '</td>' +
          '<td class="tabular-nums">' + (trip.endAt || '—') + '</td>' +
          '<td class="tabular-nums">' + (trip.distance ? trip.distance + ' km' : '—') + '</td>' +
          '<td class="data-table__actions">' +
            '<a class="trip-detail-btn" href="trip-detail.html?id=' + encodeURIComponent(trip.id) + '" aria-label="View trip details for ' + trip.id + '">' +
              (icons && icons.detail ? icons.detail : 'Detail') +
            '</a>' +
          '</td>' +
        '</tr>'
      );
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', renderTable);
})();
