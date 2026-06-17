(function () {
  'use strict';

  var drivers = window.YSOAM_DRIVERS;
  var vehicles = window.YSOAM_VEHICLES;
  var fleet = window.YSOAM_FLEET;
  var icons = window.YSOAM_ICONS;

  var TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'assignments', label: 'Vehicle Assignments' },
    { id: 'renewals', label: 'Renewal Reminders' },
    { id: 'issues', label: 'Issues' },
    { id: 'service-reminders', label: 'Service Reminders' },
    { id: 'inspections', label: 'Inspections' },
    { id: 'location', label: 'Location History' }
  ];

  var activeTab = 'overview';
  var fieldSearch = '';
  var PAGE_SIZE = 10;
  var tabState = {
    search: {},
    page: {},
    issueStatus: 'all',
    locationDate: '',
    locationAsset: 'all',
    locationSort: 'date-desc'
  };

  function tabSearch(tab) {
    return tabState.search[tab] || '';
  }

  function tabPage(tab) {
    return tabState.page[tab] || 1;
  }

  function setTabSearch(tab, val) {
    tabState.search[tab] = val;
    tabState.page[tab] = 1;
  }

  function setTabPage(tab, val) {
    tabState.page[tab] = val;
  }

  function getId() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('id')) return params.get('id');
    return 'DRV-001';
  }

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function initials(name) {
    return String(name || '').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
  }

  function formatDate(iso) {
    if (!iso) return '—';
    var d = new Date(iso + 'T12:00:00');
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function formatDisplayDate(iso) {
    if (!iso) return '—';
    var d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function statusMeta(status) {
    var colors = fleet && fleet.statusColors ? fleet.statusColors : {};
    var labels = fleet && fleet.statusLabels ? fleet.statusLabels : {};
    return { color: colors[status] || '#64748B', label: labels[status] || status };
  }

  function findVehicle(plateOrId) {
    if (!plateOrId || !vehicles || !vehicles.list) return null;
    return vehicles.list.find(function (v) { return v.id === plateOrId || v.name === plateOrId; }) || null;
  }

  function formatDateTime(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    var h = d.getHours();
    var ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' +
      h + ':' + pad(d.getMinutes()) + ampm;
  }

  function dash(val) {
    return val == null || val === '' ? '—' : escapeHtml(String(val));
  }

  function renewalStatus(r) {
    if (r.status) return { label: r.status, dot: r.statusDot || '#64748B' };
    if (r.relativeTone === 'past') return { label: 'Overdue', dot: '#DC2626' };
    if (r.relativeTone === 'soon') return { label: 'Due soon', dot: '#EA580C' };
    return { label: 'Upcoming', dot: '#16A34A' };
  }

  function vehicleCell(vehicleId) {
    var v = findVehicle(vehicleId);
    if (!v) return escapeHtml(vehicleId || '—');
    return (
      '<div class="vehicle-list-name">' +
        '<img class="vehicle-list-photo" src="' + escapeHtml(v.image) + '" alt="">' +
        '<a href="vehicle-detail?id=' + encodeURIComponent(v.id) + '" class="table-cell-link">' + escapeHtml(v.name) + '</a>' +
      '</div>'
    );
  }

  function emptyState(msg) {
    return (
      '<div class="vd-empty">' +
        '<svg class="vd-empty__icon" viewBox="0 0 64 64" fill="none"><circle cx="28" cy="28" r="18" stroke="#CBD5E1" stroke-width="3"/><line x1="41" y1="41" x2="56" y2="56" stroke="#CBD5E1" stroke-width="3" stroke-linecap="round"/></svg>' +
        '<p class="vd-empty__msg">' + escapeHtml(msg) + '</p>' +
      '</div>'
    );
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

  function toolbar(cfg) {
    cfg = cfg || {};
    var tab = cfg.tab || activeTab;
    var filtersHtml = (cfg.filters || []).map(function (f) {
      var opts = f.options || [f.label || f];
      var label = f.label || f;
      var selected = f.value != null ? f.value : label;
      return '<select class="table-panel__filter" data-cd-filter="' + escapeHtml(f.key || label) + '" aria-label="' + escapeHtml(label) + '">' +
        opts.map(function (o) {
          var val = typeof o === 'object' ? o.value : o;
          var text = typeof o === 'object' ? o.label : o;
          return '<option value="' + escapeHtml(val) + '"' + (String(val) === String(selected) ? ' selected' : '') + '>' + escapeHtml(text) + '</option>';
        }).join('') +
      '</select>';
    }).join('');
    var extraRight = cfg.extraRight || '';
    return (
      '<div class="table-panel__toolbar">' +
        '<div class="table-panel__search">' +
          '<span class="table-panel__search-icon" aria-hidden="true">⌕</span>' +
          '<input type="search" class="table-panel__search-input" data-cd-tab-search="' + tab + '" placeholder="Search" aria-label="Search" value="' + escapeHtml(tabSearch(tab)) + '">' +
        '</div>' +
        filtersHtml +
        (cfg.moreActions !== false ? '<a href="#" class="table-panel__link">More Actions ↗</a>' : '') +
        (cfg.count ? '<span class="table-panel__count tabular-nums" data-cd-count="' + tab + '">' + cfg.count + '</span>' : '') +
        '<div class="table-panel__pager">' +
          '<button type="button" class="table-panel__pager-btn" data-cd-pager="' + tab + '" data-dir="prev" aria-label="Previous">‹</button>' +
          '<button type="button" class="table-panel__pager-btn" data-cd-pager="' + tab + '" data-dir="next" aria-label="Next">›</button>' +
        '</div>' +
        (cfg.gear ? '<button type="button" class="table-panel__gear" aria-label="Table settings">⚙</button>' : '') +
        extraRight +
      '</div>'
    );
  }

  function listTablePanel(toolbarHtml, tableHtml, emptyHtml) {
    return (
      '<div class="panel table-panel list-table-panel">' +
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

  function matchesSearch(text, q) {
    return !q || String(text).toLowerCase().indexOf(q) !== -1;
  }

  function yesNo(v) { return v ? 'Yes' : 'No'; }

  function fieldRow(label, html, opts) {
    opts = opts || {};
    var q = fieldSearch.trim().toLowerCase();
    if (q && label.toLowerCase().indexOf(q) === -1 && String(html).toLowerCase().indexOf(q) === -1) return '';
    return (
      '<div class="vd-field-row"' + (opts.id ? ' id="' + opts.id + '"' : '') + '>' +
        '<span class="vd-field-label">' + escapeHtml(label) + '</span>' +
        '<span class="vd-field-val">' + html + '</span>' +
      '</div>'
    );
  }

  function linkPrimary(href, text) {
    return '<a href="' + escapeHtml(href) + '" class="cd-link">' + escapeHtml(text) + '</a>';
  }

  function renderHero(d) {
    var tags = (d.classifications || []).map(function (c) {
      return '<span class="cd-tag">' + escapeHtml(c) + '</span>';
    }).join('');

    return (
      '<div class="cd-avatar" aria-hidden="true">' + escapeHtml(initials(d.name)) + '</div>' +
      '<div class="vd-hero__info">' +
        '<h1 class="vd-hero__name">' + escapeHtml(d.name) + '</h1>' +
        '<div class="cd-hero-meta">' +
          '<span class="cd-hero-meta__item"><span class="cd-hero-meta__key">Group</span> ' + linkPrimary('#', d.group) + '</span>' +
          '<span class="cd-hero-meta__sep">·</span>' +
          '<span class="cd-hero-meta__item"><span class="cd-hero-meta__key">Email</span> ' +
            '<a href="mailto:' + escapeHtml(d.email) + '" class="cd-link">' + escapeHtml(d.email) + '</a></span>' +
          '<span class="cd-hero-meta__sep">·</span>' +
          '<span class="cd-hero-meta__item"><span class="cd-hero-meta__key">Classifications</span> ' + tags + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="vd-hero__actions">' +
        '<div class="vd-action-menu" data-cd-menu="more">' +
          '<button type="button" class="vd-action-menu__trigger vd-action-menu__trigger--dots" aria-label="More actions">' +
            '<span class="vd-action-menu__dots"></span></button>' +
          '<div class="vd-action-menu__panel" role="menu" hidden>' +
            '<button type="button" class="vd-action-menu__item" role="menuitem"><span class="vd-action-menu__label">View Record History</span></button>' +
            '<button type="button" class="vd-action-menu__item" role="menuitem"><span class="vd-action-menu__label">Deactivate Contact</span></button>' +
          '</div>' +
        '</div>' +
        '<a href="contact-form?id=' + encodeURIComponent(d.id) + '" class="btn btn-outline btn-sm">Edit</a>' +
        '<div class="vd-action-menu vd-action-menu--wide" data-cd-menu="add">' +
          '<button type="button" class="btn btn-primary btn-sm vd-add-trigger">+ Add <span class="vd-add-chevron">▾</span></button>' +
          '<div class="vd-action-menu__panel" role="menu" hidden>' +
            '<button type="button" class="vd-action-menu__item" role="menuitem" data-cd-add="assignment">' +
              '<span class="vd-action-menu__label">Add Vehicle Assignment</span>' +
              '<span class="vd-action-menu__icon">' + (icons && icons.userPlus ? icons.userPlus : '') + '</span>' +
            '</button>' +
            '<button type="button" class="vd-action-menu__item" role="menuitem" data-cd-add="renewal">' +
              '<span class="vd-action-menu__label">Add Renewal Reminder</span>' +
              '<span class="vd-action-menu__icon">' + (icons && icons.calendar ? icons.calendar : '') + '</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderTabs() {
    return TABS.map(function (tab) {
      var active = tab.id === activeTab;
      return '<button type="button" class="vd-tab' + (active ? ' is-active' : '') + '" role="tab" data-cd-tab="' + tab.id + '" aria-selected="' + (active ? 'true' : 'false') + '">' + escapeHtml(tab.label) + '</button>';
    }).join('');
  }

  function renderFields(d) {
    var rows = [
      fieldRow('First Name', escapeHtml(d.firstName)),
      fieldRow('Last Name', escapeHtml(d.lastName)),
      fieldRow('Middle Name', '<span class="cd-muted">—</span>'),
      fieldRow('Email', linkPrimary('mailto:' + d.email, d.email)),
      fieldRow('Phone', linkPrimary('tel:' + d.phone.replace(/\s/g, ''), d.phone) + ' <span class="cd-phone-tag">Mobile</span>'),
      fieldRow('Date of Birth', '<span class="cd-date-link">' + formatDate(d.dob) + '</span>'),
      fieldRow('Address', '<span class="cd-muted">—</span>'),
      fieldRow('Employee', yesNo(d.employee)),
      fieldRow('Technician', yesNo(d.technician)),
      fieldRow('Operator', yesNo(d.operator)),
      fieldRow('Employee Number', escapeHtml(d.employeeNumber)),
      fieldRow('Job Title', escapeHtml(d.jobTitle)),
      fieldRow('Group', linkPrimary('#', d.group) + ' <span class="cd-muted">/ Maharashtra /</span>'),
      fieldRow('Hourly Labor Rate', '<span class="cd-muted">—</span>'),
      fieldRow('License Class', escapeHtml(d.licenseClass)),
      fieldRow('License Number', escapeHtml(d.license)),
      fieldRow('License State / Region', escapeHtml(d.licenseState)),
      fieldRow('Leave Date', '<span class="cd-muted">—</span>'),
      fieldRow('Start Date', '<span class="cd-date-link">' + formatDate(d.startDate) + '</span>')
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
            '<input type="search" class="cd-search-input" id="cd-field-search" placeholder="Search contact fields…" value="' + escapeHtml(fieldSearch) + '">' +
          '</div>' +
        '</div>' +
        '<div class="cd-group">' +
          '<button type="button" class="cd-group__toggle" id="cd-details-toggle">' +
            '<svg class="cd-group__chevron is-open" width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            'Details' +
          '</button>' +
          '<div class="cd-group__body" id="cd-details-body">' + (rows || '<p class="cd-no-fields">No fields match your search.</p>') + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderUserAccess(d) {
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
          '<p class="cd-user-access-text">' +
            (d.hasUserAccess
              ? 'This contact has user access and can log in to YSOAM.'
              : 'Granting this Contact user access lets them log in to YSOAM, manage data, and receive notifications.') +
          '</p>' +
        '</div>' +
      '</div>'
    );
  }

  function renderAssignmentWidget(d) {
    var v = findVehicle(d.assignedVehicle);
    var body = '';

    if (v) {
      var st = statusMeta(v.status);
      body =
        '<div class="cd-assign-row">' +
          '<img class="cd-assign-thumb" src="' + escapeHtml(v.image) + '" alt="">' +
          '<div class="cd-assign-info">' +
            '<a href="vehicle-detail?id=' + encodeURIComponent(v.id) + '" class="cd-assign-name">' + escapeHtml(v.name) + '</a>' +
            '<span class="cd-assign-meta">' + escapeHtml(v.make + ' ' + v.model + ' · ' + v.year) + '</span>' +
          '</div>' +
          '<span class="cd-assign-status">' +
            '<span class="cd-status-dot" style="background:' + st.color + '"></span>' + escapeHtml(st.label) +
          '</span>' +
        '</div>';
    } else {
      body =
        '<div class="cd-empty-state cd-empty-state--compact">' +
          '<svg class="cd-empty-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
            '<rect x="8" y="22" width="36" height="20" rx="3" stroke="#CBD5E1" stroke-width="2"/>' +
            '<path d="M44 26h8l4 8v8h-12V26z" stroke="#CBD5E1" stroke-width="2" stroke-linejoin="round"/>' +
            '<circle cx="18" cy="46" r="4" stroke="#CBD5E1" stroke-width="2"/>' +
            '<circle cx="42" cy="46" r="4" stroke="#CBD5E1" stroke-width="2"/>' +
          '</svg>' +
          '<p class="cd-empty-text">No currently active vehicle assignments.</p>' +
        '</div>';
    }

    return (
      '<div class="cd-widget">' +
        '<div class="cd-widget__head">' +
          '<span class="cd-widget__title">Current Vehicle Assignments</span>' +
          '<span class="cd-widget__acts">' +
            '<a href="#" class="cd-widget__add">+ Add Vehicle Assignment</a>' +
            '<a href="vehicle-assignments" class="cd-widget__viewall">View All</a>' +
          '</span>' +
        '</div>' +
        body +
      '</div>'
    );
  }

  function renderRenewalsWidget(d) {
    var renewals = d.renewals || [];
    var body = '';

    if (renewals.length) {
      body =
        '<div class="cd-renewal-head"><span>Type</span><span>Due Date</span><span>Notifications</span></div>' +
        renewals.map(function (r) {
          var tone = r.relativeTone === 'soon' ? 'cd-renewal-rel--soon' : (r.relativeTone === 'past' ? 'cd-renewal-rel--past' : '');
          return (
            '<div class="cd-renewal-row">' +
              '<span class="cd-renewal-type">' + escapeHtml(r.type) + '</span>' +
              '<span><span class="cd-renewal-date">' + escapeHtml(formatDisplayDate(r.dueDate)) + '</span>' +
              (r.relative ? '<span class="cd-renewal-rel ' + tone + '">' + escapeHtml(r.relative) + '</span>' : '') +
              '</span>' +
              '<span class="cd-renewal-status">' +
                '<span class="cd-status-dot" style="background:' + (r.notifications ? '#16A34A' : '#94A3B8') + '"></span>' +
                (r.notifications ? 'Active' : 'Off') +
              '</span>' +
            '</div>'
          );
        }).join('');
    } else {
      body =
        '<div class="cd-empty-state cd-empty-state--compact">' +
          '<p class="cd-empty-text">No renewal reminders set up yet.</p>' +
        '</div>';
    }

    return (
      '<div class="cd-widget">' +
        '<div class="cd-widget__head">' +
          '<span class="cd-widget__title">Renewal Reminders</span>' +
          '<span class="cd-widget__acts">' +
            '<a href="#" class="cd-widget__add">+ Add Renewal Reminder</a>' +
            '<a href="#" class="cd-widget__viewall">View All</a>' +
          '</span>' +
        '</div>' +
        body +
      '</div>'
    );
  }

  function renderEmptyWidget(title, message, icon, viewAll) {
    return (
      '<div class="cd-widget">' +
        '<div class="cd-widget__head">' +
          '<span class="cd-widget__title">' + escapeHtml(title) + '</span>' +
          (viewAll ? '<a href="#" class="cd-widget__viewall">View All</a>' : '') +
        '</div>' +
        '<div class="cd-empty-state cd-empty-state--compact">' + icon +
          '<p class="cd-empty-text">' + escapeHtml(message) + '</p>' +
        '</div>' +
      '</div>'
    );
  }

  function emptyIcons() {
    return {
      workOrder: '<svg class="cd-empty-icon" viewBox="0 0 64 64" fill="none"><rect x="12" y="8" width="40" height="48" rx="4" stroke="#CBD5E1" stroke-width="2"/><path d="M22 20h20M22 28h20M22 36h14" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round"/></svg>',
      issue: '<svg class="cd-empty-icon" viewBox="0 0 64 64" fill="none"><rect x="10" y="14" width="44" height="36" rx="3" stroke="#CBD5E1" stroke-width="2"/><path d="M18 26h28M18 32h20M18 38h14" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round"/></svg>',
      service: '<svg class="cd-empty-icon" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="22" stroke="#CBD5E1" stroke-width="2"/><path d="M32 18v14l8 8" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };
  }

  function renderOverview(d) {
    var ic = emptyIcons();
    var workOrderMsg = d.technician
      ? 'No incomplete work order assignments.'
      : 'Contact must have technician classification to be assigned to work orders.';

    return (
      '<div class="cd-layout">' +
        '<div class="cd-main">' +
          (!d.hasUserAccess
            ? '<div class="cd-notice">This Contact doesn\'t have user access. <a href="#" class="cd-notice__link">Grant Access</a></div>'
            : '') +
          renderFields(d) +
          renderUserAccess(d) +
          '<div class="cd-footer-meta">Created ' + escapeHtml(d.createdAgo) + ' · Updated ' + escapeHtml(d.updatedAgo) + '</div>' +
        '</div>' +
        '<div class="cd-side">' +
          renderAssignmentWidget(d) +
          renderRenewalsWidget(d) +
          renderEmptyWidget('Incomplete Work Order Assignments', workOrderMsg, ic.workOrder, false) +
          renderEmptyWidget('Open Issue Assignments', 'No open issues currently assigned.', ic.issue, true) +
          renderEmptyWidget('Service Reminder Assignments', 'No service reminders currently assigned.', ic.service, true) +
        '</div>' +
      '</div>'
    );
  }

  function renderAssignmentsTab(d) {
    var tab = 'assignments';
    var q = tabSearch(tab).trim().toLowerCase();
    var all = (d.vehicleAssignments || []).filter(function (a) {
      var v = findVehicle(a.vehicleId);
      var hay = [a.vehicleId, v && v.name, a.duration, a.startMeter, a.endMeter].join(' ');
      return matchesSearch(hay, q);
    });
    var paged = paginate(all, tab);
    var rows = paged.rows.map(function (a) {
      return '<tr>' +
        '<td>' + vehicleCell(a.vehicleId) + '</td>' +
        '<td class="tabular-nums">' + escapeHtml(formatDateTime(a.start)) + '</td>' +
        '<td class="tabular-nums">' + (a.end ? escapeHtml(formatDateTime(a.end)) : '—') + '</td>' +
        '<td>' + dash(a.duration) + '</td>' +
        '<td class="tabular-nums">' + dash(a.startMeter) + '</td>' +
        '<td class="tabular-nums">' + dash(a.endMeter) + '</td>' +
      '</tr>';
    }).join('');
    return listTablePanel(
      toolbar({ tab: tab, count: paginationCount(paged.total, paged.page), moreActions: true }),
      paged.rows.length ? dataTable(['Vehicle', 'Start ↓', 'End', 'Duration', 'Start Meter', 'End Meter'], rows) : '',
      paged.rows.length ? '' : emptyState('No results to show.')
    );
  }

  function renderRenewalsTab(d) {
    var tab = 'renewals';
    var q = tabSearch(tab).trim().toLowerCase();
    var all = (d.renewals || []).filter(function (r) {
      var st = renewalStatus(r);
      return matchesSearch([r.type, st.label, r.dueDate, r.relative].join(' '), q);
    });
    var paged = paginate(all, tab);
    var rows = paged.rows.map(function (r) {
      var st = renewalStatus(r);
      var tone = r.relativeTone === 'soon' ? 'cd-renewal-rel--soon' : (r.relativeTone === 'past' ? 'cd-renewal-rel--past' : '');
      return '<tr>' +
        '<td>' + escapeHtml(r.type) + '</td>' +
        '<td><span class="data-table__status-dot" style="background:' + st.dot + '"></span>' + escapeHtml(st.label) + '</td>' +
        '<td>' + escapeHtml(formatDisplayDate(r.dueDate)) +
          (r.relative ? '<span class="data-table__task-sub ' + tone + '">' + escapeHtml(r.relative) + '</span>' : '') +
        '</td>' +
        '<td class="tabular-nums">' + (r.notifications ? '✓' : '—') + '</td>' +
        '<td class="tabular-nums">—</td>' +
      '</tr>';
    }).join('');
    return listTablePanel(
      toolbar({ tab: tab, count: paginationCount(paged.total, paged.page), moreActions: true }),
      paged.rows.length ? dataTable(['Type', 'Status', 'Due Date', 'Notifications Enabled', 'Watchers'], rows) : '',
      paged.rows.length ? '' : emptyState('No results to show.')
    );
  }

  function renderIssuesTab(d) {
    var tab = 'issues';
    var q = tabSearch(tab).trim().toLowerCase();
    var statusFilter = tabState.issueStatus;
    var all = (d.issues || []).filter(function (i) {
      if (statusFilter !== 'all' && i.status !== statusFilter) return false;
      return matchesSearch([i.name, i.priority, i.issue, i.summary, i.status, i.source, i.assigned, i.labels].join(' '), q);
    });
    var paged = paginate(all, tab);
    var rows = paged.rows.map(function (i) {
      return '<tr>' +
        '<td><a href="#" class="table-cell-link">' + escapeHtml(i.name) + '</a></td>' +
        '<td>' + escapeHtml(i.priority) + '</td>' +
        '<td><a href="#" class="table-cell-link">' + escapeHtml(i.issue) + '</a></td>' +
        '<td>' + escapeHtml(i.summary) + '</td>' +
        '<td><span class="data-table__status-dot" style="background:' + (i.statusDot || '#64748B') + '"></span>' + escapeHtml(i.status) + '</td>' +
        '<td>' + escapeHtml(i.source) + '</td>' +
        '<td class="tabular-nums">' + escapeHtml(formatDateTime(i.reportedDate)) + '</td>' +
        '<td>' + escapeHtml(i.assigned) + '</td>' +
        '<td>' + escapeHtml(i.labels || '—') + '</td>' +
        '<td class="tabular-nums">' + (i.watchers || '—') + '</td>' +
      '</tr>';
    }).join('');
    return listTablePanel(
      toolbar({
        tab: tab,
        filters: [{
          key: 'issueStatus',
          label: 'Issue Status',
          value: statusFilter,
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
      paged.rows.length ? dataTable(['Name', 'Priority', 'Issue', 'Summary', 'Issue Status', 'Source', 'Reported Date ↓', 'Assigned', 'Labels', 'Watchers'], rows) : '',
      paged.rows.length ? '' : emptyState('No results to show.')
    );
  }

  function renderServiceRemindersTab(d) {
    var tab = 'service-reminders';
    var q = tabSearch(tab).trim().toLowerCase();
    var all = (d.serviceReminders || []).filter(function (r) {
      return matchesSearch([r.vehicleId, r.task, r.assignee, r.status, r.nextDue, r.incompleteWo].join(' '), q);
    });
    var paged = paginate(all, tab);
    var rows = paged.rows.map(function (r) {
      var dot = r.status === 'Due soon' ? '#EA580C' : (r.status === 'Upcoming' ? '#16A34A' : '#64748B');
      return '<tr>' +
        '<td>' + vehicleCell(r.vehicleId) + '</td>' +
        '<td><a href="#" class="table-cell-link">' + escapeHtml(r.task) + '</a></td>' +
        '<td>' + escapeHtml(r.assignee) + '</td>' +
        '<td class="tabular-nums">' + escapeHtml(formatDate(r.assignedAt)) + '</td>' +
        '<td><span class="data-table__status-dot" style="background:' + dot + '"></span>' + escapeHtml(r.status) + '</td>' +
        '<td>' + escapeHtml(formatDisplayDate(r.nextDue)) +
          (r.nextDueSub ? '<span class="data-table__task-sub">' + escapeHtml(r.nextDueSub) + '</span>' : '') +
        '</td>' +
        '<td>' + (r.incompleteWo !== '—' ? '<a href="#" class="table-cell-link">' + escapeHtml(r.incompleteWo) + '</a>' : '—') + '</td>' +
        '<td>' + (r.lastCompleted ? '<a href="#" class="table-cell-link">' + escapeHtml(formatDisplayDate(r.lastCompleted)) + '</a>' : '—') +
          (r.lastCompletedSub ? '<span class="data-table__task-sub">' + escapeHtml(r.lastCompletedSub) + '</span>' : '') +
        '</td>' +
        '<td>' + escapeHtml(r.compliance) + '</td>' +
        '<td class="tabular-nums">' + (r.watchers || '—') + '</td>' +
      '</tr>';
    }).join('');
    return listTablePanel(
      toolbar({
        tab: tab,
        count: paginationCount(paged.total, paged.page),
        gear: true,
        extraRight: '<select class="table-panel__filter cd-toolbar-group" aria-label="Group"><option>Group: None</option></select>'
      }),
      paged.rows.length ? dataTable(['Vehicle', 'Service Task', 'Assignee', 'Assigned At', 'Status', 'Next Due', 'Incomplete Work Order', 'Last Completed', 'Compliance', 'Watchers'], rows) : '',
      paged.rows.length ? '' : emptyState('No results to show.')
    );
  }

  function renderInspectionsTab(d) {
    var tab = 'inspections';
    var q = tabSearch(tab).trim().toLowerCase();
    var all = (d.inspections || []).filter(function (i) {
      return matchesSearch([i.vehicleId, i.form, i.duration, i.locationException].join(' '), q);
    });
    var paged = paginate(all, tab);
    var rows = paged.rows.map(function (i) {
      return '<tr>' +
        '<td>' + vehicleCell(i.vehicleId) + '</td>' +
        '<td class="tabular-nums">' + escapeHtml(formatDateTime(i.submitted)) + '</td>' +
        '<td>' + escapeHtml(i.duration) + '</td>' +
        '<td><a href="#" class="table-cell-link">' + escapeHtml(i.form) + '</a></td>' +
        '<td>' + dash(i.locationException) + '</td>' +
        '<td class="tabular-nums">' + (i.failedItems != null ? i.failedItems : '—') + '</td>' +
      '</tr>';
    }).join('');
    return listTablePanel(
      toolbar({ tab: tab, count: paginationCount(paged.total, paged.page), gear: true }),
      paged.rows.length ? dataTable(['Vehicle', 'Submitted ↓', 'Duration', 'Inspection Form', 'Location Exception', 'Failed Items'], rows) : '',
      paged.rows.length ? '' : emptyState('No results to show.')
    );
  }

  function renderLocationTab(d) {
    var tab = 'location';
    var q = tabSearch(tab).trim().toLowerCase();
    var assetFilter = tabState.locationAsset;
    var all = (d.locationHistory || []).filter(function (e) {
      if (assetFilter !== 'all' && e.assetType !== assetFilter) return false;
      return matchesSearch([e.asset, e.location, e.source, e.assetType].join(' '), q);
    });
    all = all.slice().sort(function (a, b) {
      var da = new Date(a.date).getTime();
      var db = new Date(b.date).getTime();
      return tabState.locationSort === 'date-asc' ? da - db : db - da;
    });
    var paged = paginate(all, tab);
    var listHtml = '';
    if (paged.rows.length) {
      listHtml = paged.rows.map(function (e) {
        return (
          '<div class="cd-location-item">' +
            '<div class="cd-location-item__date tabular-nums">' + escapeHtml(formatDateTime(e.date)) + '</div>' +
            '<div class="cd-location-item__asset">' + escapeHtml(e.asset) + ' · ' + escapeHtml(e.assetType) + '</div>' +
            '<div class="cd-location-item__place">' + escapeHtml(e.location) + '</div>' +
            '<div class="cd-location-item__source">' + escapeHtml(e.source) + '</div>' +
          '</div>'
        );
      }).join('');
    } else {
      listHtml = '<p class="cd-location-empty">No results found</p>';
    }
    return (
      '<div class="panel table-panel list-table-panel cd-location-panel">' +
        toolbar({
          tab: tab,
          filters: [
            {
              key: 'locationDate',
              label: 'Location Entry Date',
              value: tabState.locationDate || 'Location Entry Date',
              options: ['Location Entry Date', 'Today', 'Last 7 days', 'Last 30 days']
            },
            {
              key: 'locationAsset',
              label: 'Location Entry Asset Type',
              value: assetFilter === 'all' ? 'Location Entry Asset Type' : assetFilter,
              options: [
                { value: 'all', label: 'Location Entry Asset Type' },
                { value: 'Vehicle', label: 'Vehicle' },
                { value: 'Contact', label: 'Contact' }
              ]
            }
          ],
          count: paginationCount(paged.total, paged.page),
          moreActions: true,
          extraRight: '<select class="table-panel__filter cd-location-sort" aria-label="Sort">' +
            '<option value="date-desc"' + (tabState.locationSort === 'date-desc' ? ' selected' : '') + '>Date - Newest First</option>' +
            '<option value="date-asc"' + (tabState.locationSort === 'date-asc' ? ' selected' : '') + '>Date - Oldest First</option>' +
          '</select>'
        }) +
        '<div class="cd-location-layout">' +
          '<div class="cd-location-list">' + listHtml + '</div>' +
          '<div class="cd-location-map" aria-hidden="true">' +
            '<div class="cd-location-map__placeholder">' +
              '<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M24 4C16.27 4 10 10.27 10 18c0 10.5 14 26 14 26s14-15.5 14-26c0-7.73-6.27-14-14-14z" stroke="#CBD5E1" stroke-width="2"/><circle cx="24" cy="18" r="5" stroke="#CBD5E1" stroke-width="2"/></svg>' +
              '<span>Map preview</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderPanel(d) {
    if (activeTab === 'overview') return renderOverview(d);
    if (activeTab === 'assignments') return renderAssignmentsTab(d);
    if (activeTab === 'renewals') return renderRenewalsTab(d);
    if (activeTab === 'issues') return renderIssuesTab(d);
    if (activeTab === 'service-reminders') return renderServiceRemindersTab(d);
    if (activeTab === 'inspections') return renderInspectionsTab(d);
    if (activeTab === 'location') return renderLocationTab(d);
    return '';
  }

  function bindTabPanel(d) {
    document.querySelectorAll('[data-cd-tab-search]').forEach(function (input) {
      input.addEventListener('input', function () {
        setTabSearch(input.getAttribute('data-cd-tab-search'), input.value);
        var panel = document.getElementById('cd-panel');
        if (panel) panel.innerHTML = renderPanel(d);
        bindTabPanel(d);
      });
    });

    document.querySelectorAll('[data-cd-pager]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tab = btn.getAttribute('data-cd-pager');
        var dir = btn.getAttribute('data-dir');
        var page = tabPage(tab);
        if (dir === 'next') page += 1;
        else page = Math.max(1, page - 1);
        setTabPage(tab, page);
        var panel = document.getElementById('cd-panel');
        if (panel) panel.innerHTML = renderPanel(d);
        bindTabPanel(d);
      });
    });

    document.querySelectorAll('[data-cd-filter="issueStatus"]').forEach(function (sel) {
      sel.addEventListener('change', function () {
        tabState.issueStatus = sel.value;
        setTabPage('issues', 1);
        var panel = document.getElementById('cd-panel');
        if (panel) panel.innerHTML = renderPanel(d);
        bindTabPanel(d);
      });
    });

    document.querySelectorAll('[data-cd-filter="locationAsset"]').forEach(function (sel) {
      sel.addEventListener('change', function () {
        tabState.locationAsset = sel.value;
        setTabPage('location', 1);
        var panel = document.getElementById('cd-panel');
        if (panel) panel.innerHTML = renderPanel(d);
        bindTabPanel(d);
      });
    });

    document.querySelectorAll('.cd-location-sort').forEach(function (sel) {
      sel.addEventListener('change', function () {
        tabState.locationSort = sel.value;
        var panel = document.getElementById('cd-panel');
        if (panel) panel.innerHTML = renderPanel(d);
        bindTabPanel(d);
      });
    });
  }

  function bindMenus() {
    document.querySelectorAll('[data-cd-menu]').forEach(function (wrap) {
      var btn = wrap.querySelector('.vd-action-menu__trigger, .vd-add-trigger');
      var panel = wrap.querySelector('.vd-action-menu__panel');
      if (!btn || !panel) return;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        document.querySelectorAll('[data-cd-menu] .vd-action-menu__panel').forEach(function (p) {
          if (p !== panel) p.hidden = true;
        });
        panel.hidden = !panel.hidden;
      });
    });
    document.addEventListener('click', function () {
      document.querySelectorAll('[data-cd-menu] .vd-action-menu__panel').forEach(function (p) { p.hidden = true; });
    });
  }

  function closeAddMenus() {
    document.querySelectorAll('[data-cd-menu="add"] .vd-action-menu__panel').forEach(function (p) {
      p.hidden = true;
    });
  }

  function bindAddActionsOnce() {
    if (document.body.getAttribute('data-cd-add-bound')) return;
    document.body.setAttribute('data-cd-add-bound', '1');
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-cd-add]');
      if (!btn) return;
      e.stopPropagation();
      closeAddMenus();
      var d = drivers && drivers.getById ? drivers.getById(getId()) : null;
      if (!d) return;
      var action = btn.getAttribute('data-cd-add');
      if (action === 'assignment') openAssignmentModal(d);
      if (action === 'renewal') {
        window.location.href = 'contact-renewal-form?id=' + encodeURIComponent(d.id);
      }
    });
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function todayParts() {
    var now = new Date();
    return {
      date: now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-' + pad2(now.getDate()),
      time: pad2(now.getHours()) + ':' + pad2(now.getMinutes())
    };
  }

  function closeAssignmentModal() {
    var modal = document.getElementById('cd-assignment-modal');
    if (modal) modal.classList.remove('is-open');
    closeAssignVehiclePicker();
  }

  function closeAssignVehiclePicker() {
    var menu = document.getElementById('cd-assign-vehicle-menu');
    var trigger = document.getElementById('cd-assign-vehicle-trigger');
    if (menu) menu.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function updateAssignmentSaveState() {
    var saveBtn = document.getElementById('cd-assignment-save');
    var vehicleId = document.getElementById('cd-assign-vehicle-id');
    if (saveBtn) saveBtn.disabled = !(vehicleId && vehicleId.value);
  }

  function renderAssignVehicleList(filter) {
    var listEl = document.getElementById('cd-assign-vehicle-list');
    if (!listEl || !vehicles || !vehicles.list) return;
    var q = String(filter || '').trim().toLowerCase();
    var items = vehicles.list.filter(function (v) {
      if (!q) return true;
      return [v.name, v.id, v.make, v.model].join(' ').toLowerCase().indexOf(q) !== -1;
    });
    listEl.innerHTML = items.map(function (v) {
      return (
        '<button type="button" class="assign-picker__option" role="option" data-cd-vehicle-id="' + escapeHtml(v.id) + '">' +
          '<img src="' + escapeHtml(v.image) + '" alt="">' +
          '<span class="assign-picker__option-text">' +
            '<strong>' + escapeHtml(v.name) + '</strong>' +
            '<small>' + escapeHtml(v.make + ' ' + v.model) + '</small>' +
          '</span>' +
        '</button>'
      );
    }).join('');
    listEl.querySelectorAll('[data-cd-vehicle-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectAssignVehicle(btn.getAttribute('data-cd-vehicle-id'));
      });
    });
  }

  function selectAssignVehicle(vehicleId) {
    var v = findVehicle(vehicleId);
    var trigger = document.getElementById('cd-assign-vehicle-trigger');
    var hidden = document.getElementById('cd-assign-vehicle-id');
    if (!v || !trigger || !hidden) return;
    hidden.value = v.id;
    trigger.innerHTML =
      '<img src="' + escapeHtml(v.image) + '" alt="">' +
      '<span class="assign-picker__selected">' +
        '<strong>' + escapeHtml(v.name) + '</strong>' +
        '<small>' + escapeHtml(v.make + ' ' + v.model) + '</small>' +
      '</span>' +
      '<span class="assign-picker__chevron" aria-hidden="true">▾</span>';
    closeAssignVehiclePicker();
    updateAssignmentSaveState();
  }

  function openAssignmentModal(d) {
    var modal = document.getElementById('cd-assignment-modal');
    var title = document.getElementById('cd-assignment-title');
    var operator = document.getElementById('cd-assign-operator-display');
    var hiddenVehicle = document.getElementById('cd-assign-vehicle-id');
    var trigger = document.getElementById('cd-assign-vehicle-trigger');
    var comment = document.getElementById('cd-assign-comment');
    var parts = todayParts();
    if (!modal) return;

    if (title) title.textContent = 'Add Vehicle Assignment For ' + d.name;
    if (operator) {
      operator.innerHTML =
        '<span class="assign-picker__avatar">' + escapeHtml(initials(d.name)) + '</span>' +
        '<span class="assign-picker__selected"><strong>' + escapeHtml(d.name) + '</strong></span>';
    }
    if (hiddenVehicle) hiddenVehicle.value = '';
    if (trigger) {
      trigger.innerHTML =
        '<span class="assign-picker__placeholder">Please select</span>' +
        '<span class="assign-picker__chevron" aria-hidden="true">▾</span>';
    }
    if (comment) comment.value = '';

    ['cd-assign-start-date', 'cd-assign-end-date'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = parts.date;
    });
    ['cd-assign-start-time', 'cd-assign-end-time'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = parts.time;
    });

    renderAssignVehicleList('');
    updateAssignmentSaveState();
    modal.classList.add('is-open');
  }

  function bindAssignmentModal() {
    var modal = document.getElementById('cd-assignment-modal');
    if (!modal || modal.getAttribute('data-cd-bound') === '1') return;
    modal.setAttribute('data-cd-bound', '1');

    ['cd-assignment-close', 'cd-assignment-cancel'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', closeAssignmentModal);
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeAssignmentModal();
    });

    var vehicleTrigger = document.getElementById('cd-assign-vehicle-trigger');
    var vehicleMenu = document.getElementById('cd-assign-vehicle-menu');
    var vehicleSearch = document.getElementById('cd-assign-vehicle-search');

    if (vehicleTrigger && vehicleMenu) {
      vehicleTrigger.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = vehicleMenu.hidden;
        closeAssignVehiclePicker();
        if (open) {
          vehicleMenu.hidden = false;
          vehicleTrigger.setAttribute('aria-expanded', 'true');
          if (vehicleSearch) {
            vehicleSearch.value = '';
            renderAssignVehicleList('');
            vehicleSearch.focus();
          }
        }
      });
    }

    if (vehicleSearch) {
      vehicleSearch.addEventListener('input', function () {
        renderAssignVehicleList(vehicleSearch.value);
      });
    }

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#cd-assign-vehicle-picker')) closeAssignVehiclePicker();
    });

    var form = document.getElementById('cd-assignment-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        closeAssignmentModal();
        activeTab = 'assignments';
        render();
      });
    }
  }

  function bindTabs() {
    document.querySelectorAll('[data-cd-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeTab = btn.getAttribute('data-cd-tab');
        render();
      });
    });
  }

  function bindFieldSearch() {
    var input = document.getElementById('cd-field-search');
    if (!input) return;
    input.addEventListener('input', function () {
      fieldSearch = input.value;
      render();
    });
  }

  function bindDetailsToggle() {
    var btn = document.getElementById('cd-details-toggle');
    var body = document.getElementById('cd-details-body');
    if (!btn || !body) return;
    btn.addEventListener('click', function () {
      var open = body.hidden;
      body.hidden = !open;
      var chev = btn.querySelector('.cd-group__chevron');
      if (chev) chev.classList.toggle('is-open', open);
    });
  }

  function render() {
    var id = getId();
    var d = drivers && drivers.getById ? drivers.getById(id) : null;
    if (!d) {
      window.location.href = 'drivers';
      return;
    }

    document.title = d.name + ' — YSOAM';

    var hero = document.getElementById('cd-hero');
    var tabs = document.getElementById('cd-tabs');
    var panel = document.getElementById('cd-panel');
    var bodyEl = document.querySelector('.cd-body');
    if (hero) hero.innerHTML = renderHero(d);
    if (tabs) tabs.innerHTML = renderTabs();
    if (panel) panel.innerHTML = renderPanel(d);
    if (bodyEl) bodyEl.classList.toggle('cd-body--table', activeTab !== 'overview');

    bindTabs();
    bindMenus();
    bindFieldSearch();
    bindDetailsToggle();
    bindTabPanel(d);
  }

  function init() {
    if (icons) {
      document.querySelectorAll('[data-form-icon]').forEach(function (el) {
        var key = el.getAttribute('data-form-icon');
        if (icons[key]) el.innerHTML = icons[key];
      });
    }
    var hash = window.location.hash.replace('#', '');
    if (hash && TABS.some(function (t) { return t.id === hash; })) activeTab = hash;
    bindAddActionsOnce();
    bindAssignmentModal();
    render();
  }

  if (document.body.getAttribute('data-subpage') === 'contact-detail') {
    init();
  }
})();
