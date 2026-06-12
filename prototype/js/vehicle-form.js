(function () {
  var data = window.YSOAM_VEHICLES;
  var icons = window.YSOAM_ICONS;

  var SECTION_META = {
    details: {
      title: 'Details',
      desc: 'VIN decode, identification, status, and fleet grouping'
    },
    maintenance: {
      title: 'Maintenance',
      desc: 'Assign a service schedule template for this vehicle'
    },
    lifecycle: {
      title: 'Lifecycle',
      desc: 'In-service dates, life estimates, and retirement planning'
    },
    financial: {
      title: 'Financial',
      desc: 'Purchase history, price, and financing type'
    },
    specifications: {
      title: 'Specifications',
      desc: 'Dimensions, weight, and payload capacity'
    },
    settings: {
      title: 'Settings',
      desc: 'Primary meter, usage defaults, and display units'
    }
  };

  function injectFormIcons() {
    if (!icons) return;
    document.querySelectorAll('[data-form-icon]').forEach(function (el) {
      var key = el.getAttribute('data-form-icon');
      if (icons[key]) el.innerHTML = icons[key];
    });
  }

  function getQueryId() {
    return new URLSearchParams(window.location.search).get('id');
  }

  function setActiveSection(sectionId) {
    if (!SECTION_META[sectionId]) return;

    document.querySelectorAll('.vehicle-form-nav__item').forEach(function (btn) {
      var active = btn.getAttribute('data-section') === sectionId;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-current', active ? 'true' : 'false');
    });

    document.querySelectorAll('.vehicle-form-section').forEach(function (sec) {
      sec.classList.toggle('is-active', sec.getAttribute('data-form-section') === sectionId);
    });

    var titleEl = document.getElementById('vehicle-section-title');
    var descEl = document.getElementById('vehicle-section-desc');
    if (titleEl) titleEl.textContent = SECTION_META[sectionId].title;
    if (descEl) descEl.textContent = SECTION_META[sectionId].desc;
  }

  function setFieldValue(form, name, value) {
    var el = form.elements[name];
    if (!el) return;

    if (el instanceof RadioNodeList || (el.length && el[0] && el[0].type === 'radio')) {
      form.querySelectorAll('input[name="' + name + '"]').forEach(function (radio) {
        radio.checked = radio.value === String(value);
      });
      return;
    }

    if (el.type === 'checkbox') {
      el.checked = !!value;
      return;
    }

    el.value = value != null ? value : '';
  }

  function fillForm(record) {
    var form = document.getElementById('vehicle-form');
    if (!form || !record) return;
    Object.keys(record).forEach(function (key) {
      setFieldValue(form, key, record[key]);
    });
  }

  function bindSectionNav() {
    var nav = document.getElementById('vehicle-form-nav');
    if (!nav) return;

    nav.addEventListener('click', function (e) {
      var btn = e.target.closest('.vehicle-form-nav__item');
      if (!btn) return;
      e.preventDefault();
      setActiveSection(btn.getAttribute('data-section'));
    });
  }

  function bindSave() {
    var form = document.getElementById('vehicle-form');
    if (!form) return;

    function handleSave(e, addAnother) {
      if (e) e.preventDefault();
      window.location.href = addAnother ? 'vehicle-form' : 'vehicles';
    }

    form.addEventListener('submit', function (e) {
      handleSave(e, false);
    });

    ['save-add-another', 'save-add-another-footer'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', function (e) { handleSave(e, true); });
    });
  }

  function init() {
    if (!document.getElementById('vehicle-form')) return;

    var editId = getQueryId();
    var isEdit = !!editId;
    var titleEl = document.getElementById('vehicle-form-title');
    var saveBtn = document.getElementById('save-vehicle-btn');
    var saveFooterBtn = document.getElementById('save-vehicle-footer-btn');

    if (isEdit && data && data.getFormRecord) {
      document.title = 'Edit Vehicle — YSOAM Prototype';
      if (titleEl) titleEl.textContent = 'Edit Vehicle';
      if (saveBtn) saveBtn.textContent = 'Update Vehicle';
      if (saveFooterBtn) saveFooterBtn.textContent = 'Update Vehicle';
      fillForm(data.getFormRecord(editId));
    }

    injectFormIcons();
    bindSectionNav();
    bindSave();
    setActiveSection('details');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
