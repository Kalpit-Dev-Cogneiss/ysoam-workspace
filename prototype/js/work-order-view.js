(function () {
  'use strict';

  var data = window.YSOAM_WORK_ORDERS;
  var vehicles = window.YSOAM_VEHICLES;

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

  function formatMoney(n) {
    return '₹ ' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function findVehicle(id) {
    return (vehicles.list || []).find(function (v) { return v.id === id; }) || null;
  }

  function detailRow(label, value) {
    return '<div class="assign-detail-page-row">' +
      '<span class="assign-detail-page-row__label">' + esc(label) + '</span>' +
      '<span class="assign-detail-page-row__value">' + value + '</span>' +
    '</div>';
  }

  function dash(val) {
    return val ? esc(val) : '—';
  }

  function dateVal(iso) {
    return iso ? '<span class="wo-detail-date">' + esc(data.formatDateTime(new Date(iso))) + '</span>' : '—';
  }

  function statusHtml(status, withHistory) {
    var html = '<span class="wo-detail-status">' +
      '<span class="data-table__status-dot" style="background:' + status.dot + '"></span>' +
      esc(status.label);
    if (withHistory) {
      html += ' <button type="button" class="wo-detail-status-history" aria-label="Status history">' + lucide('history', 14) + '</button>';
    }
    html += '</span>';
    return html;
  }

  function lineItemRow(item) {
    return '<tr>' +
      '<td class="service-detail-line-item__name">' +
        '<div class="service-detail-line-item__title">' +
          '<span class="wo-detail-line-item__icon" aria-hidden="true">' + lucide('fileText', 14) + '</span>' +
          esc(item.name) +
        '</div>' +
        '<div class="service-detail-line-item__meta">Reason for Repair: ' + esc(item.reason) + '</div>' +
        '<div class="service-detail-line-item__meta">Category / System / Assembly: ' +
          esc(item.category) + ' / ' + esc(item.system) + ' / ' + esc(item.assembly) +
        '</div>' +
      '</td>' +
      '<td class="tabular-nums">' + formatMoney(item.labor) + '</td>' +
      '<td class="tabular-nums">' + formatMoney(item.parts) + '</td>' +
      '<td class="tabular-nums service-detail-line-item__subtotal">' + formatMoney(item.subtotal) + '</td>' +
    '</tr>';
  }

  function moreMenu(row) {
    var editUrl = 'work-order-form?id=' + encodeURIComponent(row.id);
    return (
      '<div class="row-actions" data-wo-more>' +
        '<button type="button" class="row-actions__trigger" aria-label="More actions" aria-haspopup="menu" aria-expanded="false">' +
          lucide('moreHorizontal', 16) +
        '</button>' +
        '<div class="row-actions__menu row-actions__menu--wide" role="menu" hidden>' +
          '<a class="row-actions__item" href="' + editUrl + '" role="menuitem">Edit <span class="row-actions__item-icon">' + lucide('pencil') + '</span></a>' +
          '<span class="row-actions__item row-actions__item--disabled" role="menuitem" aria-disabled="true">Merge <span class="row-actions__item-icon">' + lucide('lock') + '</span></span>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-wo-archive role="menuitem">Archive <span class="row-actions__item-icon">' + lucide('archive') + '</span></button>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-wo-history role="menuitem">View Record History <span class="row-actions__item-icon">' + lucide('history') + '</span></button>' +
        '</div>' +
      '</div>'
    );
  }

  function closeMoreMenu() {
    var menu = document.querySelector('[data-wo-more] .row-actions__menu');
    var trigger = document.querySelector('[data-wo-more] .row-actions__trigger');
    if (menu) {
      menu.hidden = true;
      menu.style.position = '';
      menu.style.top = '';
      menu.style.left = '';
    }
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function bindHeaderActions(row) {
    var moreWrap = document.querySelector('[data-wo-more]');
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
            menu.style.left = Math.max(8, rect.right - 220) + 'px';
            menu.style.zIndex = '120';
            trigger.setAttribute('aria-expanded', 'true');
          }
        });
      }
      moreWrap.querySelector('[data-wo-archive]') && moreWrap.querySelector('[data-wo-archive]').addEventListener('click', function () {
        closeMoreMenu();
        window.alert('Archive work order (prototype demo).');
      });
      moreWrap.querySelector('[data-wo-history]') && moreWrap.querySelector('[data-wo-history]').addEventListener('click', function () {
        closeMoreMenu();
        window.alert('View record history (prototype demo).');
      });
    }

    document.getElementById('wov-watch-btn') && document.getElementById('wov-watch-btn').addEventListener('click', function () {
      window.alert('Watching work order (prototype demo).');
    });

    document.getElementById('wov-edit-btn') && document.getElementById('wov-edit-btn').addEventListener('click', function () {
      window.location.href = 'work-order-form?id=' + encodeURIComponent(row.id);
    });

    document.getElementById('wov-labels-btn') && document.getElementById('wov-labels-btn').addEventListener('click', function () {
      window.alert('Edit labels (prototype demo).');
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('[data-wo-more]')) closeMoreMenu();
    });
  }

  function render() {
    var root = document.getElementById('work-order-view-root');
    if (!root) return;

    var row = data.getById(getId());
    if (!row) {
      window.location.href = 'work-orders';
      return;
    }

    var v = findVehicle(row.vehicleId);
    var items = row.lineItems || [];
    var laborTotal = items.reduce(function (s, it) { return s + it.labor; }, 0);
    var partsTotal = items.reduce(function (s, it) { return s + it.parts; }, 0);
    var total = row.total || laborTotal + partsTotal;
    var sample = row.isSample ? '<span class="service-sample-tag">Sample</span>' : '';

    var vehicleHtml = v ? (
      '<span class="assign-detail-vehicle service-detail-vehicle">' +
        '<img src="' + escA(v.image) + '" alt="">' +
        '<span class="service-detail-vehicle__text">' +
          '<a href="vehicle-detail?id=' + encodeURIComponent(v.id) + '#service-history" class="table-cell-link">' + esc(v.name) + '</a>' +
          sample +
        '</span>' +
      '</span>'
    ) : esc(row.vehicleId);

    var serviceEntryHtml = row.serviceEntryId
      ? '<a href="service-detail?id=' + encodeURIComponent(row.serviceEntryId) + '" class="table-cell-link">#' + esc(row.serviceEntryNumber) + '</a>'
      : (row.serviceEntryNumber ? '#' + esc(row.serviceEntryNumber) : '—');

    var durationHtml = row.actualStartDate && row.actualCompletionDate
      ? esc(data.formatDuration(row.actualStartDate, row.actualCompletionDate))
      : '—';

    var lineItemsBody = items.length
      ? items.map(lineItemRow).join('')
      : '<tr><td colspan="4" class="service-history-empty">No line items</td></tr>';

    var statusPillStyle = row.status.id === 'completed'
      ? 'border-color:#86efac;background:#f0fdf4;color:#166534'
      : row.status.id === 'pending'
        ? 'border-color:#fcd34d;background:#fffbeb;color:#92400e'
        : 'border-color:#93c5fd;background:#eff6ff;color:#1d4ed8';

    root.innerHTML =
      '<nav class="assign-detail-breadcrumb" aria-label="Breadcrumb">' +
        '<a href="work-orders">← Work Orders</a>' +
      '</nav>' +
      '<div class="assign-detail-page__header work-order-view__header">' +
        '<div class="work-order-view__title-block">' +
          '<h1>Work Order #' + esc(row.number) + '</h1>' +
          '<button type="button" class="wo-detail-labels-link" id="wov-labels-btn">Edit Labels</button>' +
        '</div>' +
        '<div class="assign-detail-page__actions work-order-view__actions">' +
          '<button type="button" class="wo-detail-icon-btn" aria-label="Add watcher">' + lucide('userPlus', 18) + '</button>' +
          '<button type="button" class="btn btn-outline btn-sm wo-detail-watch-btn" id="wov-watch-btn">' +
            '<span data-wo-icon="bell" data-wo-icon-size="14"></span> Watch' +
          '</button>' +
          moreMenu(row) +
          '<button type="button" class="wo-status-pill" style="' + statusPillStyle + '" aria-haspopup="listbox" aria-expanded="false">' +
            '<span class="data-table__status-dot" style="background:' + row.status.dot + '"></span>' +
            esc(row.status.label) +
            '<span class="wo-status-pill__chevron">' + lucide('chevronDown', 14) + '</span>' +
          '</button>' +
          '<button type="button" class="btn btn-outline btn-sm wo-detail-edit-btn" id="wov-edit-btn">' +
            '<span data-wo-icon="pencil" data-wo-icon-size="14"></span> Edit' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="trip-detail-grid trip-detail-grid--service">' +
        '<div class="service-detail-col">' +
          '<section class="panel">' +
            '<div class="panel__header service-detail-panel__header">' +
              '<h2 class="panel__title">Details</h2>' +
              '<button type="button" class="service-detail-fields-toggle">All Fields <span data-lucide-icon="chevronDown" data-lucide-icon-size="14" aria-hidden="true"></span></button>' +
            '</div>' +
            '<div class="panel__body assign-detail-panel__body">' +
              detailRow('Vehicle', vehicleHtml) +
              detailRow('Status', statusHtml(row.status, true)) +
              detailRow('Repair Priority Class', '<span class="data-table__status-dot" style="background:' + row.priority.dot + '"></span> ' + esc(row.priority.label)) +
              detailRow('Service Entry', serviceEntryHtml) +
              detailRow('Issue Date', dateVal(row.issueDate)) +
              detailRow('Scheduled Start Date', dateVal(row.scheduledStart)) +
              detailRow('Scheduled Completion Date', dateVal(row.scheduledCompletionDate)) +
              detailRow('Actual Start Date', dateVal(row.actualStartDate)) +
              detailRow('Actual Completion Date', dateVal(row.actualCompletionDate)) +
              detailRow('Duration', durationHtml) +
              detailRow('Assigned To', dash(row.assignedTo)) +
              detailRow('Description', dash(row.description)) +
              detailRow('Vendor', dash(row.vendor)) +
              detailRow('Invoice Number', dash(row.invoiceNumber)) +
              detailRow('Purchase Order Number', dash(row.purchaseOrder)) +
              detailRow('Watchers', dash(row.watchers)) +
            '</div>' +
          '</section>' +
          '<section class="panel">' +
            '<div class="panel__header"><h2 class="panel__title">Resolved Issues</h2></div>' +
            '<div class="panel__body service-detail-issues-empty">' +
              '<div class="service-detail-issues-empty__icon wo-detail-issues-icon" aria-hidden="true"></div>' +
              '<p class="service-detail-issues-empty__title">No issues to show</p>' +
              '<p class="service-detail-issues-empty__text">If this work order resolves any issues, you can add them by editing the work order.</p>' +
            '</div>' +
          '</section>' +
        '</div>' +
        '<div class="service-detail-col">' +
          '<section class="panel">' +
            '<div class="panel__header"><h2 class="panel__title">Line Items</h2></div>' +
            '<div class="service-detail-line-summary">' +
              '<div class="service-detail-line-summary__stat"><span class="service-detail-line-summary__label">Labor</span><span class="service-detail-line-summary__value tabular-nums">' + formatMoney(laborTotal) + '</span></div>' +
              '<div class="service-detail-line-summary__stat"><span class="service-detail-line-summary__label">Parts</span><span class="service-detail-line-summary__value tabular-nums">' + formatMoney(partsTotal) + '</span></div>' +
              '<div class="service-detail-line-summary__stat"><span class="service-detail-line-summary__label">Total</span><span class="service-detail-line-summary__value tabular-nums">' + formatMoney(total) + '</span></div>' +
            '</div>' +
            '<div class="service-detail-line-table-wrap">' +
              '<table class="service-detail-line-table">' +
                '<thead><tr><th>Item</th><th>Labor</th><th>Parts</th><th>Subtotal</th></tr></thead>' +
                '<tbody>' + lineItemsBody + '</tbody>' +
              '</table>' +
            '</div>' +
            '<div class="service-detail-line-totals">' +
              '<div class="service-detail-line-totals__row"><span>Subtotal</span><span class="tabular-nums">+ ' + formatMoney(total) + '</span></div>' +
              '<div class="service-detail-line-totals__row"><span>Labor</span><span class="tabular-nums">' + formatMoney(laborTotal) + '</span></div>' +
              '<div class="service-detail-line-totals__row"><span>Parts</span><span class="tabular-nums">' + formatMoney(partsTotal) + '</span></div>' +
              '<div class="service-detail-line-totals__row service-detail-line-totals__row--muted"><span>Discount (0.0%)</span><span class="tabular-nums">- ' + formatMoney(0) + '</span></div>' +
              '<div class="service-detail-line-totals__row service-detail-line-totals__row--muted"><span>Tax (null%)</span><span class="tabular-nums">+ ' + formatMoney(0) + '</span></div>' +
              '<div class="service-detail-line-totals__row service-detail-line-totals__row--grand"><span>Total</span><span class="tabular-nums">' + formatMoney(total) + '</span></div>' +
            '</div>' +
          '</section>' +
        '</div>' +
      '</div>' +
      '<p class="service-detail-created">' + esc(data.formatRelativeCreated(row.createdAt)) + '</p>';

    document.title = 'Work Order #' + row.number + ' — YSOAM';
    if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root);
    bindHeaderActions(row);
  }

  if (document.body.getAttribute('data-subpage') === 'work-order-view') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
    else render();
  }
})();
