(function () {
  'use strict';

  var drivers = window.YSOAM_DRIVERS;
  var icons = window.YSOAM_ICONS;
  var contactId = null;
  var isEdit = false;

  function getQueryParam(key) {
    var params = new URLSearchParams(window.location.search);
    return params.get(key) || '';
  }

  function getQueryId() {
    return getQueryParam('id');
  }

  function isFromUserManagement() {
    return getQueryParam('from') === 'user-management';
  }

  function listUrl() {
    return isFromUserManagement() ? 'user-management' : 'drivers';
  }

  function listLabel() {
    return isFromUserManagement() ? 'Contacts' : 'Drivers';
  }

  function emptyRecord() {
    if (drivers && drivers.getEmptyFormRecord) return drivers.getEmptyFormRecord();
    return {
      firstName: '', middleName: '', lastName: '', email: '', groupPath: '',
      operator: false, employee: false, technician: false, userAccess: 'none',
      phoneMobile: '', phoneHome: '', phoneWork: '', phoneOther: '',
      address: '', addressLine2: '', city: '', state: '', zip: '', country: 'India',
      jobTitle: '', dob: '', employeeNumber: '', hourlyRate: '',
      startDate: '', leaveDate: '', license: '', licenseClass: '', licenseState: '', samlId: ''
    };
  }

  function initials(first, last) {
    return String(first || '').charAt(0) + String(last || '').charAt(0);
  }

  function setVal(id, value) {
    var el = document.getElementById(id);
    if (!el) return;
    el.value = value == null ? '' : String(value);
  }

  function setChecked(id, checked) {
    var el = document.getElementById(id);
    if (el) el.checked = !!checked;
  }

  function fillForm(record) {
    setVal('contact-first-name', record.firstName);
    setVal('contact-middle-name', record.middleName);
    setVal('contact-last-name', record.lastName);
    setVal('contact-email', record.email);
    setVal('contact-group', record.groupPath || '');

    setChecked('contact-operator', record.operator);
    setChecked('contact-employee', record.employee);
    setChecked('contact-technician', record.technician);

    var access = record.userAccess === 'enabled' ? 'enabled' : 'none';
    var accessEl = document.querySelector('input[name="userAccess"][value="' + access + '"]');
    if (accessEl) accessEl.checked = true;

    setVal('contact-phone-mobile', record.phoneMobile);
    setVal('contact-phone-home', record.phoneHome);
    setVal('contact-phone-work', record.phoneWork);
    setVal('contact-phone-other', record.phoneOther);
    setVal('contact-address', record.address);
    setVal('contact-address2', record.addressLine2);
    setVal('contact-city', record.city);
    setVal('contact-state', record.state);
    setVal('contact-zip', record.zip);
    setVal('contact-country', record.country || 'India');

    setVal('contact-job-title', record.jobTitle);
    setVal('contact-dob', record.dob);
    setVal('contact-employee-number', record.employeeNumber);
    setVal('contact-hourly-rate', record.hourlyRate);
    setVal('contact-start-date', record.startDate);
    setVal('contact-leave-date', record.leaveDate);
    setVal('contact-license', record.license);
    setVal('contact-license-class', record.licenseClass);
    setVal('contact-license-state', record.licenseState);
    setVal('contact-saml-id', record.samlId);

    var loginMethod = record.loginMethod || 'email';
    var loginEl = document.querySelector('input[name="loginMethod"][value="' + loginMethod + '"]');
    if (loginEl) loginEl.checked = true;

    setChecked('contact-delay-invite', record.delayInvite);
    setVal('contact-invite-message', record.inviteMessage);
    setVal('contact-username', record.username);
    setVal('contact-password', record.password);

    var userType = record.userType || 'regular';
    var typeEl = document.querySelector('input[name="userType"][value="' + userType + '"]');
    if (typeEl) typeEl.checked = true;

    setVal('contact-role', record.role || 'fleet-manager');
    setVal('contact-rs-vehicles', record.recordSetVehicles || 'full');
    setVal('contact-rs-contacts', record.recordSetContacts || 'full');
    setVal('contact-rs-work', record.recordSetWork || 'full');
    setVal('contact-rs-inspections', record.recordSetInspections || 'full');

    updateAvatar();
    syncAccessPanels();
  }

  function isAccessEnabled() {
    var el = document.querySelector('input[name="userAccess"]:checked');
    return el && el.value === 'enabled';
  }

  function isRegularUser() {
    var el = document.querySelector('input[name="userType"]:checked');
    return el && el.value === 'regular';
  }

  function isEmailLogin() {
    var el = document.querySelector('input[name="loginMethod"]:checked');
    return el && el.value === 'email';
  }

  function syncAccessPanels() {
    var panel = document.getElementById('contact-access-panel');
    if (panel) panel.hidden = !isAccessEnabled();

    var emailPanel = document.getElementById('contact-login-email-panel');
    var credPanel = document.getElementById('contact-login-credentials-panel');
    if (emailPanel) emailPanel.hidden = !isAccessEnabled() || !isEmailLogin();
    if (credPanel) credPanel.hidden = !isAccessEnabled() || isEmailLogin();

    var regularPanel = document.getElementById('contact-permissions-regular');
    if (regularPanel) regularPanel.hidden = !isAccessEnabled() || !isRegularUser();

    syncAccessRequiredFields();
  }

  function syncAccessRequiredFields() {
    var enabled = isAccessEnabled();
    var regular = isRegularUser();
    var role = document.getElementById('contact-role');
    var username = document.getElementById('contact-username');
    var password = document.getElementById('contact-password');

    if (role) {
      if (enabled && regular) role.setAttribute('required', '');
      else role.removeAttribute('required');
    }

    if (username) {
      if (enabled && !isEmailLogin()) username.setAttribute('required', '');
      else username.removeAttribute('required');
    }

    if (password) {
      if (enabled && !isEmailLogin()) password.setAttribute('required', '');
      else password.removeAttribute('required');
    }
  }

  function bindUserAccess() {
    document.querySelectorAll('input[name="userAccess"]').forEach(function (el) {
      el.addEventListener('change', syncAccessPanels);
      el.addEventListener('click', syncAccessPanels);
    });
    document.querySelectorAll('input[name="loginMethod"]').forEach(function (el) {
      el.addEventListener('change', syncAccessPanels);
    });
    document.querySelectorAll('input[name="userType"]').forEach(function (el) {
      el.addEventListener('change', syncAccessPanels);
    });

    var copyBtn = document.getElementById('contact-copy-permissions');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        window.alert('Copy from Existing Contact is not available in this prototype.');
      });
    }

    syncAccessPanels();
  }

  function resetFormForAnother() {
    var record = emptyRecord();
    var form = document.getElementById('contact-form');
    if (form) form.reset();
    fillForm(record);
    var avatar = document.getElementById('contact-form-avatar');
    if (avatar) {
      avatar.style.backgroundImage = '';
      avatar.textContent = '—';
    }
    var fileInput = document.getElementById('contact-form-photo-input');
    if (fileInput) fileInput.value = '';
    window.scrollTo(0, 0);
  }

  function updateAvatar() {
    var avatar = document.getElementById('contact-form-avatar');
    if (!avatar) return;
    var first = document.getElementById('contact-first-name');
    var last = document.getElementById('contact-last-name');
    var text = initials(first && first.value, last && last.value).toUpperCase();
    if (!avatar.style.backgroundImage) avatar.textContent = text || '—';
  }

  function detailUrl() {
    return contactId ? 'contact-detail?id=' + encodeURIComponent(contactId) : listUrl();
  }

  function configureListContext() {
    var backLink = document.getElementById('contact-form-back');
    var backLabel = document.getElementById('contact-form-back-label');
    var url = listUrl();
    var label = listLabel();

    if (backLink && !isEdit) backLink.href = url;
    if (backLabel && !isEdit) backLabel.textContent = label;

    if (isFromUserManagement()) {
      document.body.setAttribute('data-page', 'settings');
      document.body.setAttribute('data-subpage', 'contact-form');
    }
  }

  function configureMode() {
    var titleEl = document.getElementById('contact-form-title');
    var backLink = document.getElementById('contact-form-back');
    var saveAnother = document.getElementById('contact-form-save-another');

    if (isEdit) {
      document.title = 'Edit Contact — YSOAM';
      if (titleEl) titleEl.textContent = 'Edit Contact';
      if (backLink) backLink.hidden = false;
      if (saveAnother) saveAnother.hidden = true;
    } else {
      document.title = 'New Contact — YSOAM';
      if (titleEl) titleEl.textContent = 'New Contact';
      if (backLink) backLink.hidden = true;
      if (saveAnother) saveAnother.hidden = false;
    }
  }

  function bindNavigation() {
    var cancelHref = isEdit ? detailUrl() : listUrl();
    ['contact-form-cancel-top', 'contact-form-cancel-footer'].forEach(function (id) {
      var link = document.getElementById(id);
      if (link) link.href = cancelHref;
    });
  }

  function bindSave() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      window.location.href = isEdit ? detailUrl() : listUrl();
    });

    var anotherBtn = document.getElementById('contact-form-save-another');
    if (anotherBtn) {
      anotherBtn.addEventListener('click', function () {
        var formEl = document.getElementById('contact-form');
        if (!formEl || !formEl.checkValidity()) {
          if (formEl) formEl.reportValidity();
          return;
        }
        resetFormForAnother();
      });
    }
  }

  function bindAvatarPreview() {
    ['contact-first-name', 'contact-last-name'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', updateAvatar);
    });

    var pickBtn = document.getElementById('contact-form-pick-file');
    var fileInput = document.getElementById('contact-form-photo-input');
    if (pickBtn && fileInput) {
      pickBtn.addEventListener('click', function () { fileInput.click(); });
      fileInput.addEventListener('change', function () {
        var file = fileInput.files && fileInput.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        var reader = new FileReader();
        reader.onload = function () {
          var avatar = document.getElementById('contact-form-avatar');
          if (!avatar) return;
          avatar.style.backgroundImage = 'url(' + reader.result + ')';
          avatar.style.backgroundSize = 'cover';
          avatar.style.backgroundPosition = 'center';
          avatar.textContent = '';
        };
        reader.readAsDataURL(file);
      });
    }
  }

  function initIcons() {
    if (!icons) return;
    document.querySelectorAll('[data-form-icon]').forEach(function (el) {
      var key = el.getAttribute('data-form-icon');
      if (icons[key]) el.innerHTML = icons[key];
    });
  }

  function init() {
    if (document.body.getAttribute('data-subpage') !== 'contact-form') return;

    contactId = getQueryId();
    isEdit = !!contactId;

    configureListContext();

    if (!drivers && !isEdit) {
      fillForm(emptyRecord());
      configureMode();
      bindNavigation();
      bindSave();
      bindAvatarPreview();
      bindUserAccess();
      initIcons();
      return;
    }

    if (!drivers) {
      window.location.href = listUrl();
      return;
    }

    var record = isEdit
      ? (drivers.getFormRecord ? drivers.getFormRecord(contactId) : null)
      : emptyRecord();

    if (isEdit && !record) {
      window.location.href = listUrl();
      return;
    }

    if (isEdit) {
      document.title = 'Edit Contact — ' + record.displayName + ' — YSOAM';
      var backLink = document.getElementById('contact-form-back');
      var backLabel = document.getElementById('contact-form-back-label');
      if (backLink) backLink.href = detailUrl();
      if (backLabel) backLabel.textContent = record.displayName;
    }

    configureMode();
    fillForm(record);
    bindNavigation();
    bindSave();
    bindAvatarPreview();
    bindUserAccess();
    initIcons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
