(function () {
  'use strict';

  var EXPORT_TYPES = [
    'Vehicles',
    'Vehicle Assignments',
    'Meter Entries',
    'Issues',
    'Service Entries',
    'Work Orders',
    'Work Order Line Items',
    'Work Order Sub Line Items',
    'Contacts',
    'Vendors',
    'Parts',
    'Fuel Entries'
  ];

  function initLucide(root) {
    if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) {
      window.YSOAM_LUCIDE.init(root || document);
    }
  }

  function renderChecklist() {
    var list = document.getElementById('settings-export-checklist');
    if (!list || list.dataset.rendered === '1') return;
    list.dataset.rendered = '1';
    list.innerHTML = EXPORT_TYPES.map(function (label, i) {
      var id = 'export-type-' + i;
      return (
        '<li>' +
          '<label class="settings-export-check">' +
            '<input type="checkbox" name="exportTypes" value="' + label + '" checked id="' + id + '">' +
            '<span class="settings-export-check__box" aria-hidden="true"></span>' +
            '<span>' + label + '</span>' +
          '</label>' +
        '</li>'
      );
    }).join('');
  }

  function bindForm() {
    var form = document.getElementById('settings-export-form');
    if (!form || form.dataset.bound === '1') return;
    form.dataset.bound = '1';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var checked = form.querySelectorAll('input[name="exportTypes"]:checked');
      if (!checked.length) return;
      var format = form.querySelector('input[name="exportFormat"]:checked');
      var formatLabel = format && format.value === 'xls' ? 'Excel (XLS)' : 'CSV';
      window.alert('Export requested (' + formatLabel + '). You will receive an email at rajesh.kumar@ysoam.demo when your file is ready.');
    });
  }

  function init() {
    var panel = document.getElementById('settings-panel-export-data');
    if (!panel) return;
    renderChecklist();
    bindForm();
    initLucide(panel);
  }

  window.YSOAM_SETTINGS_EXPORT = { init: init };
})();
