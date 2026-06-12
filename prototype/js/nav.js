(function () {
  var currentPage = document.body.getAttribute('data-page');

  function injectShell() {
    var shell = window.YSOAM_SHELL;
    if (!shell) return;

    var sidebarRoot = document.getElementById('sidebar-root');
    var topbarRoot = document.getElementById('topbar-root');
    var bottomNavRoot = document.getElementById('bottom-nav-root');

    if (sidebarRoot) sidebarRoot.innerHTML = shell.sidebar;
    if (topbarRoot) topbarRoot.innerHTML = shell.topbar;
    if (bottomNavRoot) bottomNavRoot.innerHTML = shell.bottomNav;

    markActiveNav();
    initSidebar();
    initSidebarCollapse();
    initOrgMenu();
    initNavGroups();
  }

  function initNavGroups() {
    document.querySelectorAll('.nav-group__toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var group = btn.closest('.nav-group');
        var sidebar = document.getElementById('sidebar');
        if (!group) return;

        if (sidebar && sidebar.classList.contains('is-collapsed')) {
          document.querySelectorAll('.nav-group.is-flyout-open').forEach(function (g) {
            if (g !== group) g.classList.remove('is-flyout-open');
          });
          group.classList.toggle('is-flyout-open');
          return;
        }

        group.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', group.classList.contains('is-open') ? 'true' : 'false');
      });
    });

    document.addEventListener('click', function (e) {
      var sidebar = document.getElementById('sidebar');
      if (!sidebar || !sidebar.classList.contains('is-collapsed')) return;
      if (!e.target.closest('.nav-group')) {
        document.querySelectorAll('.nav-group.is-flyout-open').forEach(function (g) {
          g.classList.remove('is-flyout-open');
        });
      }
    });
  }

  function markActiveNav() {
    if (!currentPage) return;

    var currentSubpage = document.body.getAttribute('data-subpage');

    document.querySelectorAll('.nav-link[data-page]').forEach(function (el) {
      if (el.classList.contains('nav-link--child')) return;
      el.classList.toggle('is-active', el.getAttribute('data-page') === currentPage);
    });

    document.querySelectorAll('.nav-link--child[data-subpage]').forEach(function (el) {
      el.classList.toggle('is-active', el.getAttribute('data-subpage') === currentSubpage);
    });

    var vehiclesGroup = document.querySelector('.nav-group--vehicles');
    if (vehiclesGroup && (currentPage === 'vehicles' || currentSubpage)) {
      vehiclesGroup.classList.add('is-open');
      var toggle = vehiclesGroup.querySelector('.nav-group__toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
    }
  }

  function initSidebar() {
    var toggle = document.getElementById('sidebar-toggle');
    var sidebar = document.getElementById('sidebar');
    var backdrop = document.getElementById('sidebar-backdrop');

    if (!toggle || !sidebar) return;

    function closeSidebar() {
      sidebar.classList.remove('is-open');
      if (backdrop) backdrop.classList.remove('is-visible');
    }

    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('is-open');
      if (backdrop) backdrop.classList.toggle('is-visible');
    });

    if (backdrop) backdrop.addEventListener('click', closeSidebar);
  }

  function initSidebarCollapse() {
    var collapseBtn = document.getElementById('sidebar-collapse');
    var sidebar = document.getElementById('sidebar');
    var sidebarRoot = document.getElementById('sidebar-root');
    var appShell = document.querySelector('.app-shell');
    var I = window.YSOAM_ICONS;

    if (!collapseBtn || !sidebar) return;

    var storageKey = 'ysoam-sidebar-collapsed';

    function setCollapsed(collapsed) {
      sidebar.classList.toggle('is-collapsed', collapsed);
      if (appShell) appShell.classList.toggle('sidebar-collapsed', collapsed);
      if (sidebarRoot) sidebarRoot.classList.toggle('is-collapsed', collapsed);
      collapseBtn.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
      collapseBtn.setAttribute('title', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
      collapseBtn.innerHTML = collapsed ? I.sidebarExpand : I.sidebarCollapse;
      try {
        localStorage.setItem(storageKey, collapsed ? '1' : '0');
      } catch (e) { /* ignore */ }
    }

    var saved = false;
    try {
      saved = localStorage.getItem(storageKey) === '1';
    } catch (e) { /* ignore */ }

    if (saved) setCollapsed(true);

    collapseBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setCollapsed(!sidebar.classList.contains('is-collapsed'));
      closeOrgMenu();
    });
  }

  function closeOrgMenu() {
    var menu = document.getElementById('org-menu');
    var trigger = document.getElementById('org-menu-trigger');
    if (!menu || !trigger) return;
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  }

  function initOrgMenu() {
    var trigger = document.getElementById('org-menu-trigger');
    var menu = document.getElementById('org-menu');
    var sidebar = document.getElementById('sidebar');

    if (!trigger || !menu) return;

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      if (sidebar && sidebar.classList.contains('is-collapsed')) {
        sidebar.classList.remove('is-collapsed');
        var appShell = document.querySelector('.app-shell');
        var sidebarRoot = document.getElementById('sidebar-root');
        if (appShell) appShell.classList.remove('sidebar-collapsed');
        if (sidebarRoot) sidebarRoot.classList.remove('is-collapsed');
        var collapseBtn = document.getElementById('sidebar-collapse');
        if (collapseBtn && window.YSOAM_ICONS) {
          collapseBtn.innerHTML = window.YSOAM_ICONS.sidebarCollapse;
        }
        try { localStorage.setItem('ysoam-sidebar-collapsed', '0'); } catch (err) { /* ignore */ }
        return;
      }
      var open = menu.hidden;
      menu.hidden = !open;
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.addEventListener('click', function (e) {
      if (!menu.hidden && !menu.contains(e.target) && !trigger.contains(e.target)) {
        closeOrgMenu();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeOrgMenu();
    });
  }

  function initModals() {
    document.querySelectorAll('[data-modal-open]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var id = trigger.getAttribute('data-modal-open');
        var modal = document.getElementById(id);
        if (modal) modal.classList.add('is-open');
      });
    });

    document.querySelectorAll('[data-modal-close]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var modal = btn.closest('.modal-overlay');
        if (modal) modal.classList.remove('is-open');
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) overlay.classList.remove('is-open');
      });
    });
  }

  function initTabs() {
    document.querySelectorAll('.tabs').forEach(function (tabBar) {
      var tabs = tabBar.querySelectorAll('.tab');

      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          var target = tab.getAttribute('data-tab');

          tabs.forEach(function (t) { t.classList.remove('is-active'); });
          tab.classList.add('is-active');

          document.querySelectorAll('.tab-panel').forEach(function (panel) {
            panel.classList.toggle('is-active', panel.getAttribute('data-tab-panel') === target);
          });
        });
      });
    });
  }

  function initTripDetail() {
    document.querySelectorAll('[data-trip-detail]').forEach(function (row) {
      row.addEventListener('click', function () {
        document.querySelectorAll('[data-trip-detail]').forEach(function (r) {
          r.classList.remove('is-selected');
        });
        row.classList.add('is-selected');

        var detail = document.getElementById('trip-profit-detail');
        if (detail) detail.hidden = false;
      });
    });
  }

  function initVehicleSelect() {
    document.querySelectorAll('[data-vehicle-id]').forEach(function (item) {
      item.addEventListener('click', function () {
        document.querySelectorAll('[data-vehicle-id]').forEach(function (el) {
          el.classList.remove('is-selected');
        });
        item.classList.add('is-selected');
      });
    });
  }

  function initDriverTabs() {
    document.querySelectorAll('.driver-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-driver-tab');

        document.querySelectorAll('.driver-tab').forEach(function (t) {
          t.classList.remove('is-active');
        });
        tab.classList.add('is-active');

        document.querySelectorAll('.driver-tab-panel').forEach(function (panel) {
          panel.classList.toggle('is-active', panel.getAttribute('data-driver-panel') === target);
        });
      });
    });
  }

  injectShell();

  document.addEventListener('DOMContentLoaded', function () {
    initModals();
    initTabs();
    initTripDetail();
    initVehicleSelect();
    initDriverTabs();

    if (window.location.hash === '#profit-detail') {
      var detail = document.getElementById('trip-profit-detail');
      if (detail) detail.hidden = false;
    }
  });
})();
