(function () {
  'use strict';

  var vehicles = window.YSOAM_VEHICLES;
  var fuelData = window.YSOAM_FUEL_HISTORY;
  var icons = window.YSOAM_ICONS;

  var DEMO_DATE = '2026-06-22';
  var DEMO_TIME = '16:14';

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escA(s) {
    return esc(s).replace(/"/g, '&quot;');
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

  function populateVendors() {
    var vendorEl = document.getElementById('fuel-vendor');
    if (!vendorEl || !fuelData) return;
    fuelData.vendors.forEach(function (v) {
      var opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = v.name;
      vendorEl.appendChild(opt);
    });
  }

  function buildVehicleList() {
    var listEl = document.getElementById('fuel-vehicle-list');
    if (!listEl) return;

    listEl.innerHTML = (vehicles.list || []).filter(function (v) {
      return v.assignment !== 'archived';
    }).map(function (v) {
      return (
        '<button type="button" class="assign-picker__option" role="option" data-fuel-vehicle-id="' + escA(v.id) + '">' +
          '<img src="' + escA(v.image) + '" alt="">' +
          '<span class="assign-picker__option-text">' +
            '<strong>' + esc(v.name) + '</strong>' +
            '<small>' + esc(vehicleMeta(v)) + '</small>' +
          '</span>' +
        '</button>'
      );
    }).join('');

    listEl.querySelectorAll('[data-fuel-vehicle-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectVehicle(btn.getAttribute('data-fuel-vehicle-id'));
        closeVehiclePicker();
      });
    });
  }

  function setVehicleTrigger(vehicleId) {
    var trigger = document.getElementById('fuel-vehicle-trigger');
    var hidden = document.getElementById('fuel-vehicle-id');
    if (!trigger || !hidden) return;

    hidden.value = vehicleId || '';

    if (!vehicleId) {
      trigger.innerHTML =
        '<span class="assign-picker__placeholder">Please select</span>' +
        chevronEl();
      initLucide(trigger);
      updateSaveButtons();
      return;
    }

    var v = vehicles.getById(vehicleId);
    if (!v) return;
    trigger.innerHTML =
      '<img src="' + escA(v.image) + '" alt="">' +
      '<span class="assign-picker__selected">' +
        '<strong>' + esc(v.name) + '</strong>' +
        '<small>' + esc(vehicleMeta(v)) + '</small>' +
      '</span>' +
      chevronEl();
    initLucide(trigger);
    updateSaveButtons();
  }

  function selectVehicle(vehicleId) {
    setVehicleTrigger(vehicleId);
  }

  function closeVehiclePicker() {
    var menu = document.getElementById('fuel-vehicle-menu');
    var trigger = document.getElementById('fuel-vehicle-trigger');
    if (menu) menu.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function toggleVehiclePicker() {
    var menu = document.getElementById('fuel-vehicle-menu');
    var trigger = document.getElementById('fuel-vehicle-trigger');
    if (!menu || !trigger) return;
    var open = menu.hidden;
    menu.hidden = !open;
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      var search = document.getElementById('fuel-vehicle-search');
      if (search) {
        search.value = '';
        filterVehicleList('');
        search.focus();
      }
    }
  }

  function filterVehicleList(query) {
    var q = String(query || '').trim().toLowerCase();
    var listEl = document.getElementById('fuel-vehicle-list');
    if (!listEl) return;
    listEl.querySelectorAll('.assign-picker__option').forEach(function (btn) {
      btn.hidden = q && btn.textContent.toLowerCase().indexOf(q) === -1;
    });
  }

  function formValid() {
    var vehicleId = document.getElementById('fuel-vehicle-id').value;
    var date = document.getElementById('fuel-entry-date').value;
    var time = document.getElementById('fuel-entry-time').value;
    return !!(vehicleId && date && time);
  }

  function updateSaveButtons() {
    var ok = formValid();
    ['fuel-save-top', 'fuel-save-footer', 'fuel-save-another'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.disabled = !ok;
    });
  }

  function resetForm(keepVehicle) {
    var form = document.getElementById('fuel-entry-form');
    if (!form) return;
    var vehicleId = keepVehicle ? document.getElementById('fuel-vehicle-id').value : '';
    form.reset();
    document.getElementById('fuel-entry-date').value = DEMO_DATE;
    document.getElementById('fuel-entry-time').value = DEMO_TIME;
    if (keepVehicle && vehicleId) setVehicleTrigger(vehicleId);
    else setVehicleTrigger('');
    document.getElementById('fuel-photos').value = '';
    document.getElementById('fuel-documents').value = '';
    document.querySelectorAll('.content--fuel-entry-form .expense-form-dropzone').forEach(function (z) {
      z.classList.remove('has-files');
    });
    updateSaveButtons();
  }

  function saveEntry(andAnother) {
    if (!formValid()) return;
    if (andAnother) {
      resetForm(false);
      buildVehicleList();
      initLucide();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.location.href = 'fuel-history';
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
    document.getElementById('fuel-vehicle-trigger').addEventListener('click', function (e) {
      e.stopPropagation();
      toggleVehiclePicker();
    });

    document.getElementById('fuel-vehicle-search').addEventListener('input', function (e) {
      filterVehicleList(e.target.value);
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#fuel-vehicle-picker')) closeVehiclePicker();
    });

    ['fuel-entry-date', 'fuel-entry-time'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', updateSaveButtons);
        el.addEventListener('change', updateSaveButtons);
      }
    });

    document.getElementById('fuel-entry-form').addEventListener('submit', function (e) {
      e.preventDefault();
      saveEntry(false);
    });

    document.getElementById('fuel-save-another').addEventListener('click', function () {
      saveEntry(true);
    });

    bindDropzone('fuel-photos-dropzone', 'fuel-photos');
    bindDropzone('fuel-documents-dropzone', 'fuel-documents');
  }

  function init() {
    if (document.body.getAttribute('data-subpage') !== 'fuel-entry-form') return;

    injectIcons();
    initLucide();
    populateVendors();
    buildVehicleList();
    document.getElementById('fuel-entry-date').value = DEMO_DATE;
    document.getElementById('fuel-entry-time').value = DEMO_TIME;

    var params = new URLSearchParams(window.location.search);
    var prefill = params.get('vehicle');
    if (prefill && vehicles.getById(prefill)) selectVehicle(prefill);

    bindEvents();
    updateSaveButtons();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
