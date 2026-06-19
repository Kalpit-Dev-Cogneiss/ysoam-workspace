(function () {
  'use strict';

  var data = window.YSOAM_SERVICE_HISTORY;
  var vehicles = window.YSOAM_VEHICLES;

  function getId() {
    var params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, '&quot;');
  }

  function icon(key) {
    var icons = window.YSOAM_ICONS;
    return icons && icons[key] ? icons[key] : '';
  }

  function formatMoney(n) {
    return '₹ ' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function findVehicle(id) {
    if (!vehicles || !vehicles.list) return null;
    return vehicles.list.find(function (v) { return v.id === id; }) || null;
  }

  function detailRow(label, value) {
    return '<div class="assign-detail-page-row">' +
      '<span class="assign-detail-page-row__label">' + escapeHtml(label) + '</span>' +
      '<span class="assign-detail-page-row__value">' + value + '</span>' +
    '</div>';
  }

  function lineItemRow(item) {
    return '<tr>' +
      '<td class="service-detail-line-item__name">' +
        '<div class="service-detail-line-item__title">' + escapeHtml(item.name) + '</div>' +
        '<div class="service-detail-line-item__meta">Reason for Repair: ' + escapeHtml(item.reason) + '</div>' +
        '<div class="service-detail-line-item__meta">Category / System / Assembly: ' +
          escapeHtml(item.category) + ' / ' + escapeHtml(item.system) + ' / ' + escapeHtml(item.assembly) +
        '</div>' +
      '</td>' +
      '<td class="tabular-nums">' + formatMoney(item.labor) + '</td>' +
      '<td class="tabular-nums">' + formatMoney(item.parts) + '</td>' +
      '<td class="tabular-nums service-detail-line-item__subtotal">' + formatMoney(item.subtotal) + '</td>' +
    '</tr>';
  }

  function moreMenu(row) {
    return (
      '<div class="row-actions" data-sd-more>' +
        '<button type="button" class="row-actions__trigger" aria-label="More actions" aria-haspopup="menu" aria-expanded="false">' +
          '<span class="row-actions__dots" aria-hidden="true"></span>' +
        '</button>' +
        '<div class="row-actions__menu row-actions__menu--wide" role="menu" hidden>' +
          '<a class="row-actions__item" href="service-detail?id=' + encodeURIComponent(row.id) + '" role="menuitem">View <span class="row-actions__item-icon">' + icon('actionView') + '</span></a>' +
          '<span class="row-actions__item row-actions__item--disabled" role="menuitem" aria-disabled="true">Edit <span class="row-actions__item-icon">' + icon('actionLock') + '</span></span>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-sd-print role="menuitem">Print PDF <span class="row-actions__item-icon">' + icon('actionPrint') + '</span></button>' +
          '<span class="row-actions__item row-actions__item--disabled" role="menuitem" aria-disabled="true">Delete <span class="row-actions__item-icon">' + icon('actionLock') + '</span></span>' +
        '</div>' +
      '</div>'
    );
  }

  function closeMoreMenu() {
    var menu = document.querySelector('[data-sd-more] .row-actions__menu');
    var trigger = document.querySelector('[data-sd-more] .row-actions__trigger');
    if (menu) menu.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function bindHeaderActions() {
    var moreWrap = document.querySelector('[data-sd-more]');
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
      var printBtn = moreWrap.querySelector('[data-sd-print]');
      if (printBtn) {
        printBtn.addEventListener('click', function () {
          closeMoreMenu();
          window.alert('Print PDF (prototype demo).');
        });
      }
    }

    document.getElementById('sd-ai-dismiss') && document.getElementById('sd-ai-dismiss').addEventListener('click', function () {
      var banner = document.getElementById('sd-ai-banner');
      if (banner) banner.hidden = true;
    });

    document.getElementById('sd-watch-btn') && document.getElementById('sd-watch-btn').addEventListener('click', function () {
      window.alert('Watching service entry (prototype demo).');
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('[data-sd-more]')) closeMoreMenu();
    });
  }

  function render() {
    var root = document.getElementById('service-detail-root');
    if (!root) return;

    var id = getId();
    var row = id ? data.getById(id) : null;
    if (!row) {
      window.location.href = 'service-history';
      return;
    }

    var v = findVehicle(row.vehicleId);
    var items = row.lineItems || [];
    var laborTotal = items.reduce(function (s, it) { return s + it.labor; }, 0);
    var partsTotal = items.reduce(function (s, it) { return s + it.parts; }, 0);
    var sample = row.isSample ? '<span class="service-sample-tag">Sample</span>' : '';
    var vehicleHtml = v ? (
      '<span class="assign-detail-vehicle service-detail-vehicle">' +
        '<img src="' + escapeAttr(v.image) + '" alt="">' +
        '<span class="service-detail-vehicle__text">' +
          '<a href="vehicle-detail?id=' + encodeURIComponent(v.id) + '#service-history" class="table-cell-link">' + escapeHtml(v.name) + '</a>' +
          sample +
        '</span>' +
      '</span>'
    ) : escapeHtml(row.vehicleId);

    var priorityHtml = '<span class="data-table__status-dot" style="background:' + row.priority.dot + '"></span>' +
      escapeHtml(row.priority.label);

    var startHtml = escapeHtml(data.formatDateTime(new Date(row.startedAt)));
    var endHtml = escapeHtml(data.formatDateTime(new Date(row.completedAt)));
    var workOrderHtml = '<span class="data-table__status-dot" style="background:#16A34A"></span>' +
      '<a href="#" class="table-cell-link">' + escapeHtml(row.workOrder) + '</a>';

    root.innerHTML =
      '<nav class="assign-detail-breadcrumb" aria-label="Breadcrumb">' +
        '<a href="service-history">← Service Entries</a>' +
      '</nav>' +
      '<div class="assign-detail-page__header">' +
        '<h1>Service Entry #' + escapeHtml(row.entryNumber || row.id.replace('SH-', '')) + '</h1>' +
        '<div class="assign-detail-page__actions service-detail-page__actions">' +
          '<span class="expense-watcher-avatar" aria-hidden="true">DM</span>' +
          '<button type="button" class="btn btn-outline btn-sm" id="sd-watch-btn">Watch</button>' +
          moreMenu(row) +
          '<button type="button" class="btn btn-outline btn-sm" disabled>Edit</button>' +
        '</div>' +
      '</div>' +
      '<div class="trip-detail-grid trip-detail-grid--service">' +
        '<div class="service-detail-col">' +
          '<section class="panel">' +
            '<div class="panel__header service-detail-panel__header">' +
              '<h2 class="panel__title">Details</h2>' +
              '<button type="button" class="service-detail-fields-toggle">All Fields <span aria-hidden="true">▾</span></button>' +
            '</div>' +
            '<div class="panel__body assign-detail-panel__body">' +
              detailRow('Vehicle', vehicleHtml) +
              detailRow('Repair Priority Class', priorityHtml) +
              detailRow('Start Date', startHtml) +
              detailRow('Completion Date', endHtml) +
              detailRow('Duration', escapeHtml(data.formatDuration(row.startedAt, row.completedAt))) +
              detailRow('Odometer', escapeHtml(row.meter)) +
              detailRow('Work Order', workOrderHtml) +
              detailRow('Created By', row.createdBy ? escapeHtml(row.createdBy) : '—') +
              detailRow('Vendor', row.vendor ? escapeHtml(row.vendor) : '—') +
              detailRow('Reference', row.reference ? escapeHtml(row.reference) : '—') +
              detailRow('Notes', row.notes ? escapeHtml(row.notes) : '—') +
            '</div>' +
          '</section>' +
          '<section class="panel">' +
            '<div class="panel__header"><h2 class="panel__title">Resolved Issues</h2></div>' +
            '<div class="panel__body service-detail-issues-empty">' +
              '<div class="service-detail-issues-empty__icon" aria-hidden="true">📝</div>' +
              '<p class="service-detail-issues-empty__title">No issues to show</p>' +
              '<p class="service-detail-issues-empty__text">If this service entry resolves any issues, you can add them by editing the service entry.</p>' +
            '</div>' +
          '</section>' +
        '</div>' +
        '<div class="service-detail-col">' +
          '<section class="service-detail-ai-banner" id="sd-ai-banner">' +
            '<div class="service-detail-ai-banner__icon" aria-hidden="true">✦</div>' +
            '<div class="service-detail-ai-banner__content">' +
              '<div class="service-detail-ai-banner__title">AI Service Advisor <span class="service-detail-ai-banner__beta">Beta</span></div>' +
              '<p class="service-detail-ai-banner__text">Smart assessments use AI to help you understand service quality and cost. Enable to see insights on this entry.</p>' +
              '<div class="service-detail-ai-banner__actions">' +
                '<button type="button" class="btn btn-primary btn-sm">Enable Smart Assessments</button>' +
                '<button type="button" class="btn btn-text btn-sm" id="sd-ai-dismiss">Dismiss</button>' +
              '</div>' +
            '</div>' +
          '</section>' +
          '<section class="panel">' +
            '<div class="panel__header"><h2 class="panel__title">Line Items</h2></div>' +
            '<div class="service-detail-line-summary">' +
              '<div class="service-detail-line-summary__stat"><span class="service-detail-line-summary__label">Labor</span><span class="service-detail-line-summary__value tabular-nums">' + formatMoney(laborTotal) + '</span></div>' +
              '<div class="service-detail-line-summary__stat"><span class="service-detail-line-summary__label">Parts</span><span class="service-detail-line-summary__value tabular-nums">' + formatMoney(partsTotal) + '</span></div>' +
              '<div class="service-detail-line-summary__stat"><span class="service-detail-line-summary__label">Total</span><span class="service-detail-line-summary__value tabular-nums">' + formatMoney(row.total) + '</span></div>' +
            '</div>' +
            '<div class="service-detail-line-table-wrap">' +
              '<table class="service-detail-line-table">' +
                '<thead><tr>' +
                  '<th>Item</th><th>Labor</th><th>Parts</th><th>Subtotal</th>' +
                '</tr></thead>' +
                '<tbody>' + items.map(lineItemRow).join('') + '</tbody>' +
              '</table>' +
            '</div>' +
            '<div class="service-detail-line-totals">' +
              '<div class="service-detail-line-totals__row"><span>Subtotal</span><span class="tabular-nums">+ ' + formatMoney(row.total) + '</span></div>' +
              '<div class="service-detail-line-totals__row"><span>Labor</span><span class="tabular-nums">' + formatMoney(laborTotal) + '</span></div>' +
              '<div class="service-detail-line-totals__row"><span>Parts</span><span class="tabular-nums">' + formatMoney(partsTotal) + '</span></div>' +
              '<div class="service-detail-line-totals__row service-detail-line-totals__row--muted"><span>Discount (0.0%)</span><span>—</span></div>' +
              '<div class="service-detail-line-totals__row service-detail-line-totals__row--muted"><span>Tax (null%)</span><span>+</span></div>' +
              '<div class="service-detail-line-totals__row service-detail-line-totals__row--grand"><span>Total</span><span class="tabular-nums">' + formatMoney(row.total) + '</span></div>' +
            '</div>' +
          '</section>' +
        '</div>' +
      '</div>' +
      '<p class="service-detail-created">' + escapeHtml(data.formatRelativeCreated(row.createdAt)) + '</p>';

    document.title = 'Service Entry #' + (row.entryNumber || row.id) + ' — YSOAM';
    bindHeaderActions();
  }

  if (document.body.getAttribute('data-subpage') === 'service-detail') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', render);
    } else {
      render();
    }
  }
})();
