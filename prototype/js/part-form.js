(function () {
  'use strict';

  var data = window.YSOAM_PARTS;

  function getId() {
    return new URLSearchParams(window.location.search).get('id');
  }

  function initLucide(root) {
    if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root);
  }

  function fillSelect(el, items, selected) {
    if (!el) return;
    items.forEach(function (item) {
      var opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = item.label;
      if (selected && selected === item.id) opt.selected = true;
      el.appendChild(opt);
    });
  }

  function updateSaveState() {
    var num = document.getElementById('part-number').value.trim();
    var valid = !!num;
    ['part-form-save-top', 'part-form-save-bottom', 'part-form-save-another'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.disabled = !valid;
    });
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

  function resetDropzones() {
    document.getElementById('part-photos').value = '';
    document.getElementById('part-documents').value = '';
    document.querySelectorAll('.content--part-form .expense-form-dropzone').forEach(function (z) {
      z.classList.remove('has-files', 'is-dragover');
    });
  }

  function populateForm(part) {
    document.getElementById('part-number').value = part.partNumber;
    document.getElementById('part-description').value = part.description || '';
    document.getElementById('part-mfr-number').value = part.mfrPartNumber || '';
    document.getElementById('part-upc').value = part.upc || '';
    document.getElementById('part-unit-cost').value = part.unitCost || '';
    if (part.category) document.getElementById('part-category').value = part.category;
    if (part.manufacturer) document.getElementById('part-manufacturer').value = part.manufacturer;
    if (part.unit) document.getElementById('part-unit').value = part.unit;
    updateSaveState();
  }

  function handleSubmit(e, addAnother) {
    e.preventDefault();
    var num = document.getElementById('part-number').value.trim();
    if (!num) return;

    var existing = data.getByPartNumber(num);
    var editId = getId();
    if (!editId && existing) {
      window.alert('Part number must be unique. Part "' + num + '" already exists.');
      return;
    }

    if (addAnother) {
      window.alert('Part saved (prototype demo). Add another part.');
      document.getElementById('part-form').reset();
      resetDropzones();
      updateSaveState();
      return;
    }

    var targetId = editId || (existing ? existing.id : 'PART-1');
    window.location.href = 'part-view?id=' + encodeURIComponent(targetId);
  }

  function init() {
    if (document.body.getAttribute('data-subpage') !== 'part-form') return;
    initLucide();

    fillSelect(document.getElementById('part-category'), data.categories);
    fillSelect(document.getElementById('part-manufacturer'), data.manufacturers);
    fillSelect(document.getElementById('part-unit'), data.units);

    var editId = getId();
    if (editId) {
      var part = data.getById(editId);
      if (!part) {
        window.location.href = 'parts';
        return;
      }
      document.getElementById('part-form-title').textContent = 'Edit Part';
      document.title = 'Edit Part — YSOAM';
      populateForm(part);
    }

    document.getElementById('part-number').addEventListener('input', updateSaveState);
    bindDropzone('part-photos-dropzone', 'part-photos');
    bindDropzone('part-documents-dropzone', 'part-documents');

    document.getElementById('part-form').addEventListener('submit', function (e) {
      handleSubmit(e, false);
    });
    document.getElementById('part-form-save-another').addEventListener('click', function (e) {
      handleSubmit(e, true);
    });

    updateSaveState();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
