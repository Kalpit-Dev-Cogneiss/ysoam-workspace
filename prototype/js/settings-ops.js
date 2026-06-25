(function () {
  'use strict';

  var DATA = window.YSOAM_SETTINGS_OPS_DATA || {};
  var searches = {
    'issue-priorities': '',
    'fault-rules': '',
    'vehicle-renewal-types': '',
    'contact-renewal-types': ''
  };

  var OPS_PANELS = [
    'inspection-settings',
    'issue-priorities',
    'fault-rules',
    'service-reminder-settings',
    'vehicle-renewal-types',
    'contact-renewal-types'
  ];

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

  function priorityIcon(type) {
    if (type === 'none') return '<span class="issue-priority-icon issue-priority-icon--none" aria-hidden="true"></span>';
    if (type === 'critical') return '<span class="issue-priority-icon issue-priority-icon--critical" aria-hidden="true">!</span>';
    var count = type === 'low' ? 2 : type === 'medium' ? 3 : 3;
    var levelClass = type === 'high' ? ' issue-priority-icon--high' : '';
    var chevrons = '';
    for (var i = 0; i < count; i++) chevrons += '<span class="issue-priority-chevron' + levelClass + '" aria-hidden="true"></span>';
    return '<span class="issue-priority-icon issue-priority-icon--chevrons">' + chevrons + '</span>';
  }

  function renderIssuePriorities() {
    var body = document.getElementById('issue-priorities-table-body');
    if (!body) return;
    var rows = filterList(DATA.issuePriorities || [], searches['issue-priorities'], ['name', 'subtitle', 'alias']);
    body.innerHTML = rows.map(function (item) {
      var badge = item.isDefault ? ' <span class="settings-access-badge settings-access-badge--muted">Default</span>' : '';
      return (
        '<tr>' +
          '<td>' +
            '<div class="issue-priority-name">' + priorityIcon(item.icon) +
              '<div><strong>' + esc(item.name) + '</strong>' + badge +
              '<p class="issue-priority-name__sub">' + esc(item.subtitle) + '</p></div>' +
            '</div>' +
          '</td>' +
          '<td>' + esc(item.alias) + '</td>' +
          '<td class="settings-list-usage"><a href="issues.html" class="settings-usage-link tabular-nums">' + esc(String(item.issues)) + '</a></td>' +
          '<td class="settings-ops-enabled"><span data-lucide-icon="circleCheck" aria-label="Enabled"></span></td>' +
        '</tr>'
      );
    }).join('');
    initLucide(body);
  }

  function renderFaultRules() {
    var body = document.getElementById('fault-rules-table-body');
    var empty = document.getElementById('fault-rules-empty');
    if (!body) return;
    var rows = filterList(DATA.faultRules || [], searches['fault-rules'], ['code', 'description']);
    updatePager('fault-rules-pager-label', rows.length);
    if (!rows.length) {
      body.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    body.innerHTML = rows.map(function (item) {
      return (
        '<tr>' +
          '<td class="settings-access-table__check"><input type="checkbox" aria-label="Select ' + esc(item.code) + '"></td>' +
          '<td><strong>' + esc(item.code) + '</strong></td>' +
          '<td>' + esc(item.description || '—') + '</td>' +
        '</tr>'
      );
    }).join('');
  }

  function renderRenewalTypes(listKey, bodyId, pagerId, usageLabel) {
    var body = document.getElementById(bodyId);
    if (!body) return;
    var panelId = bodyId.replace('-table-body', '');
    var rows = filterList(DATA[listKey] || [], searches[panelId], ['name']);
    updatePager(pagerId, rows.length);
    body.innerHTML = rows.map(function (item) {
      return (
        '<tr>' +
          '<td class="settings-access-table__check"><input type="checkbox" aria-label="Select ' + esc(item.name) + '"></td>' +
          '<td><strong>' + esc(item.name) + '</strong></td>' +
          '<td class="settings-list-usage"><span class="settings-usage-text">' + esc(usageLabel(item.usage)) + '</span></td>' +
        '</tr>'
      );
    }).join('');
  }

  function bindModal(overlayId, openBtnId, closeBtnId, cancelBtnId, formId, focusId, onSubmit) {
    var openBtn = document.getElementById(openBtnId);
    var overlay = document.getElementById(overlayId);
    var closeBtn = document.getElementById(closeBtnId);
    var cancelBtn = document.getElementById(cancelBtnId);
    var form = document.getElementById(formId);

    if (openBtn && !openBtn.dataset.bound) {
      openBtn.dataset.bound = '1';
      openBtn.addEventListener('click', function () {
        if (form) form.reset();
        if (overlay) overlay.classList.add('is-open');
        var focus = document.getElementById(focusId);
        if (focus) focus.focus();
        initLucide(overlay);
      });
    }
    if (closeBtn && !closeBtn.dataset.bound) {
      closeBtn.dataset.bound = '1';
      closeBtn.addEventListener('click', function () { if (overlay) overlay.classList.remove('is-open'); });
    }
    if (cancelBtn && !cancelBtn.dataset.bound) {
      cancelBtn.dataset.bound = '1';
      cancelBtn.addEventListener('click', function () { if (overlay) overlay.classList.remove('is-open'); });
    }
    if (overlay && !overlay.dataset.bound) {
      overlay.dataset.bound = '1';
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) overlay.classList.remove('is-open');
      });
    }
    if (form && !form.dataset.bound) {
      form.dataset.bound = '1';
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (onSubmit()) overlay.classList.remove('is-open');
      });
    }
  }

  function bindForms() {
    var inspectionForm = document.getElementById('inspection-settings-form');
    if (inspectionForm && !inspectionForm.dataset.bound) {
      inspectionForm.dataset.bound = '1';
      inspectionForm.addEventListener('submit', function (e) {
        e.preventDefault();
        window.alert('Inspection settings saved.');
      });
    }

    var reminderForm = document.getElementById('service-reminder-settings-form');
    if (reminderForm && !reminderForm.dataset.bound) {
      reminderForm.dataset.bound = '1';
      reminderForm.addEventListener('submit', function (e) {
        e.preventDefault();
        window.alert('Service reminder settings saved.');
      });
    }

    var recalcBtn = document.getElementById('service-reminder-recalc-btn');
    if (recalcBtn && !recalcBtn.dataset.bound) {
      recalcBtn.dataset.bound = '1';
      recalcBtn.addEventListener('click', function () {
        if (window.confirm('Recalculate compliance history for all vehicles? This may take some time.')) {
          window.alert('Compliance history recalculation started.');
        }
      });
    }
  }

  function bindModals() {
    bindModal(
      'fault-rule-modal', 'fault-rules-add-btn', 'fault-rule-modal-close', 'fault-rule-modal-cancel',
      'fault-rule-form', 'fault-rule-code',
      function () {
        var code = document.getElementById('fault-rule-code').value.trim();
        var description = document.getElementById('fault-rule-description').value.trim();
        if (!code) return false;
        DATA.faultRules.push({ code: code, description: description });
        renderFaultRules();
        return true;
      }
    );

    bindModal(
      'vehicle-renewal-type-modal', 'vehicle-renewal-types-add-btn', 'vehicle-renewal-type-modal-close',
      'vehicle-renewal-type-modal-cancel', 'vehicle-renewal-type-form', 'vehicle-renewal-type-name',
      function () {
        var name = document.getElementById('vehicle-renewal-type-name').value.trim();
        if (!name) return false;
        DATA.vehicleRenewalTypes.push({ name: name, usage: 0 });
        renderRenewalTypes('vehicleRenewalTypes', 'vehicle-renewal-types-table-body', 'vehicle-renewal-types-pager-label', function (n) {
          return n + ' vehicle renewal reminder' + (n === 1 ? '' : 's');
        });
        return true;
      }
    );

    bindModal(
      'contact-renewal-type-modal', 'contact-renewal-types-add-btn', 'contact-renewal-type-modal-close',
      'contact-renewal-type-modal-cancel', 'contact-renewal-type-form', 'contact-renewal-type-name',
      function () {
        var name = document.getElementById('contact-renewal-type-name').value.trim();
        if (!name) return false;
        DATA.contactRenewalTypes.push({ name: name, usage: 0 });
        renderRenewalTypes('contactRenewalTypes', 'contact-renewal-types-table-body', 'contact-renewal-types-pager-label', function (n) {
          return n + ' contact renewal reminder' + (n === 1 ? '' : 's');
        });
        return true;
      }
    );
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

  function renderPanel(panelId) {
    if (panelId === 'issue-priorities') renderIssuePriorities();
    if (panelId === 'fault-rules') renderFaultRules();
    if (panelId === 'vehicle-renewal-types') {
      renderRenewalTypes('vehicleRenewalTypes', 'vehicle-renewal-types-table-body', 'vehicle-renewal-types-pager-label', function (n) {
        return n + ' vehicle renewal reminder' + (n === 1 ? '' : 's');
      });
    }
    if (panelId === 'contact-renewal-types') {
      renderRenewalTypes('contactRenewalTypes', 'contact-renewal-types-table-body', 'contact-renewal-types-pager-label', function (n) {
        return n + ' contact renewal reminder' + (n === 1 ? '' : 's');
      });
    }
  }

  function init(panelId) {
    bindForms();
    bindModals();
    bindSearch('issue-priorities-search', 'issue-priorities', renderIssuePriorities);
    bindSearch('fault-rules-search', 'fault-rules', renderFaultRules);
    bindSearch('vehicle-renewal-types-search', 'vehicle-renewal-types', function () {
      renderRenewalTypes('vehicleRenewalTypes', 'vehicle-renewal-types-table-body', 'vehicle-renewal-types-pager-label', function (n) {
        return n + ' vehicle renewal reminder' + (n === 1 ? '' : 's');
      });
    });
    bindSearch('contact-renewal-types-search', 'contact-renewal-types', function () {
      renderRenewalTypes('contactRenewalTypes', 'contact-renewal-types-table-body', 'contact-renewal-types-pager-label', function (n) {
        return n + ' contact renewal reminder' + (n === 1 ? '' : 's');
      });
    });

    if (panelId) {
      renderPanel(panelId);
      var panel = document.getElementById('settings-panel-' + panelId);
      if (panel) initLucide(panel);
    }
  }

  window.YSOAM_SETTINGS_OPS = { init: init, panels: OPS_PANELS };
})();
