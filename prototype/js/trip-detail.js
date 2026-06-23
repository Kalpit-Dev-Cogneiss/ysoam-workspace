(function () {
  var tripsData = window.YSOAM_TRIPS;
  if (!tripsData) return;

  function getTripIdFromUrl() {
    return new URLSearchParams(window.location.search).get('id');
  }

  function findTrip(id) {
    return tripsData.trips.find(function (t) { return t.id === id; });
  }

  function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '—';
    return '₹' + amount.toLocaleString('en-IN');
  }

  function statusBadge(trip) {
    var badge = tripsData.statusBadge[trip.status] || 'badge-idle';
    var label = tripsData.statusLabels[trip.status] || trip.status;
    return '<span class="badge ' + badge + '">' + label + '</span>';
  }

  function renderStepper(trip) {
    var steps = [
      { key: 'created', label: 'Created' },
      { key: 'dispatched', label: 'Dispatched' },
      { key: 'transit', label: 'In Transit' },
      { key: 'complete', label: 'Complete' }
    ];
    var current = trip.steps[trip.steps.length - 1];
    var html = '<div class="trip-stepper">';

    steps.forEach(function (step, i) {
      if (i > 0) html += '<span class="stepper-arrow">→</span>';
      var done = trip.steps.indexOf(step.key) !== -1;
      var active = step.key === current && trip.status !== 'cancelled';
      var cls = 'stepper-step';
      if (done && step.key !== current) cls += ' stepper-step--complete';
      if (active) cls += ' stepper-step--active';
      if (trip.status === 'cancelled' && step.key === 'created') cls += ' stepper-step--complete';
      html += '<span class="' + cls + '">' + step.label + '</span>';
    });

    html += '</div>';
    return html;
  }

  function renderDetailMeta(label, value) {
    return (
      '<div class="trip-meta-item">' +
        '<div class="trip-meta-item__label">' + label + '</div>' +
        '<div class="trip-meta-item__value">' + value + '</div>' +
      '</div>'
    );
  }

  function renderProfitRow(label, value, isTotal) {
    var cls = isTotal ? ' profit-row--total' : '';
    return '<div class="profit-row' + cls + '"><span>' + label + '</span><span class="tabular-nums">' + value + '</span></div>';
  }

  function showNotFound() {
    var root = document.getElementById('trip-detail-root');
    if (root) {
      root.innerHTML =
        '<div class="panel"><div class="panel__body">' +
          '<p>Trip not found.</p>' +
          '<a class="btn btn-primary btn-sm" href="trips">Back to Trip &amp; Operations</a>' +
        '</div></div>';
    }
    document.title = 'Trip not found — YSOAM Prototype';
  }

  function renderPage(trip) {
    document.title = trip.id + ' — Trip Detail — YSOAM Prototype';

    var title = document.getElementById('trip-detail-title');
    var route = document.getElementById('trip-detail-route');
    var status = document.getElementById('trip-detail-status');
    var stepper = document.getElementById('trip-detail-stepper');
    var meta = document.getElementById('trip-detail-meta');
    var profit = document.getElementById('trip-detail-profit');
    var invoiceLink = document.getElementById('trip-detail-invoice');
    var playbackLink = document.getElementById('trip-playback-link');

    if (title) title.textContent = trip.id;
    if (route) route.textContent = trip.route;
    if (status) status.innerHTML = statusBadge(trip);
    if (stepper) stepper.innerHTML = renderStepper(trip);

    if (playbackLink) {
      playbackLink.href = 'trip-playback?id=' + encodeURIComponent(trip.id);
    }

    if (meta) {
      meta.innerHTML =
        renderDetailMeta('Route', trip.route) +
        renderDetailMeta('Origin', trip.origin) +
        renderDetailMeta('Destination', trip.destination) +
        renderDetailMeta('Vehicle', '<a href="gps.html">' + trip.vehicleId + '</a>') +
        renderDetailMeta('Driver', trip.driver) +
        renderDetailMeta('Customer', trip.customer) +
        renderDetailMeta('Load type', trip.loadType) +
        renderDetailMeta('Started', trip.startAt) +
        renderDetailMeta('Completed', trip.endAt || '—') +
        renderDetailMeta('Distance', trip.distance ? trip.distance + ' km' : '—') +
        renderDetailMeta('Duration', trip.duration) +
        renderDetailMeta('Avg speed', trip.avgSpeed ? trip.avgSpeed + ' km/h' : '—') +
        renderDetailMeta('Stops', String(trip.stops)) +
        renderDetailMeta('Idle time', trip.idleTime) +
        renderDetailMeta('Invoice', trip.invoiceId ? '<a href="billing.html">' + trip.invoiceId + '</a>' : '—');
    }

    if (profit) {
      if (trip.margin !== null && trip.margin !== undefined) {
        var marginCls = trip.margin >= 0 ? 'profit-positive' : 'profit-negative';
        profit.innerHTML =
          '<div class="profit-breakdown">' +
            renderProfitRow('Revenue', formatCurrency(trip.revenue)) +
            renderProfitRow('Fuel', trip.fuel ? '− ' + formatCurrency(trip.fuel) : '—') +
            renderProfitRow('Driver advance', trip.advance ? '− ' + formatCurrency(trip.advance) : '—') +
            renderProfitRow('Maintenance est.', trip.maintenance ? '− ' + formatCurrency(trip.maintenance) : '—') +
            renderProfitRow('Net profit', '<span class="' + marginCls + '">' + formatCurrency(trip.marginAmount) + ' (' + trip.margin + '%)</span>', true) +
          '</div>';
      } else {
        profit.innerHTML = '<p class="trip-detail-empty">Profitability available after trip completion.</p>';
      }
    }

    if (invoiceLink) {
      invoiceLink.style.display = trip.invoiceId ? '' : 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var trip = findTrip(getTripIdFromUrl());
    if (!trip) {
      showNotFound();
      return;
    }
    renderPage(trip);
  });
})();
