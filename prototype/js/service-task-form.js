(function () {
  'use strict';

  var data = window.YSOAM_SERVICE_TASKS;
  var icons = window.YSOAM_ICONS;
  var selectedSubtasks = [];

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }

  function getId() {
    return new URLSearchParams(window.location.search).get('id');
  }

  function injectIcons() {
    if (!icons) return;
    document.querySelectorAll('[data-form-icon]').forEach(function (el) {
      var k = el.getAttribute('data-form-icon');
      if (icons[k]) el.innerHTML = icons[k];
    });
  }

  function populateSelects() {
    var cat = document.getElementById('st-category');
    var sys = document.getElementById('st-system');
    var asm = document.getElementById('st-assembly');
    var reason = document.getElementById('st-reason');
    cat.innerHTML = '<option value="">Select a Category</option>' + data.categoryOptions().map(function (o) {
      return '<option value="' + escA(o.value) + '">' + esc(o.label) + '</option>';
    }).join('');
    reason.innerHTML = '<option value="">Select a Reason for Repair</option>' + data.reasonOptions().map(function (o) {
      return '<option value="' + escA(o.value) + '">' + esc(o.label) + '</option>';
    }).join('');
    cat.onchange = function () { updateSystems(); updateSave(); };
    sys.onchange = function () { updateAssemblies(); updateSave(); };
    [asm, reason].forEach(function (el) { el.onchange = updateSave; });
    updateSystems();
  }

  function updateSystems() {
    var cat = document.getElementById('st-category').value;
    var sys = document.getElementById('st-system');
    var opts = data.systemOptions(cat);
    sys.innerHTML = '<option value="">Select a System</option>' + opts.map(function (o) {
      return '<option value="' + escA(o.value) + '">' + esc(o.label) + '</option>';
    }).join('');
    updateAssemblies();
  }

  function updateAssemblies() {
    var sys = document.getElementById('st-system').value;
    var asm = document.getElementById('st-assembly');
    var opts = data.assemblyOptions(sys);
    asm.innerHTML = '<option value="">Select an Assembly</option>' + opts.map(function (o) {
      return '<option value="' + escA(o.value) + '">' + esc(o.label) + '</option>';
    }).join('');
  }

  function buildSubtaskMenu(q) {
    var menu = document.getElementById('st-subtasks-menu');
    q = String(q || '').trim().toLowerCase();
    var items = data.selectableSubtasks().filter(function (t) {
      if (selectedSubtasks.indexOf(t.id) !== -1) return false;
      return !q || t.name.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 12);
    menu.innerHTML = items.length ? items.map(function (t) {
      return '<button type="button" class="st-subtask-option" data-id="' + escA(t.id) + '">' + esc(t.name) + '</button>';
    }).join('') : '<p class="st-subtask-empty">No tasks found</p>';
    menu.querySelectorAll('.st-subtask-option').forEach(function (btn) {
      btn.onclick = function () {
        selectedSubtasks.push(btn.getAttribute('data-id'));
        renderSubtaskTags();
        document.getElementById('st-subtasks-search').value = '';
        menu.hidden = true;
      };
    });
  }

  function renderSubtaskTags() {
    var wrap = document.getElementById('st-subtask-tags');
    wrap.innerHTML = selectedSubtasks.map(function (id) {
      var t = data.getById(id);
      return t ? '<span class="st-subtask-tag">' + esc(t.name) + '<button type="button" data-remove="' + escA(id) + '" aria-label="Remove">×</button></span>' : '';
    }).join('');
    wrap.querySelectorAll('[data-remove]').forEach(function (btn) {
      btn.onclick = function () {
        selectedSubtasks = selectedSubtasks.filter(function (id) { return id !== btn.getAttribute('data-remove'); });
        renderSubtaskTags();
      };
    });
  }

  function expandStep(step, scroll) {
    document.querySelectorAll('.st-step-card').forEach(function (section) {
      var n = parseInt(section.getAttribute('data-step'), 10);
      var expanded = n === step;
      section.classList.toggle('is-expanded', expanded);
      var body = section.querySelector('.st-step-card__body');
      var header = section.querySelector('.st-step-card__header');
      if (body) body.hidden = !expanded;
      if (header) header.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      var badge = section.querySelector('.st-step-card__badge');
      if (badge) badge.classList.toggle('is-active', expanded);
    });
    if (step === 2) updateRecommendation();
    if (scroll) {
      var target = document.querySelector('.st-step-card[data-step="' + step + '"]');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function updateRecommendation() {
    var name = document.getElementById('st-name').value.trim();
    var title = document.getElementById('st-recommendation-title');
    if (title) title.textContent = name ? "No Service Task Recommendation for '" + name + "'" : 'No Service Task Recommendation';
  }

  function valid() {
    return !!(document.getElementById('st-name').value.trim() &&
      document.getElementById('st-category').value &&
      document.getElementById('st-system').value);
  }

  function updateSave() {
    var ok = valid();
    var nameOk = !!document.getElementById('st-name').value.trim();
    document.getElementById('st-continue-1').disabled = !nameOk;
    document.getElementById('st-save-top').disabled = !ok;
    document.getElementById('st-save-footer').disabled = !ok;
    document.getElementById('st-save-another').disabled = !ok;
  }

  function loadExisting(id) {
    var row = data.getById(id);
    if (!row) return;
    document.getElementById('st-form-title').textContent = 'Edit Custom Service Task';
    document.title = 'Edit Custom Service Task — YSOAM';
    document.getElementById('st-name').value = row.name;
    document.getElementById('st-description').value = row.description || '';
    document.getElementById('st-category').value = row.category.code;
    updateSystems();
    document.getElementById('st-system').value = row.system.code;
    updateAssemblies();
    document.getElementById('st-assembly').value = row.assembly.code;
    document.getElementById('st-reason').value = row.reasonCode ? row.reasonCode.code : '';
    expandStep(3, false);
    updateSave();
  }

  function init() {
    injectIcons();
    initLucide();
    populateSelects();
    buildSubtaskMenu('');

    var id = getId();
    if (id) loadExisting(id);

    document.getElementById('st-name').oninput = function () { updateSave(); updateRecommendation(); };
    document.getElementById('st-description').oninput = updateSave;

    document.getElementById('st-subtasks-search').onfocus = function () {
      buildSubtaskMenu(document.getElementById('st-subtasks-search').value);
      document.getElementById('st-subtasks-menu').hidden = false;
    };
    document.getElementById('st-subtasks-search').oninput = function (e) {
      buildSubtaskMenu(e.target.value);
      document.getElementById('st-subtasks-menu').hidden = false;
    };

    document.querySelectorAll('[data-step-toggle]').forEach(function (btn) {
      btn.onclick = function () {
        expandStep(parseInt(btn.getAttribute('data-step-toggle'), 10), true);
      };
    });

    document.getElementById('st-continue-1').onclick = function () { expandStep(2, true); };
    document.getElementById('st-continue-2').onclick = function () { expandStep(3, true); };

    document.getElementById('service-task-form').onsubmit = function (e) {
      e.preventDefault();
      if (valid()) window.location.href = 'service-tasks';
    };

    document.getElementById('st-save-another').onclick = function () {
      if (!valid()) return;
      document.getElementById('st-name').value = '';
      document.getElementById('st-description').value = '';
      selectedSubtasks = [];
      renderSubtaskTags();
      expandStep(1, true);
      updateSave();
    };

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.st-subtask-picker')) document.getElementById('st-subtasks-menu').hidden = true;
    });

    updateSave();
  }

  if (document.body.getAttribute('data-subpage') === 'service-task-form') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})();
