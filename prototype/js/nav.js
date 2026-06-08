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
  }

  function markActiveNav() {
    if (!currentPage) return;

    document.querySelectorAll('[data-page]').forEach(function (el) {
      el.classList.toggle('is-active', el.getAttribute('data-page') === currentPage);
    });
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
