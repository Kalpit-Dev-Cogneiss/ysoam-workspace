(function () {
  'use strict';

  function initLucide(root) {
    if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) {
      window.YSOAM_LUCIDE.init(root || document);
    }
  }

  function showBillingPlans() {
    if (!window.YSOAM_SETTINGS || !window.YSOAM_SETTINGS.showPanel) return;
    window.YSOAM_SETTINGS.showPanel('billing-plans');
    var url = new URL(window.location.href);
    url.searchParams.set('section', 'billing-plans');
    window.history.replaceState({}, '', url.pathname + url.search);
  }

  function bindBrowsePlans() {
    var btn = document.getElementById('billing-browse-plans-btn');
    if (!btn || btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', showBillingPlans);
  }

  function bindPlansBack() {
    var back = document.getElementById('billing-plans-back');
    if (!back || back.dataset.bound === '1') return;
    back.dataset.bound = '1';
    back.addEventListener('click', function (e) {
      e.preventDefault();
      if (window.YSOAM_SETTINGS && window.YSOAM_SETTINGS.showPanel) {
        window.YSOAM_SETTINGS.showPanel('billing-subscriptions');
      }
      var url = new URL(window.location.href);
      url.searchParams.set('section', 'billing-subscriptions');
      window.history.replaceState({}, '', url.pathname + url.search);
    });
  }

  function init() {
    bindBrowsePlans();
    bindPlansBack();
    var billingPanel = document.getElementById('settings-panel-billing-subscriptions');
    var plansPanel = document.getElementById('settings-panel-billing-plans');
    if (billingPanel) initLucide(billingPanel);
    if (plansPanel) initLucide(plansPanel);
  }

  window.YSOAM_SETTINGS_BILLING = { init: init, showPlans: showBillingPlans };
})();
