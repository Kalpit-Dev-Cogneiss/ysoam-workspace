(function () {
  'use strict';

  var data = window.YSOAM_SERVICE_TASKS;
  var icons = window.YSOAM_ICONS;
  var row = null;
  var useRecommended = false;

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }
  function lucide(name, size) { return window.YSOAM_LUCIDE ? window.YSOAM_LUCIDE.icon(name, size || 16) : ''; }

  function getId() {
    return new URLSearchParams(window.location.search).get('id');
  }

  function injectIcons(root) {
    if (!icons) return;
    (root || document).querySelectorAll('[data-form-icon]').forEach(function (el) {
      var k = el.getAttribute('data-form-icon');
      if (icons[k]) el.innerHTML = icons[k];
    });
  }

  function recommendedPath(r) {
    return 'Category: ' + r.category.code + ' ' + r.category.label +
      ' &gt; System: ' + r.system.code + ' ' + r.system.label +
      ' &gt; Assembly: ' + r.assembly.code + ' ' + r.assembly.label;
  }

  function categoryOptions(sel) {
    return '<option value="">Select a Category</option>' + data.categoryOptions().map(function (o) {
      return '<option value="' + escA(o.value) + '"' + (sel === o.value ? ' selected' : '') + '>' + esc(o.label) + '</option>';
    }).join('');
  }

  function systemOptions(catCode, sel) {
    return '<option value="">Select a System</option>' + data.systemOptions(catCode).map(function (o) {
      return '<option value="' + escA(o.value) + '"' + (sel === o.value ? ' selected' : '') + '>' + esc(o.label) + '</option>';
    }).join('');
  }

  function assemblyOptions(sysCode, sel) {
    return '<option value="">Select an Assembly</option>' + data.assemblyOptions(sysCode).map(function (o) {
      return '<option value="' + escA(o.value) + '"' + (sel === o.value ? ' selected' : '') + '>' + esc(o.label) + '</option>';
    }).join('');
  }

  function reasonOptions(sel) {
    return '<option value="">Select a Reason for Repair</option>' + data.reasonOptions().map(function (o) {
      return '<option value="' + escA(o.value) + '"' + (sel === o.value ? ' selected' : '') + '>' + esc(o.label) + '</option>';
    }).join('');
  }

  function toggleCategorizationFields() {
    var custom = document.getElementById('st-edit-custom-fields');
    if (custom) custom.hidden = useRecommended;
  }

  function bindCategorization() {
    var cat = document.getElementById('st-edit-category');
    var sys = document.getElementById('st-edit-system');
    var asm = document.getElementById('st-edit-assembly');
    if (!cat) return;

    cat.onchange = function () {
      sys.innerHTML = systemOptions(cat.value, '');
      asm.innerHTML = assemblyOptions('', '');
    };
    sys.onchange = function () {
      asm.innerHTML = assemblyOptions(sys.value, '');
    };

    document.querySelectorAll('input[name="st-cat-mode"]').forEach(function (radio) {
      radio.onchange = function () {
        useRecommended = radio.value === 'recommended';
        toggleCategorizationFields();
      };
    });
  }

  function render() {
    var root = document.getElementById('service-task-edit-root');
    row = data.getById(getId());
    if (!row) {
      window.location.href = 'service-tasks';
      return;
    }

    var title = row.type === 'standard' ? 'Edit Standard Service Task' : 'Edit Service Task';
    document.title = title + ' — YSOAM';

    root.innerHTML =
      '<header class="vehicle-form-topbar expense-form-topbar">' +
        '<div class="vehicle-form-topbar__main">' +
          '<nav class="st-edit-breadcrumb" aria-label="Breadcrumb">' +
            '<a href="service-tasks">Service Tasks</a>' +
            '<span aria-hidden="true">›</span>' +
            '<span>' + esc(row.name) + '</span>' +
          '</nav>' +
          '<h1>' + esc(title) + '</h1>' +
        '</div>' +
        '<div class="vehicle-form-topbar__actions">' +
          '<a class="btn btn-text btn-sm" href="service-tasks">Cancel</a>' +
          '<button type="submit" form="service-task-edit-form" class="btn btn-primary btn-sm">Save Service Task</button>' +
        '</div>' +
      '</header>' +
      '<div class="expense-form-body">' +
        '<div class="expense-form-main">' +
        '<form class="st-edit-form" id="service-task-edit-form" novalidate>' +
          '<section class="vehicle-form-card expense-form-card st-edit-section">' +
            '<header class="st-edit-section__header">' +
              '<span class="st-edit-section__icon st-edit-section__icon--done" aria-hidden="true">' + lucide('circleCheck', 18) + '</span>' +
              '<h2>Details</h2>' +
              '<button type="button" class="btn btn-outline btn-sm st-edit-section__edit"><span data-lucide-icon="pencil" data-lucide-icon-size="14"></span> Edit</button>' +
            '</header>' +
            '<div class="st-edit-summary">' +
              '<div class="st-edit-summary__item"><span class="st-edit-summary__label">Name</span><strong>' + esc(row.name) + '</strong></div>' +
              '<div class="st-edit-summary__item"><span class="st-edit-summary__label">Alias</span><input type="text" class="text-input" id="st-edit-alias" placeholder="" value="' + escA(row.alias || '') + '"></div>' +
              '<div class="st-edit-summary__item st-edit-summary__item--full"><span class="st-edit-summary__label">Description</span><textarea class="text-input" id="st-edit-description" rows="3" placeholder="Additional details about the service/maintenance task.">' + esc(row.description || '') + '</textarea></div>' +
              '<div class="st-edit-summary__item st-edit-summary__item--full"><span class="st-edit-summary__label">Subtasks</span>' +
                '<div class="st-subtask-picker"><span class="st-subtask-picker__icon" data-lucide-icon="search" aria-hidden="true"></span>' +
                '<input type="search" class="text-input" placeholder="Select Service Tasks" aria-label="Select service tasks" disabled></div>' +
                '<p class="form-hint">Only Service Tasks without Subtasks can be added.</p></div>' +
            '</div>' +
          '</section>' +
          '<section class="vehicle-form-card expense-form-card st-edit-section">' +
            '<header class="st-edit-section__header"><h2>Maintenance Categorization</h2></header>' +
            '<label class="st-cat-radio st-cat-radio--recommended">' +
              '<input type="radio" name="st-cat-mode" value="recommended">' +
              '<span class="st-cat-radio__box"><strong>Use Fleetio Recommended Categorization</strong>' +
              '<span class="st-cat-radio__path">' + recommendedPath(row.recommended) + '</span></span>' +
            '</label>' +
            '<label class="st-cat-radio st-cat-radio--custom">' +
              '<input type="radio" name="st-cat-mode" value="custom" checked>' +
              '<span class="st-cat-radio__box"><strong>Use My Own Categorization</strong></span>' +
            '</label>' +
            '<div class="st-edit-cat-fields" id="st-edit-custom-fields">' +
              '<div class="form-field form-field--full"><label for="st-edit-category">Category Code</label>' +
              '<select id="st-edit-category" class="text-input">' + categoryOptions(row.category.code) + '</select>' +
              '<p class="form-hint">Category Code: a one-digit number that identifies the category involved in the repair (chassis, for example).</p></div>' +
              '<div class="form-field form-field--full"><label for="st-edit-system">System Code</label>' +
              '<select id="st-edit-system" class="text-input">' + systemOptions(row.category.code, row.system.code) + '</select>' +
              '<p class="form-hint">Code Key 31: System Level Codes — a three-digit number that identifies the system involved in the repair (brakes, for example).</p></div>' +
              '<div class="form-field form-field--full"><label for="st-edit-assembly">Assembly Code</label>' +
              '<select id="st-edit-assembly" class="text-input">' + assemblyOptions(row.system.code, row.assembly.code) + '</select>' +
              '<p class="form-hint">Code Key 32: Assembly Level Codes — used to further define the system (front brakes, for example).</p></div>' +
              '<div class="form-field form-field--full"><label for="st-edit-reason">Reason for Repair Code</label>' +
              '<select id="st-edit-reason" class="text-input">' + reasonOptions(row.reasonCode ? row.reasonCode.code : '') + '</select>' +
              '<p class="form-hint">Code Key 14: Divided into the subcategories of maintenance, management decision and outside influence, Reason for Repair codes indicate why the asset has been sent to the shop (breakdown, for example).</p></div>' +
            '</div>' +
          '</section>' +
        '</form>' +
        '<div class="st-form-help">Need help getting started with Service Tasks? <a href="roadmap.html">Learn More <span data-lucide-icon="externalLink" data-lucide-icon-size="14" aria-hidden="true"></span></a></div>' +
        '</div>' +
      '</div>' +
      '<footer class="vehicle-form-footer expense-form-footer">' +
        '<a class="btn btn-text btn-sm" href="service-tasks">Cancel</a>' +
        '<div class="vehicle-form-footer__right">' +
          '<button type="submit" form="service-task-edit-form" class="btn btn-primary btn-sm">Save Service Task</button>' +
        '</div>' +
      '</footer>';

    injectIcons(root);
    initLucide(root);
    bindCategorization();
    toggleCategorizationFields();

    document.getElementById('service-task-edit-form').onsubmit = function (e) {
      e.preventDefault();
      window.location.href = 'service-tasks';
    };
  }

  if (document.body.getAttribute('data-subpage') === 'service-task-edit') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
    else render();
  }
})();
