(function () {
  'use strict';

  var drivers = window.YSOAM_DRIVERS;
  var icons = window.YSOAM_ICONS;
  var contactId = null;

  function getQueryId() {
    return new URLSearchParams(window.location.search).get('id') || '';
  }

  function initials(name) {
    return String(name || '').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function todayIso() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function detailRenewalsUrl() {
    return contactId ? 'contact-detail?id=' + encodeURIComponent(contactId) + '#renewals' : 'drivers';
  }

  function bindNavigation() {
    ['renewal-form-back', 'renewal-form-cancel-top', 'renewal-form-cancel-footer'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.href = detailRenewalsUrl();
    });
  }

  function fillContact(d) {
    var trigger = document.getElementById('renewal-contact-trigger');
    var hidden = document.getElementById('renewal-contact-id');
    var avatar = document.getElementById('renewal-comment-avatar');
    if (trigger) {
      trigger.innerHTML =
        '<span class="assign-picker__avatar">' + initials(d.name) + '</span>' +
        '<span class="assign-picker__selected"><strong>' + d.name + '</strong></span>';
    }
    if (hidden) hidden.value = d.id;
    if (avatar) avatar.textContent = initials(d.name);
    document.title = 'New Contact Renewal Reminder — ' + d.name + ' — YSOAM';
  }

  function bindSave(addAnother) {
    var form = document.getElementById('renewal-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      window.location.href = addAnother ? 'contact-renewal-form?id=' + encodeURIComponent(contactId) : detailRenewalsUrl();
    });
  }

  function bindWatcherTag() {
    var tag = document.getElementById('renewal-watcher-tag');
    var removeBtn = document.getElementById('renewal-watcher-remove');
    if (removeBtn && tag) {
      removeBtn.addEventListener('click', function () {
        tag.hidden = true;
      });
    }
  }

  function init() {
    if (document.body.getAttribute('data-subpage') !== 'contact-renewal-form') return;

    contactId = getQueryId();
    if (!contactId || !drivers || !drivers.getById) {
      window.location.href = 'drivers';
      return;
    }

    var d = drivers.getById(contactId);
    if (!d) {
      window.location.href = 'drivers';
      return;
    }

    fillContact(d);
    bindNavigation();

    var dueDate = document.getElementById('renewal-due-date');
    if (dueDate) dueDate.value = todayIso();

    bindSave(false);
    var anotherBtn = document.getElementById('renewal-save-another');
    if (anotherBtn) {
      anotherBtn.addEventListener('click', function () {
        var form = document.getElementById('renewal-form');
        if (!form || !form.checkValidity()) {
          if (form) form.reportValidity();
          return;
        }
        window.location.href = 'contact-renewal-form?id=' + encodeURIComponent(contactId);
      });
    }

    bindWatcherTag();

    if (icons) {
      document.querySelectorAll('[data-form-icon]').forEach(function (el) {
        var key = el.getAttribute('data-form-icon');
        if (icons[key]) el.innerHTML = icons[key];
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
