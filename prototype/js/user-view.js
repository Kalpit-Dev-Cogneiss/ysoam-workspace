(function () {
  'use strict';

  var data = window.YSOAM_USER_MANAGEMENT;
  var icons = window.YSOAM_ICONS;

  var TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'renewals', label: 'Renewal Reminders' },
    { id: 'issues', label: 'Issues' },
    { id: 'service-reminders', label: 'Service Reminders' },
    { id: 'inspections', label: 'Inspections' }
  ];

  var activeTab = 'overview';
  var fieldSearch = '';
  var user = null;
  var PAGE_SIZE = 10;
  var tabState = { search: {}, page: {}, issueStatus: 'all' };
  var documentBound = false;

  function renewalFormUrl() {
    return 'contact-renewal-form?id=' + encodeURIComponent(user.id) + '&from=user-management';
  }

  function tabSearch(tab) { return tabState.search[tab] || ''; }
  function tabPage(tab) { return tabState.page[tab] || 1; }
  function setTabSearch(tab, val) { tabState.search[tab] = val; tabState.page[tab] = 1; }
  function setTabPage(tab, val) { tabState.page[tab] = val; }

  function matchesSearch(text, q) {
    return !q || String(text).toLowerCase().indexOf(q) !== -1;
  }

  function paginationCount(total, page) {
    if (!total) return '0 of 0';
    var start = (page - 1) * PAGE_SIZE + 1;
    var end = Math.min(page * PAGE_SIZE, total);
    return start + ' – ' + end + ' of ' + total;
  }

  function paginate(items, tab) {
    var page = tabPage(tab);
    var totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    if (page > totalPages) page = totalPages;
    tabState.page[tab] = page;
    var start = (page - 1) * PAGE_SIZE;
    return { rows: items.slice(start, start + PAGE_SIZE), total: items.length, page: page, totalPages: totalPages };
  }

  function renewalStatus(r) {
    if (r.status) return { label: r.status, dot: r.statusDot || '#94A3B8' };
    return { label: 'Not set', dot: '#94A3B8' };
  }

  function toolbar(cfg) {
    cfg = cfg || {};
    var tab = cfg.tab || activeTab;
    var filtersHtml = (cfg.filters || []).map(function (f) {
      return '<select class="table-panel__filter" data-uv-filter="' + esc(f.key) + '" aria-label="' + esc(f.label) + '">' +
        f.options.map(function (o) {
          var val = typeof o === 'object' ? o.value : o;
          var text = typeof o === 'object' ? o.label : o;
          return '<option value="' + esc(val) + '"' + (String(val) === String(f.value) ? ' selected' : '') + '>' + esc(text) + '</option>';
        }).join('') +
      '</select>';
    }).join('');
    return (
      '<div class="table-panel__toolbar">' +
        '<div class="table-panel__search">' +
          '<span class="table-panel__search-icon" aria-hidden="true">⌕</span>' +
          '<input type="search" class="table-panel__search-input" data-uv-tab-search="' + tab + '" placeholder="Search" aria-label="Search" value="' + esc(tabSearch(tab)) + '">' +
        '</div>' +
        filtersHtml +
        (cfg.moreActions !== false ? '<a href="#" class="table-panel__link">More Actions ↗</a>' : '') +
        (cfg.count ? '<span class="table-panel__count tabular-nums">' + esc(cfg.count) + '</span>' : '') +
        '<div class="table-panel__pager">' +
          '<button type="button" class="table-panel__pager-btn" data-uv-pager="' + tab + '" data-dir="prev" aria-label="Previous">‹</button>' +
          '<button type="button" class="table-panel__pager-btn" data-uv-pager="' + tab + '" data-dir="next" aria-label="Next">›</button>' +
        '</div>' +
        (cfg.gear ? '<button type="button" class="table-panel__gear" aria-label="Table settings">⚙</button>' : '') +
        (cfg.extraRight || '') +
      '</div>'
    );
  }

  function listTablePanel(toolbarHtml, tableHtml, emptyHtml, panelClass) {
    return (
      '<div class="panel table-panel list-table-panel' + (panelClass ? ' ' + panelClass : '') + '">' +
        toolbarHtml +
        '<div class="panel__body panel__body--flush">' +
          (tableHtml || '') +
          (emptyHtml || '') +
        '</div>' +
      '</div>'
    );
  }

  function dataTable(heads, rows, opts) {
    opts = opts || {};
    var tableClass = 'data-table data-table--list' + (opts.tableClass ? ' ' + opts.tableClass : '');
    var headHtml = heads.map(function (h) {
      if (typeof h === 'object') return '<th class="' + esc(h.className || '') + '"' + (h.label ? ' aria-label="' + esc(h.label) + '"' : '') + '>' + (h.html || '') + '</th>';
      return '<th>' + h + '</th>';
    }).join('');
    return (
      '<div class="data-table-wrap data-table-wrap--scroll">' +
        '<table class="' + tableClass + '">' +
          '<thead><tr>' + headHtml + '</tr></thead>' +
          '<tbody>' + (rows || '') + '</tbody>' +
        '</table>' +
      '</div>'
    );
  }

  function renewalRowActionsMenu(rowIndex) {
    return (
      '<div class="row-actions" data-row-actions="renewal-' + esc(String(rowIndex)) + '">' +
        '<button type="button" class="row-actions__trigger" aria-label="More actions" aria-haspopup="menu" aria-expanded="false">' +
          '<span class="row-actions__dots" aria-hidden="true"></span>' +
        '</button>' +
        '<div class="row-actions__menu row-actions__menu--wide" role="menu" hidden>' +
          '<a class="row-actions__item" href="' + esc(renewalFormUrl()) + '" role="menuitem">' +
            'Add Renewal Reminder <span class="row-actions__item-icon">' + lucide('plus', 16) + '</span>' +
          '</a>' +
        '</div>' +
      '</div>'
    );
  }

  function closeRenewalRowMenus() {
    document.querySelectorAll('.uv-renewals-panel .row-actions__menu').forEach(function (m) {
      m.hidden = true;
      m.style.position = '';
      m.style.top = '';
      m.style.left = '';
      m.style.right = '';
      m.style.zIndex = '';
    });
    document.querySelectorAll('.uv-renewals-panel .row-actions__trigger').forEach(function (b) {
      b.setAttribute('aria-expanded', 'false');
    });
  }

  function positionRenewalRowMenu(trigger, menu) {
    var rect = trigger.getBoundingClientRect();
    menu.hidden = false;
    menu.style.position = 'fixed';
    menu.style.top = (rect.bottom + 4) + 'px';
    menu.style.left = Math.max(8, rect.right - 220) + 'px';
    menu.style.right = 'auto';
    menu.style.zIndex = '120';
  }

  function bindRenewalRowActions() {
    document.querySelectorAll('.uv-renewals-panel .row-actions').forEach(function (wrap) {
      if (wrap.getAttribute('data-bound')) return;
      wrap.setAttribute('data-bound', '1');
      wrap.addEventListener('click', function (e) { e.stopPropagation(); });
    });

    document.querySelectorAll('.uv-renewals-panel .row-actions__trigger').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var menu = btn.closest('.row-actions').querySelector('.row-actions__menu');
        var willOpen = menu.hidden;
        closeRenewalRowMenus();
        closeMenus();
        if (willOpen) {
          positionRenewalRowMenu(btn, menu);
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  function tableEmpty(msg) {
    return (
      '<div class="vd-empty">' +
        '<svg class="vd-empty__icon" viewBox="0 0 64 64" fill="none"><circle cx="28" cy="28" r="18" stroke="#CBD5E1" stroke-width="3"/><line x1="41" y1="41" x2="56" y2="56" stroke="#CBD5E1" stroke-width="3" stroke-linecap="round"/></svg>' +
        '<p class="vd-empty__msg">' + esc(msg) + '</p>' +
      '</div>'
    );
  }

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function lucide(name, size) {
    return window.YSOAM_LUCIDE ? window.YSOAM_LUCIDE.icon(name, size || 16) : '';
  }

  function initLucide(root) {
    if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root);
  }

  function getId() {
    return new URLSearchParams(window.location.search).get('id') || 'USR-002';
  }

  function dash(val) {
    return val == null || val === '' ? '<span class="cd-muted">—</span>' : esc(String(val));
  }

  function yesNo(v) { return v ? 'Yes' : 'No'; }

  function formatDate(iso) {
    if (!iso) return null;
    var d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function formatDateTime(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    var h = d.getHours();
    var ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + h + ':' + pad(d.getMinutes()) + ampm;
  }

  function findVehicle(plateOrId) {
    var vehicles = window.YSOAM_VEHICLES;
    if (!plateOrId || !vehicles || !vehicles.list) return null;
    return vehicles.list.find(function (v) { return v.id === plateOrId || v.name === plateOrId; }) || null;
  }

  function vehicleCell(vehicleId) {
    var v = findVehicle(vehicleId);
    if (!v) return esc(vehicleId || '—');
    return (
      '<div class="vehicle-list-name">' +
        '<img class="vehicle-list-photo" src="' + esc(v.image) + '" alt="">' +
        '<a href="vehicle-detail?id=' + encodeURIComponent(v.id) + '" class="table-cell-link">' + esc(v.name) + '</a>' +
      '</div>'
    );
  }

  function serviceStatusDot(status) {
    if (status === 'Due soon') return '#EA580C';
    if (status === 'Upcoming') return '#16A34A';
    return '#64748B';
  }

  function getFilteredTabItems(tab) {
    var d = user;
    var q = tabSearch(tab).trim().toLowerCase();
    if (tab === 'renewals') {
      return (d.renewals || []).filter(function (r) {
        var st = renewalStatus(r);
        return matchesSearch([r.type, st.label, r.dueDate, r.relative].join(' '), q);
      });
    }
    if (tab === 'issues') {
      var statusFilter = tabState.issueStatus;
      return (d.issues || []).filter(function (i) {
        if (statusFilter !== 'all' && i.status !== statusFilter) return false;
        return matchesSearch([i.name, i.priority, i.issue, i.summary, i.status, i.source, i.assigned, i.labels].join(' '), q);
      });
    }
    if (tab === 'service-reminders') {
      return (d.serviceReminders || []).filter(function (r) {
        return matchesSearch([r.vehicleId, r.task, r.assignee, r.status, r.nextDue, r.incompleteWo].join(' '), q);
      });
    }
    if (tab === 'inspections') {
      return (d.inspections || []).filter(function (i) {
        return matchesSearch([i.vehicleId, i.form, i.duration, i.locationException].join(' '), q);
      });
    }
    return [];
  }

  function refreshTabPanel() {
    var panel = document.getElementById('uv-panel');
    if (!panel) return;
    panel.innerHTML = renderPanel();
    bindTabPanelEvents();
    bindRenewalRowActions();
    bindMenus();
    initLucide(panel);
  }

  function linkPrimary(href, text) {
    return '<a href="' + esc(href) + '" class="cd-link">' + esc(text) + '</a>';
  }

  function fieldRow(label, html) {
    var q = fieldSearch.trim().toLowerCase();
    if (q && label.toLowerCase().indexOf(q) === -1 && String(html).toLowerCase().indexOf(q) === -1) return '';
    return '<div class="vd-field-row">' +
      '<span class="vd-field-label">' + esc(label) + '</span>' +
      '<span class="vd-field-val">' + html + '</span>' +
    '</div>';
  }

  function renderHero(d) {
    var tags = (d.classifications || []).length
      ? d.classifications.map(function (c) { return '<span class="cd-tag">' + esc(c) + '</span>'; }).join('')
      : '<span class="cd-muted">—</span>';

    var typeIcon = d.userType === 'owner'
      ? '<span class="uv-type-icon" data-lucide-icon="globe" data-lucide-icon-size="14" aria-hidden="true"></span>'
      : '';

    return (
      '<div class="cd-avatar cd-avatar--user" style="background:' + esc(d.avatarColor) + ';color:#fff" aria-hidden="true">' + esc(data.initials(d.name)) + '</div>' +
      '<div class="vd-hero__info">' +
        '<h1 class="vd-hero__name">' + esc(d.name) + '</h1>' +
        '<div class="cd-hero-meta">' +
          '<span class="cd-hero-meta__item"><span class="cd-hero-meta__key">Group</span> ' + esc(d.group) + '</span>' +
          '<span class="cd-hero-meta__sep">·</span>' +
          '<span class="cd-hero-meta__item"><span class="cd-hero-meta__key">Email</span> ' +
            '<a href="mailto:' + esc(d.email) + '" class="cd-link">' + esc(d.email) + '</a></span>' +
          '<span class="cd-hero-meta__sep">·</span>' +
          '<span class="cd-hero-meta__item"><span class="cd-hero-meta__key">Classifications</span> ' + tags + '</span>' +
          '<span class="cd-hero-meta__sep">·</span>' +
          '<span class="cd-hero-meta__item uv-hero-type"><span class="cd-hero-meta__key">User Type</span> ' + typeIcon + esc(d.userTypeLabel) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="vd-hero__actions">' +
        '<div class="vd-action-menu" data-uv-menu="more">' +
          '<button type="button" class="vd-action-menu__trigger vd-action-menu__trigger--dots" aria-label="More actions">' +
            '<span class="vd-action-menu__dots"></span></button>' +
          '<div class="vd-action-menu__panel" role="menu" hidden>' +
            '<button type="button" class="vd-action-menu__item" role="menuitem"><span class="vd-action-menu__label">View Record History</span></button>' +
            '<button type="button" class="vd-action-menu__item" role="menuitem"><span class="vd-action-menu__label">Archive Contact</span></button>' +
          '</div>' +
        '</div>' +
        '<a href="contact-form?from=user-management&amp;id=' + encodeURIComponent(d.id) + '" class="btn btn-outline btn-sm">Edit</a>' +
        '<div class="vd-action-menu vd-action-menu--wide" data-uv-menu="add">' +
          '<button type="button" class="btn btn-primary btn-sm vd-add-trigger">+ Add <span class="vd-add-chevron">▾</span></button>' +
          '<div class="vd-action-menu__panel" role="menu" hidden>' +
            '<button type="button" class="vd-action-menu__item" role="menuitem" data-uv-add="renewal">' +
              '<span class="vd-action-menu__label">Add Renewal Reminder</span>' +
              '<span class="vd-action-menu__icon">' + (icons && icons.calendar ? icons.calendar : '') + '</span>' +
            '</button>' +
            '<button type="button" class="vd-action-menu__item" role="menuitem" data-uv-add="assignment">' +
              '<span class="vd-action-menu__label">Add Vehicle Assignment</span>' +
              '<span class="vd-action-menu__icon">' + (icons && icons.userPlus ? icons.userPlus : '') + '</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderTabs() {
    return TABS.map(function (tab) {
      var active = tab.id === activeTab;
      return '<button type="button" class="vd-tab' + (active ? ' is-active' : '') + '" role="tab" data-uv-tab="' + tab.id + '" aria-selected="' + (active ? 'true' : 'false') + '">' + esc(tab.label) + '</button>';
    }).join('');
  }

  function renderFields(d) {
    var phoneHtml = d.phone
      ? linkPrimary('tel:' + d.phone.replace(/\s/g, ''), d.phone) + ' <span class="cd-phone-tag">' + esc(d.phoneType || 'Mobile') + '</span>'
      : dash(null);

    var rows = [
      fieldRow('First Name', dash(d.firstName)),
      fieldRow('Last Name', dash(d.lastName)),
      fieldRow('Middle Name', dash(d.middleName)),
      fieldRow('Email', linkPrimary('mailto:' + d.email, d.email)),
      fieldRow('Phone', phoneHtml),
      fieldRow('Date of Birth', d.dob ? '<span class="cd-date-link">' + esc(formatDate(d.dob)) + '</span>' : dash(null)),
      fieldRow('Address', dash(d.address)),
      fieldRow('Employee', yesNo(d.employee)),
      fieldRow('Technician', yesNo(d.technician)),
      fieldRow('Operator', yesNo(d.operator)),
      fieldRow('Employee Number', dash(d.employeeNumber)),
      fieldRow('Job Title', dash(d.jobTitle)),
      fieldRow('Group', dash(d.group)),
      fieldRow('Hourly Labor Rate', dash(d.hourlyRate)),
      fieldRow('License Class', dash(d.licenseClass)),
      fieldRow('License Number', dash(d.license)),
      fieldRow('License State / Province / Region', dash(d.licenseState)),
      fieldRow('Leave Date', dash(d.leaveDate ? formatDate(d.leaveDate) : null)),
      fieldRow('Start Date', d.startDate ? '<span class="cd-date-link">' + esc(formatDate(d.startDate)) + '</span>' : dash(null))
    ].join('');

    return (
      '<div class="cd-section">' +
        '<div class="cd-section__head">' +
          '<span class="cd-section__title">Fields</span>' +
          '<a href="#" class="cd-section__action">Customize Layout</a>' +
        '</div>' +
        '<div class="cd-search-row">' +
          '<div class="cd-search-wrap">' +
            '<span class="cd-search-icon" aria-hidden="true">⌕</span>' +
            '<input type="search" class="cd-search-input" id="uv-field-search" placeholder="Search contact fields…" value="' + esc(fieldSearch) + '">' +
          '</div>' +
        '</div>' +
        '<div class="cd-group">' +
          '<button type="button" class="cd-group__toggle" id="uv-details-toggle">' +
            '<svg class="cd-group__chevron is-open" width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            'Details' +
          '</button>' +
          '<div class="cd-group__body" id="uv-details-body">' + (rows || '<p class="cd-no-fields">No fields match your search.</p>') + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderUserAccess(d) {
    if (!d.hasUserAccess) {
      return (
        '<div class="cd-section cd-section--user-access">' +
          '<div class="cd-section__head">' +
            '<span class="cd-section__title">User Access</span>' +
            '<a href="#" class="cd-section__action">Edit</a>' +
          '</div>' +
          '<div class="cd-user-access-body">' +
            '<div class="cd-user-access-icon" aria-hidden="true">' +
              '<svg width="56" height="56" viewBox="0 0 56 56" fill="none">' +
                '<circle cx="28" cy="28" r="27" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="4 3"/>' +
                '<circle cx="28" cy="22" r="8" stroke="#94A3B8" stroke-width="1.5"/>' +
                '<path d="M10 46c0-9.94 8.06-18 18-18s18 8.06 18 18" stroke="#94A3B8" stroke-width="1.5" stroke-linecap="round"/>' +
              '</svg>' +
            '</div>' +
            '<p class="cd-user-access-text">Granting this Contact user access lets them log in to YSOAM, manage data, and receive notifications.</p>' +
          '</div>' +
        '</div>'
      );
    }

    var typeIcon = d.userType === 'owner'
      ? '<span class="uv-type-icon" data-lucide-icon="globe" data-lucide-icon-size="14" aria-hidden="true"></span>'
      : '';

    var lastSeen = d.lastSeen
      ? esc(d.lastSeen) + ' via ' + esc(d.lastSeenVia)
      : dash(null);

    return (
      '<div class="cd-section cd-section--user-access cd-section--user-access-active">' +
        '<div class="cd-section__head">' +
          '<span class="cd-section__title">User Access</span>' +
          '<a href="contact-form?from=user-management&amp;id=' + encodeURIComponent(d.id) + '" class="cd-section__action">Edit</a>' +
        '</div>' +
        '<div class="uv-user-access-grid">' +
          '<div class="vd-field-row"><span class="vd-field-label">User Status</span><span class="vd-field-val"><span class="um-status-cell"><span class="um-status-dot" style="background:' + esc(d.userStatusColor) + '"></span>' + esc(d.userStatusLabel) + '</span></span></div>' +
          '<div class="vd-field-row"><span class="vd-field-label">User Type</span><span class="vd-field-val uv-type-cell">' + typeIcon + esc(d.userTypeLabel) + '</span></div>' +
          '<div class="vd-field-row"><span class="vd-field-label">Username</span><span class="vd-field-val">' + dash(d.username) + '</span></div>' +
          '<div class="vd-field-row"><span class="vd-field-label">SAML ID</span><span class="vd-field-val">' + dash(d.samlId) + '</span></div>' +
          '<div class="vd-field-row"><span class="vd-field-label">Login Count</span><span class="vd-field-val tabular-nums">' + esc(String(d.loginCount)) + '</span></div>' +
          '<div class="vd-field-row"><span class="vd-field-label">Last Seen</span><span class="vd-field-val">' + lastSeen + '</span></div>' +
        '</div>' +
      '</div>'
    );
  }

  function vehicleIcon() {
    return '<svg class="cd-empty-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
      '<rect x="8" y="22" width="36" height="20" rx="3" stroke="#CBD5E1" stroke-width="2"/>' +
      '<path d="M44 26h8l4 8v8h-12V26z" stroke="#CBD5E1" stroke-width="2" stroke-linejoin="round"/>' +
      '<circle cx="18" cy="46" r="4" stroke="#CBD5E1" stroke-width="2"/>' +
      '<circle cx="42" cy="46" r="4" stroke="#CBD5E1" stroke-width="2"/>' +
    '</svg>';
  }

  function renewalIcon() {
    return '<svg class="cd-empty-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
      '<rect x="12" y="10" width="40" height="44" rx="4" stroke="#CBD5E1" stroke-width="2"/>' +
      '<path d="M20 22h24M20 30h24M20 38h16" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round"/>' +
    '</svg>';
  }

  function workOrderIcon() {
    return '<svg class="cd-empty-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
      '<rect x="12" y="8" width="40" height="48" rx="4" stroke="#CBD5E1" stroke-width="2"/>' +
      '<path d="M22 20h20M22 28h20M22 36h14" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round"/>' +
    '</svg>';
  }

  function issueIcon() {
    return '<svg class="cd-empty-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
      '<rect x="10" y="14" width="44" height="36" rx="3" stroke="#CBD5E1" stroke-width="2"/>' +
      '<path d="M18 26h28M18 32h20M18 38h14" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round"/>' +
    '</svg>';
  }

  function serviceIcon() {
    return '<svg class="cd-empty-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
      '<circle cx="32" cy="32" r="22" stroke="#CBD5E1" stroke-width="2"/>' +
      '<path d="M32 18v14l8 8" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';
  }

  function renderRenewalsWidget(d) {
    var renewals = d.renewals || [];
    var addUrl = renewalFormUrl();
    var body = '';

    if (renewals.length) {
      body =
        '<div class="cd-renewal-head"><span>Type</span><span>Due Date</span><span>Notifications</span></div>' +
        renewals.slice(0, 3).map(function (r) {
          var st = renewalStatus(r);
          var tone = r.relativeTone === 'soon' ? 'cd-renewal-rel--soon' : (r.relativeTone === 'past' ? 'cd-renewal-rel--past' : '');
          return '<div class="cd-renewal-row">' +
            '<span class="cd-renewal-type">' + esc(r.type) + '</span>' +
            '<span><span class="cd-renewal-date">' + (r.dueDate ? esc(formatDate(r.dueDate)) : '—') + '</span>' +
            (r.relative ? '<span class="cd-renewal-rel ' + tone + '">' + esc(r.relative) + '</span>' : '') +
            '</span>' +
            '<span class="cd-renewal-status"><span class="data-table__status-dot" style="background:' + esc(st.dot) + '"></span>' + esc(st.label) + '</span>' +
          '</div>';
        }).join('');
    } else {
      body =
        '<div class="cd-empty-state cd-empty-state--compact">' + renewalIcon() +
          '<p class="cd-empty-text">No renewal reminders currently set.</p>' +
        '</div>';
    }

    return (
      '<div class="cd-widget">' +
        '<div class="cd-widget__head">' +
          '<span class="cd-widget__title">Renewal Reminders</span>' +
          '<span class="cd-widget__acts">' +
            '<a href="' + esc(addUrl) + '" class="cd-widget__add">+ Add Renewal Reminder</a>' +
            '<a href="#" class="cd-widget__viewall" data-uv-goto-tab="renewals">View All</a>' +
          '</span>' +
        '</div>' +
        body +
      '</div>'
    );
  }

  function renderRenewalsTab(d) {
    var tab = 'renewals';
    var all = getFilteredTabItems(tab);
    var paged = paginate(all, tab);
    var rows = paged.rows.map(function (r, i) {
      var st = renewalStatus(r);
      var tone = r.relativeTone === 'soon' ? 'cd-renewal-rel--soon' : (r.relativeTone === 'past' ? 'cd-renewal-rel--past' : '');
      var rowIndex = (paged.page - 1) * PAGE_SIZE + i;
      return '<tr>' +
        '<td>' + esc(r.type) + '</td>' +
        '<td><span class="data-table__status-dot" style="background:' + esc(st.dot) + '"></span>' + esc(st.label) + '</td>' +
        '<td>' + (r.dueDate ? esc(formatDate(r.dueDate)) : dash(null)) +
          (r.relative ? '<span class="data-table__task-sub ' + tone + '">' + esc(r.relative) + '</span>' : '') +
        '</td>' +
        '<td class="tabular-nums">' + (r.notifications ? '✓' : dash(null)) + '</td>' +
        '<td class="tabular-nums">' + (r.watchers ? esc(r.watchers) : dash(null)) + '</td>' +
        '<td class="data-table__actions-col">' + renewalRowActionsMenu(rowIndex) + '</td>' +
      '</tr>';
    }).join('');

    return listTablePanel(
      toolbar({ tab: tab, count: paginationCount(paged.total, paged.page) }),
      paged.rows.length ? dataTable(
        ['Type', 'Status', 'Due Date', 'Notifications Enabled', 'Watchers', { className: 'data-table__actions-col', label: 'Actions', html: '' }],
        rows,
        { tableClass: 'data-table--user-view-renewals' }
      ) : '',
      paged.rows.length ? '' : tableEmpty('No results to show.'),
      'uv-renewals-panel'
    );
  }

  function renderIssuesTab(d) {
    var tab = 'issues';
    var all = getFilteredTabItems(tab);
    var paged = paginate(all, tab);
    var rows = paged.rows.map(function (i) {
      return '<tr>' +
        '<td><a href="#" class="table-cell-link">' + esc(i.name) + '</a></td>' +
        '<td>' + esc(i.priority) + '</td>' +
        '<td><a href="#" class="table-cell-link">' + esc(i.issue) + '</a></td>' +
        '<td>' + esc(i.summary) + '</td>' +
        '<td><span class="data-table__status-dot" style="background:' + esc(i.statusDot || '#64748B') + '"></span>' + esc(i.status) + '</td>' +
        '<td>' + esc(i.source) + '</td>' +
        '<td class="tabular-nums">' + esc(formatDateTime(i.reportedDate)) + '</td>' +
        '<td>' + esc(i.assigned) + '</td>' +
        '<td>' + esc(i.labels || '—') + '</td>' +
        '<td class="tabular-nums">' + (i.watchers != null ? esc(String(i.watchers)) : dash(null)) + '</td>' +
      '</tr>';
    }).join('');
    return listTablePanel(
      toolbar({
        tab: tab,
        filters: [{
          key: 'issueStatus',
          label: 'Issue Status',
          value: tabState.issueStatus,
          options: [
            { value: 'all', label: 'Issue Status' },
            { value: 'Open', label: 'Open' },
            { value: 'Resolved', label: 'Resolved' },
            { value: 'Overdue', label: 'Overdue' }
          ]
        }],
        count: paginationCount(paged.total, paged.page),
        gear: true
      }),
      paged.rows.length ? dataTable(['Name', 'Priority', 'Issue', 'Summary', 'Issue Status', 'Source', 'Reported Date ↓', 'Assigned', 'Labels', 'Watchers'], rows, { tableClass: 'data-table--user-view-issues' }) : '',
      paged.rows.length ? '' : tableEmpty('No results to show.')
    );
  }

  function renderServiceRemindersTab(d) {
    var tab = 'service-reminders';
    var all = getFilteredTabItems(tab);
    var paged = paginate(all, tab);
    var rows = paged.rows.map(function (r) {
      return '<tr>' +
        '<td>' + vehicleCell(r.vehicleId) + '</td>' +
        '<td><a href="#" class="table-cell-link">' + esc(r.task) + '</a></td>' +
        '<td>' + esc(r.assignee) + '</td>' +
        '<td class="tabular-nums">' + esc(formatDate(r.assignedAt)) + '</td>' +
        '<td><span class="data-table__status-dot" style="background:' + serviceStatusDot(r.status) + '"></span>' + esc(r.status) + '</td>' +
        '<td>' + (r.nextDue ? esc(formatDate(r.nextDue)) : dash(null)) +
          (r.nextDueSub ? '<span class="data-table__task-sub">' + esc(r.nextDueSub) + '</span>' : '') +
        '</td>' +
        '<td>' + (r.incompleteWo && r.incompleteWo !== '—' ? '<a href="#" class="table-cell-link">' + esc(r.incompleteWo) + '</a>' : dash(null)) + '</td>' +
        '<td>' + (r.lastCompleted ? '<a href="#" class="table-cell-link">' + esc(formatDate(r.lastCompleted)) + '</a>' : dash(null)) +
          (r.lastCompletedSub ? '<span class="data-table__task-sub">' + esc(r.lastCompletedSub) + '</span>' : '') +
        '</td>' +
        '<td>' + esc(r.compliance) + '</td>' +
        '<td class="tabular-nums">' + (r.watchers != null ? esc(String(r.watchers)) : dash(null)) + '</td>' +
      '</tr>';
    }).join('');
    return listTablePanel(
      toolbar({
        tab: tab,
        count: paginationCount(paged.total, paged.page),
        gear: true,
        extraRight: '<select class="table-panel__filter cd-toolbar-group" aria-label="Group"><option>Group: None</option></select>'
      }),
      paged.rows.length ? dataTable(['Vehicle', 'Service Task', 'Assignee', 'Assigned At', 'Status', 'Next Due', 'Incomplete Work Order', 'Last Completed', 'Compliance', 'Watchers'], rows, { tableClass: 'data-table--user-view-service' }) : '',
      paged.rows.length ? '' : tableEmpty('No results to show.')
    );
  }

  function renderInspectionsTab(d) {
    var tab = 'inspections';
    var all = getFilteredTabItems(tab);
    var paged = paginate(all, tab);
    var rows = paged.rows.map(function (i) {
      return '<tr>' +
        '<td>' + vehicleCell(i.vehicleId) + '</td>' +
        '<td class="tabular-nums">' + esc(formatDateTime(i.submitted)) + '</td>' +
        '<td>' + esc(i.duration) + '</td>' +
        '<td><a href="#" class="table-cell-link">' + esc(i.form) + '</a></td>' +
        '<td>' + dash(i.locationException === '—' ? null : i.locationException) + '</td>' +
        '<td class="tabular-nums">' + (i.failedItems != null ? esc(String(i.failedItems)) : dash(null)) + '</td>' +
      '</tr>';
    }).join('');
    return listTablePanel(
      toolbar({ tab: tab, count: paginationCount(paged.total, paged.page), gear: true }),
      paged.rows.length ? dataTable(['Vehicle', 'Submitted ↓', 'Duration', 'Inspection Form', 'Location Exception', 'Failed Items'], rows, { tableClass: 'data-table--user-view-inspections' }) : '',
      paged.rows.length ? '' : tableEmpty('No results to show.')
    );
  }

  function emptyWidget(title, message, icon, addLabel, viewAll, addHref, gotoTab) {
    var acts = '';
    if (addLabel || viewAll) {
      acts = '<span class="cd-widget__acts">';
      if (addLabel) acts += '<a href="' + esc(addHref || renewalFormUrl()) + '" class="cd-widget__add">' + esc(addLabel) + '</a>';
      if (viewAll) acts += '<a href="#" class="cd-widget__viewall" data-uv-goto-tab="' + esc(gotoTab || 'renewals') + '">View All</a>';
      acts += '</span>';
    }
    return (
      '<div class="cd-widget">' +
        '<div class="cd-widget__head">' +
          '<span class="cd-widget__title">' + esc(title) + '</span>' + acts +
        '</div>' +
        '<div class="cd-empty-state cd-empty-state--compact">' + icon +
          '<p class="cd-empty-text">' + esc(message) + '</p>' +
        '</div>' +
      '</div>'
    );
  }

  function renderOverview(d) {
    var vehicleMsg = d.operator
      ? 'No currently active vehicle assignments.'
      : 'Contact must have operator classification to be assigned to vehicles.';
    var workOrderMsg = d.technician
      ? 'No incomplete work order assignments.'
      : 'Contact must have technician classification to be assigned to work orders.';

    return (
      '<div class="cd-layout">' +
        '<div class="cd-main">' +
          renderFields(d) +
          renderUserAccess(d) +
          '<div class="cd-footer-meta">Created by ' + esc(d.createdBy) + ' ' + esc(String(d.createdDaysAgo)) + ' days ago</div>' +
        '</div>' +
        '<div class="cd-side">' +
          emptyWidget('Current Vehicle Assignments', vehicleMsg, vehicleIcon(), null, false) +
          renderRenewalsWidget(d) +
          emptyWidget('Incomplete Work Order Assignments', workOrderMsg, workOrderIcon(), null, false) +
          emptyWidget('Open Issue Assignments', 'No open issues currently assigned.', issueIcon(), null, true, null, 'issues') +
          emptyWidget('Service Reminder Assignments', 'No service reminders currently assigned.', serviceIcon(), null, true, null, 'service-reminders') +
        '</div>' +
      '</div>'
    );
  }

  function renderPanel() {
    if (activeTab === 'overview') return renderOverview(user);
    if (activeTab === 'renewals') return renderRenewalsTab(user);
    if (activeTab === 'issues') return renderIssuesTab(user);
    if (activeTab === 'service-reminders') return renderServiceRemindersTab(user);
    if (activeTab === 'inspections') return renderInspectionsTab(user);
    return '';
  }

  function isTableTab() {
    return activeTab === 'renewals' || activeTab === 'issues' || activeTab === 'service-reminders' || activeTab === 'inspections';
  }

  function bindTabPanelEvents() {
    document.querySelectorAll('[data-uv-tab-search]').forEach(function (input) {
      input.addEventListener('input', function () {
        setTabSearch(input.getAttribute('data-uv-tab-search'), input.value);
        refreshTabPanel();
      });
    });

    document.querySelectorAll('[data-uv-pager]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tab = btn.getAttribute('data-uv-pager');
        var dir = btn.getAttribute('data-dir');
        var all = getFilteredTabItems(tab);
        var totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
        var page = tabPage(tab);
        if (dir === 'prev' && page > 1) setTabPage(tab, page - 1);
        if (dir === 'next' && page < totalPages) setTabPage(tab, page + 1);
        refreshTabPanel();
      });
    });

    document.querySelectorAll('[data-uv-filter="issueStatus"]').forEach(function (sel) {
      sel.addEventListener('change', function () {
        tabState.issueStatus = sel.value;
        setTabPage('issues', 1);
        refreshTabPanel();
      });
    });

    document.querySelectorAll('[data-uv-goto-tab]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        activeTab = link.getAttribute('data-uv-goto-tab');
        render();
      });
    });
  }

  function bindAddActions() {
    document.querySelectorAll('[data-uv-add="renewal"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.location.href = renewalFormUrl();
      });
    });
    document.querySelectorAll('[data-uv-add="assignment"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.alert('Add vehicle assignment (prototype demo).');
      });
    });
  }

  function closeMenus() {
    document.querySelectorAll('[data-uv-menu] .vd-action-menu__panel').forEach(function (p) {
      p.hidden = true;
    });
    closeRenewalRowMenus();
  }

  function bindMenus() {
    document.querySelectorAll('[data-uv-menu]').forEach(function (wrap) {
      var trigger = wrap.querySelector('.vd-action-menu__trigger, .vd-add-trigger');
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
      document.addEventListener('click', function (e) {
        if (!e.target.closest('.uv-renewals-panel [data-row-actions]')) closeRenewalRowMenus();
        closeMenus();
      });
    }
  }

  function bindTabs() {
    document.querySelectorAll('[data-uv-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeTab = btn.getAttribute('data-uv-tab');
        render();
      });
    });
  }

  function bindFieldSearch() {
    var input = document.getElementById('uv-field-search');
    if (!input) return;
    input.addEventListener('input', function () {
      fieldSearch = input.value;
      var panel = document.getElementById('uv-panel');
      if (panel && activeTab === 'overview') panel.innerHTML = renderPanel();
      bindFieldSearch();
      bindDetailsToggle();
      initLucide(document.getElementById('uv-panel'));
    });
  }

  function bindDetailsToggle() {
    var toggle = document.getElementById('uv-details-toggle');
    var body = document.getElementById('uv-details-body');
    if (!toggle || !body) return;
    toggle.onclick = function () {
      var open = body.hidden;
      body.hidden = !open;
      var chevron = toggle.querySelector('.cd-group__chevron');
      if (chevron) chevron.classList.toggle('is-open', !open);
    };
  }

  function render() {
    document.getElementById('uv-hero').innerHTML = renderHero(user);
    document.getElementById('uv-tabs').innerHTML = renderTabs();
    document.getElementById('uv-panel').innerHTML = renderPanel();
    var body = document.getElementById('uv-body');
    if (body) body.classList.toggle('cd-body--table', isTableTab());
    document.title = user.name + ' — User Management — YSOAM';

    if (icons) {
      document.querySelectorAll('[data-form-icon]').forEach(function (el) {
        var key = el.getAttribute('data-form-icon');
        if (icons[key]) el.innerHTML = icons[key];
      });
    }

    initLucide(document.querySelector('.content--user-view'));
    bindTabs();
    bindMenus();
    bindAddActions();
    bindTabPanelEvents();
    bindRenewalRowActions();
    bindFieldSearch();
    bindDetailsToggle();
  }

  function init() {
    if (document.body.getAttribute('data-subpage') !== 'user-view') return;
    if (!data || !data.getDetail) {
      window.location.href = 'user-management';
      return;
    }

    user = data.getDetail(getId());
    if (!user) {
      window.location.href = 'user-management';
      return;
    }

    if (window.location.hash === '#renewals') activeTab = 'renewals';

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
