(function () {
  'use strict';

  var DEMO_USER = {
    initials: 'RK',
    name: 'Rajesh Kumar',
    orgName: 'YSOAM Demo Fleet',
    orgInitial: 'Y'
  };

  var NAV_GROUPS = [
    {
      id: 'user',
      type: 'profile',
      links: [
        { id: 'user-profile', label: 'User Profile' },
        { id: 'notification-settings', label: 'Notification Settings' },
        { id: 'login-password', label: 'Login & Password' },
        { id: 'appearance', label: 'Appearance & Theme' },
        { id: 'api-keys', label: 'Manage API Keys' }
      ]
    },
    {
      id: 'org',
      type: 'org',
      links: [
        { id: 'general-settings', label: 'General Settings' },
        { id: 'billing-subscriptions', label: 'Billing & Subscriptions' },
        { id: 'export-data', label: 'Export Account Data' }
      ]
    },
    {
      id: 'user-access',
      type: 'section',
      icon: 'userPlus',
      title: 'User Access',
      links: [
        { id: 'manage-users', label: 'Manage Users', href: 'user-management', external: true },
        { id: 'security', label: 'Security' },
        { id: 'roles', label: 'Roles' },
        { id: 'record-sets', label: 'Record Sets' }
      ]
    },
    {
      id: 'vehicles',
      type: 'section',
      icon: 'car',
      title: 'Vehicles',
      links: [
        { id: 'vehicle-statuses', label: 'Vehicle Statuses' },
        { id: 'vehicle-types', label: 'Vehicle Types' },
        { id: 'external-vehicle-ids', label: 'External Vehicle IDs' },
        { id: 'expense-types', label: 'Expense Types' }
      ]
    },
    {
      id: 'inspections',
      type: 'section',
      icon: 'clipboardList',
      title: 'Inspections',
      links: [
        { id: 'inspection-settings', label: 'Inspection Settings' }
      ]
    },
    {
      id: 'issues',
      type: 'section',
      icon: 'info',
      title: 'Issues',
      links: [
        { id: 'issue-priorities', label: 'Issue Priorities' },
        { id: 'fault-rules', label: 'Fault Rules' }
      ]
    },
    {
      id: 'reminders',
      type: 'section',
      icon: 'bell',
      title: 'Reminders',
      links: [
        { id: 'service-reminder-settings', label: 'Service Reminder Settings' },
        { id: 'vehicle-renewal-types', label: 'Vehicle Renewal Types' },
        { id: 'contact-renewal-types', label: 'Contact Renewal Types' }
      ]
    },
    {
      id: 'service',
      type: 'section',
      icon: 'settings',
      title: 'Service',
      links: [
        { id: 'maintenance-settings', label: 'Maintenance Settings' },
        { id: 'work-order-statuses', label: 'Work Order Statuses' },
        { id: 'repair-codes', label: 'Reason For Repair Codes' },
        { id: 'repair-priority-codes', label: 'Repair Priority Class Codes' },
        { id: 'vmrs-codes', label: 'System/Assembly/Component Codes' }
      ]
    },
    {
      id: 'parts',
      type: 'section',
      icon: 'package',
      title: 'Parts & Inventory',
      links: [
        { id: 'part-locations', label: 'Part Locations' },
        { id: 'part-categories', label: 'Part Categories' },
        { id: 'part-manufacturers', label: 'Part Manufacturers' },
        { id: 'measurement-units', label: 'Measurement Units' }
      ]
    },
    {
      id: 'fuel',
      type: 'section',
      icon: 'zap',
      title: 'Fuel & Energy',
      links: [
        { id: 'fuel-settings', label: 'Fuel & Energy Settings' },
        { id: 'fuel-types', label: 'Fuel Types' }
      ]
    }
  ];

  var state = {
    activeId: 'user-profile',
    search: ''
  };

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function getQuerySection() {
    var params = new URLSearchParams(window.location.search);
    return params.get('section') || '';
  }

  function allLinks() {
    var links = [];
    NAV_GROUPS.forEach(function (group) {
      group.links.forEach(function (link) {
        links.push(link);
      });
    });
    return links;
  }

  function findLink(id) {
    var found = null;
    allLinks().some(function (link) {
      if (link.id === id) {
        found = link;
        return true;
      }
      return false;
    });
    return found;
  }

  function renderAvatar(initials, className, color) {
    return '<span class="' + className + '" style="background:' + esc(color || '#B678CE') + '">' + esc(initials) + '</span>';
  }

  function renderOrgIcon() {
    return '<span class="settings-org-icon" aria-hidden="true">' + esc(DEMO_USER.orgInitial) + '</span>';
  }

  function renderLink(link) {
    var isActive = link.id === state.activeId;
    var href = link.href ? link.href : 'settings?section=' + encodeURIComponent(link.id);
    var badge = link.badge
      ? '<span class="settings-nav-badge' + (link.badge === 'Beta' ? ' settings-nav-badge--beta' : '') + '">' + esc(link.badge) + '</span>'
      : '';
    var external = link.external
      ? '<span class="settings-nav-external" data-lucide-icon="externalLink" aria-hidden="true"></span>'
      : '';
    return (
      '<li class="settings-nav-item' + (isActive ? ' is-active' : '') + '">' +
        '<a class="settings-nav-link" href="' + esc(href) + '"' +
          (link.external ? ' target="_blank" rel="noopener noreferrer"' : '') +
          ' data-settings-id="' + esc(link.id) + '">' +
          '<span class="settings-nav-link__label">' + esc(link.label) + badge + '</span>' +
          external +
        '</a>' +
      '</li>'
    );
  }

  function groupMatchesSearch(group) {
    if (!state.search) return true;
    var q = state.search.toLowerCase();
    if (group.title && group.title.toLowerCase().indexOf(q) !== -1) return true;
  return group.links.some(function (link) {
      return link.label.toLowerCase().indexOf(q) !== -1;
    });
  }

  function renderNav() {
    var html = '<ul class="settings-nav-list">';
    NAV_GROUPS.forEach(function (group) {
      if (!groupMatchesSearch(group)) return;

      html += '<li class="settings-nav-group">';
      if (group.type === 'profile') {
        html +=
          '<div class="settings-nav-profile">' +
            '<div class="settings-nav-profile__row">' +
              renderAvatar(DEMO_USER.initials, 'settings-nav-avatar') +
              '<span class="settings-nav-profile__name">' + esc(DEMO_USER.name) + '</span>' +
            '</div>' +
            '<button type="button" class="settings-logout" id="settings-logout">Log Out</button>' +
          '</div>';
      } else if (group.type === 'org') {
        html +=
          '<div class="settings-nav-org">' +
            renderOrgIcon() +
            '<span class="settings-nav-org__name">' + esc(DEMO_USER.orgName) + '</span>' +
          '</div>';
      } else if (group.type === 'section') {
        html +=
          '<div class="settings-nav-section-title">' +
            '<span class="settings-nav-section-title__icon" data-lucide-icon="' + esc(group.icon) + '" aria-hidden="true"></span>' +
            '<span>' + esc(group.title) + '</span>' +
          '</div>';
      }

      html += '<ul class="settings-nav-sublist">';
      group.links.forEach(function (link) {
        if (state.search && link.label.toLowerCase().indexOf(state.search.toLowerCase()) === -1 &&
            !(group.title && group.title.toLowerCase().indexOf(state.search.toLowerCase()) !== -1)) {
          return;
        }
        html += renderLink(link);
      });
      html += '</ul></li>';
    });
    html += '</ul>';
    document.getElementById('settings-nav').innerHTML = html;

    if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) {
      window.YSOAM_LUCIDE.init(document.getElementById('settings-nav'));
    }
  }

  function panelTitle(id) {
    var link = findLink(id);
    return link ? link.label : 'Settings';
  }

  function renderStubPanel(id) {
    return (
      '<div class="settings-panel" id="settings-panel-' + esc(id) + '" data-settings-panel="' + esc(id) + '">' +
        '<h2 class="settings-panel__title">' + esc(panelTitle(id)) + '</h2>' +
        '<div class="settings-stub-card">' +
          '<p>Configuration UI for <strong>' + esc(panelTitle(id)) + '</strong> will be built in a later prototype pass.</p>' +
          '<p class="settings-stub-card__hint">Use the sidebar to browse all settings areas modeled after Fleetio.</p>' +
        '</div>' +
      '</div>'
    );
  }

  function showPanel(id) {
    var navActiveId = id === 'billing-plans' ? 'billing-subscriptions' : id;
    var builtIn = id === 'user-profile' || id === 'notification-settings' || id === 'login-password' || id === 'api-keys' || id === 'general-settings' || id === 'billing-subscriptions' || id === 'billing-plans' || id === 'export-data' || id === 'security' || id === 'roles' || id === 'record-sets' || id === 'vehicle-statuses' || id === 'vehicle-types' || id === 'external-vehicle-ids' || id === 'expense-types' || id === 'inspection-settings' || id === 'issue-priorities' || id === 'fault-rules' || id === 'service-reminder-settings' || id === 'vehicle-renewal-types' || id === 'contact-renewal-types' || id === 'maintenance-settings' || id === 'work-order-statuses' || id === 'repair-codes' || id === 'repair-priority-codes' || id === 'vmrs-codes' || id === 'part-locations' || id === 'part-categories' || id === 'part-manufacturers' || id === 'measurement-units' || id === 'fuel-settings' || id === 'fuel-types';
    if (builtIn) {
      state.activeId = navActiveId;
      renderNav();
      document.querySelectorAll('.settings-panel').forEach(function (panel) {
        panel.classList.toggle('is-active', panel.getAttribute('data-settings-panel') === id);
      });
      var titleId = id === 'billing-plans' ? 'billing-subscriptions' : id;
      document.title = (id === 'billing-plans' ? 'Browse Plans' : panelTitle(titleId)) + ' — Settings — YSOAM';
      if (id === 'notification-settings' && window.YSOAM_SETTINGS_NOTIFICATIONS) {
        window.YSOAM_SETTINGS_NOTIFICATIONS.init();
      }
      if (id === 'login-password' && window.YSOAM_SETTINGS_LOGIN) {
        window.YSOAM_SETTINGS_LOGIN.init();
      }
      if (id === 'api-keys' && window.YSOAM_SETTINGS_API_KEYS) {
        window.YSOAM_SETTINGS_API_KEYS.init();
      }
      if (id === 'general-settings' && window.YSOAM_SETTINGS_GENERAL) {
        window.YSOAM_SETTINGS_GENERAL.init();
      }
      if ((id === 'billing-subscriptions' || id === 'billing-plans') && window.YSOAM_SETTINGS_BILLING) {
        window.YSOAM_SETTINGS_BILLING.init();
      }
      if (id === 'export-data' && window.YSOAM_SETTINGS_EXPORT) {
        window.YSOAM_SETTINGS_EXPORT.init();
      }
      if (id === 'security' && window.YSOAM_SETTINGS_SECURITY) {
        window.YSOAM_SETTINGS_SECURITY.init();
      }
      if (id === 'roles' && window.YSOAM_SETTINGS_ROLES) {
        window.YSOAM_SETTINGS_ROLES.init();
      }
      if (id === 'record-sets' && window.YSOAM_SETTINGS_RECORD_SETS) {
        window.YSOAM_SETTINGS_RECORD_SETS.init();
      }
      if ((id === 'vehicle-statuses' || id === 'vehicle-types' || id === 'external-vehicle-ids' || id === 'expense-types') && window.YSOAM_SETTINGS_VEHICLES) {
        window.YSOAM_SETTINGS_VEHICLES.init(id);
      }
      if ((id === 'inspection-settings' || id === 'issue-priorities' || id === 'fault-rules' || id === 'service-reminder-settings' || id === 'vehicle-renewal-types' || id === 'contact-renewal-types') && window.YSOAM_SETTINGS_OPS) {
        window.YSOAM_SETTINGS_OPS.init(id);
      }
      if ((id === 'maintenance-settings' || id === 'work-order-statuses' || id === 'repair-codes' || id === 'repair-priority-codes' || id === 'vmrs-codes') && window.YSOAM_SETTINGS_SERVICE) {
        window.YSOAM_SETTINGS_SERVICE.init(id);
      }
      if ((id === 'part-locations' || id === 'part-categories' || id === 'part-manufacturers' || id === 'measurement-units' || id === 'fuel-settings' || id === 'fuel-types') && window.YSOAM_SETTINGS_PARTS_FUEL) {
        window.YSOAM_SETTINGS_PARTS_FUEL.init(id);
      }
      return;
    }

    var main = document.getElementById('settings-main');
    var existing = document.getElementById('settings-panel-' + id);
    if (!existing) {
      main.insertAdjacentHTML('beforeend', renderStubPanel(id));
    }

    state.activeId = id;
    renderNav();
    document.querySelectorAll('.settings-panel').forEach(function (panel) {
      panel.classList.toggle('is-active', panel.getAttribute('data-settings-panel') === id);
    });
    document.title = panelTitle(id) + ' — Settings — YSOAM';
  }

  function bindNavClicks() {
    document.getElementById('settings-nav').addEventListener('click', function (e) {
      var link = e.target.closest('[data-settings-id]');
      if (!link || link.target === '_blank') return;
      e.preventDefault();
      var id = link.getAttribute('data-settings-id');
      showPanel(id);
      var url = new URL(window.location.href);
      url.searchParams.set('section', id);
      window.history.replaceState({}, '', url.pathname + url.search);
    });
  }

  function bindSearch() {
    var input = document.getElementById('settings-search');
    input.addEventListener('input', function () {
      state.search = input.value.trim();
      renderNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && !e.target.closest('input, textarea, select')) {
        e.preventDefault();
        input.focus();
      }
    });
  }

  function bindProfileForm() {
    var form = document.getElementById('settings-profile-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
    });

    var pickBtn = document.getElementById('settings-pick-file');
    var fileInput = document.getElementById('settings-photo-input');
    if (pickBtn && fileInput) {
      pickBtn.addEventListener('click', function () { fileInput.click(); });
    }
  }

  function bindLogout() {
    document.getElementById('settings-nav').addEventListener('click', function (e) {
      if (e.target.id !== 'settings-logout') return;
      if (window.YSOAM_AUTH && window.YSOAM_AUTH.logout) {
        window.YSOAM_AUTH.logout();
      }
      window.location.href = 'login?signedOut=1';
    });
  }

  function init() {
    var section = getQuerySection();
    if (section === 'billing-plans') {
      showPanel('billing-plans');
    } else if (section && findLink(section)) {
      showPanel(section);
    } else {
      state.activeId = 'user-profile';
      renderNav();
    }

    if (state.activeId === 'notification-settings' && window.YSOAM_SETTINGS_NOTIFICATIONS) {
      window.YSOAM_SETTINGS_NOTIFICATIONS.init();
    }
    if (state.activeId === 'login-password' && window.YSOAM_SETTINGS_LOGIN) {
      window.YSOAM_SETTINGS_LOGIN.init();
    }
    if (state.activeId === 'api-keys' && window.YSOAM_SETTINGS_API_KEYS) {
      window.YSOAM_SETTINGS_API_KEYS.init();
    }
    if (state.activeId === 'general-settings' && window.YSOAM_SETTINGS_GENERAL) {
      window.YSOAM_SETTINGS_GENERAL.init();
    }
    if ((state.activeId === 'billing-subscriptions' || section === 'billing-plans') && window.YSOAM_SETTINGS_BILLING) {
      window.YSOAM_SETTINGS_BILLING.init();
    }
    if (state.activeId === 'export-data' && window.YSOAM_SETTINGS_EXPORT) {
      window.YSOAM_SETTINGS_EXPORT.init();
    }
    if (state.activeId === 'security' && window.YSOAM_SETTINGS_SECURITY) {
      window.YSOAM_SETTINGS_SECURITY.init();
    }
    if (state.activeId === 'roles' && window.YSOAM_SETTINGS_ROLES) {
      window.YSOAM_SETTINGS_ROLES.init();
    }
    if (state.activeId === 'record-sets' && window.YSOAM_SETTINGS_RECORD_SETS) {
      window.YSOAM_SETTINGS_RECORD_SETS.init();
    }
    if (state.activeId === 'vehicle-statuses' || state.activeId === 'vehicle-types' || state.activeId === 'external-vehicle-ids' || state.activeId === 'expense-types') {
      if (window.YSOAM_SETTINGS_VEHICLES) window.YSOAM_SETTINGS_VEHICLES.init(state.activeId);
    }
    if (state.activeId === 'inspection-settings' || state.activeId === 'issue-priorities' || state.activeId === 'fault-rules' || state.activeId === 'service-reminder-settings' || state.activeId === 'vehicle-renewal-types' || state.activeId === 'contact-renewal-types') {
      if (window.YSOAM_SETTINGS_OPS) window.YSOAM_SETTINGS_OPS.init(state.activeId);
    }
    if (state.activeId === 'maintenance-settings' || state.activeId === 'work-order-statuses' || state.activeId === 'repair-codes' || state.activeId === 'repair-priority-codes' || state.activeId === 'vmrs-codes') {
      if (window.YSOAM_SETTINGS_SERVICE) window.YSOAM_SETTINGS_SERVICE.init(state.activeId);
    }
    if (state.activeId === 'part-locations' || state.activeId === 'part-categories' || state.activeId === 'part-manufacturers' || state.activeId === 'measurement-units' || state.activeId === 'fuel-settings' || state.activeId === 'fuel-types') {
      if (window.YSOAM_SETTINGS_PARTS_FUEL) window.YSOAM_SETTINGS_PARTS_FUEL.init(state.activeId);
    }

    bindNavClicks();
    bindSearch();
    bindProfileForm();
    bindLogout();

    var backIcon = document.querySelector('.settings-back [data-form-icon="arrowLeft"]');
    if (backIcon && window.YSOAM_ICONS && window.YSOAM_ICONS.arrowLeft) {
      backIcon.innerHTML = window.YSOAM_ICONS.arrowLeft;
    }
    if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) {
      window.YSOAM_LUCIDE.init(document.querySelector('.settings-sidebar'));
    }
  }

  window.YSOAM_SETTINGS = { showPanel: showPanel };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
