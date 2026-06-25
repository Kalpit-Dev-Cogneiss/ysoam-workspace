(function () {
  'use strict';

  var DATA = window.YSOAM_SETTINGS_PARTS_FUEL_DATA || {};
  var searches = {
    'part-locations': '',
    'part-categories': '',
    'part-manufacturers': '',
    'measurement-units': '',
    'fuel-types': ''
  };
  var locationTab = 'active';

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

  function updatePager(labelId, total) {
    var label = document.getElementById(labelId);
    if (!label) return;
    label.textContent = total ? '1 – ' + total + ' of ' + total : '0 of 0';
  }

  function renderPartLocations() {
    var body = document.getElementById('part-locations-table-body');
    var empty = document.getElementById('part-locations-empty');
    if (!body) return;
    var list = locationTab === 'archived' ? (DATA.partLocationsArchived || []) : (DATA.partLocationsActive || []);
    var rows = filterList(list, searches['part-locations'], ['name', 'description']);
    updatePager('part-locations-pager-label', rows.length);

    if (!rows.length) {
      body.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    body.innerHTML = rows.map(function (item) {
      return (
        '<tr>' +
          '<td class="settings-access-table__check"><input type="checkbox" aria-label="Select ' + esc(item.name) + '"></td>' +
          '<td><strong>' + esc(item.name) + '</strong></td>' +
          '<td>' + esc(item.description || '—') + '</td>' +
        '</tr>'
      );
    }).join('');
  }

  function renderPartCategories() {
    var body = document.getElementById('part-categories-table-body');
    if (!body) return;
    var rows = filterList(DATA.partCategories || [], searches['part-categories'], ['name', 'description']);
    updatePager('part-categories-pager-label', rows.length);
    body.innerHTML = rows.map(function (item) {
      return (
        '<tr>' +
          '<td class="settings-access-table__check"><input type="checkbox" aria-label="Select ' + esc(item.name) + '"></td>' +
          '<td><strong>' + esc(item.name) + '</strong></td>' +
          '<td>' + esc(item.description) + '</td>' +
          '<td class="settings-list-usage"><a href="parts.html" class="settings-usage-link">' + esc(String(item.usage)) + ' parts</a></td>' +
        '</tr>'
      );
    }).join('');
  }

  function renderPartManufacturers() {
    var body = document.getElementById('part-manufacturers-table-body');
    var empty = document.getElementById('part-manufacturers-empty');
    if (!body) return;
    var rows = filterList(DATA.partManufacturers || [], searches['part-manufacturers'], ['name', 'description']);
    updatePager('part-manufacturers-pager-label', rows.length);
    if (!rows.length) {
      body.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    body.innerHTML = rows.map(function (item) {
      return (
        '<tr>' +
          '<td class="settings-access-table__check"><input type="checkbox" aria-label="Select ' + esc(item.name) + '"></td>' +
          '<td><strong>' + esc(item.name) + '</strong></td>' +
          '<td>' + esc(item.description || '—') + '</td>' +
          '<td class="settings-list-usage"><a href="parts.html" class="settings-usage-link">' + esc(String(item.usage || 0)) + ' parts</a></td>' +
        '</tr>'
      );
    }).join('');
  }

  function renderMeasurementUnits() {
    var body = document.getElementById('measurement-units-table-body');
    if (!body) return;
    var rows = filterList(DATA.measurementUnits || [], searches['measurement-units'], ['name', 'symbol', 'description']);
    updatePager('measurement-units-pager-label', rows.length);
    body.innerHTML = rows.map(function (item) {
      return (
        '<tr>' +
          '<td class="settings-access-table__check"><input type="checkbox" aria-label="Select ' + esc(item.name) + '"></td>' +
          '<td><strong>' + esc(item.name) + '</strong></td>' +
          '<td><code class="api-keys-code">' + esc(item.symbol) + '</code></td>' +
          '<td>' + esc(item.description) + '</td>' +
          '<td class="settings-list-usage"><a href="parts.html" class="settings-usage-link">' + esc(String(item.usage)) + ' parts</a></td>' +
        '</tr>'
      );
    }).join('');
  }

  function renderFuelTypes() {
    var body = document.getElementById('fuel-types-table-body');
    if (!body) return;
    var rows = filterList(DATA.fuelTypes || [], searches['fuel-types'], ['name']);
    updatePager('fuel-types-pager-label', rows.length);
    body.innerHTML = rows.map(function (item) {
      var vehicleLabel = item.vehicles + ' vehicle' + (item.vehicles === 1 ? '' : 's');
      return (
        '<tr>' +
          '<td class="settings-access-table__check"><input type="checkbox" aria-label="Select ' + esc(item.name) + '"></td>' +
          '<td><strong>' + esc(item.name) + '</strong></td>' +
          '<td class="settings-list-usage tabular-nums"><a href="fuel.html" class="settings-usage-link">' + esc(String(item.fuelEntries)) + '</a></td>' +
          '<td class="settings-list-usage"><a href="vehicles.html" class="settings-usage-link">' + esc(vehicleLabel) + '</a></td>' +
        '</tr>'
      );
    }).join('');
  }

  function bindModal(cfg) {
    var overlay = document.getElementById(cfg.overlayId);
    var openBtn = document.getElementById(cfg.openBtnId);
    var closeBtn = document.getElementById(cfg.closeBtnId);
    var cancelBtn = document.getElementById(cfg.cancelBtnId);
    var form = document.getElementById(cfg.formId);

    function close() { if (overlay) overlay.classList.remove('is-open'); }

    if (openBtn && !openBtn.dataset.bound) {
      openBtn.dataset.bound = '1';
      openBtn.addEventListener('click', function () {
        if (form) form.reset();
        if (cfg.onOpen) cfg.onOpen();
        if (overlay) overlay.classList.add('is-open');
        var focus = document.getElementById(cfg.focusId);
        if (focus) focus.focus();
        initLucide(overlay);
      });
    }
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
        if (cfg.onSubmit()) close();
      });
    }
  }

  function bindModals() {
    bindModal({
      overlayId: 'part-location-modal', openBtnId: 'part-locations-add-btn',
      closeBtnId: 'part-location-modal-close', cancelBtnId: 'part-location-modal-cancel',
      formId: 'part-location-form', focusId: 'part-location-name',
      onSubmit: function () {
        var name = document.getElementById('part-location-name').value.trim();
        if (!name) return false;
        var description = document.getElementById('part-location-description').value.trim();
        var target = locationTab === 'archived' ? DATA.partLocationsArchived : DATA.partLocationsActive;
        if (!target) return false;
        target.push({ name: name, description: description });
        renderPartLocations();
        return true;
      }
    });

    bindModal({
      overlayId: 'part-category-modal', openBtnId: 'part-categories-add-btn',
      closeBtnId: 'part-category-modal-close', cancelBtnId: 'part-category-modal-cancel',
      formId: 'part-category-form', focusId: 'part-category-name',
      onSubmit: function () {
        var name = document.getElementById('part-category-name').value.trim();
        if (!name) return false;
        DATA.partCategories.push({
          name: name,
          description: document.getElementById('part-category-description').value.trim() || '—',
          usage: 0
        });
        renderPartCategories();
        return true;
      }
    });

    bindModal({
      overlayId: 'part-manufacturer-modal', openBtnId: 'part-manufacturers-add-btn',
      closeBtnId: 'part-manufacturer-modal-close', cancelBtnId: 'part-manufacturer-modal-cancel',
      formId: 'part-manufacturer-form', focusId: 'part-manufacturer-name',
      onSubmit: function () {
        var name = document.getElementById('part-manufacturer-name').value.trim();
        if (!name) return false;
        DATA.partManufacturers.push({
          name: name,
          description: document.getElementById('part-manufacturer-description').value.trim(),
          usage: 0
        });
        renderPartManufacturers();
        return true;
      }
    });

    bindModal({
      overlayId: 'measurement-unit-modal', openBtnId: 'measurement-units-add-btn',
      closeBtnId: 'measurement-unit-modal-close', cancelBtnId: 'measurement-unit-modal-cancel',
      formId: 'measurement-unit-form', focusId: 'measurement-unit-name',
      onSubmit: function () {
        var name = document.getElementById('measurement-unit-name').value.trim();
        var symbol = document.getElementById('measurement-unit-symbol').value.trim();
        if (!name || !symbol) return false;
        DATA.measurementUnits.push({
          name: name,
          symbol: symbol,
          description: document.getElementById('measurement-unit-description').value.trim() || '—',
          usage: 0
        });
        renderMeasurementUnits();
        return true;
      }
    });

    bindModal({
      overlayId: 'fuel-type-modal', openBtnId: 'fuel-types-add-btn',
      closeBtnId: 'fuel-type-modal-close', cancelBtnId: 'fuel-type-modal-cancel',
      formId: 'fuel-type-form', focusId: 'fuel-type-name',
      onSubmit: function () {
        var name = document.getElementById('fuel-type-name').value.trim();
        if (!name) return false;
        DATA.fuelTypes.push({ name: name, fuelEntries: 0, vehicles: 0 });
        renderFuelTypes();
        return true;
      }
    });
  }

  function bindLocationTabs() {
    document.querySelectorAll('[data-part-location-tab]').forEach(function (tab) {
      if (tab.dataset.bound === '1') return;
      tab.dataset.bound = '1';
      tab.addEventListener('click', function () {
        locationTab = tab.getAttribute('data-part-location-tab');
        document.querySelectorAll('[data-part-location-tab]').forEach(function (t) {
          var on = t === tab;
          t.classList.toggle('is-active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        searches['part-locations'] = '';
        var input = document.getElementById('part-locations-search');
        if (input) input.value = '';
        renderPartLocations();
      });
    });
  }

  function bindFuelForm() {
    var form = document.getElementById('fuel-settings-form');
    if (!form || form.dataset.bound === '1') return;
    form.dataset.bound = '1';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      window.alert('Fuel settings saved.');
    });
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
    if (panelId === 'part-locations') renderPartLocations();
    if (panelId === 'part-categories') renderPartCategories();
    if (panelId === 'part-manufacturers') renderPartManufacturers();
    if (panelId === 'measurement-units') renderMeasurementUnits();
    if (panelId === 'fuel-types') renderFuelTypes();
  }

  function init(panelId) {
    bindModals();
    bindLocationTabs();
    bindFuelForm();
    bindSearch('part-locations-search', 'part-locations', renderPartLocations);
    bindSearch('part-categories-search', 'part-categories', renderPartCategories);
    bindSearch('part-manufacturers-search', 'part-manufacturers', renderPartManufacturers);
    bindSearch('measurement-units-search', 'measurement-units', renderMeasurementUnits);
    bindSearch('fuel-types-search', 'fuel-types', renderFuelTypes);

    if (panelId) {
      renderPanel(panelId);
      var panel = document.getElementById('settings-panel-' + panelId);
      if (panel) initLucide(panel);
    }
  }

  window.YSOAM_SETTINGS_PARTS_FUEL = { init: init };
})();
