(function () {
  'use strict';

  var DATA = window.YSOAM_SETTINGS_VEHICLES_DATA || {};
  var searches = {
    'vehicle-statuses': '',
    'vehicle-types': '',
    'external-vehicle-ids': '',
    'expense-types': ''
  };
  var selectedStatusColor = '';

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

  function usageLabel(count, singular, plural) {
    return count + ' ' + (count === 1 ? singular : plural);
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

  function renderStatuses() {
    var body = document.getElementById('vehicle-statuses-table-body');
    if (!body) return;
    var rows = filterList(DATA.statuses || [], searches['vehicle-statuses'], ['name']);
    updatePager('vehicle-statuses-pager-label', rows.length);

    body.innerHTML = rows.map(function (item) {
      var dot = item.color
        ? '<span class="vehicle-settings-dot" style="background:' + esc(item.color) + '"></span>'
        : '<span class="vehicle-settings-dot vehicle-settings-dot--none"></span>';
      var badge = item.isDefault ? ' <span class="settings-access-badge settings-access-badge--muted">Default</span>' : '';
      var lock = item.locked ? '<span class="settings-list-control" data-lucide-icon="lock" aria-label="Locked"></span>' : '';
      var grip = '<span class="settings-list-control settings-list-control--grip" data-lucide-icon="gripVertical" aria-hidden="true"></span>';
      return (
        '<tr>' +
          '<td>' +
            '<div class="settings-status-row">' +
              '<span class="settings-status-row__controls">' + lock + grip + '</span>' +
              '<span class="vehicle-settings-name">' + dot + '<strong>' + esc(item.name) + '</strong>' + badge + '</span>' +
            '</div>' +
          '</td>' +
          '<td class="settings-list-usage"><a href="vehicles.html" class="settings-usage-link">' + usageLabel(item.usage, 'vehicle', 'vehicles') + '</a></td>' +
        '</tr>'
      );
    }).join('');
    initLucide(body);
  }

  function renderTypes() {
    var body = document.getElementById('vehicle-types-table-body');
    if (!body) return;
    var rows = filterList(DATA.types || [], searches['vehicle-types'], ['name']);
    updatePager('vehicle-types-pager-label', rows.length);

    body.innerHTML = rows.map(function (item, i) {
      var badge = item.isDefault ? ' <span class="settings-access-badge settings-access-badge--muted">Default</span>' : '';
      var check = item.locked
        ? '<span class="settings-list-control" data-lucide-icon="lock" aria-label="Locked"></span>'
        : '<input type="checkbox" aria-label="Select ' + esc(item.name) + '">';
      return (
        '<tr>' +
          '<td class="settings-access-table__check">' + check + '</td>' +
          '<td><strong>' + esc(item.name) + '</strong>' + badge + '</td>' +
          '<td class="settings-list-usage"><a href="vehicles.html" class="settings-usage-link">' + usageLabel(item.usage, 'vehicle', 'vehicles') + '</a></td>' +
        '</tr>'
      );
    }).join('');
    initLucide(body);
  }

  function renderExternalIds() {
    var body = document.getElementById('external-vehicle-ids-table-body');
    var empty = document.getElementById('external-vehicle-ids-empty');
    if (!body) return;
    var rows = filterList(DATA.externalIds || [], searches['external-vehicle-ids'], ['label', 'description', 'key']);
    updatePager('external-vehicle-ids-pager-label', rows.length);

    if (!rows.length) {
      body.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    body.innerHTML = rows.map(function (item) {
      return (
        '<tr>' +
          '<td class="settings-access-table__check"><input type="checkbox" aria-label="Select ' + esc(item.label) + '"></td>' +
          '<td><strong>' + esc(item.label) + '</strong></td>' +
          '<td>' + esc(item.description || '—') + '</td>' +
          '<td><code class="api-keys-code">' + esc(item.key) + '</code></td>' +
        '</tr>'
      );
    }).join('');
  }

  function renderExpenseTypes() {
    var body = document.getElementById('expense-types-table-body');
    if (!body) return;
    var rows = filterList(DATA.expenseTypes || [], searches['expense-types'], ['name']);
    updatePager('expense-types-pager-label', rows.length);

    body.innerHTML = rows.map(function (item) {
      var badge = item.isDefault ? ' <span class="settings-access-badge settings-access-badge--muted">Default</span>' : '';
      var check = item.locked
        ? '<span class="settings-list-control" data-lucide-icon="lock" aria-label="Locked"></span>'
        : '<input type="checkbox" aria-label="Select ' + esc(item.name) + '">';
      return (
        '<tr>' +
          '<td class="settings-access-table__check">' + check + '</td>' +
          '<td><strong>' + esc(item.name) + '</strong>' + badge + '</td>' +
          '<td class="settings-list-usage"><a href="vehicle-expenses.html" class="settings-usage-link">' + usageLabel(item.usage, 'expense entry', 'expense entries') + '</a></td>' +
        '</tr>'
      );
    }).join('');
    initLucide(body);
  }

  function renderColorPicker() {
    var grid = document.getElementById('vehicle-status-color-grid');
    var preview = document.getElementById('vehicle-status-color-preview');
    if (!grid || grid.dataset.rendered === '1') return;
    grid.dataset.rendered = '1';

    grid.innerHTML = (DATA.STATUS_COLORS || []).map(function (color) {
      if (color.id === 'none') {
        return (
          '<button type="button" class="vehicle-status-color-swatch vehicle-status-color-swatch--none" data-color="" title="No color" aria-label="No color"></button>'
        );
      }
      return (
        '<button type="button" class="vehicle-status-color-swatch" data-color="' + esc(color.value) + '" style="background:' + esc(color.value) + '" title="' + esc(color.value) + '" aria-label="Color ' + esc(color.value) + '"></button>'
      );
    }).join('');

    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-color]');
      if (!btn) return;
      selectedStatusColor = btn.getAttribute('data-color');
      grid.querySelectorAll('.vehicle-status-color-swatch').forEach(function (sw) {
        sw.classList.toggle('is-selected', sw === btn);
      });
      updateColorPreview(preview);
      var popover = document.getElementById('vehicle-status-color-popover');
      if (popover) popover.hidden = true;
    });
  }

  function updateColorPreview(preview) {
    if (!preview) return;
    preview.innerHTML = '';
    if (!selectedStatusColor) {
      preview.className = 'vehicle-status-color-preview vehicle-status-color-preview--none';
      return;
    }
    preview.className = 'vehicle-status-color-preview';
    preview.style.background = selectedStatusColor;
  }

  function bindColorPicker() {
    var trigger = document.getElementById('vehicle-status-color-trigger');
    var popover = document.getElementById('vehicle-status-color-popover');
    if (!trigger || !popover || trigger.dataset.bound === '1') return;
    trigger.dataset.bound = '1';

    trigger.addEventListener('click', function () {
      popover.hidden = !popover.hidden;
    });

    document.addEventListener('click', function (e) {
      if (!popover.hidden && !e.target.closest('.vehicle-status-color-field')) {
        popover.hidden = true;
      }
    });
  }

  function openModal(overlayId, focusId, resetFn) {
    var overlay = document.getElementById(overlayId);
    if (!overlay) return;
    if (resetFn) resetFn();
    overlay.classList.add('is-open');
    var focus = document.getElementById(focusId);
    if (focus) focus.focus();
    initLucide(overlay);
  }

  function closeModal(overlayId) {
    var overlay = document.getElementById(overlayId);
    if (overlay) overlay.classList.remove('is-open');
  }

  function bindModal(overlayId, openBtnId, closeBtnId, cancelBtnId, formId, onSubmit, options) {
    options = options || {};
    var openBtn = document.getElementById(openBtnId);
    var overlay = document.getElementById(overlayId);
    var closeBtn = document.getElementById(closeBtnId);
    var cancelBtn = document.getElementById(cancelBtnId);
    var form = document.getElementById(formId);

    if (openBtn && !openBtn.dataset.bound) {
      openBtn.dataset.bound = '1';
      openBtn.addEventListener('click', function () {
        if (options.onOpen) options.onOpen();
        openModal(overlayId, options.focusId);
      });
    }
    if (closeBtn && !closeBtn.dataset.bound) {
      closeBtn.dataset.bound = '1';
      closeBtn.addEventListener('click', function () { closeModal(overlayId); });
    }
    if (cancelBtn && !cancelBtn.dataset.bound) {
      cancelBtn.dataset.bound = '1';
      cancelBtn.addEventListener('click', function () { closeModal(overlayId); });
    }
    if (overlay && !overlay.dataset.bound) {
      overlay.dataset.bound = '1';
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeModal(overlayId);
      });
    }
    if (form && !form.dataset.bound) {
      form.dataset.bound = '1';
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (onSubmit()) closeModal(overlayId);
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

  function bindModals() {
    bindModal(
      'vehicle-status-modal',
      'vehicle-statuses-add-btn',
      'vehicle-status-modal-close',
      'vehicle-status-modal-cancel',
      'vehicle-status-form',
      function () {
        var name = document.getElementById('vehicle-status-name').value.trim();
        if (!name) return false;
        DATA.statuses.push({
          id: 'status-' + Date.now(),
          name: name,
          color: selectedStatusColor,
          usage: 0,
          isDefault: document.getElementById('vehicle-status-default').checked,
          locked: false
        });
        document.getElementById('vehicle-status-form').reset();
        selectedStatusColor = '';
        updateColorPreview(document.getElementById('vehicle-status-color-preview'));
        renderStatuses();
        return true;
      },
      {
        focusId: 'vehicle-status-name',
        onOpen: function () {
          selectedStatusColor = '';
          var form = document.getElementById('vehicle-status-form');
          if (form) form.reset();
          updateColorPreview(document.getElementById('vehicle-status-color-preview'));
          var grid = document.getElementById('vehicle-status-color-grid');
          if (grid) {
            grid.querySelectorAll('.vehicle-status-color-swatch').forEach(function (sw) {
              sw.classList.remove('is-selected');
            });
          }
        }
      }
    );

    bindModal(
      'vehicle-type-modal',
      'vehicle-types-add-btn',
      'vehicle-type-modal-close',
      'vehicle-type-modal-cancel',
      'vehicle-type-form',
      function () {
        var name = document.getElementById('vehicle-type-name').value.trim();
        if (!name) return false;
        DATA.types.push({
          name: name,
          usage: 0,
          isDefault: document.getElementById('vehicle-type-default').checked,
          locked: false
        });
        document.getElementById('vehicle-type-form').reset();
        renderTypes();
        return true;
      },
      { focusId: 'vehicle-type-name' }
    );

    bindModal(
      'external-vehicle-id-modal',
      'external-vehicle-ids-add-btn',
      'external-vehicle-id-modal-close',
      'external-vehicle-id-modal-cancel',
      'external-vehicle-id-form',
      function () {
        var label = document.getElementById('external-vehicle-id-label').value.trim();
        if (!label) return false;
        var description = document.getElementById('external-vehicle-id-description').value.trim();
        var key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        DATA.externalIds.push({ label: label, description: description, key: key });
        document.getElementById('external-vehicle-id-form').reset();
        renderExternalIds();
        return true;
      },
      { focusId: 'external-vehicle-id-label' }
    );

    bindModal(
      'expense-type-modal',
      'expense-types-add-btn',
      'expense-type-modal-close',
      'expense-type-modal-cancel',
      'expense-type-form',
      function () {
        var name = document.getElementById('expense-type-name').value.trim();
        if (!name) return false;
        DATA.expenseTypes.push({ name: name, usage: 0, locked: false });
        document.getElementById('expense-type-form').reset();
        renderExpenseTypes();
        return true;
      },
      { focusId: 'expense-type-name' }
    );
  }

  function renderPanel(panelId) {
    if (panelId === 'vehicle-statuses') renderStatuses();
    if (panelId === 'vehicle-types') renderTypes();
    if (panelId === 'external-vehicle-ids') renderExternalIds();
    if (panelId === 'expense-types') renderExpenseTypes();
  }

  function init(panelId) {
    renderColorPicker();
    bindColorPicker();
    bindModals();
    bindSearch('vehicle-statuses-search', 'vehicle-statuses', renderStatuses);
    bindSearch('vehicle-types-search', 'vehicle-types', renderTypes);
    bindSearch('external-vehicle-ids-search', 'external-vehicle-ids', renderExternalIds);
    bindSearch('expense-types-search', 'expense-types', renderExpenseTypes);

    if (panelId) {
      renderPanel(panelId);
      var panel = document.getElementById('settings-panel-' + panelId);
      if (panel) initLucide(panel);
    }
  }

  window.YSOAM_SETTINGS_VEHICLES = { init: init, renderPanel: renderPanel };
})();
