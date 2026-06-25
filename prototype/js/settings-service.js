(function () {
  'use strict';

  var DATA = window.YSOAM_SETTINGS_SERVICE_DATA || {};
  var searches = {
    'work-order-statuses': '',
    'repair-codes': '',
    'repair-priority-codes': ''
  };
  var vmrsState = {
    categoryCode: '0',
    systemCode: '001',
    assemblyCode: '001',
    view: 'category-system',
    componentEnabled: false,
    categoryQuery: '',
    systemQuery: '',
    assemblyQuery: '',
    componentQuery: ''
  };

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

  function filterList(list, query, fields) {
    if (!query) return list.slice();
    var q = query.toLowerCase();
    return list.filter(function (item) {
      return fields.some(function (field) {
        return String(item[field] || '').toLowerCase().indexOf(q) !== -1;
      });
    });
  }

  function updatePager(labelId, total, pageSize) {
    var label = document.getElementById(labelId);
    if (!label) return;
    if (!total) {
      label.textContent = '0 of 0';
      return;
    }
    var shown = Math.min(pageSize || total, total);
    label.textContent = '1 – ' + shown + ' of ' + total;
  }

  function renderWorkOrderStatuses() {
    var body = document.getElementById('work-order-statuses-table-body');
    if (!body) return;
    var rows = filterList(DATA.workOrderStatuses || [], searches['work-order-statuses'], ['name', 'description']);
    updatePager('work-order-statuses-pager-label', rows.length);

    body.innerHTML = rows.map(function (item) {
      var badge = item.isDefault ? ' <span class="settings-access-badge settings-access-badge--muted">Default</span>' : '';
      var lock = item.locked ? '<span class="settings-list-control" data-lucide-icon="lock" aria-label="Locked"></span>' : '';
      var grip = '<span class="settings-list-control settings-list-control--grip" data-lucide-icon="gripVertical" aria-hidden="true"></span>';
      var typeCell = item.type === 'completed'
        ? '<span class="wo-status-type wo-status-type--done"><span data-lucide-icon="circleCheck" aria-hidden="true"></span> Completed</span>'
        : '<span class="wo-status-type">Incomplete</span>';
      return (
        '<tr>' +
          '<td>' +
            '<div class="settings-status-row">' +
              '<span class="settings-status-row__controls">' + lock + grip + '</span>' +
              '<div class="wo-status-name">' +
                '<span class="vehicle-settings-dot" style="background:' + esc(item.color) + '"></span>' +
                '<div><strong>' + esc(item.name) + '</strong>' + badge +
                '<p class="issue-priority-name__sub">' + esc(item.description) + '</p></div>' +
              '</div>' +
            '</div>' +
          '</td>' +
          '<td>' + typeCell + '</td>' +
          '<td class="settings-list-usage tabular-nums">' + esc(String(item.count)) + '</td>' +
          '<td class="settings-ops-actions"><button type="button" class="settings-row-menu" aria-label="Actions"><span data-lucide-icon="moreHorizontal" aria-hidden="true"></span></button></td>' +
        '</tr>'
      );
    }).join('');
    initLucide(body);
  }

  function renderRepairCodes() {
    var body = document.getElementById('repair-codes-table-body');
    if (!body) return;
    var rows = filterList(DATA.repairCodes || [], searches['repair-codes'], ['code', 'name', 'alias']);
    updatePager('repair-codes-pager-label', rows.length, 50);

    body.innerHTML = rows.map(function (item) {
      var standard = item.standard
        ? '<span class="settings-list-control" data-lucide-icon="lock" aria-label="Standard"></span>'
        : '—';
      var enabled = item.enabled
        ? '<span class="settings-ops-enabled" data-lucide-icon="circleCheck" aria-label="Enabled"></span>'
        : '—';
      return (
        '<tr>' +
          '<td class="settings-access-table__check"><input type="checkbox" aria-label="Select ' + esc(item.code) + '"></td>' +
          '<td class="tabular-nums">' + esc(item.code) + '</td>' +
          '<td><strong>' + esc(item.name) + '</strong></td>' +
          '<td>' + esc(item.alias) + '</td>' +
          '<td class="settings-ops-standard">' + standard + '</td>' +
          '<td class="settings-ops-enabled">' + enabled + '</td>' +
        '</tr>'
      );
    }).join('');
    initLucide(body);
  }

  function renderRepairPriorityCodes() {
    var body = document.getElementById('repair-priority-codes-table-body');
    if (!body) return;
    var rows = filterList(DATA.repairPriorityCodes || [], searches['repair-priority-codes'], ['code', 'name', 'description']);
    updatePager('repair-priority-codes-pager-label', rows.length);

    body.innerHTML = rows.map(function (item) {
      return (
        '<tr>' +
          '<td class="tabular-nums">' + esc(item.code) + '</td>' +
          '<td>' +
            '<div class="issue-priority-name">' +
              '<span class="vehicle-settings-dot" style="background:' + esc(item.color) + '"></span>' +
              '<div><strong>' + esc(item.name) + '</strong>' +
              '<p class="issue-priority-name__sub">' + esc(item.description) + '</p></div>' +
            '</div>' +
          '</td>' +
          '<td class="settings-list-usage"><a href="service-entries.html" class="settings-usage-link tabular-nums">' + esc(String(item.serviceEntries)) + '</a></td>' +
          '<td class="settings-list-usage"><a href="work-orders.html" class="settings-usage-link tabular-nums">' + esc(String(item.workOrders)) + '</a></td>' +
          '<td class="settings-ops-enabled"><span data-lucide-icon="circleCheck" aria-label="Enabled"></span></td>' +
        '</tr>'
      );
    }).join('');
    initLucide(body);
  }

  function getCategory() {
    return (DATA.vmrsCategories || []).find(function (c) { return c.code === vmrsState.categoryCode; });
  }

  function getSystem() {
    var cat = getCategory();
    if (!cat || !cat.systems) return null;
    return cat.systems.find(function (s) { return s.code === vmrsState.systemCode; });
  }

  function renderVmrsLists() {
    var catList = document.getElementById('vmrs-category-list');
    var sysList = document.getElementById('vmrs-system-list');
    var asmList = document.getElementById('vmrs-assembly-list');
    var compList = document.getElementById('vmrs-component-list');
    var catView = document.getElementById('vmrs-category-system-view');
    var asmView = document.getElementById('vmrs-assembly-component-view');
    if (!catList) return;

    if (catView) catView.hidden = vmrsState.view !== 'category-system';
    if (asmView) asmView.hidden = vmrsState.view !== 'assembly-component';

    var categories = filterList(DATA.vmrsCategories || [], vmrsState.categoryQuery, ['code', 'name']);
    catList.innerHTML = categories.map(function (cat) {
      var active = cat.code === vmrsState.categoryCode ? ' is-active' : '';
      return (
        '<button type="button" class="vmrs-list-item' + active + '" data-vmrs-category="' + esc(cat.code) + '">' +
          '<span class="vmrs-list-item__label"><span class="tabular-nums">' + esc(cat.code) + '</span> - ' + esc(cat.name) + '</span>' +
          '<span class="vmrs-list-item__chevron" data-lucide-icon="chevronRight" aria-hidden="true"></span>' +
        '</button>'
      );
    }).join('');

    var category = getCategory();
    var systems = category && category.systems ? filterList(category.systems, vmrsState.systemQuery, ['code', 'name']) : [];
    var sysCount = document.getElementById('vmrs-system-count');
    if (sysCount) sysCount.textContent = String(systems.length);

    if (sysList) {
      sysList.innerHTML = systems.map(function (sys) {
        var active = sys.code === vmrsState.systemCode ? ' is-active' : '';
        var icon = sys.locked
          ? '<span class="settings-list-control" data-lucide-icon="lock" aria-hidden="true"></span>'
          : '<span class="settings-list-control settings-ops-enabled" data-lucide-icon="circleCheck" aria-hidden="true"></span>';
        var edit = sys.editable ? '<span class="vmrs-list-item__edit" data-lucide-icon="pencil" aria-hidden="true"></span>' : '';
        var chevron = sys.hasChevron || (sys.assemblies && sys.assemblies.length)
          ? '<span class="vmrs-list-item__chevron" data-lucide-icon="chevronRight" aria-hidden="true"></span>' : '';
        return (
          '<button type="button" class="vmrs-list-item' + active + '" data-vmrs-system="' + esc(sys.code) + '">' +
            icon +
            '<span class="vmrs-list-item__label"><span class="tabular-nums">' + esc(sys.code) + '</span> - ' + esc(sys.name) + '</span>' +
            edit + chevron +
          '</button>'
        );
      }).join('');
    }

    var system = getSystem();
    var assemblies = system && system.assemblies ? filterList(system.assemblies, vmrsState.assemblyQuery, ['code', 'name']) : [];
    var asmCount = document.getElementById('vmrs-assembly-count');
    if (asmCount) asmCount.textContent = String(assemblies.length);

    if (asmList) {
      asmList.innerHTML = assemblies.map(function (asm) {
        var active = asm.code === vmrsState.assemblyCode ? ' is-active' : '';
        var icon = asm.locked
          ? '<span class="settings-list-control" data-lucide-icon="lock" aria-hidden="true"></span>'
          : '<span class="settings-list-control settings-ops-enabled" data-lucide-icon="circleCheck" aria-hidden="true"></span>';
        var chevron = asm.hasChevron ? '<span class="vmrs-list-item__chevron" data-lucide-icon="chevronRight" aria-hidden="true"></span>' : '';
        return (
          '<button type="button" class="vmrs-list-item' + active + '" data-vmrs-assembly="' + esc(asm.code) + '">' +
            icon +
            '<span class="vmrs-list-item__label"><span class="tabular-nums">' + esc(asm.code) + '</span> - ' + esc(asm.name) + '</span>' +
            chevron +
          '</button>'
        );
      }).join('');
    }

    var compBanner = document.getElementById('vmrs-component-banner');
    var compToggle = document.getElementById('vmrs-component-toggle');
    if (compToggle) compToggle.checked = vmrsState.componentEnabled;
    if (compBanner) compBanner.hidden = vmrsState.componentEnabled;

    var components = filterList(DATA.vmrsComponents || [], vmrsState.componentQuery, ['code', 'name']);
    var compCount = document.getElementById('vmrs-component-count');
    if (compCount) compCount.textContent = String(components.length);

    if (compList) {
      var disabledClass = vmrsState.componentEnabled ? '' : ' vmrs-list--disabled';
      compList.className = 'vmrs-list' + disabledClass;
      compList.innerHTML = components.map(function (comp) {
        var icon = comp.locked
          ? '<span class="settings-list-control" data-lucide-icon="lock" aria-hidden="true"></span>'
          : '<span class="settings-list-control settings-ops-enabled" data-lucide-icon="circleCheck" aria-hidden="true"></span>';
        return (
          '<div class="vmrs-list-item vmrs-list-item--static">' +
            icon +
            '<span class="vmrs-list-item__label"><span class="tabular-nums">' + esc(comp.code) + '</span> - ' + esc(comp.name) + '</span>' +
          '</div>'
        );
      }).join('');
    }

    var panel = document.getElementById('settings-panel-vmrs-codes');
    if (panel) initLucide(panel);
  }

  function bindVmrs() {
    var panel = document.getElementById('settings-panel-vmrs-codes');
    if (!panel || panel.dataset.vmrsBound === '1') return;
    panel.dataset.vmrsBound = '1';

    panel.addEventListener('click', function (e) {
      var catBtn = e.target.closest('[data-vmrs-category]');
      if (catBtn) {
        vmrsState.categoryCode = catBtn.getAttribute('data-vmrs-category');
        var cat = getCategory();
        vmrsState.systemCode = cat && cat.systems && cat.systems[0] ? cat.systems[0].code : '';
        renderVmrsLists();
        return;
      }
      var sysBtn = e.target.closest('[data-vmrs-system]');
      if (sysBtn) {
        vmrsState.systemCode = sysBtn.getAttribute('data-vmrs-system');
        var sys = getSystem();
        if (sys && sys.assemblies && sys.assemblies.length) {
          vmrsState.assemblyCode = sys.assemblies[0].code;
          vmrsState.view = 'assembly-component';
        }
        renderVmrsLists();
        return;
      }
      var asmBtn = e.target.closest('[data-vmrs-assembly]');
      if (asmBtn) {
        vmrsState.assemblyCode = asmBtn.getAttribute('data-vmrs-assembly');
        renderVmrsLists();
      }
    });

    var backBtn = document.getElementById('vmrs-back-systems');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        vmrsState.view = 'category-system';
        renderVmrsLists();
      });
    }

    var enableBtn = document.getElementById('vmrs-enable-components');
    if (enableBtn) {
      enableBtn.addEventListener('click', function () {
        vmrsState.componentEnabled = true;
        renderVmrsLists();
      });
    }

    var compToggle = document.getElementById('vmrs-component-toggle');
    if (compToggle) {
      compToggle.addEventListener('change', function () {
        vmrsState.componentEnabled = compToggle.checked;
        renderVmrsLists();
      });
    }

    [['vmrs-category-search', 'categoryQuery'], ['vmrs-system-search', 'systemQuery'], ['vmrs-assembly-search', 'assemblyQuery'], ['vmrs-component-search', 'componentQuery']].forEach(function (pair) {
      var input = document.getElementById(pair[0]);
      if (!input) return;
      input.addEventListener('input', function () {
        vmrsState[pair[1]] = input.value.trim();
        renderVmrsLists();
      });
    });
  }

  function bindMaintenanceForm() {
    var form = document.getElementById('maintenance-settings-form');
    if (!form || form.dataset.bound === '1') return;
    form.dataset.bound = '1';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      window.alert('Maintenance settings saved.');
    });

    var select = document.getElementById('maintenance-excluded-types');
    if (select && select.options.length <= 1) {
      (DATA.excludedVehicleTypes || []).forEach(function (type) {
        var opt = document.createElement('option');
        opt.value = type;
        opt.textContent = type;
        select.appendChild(opt);
      });
      var types = window.YSOAM_SETTINGS_VEHICLES_DATA && window.YSOAM_SETTINGS_VEHICLES_DATA.types;
      if (types) {
        types.forEach(function (t) {
          if ((DATA.excludedVehicleTypes || []).indexOf(t.name) !== -1) return;
          var o = document.createElement('option');
          o.value = t.name;
          o.textContent = t.name;
          select.appendChild(o);
        });
      }
    }
  }

  function bindModal() {
    var overlay = document.getElementById('repair-code-modal');
    var openBtn = document.getElementById('repair-codes-add-btn');
    var closeBtn = document.getElementById('repair-code-modal-close');
    var cancelBtn = document.getElementById('repair-code-modal-cancel');
    var form = document.getElementById('repair-code-form');

    if (openBtn && !openBtn.dataset.bound) {
      openBtn.dataset.bound = '1';
      openBtn.addEventListener('click', function () {
        if (form) form.reset();
        var enabled = document.getElementById('repair-code-enabled');
        if (enabled) enabled.checked = true;
        if (overlay) overlay.classList.add('is-open');
        document.getElementById('repair-code-number').focus();
        initLucide(overlay);
      });
    }
    function close() { if (overlay) overlay.classList.remove('is-open'); }
    if (closeBtn && !closeBtn.dataset.bound) { closeBtn.dataset.bound = '1'; closeBtn.addEventListener('click', close); }
    if (cancelBtn && !cancelBtn.dataset.bound) { cancelBtn.dataset.bound = '1'; cancelBtn.addEventListener('click', close); }
    if (overlay && !overlay.dataset.bound) {
      overlay.dataset.bound = '1';
      overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    }
    if (form && !form.dataset.bound) {
      form.dataset.bound = '1';
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var code = document.getElementById('repair-code-number').value.trim();
        var name = document.getElementById('repair-code-name').value.trim();
        if (!code || !name) return;
        DATA.repairCodes.push({
          code: code,
          name: name,
          alias: '—',
          standard: false,
          enabled: document.getElementById('repair-code-enabled').checked
        });
        renderRepairCodes();
        close();
      });
    }
  }

  function bindSearch(inputId, panelId, renderFn) {
    var input = document.getElementById(inputId);
    if (!input || input.dataset.bound === '1') return;
    input.dataset.bound = '1';
    input.addEventListener('input', function () {
      searches[panelId] = input.value.trim();
      renderFn();
    });
  }

  function renderPanel(panelId) {
    if (panelId === 'work-order-statuses') renderWorkOrderStatuses();
    if (panelId === 'repair-codes') renderRepairCodes();
    if (panelId === 'repair-priority-codes') renderRepairPriorityCodes();
    if (panelId === 'vmrs-codes') renderVmrsLists();
  }

  function init(panelId) {
    bindMaintenanceForm();
    bindModal();
    bindVmrs();
    bindSearch('work-order-statuses-search', 'work-order-statuses', renderWorkOrderStatuses);
    bindSearch('repair-codes-search', 'repair-codes', renderRepairCodes);
    bindSearch('repair-priority-codes-search', 'repair-priority-codes', renderRepairPriorityCodes);

    if (panelId) {
      renderPanel(panelId);
      var panel = document.getElementById('settings-panel-' + panelId);
      if (panel) initLucide(panel);
    }
  }

  window.YSOAM_SETTINGS_SERVICE = { init: init };
})();
