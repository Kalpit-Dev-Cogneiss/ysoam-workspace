(function () {
  'use strict';

  if (document.body.getAttribute('data-subpage') !== 'tyre-reading-form') return;

  var data = window.YSOAM_TYRES;
  var vehicles = window.YSOAM_VEHICLES;
  var icons = window.YSOAM_ICONS;

  function getId() {
    return new URLSearchParams(window.location.search).get('id');
  }

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }

  function injectIcons() {
    if (!icons) return;
    document.querySelectorAll('[data-form-icon]').forEach(function (el) {
      var key = el.getAttribute('data-form-icon');
      if (icons[key]) el.innerHTML = icons[key];
    });
  }

  function updateSaveState() {
    var vehicleId = document.getElementById('tyre-vehicle').value;
    var position = document.getElementById('tyre-position').value;
    var tread = document.getElementById('tyre-tread').value;
    var pressure = document.getElementById('tyre-pressure').value;
    var date = document.getElementById('tyre-reading-date').value;
    var valid = !!(vehicleId && position && tread !== '' && pressure !== '' && date);
    ['tyre-form-save-top', 'tyre-form-save-bottom', 'tyre-form-save-another'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.disabled = !valid;
    });
  }

  function fillSelect(el, options, placeholder) {
    if (!el) return;
    el.innerHTML = '<option value="">' + esc(placeholder || 'Please select') + '</option>' +
      options.map(function (o) {
        var val = typeof o === 'string' ? o : o.id || o;
        var label = typeof o === 'string' ? o : o.label || o;
        return '<option value="' + escA(val) + '">' + esc(label) + '</option>';
      }).join('');
  }

  function renderVehicleSummary(vehicleId) {
    var card = document.getElementById('tyre-form-vehicle-card');
    var body = document.getElementById('tyre-form-vehicle-summary');
    if (!vehicleId) {
      card.hidden = true;
      return;
    }
    var v = vehicles.getById(vehicleId);
    if (!v) {
      card.hidden = true;
      return;
    }
    card.hidden = false;
    body.innerHTML =
      '<div class="tyre-form-vehicle-summary__row">' +
        '<img src="' + escA(v.image) + '" alt="" width="48" height="48" class="fh-vehicle-thumb">' +
        '<div><strong>' + esc(v.name) + '</strong>' +
        '<p>' + esc(v.type) + ' · ' + esc(v.group) + '</p></div>' +
      '</div>';
  }

  function populateForm(tyre) {
    document.getElementById('tyre-vehicle').value = tyre.vehicleId || '';
    document.getElementById('tyre-position').value = tyre.position === '—' ? '' : tyre.position;
    document.getElementById('tyre-serial').value = tyre.serialNumber || '';
    document.getElementById('tyre-brand').value = tyre.brand || '';
    document.getElementById('tyre-size').value = tyre.size || '';
    document.getElementById('tyre-tread').value = tyre.treadDepthMm != null ? tyre.treadDepthMm : '';
    document.getElementById('tyre-pressure').value = tyre.pressurePsi != null ? tyre.pressurePsi : '';
    document.getElementById('tyre-reading-date').value = '2026-06-15';
    renderVehicleSummary(tyre.vehicleId);
    updateSaveState();
  }

  function handleSubmit(e, addAnother) {
    e.preventDefault();
    if (!document.getElementById('tyre-vehicle').value) return;

    if (addAnother) {
      window.alert('Tyre reading saved (prototype). Add another reading.');
      document.getElementById('tyre-tread').value = '';
      document.getElementById('tyre-pressure').value = '';
      document.getElementById('tyre-notes').value = '';
      updateSaveState();
      return;
    }

    var editId = getId();
    var targetId = editId || 'TYR-99';
    window.location.href = 'tyre-view?id=' + encodeURIComponent(targetId);
  }

  function init() {
    injectIcons();
    initLucide();

    fillSelect(document.getElementById('tyre-vehicle'), data.vehicleList(), 'Please select');
    fillSelect(document.getElementById('tyre-position'), data.POSITIONS, 'Please select');
    fillSelect(document.getElementById('tyre-brand'), data.BRANDS, 'Please select');
    fillSelect(document.getElementById('tyre-size'), data.SIZES, 'Please select');
    document.getElementById('tyre-reading-date').value = '2026-06-15';

    var editId = getId();
    if (editId) {
      var tyre = data.getById(editId);
      if (tyre) {
        document.getElementById('tyre-form-title').textContent = 'Edit Tyre Reading';
        document.title = 'Edit ' + tyre.id + ' — YSOAM';
        populateForm(tyre);
      }
    }

    ['tyre-vehicle', 'tyre-position', 'tyre-tread', 'tyre-pressure', 'tyre-reading-date'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', updateSaveState);
      if (el) el.addEventListener('change', function () {
        if (id === 'tyre-vehicle') renderVehicleSummary(el.value);
        updateSaveState();
      });
    });

    document.getElementById('tyre-reading-form').addEventListener('submit', function (e) {
      handleSubmit(e, false);
    });
    document.getElementById('tyre-form-save-another').addEventListener('click', function (e) {
      handleSubmit(e, true);
    });

    updateSaveState();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
