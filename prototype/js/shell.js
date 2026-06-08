(function () {
  var I = window.YSOAM_ICONS;

  function navLink(page, href, label, iconKey) {
    return '<a class="nav-link" href="' + href + '" data-page="' + page + '">' +
      '<span class="nav-link__icon">' + I[iconKey] + '</span>' +
      '<span class="nav-link__label">' + label + '</span></a>';
  }

  window.YSOAM_SHELL = {
    sidebar:
      '<aside class="sidebar" id="sidebar" aria-label="Main navigation">' +
        '<div class="sidebar__brand">' +
          '<div class="sidebar__logo"><span class="sidebar__logo-mark">Y</span>SOAM</div>' +
          '<div class="sidebar__org">Demo Fleet · Mumbai</div>' +
        '</div>' +
        '<nav class="sidebar__nav">' +
          '<div class="nav-group"><div class="nav-group__label">Overview</div>' +
            navLink('dashboard', 'dashboard.html', 'Dashboard', 'dashboard') +
          '</div>' +
          '<div class="nav-group"><div class="nav-group__label">Operations</div>' +
            navLink('gps', 'gps.html', 'GPS Tracking', 'gps') +
            navLink('trips', 'trips.html', 'Trips', 'trips') +
            navLink('inventory', 'inventory.html', 'Inventory', 'inventory') +
            navLink('iot', 'iot.html', 'IoT & Sensors', 'iot') +
          '</div>' +
          '<div class="nav-group"><div class="nav-group__label">Fleet</div>' +
            navLink('vehicles', 'vehicles.html', 'Vehicles', 'vehicles') +
            navLink('drivers', 'drivers.html', 'Drivers', 'drivers') +
            navLink('fuel', 'fuel.html', 'Fuel', 'fuel') +
            navLink('tyres', 'tyres.html', 'Tyres', 'tyres') +
            navLink('maintenance', 'maintenance.html', 'Maintenance', 'maintenance') +
            navLink('battery', 'battery.html', 'Battery', 'battery') +
          '</div>' +
          '<div class="nav-group"><div class="nav-group__label">Finance</div>' +
            navLink('billing', 'billing.html', 'Billing', 'billing') +
          '</div>' +
          '<div class="nav-group"><div class="nav-group__label">Compliance</div>' +
            navLink('documents', 'documents.html', 'Documents', 'documents') +
          '</div>' +
          '<div class="nav-group"><div class="nav-group__label">Analytics</div>' +
            navLink('reports', 'reports.html', 'Reports', 'reports') +
            navLink('ai', 'ai.html', 'AI Intelligence', 'ai') +
          '</div>' +
          '<div class="nav-group"><div class="nav-group__label">Mobile</div>' +
            navLink('driver', 'driver.html', 'Driver View', 'driver') +
          '</div>' +
          '<div class="nav-group"><div class="nav-group__label">Settings</div>' +
            navLink('admin', 'admin.html', 'Admin', 'admin') +
            navLink('settings', 'settings.html', 'Settings', 'settings') +
            navLink('roadmap', 'roadmap.html', 'Roadmap', 'roadmap') +
          '</div>' +
        '</nav>' +
      '</aside>',

    topbar:
      '<header class="topbar">' +
        '<div class="topbar__left">' +
          '<button type="button" class="topbar__menu-btn" id="sidebar-toggle" aria-label="Toggle menu">' + I.menu + '</button>' +
          '<div class="topbar__search-wrap">' +
            '<span class="topbar__search-icon">' + I.search + '</span>' +
            '<input type="search" class="text-input topbar__search" placeholder="Search vehicles, trips, drivers…" aria-label="Search">' +
          '</div>' +
        '</div>' +
        '<div class="topbar__right">' +
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
