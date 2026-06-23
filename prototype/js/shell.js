(function () {
  'use strict';

  var KEY = 'YSOAM_EDITION';

  if (!window.YSOAM_EDITION) {
    var params = new URLSearchParams(window.location.search);
    var path = (window.location.pathname || '').toLowerCase();
    var edition = params.get('edition');

    if (path.indexOf('/mvp') !== -1 || path.endsWith('mvp.html')) edition = 'mvp';
    if (path.indexOf('/full') !== -1 || path.endsWith('full.html')) edition = 'full';

    if (edition === 'mvp' || edition === 'full') {
      try { sessionStorage.setItem(KEY, edition); } catch (e) { /* ignore */ }
    }

    if (!edition) {
      try { edition = sessionStorage.getItem(KEY); } catch (e) { /* ignore */ }
    }

    window.YSOAM_EDITION = edition === 'full' ? 'full' : 'mvp';
  }

  if (!window.YSOAM_EDITION_LOGOUT) {
    window.YSOAM_EDITION_LOGOUT = function () {
      if (window.YSOAM_AUTH && window.YSOAM_AUTH.logout) window.YSOAM_AUTH.logout();
      return 'login?signedOut=1&edition=' + window.YSOAM_EDITION;
    };
  }

  var I = window.YSOAM_ICONS;
  var edition = window.YSOAM_EDITION;
  var isFull = edition === 'full';
  var logoutHref = window.YSOAM_EDITION_LOGOUT();

  function navLink(page, href, label, iconKey) {
    return '<a class="nav-link" href="' + href + '" data-page="' + page + '">' +
      '<span class="nav-link__icon">' + I[iconKey] + '</span>' +
      '<span class="nav-link__label">' + label + '</span></a>';
  }

  function navGroup(title, linksHtml, open, iconKey, extraClass) {
    return (
      '<div class="nav-group' + (extraClass ? ' ' + extraClass : '') + (open ? ' is-open' : '') + '">' +
        '<button type="button" class="nav-group__toggle" aria-expanded="' + (open ? 'true' : 'false') + '">' +
          '<span class="nav-group__icon">' + I[iconKey] + '</span>' +
          '<span class="nav-group__title">' + title + '</span>' +
          '<span class="nav-group__chevron" aria-hidden="true"></span>' +
        '</button>' +
        '<div class="nav-group__items">' + linksHtml + '</div>' +
      '</div>'
    );
  }

  function navChildLink(page, subpage, href, label) {
    return '<a class="nav-link nav-link--child" href="' + href + '" data-page="' + page + '" data-subpage="' + subpage + '">' +
      '<span class="nav-link__label">' + label + '</span></a>';
  }

  function orgMenuItem(href, label, iconHtml) {
    return '<a class="org-menu__item" href="' + href + '" role="menuitem">' +
      '<span class="org-menu__item-label">' + label + '</span>' +
      '<span class="org-menu__item-icon">' + iconHtml + '</span></a>';
  }

  function buildOrgMenu() {
    if (!isFull) {
      return (
        orgMenuItem('settings.html', 'Settings', I.orgGear) +
        orgMenuItem('user-management.html', 'User Management', I.orgUsers) +
        '<div class="org-menu__divider" role="separator"></div>' +
        orgMenuItem('settings.html', 'User Profile', I.orgUser) +
        '<div class="org-menu__divider" role="separator"></div>' +
        orgMenuItem(logoutHref, 'Log Out', I.orgLogout)
      );
    }

    return (
      orgMenuItem('settings.html', 'Settings', I.orgGear) +
      orgMenuItem('billing.html', 'Billing &amp; Subscriptions', I.orgCard) +
      orgMenuItem('user-management.html', 'User Management', I.orgUsers) +
      orgMenuItem('settings.html', 'Imports', I.orgUpload) +
      orgMenuItem('settings.html', 'Automations', I.orgBolt) +
      '<div class="org-menu__divider" role="separator"></div>' +
      orgMenuItem('settings.html', 'User Profile', I.orgUser) +
      orgMenuItem('settings.html', 'Notification Settings', I.orgBell) +
      orgMenuItem('settings.html', 'Login &amp; Password', I.orgKey) +
      '<div class="org-menu__divider" role="separator"></div>' +
      orgMenuItem(logoutHref, 'Log Out', I.orgLogout)
    );
  }

  function vehiclesNavGroup() {
    return navGroup(
      'Vehicles',
      navChildLink('vehicles', 'vehicle-list', 'vehicles.html', 'Vehicle List') +
      navChildLink('vehicles', 'assignments', 'vehicle-assignments.html', 'Vehicle Assignments') +
      navChildLink('vehicles', 'meter-history', 'meter-history.html', 'Meter History') +
      navChildLink('vehicles', 'tire-readings', 'tyres.html', 'Tire Readings') +
      navChildLink('vehicles', 'expense-history', 'vehicle-expenses.html', 'Expense History') +
      navChildLink('vehicles', 'replacement', 'vehicle-replacement.html', 'Replacement Analysis'),
      false,
      'vehicles',
      'nav-group--submenu nav-group--vehicles'
    );
  }

  function serviceNavGroup() {
    return navGroup(
      'Service',
      navChildLink('service', 'service-history', 'service-history.html', 'Service History') +
      navChildLink('service', 'work-orders', 'work-orders.html', 'Work Orders') +
      navChildLink('service', 'service-tasks', 'service-tasks.html', 'Service Tasks') +
      navChildLink('service', 'service-programs', 'maintenance.html', 'Service Programs'),
      false,
      'maintenance',
      'nav-group--submenu nav-group--service'
    );
  }

  function fuelNavGroup() {
    return navGroup(
      'Fuel &amp; Energy',
      navChildLink('fuel', 'fuel-history', 'fuel-history.html', 'Fuel History') +
      navChildLink('fuel', 'charging-history', 'charging-history.html', 'Charging History'),
      false,
      'fuel',
      'nav-group--submenu nav-group--fuel'
    );
  }

  function buildSidebarNav() {
    if (!isFull) {
      return (
        navLink('dashboard', 'dashboard.html', 'Dashboard', 'dashboard') +
        navLink('gps', 'gps.html', 'Tracking', 'gps') +
        vehiclesNavGroup() +
        serviceNavGroup() +
        navLink('drivers', 'drivers.html', 'Drivers', 'drivers') +
        navLink('trips', 'trips.html', 'Trip &amp; Operations', 'trips') +
        fuelNavGroup() +
        navLink('inventory', 'parts.html', 'Inventory', 'inventory') +
        navLink('documents', 'documents.html', 'Documents', 'documents')
      );
    }

    return (
      navLink('dashboard', 'dashboard.html', 'Dashboard', 'dashboard') +
      navLink('gps', 'gps.html', 'Live Tracking', 'gps') +
      vehiclesNavGroup() +
      serviceNavGroup() +
      navLink('drivers', 'drivers.html', 'Drivers', 'drivers') +
      navLink('trips', 'trips.html', 'Trip &amp; Operations', 'trips') +
      fuelNavGroup() +
      navLink('tyres', 'tyres.html', 'Tyres', 'tyres') +
      navLink('battery', 'battery.html', 'Battery', 'battery') +
      navGroup(
        'Parts &amp; Inventory',
        navChildLink('inventory', 'parts-list', 'parts.html', 'Parts List') +
        navChildLink('inventory', 'purchase-orders', 'purchase-orders.html', 'Purchase Orders') +
        navChildLink('inventory', 'bulk-manage', 'inventory.html', 'Bulk Manage'),
        false,
        'inventory',
        'nav-group--submenu nav-group--inventory'
      ) +
      navLink('iot', 'iot.html', 'IoT &amp; Sensors', 'iot') +
      navLink('billing', 'billing.html', 'Billing', 'billing') +
      navLink('documents', 'documents.html', 'Documents', 'documents') +
      navLink('reports', 'reports.html', 'Reports', 'reports') +
      navLink('ai', 'ai.html', 'AI Intelligence', 'ai') +
      navLink('driver', 'driver.html', 'Driver View', 'driver')
    );
  }

  function buildSidebarFooter() {
    if (!isFull) {
      return (
        '<div class="sidebar__footer-links">' +
          '<a class="nav-link" href="' + logoutHref + '" data-page="login">' +
            '<span class="nav-link__icon">' + I.orgLogout + '</span>' +
            '<span class="nav-link__label">Log Out</span>' +
          '</a>' +
        '</div>'
      );
    }

    return (
      '<div class="sidebar__promo">' +
        '<div class="sidebar__promo-title">Profitability-first fleet</div>' +
        '<p class="sidebar__promo-text">See trip margin in 5 clicks with YSOAM.</p>' +
        '<a class="btn btn-primary btn-sm sidebar__promo-btn" href="reports.html">View Reports</a>' +
      '</div>' +
      '<div class="sidebar__footer-links">' +
        navLink('settings', 'settings.html', 'Settings', 'settings') +
        '<a class="nav-link" href="roadmap.html" data-page="roadmap">' +
          '<span class="nav-link__icon">' + I.reports + '</span>' +
          '<span class="nav-link__label">Help &amp; Support</span>' +
        '</a>' +
      '</div>'
    );
  }

  function editionBadge() {
    var label = isFull ? 'Full Platform' : 'MVP';
    var modifier = isFull ? 'full' : 'mvp';
    return '<span class="topbar__edition-badge topbar__edition-badge--' + modifier + '" title="Prototype edition">' + label + '</span>';
  }

  function buildTopbarRight() {
    var explore = isFull
      ? '<a href="billing.html" class="btn btn-outline btn-sm topbar__explore-btn">Explore Plan</a>'
      : '';

    return (
      explore +
      editionBadge() +
      '<button type="button" class="topbar__alert" aria-label="Alerts">' + I.bell +
        '<span class="topbar__alert-dot"></span></button>' +
      '<div class="topbar__profile">' +
        '<span class="topbar__profile-name">Demo Manager</span>' +
        '<div class="topbar__avatar" aria-hidden="true">DM</div>' +
      '</div>'
    );
  }

  function buildBottomNav() {
    if (!isFull) {
      return (
        '<nav class="bottom-nav" aria-label="Mobile navigation">' +
          '<a class="bottom-nav__link" href="dashboard.html" data-page="dashboard">' +
            '<span class="bottom-nav__icon">' + I.dashboard + '</span>Home</a>' +
          '<a class="bottom-nav__link" href="gps.html" data-page="gps">' +
            '<span class="bottom-nav__icon">' + I.gps + '</span>Tracking</a>' +
          '<a class="bottom-nav__link" href="trips.html" data-page="trips">' +
            '<span class="bottom-nav__icon">' + I.trips + '</span>Trips</a>' +
          '<a class="bottom-nav__link" href="vehicles.html" data-page="vehicles">' +
            '<span class="bottom-nav__icon">' + I.vehicles + '</span>Vehicles</a>' +
          '<a class="bottom-nav__link" href="drivers.html" data-page="drivers">' +
            '<span class="bottom-nav__icon">' + I.drivers + '</span>Drivers</a>' +
        '</nav>'
      );
    }

    return (
      '<nav class="bottom-nav" aria-label="Mobile navigation">' +
        '<a class="bottom-nav__link" href="dashboard.html" data-page="dashboard">' +
          '<span class="bottom-nav__icon">' + I.dashboard + '</span>Dashboard</a>' +
        '<a class="bottom-nav__link" href="gps.html" data-page="gps">' +
          '<span class="bottom-nav__icon">' + I.gps + '</span>Map</a>' +
        '<a class="bottom-nav__link" href="trips.html" data-page="trips">' +
          '<span class="bottom-nav__icon">' + I.trips + '</span>Trips</a>' +
        '<a class="bottom-nav__link" href="reports.html" data-page="reports">' +
          '<span class="bottom-nav__icon">' + I.reports + '</span>Reports</a>' +
        '<a class="bottom-nav__link" href="settings.html" data-page="settings">' +
          '<span class="bottom-nav__icon">' + I.settings + '</span>More</a>' +
      '</nav>'
    );
  }

  window.YSOAM_SHELL = {
    sidebar:
      '<aside class="sidebar" id="sidebar" aria-label="Main navigation">' +
        '<div class="sidebar__header">' +
          '<button type="button" class="sidebar__org-trigger" id="org-menu-trigger" aria-expanded="false" aria-haspopup="menu" aria-controls="org-menu">' +
            '<span class="sidebar__org-text">' +
              '<span class="sidebar__org-name">Demo Fleet<span class="sidebar__org-chevron">' + I.chevronDown + '</span></span>' +
              '<span class="sidebar__user-name">Demo Manager</span>' +
            '</span>' +
          '</button>' +
          '<button type="button" class="sidebar__collapse-btn" id="sidebar-collapse" aria-label="Collapse sidebar" title="Collapse sidebar">' +
            I.sidebarCollapse +
          '</button>' +
          '<div class="org-menu" id="org-menu" role="menu" aria-labelledby="org-menu-trigger" hidden>' +
            '<div class="org-menu__brand">' +
              '<span class="org-menu__avatar" aria-hidden="true">' + I.orgPlaceholder + '</span>' +
              '<span class="org-menu__name">Demo Fleet</span>' +
            '</div>' +
            buildOrgMenu() +
          '</div>' +
        '</div>' +
        '<nav class="sidebar__nav">' + buildSidebarNav() + '</nav>' +
        '<div class="sidebar__footer">' + buildSidebarFooter() + '</div>' +
      '</aside>',

    topbar:
      '<header class="topbar">' +
        '<div class="topbar__left">' +
          '<a href="dashboard.html" class="topbar__logo" aria-label="YSOAM home">' +
            '<img src="assets/logo.svg" alt="YSOAM" class="topbar__logo-img" width="108" height="28">' +
          '</a>' +
          '<button type="button" class="topbar__menu-btn" id="sidebar-toggle" aria-label="Toggle menu">' + I.menu + '</button>' +
        '</div>' +
        '<div class="topbar__center">' +
          '<div class="topbar__search-wrap">' +
            '<span class="topbar__search-icon">' + I.search + '</span>' +
            '<input type="search" class="text-input topbar__search" placeholder="Search…" aria-label="Search">' +
          '</div>' +
        '</div>' +
        '<div class="topbar__right">' + buildTopbarRight() + '</div>' +
      '</header>',

    bottomNav: buildBottomNav()
  };
})();
