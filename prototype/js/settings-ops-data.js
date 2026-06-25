(function () {
  'use strict';

  window.YSOAM_SETTINGS_OPS_DATA = {
    issuePriorities: [
      { id: 'none', name: 'No Priority', subtitle: 'No Priority', alias: '—', issues: 4, enabled: true, isDefault: true, icon: 'none' },
      { id: 'low', name: 'Low', subtitle: 'Minor impact', alias: '—', issues: 2, enabled: true, icon: 'low' },
      { id: 'medium', name: 'Medium', subtitle: 'Does not impair function', alias: '—', issues: 5, enabled: true, icon: 'medium' },
      { id: 'high', name: 'High', subtitle: 'Major functionality impaired', alias: '—', issues: 3, enabled: true, icon: 'high' },
      { id: 'critical', name: 'Critical', subtitle: 'Out of service or safety issue', alias: '—', issues: 1, enabled: true, icon: 'critical' }
    ],

    faultRules: [],

    vehicleRenewalTypes: [
      { name: 'Emission Test', usage: 0 },
      { name: 'Inspection', usage: 0 },
      { name: 'Insurance', usage: 0 },
      { name: 'Registration', usage: 0 }
    ],

    contactRenewalTypes: [
      { name: 'Certification', usage: 0 },
      { name: 'License Renewal', usage: 0 }
    ]
  };
})();
