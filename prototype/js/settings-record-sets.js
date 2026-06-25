(function () {
  'use strict';

  var VEHICLE_CONDITIONS = [
    'All vehicles',
    'Vehicles in this contact\'s group',
    'Vehicles assigned to this contact',
    'Specific vehicles',
    'Vehicles in specific groups',
    'Vehicles with specific status(es)',
    'Vehicles with specific custom field values',
    'No vehicles'
  ];

  var RECORD_SETS = {
    vehicles: [
      {
        id: 'assigned-only',
        name: 'Assigned Vehicles Only',
        description: 'Users can view and update only vehicles to which they are assigned.',
        manage: 'Some',
        view: 'Some',
        users: '—',
        locked: true,
        shield: true
      },
      {
        id: 'all-vehicles',
        name: 'All Vehicles',
        description: 'Users can view and manage all vehicles in the account.',
        manage: 'All',
        view: 'All',
        users: '—',
        locked: true,
        shield: true
      },
      {
        id: 'active-fleet',
        name: 'Active Fleet',
        description: 'Vehicles with Active status only.',
        manage: 'Some',
        view: 'Some',
        users: '—',
        locked: true
      },
      {
        id: 'archived',
        name: 'Archived Vehicles',
        description: 'View-only access to archived vehicles.',
        manage: 'None',
        view: 'Some',
        users: '—',
        locked: true
      },
      {
        id: 'service-group',
        name: 'Service Group Vehicles',
        description: 'Vehicles assigned to the Service department group.',
        manage: 'Some',
        view: 'All',
        users: '—',
        locked: true
      }
    ],
    contacts: [],
    'part-locations': [],
    'inspection-forms': []
  };

  var activeTab = 'vehicles';
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

  function accessCell(level, icon) {
    return (
      '<span class="settings-access-level">' +
        '<span data-lucide-icon="' + icon + '" aria-hidden="true"></span> ' +
        esc(level) +
      '</span>'
    );
  }

  function filteredSets() {
    var list = RECORD_SETS[activeTab] || [];
    if (!searchQuery) return list.slice();
    var q = searchQuery.toLowerCase();
    return list.filter(function (item) {
      return item.name.toLowerCase().indexOf(q) !== -1 ||
        item.description.toLowerCase().indexOf(q) !== -1;
    });
  }

  function renderTable() {
    var body = document.getElementById('record-sets-table-body');
    var label = document.getElementById('record-sets-pager-label');
    if (!body) return;

    var rows = filteredSets();
    if (label) {
      label.textContent = rows.length ? '1 – ' + rows.length + ' of ' + rows.length : '0 of 0';
    }

    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="5" class="settings-access-empty">No record sets for this type yet.</td></tr>';
      return;
    }

    body.innerHTML = rows.map(function (item) {
      var lock = item.locked ? '<span class="settings-access-lock" data-lucide-icon="lock" aria-label="Locked"></span>' : '';
      var shield = item.shield ? '<span class="settings-access-shield" data-lucide-icon="shield" aria-hidden="true"></span>' : '';
      return (
        '<tr>' +
          '<td class="settings-access-table__check"><input type="checkbox" aria-label="Select ' + esc(item.name) + '"></td>' +
          '<td>' +
            '<div class="settings-access-name">' + lock +
              '<div><strong>' + esc(item.name) + '</strong> ' + shield +
              '<p class="settings-access-name__desc">' + esc(item.description) + '</p></div>' +
            '</div>' +
          '</td>' +
          '<td>' + accessCell(item.manage, 'pencil') + '</td>' +
          '<td>' + accessCell(item.view, 'eye') + '</td>' +
          '<td>' + esc(item.users) + '</td>' +
        '</tr>'
      );
    }).join('');

    initLucide(body);
  }

  function bindTabs() {
    var tabs = document.querySelectorAll('[data-record-tab]');
    tabs.forEach(function (tab) {
      if (tab.dataset.bound === '1') return;
      tab.dataset.bound = '1';
      tab.addEventListener('click', function () {
        activeTab = tab.getAttribute('data-record-tab');
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle('is-active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        searchQuery = '';
        var input = document.getElementById('record-sets-search');
        if (input) input.value = '';
        renderTable();
      });
    });
  }

  function createConditionRow(target) {
    var row = document.createElement('div');
    row.className = 'record-set-condition-row';
    var select = document.createElement('select');
    select.className = 'record-set-condition-select';
    select.setAttribute('aria-label', target + ' condition');
    VEHICLE_CONDITIONS.forEach(function (opt) {
      var option = document.createElement('option');
      option.value = opt;
      option.textContent = opt;
      select.appendChild(option);
    });
    var remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'btn btn-text btn-sm record-set-condition-remove';
    remove.textContent = 'Remove';
    remove.addEventListener('click', function () { row.remove(); });
    row.appendChild(select);
    row.appendChild(remove);
    return row;
  }

  function clearConditions() {
    var manage = document.getElementById('record-set-manage-conditions');
    var view = document.getElementById('record-set-view-conditions');
    if (manage) manage.innerHTML = '';
    if (view) view.innerHTML = '';
  }

  function openModal() {
    var overlay = document.getElementById('record-set-modal');
    var form = document.getElementById('record-set-form');
    if (!overlay || !form) return;
    form.reset();
    clearConditions();
    var typeSelect = document.getElementById('record-set-type');
    if (typeSelect) typeSelect.value = activeTab;
    overlay.classList.add('is-open');
    document.getElementById('record-set-name').focus();
    initLucide(overlay);
  }

  function closeModal() {
    var overlay = document.getElementById('record-set-modal');
    if (overlay) overlay.classList.remove('is-open');
  }

  function bindModal() {
    var addBtn = document.getElementById('record-sets-add-btn');
    var overlay = document.getElementById('record-set-modal');
    var closeBtn = document.getElementById('record-set-modal-close');
    var cancelBtn = document.getElementById('record-set-modal-cancel');
    var form = document.getElementById('record-set-form');

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

    document.querySelectorAll('.record-set-add-condition').forEach(function (btn) {
      if (btn.dataset.bound === '1') return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-condition-target');
        var container = document.getElementById('record-set-' + target + '-conditions');
        if (container) container.appendChild(createConditionRow(target));
      });
    });

    if (form && !form.dataset.bound) {
      form.dataset.bound = '1';
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = document.getElementById('record-set-name').value.trim();
        var description = document.getElementById('record-set-description').value.trim();
        var recordType = document.getElementById('record-set-type').value;
        if (!name) return;
        if (!RECORD_SETS[recordType]) RECORD_SETS[recordType] = [];
        RECORD_SETS[recordType].push({
          id: 'rs-' + Date.now(),
          name: name,
          description: description || 'Custom record set',
          manage: 'Some',
          view: 'Some',
          users: '—'
        });
        activeTab = recordType;
        document.querySelectorAll('[data-record-tab]').forEach(function (tab) {
          var on = tab.getAttribute('data-record-tab') === recordType;
          tab.classList.toggle('is-active', on);
          tab.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        renderTable();
        closeModal();
      });
    }
  }

  function bindSearch() {
    var input = document.getElementById('record-sets-search');
    if (!input || input.dataset.bound === '1') return;
    input.dataset.bound = '1';
    input.addEventListener('input', function () {
      searchQuery = input.value.trim();
      renderTable();
    });
  }

  function init() {
    bindTabs();
    bindModal();
    bindSearch();
    renderTable();
    var panel = document.getElementById('settings-panel-record-sets');
    if (panel) initLucide(panel);
  }

  window.YSOAM_SETTINGS_RECORD_SETS = { init: init };
})();
