(function () {
  'use strict';

  var MODULES = [
    'Vehicles', 'Meter Entries', 'Fuel Entries', 'Issues', 'Faults', 'Recalls',
    'Service Task Management', 'Service Entries', 'Work Orders', 'Inspections',
    'Vehicle Service Reminders', 'Vehicle Service Programs', 'Vehicle Renewal Reminders',
    'Contacts', 'Contact Renewal Reminders', 'Vendors', 'Parts', 'Reports', 'Places',
    'Location Entries', 'Expense Entries', 'Dashboards', 'Documents', 'Integrations'
  ];

  var roles = [
    {
      id: 'fleet-manager',
      name: 'Fleet Manager',
      description: 'Create, view, and edit records across most YSOAM modules.',
      users: '—',
      createdAt: '06/16/2026 10:00am',
      updatedAt: '06/16/2026 10:00am',
      isDefault: true,
      locked: true
    },
    {
      id: 'operator',
      name: 'Operator',
      description: 'Create fuel entries and issues, submit inspections, view service, and more.',
      users: '—',
      createdAt: '06/16/2026 10:00am',
      updatedAt: '06/16/2026 10:00am'
    },
    {
      id: 'technician',
      name: 'Technician',
      description: 'Create issues, service entries, and other activities related to maintenance and repairs.',
      users: '—',
      createdAt: '06/16/2026 10:00am',
      updatedAt: '06/16/2026 10:00am'
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'View-only access across most YSOAM modules.',
      users: '—',
      createdAt: '06/16/2026 10:00am',
      updatedAt: '06/16/2026 10:00am'
    }
  ];

  var searchQuery = '';

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function initLucide(root) {
    if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) {
      window.YSOAM_LUCIDE.init(root || document);
    }
  }

  function filteredRoles() {
    if (!searchQuery) return roles.slice();
    var q = searchQuery.toLowerCase();
    return roles.filter(function (role) {
      return role.name.toLowerCase().indexOf(q) !== -1 ||
        role.description.toLowerCase().indexOf(q) !== -1;
    });
  }

  function renderTable() {
    var body = document.getElementById('roles-table-body');
    var label = document.getElementById('roles-pager-label');
    if (!body) return;

    var rows = filteredRoles();
    if (label) {
      label.textContent = rows.length ? '1 – ' + rows.length + ' of ' + rows.length : '0 of 0';
    }

    body.innerHTML = rows.map(function (role) {
      var badges = '';
      if (role.isDefault) {
        badges += '<span class="settings-access-badge settings-access-badge--muted">Default</span>';
      }
      var lock = role.locked ? '<span class="settings-access-lock" data-lucide-icon="lock" aria-label="Locked role"></span>' : '';
      return (
        '<tr>' +
          '<td class="settings-access-table__check">' +
            (role.locked ? '' : '<input type="checkbox" aria-label="Select ' + esc(role.name) + '">') +
          '</td>' +
          '<td>' +
            '<div class="settings-access-name">' + lock +
              '<div><strong>' + esc(role.name) + '</strong> ' + badges +
              '<p class="settings-access-name__desc">' + esc(role.description) + '</p></div>' +
            '</div>' +
          '</td>' +
          '<td>' + esc(role.users) + '</td>' +
          '<td><span class="settings-access-date">' + esc(role.createdAt) + '</span></td>' +
          '<td><span class="settings-access-date">' + esc(role.updatedAt) + '</span></td>' +
        '</tr>'
      );
    }).join('');

    initLucide(body);
  }

  function renderPermissions() {
    var body = document.getElementById('role-permissions-body');
    if (!body || body.dataset.rendered === '1') return;
    body.dataset.rendered = '1';
    body.innerHTML = MODULES.map(function (mod, i) {
      var name = 'perm-' + i;
      return (
        '<tr>' +
          '<td>' + esc(mod) + '</td>' +
          '<td><label class="role-perm-radio"><input type="radio" name="' + name + '" value="full"><span></span></label></td>' +
          '<td><label class="role-perm-radio"><input type="radio" name="' + name + '" value="some"><span></span></label></td>' +
          '<td><label class="role-perm-radio"><input type="radio" name="' + name + '" value="none" checked><span></span></label></td>' +
        '</tr>'
      );
    }).join('');
  }

  function setAllPermissions(value) {
    MODULES.forEach(function (_, i) {
      var input = document.querySelector('input[name="perm-' + i + '"][value="' + value + '"]');
      if (input) input.checked = true;
    });
  }

  function openModal() {
    var overlay = document.getElementById('role-modal');
    var form = document.getElementById('role-form');
    if (!overlay || !form) return;
    form.reset();
    setAllPermissions('none');
    overlay.classList.add('is-open');
    document.getElementById('role-name').focus();
    initLucide(overlay);
  }

  function closeModal() {
    var overlay = document.getElementById('role-modal');
    if (overlay) overlay.classList.remove('is-open');
  }

  function bindModal() {
    var addBtn = document.getElementById('roles-add-btn');
    var overlay = document.getElementById('role-modal');
    var closeBtn = document.getElementById('role-modal-close');
    var cancelBtn = document.getElementById('role-modal-cancel');
    var form = document.getElementById('role-form');
    var fullBtn = document.getElementById('role-select-full');
    var noneBtn = document.getElementById('role-select-none');

    if (addBtn && !addBtn.dataset.bound) {
      addBtn.dataset.bound = '1';
      addBtn.addEventListener('click', openModal);
    }
    if (closeBtn && !closeBtn.dataset.bound) {
      closeBtn.dataset.bound = '1';
      closeBtn.addEventListener('click', closeModal);
    }
    if (cancelBtn && !cancelBtn.dataset.bound) {
      cancelBtn.dataset.bound = '1';
      cancelBtn.addEventListener('click', closeModal);
    }
    if (overlay && !overlay.dataset.bound) {
      overlay.dataset.bound = '1';
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeModal();
      });
    }
    if (fullBtn && !fullBtn.dataset.bound) {
      fullBtn.dataset.bound = '1';
      fullBtn.addEventListener('click', function () { setAllPermissions('full'); });
    }
    if (noneBtn && !noneBtn.dataset.bound) {
      noneBtn.dataset.bound = '1';
      noneBtn.addEventListener('click', function () { setAllPermissions('none'); });
    }
    if (form && !form.dataset.bound) {
      form.dataset.bound = '1';
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = document.getElementById('role-name').value.trim();
        var description = document.getElementById('role-description').value.trim();
        if (!name) return;
        var now = new Date().toLocaleString('en-IN', {
          month: '2-digit', day: '2-digit', year: 'numeric',
          hour: 'numeric', minute: '2-digit', hour12: true
        }).toLowerCase();
        roles.push({
          id: 'role-' + Date.now(),
          name: name,
          description: description || 'Custom role',
          users: '—',
          createdAt: now,
          updatedAt: now
        });
        renderTable();
        closeModal();
      });
    }
  }

  function bindSearch() {
    var input = document.getElementById('roles-search');
    if (!input || input.dataset.bound === '1') return;
    input.dataset.bound = '1';
    input.addEventListener('input', function () {
      searchQuery = input.value.trim();
      renderTable();
    });
  }

  function init() {
    renderPermissions();
    bindModal();
    bindSearch();
    renderTable();
    var panel = document.getElementById('settings-panel-roles');
    if (panel) initLucide(panel);
  }

  window.YSOAM_SETTINGS_ROLES = { init: init };
})();
