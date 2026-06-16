(function () {
  var data    = window.YSOAM_VEHICLES;
  var fleet   = window.YSOAM_FLEET;
  var icons   = window.YSOAM_ICONS;

  /* ── Tabs ─────────────────────────────────────────────────── */
  var TABS = [
    { id: 'overview',          label: 'Overview' },
    { id: 'sensor-data',       label: 'Sensor Data Snapshots' },
    { id: 'service-history',   label: 'Service History' },
    { id: 'inspections',       label: 'Inspection History' },
    { id: 'work-orders',       label: 'Work Orders' },
    { id: 'service-reminders', label: 'Service Reminders' },
    { id: 'renewals',          label: 'Renewal Reminders' },
    { id: 'issues',            label: 'Issues' }
  ];

  /* ── Sample data ──────────────────────────────────────────── */
  var SAMPLE = {
    serviceHistory: [
      { wo: '#52', date: '30 May 2026, 6:54 pm',  meter: '48,220 km', tasks: ['Brake Inspection', 'Spark Plugs Replacement'],               vendor: 'Pune Service Hub',  total: '₹ 1,191.65' },
      { wo: '#51', date: '10 May 2026, 6:54 am',  meter: '44,100 km', tasks: ['Engine Oil & Filter Replacement', 'Engine Air Filter Replacement', 'Spark Plugs Replacement'], vendor: 'Expressway Motors', total: '₹ 741.65' },
      { wo: '#50', date: '14 Apr 2026, 4:54 pm',  meter: '41,800 km', tasks: ['Engine Coolant Drain & Refill', 'Transmission Fluid Drain & Refill'], vendor: '—',                total: '₹ 457.10' },
      { wo: '#49', date: '09 Feb 2026, 2:54 am',  meter: '38,300 km', tasks: ['Engine Air Filter Replacement', 'Tire Rotation'],             vendor: '—',                total: '₹ 48.95' },
      { wo: '#48', date: '07 Nov 2025, 4:54 pm',  meter: '35,600 km', tasks: ['Engine Oil & Filter Replacement', 'Tire Rotation'],           vendor: '—',                total: '₹ 67.91' }
    ],
    inspections: [],
    workOrders: [
      { num: '#54', status: 'Open',      dot: '#F59E0B', issued: '08 Jun 2026', start: '08 Jun 2026', completion: '—',             tasks: ['AC Service'],                                          assigned: 'Pune Workshop' },
      { num: '#52', status: 'Completed', dot: '#16A34A', issued: '28 May 2026', start: '30 May 2026', completion: '30 May 2026',  tasks: ['Brake Inspection', 'Spark Plugs Replacement'],          assigned: 'Pune Service Hub' }
    ],
    reminders: [
      { task: 'Engine Oil & Filter Replacement', interval: 'Every 10 month(s) or 500 hours', status: 'Upcoming', due: '9 months from now',  dueMeter: '462 hours remaining',   last: '05/10/2026', lastMeter: '2 hr', compliance: '100%' },
      { task: 'Tire Rotation',                   interval: 'Every 5 month(s) or 7,500 hours', status: 'Upcoming', due: '1 month from now',  dueMeter: '7,441 hours remaining',  last: '02/09/2026', lastMeter: '0 hr', compliance: '100%' },
      { task: 'Engine Air Filter Replacement',   interval: 'Every 12 month(s) or 1,000 hours',status: 'Upcoming', due: '11 months from now', dueMeter: '933 hours remaining',   last: '05/10/2026', lastMeter: '2 hr', compliance: '100%' },
      { task: 'Spark Plugs Replacement',         interval: 'Every 1,500 hours',               status: 'Upcoming', due: '—',                  dueMeter: '1,461 hours remaining',  last: '05/30/2026', lastMeter: '14 hr',compliance: '100%' },
      { task: 'Engine Coolant Drain & Refill',   interval: 'Every 36 month(s) or 3,500 hours',status: 'Upcoming', due: '3 years from now',   dueMeter: '3,431 hours remaining',  last: '04/14/2026', lastMeter: '0 hr', compliance: '100%' },
      { task: 'Brake Inspection',                interval: 'Every 12 month(s) or 7,500 hours', status: 'Upcoming', due: '1 year from now',   dueMeter: '7,459 hours remaining',  last: '05/30/2026', lastMeter: '14 hr',compliance: '100%' },
      { task: 'Transmission Fluid Drain & Refill',interval: 'Every 150,000 hours',             status: 'Upcoming', due: '—',                  dueMeter: '149,958 hours remaining',last: '04/14/2026', lastMeter: '0 hr', compliance: '100%' }
    ],
    renewals: [
      { type: 'Emission Test', status: 'Not set',  statusDot: '#94A3B8', due: '—',                              notify: false },
      { type: 'Inspection',    status: 'Not set',  statusDot: '#94A3B8', due: '—',                              notify: false },
      { type: 'Insurance',     status: 'Not set',  statusDot: '#94A3B8', due: '—',                              notify: false },
      { type: 'Registration',  status: 'Upcoming', statusDot: '#94A3B8', due: 'Feb 22, 2027\n8 months from now', notify: true  }
    ]
  };

  /* ── Helpers ──────────────────────────────────────────────── */
  function getId() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('id')) return params.get('id');
    var hash = window.location.hash.replace(/^#/, '');
    if (!hash) return null;
    if (hash.indexOf('id=') === 0) return decodeURIComponent(hash.slice(3));
    return decodeURIComponent(hash);
  }

  function statusMeta(status) {
    var colors = fleet && fleet.statusColors ? fleet.statusColors : {};
    var labels = fleet && fleet.statusLabels ? fleet.statusLabels : {};
    return { color: colors[status] || '#64748B', label: labels[status] || status };
  }

  function assignmentLabel(a) {
    if (a === 'assigned')   return 'Assigned';
    if (a === 'unassigned') return 'Unassigned';
    if (a === 'archived')   return 'Archived';
    return a || 'Unassigned';
  }

  /* ── Hero action menus ────────────────────────────────────── */
  var MENU_ICON = {
    gear: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="2.5" stroke="#64748B" stroke-width="1.4"/><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4" stroke="#64748B" stroke-width="1.4" stroke-linecap="round"/></svg>',
    check: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#64748B" stroke-width="1.4"/><path d="M6.5 10l2.2 2.2L13.5 7.5" stroke="#64748B" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    wrench: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M14.5 5.5a3.5 3.5 0 00-4.9 4.9L5 15l2 2 4.6-4.6a3.5 3.5 0 004.9-4.9l-2.1 2.1-1.4-1.4 2.1-2.1z" stroke="#64748B" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    link: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M8.5 11.5l3-3M7 13l-1.4 1.4a2.5 2.5 0 003.5 3.5L10 16M13 7l1.4-1.4a2.5 2.5 0 00-3.5-3.5L10 4" stroke="#64748B" stroke-width="1.4" stroke-linecap="round"/></svg>',
    paperclip: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M12.5 4.5l-5 5a2.5 2.5 0 003.5 3.5l5.5-5.5a4 4 0 00-5.7-5.7L5.5 9.1" stroke="#64748B" stroke-width="1.4" stroke-linecap="round"/></svg>',
    fuel: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M5 4h7v12H5V4zM12 7h2l1 2v7h-3V7z" stroke="#64748B" stroke-width="1.4" stroke-linejoin="round"/><path d="M7 7h3v2H7V7z" fill="#64748B"/></svg>',
    history: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#64748B" stroke-width="1.4"/><path d="M10 6v4l2.5 2.5" stroke="#64748B" stroke-width="1.4" stroke-linecap="round"/></svg>',
    archive: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="4" y="4" width="12" height="3" rx="1" stroke="#64748B" stroke-width="1.4"/><path d="M5 7v9a1 1 0 001 1h8a1 1 0 001-1V7" stroke="#64748B" stroke-width="1.4"/><path d="M8 10h4" stroke="#64748B" stroke-width="1.4" stroke-linecap="round"/></svg>',
    userPlus: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="8" cy="7" r="3" stroke="#64748B" stroke-width="1.4"/><path d="M3 17c0-2.8 2.2-5 5-5M14 8v4M12 10h4" stroke="#64748B" stroke-width="1.4" stroke-linecap="round"/></svg>',
    expense: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="10" rx="2" stroke="#64748B" stroke-width="1.4"/><path d="M3 9h14M7 13h2" stroke="#64748B" stroke-width="1.4" stroke-linecap="round"/></svg>',
    warning: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 3l8 14H2L10 3z" stroke="#64748B" stroke-width="1.4" stroke-linejoin="round"/><path d="M10 8v4M10 14.5h.01" stroke="#64748B" stroke-width="1.4" stroke-linecap="round"/></svg>',
    checklist: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="4" y="3" width="12" height="14" rx="2" stroke="#64748B" stroke-width="1.4"/><path d="M7 7h6M7 10h6M7 13h4" stroke="#64748B" stroke-width="1.4" stroke-linecap="round"/></svg>',
    doc: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M6 3h6l4 4v10a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="#64748B" stroke-width="1.4"/><path d="M12 3v4h4M8 11h4M8 14h4" stroke="#64748B" stroke-width="1.4" stroke-linecap="round"/></svg>',
    bell: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 3a4 4 0 00-4 4v3l-1.5 2.5h11L14 10V7a4 4 0 00-4-4z" stroke="#64748B" stroke-width="1.4" stroke-linejoin="round"/><path d="M8.5 15a1.5 1.5 0 003 0" stroke="#64748B" stroke-width="1.4"/></svg>',
    calendar: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="12" rx="2" stroke="#64748B" stroke-width="1.4"/><path d="M3 9h14M7 3v3M13 3v3" stroke="#64748B" stroke-width="1.4" stroke-linecap="round"/></svg>',
    meter: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="11" r="6" stroke="#64748B" stroke-width="1.4"/><path d="M10 11l2.5-2.5M10 5V3" stroke="#64748B" stroke-width="1.4" stroke-linecap="round"/></svg>'
  };

  var MORE_MENU = [
    { label: 'Edit Vehicle Settings', icon: 'gear' },
    { label: 'Manage Inspection Forms', icon: 'check' },
    { label: 'Manage Service Programs', icon: 'wrench' },
    { label: 'Manage Integration Links', icon: 'link' },
    { label: 'Attach Shared Document', icon: 'paperclip' },
    { label: 'Recalculate Fuel Entries', icon: 'fuel' },
    { label: 'View Record History', icon: 'history' }
  ];

  var ADD_MENU = [
    { label: 'Add Vehicle Assignment', icon: 'userPlus' },
    { label: 'Add Fuel Entry', icon: 'fuel' },
    { label: 'Add Expense Entry', icon: 'expense' },
    { label: 'Add Service Entry', icon: 'wrench' },
    { label: 'Add Issue', icon: 'warning' },
    { label: 'Add Inspection Submission', icon: 'checklist' },
    { label: 'Add Work Order', icon: 'doc' },
    { label: 'Add Service Reminder', icon: 'bell' },
    { label: 'Add Vehicle Renewal Reminder', icon: 'calendar' }
  ];

  function menuItem(label, iconKey) {
    return (
      '<button type="button" class="vd-action-menu__item" role="menuitem">' +
        '<span class="vd-action-menu__label">' + label + '</span>' +
        '<span class="vd-action-menu__icon">' + (MENU_ICON[iconKey] || '') + '</span>' +
      '</button>'
    );
  }

  function renderActionMenu(id, items, extra, opts) {
    opts = opts || {};
    var body = items.map(function (item) { return menuItem(item.label, item.icon); }).join('');
    if (extra && extra.length) {
      body += '<div class="vd-action-menu__divider" role="separator"></div>';
      body += extra.map(function (item) { return menuItem(item.label, item.icon); }).join('');
    }
    var triggerClass = 'vd-action-menu__trigger' + (opts.triggerClass ? ' ' + opts.triggerClass : '');
    var triggerLabel = opts.triggerLabel || '';
    var triggerAria  = opts.triggerAria ? ' aria-label="' + opts.triggerAria + '"' : '';
    return (
      '<div class="vd-action-menu' + (opts.wide ? ' vd-action-menu--wide' : '') + '" data-vd-menu="' + id + '">' +
        '<button type="button" class="' + triggerClass + '" aria-haspopup="menu" aria-expanded="false" aria-controls="vd-menu-' + id + '"' + triggerAria + '>' + triggerLabel + '</button>' +
        '<div class="vd-action-menu__panel" id="vd-menu-' + id + '" role="menu" hidden>' + body + '</div>' +
      '</div>'
    );
  }

  function renderHero(v) {
    var st       = statusMeta(v.status);
    var fallback = (data.defaultImage) || 'assets/vehicles/truck-1.jpg';
    var img      = v.image || fallback;
    var moreMenu = renderActionMenu('more', MORE_MENU, [{ label: 'Archive', icon: 'archive' }], {
      triggerClass: 'vd-action-menu__trigger--dots',
      triggerAria: 'More actions',
      triggerLabel: '<span class="vd-action-menu__dots" aria-hidden="true"></span>'
    });
    var addMenu = renderActionMenu('add', ADD_MENU, [{ label: 'Add Meter Entry', icon: 'meter' }], {
      wide: true,
      triggerClass: 'btn btn-primary btn-sm vd-add-trigger',
      triggerLabel: '+ Add <span class="vd-add-chevron" aria-hidden="true">▾</span>'
    });

    return (
      '<div class="vd-hero__thumb">' +
        '<img src="' + img + '" alt="' + v.name + '" onerror="this.onerror=null;this.src=\'' + fallback + '\'">' +
      '</div>' +
      '<div class="vd-hero__info">' +
        '<h1 class="vd-hero__name">' + v.name + '</h1>' +
        '<p class="vd-hero__sub">' + v.make + ' &middot; ' + v.year + ' ' + v.model + ' &middot; ' + v.vin + '</p>' +
        '<div class="vd-hero__tags">' +
          '<a href="#" class="vd-tag">' + v.meter + '</a>' +
          '<a href="#" class="vd-tag vd-tag--status"><span class="vd-status-dot" style="background:' + st.color + '"></span>' + st.label + '</a>' +
          '<a href="#" class="vd-tag">' + v.group + '</a>' +
          '<span class="vd-tag vd-tag--plain">' + assignmentLabel(v.assignment) + '</span>' +
        '</div>' +
        '<a href="#" class="vd-edit-labels">Edit Labels</a>' +
      '</div>' +
      '<div class="vd-hero__actions">' +
        '<button type="button" class="btn btn-outline btn-sm">Unwatch</button>' +
        moreMenu +
        '<a class="btn btn-outline btn-sm" href="vehicle-form?id=' + encodeURIComponent(v.id) + '">Edit</a>' +
        addMenu +
      '</div>'
    );
  }

  /* ── Overview ─────────────────────────────────────────────── */
  function fieldRow(label, val, hasHistory, rowId) {
    var hist = hasHistory
      ? '<button class="vd-field-hist" title="View history" aria-label="' + label + ' history">↺</button>'
      : '';
    return (
      '<div class="vd-field-row"' + (rowId ? ' id="' + rowId + '"' : '') + '>' +
        '<div class="vd-field-label">' + label + '</div>' +
        '<div class="vd-field-val">' + (val || '—') + hist + '</div>' +
      '</div>'
    );
  }

  function collapsedGroup(title) {
    return (
      '<div class="vd-group">' +
        '<button class="vd-group__toggle vd-group__toggle--collapsed" type="button">' +
          '<svg class="vd-chevron" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          title +
        '</button>' +
      '</div>'
    );
  }

  function chartBar(height, color) {
    return '<div class="vd-bar" style="height:' + height + '%;background:' + color + '"></div>';
  }

  function chartSection(title, kpis, bars, legend) {
    var kpiHtml = kpis.map(function (k) {
      return '<div class="vd-kpi"><span class="vd-kpi__label">' + k.label + '</span><strong class="vd-kpi__val">' + k.val + '</strong></div>';
    }).join('');
    var barHtml = bars.map(function (b) { return chartBar(b.h, b.c); }).join('');
    var legendHtml = legend ? '<div class="vd-chart-legend">' + legend.map(function (l) {
      return '<span class="vd-legend-item"><span class="vd-legend-dot" style="background:' + l.c + '"></span>' + l.label + ' ' + l.val + '</span>';
    }).join('') + '</div>' : '';
    return (
      '<section class="vd-section vd-section--chart">' +
        '<div class="vd-section-head">' +
          '<span class="vd-section-title">' + title + '</span>' +
          '<a href="#" class="vd-link-sm">View Metrics ↗</a>' +
        '</div>' +
        '<div class="vd-kpis">' + kpiHtml + '</div>' +
        '<div class="vd-chart">' + barHtml + '</div>' +
        '<div class="vd-chart-axis"><span>Jun 2025</span><span>Jun 2026</span></div>' +
        legendHtml +
      '</section>'
    );
  }

  function sideWidget(title, body, addLink, viewAll) {
    return (
      '<section class="vd-widget">' +
        '<div class="vd-widget-head">' +
          '<h3 class="vd-widget-title">' + title + '</h3>' +
          '<div class="vd-widget-acts">' +
            (addLink  ? '<a href="#" class="vd-link-sm">' + addLink + '</a>'  : '') +
            (viewAll  ? '<a href="#" class="vd-link-sm">View All</a>'          : '') +
          '</div>' +
        '</div>' +
        '<p class="vd-widget-body">' + body + '</p>' +
      '</section>'
    );
  }

  function renderOverview(v) {
    var st = statusMeta(v.status);
    var statusVal = '<span class="vd-inline-status"><span class="vd-status-dot" style="background:' + st.color + '"></span>' + st.label + '</span>';

    return (
      '<div class="vd-overview">' +

      /* ── LEFT COLUMN ── */
      '<div class="vd-overview__main">' +

        /* Fields */
        '<section class="vd-section vd-section--fields">' +
          '<div class="vd-section-head">' +
            '<span class="vd-section-title">Fields</span>' +
            '<a href="#" class="vd-link-sm">Customize Layout</a>' +
          '</div>' +
          '<div class="vd-fields-search-row">' +
            '<input id="field-search" type="search" class="vd-fields-search" placeholder="Search vehicle fields…" aria-label="Search fields">' +
          '</div>' +
          '<div class="vd-group" id="group-details">' +
            '<button class="vd-group__toggle" type="button" data-group="details">' +
              '<svg class="vd-chevron is-open" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
              'Details' +
            '</button>' +
            '<div class="vd-group__rows" id="vehicle-fields">' +
              fieldRow('Name',            v.name) +
              fieldRow('Meter',           v.meter,   true, 'meter') +
              fieldRow('Status',          statusVal, true) +
              fieldRow('Group',           v.group,   true) +
              fieldRow('Operator',        v.operator || assignmentLabel(v.assignment)) +
              fieldRow('Type',            v.type) +
              fieldRow('Fuel Type',       '—') +
              fieldRow('VIN/SN',          v.vin + '&nbsp;&nbsp;<a href="#" class="vd-decode-link">Decode</a>') +
              fieldRow('License Plate',   v.plate) +
              fieldRow('Year',            v.year) +
              fieldRow('Make',            v.make) +
              fieldRow('Model',           v.model) +
              fieldRow('Tyre',            '—') +
              fieldRow('Replacement Group / Province', '—') +
              fieldRow('Color',           '—') +
              fieldRow('Ownership',       'Owned') +
              fieldRow('Body Type',       '—') +
              fieldRow('Body Subtype',    '—') +
              fieldRow('MSRP',            '—') +
            '</div>' +
          '</div>' +
          collapsedGroup('Specifications') +
          collapsedGroup('Financial') +
        '</section>' +

        /* Linked Assets */
        '<section class="vd-section">' +
          '<div class="vd-section-head">' +
            '<span class="vd-section-title">Linked Assets</span>' +
            '<a href="#" class="vd-link-sm">View Assets</a>' +
          '</div>' +
          '<div class="vd-section-body vd-section-body--empty">There are no linked Vehicles.</div>' +
        '</section>' +

        /* Cost of Ownership */
        chartSection('Cost of Ownership',
          [{ label: 'Total Costs', val: '₹ 205.27' }, { label: 'Cost Per Meter', val: '₹ 6.84 /hr' }],
          [
            { h: 30, c: '#9333EA' }, { h: 20, c: '#14B8A6' }, { h: 15, c: '#F59E0B' },
            { h: 55, c: '#9333EA' }, { h: 40, c: '#14B8A6' }, { h: 25, c: '#F59E0B' },
            { h: 70, c: '#9333EA' }, { h: 45, c: '#14B8A6' }, { h: 30, c: '#F59E0B' },
            { h: 60, c: '#9333EA' }, { h: 38, c: '#14B8A6' }, { h: 22, c: '#F59E0B' }
          ],
          [
            { c: '#9333EA', label: 'Fuel Costs',    val: '₹ 67.05' },
            { c: '#14B8A6', label: 'Service Costs', val: '₹ 0.00' },
            { c: '#F59E0B', label: 'Other Costs',   val: '₹ 138.22' }
          ]
        ) +

        /* Utilization */
        chartSection('Utilization',
          [{ label: 'Max Usage', val: '30.0 hours' }, { label: 'Avg Usage', val: '2.7 hr/d' }],
          [
            { h: 20, c: '#14B8A6' }, { h: 35, c: '#14B8A6' }, { h: 50, c: '#14B8A6' },
            { h: 40, c: '#14B8A6' }, { h: 65, c: '#14B8A6' }, { h: 55, c: '#14B8A6' },
            { h: 75, c: '#14B8A6' }, { h: 60, c: '#14B8A6' }, { h: 45, c: '#14B8A6' },
            { h: 70, c: '#14B8A6' }, { h: 50, c: '#14B8A6' }, { h: 55, c: '#14B8A6' }
          ],
          null
        ) +

        /* Fuel Efficiency */
        chartSection('Fuel Efficiency',
          [{ label: 'Total Volume', val: '18.81 L' }, { label: 'Avg. Efficiency', val: '0.26 km/L' }, { label: 'Avg. Fuel Cost', val: '₹ 0.03 /km' }],
          [
            { h: 45, c: '#0052FF' }, { h: 50, c: '#0052FF' }, { h: 42, c: '#0052FF' },
            { h: 55, c: '#0052FF' }, { h: 48, c: '#0052FF' }, { h: 52, c: '#0052FF' },
            { h: 47, c: '#0052FF' }, { h: 53, c: '#0052FF' }, { h: 49, c: '#0052FF' },
            { h: 51, c: '#0052FF' }, { h: 46, c: '#0052FF' }, { h: 50, c: '#0052FF' }
          ],
          null
        ) +

      '</div>' +

      /* ── RIGHT COLUMN ── */
      '<aside class="vd-overview__side">' +
        sideWidget('Last Known Location',   'No current location information available for this Vehicle.', null,  false) +
        sideWidget('Open Issues',           'There are no Open Issues for this Vehicle.',                  '+ Add Issue',             true) +
        sideWidget('Service Reminders',     'There are no Service Reminders due soon for this Vehicle.',   '+ Add Service Reminder',  true) +
        sideWidget('Renewal Reminders',     'There are no Renewal Reminders for this Vehicle.',            '+ Add Renewal Reminder',  true) +
        sideWidget('Incomplete Work Orders','There are no Work Orders for this Vehicle.',                  '+ Add Work Order',        true) +
        sideWidget('Inspections',           'There are no Inspections due soon for this Vehicle.',         null,                      true) +
        sideWidget('Critical Faults',       'There are no Critical Faults for this Vehicle.',              null,                      true) +
        sideWidget('Recalls',               'There are no Open Recalls for this Vehicle.',                 null,                      true) +
      '</aside>' +

      '</div>'
    );
  }

  /* ── Empty state ──────────────────────────────────────────── */
  function emptyState(msg) {
    return (
      '<div class="vd-empty">' +
        '<svg class="vd-empty__icon" viewBox="0 0 64 64" fill="none"><circle cx="28" cy="28" r="18" stroke="#CBD5E1" stroke-width="3"/><line x1="41" y1="41" x2="56" y2="56" stroke="#CBD5E1" stroke-width="3" stroke-linecap="round"/></svg>' +
        '<p class="vd-empty__msg">' + msg + '</p>' +
      '</div>'
    );
  }

  /* ── Tab toolbar (same as Vehicles list) ──────────────────── */
  function toolbar(cfg) {
    cfg = cfg || {};
    var filtersHtml = (cfg.filters || []).map(function (f) {
      return '<select class="table-panel__filter" aria-label="' + f + '"><option>' + f + '</option></select>';
    }).join('');
    return (
      '<div class="table-panel__toolbar">' +
        '<div class="table-panel__search">' +
          '<span class="table-panel__search-icon" aria-hidden="true">⌕</span>' +
          '<input type="search" class="table-panel__search-input" placeholder="Search…" aria-label="Search">' +
        '</div>' +
        filtersHtml +
        (cfg.moreActions !== false ? '<a href="#" class="table-panel__link">More Actions ↗</a>' : '') +
        (cfg.count ? '<span class="table-panel__count tabular-nums">' + cfg.count + '</span>' : '') +
        '<div class="table-panel__pager">' +
          '<button type="button" class="table-panel__pager-btn" aria-label="Previous">‹</button>' +
          '<button type="button" class="table-panel__pager-btn" aria-label="Next">›</button>' +
        '</div>' +
        (cfg.gear ? '<button type="button" class="table-panel__gear" aria-label="Table settings">⚙</button>' : '') +
      '</div>'
    );
  }

  function listTablePanel(toolbarHtml, tableHtml, emptyHtml) {
    return (
      '<div class="panel table-panel list-table-panel">' +
        toolbarHtml +
        '<div class="panel__body panel__body--flush">' +
          tableHtml +
          (emptyHtml || '') +
        '</div>' +
      '</div>'
    );
  }

  /* ── Data tables (same as Vehicles list) ──────────────────── */
  function table(heads, rows) {
    return (
      '<div class="data-table-wrap data-table-wrap--scroll">' +
        '<table class="data-table data-table--list">' +
          '<thead><tr>' + heads.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead>' +
          '<tbody>' + (rows || '') + '</tbody>' +
        '</table>' +
      '</div>'
    );
  }

  function renderServiceHistory() {
    var rows = SAMPLE.serviceHistory.map(function (r) {
      return '<tr>' +
        '<td><span class="data-table__status-dot" style="background:#16A34A"></span><a href="#" class="table-cell-link">' + r.wo + '</a></td>' +
        '<td>' + r.date + '</td>' +
        '<td>' + r.meter + '</td>' +
        '<td class="data-table__task-cell">' + r.tasks.map(function (t) { return '<a href="#" class="table-cell-link">' + t + '</a>'; }).join('') + '</td>' +
        '<td>—</td>' +
        '<td>' + r.vendor + '</td>' +
        '<td>—</td>' +
        '<td class="tabular-nums">' + r.total + '</td>' +
        '<td>—</td>' +
      '</tr>';
    }).join('');
    return listTablePanel(
      toolbar({ filters: ['Completion Date', 'Service Tasks', 'Work Order'], count: '1 – 5 of 5' }),
      table(['Work Order', 'Actual Completion Date ↓', 'Meter', 'Service Tasks', 'Issues', 'Vendor', 'Labels', 'Total', 'Watchers'], rows)
    );
  }

  function renderInspections() {
    return listTablePanel(
      toolbar({ filters: ['Inspection Submitted', 'Inspection Form', 'Inspection User'] }),
      table(['Submitted ↓', 'Duration', 'Inspection Form', 'User', 'Location Exception', 'Failed Items'], ''),
      emptyState('No results to show.')
    );
  }

  function renderWorkOrders() {
    var rows = SAMPLE.workOrders.map(function (r) {
      return '<tr>' +
        '<td><a href="#" class="table-cell-link">' + r.num + '</a></td>' +
        '<td><span class="data-table__status-dot" style="background:' + r.dot + '"></span>' + r.status + '</td>' +
        '<td>—</td>' +
        '<td>' + r.assigned + '</td>' +
        '<td>' + r.issued + '</td>' +
        '<td>' + r.start + '</td>' +
        '<td>' + r.completion + '</td>' +
        '<td class="data-table__task-cell">' + r.tasks.map(function (t) { return '<a href="#" class="table-cell-link">' + t + '</a>'; }).join('') + '</td>' +
        '<td>—</td><td>—</td><td>—</td>' +
      '</tr>';
    }).join('');
    return listTablePanel(
      toolbar({ filters: ['Status', 'Work Order Type', 'Assigned To'], count: '1 – 2 of 2' }),
      table(['Number', 'Status', 'Issued By', 'Assigned To', 'Issue Date', 'Actual Start Date', 'Actual Completion Date', 'Service Tasks', 'Resolved Issues', 'Labels', 'Scheduled Start'], rows)
    );
  }

  function renderReminders() {
    var rows = SAMPLE.reminders.map(function (r) {
      return '<tr>' +
        '<td><a href="#" class="table-cell-link">' + r.task + '</a><span class="data-table__task-sub">' + r.interval + '</span></td>' +
        '<td><span class="data-table__status-dot" style="background:#94A3B8"></span>' + r.status + '</td>' +
        '<td>' + r.due + '<span class="data-table__task-sub">' + r.dueMeter + '</span></td>' +
        '<td>—</td>' +
        '<td>—</td>' +
        '<td><a href="#" class="table-cell-link">' + r.last + '</a><span class="data-table__task-sub">' + r.lastMeter + '</span></td>' +
        '<td>' + r.compliance + '</td>' +
        '<td>—</td>' +
      '</tr>';
    }).join('');
    return listTablePanel(
      toolbar({ filters: ['Service Task', 'Due Date', 'Watcher'], count: '1 – 7 of 7', gear: true }),
      table(['Service Task', 'Status', 'Next Due ↑', 'Incomplete Work Order', 'Service Program', 'Last Completed', 'Compliance', 'Watchers'], rows)
    );
  }

  function renderRenewals() {
    var rows = SAMPLE.renewals.map(function (r) {
      var dueHtml = r.due.indexOf('\n') !== -1
        ? r.due.split('\n').map(function (l, i) { return i === 0 ? l : '<span class="data-table__task-sub">' + l + '</span>'; }).join('')
        : r.due;
      return '<tr>' +
        '<td>' + r.type + '</td>' +
        '<td><span class="data-table__status-dot" style="background:' + r.statusDot + '"></span>' + r.status + '</td>' +
        '<td>' + dueHtml + '</td>' +
        '<td>' + (r.notify ? '✓' : '—') + '</td>' +
        '<td>—</td>' +
      '</tr>';
    }).join('');
    return listTablePanel(
      toolbar({ count: '1 – 4 of 4', moreActions: false }),
      table(['Type ↑', 'Status', 'Due Date', 'Notifications Enabled', 'Watchers'], rows)
    );
  }

  function renderIssues() {
    return listTablePanel(
      toolbar({ filters: ['Issue Status', 'Issue Assigned To', 'Labels'] }),
      table(['Priority', 'Issue', 'Summary', 'Issue Status', 'Source', 'Reported Date ↓', 'Assigned', 'Labels', 'Watchers'], ''),
      emptyState('No results to show.')
    );
  }

  function renderSensorData() {
    return emptyState('No sensor data snapshots recorded for this vehicle.');
  }

  /* ── Panel router ─────────────────────────────────────────── */
  function renderPanel(tabId, v) {
    if (tabId === 'overview')          return renderOverview(v);
    if (tabId === 'sensor-data')       return renderSensorData();
    if (tabId === 'service-history')   return renderServiceHistory();
    if (tabId === 'inspections')       return renderInspections();
    if (tabId === 'work-orders')       return renderWorkOrders();
    if (tabId === 'service-reminders') return renderReminders();
    if (tabId === 'renewals')          return renderRenewals();
    if (tabId === 'issues')            return renderIssues();
    return '';
  }

  /* ── Tab switching ────────────────────────────────────────── */
  function setTab(tabId, v) {
    document.querySelectorAll('.vd-tab').forEach(function (t) {
      t.classList.toggle('is-active', t.getAttribute('data-tab') === tabId);
    });
    var bodyEl = document.querySelector('.vd-body');
    var isTableTab = tabId !== 'overview';
    if (bodyEl) bodyEl.classList.toggle('vd-body--table', isTableTab);
    var panel = document.getElementById('vd-panel');
    if (panel) panel.innerHTML = renderPanel(tabId, v);
    bindFieldSearch();
    bindGroupToggles();
  }

  /* ── Field search ─────────────────────────────────────────── */
  function bindFieldSearch() {
    var input = document.getElementById('field-search');
    var wrap  = document.getElementById('vehicle-fields');
    if (!input || !wrap) return;
    input.addEventListener('input', function () {
      var q = this.value.toLowerCase();
      wrap.querySelectorAll('.vd-field-row').forEach(function (row) {
        row.hidden = !!q && row.textContent.toLowerCase().indexOf(q) === -1;
      });
    });
  }

  /* ── Group toggles ────────────────────────────────────────── */
  function bindGroupToggles() {
    document.querySelectorAll('.vd-group__toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var group = btn.closest('.vd-group');
        var rows  = group && group.querySelector('.vd-group__rows');
        var chev  = btn.querySelector('.vd-chevron');
        if (!rows) return;
        var open = rows.style.display !== 'none';
        rows.style.display = open ? 'none' : '';
        if (chev) chev.classList.toggle('is-open', !open);
      });
    });
  }

  /* ── Hero dropdown menus ──────────────────────────────────── */
  function closeHeroMenus() {
    document.querySelectorAll('.vd-action-menu__panel').forEach(function (panel) {
      panel.hidden = true;
    });
    document.querySelectorAll('.vd-action-menu__trigger').forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'false');
    });
  }

  function bindHeroMenus() {
    document.querySelectorAll('.vd-action-menu').forEach(function (wrap) {
      wrap.addEventListener('click', function (e) {
        e.stopPropagation();
      });

      var btn  = wrap.querySelector('.vd-action-menu__trigger');
      var menu = wrap.querySelector('.vd-action-menu__panel');
      if (!btn || !menu) return;

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var willOpen = menu.hidden;
        closeHeroMenus();
        if (willOpen) {
          menu.hidden = false;
          btn.setAttribute('aria-expanded', 'true');
        }
      });

      menu.querySelectorAll('.vd-action-menu__item').forEach(function (item) {
        item.addEventListener('click', function () {
          var label = item.querySelector('.vd-action-menu__label');
          if (label && label.textContent === 'Add Expense Entry') {
            var vid = getId();
            window.location.href = 'vehicle-expense-form?vehicle=' + encodeURIComponent(vid);
            return;
          }
          closeHeroMenus();
        });
      });
    });

    if (!bindHeroMenus.bound) {
      document.addEventListener('click', closeHeroMenus);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeHeroMenus();
      });
      bindHeroMenus.bound = true;
    }
  }

  /* ── Icon injection ───────────────────────────────────────── */
  function injectIcons() {
    if (!icons) return;
    document.querySelectorAll('[data-form-icon]').forEach(function (el) {
      var key = el.getAttribute('data-form-icon');
      if (icons[key]) el.innerHTML = icons[key];
    });
  }

  /* ── Init ─────────────────────────────────────────────────── */
  function init() {
    var id = getId();
    var v  = data && data.getById ? data.getById(id) : null;
    if (!v) { window.location.href = 'vehicles'; return; }

    document.title = v.name + ' — YSOAM';

    var heroEl   = document.getElementById('vd-hero');
    var tabsEl   = document.getElementById('vd-tabs');
    var panelEl  = document.getElementById('vd-panel');

    if (heroEl) {
      heroEl.innerHTML = renderHero(v);
      bindHeroMenus();
    }
    if (tabsEl) {
      tabsEl.innerHTML = TABS.map(function (t) {
        return '<button class="vd-tab" data-tab="' + t.id + '" type="button" role="tab">' + t.label + '</button>';
      }).join('') + '<button class="vd-tab vd-tab--more" type="button" disabled>More ▾</button>';
    }

    if (tabsEl) {
      tabsEl.addEventListener('click', function (e) {
        var tab = e.target.closest('.vd-tab[data-tab]');
        if (tab) setTab(tab.getAttribute('data-tab'), v);
      });
    }

    injectIcons();

    var qTab = new URLSearchParams(window.location.search).get('tab') || 'overview';
    if (!TABS.some(function (t) { return t.id === qTab; })) qTab = 'overview';
    setTab(qTab, v);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
