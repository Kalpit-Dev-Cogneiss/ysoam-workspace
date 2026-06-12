(function () {
  var I = window.YSOAM_ICONS;

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

  function navChildLink(subpage, href, label) {
    return '<a class="nav-link nav-link--child" href="' + href + '" data-page="vehicles" data-subpage="' + subpage + '">' +
      '<span class="nav-link__label">' + label + '</span></a>';
  }

  function orgMenuItem(href, label, iconHtml) {
    return '<a class="org-menu__item" href="' + href + '" role="menuitem">' +
      '<span class="org-menu__item-label">' + label + '</span>' +
      '<span class="org-menu__item-icon">' + iconHtml + '</span></a>';
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
            orgMenuItem('settings.html', 'Settings', I.orgGear) +
            orgMenuItem('billing.html', 'Billing &amp; Subscriptions', I.orgCard) +
            orgMenuItem('settings.html', 'User Management', I.orgUsers) +
            orgMenuItem('settings.html', 'Imports', I.orgUpload) +
            orgMenuItem('settings.html', 'Automations', I.orgBolt) +
            '<div class="org-menu__divider" role="separator"></div>' +
            orgMenuItem('settings.html', 'User Profile', I.orgUser) +
            orgMenuItem('settings.html', 'Notification Settings', I.orgBell) +
            orgMenuItem('settings.html', 'Login &amp; Password', I.orgKey) +
            '<div class="org-menu__divider" role="separator"></div>' +
            orgMenuItem('index.html', 'Log Out', I.orgLogout) +
          '</div>' +
        '</div>' +
        '<nav class="sidebar__nav">' +
          navLink('dashboard', 'dashboard.html', 'Dashboard', 'dashboard') +
          navLink('gps', 'gps.html', 'Live Tracking', 'gps') +
          navGroup(
            'Vehicles',
            navChildLink('vehicle-list', 'vehicles.html', 'Vehicle List') +
            navChildLink('assignments', 'vehicle-assignments.html', 'Vehicle Assignments') +
            navChildLink('meter-history', 'meter-history.html', 'Meter History') +
            navChildLink('tire-readings', 'tyres.html', 'Tire Readings') +
            navChildLink('expense-history', 'vehicle-expenses.html', 'Expense History') +
            navChildLink('replacement', 'vehicle-replacement.html', 'Replacement Analysis'),
            false,
            'vehicles',
            'nav-group--submenu nav-group--vehicles'
          ) +
          navLink('drivers', 'drivers.html', 'Drivers', 'drivers') +
          navLink('fuel', 'fuel.html', 'Fuel', 'fuel') +
          navLink('maintenance', 'maintenance.html', 'Maintenance', 'maintenance') +
          navLink('tyres', 'tyres.html', 'Tyres', 'tyres') +
          navLink('battery', 'battery.html', 'Battery', 'battery') +
          navLink('trips', 'trips.html', 'Trips', 'trips') +
          navLink('inventory', 'inventory.html', 'Inventory', 'inventory') +
          navLink('iot', 'iot.html', 'IoT & Sensors', 'iot') +
          navLink('billing', 'billing.html', 'Billing', 'billing') +
          navLink('documents', 'documents.html', 'Documents', 'documents') +
          navLink('reports', 'reports.html', 'Reports', 'reports') +
          navLink('ai', 'ai.html', 'AI Intelligence', 'ai') +
          navLink('driver', 'driver.html', 'Driver View', 'driver') +
        '</nav>' +
        '<div class="sidebar__footer">' +
          '<div class="sidebar__promo">' +
            '<div class="sidebar__promo-title">Profitability-first fleet</div>' +
            '<p class="sidebar__promo-text">See trip margin in 5 clicks with YSOAM.</p>' +
            '<a class="btn btn-primary btn-sm sidebar__promo-btn" href="reports.html">View Reports</a>' +
          '</div>' +
          '<div class="sidebar__footer-links">' +
            navLink('settings', 'settings.html', 'Settings', 'settings') +
            '<a class="nav-link" href="roadmap.html" data-page="roadmap"><span class="nav-link__icon">' + I.reports + '</span><span class="nav-link__label">Help &amp; Support</span></a>' +
          '</div>' +
        '</div>' +
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
        '<div class="topbar__right">' +
          '<a href="billing.html" class="btn btn-outline btn-sm topbar__explore-btn">Explore Plan</a>' +
          '<button type="button" class="topbar__alert" aria-label="Alerts">' + I.bell +
            '<span class="topbar__alert-dot"></span></button>' +
          '<div class="topbar__profile">' +
            '<span class="topbar__profile-name">Demo Manager</span>' +
            '<div class="topbar__avatar" aria-hidden="true">DM</div>' +
          '</div>' +
        '</div>' +
      '</header>',

    bottomNav:
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
  };
})();
