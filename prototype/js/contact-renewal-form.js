(function () {
  'use strict';

  var drivers = window.YSOAM_DRIVERS;
  var users = window.YSOAM_USER_MANAGEMENT;
  var icons = window.YSOAM_ICONS;
  var contactId = null;
  var fromUserManagement = false;

  function getQueryId() {
    return new URLSearchParams(window.location.search).get('id') || '';
  }

  function isFromUserManagement() {
    return new URLSearchParams(window.location.search).get('from') === 'user-management';
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
    if (fromUserManagement && contactId) {
      return 'user-view?id=' + encodeURIComponent(contactId) + '#renewals';
    }
    return contactId ? 'contact-detail?id=' + encodeURIComponent(contactId) + '#renewals' : 'drivers';
  }

  function backLabel() {
    return fromUserManagement ? 'Contact Renewal Reminders' : 'Contact Renewal Reminders';
  }

  function getContactRecord() {
    if (fromUserManagement && users && users.getDetail) {
      return users.getDetail(contactId);
    }
    if (drivers && drivers.getById) {
      return drivers.getById(contactId);
    }
    return null;
  }

  function bindNavigation() {
    var back = document.getElementById('renewal-form-back');
    if (back) {
      back.href = detailRenewalsUrl();
      var label = back.querySelector('.renewal-form-back-label');
      if (label) label.textContent = backLabel();
    }
    ['renewal-form-cancel-top', 'renewal-form-cancel-footer'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.href = detailRenewalsUrl();
    });
  }

  function fillContact(d) {
    var trigger = document.getElementById('renewal-contact-trigger');
    var hidden = document.getElementById('renewal-contact-id');
    var avatar = document.getElementById('renewal-comment-avatar');
    var watcherTag = document.getElementById('renewal-watcher-tag');
    if (trigger) {
      trigger.innerHTML =
        '<span class="assign-picker__avatar">' + initials(d.name) + '</span>' +
        '<span class="assign-picker__selected"><strong>' + d.name + '</strong></span>';
    }
    if (hidden) hidden.value = d.id;
    if (avatar) avatar.textContent = initials(d.name);
    if (watcherTag) {
      var nameNode = watcherTag.querySelector('.renewal-watcher-tag__name');
      if (nameNode) nameNode.textContent = d.name;
    }
    document.title = 'New Contact Renewal Reminder — ' + d.name + ' — YSOAM';
  }

  function bindSave() {
    var form = document.getElementById('renewal-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      window.location.href = detailRenewalsUrl();
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
    fromUserManagement = isFromUserManagement();

    if (!contactId) {
      window.location.href = fromUserManagement ? 'user-management' : 'drivers';
      return;
    }

    var d = getContactRecord();
    if (!d) {
      window.location.href = fromUserManagement ? 'user-management' : 'drivers';
      return;
    }

    if (fromUserManagement) {
      document.body.setAttribute('data-page', 'settings');
    }

    fillContact(d);
    bindNavigation();

    var dueDate = document.getElementById('renewal-due-date');
    if (dueDate) dueDate.value = todayIso();

    bindSave();
    var anotherBtn = document.getElementById('renewal-save-another');
    if (anotherBtn) {
      anotherBtn.addEventListener('click', function () {
        var form = document.getElementById('renewal-form');
        if (!form || !form.checkValidity()) {
          if (form) form.reportValidity();
          return;
        }
        var url = 'contact-renewal-form?id=' + encodeURIComponent(contactId);
        if (fromUserManagement) url += '&from=user-management';
        window.location.href = url;
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
