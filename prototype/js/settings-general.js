(function () {
  'use strict';

  function init() {
    var form = document.getElementById('settings-general-form');
    if (!form || form.dataset.bound === '1') return;
    form.dataset.bound = '1';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
    });
  }

  window.YSOAM_SETTINGS_GENERAL = { init: init };
})();
