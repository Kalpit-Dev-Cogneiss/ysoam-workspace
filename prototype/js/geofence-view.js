(function () {
  'use strict';

  var data = window.YSOAM_GEOFENCES;
  var icons = window.YSOAM_ICONS;
  var map = null;
  var geofence = null;

  var TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'entries', label: 'Location Entries' }
  ];

  var activeTab = 'overview';
  var fieldSearch = '';
  var entrySearch = '';
  var entryPage = 1;
  var PAGE_SIZE = 50;
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

  function formatDate(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  }

  function entryTypeLabel(id) {
    var t = data.entryTypeById(id);
    return t ? t.label : id;
  }

  function fieldRow(label, html) {
    return '<div class="vd-field-row">' +
      '<span class="vd-field-label">' + esc(label) + '</span>' +
      '<span class="vd-field-val">' + html + '</span>' +
    '</div>';
  }

  function tableEmpty(msg) {
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
          '<input type="search" class="table-panel__search-input" data-gv-tab-search="entries" placeholder="Search" aria-label="Search location entries" value="' + esc(entrySearch) + '">' +
        '</div>' +
        '<button type="button" class="expense-filter-pill" disabled>Location Entry Type</button>' +
        '<button type="button" class="expense-filter-pill" disabled>Location Entry Date</button>' +
        '<button type="button" class="expense-filter-pill" disabled>Location Entry Asset Type</button>' +
        '<span class="table-panel__count tabular-nums">' + esc(cfg.count || '') + '</span>' +
        '<div class="table-panel__pager">' +
          '<button type="button" class="table-panel__pager-btn" data-gv-pager="entries" data-dir="prev" aria-label="Previous"' + (cfg.prevDisabled ? ' disabled' : '') + '>‹</button>' +
          '<button type="button" class="table-panel__pager-btn" data-gv-pager="entries" data-dir="next" aria-label="Next"' + (cfg.nextDisabled ? ' disabled' : '') + '>›</button>' +
        '</div>' +
        '<button type="button" class="table-panel__gear" aria-label="Table settings">⚙</button>' +
      '</div>'
    );
  }

  function listTablePanel(toolbarHtml, tableHtml, emptyHtml) {
    return (
      '<div class="panel table-panel list-table-panel gv-entries-panel">' +
        toolbarHtml +
        '<div class="panel__body panel__body--flush">' +
          (tableHtml || '') +
          (emptyHtml || '') +
        '</div>' +
      '</div>'
    );
  }

  function dataTable(heads, rows) {
    var headHtml = heads.map(function (h) {
      if (typeof h === 'object') return '<th class="' + esc(h.className || '') + '">' + (h.html || '') + '</th>';
      return '<th>' + h + '</th>';
    }).join('');
    return (
      '<div class="data-table-wrap data-table-wrap--scroll">' +
        '<table class="data-table data-table--list">' +
          '<thead><tr>' + headHtml + '</tr></thead>' +
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

  function geofenceThumb() {
    return '<span class="vd-hero__thumb gv-hero-thumb" aria-hidden="true">' +
      '<span class="geofence-thumb geofence-thumb--hero">' +
        '<span class="geofence-thumb__map"></span>' +
        '<span class="geofence-thumb__pin">' + lucide('mapPin', 14) + '</span>' +
      '</span>' +
    '</span>';
  }

  function entriesIcon() {
    return '<svg class="cd-empty-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
      '<path d="M32 8c-7.2 0-13 5.8-13 13 0 9.75 13 25 13 25s13-15.25 13-25c0-7.2-5.8-13-13-13z" stroke="#CBD5E1" stroke-width="2"/>' +
      '<circle cx="32" cy="21" r="4" stroke="#CBD5E1" stroke-width="2"/>' +
    '</svg>';
  }

  function alertIcon() {
    return '<svg class="cd-empty-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
      '<path d="M32 10l22 38H10L32 10z" stroke="#CBD5E1" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M32 26v12M32 44h.01" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round"/>' +
    '</svg>';
  }

  function renderHero(g) {
    var radiusMeta = g.shape === 'polygon' ? 'Custom polygon' : esc(String(g.radiusM)) + ' m radius';
    return (
      geofenceThumb() +
      '<div class="vd-hero__info">' +
        '<h1 class="vd-hero__name">' + esc(g.name) + '</h1>' +
        '<div class="cd-hero-meta">' +
          '<span class="cd-hero-meta__item"><span class="cd-hero-meta__key">City</span> ' + esc(g.city) + '</span>' +
          '<span class="cd-hero-meta__sep">·</span>' +
          '<span class="cd-hero-meta__item"><span class="cd-hero-meta__key">State</span> ' + esc(g.state) + '</span>' +
          '<span class="cd-hero-meta__sep">·</span>' +
          '<span class="cd-hero-meta__item"><span class="cd-hero-meta__key">Geofence Radius</span> ' + radiusMeta + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="vd-hero__actions">' +
        '<div class="vd-action-menu" data-gv-menu="more">' +
          '<button type="button" class="vd-action-menu__trigger vd-action-menu__trigger--dots" aria-label="More actions">' +
            '<span class="vd-action-menu__dots"></span></button>' +
          '<div class="vd-action-menu__panel" role="menu" hidden>' +
            '<button type="button" class="vd-action-menu__item" role="menuitem"><span class="vd-action-menu__label">Duplicate Geofence</span></button>' +
            '<button type="button" class="vd-action-menu__item" role="menuitem"><span class="vd-action-menu__label">Delete Geofence</span></button>' +
          '</div>' +
        '</div>' +
        '<a href="geofence-form?id=' + encodeURIComponent(g.id) + '" class="btn btn-outline btn-sm">Edit</a>' +
      '</div>'
    );
  }

  function renderTabs() {
    return TABS.map(function (tab) {
      var active = tab.id === activeTab;
      return '<button type="button" class="vd-tab' + (active ? ' is-active' : '') + '" role="tab" data-gv-tab="' + tab.id + '" aria-selected="' + (active ? 'true' : 'false') + '">' + esc(tab.label) + '</button>';
    }).join('');
  }

  function fieldMatches(label, value) {
    if (!fieldSearch.trim()) return true;
    var q = fieldSearch.trim().toLowerCase();
    return (label + ' ' + String(value || '').replace(/<[^>]+>/g, '')).toLowerCase().indexOf(q) !== -1;
  }

  function renderFields(g) {
    var radiusVal = g.shape === 'polygon' ? '—' : esc(String(g.radiusM)) + ' meters';
    var rowsDef = [
      ['Name', dash(g.name)],
      ['Address', dash(g.address)],
      ['Description', dash(g.description)],
      ['Geofence Radius', radiusVal],
      ['City', dash(g.city)],
      ['State / Province / Region', dash(g.state)],
      ['Country', dash(g.country)]
    ];
    var rows = rowsDef.filter(function (r) { return fieldMatches(r[0], r[1]); })
      .map(function (r) { return fieldRow(r[0], r[1]); }).join('');

    return (
      '<div class="cd-section">' +
        '<div class="cd-section__head">' +
          '<span class="cd-section__title">Fields</span>' +
          '<a href="#" class="cd-section__action" data-gv-demo>Customize Layout</a>' +
        '</div>' +
        '<div class="cd-search-row">' +
          '<div class="cd-search-wrap">' +
            '<span class="cd-search-icon" aria-hidden="true">⌕</span>' +
            '<input type="search" class="cd-search-input" id="gv-field-search" placeholder="Search geofence fields…" value="' + esc(fieldSearch) + '">' +
          '</div>' +
        '</div>' +
        '<div class="cd-group">' +
          '<button type="button" class="cd-group__toggle" id="gv-details-toggle">' +
            '<svg class="cd-group__chevron is-open" width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            'Details' +
          '</button>' +
          '<div class="cd-group__body" id="gv-details-body">' + (rows || '<p class="cd-no-fields">No fields match your search.</p>') + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderMapSection() {
    return (
      '<div class="cd-section gv-map-section">' +
        '<div class="cd-section__head">' +
          '<span class="cd-section__title">Map</span>' +
        '</div>' +
        '<div class="gv-map-wrap">' +
          '<div id="geofence-view-map" class="gv-map" aria-label="Geofence map"></div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderLatestEntriesWidget(g) {
    var rows = data.latestLocationEntries(g.id, 3);
    var body;
    if (!rows.length) {
      body = '<div class="cd-empty-state cd-empty-state--compact">' + entriesIcon() +
        '<p class="cd-empty-text">No results to show.</p></div>';
    } else {
      body = '<div class="gv-entry-widget-head"><span>Asset</span><span>Entry Type</span><span>Date</span></div>' +
        rows.map(function (r) {
          return '<div class="gv-entry-widget-row">' +
            '<span class="gv-entry-widget-asset">' + esc(r.asset) + '</span>' +
            '<span>' + esc(entryTypeLabel(r.entryType)) + '</span>' +
            '<span class="gv-entry-widget-date">' + esc(formatDate(r.date)) + '</span>' +
          '</div>';
        }).join('');
    }
    return (
      '<div class="cd-widget">' +
        '<div class="cd-widget__head">' +
          '<span class="cd-widget__title">Latest Location Entries</span>' +
          '<span class="cd-widget__acts">' +
            '<a href="#" class="cd-widget__viewall" data-gv-goto-tab="entries">View All</a>' +
          '</span>' +
        '</div>' +
        body +
      '</div>'
    );
  }

  function renderAlertPolicyWidget() {
    return (
      '<div class="cd-widget">' +
        '<div class="cd-widget__head">' +
          '<span class="cd-widget__title">Geofence Alert Policy</span>' +
          '<span class="cd-widget__acts">' +
            '<a href="#" class="cd-widget__add" data-gv-demo>+ Add Alert Policy</a>' +
          '</span>' +
        '</div>' +
        '<div class="cd-empty-state cd-empty-state--compact">' + alertIcon() +
          '<p class="cd-empty-text">No results to show.</p>' +
        '</div>' +
      '</div>'
    );
  }

  function renderOverview(g) {
    return (
      '<div class="cd-layout">' +
        '<div class="cd-main">' +
          renderFields(g) +
          renderMapSection() +
        '</div>' +
        '<div class="cd-side">' +
          renderLatestEntriesWidget(g) +
          renderAlertPolicyWidget() +
        '</div>' +
      '</div>'
    );
  }

  function filteredEntries(g) {
    var q = entrySearch.trim().toLowerCase();
    var rows = data.getLocationEntries(g.id);
    if (!q) return rows;
    return rows.filter(function (r) {
      var hay = [r.asset, r.assetType, r.contact, entryTypeLabel(r.entryType), formatDate(r.date)].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function renderEntriesTab(g) {
    var all = filteredEntries(g);
    var total = all.length;
    var totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (entryPage > totalPages) entryPage = totalPages;
    var pageRows = all.slice((entryPage - 1) * PAGE_SIZE, entryPage * PAGE_SIZE);
    var rows = pageRows.map(function (r) {
      return '<tr>' +
        '<td><a href="vehicles" class="table-cell-link">' + esc(r.asset) + '</a></td>' +
        '<td>' + esc(r.assetType) + '</td>' +
        '<td>' + esc(r.contact) + '</td>' +
        '<td>' + esc(formatDate(r.date)) + '</td>' +
        '<td>' + esc(entryTypeLabel(r.entryType)) + '</td>' +
      '</tr>';
    }).join('');

    return listTablePanel(
      toolbar({
        count: paginationCount(total, entryPage),
        prevDisabled: entryPage <= 1,
        nextDisabled: entryPage >= totalPages
      }),
      pageRows.length ? dataTable(
        ['Asset', 'Asset Type', 'Contact', { html: 'Date <span aria-hidden="true">↓</span>' }, 'Entry Type'],
        rows
      ) : '',
      pageRows.length ? '' : tableEmpty('No results to show.')
    );
  }

  function renderPanel() {
    if (activeTab === 'entries') return renderEntriesTab(geofence);
    return renderOverview(geofence);
  }

  function initMap(g) {
    var el = document.getElementById('geofence-view-map');
    if (!el || typeof L === 'undefined') return;
    if (map) {
      map.remove();
      map = null;
    }
    map = L.map(el, {
      center: [g.lat, g.lng],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: false
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '&copy; OSM &copy; CARTO'
    }).addTo(map);
    L.marker([g.lat, g.lng]).addTo(map);
    if (g.shape !== 'polygon' && g.radiusM) {
      var circle = L.circle([g.lat, g.lng], {
        radius: g.radiusM,
        color: '#1a73e8',
        weight: 2,
        fillColor: '#1a73e8',
        fillOpacity: 0.18
      }).addTo(map);
      map.fitBounds(circle.getBounds(), { padding: [24, 24], maxZoom: 15 });
    }
    setTimeout(function () { if (map) map.invalidateSize(); }, 80);
  }

  function closeMenus() {
    document.querySelectorAll('[data-gv-menu] .vd-action-menu__panel').forEach(function (p) {
      p.hidden = true;
    });
  }

  function bindMenus() {
    document.querySelectorAll('[data-gv-menu]').forEach(function (wrap) {
      var trigger = wrap.querySelector('.vd-action-menu__trigger');
      var panel = wrap.querySelector('.vd-action-menu__panel');
      if (!trigger || !panel) return;
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = panel.hidden;
        closeMenus();
        panel.hidden = !open;
      });
      panel.querySelectorAll('.vd-action-menu__item').forEach(function (btn) {
        btn.addEventListener('click', function () {
          closeMenus();
          window.alert('Prototype demo.');
        });
      });
    });
    if (!documentBound) {
      documentBound = true;
      document.addEventListener('click', closeMenus);
    }
  }

  function bindTabs() {
    document.querySelectorAll('[data-gv-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeTab = btn.getAttribute('data-gv-tab');
        render();
      });
    });
  }

  function bindFieldSearch() {
    var input = document.getElementById('gv-field-search');
    if (!input) return;
    input.addEventListener('input', function () {
      fieldSearch = input.value;
      if (activeTab === 'overview') {
        document.getElementById('gv-panel').innerHTML = renderPanel();
        bindFieldSearch();
        bindDetailsToggle();
        bindGotoTab();
        bindDemoLinks();
        initMap(geofence);
        initLucide(document.getElementById('gv-panel'));
      }
    });
  }

  function bindDetailsToggle() {
    var toggle = document.getElementById('gv-details-toggle');
    var body = document.getElementById('gv-details-body');
    if (!toggle || !body) return;
    toggle.onclick = function () {
      var open = body.hidden;
      body.hidden = !open;
      var chevron = toggle.querySelector('.cd-group__chevron');
      if (chevron) chevron.classList.toggle('is-open', !open);
    };
  }

  function bindTabPanelEvents() {
    var search = document.querySelector('[data-gv-tab-search]');
    if (search) {
      search.addEventListener('input', function () {
        entrySearch = search.value;
        entryPage = 1;
        refreshEntriesPanel();
      });
    }
    document.querySelectorAll('[data-gv-pager]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dir = btn.getAttribute('data-dir');
        var all = filteredEntries(geofence);
        var totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
        if (dir === 'prev' && entryPage > 1) entryPage--;
        if (dir === 'next' && entryPage < totalPages) entryPage++;
        refreshEntriesPanel();
      });
    });
  }

  function refreshEntriesPanel() {
    document.getElementById('gv-panel').innerHTML = renderPanel();
    bindTabPanelEvents();
    bindGotoTab();
    bindDemoLinks();
    initLucide(document.getElementById('gv-panel'));
  }

  function bindGotoTab() {
    document.querySelectorAll('[data-gv-goto-tab]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        activeTab = link.getAttribute('data-gv-goto-tab');
        render();
      });
    });
  }

  function bindDemoLinks() {
    document.querySelectorAll('[data-gv-demo]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        window.alert('Prototype demo.');
      });
    });
  }

  function render() {
    document.getElementById('gv-hero').innerHTML = renderHero(geofence);
    document.getElementById('gv-tabs').innerHTML = renderTabs();
    document.getElementById('gv-panel').innerHTML = renderPanel();
    var body = document.getElementById('gv-body');
    if (body) body.classList.toggle('cd-body--table', activeTab === 'entries');
    document.title = geofence.name + ' — Geofence — YSOAM';

    if (icons) {
      document.querySelectorAll('[data-form-icon]').forEach(function (el) {
        var key = el.getAttribute('data-form-icon');
        if (icons[key]) el.innerHTML = icons[key];
      });
    }

    initLucide(document.querySelector('.content--geofence-view'));
    bindTabs();
    bindMenus();
    bindTabPanelEvents();
    bindFieldSearch();
    bindDetailsToggle();
    bindGotoTab();
    bindDemoLinks();

    if (activeTab === 'overview') initMap(geofence);
    else if (map) {
      map.remove();
      map = null;
    }
  }

  function init() {
    if (document.body.getAttribute('data-subpage') !== 'geofence-view') return;
    if (!data) {
      window.location.href = 'geofences';
      return;
    }
    geofence = data.getById(getId());
    if (!geofence) {
      window.location.href = 'geofences';
      return;
    }
    if (window.location.hash === '#entries') activeTab = 'entries';
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
