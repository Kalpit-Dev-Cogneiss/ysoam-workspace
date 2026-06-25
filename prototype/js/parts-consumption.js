(function () {
  'use strict';

  if (document.body.getAttribute('data-subpage') !== 'parts-consumption') return;

  var data = window.YSOAM_PART_OUTWARD;

  var state = {
    period: 'last30',
    category: ''
  };

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }

  function queryOpts() {
    var range = data.periodRange(state.period);
    return {
      start: range.start,
      end: range.end,
      category: state.category || null
    };
  }

  function renderKpis(vehicleRows, categoryRows) {
    var totalCost = vehicleRows.reduce(function (sum, r) { return sum + r.totalCost; }, 0);
    var totalIssues = vehicleRows.reduce(function (sum, r) { return sum + r.issueCount; }, 0);
    var top = vehicleRows[0];

    document.getElementById('parts-consumption-kpis').innerHTML =
      '<article class="parts-consumption-kpi">' +
        '<span class="parts-consumption-kpi__label">Total Parts Cost</span>' +
        '<span class="parts-consumption-kpi__value tabular-nums">' + esc(data.formatMoney(totalCost)) + '</span>' +
      '</article>' +
      '<article class="parts-consumption-kpi">' +
        '<span class="parts-consumption-kpi__label">Issues Recorded</span>' +
        '<span class="parts-consumption-kpi__value tabular-nums">' + esc(totalIssues) + '</span>' +
      '</article>' +
      '<article class="parts-consumption-kpi">' +
        '<span class="parts-consumption-kpi__label">Vehicles with Usage</span>' +
        '<span class="parts-consumption-kpi__value tabular-nums">' + esc(vehicleRows.length) + '</span>' +
      '</article>' +
      '<article class="parts-consumption-kpi parts-consumption-kpi--highlight">' +
        '<span class="parts-consumption-kpi__label">Highest Consumer</span>' +
        '<span class="parts-consumption-kpi__value">' + esc(top ? top.vehicleName : '—') + '</span>' +
        '<span class="parts-consumption-kpi__meta tabular-nums">' +
          (top ? esc(data.formatMoney(top.totalCost)) + ' · ' + esc(top.topCategory) : '') +
        '</span>' +
      '</article>';
  }

  function renderVehicleTable(vehicleRows, totalCost) {
    var html =
      '<table class="data-table data-table--list data-table--parts-consumption">' +
      '<thead><tr>' +
      '<th>Vehicle</th><th class="tabular-nums">Issues</th><th class="tabular-nums">Qty</th>' +
      '<th class="tabular-nums">Total Cost</th><th>Top Category</th><th class="tabular-nums">% of Total</th>' +
      '</tr></thead><tbody>';

    if (!vehicleRows.length) {
      html += '<tr><td colspan="6" class="data-table__empty">No consumption in this period.</td></tr>';
    } else {
      vehicleRows.slice(0, 12).forEach(function (row, idx) {
        var pct = totalCost > 0 ? Math.round((row.totalCost / totalCost) * 1000) / 10 : 0;
        html +=
          '<tr>' +
          '<td><div class="parts-consumption-vehicle">' +
            '<span class="parts-consumption-rank">' + (idx + 1) + '</span>' +
            '<div><a href="vehicle-detail.html?id=' + escA(row.vehicleId) + '" class="table-cell-link">' +
              esc(row.vehicleName) + '</a>' +
              '<div class="parts-consumption-plate">' + esc(row.vehicleId) + '</div></div>' +
          '</div></td>' +
          '<td class="tabular-nums">' + esc(row.issueCount) + '</td>' +
          '<td class="tabular-nums">' + esc(row.quantity) + '</td>' +
          '<td class="tabular-nums"><strong>' + esc(data.formatMoney(row.totalCost)) + '</strong></td>' +
          '<td>' + esc(row.topCategory || '—') + '</td>' +
          '<td class="tabular-nums">' + esc(pct) + '%</td>' +
          '</tr>';
      });
    }

    html += '</tbody></table>';
    document.getElementById('parts-consumption-vehicles').innerHTML = html;
  }

  function renderCategoryBars(categoryRows) {
    if (!categoryRows.length) {
      document.getElementById('parts-consumption-categories').innerHTML =
        '<p class="parts-consumption-empty">No category breakdown for this period.</p>';
      return;
    }

    var max = categoryRows[0].totalCost || 1;
    var html = '';
    categoryRows.forEach(function (row) {
      var width = Math.max(6, Math.round((row.totalCost / max) * 100));
      html +=
        '<div class="parts-consumption-bar-row">' +
          '<div class="parts-consumption-bar-meta">' +
            '<span class="parts-consumption-bar-label">' + esc(row.categoryLabel) + '</span>' +
            '<span class="parts-consumption-bar-value tabular-nums">' +
              esc(data.formatMoney(row.totalCost)) + ' · ' + esc(row.sharePct) + '%' +
            '</span>' +
          '</div>' +
          '<div class="parts-consumption-bar-track">' +
            '<div class="parts-consumption-bar-fill" style="width:' + width + '%"></div>' +
          '</div>' +
        '</div>';
    });
    document.getElementById('parts-consumption-categories').innerHTML = html;
  }

  function render() {
    var opts = queryOpts();
    var vehicleRows = data.aggregateByVehicle(opts);
    var categoryRows = data.aggregateByCategory(opts);
    var totalCost = vehicleRows.reduce(function (sum, r) { return sum + r.totalCost; }, 0);

    renderKpis(vehicleRows, categoryRows);
    renderVehicleTable(vehicleRows, totalCost);
    renderCategoryBars(categoryRows);
  }

  function fillCategorySelect() {
    var sel = document.getElementById('parts-consumption-category');
    data.categoryOptions().forEach(function (cat) {
      var opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.label;
      sel.appendChild(opt);
    });
  }

  function bindEvents() {
    document.querySelectorAll('.parts-consumption-period__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.parts-consumption-period__btn').forEach(function (b) {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        state.period = btn.getAttribute('data-period');
        render();
      });
    });

    document.getElementById('parts-consumption-category').addEventListener('change', function (e) {
      state.category = e.target.value;
      render();
    });
  }

  function init() {
    fillCategorySelect();
    bindEvents();
    render();
    initLucide(document.body);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
