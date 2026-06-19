(function () {
  'use strict';

  var vehicles = window.YSOAM_VEHICLES;
  var serviceData = window.YSOAM_SERVICE_HISTORY;
  var icons = window.YSOAM_ICONS;
  var DEMO_DATE = '2026-06-19';
  var DEMO_TIME = '13:25';
  var lineIdx = 0;

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }

  function statusLabel(s) {
    var m = { active: 'Active', transit: 'In Transit', idle: 'Idle', offline: 'Offline', maintenance: 'Maintenance' };
    return m[s] || s;
  }
  function vehicleMeta(v) { return statusLabel(v.status) + ' · ' + v.type + ' · ' + v.group; }

  function chevronEl() {
    return '<span class="assign-picker__chevron" data-lucide-icon="chevronDown" data-lucide-icon-size="14" aria-hidden="true"></span>';
  }

  function initLucide(root) {
    if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root);
  }

  function injectIcons() {
    if (!icons) return;
    document.querySelectorAll('[data-form-icon]').forEach(function (el) {
      var k = el.getAttribute('data-form-icon');
      if (icons[k]) el.innerHTML = icons[k];
    });
  }

  function buildVehicleList() {
    var listEl = document.getElementById('wo-vehicle-list');
    if (!listEl) return;
    listEl.innerHTML = (vehicles.list || []).filter(function (v) { return v.assignment !== 'archived'; }).map(function (v) {
      return '<button type="button" class="assign-picker__option" role="option" data-wo-vehicle="' + escA(v.id) + '">' +
        '<img src="' + escA(v.image) + '" alt=""><span class="assign-picker__option-text"><strong>' + esc(v.name) + '</strong><small>' + esc(vehicleMeta(v)) + '</small></span></button>';
    }).join('');
    listEl.querySelectorAll('[data-wo-vehicle]').forEach(function (btn) {
      btn.onclick = function () { selectVehicle(btn.getAttribute('data-wo-vehicle')); closePicker(); };
    });
  }

  function setVehicle(id) {
    var trigger = document.getElementById('wo-vehicle-trigger');
    var hidden = document.getElementById('wo-vehicle-id');
    hidden.value = id || '';
    if (!id) {
      trigger.innerHTML = '<span class="assign-picker__placeholder">Please select</span>' + chevronEl();
      initLucide(trigger);
      toggleSections(false);
      return;
    }
    var v = vehicles.getById(id);
    if (!v) return;
    trigger.innerHTML = '<img src="' + escA(v.image) + '" alt=""><span class="assign-picker__selected"><strong>' + esc(v.name) + '</strong><small>' + esc(vehicleMeta(v)) + '</small></span>' + chevronEl();
    initLucide(trigger);
    toggleSections(true);
  }

  function toggleSections(on) {
    ['wo-issues-placeholder', 'wo-line-items-placeholder'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.hidden = on;
    });
    ['wo-issues-body', 'wo-line-items-body'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.hidden = !on;
    });
  }

  function selectVehicle(id) { setVehicle(id); updateSave(); }

  function closePicker() {
    document.getElementById('wo-vehicle-menu').hidden = true;
    document.getElementById('wo-vehicle-trigger').setAttribute('aria-expanded', 'false');
  }

  function togglePicker() {
    var menu = document.getElementById('wo-vehicle-menu');
    var open = menu.hidden;
    menu.hidden = !open;
    document.getElementById('wo-vehicle-trigger').setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) document.getElementById('wo-vehicle-search').focus();
  }

  function filterVehicles(q) {
    q = String(q || '').trim().toLowerCase();
    document.querySelectorAll('#wo-vehicle-list .assign-picker__option').forEach(function (b) {
      b.hidden = q && b.textContent.toLowerCase().indexOf(q) === -1;
    });
  }

  function taskOptions(sel) {
    var tasks = (serviceData && serviceData.tasks) || [];
    return '<option value="">Select service task</option>' + tasks.map(function (t) {
      return '<option value="' + escA(t) + '"' + (sel === t ? ' selected' : '') + '>' + esc(t) + '</option>';
    }).join('');
  }

  function addLineItem() {
    var list = document.getElementById('wo-line-items-list');
    var row = document.createElement('div');
    row.className = 'service-form-line-item';
    row.innerHTML = '<select class="text-input">' + taskOptions() + '</select><button type="button" class="btn btn-text btn-sm">Remove</button>';
    row.querySelector('button').onclick = function () { row.remove(); updateSave(); };
    row.querySelector('select').onchange = updateSave;
    list.appendChild(row);
    updateSave();
  }

  function valid() {
    return !!(document.getElementById('wo-vehicle-id').value &&
      document.getElementById('wo-issue-date').value &&
      document.getElementById('wo-issue-time').value);
  }

  function updateSave() {
    var ok = valid();
    document.getElementById('wo-save-top').disabled = !ok;
    document.getElementById('wo-save-footer').disabled = !ok;
  }

  function bindDropzone(lid, iid) {
    var label = document.getElementById(lid);
    var input = document.getElementById(iid);
    if (!label || !input) return;
    label.ondragover = function (e) { e.preventDefault(); label.classList.add('is-dragover'); };
    label.ondragleave = function () { label.classList.remove('is-dragover'); };
    label.ondrop = function (e) {
      e.preventDefault();
      label.classList.remove('is-dragover');
      if (e.dataTransfer.files.length) { input.files = e.dataTransfer.files; label.classList.add('has-files'); }
    };
    input.onchange = function () { label.classList.toggle('has-files', input.files.length > 0); };
  }

  function init() {
    injectIcons();
    initLucide();
    buildVehicleList();
    document.getElementById('wo-issue-date').value = DEMO_DATE;
    document.getElementById('wo-issue-time').value = DEMO_TIME;

    document.getElementById('wo-vehicle-trigger').onclick = function (e) { e.stopPropagation(); togglePicker(); };
    document.getElementById('wo-vehicle-search').oninput = function (e) { filterVehicles(e.target.value); };
    document.addEventListener('click', function (e) { if (!e.target.closest('#wo-vehicle-picker')) closePicker(); });

    ['wo-issue-date', 'wo-issue-time'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.oninput = updateSave; el.onchange = updateSave; }
    });

    document.getElementById('work-order-form').onsubmit = function (e) {
      e.preventDefault();
      if (valid()) window.location.href = 'work-orders';
    };

    document.getElementById('wo-add-line-item').onclick = addLineItem;
    bindDropzone('wo-photos-dropzone', 'wo-photos');
    bindDropzone('wo-documents-dropzone', 'wo-documents');
    updateSave();
  }

  if (document.body.getAttribute('data-subpage') === 'work-order-form') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})();
