(function () {
  'use strict';

  function initLucide(root) {
    if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) {
      window.YSOAM_LUCIDE.init(root || document);
    }
  }

  function bindForm() {
    var form = document.getElementById('settings-security-form');
    if (!form || form.dataset.bound === '1') return;
    form.dataset.bound = '1';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      window.alert('Security settings saved.');
    });
  }

  function bindReset() {
    var btn = document.getElementById('security-reset-passwords-btn');
    if (!btn || btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', function () {
      if (window.confirm('Reset all user passwords? Every user will be required to change their password at next login.')) {
        window.alert('Password reset initiated for all users.');
      }
    });
  }

  function init() {
    var panel = document.getElementById('settings-panel-security');
    if (!panel) return;
    bindForm();
    bindReset();
    initLucide(panel);
  }

  window.YSOAM_SETTINGS_SECURITY = { init: init };
})();
