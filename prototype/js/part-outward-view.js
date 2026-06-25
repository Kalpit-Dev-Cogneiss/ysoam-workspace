(function () {
  'use strict';

  if (document.body.getAttribute('data-subpage') !== 'part-outward-view') return;

  var data = window.YSOAM_PART_OUTWARD;

  var state = { tab: 'overview' };

  function getId() {
    return new URLSearchParams(window.location.search).get('id');
  }

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function lucide(name, size) { return window.YSOAM_LUCIDE ? window.YSOAM_LUCIDE.icon(name, size || 16) : ''; }
  function rowIcon(key) { return window.YSOAM_ICONS && window.YSOAM_ICONS[key] ? window.YSOAM_ICONS[key] : ''; }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }

  function dash(val) { return val ? esc(val) : '—'; }

  function partThumb(row) {
    return '<span class="parts-thumb parts-thumb--lg" style="--parts-thumb-color:' + escA(row.thumbColor || '#0ea5e9') + '" aria-hidden="true">' +
      lucide('package', 24) + '</span>';
  }

  function detailRow(label, value) {
    return '<div class="assign-detail-page-row">' +
      '<span class="assign-detail-page-row__label">' + esc(label) + '</span>' +
      '<span class="assign-detail-page-row__value">' + value + '</span>' +
    '</div>';
  }

  function historyTable(rows, emptyMsg) {
    if (!rows.length) {
      return '<div class="part-view-empty-state part-view-empty-state--compact"><p>' + esc(emptyMsg) + '</p></div>';
    }
    var html =
      '<table class="data-table data-table--list data-table--po-history">' +
      '<thead><tr><th>Outward #</th><th>Vehicle</th><th>Date</th><th class="tabular-nums">Qty</th><th class="tabular-nums">Total</th><th>Issued By</th></tr></thead><tbody>';
    rows.forEach(function (row) {
      html +=
        '<tr data-history-link="' + escA(row.id) + '" style="cursor:pointer">' +
        '<td><a href="part-outward-view?id=' + escA(row.id) + '" class="table-cell-link">' + esc(row.id) + '</a></td>' +
        '<td><a href="vehicle-detail.html?id=' + escA(row.vehicleId) + '" class="table-cell-link">' + esc(row.vehicleName) + '</a></td>' +
        '<td>' + esc(data.formatDateDisplay(row.issuedOn)) + '</td>' +
        '<td class="tabular-nums">' + esc(row.quantity) + ' ' + esc(row.unitShort || '') + '</td>' +
        '<td class="tabular-nums">' + esc(row.totalCostLabel) + '</td>' +
        '<td>' + esc(row.issuedBy) + '</td>' +
        '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  function overviewTab(row) {
    return (
      '<div class="part-view-overview po-view-overview">' +
        '<div class="part-view-overview__col">' +
          '<section class="panel">' +
            '<div class="panel__header service-detail-panel__header"><h2 class="panel__title">Issue Details</h2></div>' +
            '<div class="panel__body assign-detail-panel__body">' +
              detailRow('Outward #', dash(row.id)) +
              detailRow('Issue Date', esc(data.formatDateDisplay(row.issuedOn))) +
              detailRow('Quantity', esc(row.quantity) + ' ' + esc(row.unitLabel)) +
              detailRow('Unit Cost', esc(row.unitCostLabel)) +
              detailRow('Total Cost', '<strong>' + esc(row.totalCostLabel) + '</strong>') +
              detailRow('Work Order', row.workOrder ? '<a href="work-order-view.html" class="table-cell-link">' + esc(row.workOrder) + '</a>' : '—') +
              detailRow('Issued By', dash(row.issuedBy)) +
              detailRow('Notes', dash(row.notes)) +
            '</div>' +
          '</section>' +
        '</div>' +
        '<div class="part-view-overview__col">' +
          '<section class="panel">' +
            '<div class="panel__header"><h2 class="panel__title">Part</h2>' +
            '<a href="part-view?id=' + escA(row.partId) + '" class="btn btn-text btn-sm">View Part</a></div>' +
            '<div class="panel__body assign-detail-panel__body">' +
              detailRow('Part Number', '<a href="part-view?id=' + escA(row.partId) + '" class="table-cell-link">' + esc(row.partNumber) + '</a>') +
              detailRow('Description', dash(row.partDescription)) +
              detailRow('Category', dash(row.categoryLabel)) +
              detailRow('Manufacturer', dash(row.manufacturerLabel)) +
              detailRow('Mfr. Part Number', dash(row.mfrPartNumber)) +
            '</div>' +
          '</section>' +
          '<section class="panel">' +
            '<div class="panel__header"><h2 class="panel__title">Vehicle</h2>' +
            '<a href="vehicle-detail.html?id=' + escA(row.vehicleId) + '" class="btn btn-text btn-sm">View Vehicle</a></div>' +
            '<div class="panel__body assign-detail-panel__body">' +
              detailRow('Vehicle', '<a href="vehicle-detail.html?id=' + escA(row.vehicleId) + '" class="table-cell-link">' + esc(row.vehicleName) + '</a>') +
              detailRow('Plate', dash(row.vehiclePlate)) +
              detailRow('Type', dash(row.vehicleType)) +
              detailRow('Group', dash(row.vehicleGroup)) +
            '</div>' +
          '</section>' +
        '</div>' +
      '</div>'
    );
  }

  function partHistoryTab(row) {
    var history = data.getHistoryForPart(row.partId, row.id);
    return (
      '<section class="panel">' +
        '<div class="panel__header"><h2 class="panel__title">All Vehicles That Used ' + esc(row.partNumber) + '</h2></div>' +
        '<div class="panel__body panel__body--flush">' +
          historyTable(history, 'No other issuances for this part.') +
        '</div>' +
      '</section>'
    );
  }

  function vehicleHistoryTab(row) {
    var history = data.getHistoryForVehicle(row.vehicleId, row.id);
    return (
      '<section class="panel">' +
        '<div class="panel__header"><h2 class="panel__title">Other Parts Issued to ' + esc(row.vehicleName) + '</h2></div>' +
        '<div class="panel__body panel__body--flush">' +
          historyTable(history, 'No other part issuances for this vehicle.') +
        '</div>' +
      '</section>'
    );
  }

  function setTab(tab, row) {
    state.tab = tab;
    var root = document.getElementById('po-view-root');
    root.querySelectorAll('.part-view-tab[data-tab]').forEach(function (btn) {
      var on = btn.getAttribute('data-tab') === tab;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    var content = root.querySelector('#po-view-tab-content');
    if (!content) return;
    if (tab === 'part-history') content.innerHTML = partHistoryTab(row);
    else if (tab === 'vehicle-history') content.innerHTML = vehicleHistoryTab(row);
    else content.innerHTML = overviewTab(row);
    initLucide(content);
    content.querySelectorAll('[data-history-link]').forEach(function (tr) {
      tr.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;
        window.location.href = 'part-outward-view?id=' + encodeURIComponent(tr.getAttribute('data-history-link'));
      });
    });
  }

  function render() {
    var root = document.getElementById('po-view-root');
    var row = data.getById(getId());
    if (!row) {
      window.location.href = 'part-outward';
      return;
    }

    root.innerHTML =
      '<nav class="assign-detail-breadcrumb part-view-breadcrumb" aria-label="Breadcrumb">' +
        '<a href="part-outward">← Part Outward</a>' +
      '</nav>' +
      '<header class="part-view-header po-view-header">' +
        '<div class="part-view-header__main">' +
          partThumb(row) +
          '<div class="part-view-header__text">' +
            '<h1>' + esc(row.id) + '</h1>' +
            '<dl class="part-view-meta-row">' +
              '<div><dt>Part</dt><dd><a href="part-view?id=' + escA(row.partId) + '" class="table-cell-link">' + esc(row.partNumber) + '</a></dd></div>' +
              '<div><dt>Vehicle</dt><dd><a href="vehicle-detail.html?id=' + escA(row.vehicleId) + '" class="table-cell-link">' + esc(row.vehicleName) + '</a></dd></div>' +
              '<div><dt>Issue Date</dt><dd>' + esc(data.formatDateDisplay(row.issuedOn)) + '</dd></div>' +
              '<div><dt>Quantity</dt><dd>' + esc(row.quantity) + ' ' + esc(row.unitShort) + '</dd></div>' +
              '<div><dt>Total Cost</dt><dd>' + esc(row.totalCostLabel) + '</dd></div>' +
            '</dl>' +
          '</div>' +
        '</div>' +
        '<div class="part-view-header__actions">' +
          '<button type="button" class="btn btn-outline btn-sm" id="po-view-edit">' + lucide('pencil', 14) + ' Edit</button>' +
        '</div>' +
      '</header>' +
      '<div class="st-view-tabs part-view-tabs" role="tablist">' +
        '<button type="button" class="st-view-tab is-active part-view-tab" data-tab="overview" role="tab" aria-selected="true">Overview</button>' +
        '<button type="button" class="st-view-tab part-view-tab" data-tab="part-history" role="tab">Part Issuance History</button>' +
        '<button type="button" class="st-view-tab part-view-tab" data-tab="vehicle-history" role="tab">Vehicle Parts History</button>' +
      '</div>' +
      '<div id="po-view-tab-content">' + overviewTab(row) + '</div>';

    document.title = row.id + ' — Part Outward — YSOAM';
    initLucide(root);

    document.getElementById('po-view-edit').onclick = function () {
      window.location.href = 'part-outward-form?id=' + encodeURIComponent(row.id);
    };

    root.querySelectorAll('.part-view-tab[data-tab]').forEach(function (btn) {
      btn.onclick = function () { setTab(btn.getAttribute('data-tab'), row); };
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
