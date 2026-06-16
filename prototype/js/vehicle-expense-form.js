(function () {
  var vehicles = window.YSOAM_VEHICLES;
  var expenses = window.YSOAM_EXPENSES;
  var icons = window.YSOAM_ICONS;

  var DEMO_TODAY = '2026-06-15';

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

  function getQueryVehicleId() {
    var params = new URLSearchParams(window.location.search);
    return params.get('vehicle') || params.get('id') || null;
  }

  function injectIcons() {
    if (!icons) return;
    document.querySelectorAll('[data-form-icon]').forEach(function (el) {
      var key = el.getAttribute('data-form-icon');
      if (icons[key]) el.innerHTML = icons[key];
    });
  }

  function populateSelects() {
    var typeEl = document.getElementById('expense-type');
    var vendorEl = document.getElementById('expense-vendor');
    if (typeEl && expenses && expenses.filterTypes) {
      expenses.filterTypes.forEach(function (t) {
        var opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        typeEl.appendChild(opt);
      });
    }
    if (vendorEl && expenses && expenses.vendors) {
      expenses.vendors.forEach(function (v) {
        var opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        vendorEl.appendChild(opt);
      });
    }
  }

  function buildVehicleList() {
    var listEl = document.getElementById('expense-vehicle-list');
    if (!listEl) return;

    listEl.innerHTML = (vehicles.list || []).filter(function (v) {
      return v.assignment !== 'archived';
    }).map(function (v) {
      return (
        '<button type="button" class="assign-picker__option" role="option" data-expense-vehicle-id="' + escapeAttr(v.id) + '">' +
          '<img src="' + escapeAttr(v.image) + '" alt="">' +
          '<span class="assign-picker__option-text">' +
            '<strong>' + escapeHtml(v.name) + '</strong>' +
            '<small>' + escapeHtml(vehicleMeta(v)) + '</small>' +
          '</span>' +
        '</button>'
      );
    }).join('');

    listEl.querySelectorAll('[data-expense-vehicle-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectVehicle(btn.getAttribute('data-expense-vehicle-id'));
        closeVehiclePicker();
      });
    });
  }

  function setVehicleTrigger(vehicleId) {
    var trigger = document.getElementById('expense-vehicle-trigger');
    var hidden = document.getElementById('expense-vehicle-id');
    if (!trigger || !hidden) return;

    hidden.value = vehicleId || '';

    if (!vehicleId) {
      trigger.innerHTML =
        '<span class="assign-picker__placeholder">Please select</span>' +
        '<span class="assign-picker__chevron" aria-hidden="true">▾</span>';
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
      '<span class="assign-picker__chevron" aria-hidden="true">▾</span>';
  }

  function selectVehicle(vehicleId) {
    setVehicleTrigger(vehicleId);
    updateSaveButtons();
  }

  function closeVehiclePicker() {
    var menu = document.getElementById('expense-vehicle-menu');
    var trigger = document.getElementById('expense-vehicle-trigger');
    if (menu) menu.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function toggleVehiclePicker() {
    var menu = document.getElementById('expense-vehicle-menu');
    var trigger = document.getElementById('expense-vehicle-trigger');
    if (!menu || !trigger) return;
    var open = menu.hidden;
    menu.hidden = !open;
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      var search = document.getElementById('expense-vehicle-search');
      if (search) {
        search.value = '';
        filterVehicleList('');
        search.focus();
      }
    }
  }

  function filterVehicleList(query) {
    var q = String(query || '').trim().toLowerCase();
    var listEl = document.getElementById('expense-vehicle-list');
    if (!listEl) return;
    listEl.querySelectorAll('.assign-picker__option').forEach(function (btn) {
      btn.hidden = q && btn.textContent.toLowerCase().indexOf(q) === -1;
    });
  }

  function parseAmount(raw) {
    var n = parseFloat(String(raw || '').replace(/[^\d.]/g, ''));
    return isNaN(n) ? NaN : n;
  }

  function formValid() {
    var vehicleId = document.getElementById('expense-vehicle-id').value;
    var type = document.getElementById('expense-type').value;
    var amount = parseAmount(document.getElementById('expense-amount').value);
    var date = document.getElementById('expense-date').value;
    return !!(vehicleId && type && date && !isNaN(amount) && amount > 0);
  }

  function updateSaveButtons() {
    var ok = formValid();
    ['expense-save-top', 'expense-save-footer', 'expense-save-another'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.disabled = !ok;
    });
  }

  function readForm() {
    var vendor = document.getElementById('expense-vendor').value;
    var freq = document.querySelector('input[name="frequency"]:checked');
    return {
      vehicleId: document.getElementById('expense-vehicle-id').value,
      type: document.getElementById('expense-type').value,
      vendor: vendor || null,
      amount: parseAmount(document.getElementById('expense-amount').value),
      date: document.getElementById('expense-date').value,
      notes: document.getElementById('expense-notes').value.trim() || null,
      frequency: freq ? freq.value : 'single'
    };
  }

  function resetForm(keepVehicle) {
    var form = document.getElementById('expense-form');
    if (!form) return;
    var vehicleId = keepVehicle ? document.getElementById('expense-vehicle-id').value : '';
    form.reset();
    document.getElementById('expense-date').value = DEMO_TODAY;
    if (keepVehicle && vehicleId) setVehicleTrigger(vehicleId);
    else setVehicleTrigger('');
    document.getElementById('expense-photos').value = '';
    document.getElementById('expense-documents').value = '';
    updateSaveButtons();
  }

  function saveExpense(andAnother) {
    if (!formValid()) return;
    var entry = readForm();
    if (expenses && expenses.addEntry) expenses.addEntry(entry);

    if (andAnother) {
      resetForm(false);
      buildVehicleList();
      toggleVehiclePicker();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.location.href = 'vehicle-expenses';
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
    document.getElementById('expense-vehicle-trigger') && document.getElementById('expense-vehicle-trigger').addEventListener('click', function (e) {
      e.stopPropagation();
      toggleVehiclePicker();
    });

    document.getElementById('expense-vehicle-search') && document.getElementById('expense-vehicle-search').addEventListener('input', function (e) {
      filterVehicleList(e.target.value);
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#expense-vehicle-picker')) closeVehiclePicker();
    });

    ['expense-type', 'expense-amount', 'expense-date'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', updateSaveButtons);
        el.addEventListener('change', updateSaveButtons);
      }
    });

    document.getElementById('expense-form') && document.getElementById('expense-form').addEventListener('submit', function (e) {
      e.preventDefault();
      saveExpense(false);
    });

    document.getElementById('expense-save-another') && document.getElementById('expense-save-another').addEventListener('click', function () {
      saveExpense(true);
    });

    bindDropzone('expense-photos-dropzone', 'expense-photos');
    bindDropzone('expense-documents-dropzone', 'expense-documents');
  }

  function init() {
    injectIcons();
    populateSelects();
    buildVehicleList();
    document.getElementById('expense-date').value = DEMO_TODAY;

    var prefill = getQueryVehicleId();
    if (prefill && vehicles.getById(prefill)) selectVehicle(prefill);

    bindEvents();
    updateSaveButtons();
  }

  if (document.body.getAttribute('data-subpage') === 'expense-form') {
    init();
  }
})();
