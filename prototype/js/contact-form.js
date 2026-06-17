(function () {
  'use strict';

  var drivers = window.YSOAM_DRIVERS;
  var icons = window.YSOAM_ICONS;
  var contactId = null;
  var isEdit = false;

  function getQueryId() {
    var params = new URLSearchParams(window.location.search);
    return params.get('id') || '';
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

    updateAvatar();
  }

  function resetFormForAnother() {
    var record = drivers.getEmptyFormRecord ? drivers.getEmptyFormRecord() : {};
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
    return contactId ? 'contact-detail?id=' + encodeURIComponent(contactId) : 'drivers';
  }

  function configureMode() {
    var titleEl = document.getElementById('contact-form-title');
    var backLink = document.getElementById('contact-form-back');
    var crumb = document.getElementById('contact-form-crumb');
    var crumbName = document.getElementById('contact-form-crumb-name');
    var addMultiple = document.getElementById('contact-form-add-multiple');
    var saveAnother = document.getElementById('contact-form-save-another');

    if (isEdit) {
      document.title = 'Edit Contact — YSOAM';
      if (titleEl) titleEl.textContent = 'Edit Contact';
      if (backLink) backLink.hidden = true;
      if (crumb) crumb.hidden = false;
      if (addMultiple) addMultiple.hidden = true;
      if (saveAnother) saveAnother.hidden = true;
      if (crumbName && contactId) crumbName.href = detailUrl();
    } else {
      document.title = 'New Contact — YSOAM';
      if (titleEl) titleEl.textContent = 'New Contact';
      if (backLink) backLink.hidden = false;
      if (crumb) crumb.hidden = true;
      if (addMultiple) addMultiple.hidden = false;
      if (saveAnother) saveAnother.hidden = false;
    }
  }

  function bindNavigation() {
    var cancelHref = isEdit ? detailUrl() : 'drivers';
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
      window.location.href = isEdit ? detailUrl() : 'drivers';
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

    var addMultiple = document.getElementById('contact-form-add-multiple');
    if (addMultiple) {
      addMultiple.addEventListener('click', function () {
        window.alert('Bulk contact import is not available in this prototype.');
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

  function init() {
    if (document.body.getAttribute('data-subpage') !== 'contact-form') return;
    if (!drivers) {
      window.location.href = 'drivers';
      return;
    }

    contactId = getQueryId();
    isEdit = !!contactId;

    var record = isEdit
      ? (drivers.getFormRecord ? drivers.getFormRecord(contactId) : null)
      : (drivers.getEmptyFormRecord ? drivers.getEmptyFormRecord() : {});

    if (isEdit && !record) {
      window.location.href = 'drivers';
      return;
    }

    if (isEdit) {
      document.title = 'Edit Contact — ' + record.displayName + ' — YSOAM';
      var crumbName = document.getElementById('contact-form-crumb-name');
      if (crumbName) crumbName.textContent = record.displayName;
    }

    configureMode();
    fillForm(record);
    bindNavigation();
    bindSave();
    bindAvatarPreview();

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
