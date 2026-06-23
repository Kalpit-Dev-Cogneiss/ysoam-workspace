(function () {
  'use strict';

  var data = window.YSOAM_PARTS;
  var icons = window.YSOAM_ICONS;

  var state = {
    tab: 'overview',
    woSearch: '',
    woPage: 1,
    woPageSize: 50
  };

  function getId() {
    return new URLSearchParams(window.location.search).get('id');
  }

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function lucide(name, size) { return window.YSOAM_LUCIDE ? window.YSOAM_LUCIDE.icon(name, size || 16) : ''; }
  function rowIcon(key) { return icons && icons[key] ? icons[key] : ''; }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }

  function dash(val) { return val ? esc(val) : '—'; }

  function partThumb(part) {
    return '<span class="parts-thumb parts-thumb--lg" style="--parts-thumb-color:' + escA(part.thumbColor) + '" aria-hidden="true">' +
      lucide('package', 24) + '</span>';
  }

  function detailRow(label, value) {
    return '<div class="assign-detail-page-row">' +
      '<span class="assign-detail-page-row__label">' + esc(label) + '</span>' +
      '<span class="assign-detail-page-row__value">' + value + '</span>' +
    '</div>';
  }

  function moreMenu() {
    return (
      '<div class="row-actions" data-part-view-more>' +
        '<button type="button" class="row-actions__trigger" aria-label="More actions" aria-haspopup="menu" aria-expanded="false">' +
          '<span class="row-actions__dots" aria-hidden="true"></span>' +
        '</button>' +
        '<div class="row-actions__menu" role="menu" hidden>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="archive" role="menuitem">Archive <span class="row-actions__item-icon">' + lucide('archive', 16) + '</span></button>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="duplicate" role="menuitem">Duplicate <span class="row-actions__item-icon">' + lucide('copy', 16) + '</span></button>' +
          '<div class="row-actions__divider" role="separator"></div>' +
          '<button type="button" class="row-actions__item row-actions__item--btn row-actions__item--danger" data-action="delete" role="menuitem">Delete <span class="row-actions__item-icon">' + rowIcon('actionDelete') + '</span></button>' +
        '</div>' +
      '</div>'
    );
  }

  function closeMoreMenu() {
    var menu = document.querySelector('[data-part-view-more] .row-actions__menu');
    var trigger = document.querySelector('[data-part-view-more] .row-actions__trigger');
    if (menu) { menu.hidden = true; menu.style.position = ''; menu.style.top = ''; menu.style.left = ''; }
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function overviewTab(part) {
    return (
      '<div class="part-view-overview">' +
        '<div class="part-view-overview__col">' +
          '<section class="panel">' +
            '<div class="panel__header service-detail-panel__header">' +
              '<h2 class="panel__title">Details</h2>' +
              '<span class="part-view-all-fields">All Fields</span>' +
            '</div>' +
            '<div class="panel__body assign-detail-panel__body">' +
              detailRow('Part Number', dash(part.partNumber)) +
              detailRow('Category', dash(part.categoryLabel)) +
              detailRow('Manufacturer', dash(part.manufacturerLabel)) +
              detailRow('Manufacturer Part Number', dash(part.mfrPartNumber)) +
              detailRow('UPC', dash(part.upc)) +
              detailRow('Description', dash(part.description)) +
              detailRow('Unit Cost', esc(part.unitCostLabel)) +
              detailRow('Measurement Unit', dash(part.unitLabel)) +
            '</div>' +
          '</section>' +
        '</div>' +
        '<div class="part-view-overview__col">' +
          '<section class="panel">' +
            '<div class="panel__header">' +
              '<h2 class="panel__title">Locations</h2>' +
              '<button type="button" class="btn btn-text btn-sm part-view-manage-link">Manage</button>' +
            '</div>' +
            '<div class="panel__body part-view-empty-state">' +
              '<span class="part-view-empty-state__icon" data-lucide-icon="mapPin" data-lucide-icon-size="32" aria-hidden="true"></span>' +
              '<p>This part is not active for any Locations.</p>' +
            '</div>' +
          '</section>' +
        '</div>' +
        '<section class="panel part-view-wo-summary">' +
          '<div class="panel__header">' +
            '<h2 class="panel__title">Work Order Activity</h2>' +
            '<button type="button" class="btn btn-text btn-sm part-view-wo-view-all" data-tab-switch="activity">View All</button>' +
          '</div>' +
          '<div class="panel__body part-view-empty-state part-view-empty-state--compact">' +
            '<span class="part-view-empty-state__icon" data-lucide-icon="clipboardList" data-lucide-icon-size="28" aria-hidden="true"></span>' +
            '<p>This part is not used on any Work Orders.</p>' +
          '</div>' +
        '</section>' +
      '</div>'
    );
  }

  function activityTab() {
    return (
      '<div class="part-view-activity">' +
        '<div class="parts-toolbar part-view-activity-toolbar">' +
          '<div class="parts-toolbar__left">' +
            '<div class="table-panel__search">' +
              '<span class="table-panel__search-icon" data-lucide-icon="search" aria-hidden="true"></span>' +
              '<input type="search" class="table-panel__search-input" id="part-wo-search" placeholder="Search" aria-label="Search work order activity">' +
            '</div>' +
            '<button type="button" class="expense-filter-pill" disabled>Vehicle</button>' +
            '<button type="button" class="expense-filter-pill" disabled>Service Task</button>' +
            '<button type="button" class="expense-filter-pill" disabled>Part Location</button>' +
            '<button type="button" class="btn btn-text btn-sm part-view-more-actions">More Actions <span data-lucide-icon="externalLink" data-lucide-icon-size="14" aria-hidden="true"></span></button>' +
          '</div>' +
          '<div class="parts-toolbar__right">' +
            '<span class="parts-pagination__count tabular-nums">0 – 0 of 0</span>' +
            '<button type="button" class="parts-page-btn" disabled aria-label="Previous page"><span data-lucide-icon="chevronLeft"></span></button>' +
            '<button type="button" class="parts-page-btn" disabled aria-label="Next page"><span data-lucide-icon="chevronRight"></span></button>' +
            '<button type="button" class="parts-page-btn" aria-label="Table settings"><span data-lucide-icon="settings"></span></button>' +
          '</div>' +
        '</div>' +
        '<div class="panel panel--flush part-view-activity-table">' +
          '<table class="data-table data-table--list">' +
            '<thead><tr>' +
              '<th>Vehicle</th><th>Work Order</th><th>Status</th><th>Service Task</th>' +
              '<th>Part Location</th><th>Part Qty</th>' +
              '<th>Added to Work Order <span data-lucide-icon="arrowDown" data-lucide-icon-size="12" aria-hidden="true"></span></th>' +
            '</tr></thead>' +
            '<tbody><tr><td colspan="7" class="part-view-no-results">' +
              '<span class="part-view-no-results__icon" data-lucide-icon="search" data-lucide-icon-size="40" aria-hidden="true"></span>' +
              '<p>No results to show.</p>' +
            '</td></tr></tbody>' +
          '</table>' +
        '</div>' +
      '</div>'
    );
  }

  function bindHeaderActions(part) {
    document.getElementById('part-view-edit').onclick = function () {
      window.location.href = 'part-form?id=' + encodeURIComponent(part.id);
    };

    var moreWrap = document.querySelector('[data-part-view-more]');
    if (moreWrap) {
      var trigger = moreWrap.querySelector('.row-actions__trigger');
      var menu = moreWrap.querySelector('.row-actions__menu');
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
      moreWrap.querySelectorAll('[data-action]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          closeMoreMenu();
          window.alert(btn.textContent.trim() + ' (prototype demo).');
        });
      });
    }

    document.addEventListener('click', function (e) {
      if (!e.target.closest('[data-part-view-more]')) closeMoreMenu();
    });
  }

  function setTab(tab) {
    state.tab = tab;
    var root = document.getElementById('part-view-root');
    if (!root) return;
    var part = data.getById(getId());
    if (!part) return;

    root.querySelectorAll('.part-view-tab[data-tab]').forEach(function (btn) {
      var on = btn.getAttribute('data-tab') === tab;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    var content = root.querySelector('#part-view-tab-content');
    if (content) {
      content.innerHTML = tab === 'activity' ? activityTab() : overviewTab(part);
      initLucide(content);
    }
  }

  function render() {
    var root = document.getElementById('part-view-root');
    if (!root) return;

    var part = data.getById(getId());
    if (!part) {
      window.location.href = 'parts';
      return;
    }

    var costMeta = esc(part.unitCostLabel) + ' / ' + esc(part.unitShort);

    root.innerHTML =
      '<nav class="assign-detail-breadcrumb part-view-breadcrumb" aria-label="Breadcrumb">' +
        '<a href="parts">← Parts</a>' +
      '</nav>' +
      '<header class="part-view-header">' +
        '<div class="part-view-header__main">' +
          partThumb(part) +
          '<div class="part-view-header__text">' +
            '<h1>' + esc(part.partNumber) + '</h1>' +
            '<dl class="part-view-meta-row">' +
              '<div><dt>Category</dt><dd>' + dash(part.categoryLabel) + '</dd></div>' +
              '<div><dt>Manufacturer</dt><dd>' + dash(part.manufacturerLabel) + '</dd></div>' +
              '<div><dt>Mfr. Part Number</dt><dd>' + dash(part.mfrPartNumber) + '</dd></div>' +
              '<div><dt>UPC</dt><dd>' + dash(part.upc) + '</dd></div>' +
              '<div><dt>Unit Cost</dt><dd>' + costMeta + '</dd></div>' +
            '</dl>' +
          '</div>' +
        '</div>' +
        '<div class="part-view-header__actions">' +
          moreMenu() +
          '<button type="button" class="btn btn-outline btn-sm part-view-edit-btn" id="part-view-edit">' +
            lucide('pencil', 14) + ' Edit' +
          '</button>' +
        '</div>' +
      '</header>' +
      '<div class="st-view-tabs part-view-tabs" role="tablist" aria-label="Part detail tabs">' +
        '<button type="button" class="st-view-tab is-active part-view-tab" data-tab="overview" role="tab" aria-selected="true">Overview</button>' +
        '<button type="button" class="st-view-tab part-view-tab" data-tab="activity" role="tab" aria-selected="false">Work Order Activity</button>' +
      '</div>' +
      '<div id="part-view-tab-content">' + overviewTab(part) + '</div>' +
      '<p class="service-detail-created part-view-created">' + esc(part.createdMeta) + '</p>';

    document.title = 'Part ' + part.partNumber + ' — YSOAM';
    initLucide(root);
    bindHeaderActions(part);

    root.querySelectorAll('.part-view-tab[data-tab]').forEach(function (btn) {
      btn.onclick = function () { setTab(btn.getAttribute('data-tab')); };
    });
    root.querySelectorAll('[data-tab-switch]').forEach(function (btn) {
      btn.onclick = function () { setTab(btn.getAttribute('data-tab-switch')); };
    });
    root.querySelectorAll('.part-view-manage-link, .part-view-more-actions').forEach(function (btn) {
      btn.onclick = function () { window.alert('Prototype demo.'); };
    });
  }

  if (document.body.getAttribute('data-subpage') === 'part-view') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
    else render();
  }
})();
