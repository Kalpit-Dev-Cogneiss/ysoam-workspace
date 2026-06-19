(function () {
  'use strict';

  var vehicles = window.YSOAM_VEHICLES;
  var serviceData = window.YSOAM_SERVICE_HISTORY;
  var icons = window.YSOAM_ICONS;

  var DEMO_DATE = '2026-06-15';
  var DEMO_TIME = '13:25';
  var lineItemIndex = 0;

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, '&quot;');
  }

  function statusLabel(status) {
    var map = {
      active: 'Active', transit: 'In Transit', idle: 'Idle',
      offline: 'Offline', maintenance: 'Maintenance'
    };
    return map[status] || status;
  }

  function vehicleMeta(v) {
    return statusLabel(v.status) + ' · ' + v.type + ' · ' + v.group;
  }

  function chevronEl() {
    return '<span class="assign-picker__chevron" data-lucide-icon="chevronDown" data-lucide-icon-size="14" aria-hidden="true"></span>';
  }

  function initLucide(root) {
    if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root);
  }

  function injectIcons() {
    if (!icons) return;
    document.querySelectorAll('[data-form-icon]').forEach(function (el) {
      var key = el.getAttribute('data-form-icon');
      if (icons[key]) el.innerHTML = icons[key];
    });
  }

  function populateSelects() {
    var priorityEl = document.getElementById('service-priority');
    var vendorEl = document.getElementById('service-vendor');

    if (priorityEl && serviceData) {
      [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'emergency', label: 'Emergency' },
        { value: 'non-scheduled', label: 'Non-Scheduled' }
      ].forEach(function (p) {
        var opt = document.createElement('option');
        opt.value = p.value;
        opt.textContent = p.label;
        priorityEl.appendChild(opt);
      });
    }

    if (vendorEl && serviceData) {
      var vendors = ['Pune Service Hub', 'Expressway Motors', 'Mumbai Fleet Parts', 'Western Logistics Co.'];
      vendors.forEach(function (v) {
        var opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        vendorEl.appendChild(opt);
      });
    }
  }

  function buildVehicleList() {
    var listEl = document.getElementById('service-vehicle-list');
    if (!listEl) return;

    listEl.innerHTML = (vehicles.list || []).filter(function (v) {
      return v.assignment !== 'archived';
    }).map(function (v) {
      return (
        '<button type="button" class="assign-picker__option" role="option" data-service-vehicle-id="' + escapeAttr(v.id) + '">' +
          '<img src="' + escapeAttr(v.image) + '" alt="">' +
          '<span class="assign-picker__option-text">' +
            '<strong>' + escapeHtml(v.name) + '</strong>' +
            '<small>' + escapeHtml(vehicleMeta(v)) + '</small>' +
          '</span>' +
        '</button>'
      );
    }).join('');

    listEl.querySelectorAll('[data-service-vehicle-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectVehicle(btn.getAttribute('data-service-vehicle-id'));
        closeVehiclePicker();
      });
    });
  }

  function setVehicleTrigger(vehicleId) {
    var trigger = document.getElementById('service-vehicle-trigger');
    var hidden = document.getElementById('service-vehicle-id');
    if (!trigger || !hidden) return;

    hidden.value = vehicleId || '';

    if (!vehicleId) {
      trigger.innerHTML =
        '<span class="assign-picker__placeholder">Please select</span>' +
        chevronEl();
      initLucide(trigger);
      updateVehicleSections(false);
      return;
    }

    var v = vehicles.getById(vehicleId);
    if (!v) return;
    trigger.innerHTML =
      '<img src="' + escapeAttr(v.image) + '" alt="">' +
      '<span class="assign-picker__selected">' +
        '<strong>' + escapeHtml(v.name) + '</strong>' +
        '<small>' + escapeHtml(vehicleMeta(v)) + '</small>' +
      '</span>' +
      chevronEl();
    initLucide(trigger);
    updateVehicleSections(true);
  }

  function updateVehicleSections(hasVehicle) {
    var issuesPlaceholder = document.getElementById('service-issues-placeholder');
    var issuesBody = document.getElementById('service-issues-body');
    var linePlaceholder = document.getElementById('service-line-items-placeholder');
    var lineBody = document.getElementById('service-line-items-body');

    if (issuesPlaceholder) issuesPlaceholder.hidden = hasVehicle;
    if (issuesBody) issuesBody.hidden = !hasVehicle;
    if (linePlaceholder) linePlaceholder.hidden = hasVehicle;
    if (lineBody) lineBody.hidden = !hasVehicle;
  }

  function selectVehicle(vehicleId) {
    setVehicleTrigger(vehicleId);
    updateSaveButtons();
  }

  function closeVehiclePicker() {
    var menu = document.getElementById('service-vehicle-menu');
    var trigger = document.getElementById('service-vehicle-trigger');
    if (menu) menu.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function toggleVehiclePicker() {
    var menu = document.getElementById('service-vehicle-menu');
    var trigger = document.getElementById('service-vehicle-trigger');
    if (!menu || !trigger) return;
    var open = menu.hidden;
    menu.hidden = !open;
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      var search = document.getElementById('service-vehicle-search');
      if (search) {
        search.value = '';
        filterVehicleList('');
        search.focus();
      }
    }
  }

  function filterVehicleList(query) {
    var q = String(query || '').trim().toLowerCase();
    var listEl = document.getElementById('service-vehicle-list');
    if (!listEl) return;
    listEl.querySelectorAll('.assign-picker__option').forEach(function (btn) {
      btn.hidden = q && btn.textContent.toLowerCase().indexOf(q) === -1;
    });
  }

  function taskOptionsHtml(selected) {
    var tasks = (serviceData && serviceData.tasks) ? serviceData.tasks : [];
    return '<option value="">Select service task</option>' +
      tasks.map(function (t) {
        return '<option value="' + escapeAttr(t) + '"' + (selected === t ? ' selected' : '') + '>' + escapeHtml(t) + '</option>';
      }).join('');
  }

  function addLineItemRow(task) {
    var list = document.getElementById('service-line-items-list');
    if (!list) return;
    var id = 'line-item-' + (lineItemIndex += 1);
    var row = document.createElement('div');
    row.className = 'service-form-line-item';
    row.innerHTML =
      '<select class="text-input" name="lineItems[]" id="' + id + '">' + taskOptionsHtml(task || '') + '</select>' +
      '<button type="button" class="btn btn-text btn-sm service-form-line-item__remove" aria-label="Remove line item">Remove</button>';
    list.appendChild(row);
    row.querySelector('.service-form-line-item__remove').addEventListener('click', function () {
      row.remove();
      updateSaveButtons();
    });
    row.querySelector('select').addEventListener('change', updateSaveButtons);
    updateSaveButtons();
  }

  function formValid() {
    var vehicleId = document.getElementById('service-vehicle-id').value;
    var date = document.getElementById('service-completion-date').value;
    var time = document.getElementById('service-completion-time').value;
    return !!(vehicleId && date && time);
  }

  function updateSaveButtons() {
    var ok = formValid();
    ['service-save-top', 'service-save-footer', 'service-save-another'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.disabled = !ok;
    });
  }

  function resetForm(keepVehicle) {
    var form = document.getElementById('service-entry-form');
    if (!form) return;
    var vehicleId = keepVehicle ? document.getElementById('service-vehicle-id').value : '';
    form.reset();
    document.getElementById('service-completion-date').value = DEMO_DATE;
    document.getElementById('service-completion-time').value = DEMO_TIME;
    document.getElementById('service-start-fields').hidden = true;
    document.getElementById('service-line-items-list').innerHTML = '';
    if (keepVehicle && vehicleId) setVehicleTrigger(vehicleId);
    else setVehicleTrigger('');
    document.getElementById('service-photos').value = '';
    document.getElementById('service-documents').value = '';
    document.querySelectorAll('.expense-form-dropzone').forEach(function (z) {
      z.classList.remove('has-files');
    });
    updateSaveButtons();
  }

  function saveEntry(andAnother) {
    if (!formValid()) return;
    if (andAnother) {
      resetForm(false);
      buildVehicleList();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.location.href = 'service-history';
  }

  function bindDropzone(labelId, inputId) {
    var label = document.getElementById(labelId);
    var input = document.getElementById(inputId);
    if (!label || !input) return;

    label.addEventListener('dragover', function (e) {
      e.preventDefault();
      label.classList.add('is-dragover');
    });
    label.addEventListener('dragleave', function () {
      label.classList.remove('is-dragover');
    });
    label.addEventListener('drop', function (e) {
      e.preventDefault();
      label.classList.remove('is-dragover');
      if (e.dataTransfer && e.dataTransfer.files.length) {
        input.files = e.dataTransfer.files;
        label.classList.add('has-files');
      }
    });
    input.addEventListener('change', function () {
      label.classList.toggle('has-files', input.files && input.files.length > 0);
    });
  }

  function bindEvents() {
    document.getElementById('service-vehicle-trigger') && document.getElementById('service-vehicle-trigger').addEventListener('click', function (e) {
      e.stopPropagation();
      toggleVehiclePicker();
    });

    document.getElementById('service-vehicle-search') && document.getElementById('service-vehicle-search').addEventListener('input', function (e) {
      filterVehicleList(e.target.value);
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#service-vehicle-picker')) closeVehiclePicker();
    });

    document.getElementById('service-set-start-date') && document.getElementById('service-set-start-date').addEventListener('change', function (e) {
      var fields = document.getElementById('service-start-fields');
      if (fields) fields.hidden = !e.target.checked;
    });

    ['service-completion-date', 'service-completion-time'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', updateSaveButtons);
        el.addEventListener('change', updateSaveButtons);
      }
    });

    document.getElementById('service-entry-form') && document.getElementById('service-entry-form').addEventListener('submit', function (e) {
      e.preventDefault();
      saveEntry(false);
    });

    document.getElementById('service-save-another') && document.getElementById('service-save-another').addEventListener('click', function () {
      saveEntry(true);
    });

    document.getElementById('service-add-line-item') && document.getElementById('service-add-line-item').addEventListener('click', function () {
      addLineItemRow();
    });

    bindDropzone('service-photos-dropzone', 'service-photos');
    bindDropzone('service-documents-dropzone', 'service-documents');
  }

  function init() {
    injectIcons();
    initLucide();
    populateSelects();
    buildVehicleList();
    document.getElementById('service-completion-date').value = DEMO_DATE;
    document.getElementById('service-completion-time').value = DEMO_TIME;

    var params = new URLSearchParams(window.location.search);
    var prefill = params.get('vehicle');
    if (prefill && vehicles.getById(prefill)) selectVehicle(prefill);

    bindEvents();
    updateSaveButtons();
  }

  if (document.body.getAttribute('data-subpage') === 'service-entry-form') {
    init();
  }
})();
