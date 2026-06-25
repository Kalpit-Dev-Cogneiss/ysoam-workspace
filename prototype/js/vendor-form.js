(function () {
  'use strict';

  var data = window.YSOAM_VENDORS;
  var vendorId = null;
  var isEdit = false;

  function getQueryId() {
    return new URLSearchParams(window.location.search).get('id') || '';
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

  function renderClassificationList() {
    var root = document.getElementById('vendor-class-list');
    if (!root || !data) return;
    root.innerHTML = data.classifications.map(function (c) {
      return '<label class="contact-form-class vendor-form-class">' +
        '<input type="checkbox" name="classification" value="' + c.id + '" id="vendor-class-' + c.id + '">' +
        '<span class="contact-form-class__body">' +
          '<strong>' + c.label + '</strong>' +
          '<span>' + c.description + '</span>' +
        '</span></label>';
    }).join('');
  }

  function renderCountryOptions() {
    var select = document.getElementById('vendor-country');
    if (!select || !data) return;
    select.innerHTML = data.countries.map(function (c) {
      return '<option value="' + c.replace(/"/g, '&quot;') + '">' + c + '</option>';
    }).join('');
  }

  function fillForm(record) {
    setVal('vendor-name', record.name);
    setVal('vendor-phone', record.phone);
    setVal('vendor-website', record.website);
    setVal('vendor-address1', record.addressLine1);
    setVal('vendor-address2', record.addressLine2);
    setVal('vendor-city', record.city);
    setVal('vendor-state', record.state);
    setVal('vendor-zip', record.zip);
    setVal('vendor-country', record.country || 'United States of America');
    setVal('vendor-notes', record.notes);
    setVal('vendor-contact-name', record.contactName);
    setVal('vendor-contact-phone', record.contactPhone);
    setVal('vendor-contact-email', record.contactEmail);

    data.classifications.forEach(function (c) {
      setChecked('vendor-class-' + c.id, record.classifications.indexOf(c.id) !== -1);
    });
  }

  function readForm() {
    var classifications = [];
    document.querySelectorAll('input[name="classification"]:checked').forEach(function (el) {
      classifications.push(el.value);
    });
    return {
      name: document.getElementById('vendor-name').value.trim(),
      phone: document.getElementById('vendor-phone').value.trim(),
      website: document.getElementById('vendor-website').value.trim(),
      addressLine1: document.getElementById('vendor-address1').value.trim(),
      addressLine2: document.getElementById('vendor-address2').value.trim(),
      city: document.getElementById('vendor-city').value.trim(),
      state: document.getElementById('vendor-state').value.trim(),
      zip: document.getElementById('vendor-zip').value.trim(),
      country: document.getElementById('vendor-country').value,
      notes: document.getElementById('vendor-notes').value.trim(),
      contactName: document.getElementById('vendor-contact-name').value.trim(),
      contactPhone: document.getElementById('vendor-contact-phone').value.trim(),
      contactEmail: document.getElementById('vendor-contact-email').value.trim(),
      classifications: classifications
    };
  }

  function validateForm() {
    var form = document.getElementById('vendor-form');
    if (!form) return false;
    if (!form.checkValidity()) {
      form.reportValidity();
      return false;
    }
    return true;
  }

  function saveVendor(andAnother) {
    if (!validateForm()) return;
    if (isEdit) {
      window.alert('Vendor updated (prototype demo).');
      window.location.href = 'vendors';
      return;
    }
    if (andAnother) {
      window.alert('Vendor saved (prototype demo).');
      fillForm(data.getEmptyFormRecord());
      document.getElementById('vendor-name').focus();
      return;
    }
    window.alert('Vendor saved (prototype demo).');
    window.location.href = 'vendors';
  }

  function setupEditMode(vendor) {
    isEdit = true;
    vendorId = vendor.id;
    document.title = 'Edit Vendor — YSOAM';
    document.getElementById('vendor-form-title').textContent = 'Edit Vendor';
    var anotherBtn = document.getElementById('vendor-form-save-another');
    if (anotherBtn) anotherBtn.hidden = true;
    fillForm(data.getFormRecord(vendor.id));
  }

  function setupNewMode() {
    isEdit = false;
    document.title = 'New Vendor — YSOAM';
    fillForm(data.getEmptyFormRecord());
  }

  function bindFormIcons() {
    var el = document.querySelector('[data-form-icon="arrowLeft"]');
    if (el && window.YSOAM_ICONS && window.YSOAM_ICONS.arrowLeft) {
      el.innerHTML = window.YSOAM_ICONS.arrowLeft;
    }
  }

  function init() {
    if (document.body.getAttribute('data-subpage') !== 'vendor-form') return;
    if (!data) return;

    bindFormIcons();
    renderCountryOptions();
    renderClassificationList();

    var id = getQueryId();
    if (id) {
      var vendor = data.getById(id);
      if (vendor) setupEditMode(vendor);
      else setupNewMode();
    } else {
      setupNewMode();
    }

    document.getElementById('vendor-form').addEventListener('submit', function (e) {
      e.preventDefault();
      saveVendor(false);
    });

    document.getElementById('vendor-form-save-another').addEventListener('click', function () {
      saveVendor(true);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
