(function () {
  'use strict';

  var vehicles = window.YSOAM_VEHICLES;
  var chargingData = window.YSOAM_CHARGING_HISTORY;
  var icons = window.YSOAM_ICONS;

  var DEMO_START_DATE = '2026-06-23';
  var DEMO_START_TIME = '13:43';

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
    var vendorEl = document.getElementById('charging-vendor');
    if (!vendorEl || !chargingData) return;
    chargingData.vendors.forEach(function (v) {
      var opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = v.name;
      vendorEl.appendChild(opt);
    });
  }

  function buildVehicleList() {
    var listEl = document.getElementById('charging-vehicle-list');
    if (!listEl) return;

    listEl.innerHTML = (vehicles.list || []).filter(function (v) {
      return v.assignment !== 'archived';
    }).map(function (v) {
      return (
        '<button type="button" class="assign-picker__option" role="option" data-charging-vehicle-id="' + escA(v.id) + '">' +
          '<img src="' + escA(v.image) + '" alt="">' +
          '<span class="assign-picker__option-text">' +
            '<strong>' + esc(v.name) + '</strong>' +
            '<small>' + esc(vehicleMeta(v)) + '</small>' +
          '</span>' +
        '</button>'
      );
    }).join('');

    listEl.querySelectorAll('[data-charging-vehicle-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectVehicle(btn.getAttribute('data-charging-vehicle-id'));
        closeVehiclePicker();
      });
    });
  }

  function setVehicleTrigger(vehicleId) {
    var trigger = document.getElementById('charging-vehicle-trigger');
    var hidden = document.getElementById('charging-vehicle-id');
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
    var menu = document.getElementById('charging-vehicle-menu');
    var trigger = document.getElementById('charging-vehicle-trigger');
    if (menu) menu.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function toggleVehiclePicker() {
    var menu = document.getElementById('charging-vehicle-menu');
    var trigger = document.getElementById('charging-vehicle-trigger');
    if (!menu || !trigger) return;
    var open = menu.hidden;
    menu.hidden = !open;
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      var search = document.getElementById('charging-vehicle-search');
      if (search) {
        search.value = '';
        filterVehicleList('');
        search.focus();
      }
    }
  }

  function filterVehicleList(query) {
    var q = String(query || '').trim().toLowerCase();
    var listEl = document.getElementById('charging-vehicle-list');
    if (!listEl) return;
    listEl.querySelectorAll('.assign-picker__option').forEach(function (btn) {
      btn.hidden = q && btn.textContent.toLowerCase().indexOf(q) === -1;
    });
  }

  function parseDateTime(dateId, timeId) {
    var date = document.getElementById(dateId).value;
    var time = document.getElementById(timeId).value;
    if (!date || !time) return null;
    return new Date(date + 'T' + time);
  }

  function updateDurationFromTimes() {
    var start = parseDateTime('charging-start-date', 'charging-start-time');
    var end = parseDateTime('charging-end-date', 'charging-end-time');
    var durationEl = document.getElementById('charging-duration');
    if (!durationEl || !start || !end) return;
    var diff = Math.round((end - start) / 60000);
    if (diff > 0) durationEl.value = diff;
  }

  function updateCostFromEnergy() {
    var energy = parseFloat(document.getElementById('charging-energy').value, 10);
    var price = parseFloat(document.getElementById('charging-unit-price').value, 10);
    var costEl = document.getElementById('charging-energy-cost');
    if (!costEl || isNaN(energy) || isNaN(price)) return;
    costEl.value = Math.round(energy * price * 100) / 100;
  }

  function formValid() {
    var vehicleId = document.getElementById('charging-vehicle-id').value;
    var startDate = document.getElementById('charging-start-date').value;
    var startTime = document.getElementById('charging-start-time').value;
    var energy = document.getElementById('charging-energy').value;
    return !!(vehicleId && startDate && startTime && energy);
  }

  function updateSaveButtons() {
    var ok = formValid();
    ['charging-save-top', 'charging-save-footer', 'charging-save-another'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.disabled = !ok;
    });
  }

  function resetForm(keepVehicle) {
    var form = document.getElementById('charging-entry-form');
    if (!form) return;
    var vehicleId = keepVehicle ? document.getElementById('charging-vehicle-id').value : '';
    form.reset();
    document.getElementById('charging-start-date').value = DEMO_START_DATE;
    document.getElementById('charging-start-time').value = DEMO_START_TIME;
    document.getElementById('charging-end-date').value = '';
    document.getElementById('charging-end-time').value = '';
    if (keepVehicle && vehicleId) setVehicleTrigger(vehicleId);
    else setVehicleTrigger('');
    document.getElementById('charging-photos').value = '';
    document.getElementById('charging-documents').value = '';
    document.querySelectorAll('.content--charging-entry-form .expense-form-dropzone').forEach(function (z) {
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
    window.location.href = 'charging-history';
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

  function prefillFromEntry(row) {
    if (!row) return;
    selectVehicle(row.vehicleId);
    document.getElementById('charging-vendor').value = row.vendor.id;

    var start = new Date(row.startTime);
    var end = new Date(row.endTime);
    document.getElementById('charging-start-date').value = start.toISOString().slice(0, 10);
    document.getElementById('charging-start-time').value = String(start.getHours()).padStart(2, '0') + ':' + String(start.getMinutes()).padStart(2, '0');
    document.getElementById('charging-end-date').value = end.toISOString().slice(0, 10);
    document.getElementById('charging-end-time').value = String(end.getHours()).padStart(2, '0') + ':' + String(end.getMinutes()).padStart(2, '0');
    document.getElementById('charging-duration').value = row.durationMin;
    document.getElementById('charging-energy').value = row.totalEnergy;
    document.getElementById('charging-unit-price').value = row.unitPrice;
    document.getElementById('charging-energy-cost').value = row.energyCost;
    if (row.reference) document.getElementById('charging-reference').value = row.reference;
    if (row.isPersonal) document.getElementById('charging-flag-personal').checked = true;

    var title = document.getElementById('charging-form-title');
    if (title) title.textContent = 'Edit Charging Entry';
    document.title = 'Edit Charging Entry — YSOAM';
    updateSaveButtons();
  }

  function bindEvents() {
    document.getElementById('charging-vehicle-trigger').addEventListener('click', function (e) {
      e.stopPropagation();
      toggleVehiclePicker();
    });

    document.getElementById('charging-vehicle-search').addEventListener('input', function (e) {
      filterVehicleList(e.target.value);
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#charging-vehicle-picker')) closeVehiclePicker();
    });

    ['charging-start-date', 'charging-start-time', 'charging-end-date', 'charging-end-time', 'charging-energy'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', function () {
        updateDurationFromTimes();
        updateCostFromEnergy();
        updateSaveButtons();
      });
      el.addEventListener('change', function () {
        updateDurationFromTimes();
        updateCostFromEnergy();
        updateSaveButtons();
      });
    });

    document.getElementById('charging-unit-price').addEventListener('input', updateCostFromEnergy);

    document.getElementById('charging-entry-form').addEventListener('submit', function (e) {
      e.preventDefault();
      saveEntry(false);
    });

    document.getElementById('charging-save-another').addEventListener('click', function () {
      saveEntry(true);
    });

    document.getElementById('charging-fees-link').addEventListener('click', function () {
      window.alert('Add fees or discounts (prototype demo).');
    });

    bindDropzone('charging-photos-dropzone', 'charging-photos');
    bindDropzone('charging-documents-dropzone', 'charging-documents');
  }

  function init() {
    if (document.body.getAttribute('data-subpage') !== 'charging-entry-form') return;

    injectIcons();
    initLucide();
    populateVendors();
    buildVehicleList();
    document.getElementById('charging-start-date').value = DEMO_START_DATE;
    document.getElementById('charging-start-time').value = DEMO_START_TIME;

    var params = new URLSearchParams(window.location.search);
    var prefillVehicle = params.get('vehicle');
    var entryId = params.get('id');
    if (entryId && chargingData) {
      prefillFromEntry(chargingData.getById(entryId));
    } else if (prefillVehicle && vehicles.getById(prefillVehicle)) {
      selectVehicle(prefillVehicle);
    }

    bindEvents();
    updateSaveButtons();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
