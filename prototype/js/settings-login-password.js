(function () {
  'use strict';

  function showLoginTab(tabId) {
    document.querySelectorAll('.settings-login-tab').forEach(function (btn) {
      var active = btn.getAttribute('data-login-tab') === tabId;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    document.querySelectorAll('.settings-login-pane').forEach(function (pane) {
      var active = pane.getAttribute('data-login-pane') === tabId;
      pane.classList.toggle('is-active', active);
      pane.hidden = !active;
    });
  }

  function bindTabs() {
    var tabs = document.querySelector('.settings-login-tabs');
    if (!tabs || tabs.dataset.bound === '1') return;
    tabs.dataset.bound = '1';
    tabs.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-login-tab]');
      if (!btn) return;
      showLoginTab(btn.getAttribute('data-login-tab'));
    });
  }

  function bindForms() {
    var infoForm = document.getElementById('settings-login-info-form');
    var passwordForm = document.getElementById('settings-change-password-form');

    if (infoForm && !infoForm.dataset.bound) {
      infoForm.dataset.bound = '1';
      infoForm.addEventListener('submit', function (e) {
        e.preventDefault();
      });
    }

    if (passwordForm && !passwordForm.dataset.bound) {
      passwordForm.dataset.bound = '1';
      passwordForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var next = document.getElementById('settings-new-password');
        var confirm = document.getElementById('settings-confirm-password');
        if (next && confirm && next.value !== confirm.value) {
          confirm.setCustomValidity('Passwords do not match');
          confirm.reportValidity();
          return;
        }
        if (confirm) confirm.setCustomValidity('');
      });
    }
  }

  function init() {
    if (!document.getElementById('settings-panel-login-password')) return;
    bindTabs();
    bindForms();
  }

  window.YSOAM_SETTINGS_LOGIN = { init: init };
})();
