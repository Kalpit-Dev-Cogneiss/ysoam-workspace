(function () {
  'use strict';

  var data = window.YSOAM_VENDORS;
  var icons = window.YSOAM_ICONS;
  var vendor = null;
  var tabs = [];
  var activeTab = 'overview';
  var fieldSearch = '';
  var entrySearch = '';
  var entryPage = 1;
  var PAGE_SIZE = 50;
  var map = null;
  var documentBound = false;

  function getId() {
    return new URLSearchParams(window.location.search).get('id');
  }

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function lucide(name, size) { return window.YSOAM_LUCIDE ? window.YSOAM_LUCIDE.icon(name, size || 16) : ''; }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }

  function dash(val) {
    return val == null || val === '' ? '<span class="cd-muted">—</span>' : esc(String(val));
  }

  function initials(name) {
    return String(name || '').split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
  }

  function linkPrimary(href, text) {
    return '<a href="' + esc(href) + '" class="cd-link">' + esc(text) + '</a>';
  }

  function fieldRow(label, html) {
    var q = fieldSearch.trim().toLowerCase();
    if (q && label.toLowerCase().indexOf(q) === -1 && String(html).replace(/<[^>]+>/g, '').toLowerCase().indexOf(q) === -1) return '';
    return '<div class="vd-field-row">' +
      '<span class="vd-field-label">' + esc(label) + '</span>' +
      '<span class="vd-field-val">' + html + '</span>' +
    '</div>';
  }

  function locationDisplay(v) {
    var line1 = [v.city, v.state].filter(Boolean).join(', ');
    var countryShort = (v.country || '').replace('United States of America', 'US').replace('United States', 'US');
    var cityPart = [v.city, v.state].filter(Boolean).join(', ');
    if (v.zip) cityPart = cityPart ? cityPart + ' ' + v.zip : v.zip;
    var line2Parts = [v.addressLine1, cityPart, countryShort].filter(Boolean);
    return { line1: line1, line2: line2Parts.join(', ') };
  }

  function emptyState(msg) {
    return (
      '<div class="vd-empty">' +
        '<svg class="vd-empty__icon" viewBox="0 0 64 64" fill="none"><circle cx="28" cy="28" r="18" stroke="#CBD5E1" stroke-width="3"/><line x1="41" y1="41" x2="56" y2="56" stroke="#CBD5E1" stroke-width="3" stroke-linecap="round"/></svg>' +
        '<p class="vd-empty__msg">' + esc(msg) + '</p>' +
      '</div>'
    );
  }

  function toolbar(cfg) {
    return (
      '<div class="table-panel__toolbar">' +
        '<div class="table-panel__search">' +
          '<span class="table-panel__search-icon" aria-hidden="true">⌕</span>' +
          '<input type="search" class="table-panel__search-input" data-vv-tab-search="' + esc(cfg.tab) + '" placeholder="Search" aria-label="Search" value="' + esc(entrySearch) + '">' +
        '</div>' +
        (cfg.moreActions !== false ? '<a href="#" class="table-panel__link" data-vv-demo>More Actions ↗</a>' : '') +
        (cfg.count ? '<span class="table-panel__count tabular-nums">' + esc(cfg.count) + '</span>' : '') +
        '<div class="table-panel__pager">' +
          '<button type="button" class="table-panel__pager-btn" data-vv-pager="' + esc(cfg.tab) + '" data-dir="prev" aria-label="Previous"' + (cfg.prevDisabled ? ' disabled' : '') + '>‹</button>' +
          '<button type="button" class="table-panel__pager-btn" data-vv-pager="' + esc(cfg.tab) + '" data-dir="next" aria-label="Next"' + (cfg.nextDisabled ? ' disabled' : '') + '>›</button>' +
        '</div>' +
        (cfg.gear ? '<button type="button" class="table-panel__gear" aria-label="Table settings" data-vv-demo>⚙</button>' : '') +
      '</div>'
    );
  }

  function listTablePanel(toolbarHtml, tableHtml, emptyHtml) {
    return (
      '<div class="panel table-panel list-table-panel vv-entries-panel">' +
        toolbarHtml +
        '<div class="panel__body panel__body--flush">' +
          (tableHtml || '') +
          (emptyHtml || '') +
        '</div>' +
      '</div>'
    );
  }

  function dataTable(heads, rows) {
    return (
      '<div class="data-table-wrap data-table-wrap--scroll">' +
        '<table class="data-table data-table--list">' +
          '<thead><tr>' + heads.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead>' +
          '<tbody>' + (rows || '') + '</tbody>' +
        '</table>' +
      '</div>'
    );
  }

  function paginationCount(total, page) {
    if (!total) return '0 – 0 of 0';
    var from = (page - 1) * PAGE_SIZE + 1;
    var to = Math.min(page * PAGE_SIZE, total);
    return from + ' – ' + to + ' of ' + total;
  }

  function renderHero(v) {
    var classTags = data.classificationLabels(v).map(function (label) {
      return '<span class="cd-tag">' + esc(label) + '</span>';
    }).join('');

    return (
      '<div class="cd-avatar vv-hero-avatar" aria-hidden="true">' + esc(initials(v.name)) + '</div>' +
      '<div class="vd-hero__info">' +
        '<h1 class="vd-hero__name">' + esc(v.name) + '</h1>' +
        (v.sample ? '<div class="vv-hero-sample"><span class="vendors-sample-badge">Sample</span></div>' : '') +
        (classTags ? '<div class="cd-hero-meta vv-hero-meta">' +
          '<span class="cd-hero-meta__item"><span class="cd-hero-meta__key">Classification</span> ' + classTags + '</span>' +
        '</div>' : '') +
        '<a href="#" class="vd-edit-labels" data-vv-demo>Edit Labels</a>' +
      '</div>' +
      '<div class="vd-hero__actions">' +
        '<button type="button" class="btn btn-outline btn-sm vv-hero-icon-btn" aria-label="Add User" data-vv-demo>' +
          lucide('userPlus', 16) +
        '</button>' +
        '<button type="button" class="btn btn-outline btn-sm" data-vv-demo>' +
          lucide('bell', 14) + ' Watch' +
        '</button>' +
        '<div class="vd-action-menu" data-vv-menu="more">' +
          '<button type="button" class="vd-action-menu__trigger vd-action-menu__trigger--dots" aria-label="More actions">' +
            '<span class="vd-action-menu__dots"></span></button>' +
          '<div class="vd-action-menu__panel" role="menu" hidden>' +
            '<button type="button" class="vd-action-menu__item" role="menuitem" data-vv-demo><span class="vd-action-menu__label">View Record History</span></button>' +
            '<button type="button" class="vd-action-menu__item" role="menuitem" data-vv-demo><span class="vd-action-menu__label">Archive Vendor</span></button>' +
          '</div>' +
        '</div>' +
        '<a href="vendor-form?id=' + encodeURIComponent(v.id) + '" class="btn btn-outline btn-sm">Edit</a>' +
      '</div>'
    );
  }

  function renderTabs() {
    return tabs.map(function (tab) {
      var active = tab.id === activeTab;
      return '<button type="button" class="vd-tab' + (active ? ' is-active' : '') + '" role="tab" data-vv-tab="' + tab.id + '" aria-selected="' + (active ? 'true' : 'false') + '">' + esc(tab.label) + '</button>';
    }).join('');
  }

  function renderDetailsSection(v) {
    var classHtml = data.classificationLabels(v).map(function (l) {
      return '<span class="cd-tag">' + esc(l) + '</span>';
    }).join(' ') || dash('');
    var rows = [
      fieldRow('Network Status', linkPrimary('#', v.networkStatus || 'Invite')),
      fieldRow('Phone', v.phone ? linkPrimary('tel:' + v.phone.replace(/[^\d+]/g, ''), v.phone) : dash()),
      fieldRow('Website', v.website ? linkPrimary(v.website, v.website) : dash()),
      fieldRow('Contact Name', dash(v.contactName)),
      fieldRow('Contact Phone', v.contactPhone ? linkPrimary('tel:' + v.contactPhone.replace(/[^\d+]/g, ''), v.contactPhone) : dash()),
      fieldRow('Contact Email', v.contactEmail ? linkPrimary('mailto:' + v.contactEmail, v.contactEmail) : dash()),
      fieldRow('Labels', dash((v.labels || []).join(', '))),
      fieldRow('Notes', dash(v.notes)),
      fieldRow('Country', dash(v.country)),
      fieldRow('Classification', classHtml),
      fieldRow('Address', dash(v.addressLine1)),
      fieldRow('Address Line 2', dash(v.addressLine2)),
      fieldRow('City', dash(v.city)),
      fieldRow('State / Province / Region', dash(v.state)),
      fieldRow('Zip / Postal Code', dash(v.zip))
    ].join('');

    return (
      '<div class="cd-section">' +
        '<div class="cd-section__head">' +
          '<span class="cd-section__title">Details</span>' +
          '<a href="#" class="cd-section__action" data-vv-demo>Customize Layout</a>' +
        '</div>' +
        '<div class="cd-search-row">' +
          '<div class="cd-search-wrap">' +
            '<span class="cd-search-icon" aria-hidden="true">⌕</span>' +
            '<input type="search" class="cd-search-input" id="vv-field-search" placeholder="Search vendor fields…" value="' + esc(fieldSearch) + '">' +
          '</div>' +
        '</div>' +
        '<div class="cd-group">' +
          '<button type="button" class="cd-group__toggle" id="vv-details-toggle">' +
            '<svg class="cd-group__chevron is-open" width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            'All Fields' +
          '</button>' +
          '<div class="cd-group__body" id="vv-details-body">' + (rows || '<p class="cd-no-fields">No fields match your search.</p>') + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderMapSection(v) {
    var loc = locationDisplay(v);
    return (
      '<div class="cd-section vv-map-section">' +
        '<div class="gv-map-wrap">' +
          '<div id="vendor-view-map" class="gv-map vv-map" aria-label="Vendor location map"></div>' +
        '</div>' +
        '<div class="vv-location-card">' +
          '<div class="vv-location-card__line1">' + esc(loc.line1) + '</div>' +
          '<div class="vv-location-card__line2">' + esc(loc.line2) + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderOverview(v) {
    return (
      '<div class="cd-layout">' +
        '<div class="cd-main">' +
          renderDetailsSection(v) +
          '<div class="cd-footer-meta">Created ' + esc(v.createdAgo) + '</div>' +
        '</div>' +
        '<div class="cd-side">' +
          renderMapSection(v) +
        '</div>' +
      '</div>'
    );
  }

  function renderEntriesTab(v, tabId, entries, columns) {
    var q = entrySearch.trim().toLowerCase();
    var all = (entries || []).filter(function (row) {
      if (!q) return true;
      return JSON.stringify(row).toLowerCase().indexOf(q) !== -1;
    });
    var total = all.length;
    var totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (entryPage > totalPages) entryPage = totalPages;
    var pageRows = all.slice((entryPage - 1) * PAGE_SIZE, entryPage * PAGE_SIZE);

    return listTablePanel(
      toolbar({
        tab: tabId,
        count: paginationCount(total, entryPage),
        prevDisabled: entryPage <= 1,
        nextDisabled: entryPage >= totalPages,
        gear: true
      }),
      pageRows.length ? dataTable(columns.headers, pageRows.map(columns.rowHtml).join('')) : '',
      pageRows.length ? '' : emptyState('No results to show.')
    );
  }

  function renderFuelEntriesTab(v) {
    return renderEntriesTab(v, 'fuel-entries', v.fuelEntries, {
      headers: ['Date', 'Vehicle', 'Gallons', 'Total', 'Odometer'],
      rowHtml: function () { return ''; }
    });
  }

  function renderChargingEntriesTab(v) {
    return renderEntriesTab(v, 'charging-entries', v.chargingEntries, {
      headers: ['Date', 'Vehicle', 'Energy (kWh)', 'Total', 'Duration'],
      rowHtml: function () { return ''; }
    });
  }

  function renderServiceEntriesTab(v) {
    return renderEntriesTab(v, 'service-entries', [], {
      headers: ['Date', 'Vehicle', 'Work Order', 'Total'],
      rowHtml: function () { return ''; }
    });
  }

  function renderPanel() {
    if (activeTab === 'fuel-entries') return renderFuelEntriesTab(vendor);
    if (activeTab === 'charging-entries') return renderChargingEntriesTab(vendor);
    if (activeTab === 'service-entries') return renderServiceEntriesTab(vendor);
    return renderOverview(vendor);
  }

  function initMap(v) {
    var el = document.getElementById('vendor-view-map');
    if (!el || typeof L === 'undefined') return;
    if (map) {
      map.remove();
      map = null;
    }
    map = L.map(el, {
      center: [v.lat, v.lng],
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: false
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '&copy; OSM &copy; CARTO'
    }).addTo(map);
    L.marker([v.lat, v.lng]).addTo(map);
    setTimeout(function () { if (map) map.invalidateSize(); }, 80);
  }

  function closeMenus() {
    document.querySelectorAll('[data-vv-menu] .vd-action-menu__panel').forEach(function (p) {
      p.hidden = true;
    });
  }

  function bindMenus() {
    document.querySelectorAll('[data-vv-menu]').forEach(function (wrap) {
      var trigger = wrap.querySelector('.vd-action-menu__trigger');
      var panel = wrap.querySelector('.vd-action-menu__panel');
      if (!trigger || !panel) return;
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = panel.hidden;
        closeMenus();
        panel.hidden = !open;
      });
    });
    if (!documentBound) {
      documentBound = true;
      document.addEventListener('click', closeMenus);
    }
  }

  function bindTabs() {
    document.querySelectorAll('[data-vv-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeTab = btn.getAttribute('data-vv-tab');
        entrySearch = '';
        entryPage = 1;
        render();
      });
    });
  }

  function bindFieldSearch() {
    var input = document.getElementById('vv-field-search');
    if (!input) return;
    input.addEventListener('input', function () {
      fieldSearch = input.value;
      var panel = document.getElementById('vv-panel');
      if (panel) panel.innerHTML = renderPanel();
      bindFieldSearch();
      bindDetailsToggle();
      bindDemoClicks();
      if (activeTab === 'overview') initMap(vendor);
    });
  }

  function bindDetailsToggle() {
    var btn = document.getElementById('vv-details-toggle');
    var body = document.getElementById('vv-details-body');
    if (!btn || !body) return;
    btn.addEventListener('click', function () {
      var open = body.hidden;
      body.hidden = !open;
      var chev = btn.querySelector('.cd-group__chevron');
      if (chev) chev.classList.toggle('is-open', open);
    });
  }

  function bindTabPanel() {
    document.querySelectorAll('[data-vv-tab-search]').forEach(function (input) {
      input.addEventListener('input', function () {
        entrySearch = input.value;
        entryPage = 1;
        var panel = document.getElementById('vv-panel');
        if (panel) panel.innerHTML = renderPanel();
        bindTabPanel();
        bindDemoClicks();
      });
    });
    document.querySelectorAll('[data-vv-pager]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dir = btn.getAttribute('data-dir');
        if (dir === 'next') entryPage += 1;
        else entryPage = Math.max(1, entryPage - 1);
        var panel = document.getElementById('vv-panel');
        if (panel) panel.innerHTML = renderPanel();
        bindTabPanel();
        bindDemoClicks();
      });
    });
  }

  function bindDemoClicks() {
    document.querySelectorAll('[data-vv-demo]').forEach(function (el) {
      if (el.getAttribute('data-vv-demo-bound')) return;
      el.setAttribute('data-vv-demo-bound', '1');
      el.addEventListener('click', function (e) {
        e.preventDefault();
        window.alert('Prototype demo.');
      });
    });
  }

  function render() {
    var id = getId();
    vendor = data.getById(id);
    if (!vendor) {
      window.location.href = 'vendors';
      return;
    }

    tabs = data.tabsForVendor(vendor);
    if (!tabs.some(function (t) { return t.id === activeTab; })) activeTab = 'overview';

    document.title = vendor.name + ' — YSOAM';

    var hero = document.getElementById('vv-hero');
    var tabsEl = document.getElementById('vv-tabs');
    var panel = document.getElementById('vv-panel');
    var bodyEl = document.getElementById('vv-body');
    if (hero) hero.innerHTML = renderHero(vendor);
    if (tabsEl) tabsEl.innerHTML = renderTabs();
    if (panel) panel.innerHTML = renderPanel();
    if (bodyEl) bodyEl.classList.toggle('cd-body--table', activeTab !== 'overview');

    bindTabs();
    bindMenus();
    bindFieldSearch();
    bindDetailsToggle();
    bindTabPanel();
    bindDemoClicks();
    initLucide(document.querySelector('.content--vendor-view'));

    if (activeTab === 'overview') initMap(vendor);
    else if (map) {
      map.remove();
      map = null;
    }
  }

  function init() {
    if (document.body.getAttribute('data-subpage') !== 'vendor-view') return;
    if (icons) {
      document.querySelectorAll('[data-form-icon]').forEach(function (el) {
        var key = el.getAttribute('data-form-icon');
        if (icons[key]) el.innerHTML = icons[key];
      });
    }
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
