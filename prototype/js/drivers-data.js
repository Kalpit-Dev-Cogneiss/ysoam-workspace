window.YSOAM_DRIVERS = (function () {
  var list = [
    {
      id: 'DRV-001',
      name: 'Rajesh Kumar',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      email: 'rajesh.kumar@ysoam.in',
      phone: '+91 98765 43210',
      license: 'MH-12-2019-0012345',
      licenseExpiry: '2028-03-15',
      licenseClass: 'HMV',
      licenseState: 'Maharashtra',
      status: 'active',
      assignedVehicle: 'MH-12-AB-1234',
      group: 'Expressway',
      trips: 142,
      hoursThisMonth: 186,
      kmThisMonth: 4820,
      rating: 4.8,
      joined: '2021-04-10',
      startDate: '2021-04-10',
      dob: '1985-03-15',
      jobTitle: 'Senior Driver',
      employeeNumber: 'DRV-001',
      classifications: ['Employee', 'Driver', 'Operator'],
      employee: true,
      technician: false,
      operator: true,
      hasUserAccess: false,
      renewals: [
        { type: 'License Renewal', dueDate: '2026-06-24', relative: '8 days from now', relativeTone: 'soon', notifications: true },
        { type: 'Medical Certificate', dueDate: '2026-05-21', relative: '4 weeks ago', relativeTone: 'past', notifications: true }
      ],
      createdAgo: '12 days ago',
      updatedAgo: '3 days ago'
    },
    {
      id: 'DRV-002',
      name: 'Amit Verma',
      firstName: 'Amit',
      lastName: 'Verma',
      email: 'amit.verma@ysoam.in',
      phone: '+91 91234 56789',
      license: 'MH-01-2018-0007834',
      licenseExpiry: '2027-09-20',
      licenseClass: 'HMV',
      licenseState: 'Maharashtra',
      status: 'active',
      assignedVehicle: 'MH-01-EF-7890',
      group: 'Mumbai Port',
      trips: 98,
      hoursThisMonth: 142,
      kmThisMonth: 3150,
      rating: 4.6,
      joined: '2022-01-18',
      startDate: '2022-01-18',
      dob: '1990-08-22',
      jobTitle: 'Driver',
      employeeNumber: 'DRV-002',
      classifications: ['Employee', 'Driver'],
      employee: true,
      technician: false,
      operator: false,
      hasUserAccess: false,
      renewals: [
        { type: 'License Renewal', dueDate: '2027-09-20', relative: '1 year from now', relativeTone: 'neutral', notifications: true }
      ],
      createdAgo: '3 months ago',
      updatedAgo: '1 week ago'
    },
    {
      id: 'DRV-003',
      name: 'Vikram Sharma',
      firstName: 'Vikram',
      lastName: 'Sharma',
      email: 'vikram.sharma@ysoam.in',
      phone: '+91 99887 65432',
      license: 'MH-12-2020-0023411',
      licenseExpiry: '2026-11-05',
      licenseClass: 'HMV',
      licenseState: 'Maharashtra',
      status: 'active',
      assignedVehicle: 'MH-12-JK-2345',
      group: 'Expressway',
      trips: 210,
      hoursThisMonth: 198,
      kmThisMonth: 5640,
      rating: 4.9,
      joined: '2020-08-03',
      startDate: '2020-08-03',
      dob: '1988-01-10',
      jobTitle: 'Lead Driver',
      employeeNumber: 'DRV-003',
      classifications: ['Employee', 'Driver', 'Operator'],
      employee: true,
      technician: false,
      operator: true,
      hasUserAccess: true,
      renewals: [
        { type: 'License Renewal', dueDate: '2026-11-05', relative: '5 months from now', relativeTone: 'neutral', notifications: true }
      ],
      createdAgo: '1 year ago',
      updatedAgo: '2 days ago'
    },
    {
      id: 'DRV-004',
      name: 'Suresh Patil',
      firstName: 'Suresh',
      lastName: 'Patil',
      email: 'suresh.patil@ysoam.in',
      phone: '+91 97654 32108',
      license: 'MH-22-2017-0009876',
      licenseExpiry: '2027-06-30',
      licenseClass: 'HMV',
      licenseState: 'Maharashtra',
      status: 'active',
      assignedVehicle: 'MH-22-LM-6789',
      group: 'Pune Depot',
      trips: 176,
      hoursThisMonth: 170,
      kmThisMonth: 4390,
      rating: 4.5,
      joined: '2019-11-22',
      startDate: '2019-11-22',
      dob: '1983-07-04',
      jobTitle: 'Driver',
      employeeNumber: 'DRV-004',
      classifications: ['Employee', 'Driver'],
      employee: true,
      technician: false,
      operator: false,
      hasUserAccess: false,
      renewals: [],
      createdAgo: '6 months ago',
      updatedAgo: '5 days ago'
    },
    {
      id: 'DRV-005',
      name: 'Deepak Mehta',
      firstName: 'Deepak',
      lastName: 'Mehta',
      email: 'deepak.mehta@ysoam.in',
      phone: '+91 96543 21097',
      license: 'MH-43-2021-0031200',
      licenseExpiry: '2028-08-12',
      licenseClass: 'LMV',
      licenseState: 'Maharashtra',
      status: 'idle',
      assignedVehicle: 'MH-43-NO-0123',
      group: 'Mumbai Port',
      trips: 64,
      hoursThisMonth: 88,
      kmThisMonth: 1980,
      rating: 4.3,
      joined: '2023-03-07',
      startDate: '2023-03-07',
      dob: '1995-11-18',
      jobTitle: 'Driver',
      employeeNumber: 'DRV-005',
      classifications: ['Employee', 'Driver'],
      employee: true,
      technician: false,
      operator: false,
      hasUserAccess: false,
      renewals: [],
      createdAgo: '2 weeks ago',
      updatedAgo: '1 day ago'
    },
    {
      id: 'DRV-006',
      name: 'Priya Nair',
      firstName: 'Priya',
      lastName: 'Nair',
      email: 'priya.nair@ysoam.in',
      phone: '+91 95432 10986',
      license: 'KL-10-2019-0014567',
      licenseExpiry: '2027-02-28',
      licenseClass: 'HMV',
      licenseState: 'Kerala',
      status: 'on-leave',
      assignedVehicle: null,
      group: 'Pune Depot',
      trips: 88,
      hoursThisMonth: 0,
      kmThisMonth: 0,
      rating: 4.7,
      joined: '2021-09-15',
      startDate: '2021-09-15',
      dob: '1992-04-30',
      jobTitle: 'Driver',
      employeeNumber: 'DRV-006',
      classifications: ['Employee', 'Driver', 'Operator'],
      employee: true,
      technician: false,
      operator: true,
      hasUserAccess: false,
      renewals: [
        { type: 'License Renewal', dueDate: '2027-02-28', relative: '8 months from now', relativeTone: 'neutral', notifications: false }
      ],
      createdAgo: '4 months ago',
      updatedAgo: '2 weeks ago'
    },
    {
      id: 'DRV-007',
      name: 'Mohammed Iqbal',
      firstName: 'Mohammed',
      lastName: 'Iqbal',
      email: 'mohammed.iqbal@ysoam.in',
      phone: '+91 94321 09875',
      license: 'MH-09-2016-0006543',
      licenseExpiry: '2026-05-10',
      licenseClass: 'HMV',
      licenseState: 'Maharashtra',
      status: 'inactive',
      assignedVehicle: null,
      group: 'Expressway',
      trips: 312,
      hoursThisMonth: 0,
      kmThisMonth: 0,
      rating: 4.4,
      joined: '2018-06-01',
      startDate: '2018-06-01',
      dob: '1979-12-02',
      jobTitle: 'Former Driver',
      employeeNumber: 'DRV-007',
      classifications: ['Employee'],
      employee: true,
      technician: false,
      operator: false,
      hasUserAccess: false,
      renewals: [],
      createdAgo: '2 years ago',
      updatedAgo: '3 months ago'
    },
    {
      id: 'DRV-008',
      name: 'Sanjay Tiwari',
      firstName: 'Sanjay',
      lastName: 'Tiwari',
      email: 'sanjay.tiwari@ysoam.in',
      phone: '+91 93210 98764',
      license: 'UP-80-2022-0041009',
      licenseExpiry: '2029-01-18',
      licenseClass: 'HMV',
      licenseState: 'Uttar Pradesh',
      status: 'active',
      assignedVehicle: null,
      group: 'Pune Depot',
      trips: 29,
      hoursThisMonth: 72,
      kmThisMonth: 1840,
      rating: 4.2,
      joined: '2024-02-12',
      startDate: '2024-02-12',
      dob: '1998-06-25',
      jobTitle: 'Junior Driver',
      employeeNumber: 'DRV-008',
      classifications: ['Employee', 'Driver'],
      employee: true,
      technician: false,
      operator: false,
      hasUserAccess: false,
      renewals: [],
      createdAgo: '1 month ago',
      updatedAgo: '4 days ago'
    }
  ];

  var tabExtras = {
    'DRV-001': {
      vehicleAssignments: [
        { vehicleId: 'MH-12-AB-1234', start: '2026-06-15T12:08:00', end: '2026-06-15T18:00:00', duration: '5h 52m', startMeter: null, endMeter: null },
        { vehicleId: 'MH-12-JK-2345', start: '2026-06-10T06:00:00', end: '2026-06-10T14:30:00', duration: '8h 30m', startMeter: '124,820 km', endMeter: '124,910 km' }
      ],
      issues: [],
      serviceReminders: [
        { vehicleId: 'MH-12-AB-1234', task: 'Oil Change', assignee: 'Rajesh Kumar', assignedAt: '2026-01-10', status: 'Upcoming', nextDue: '2026-07-01', nextDueSub: '128,000 km', incompleteWo: '—', lastCompleted: '2026-01-05', lastCompletedSub: '124,500 km', compliance: 'Compliant', watchers: 0 }
      ],
      inspections: [
        { vehicleId: 'MH-12-AB-1234', submitted: '2026-06-14T07:45:00', duration: '12m', form: 'Pre-Trip Inspection', locationException: '—', failedItems: 0 }
      ],
      locationHistory: [
        { date: '2026-06-15T12:08:00', assetType: 'Vehicle', asset: 'MH-12-AB-1234', location: 'Mumbai–Pune Expressway, Km 42', source: 'Telematics' },
        { date: '2026-06-15T18:00:00', assetType: 'Vehicle', asset: 'MH-12-AB-1234', location: 'Pune Depot, Gate 2', source: 'Telematics' }
      ]
    },
    'DRV-002': {
      vehicleAssignments: [
        { vehicleId: 'MH-01-EF-7890', start: '2026-06-14T08:00:00', end: '2026-06-14T17:00:00', duration: '9h 0m', startMeter: '98,200 km', endMeter: '98,340 km' }
      ],
      issues: [
        { name: 'Brake warning light', priority: 'High', issue: 'ISS-1042', summary: 'Dashboard brake warning during port run', status: 'Open', statusDot: '#DC2626', source: 'Inspection', reportedDate: '2026-06-12T09:15:00', assigned: 'Amit Verma', labels: 'Safety', watchers: 1 }
      ],
      serviceReminders: [],
      inspections: [
        { vehicleId: 'MH-01-EF-7890', submitted: '2026-06-12T06:30:00', duration: '8m', form: 'Daily Vehicle Inspection', locationException: '—', failedItems: 1 }
      ],
      locationHistory: []
    },
    'DRV-003': {
      vehicleAssignments: [
        { vehicleId: 'MH-12-JK-2345', start: '2026-06-16T05:30:00', end: null, duration: 'Active', startMeter: '156,400 km', endMeter: null }
      ],
      issues: [],
      serviceReminders: [
        { vehicleId: 'MH-12-JK-2345', task: 'Tire Rotation', assignee: 'Vikram Sharma', assignedAt: '2026-02-01', status: 'Due soon', nextDue: '2026-06-20', nextDueSub: '157,000 km', incompleteWo: 'WO-882', lastCompleted: '2025-12-01', lastCompletedSub: '152,000 km', compliance: 'At risk', watchers: 2 }
      ],
      inspections: [],
      locationHistory: [
        { date: '2026-06-16T05:30:00', assetType: 'Vehicle', asset: 'MH-12-JK-2345', location: 'Expressway Hub, Lonavala', source: 'Mobile App' }
      ]
    }
  };

  function defaultAssignments(d) {
    if (!d.assignedVehicle) return [];
    return [{
      vehicleId: d.assignedVehicle,
      start: '2026-06-15T12:08:00',
      end: '2026-06-15T18:00:00',
      duration: '5h 52m',
      startMeter: null,
      endMeter: null
    }];
  }

  function mergeTabData(d) {
    var extra = tabExtras[d.id] || {};
    return Object.assign({}, d, {
      vehicleAssignments: extra.vehicleAssignments != null ? extra.vehicleAssignments : defaultAssignments(d),
      issues: extra.issues || [],
      serviceReminders: extra.serviceReminders || [],
      inspections: extra.inspections || [],
      locationHistory: extra.locationHistory || []
    });
  }

  function groupPath(d) {
    var region = d.licenseState === 'Kerala' ? 'Kerala' : 'Maharashtra';
    return region + ' / ' + d.group;
  }

  function getFormRecord(id) {
    var d = list.find(function (item) { return item.id === id; });
    if (!d) return null;
    return {
      id: d.id,
      displayName: d.name,
      firstName: d.firstName || '',
      middleName: d.middleName || '',
      lastName: d.lastName || '',
      email: d.email || '',
      groupPath: groupPath(d),
      operator: !!d.operator,
      employee: d.employee !== false,
      technician: !!d.technician,
      userAccess: d.hasUserAccess ? 'enabled' : 'none',
      phoneMobile: d.phone || '',
      phoneHome: d.phoneHome || '',
      phoneWork: d.phoneWork || '',
      phoneOther: d.phoneOther || '',
      address: d.address || '',
      addressLine2: d.addressLine2 || '',
      city: d.city || '',
      state: d.state || d.licenseState || '',
      zip: d.zip || '',
      country: d.country || 'India',
      jobTitle: d.jobTitle || '',
      dob: d.dob || '',
      employeeNumber: d.employeeNumber || '',
      hourlyRate: d.hourlyRate || '',
      startDate: d.startDate || '',
      leaveDate: d.leaveDate || '',
      license: d.license || '',
      licenseClass: d.licenseClass || '',
      licenseState: d.licenseState || '',
      samlId: d.samlId || ''
    };
  }

  function getEmptyFormRecord() {
    return {
      id: null,
      displayName: '',
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      groupPath: '',
      operator: true,
      employee: true,
      technician: false,
      userAccess: 'none',
      phoneMobile: '',
      phoneHome: '',
      phoneWork: '',
      phoneOther: '',
      address: '',
      addressLine2: '',
      city: '',
      state: '',
      zip: '',
      country: 'India',
      jobTitle: '',
      dob: '',
      employeeNumber: '',
      hourlyRate: '',
      startDate: '',
      leaveDate: '',
      license: '',
      licenseClass: '',
      licenseState: '',
      samlId: ''
    };
  }

  return {
    list: list,
    getById: function (id) {
      var d = list.find(function (item) { return item.id === id; });
      return d ? mergeTabData(d) : null;
    },
    getFormRecord: getFormRecord,
    getEmptyFormRecord: getEmptyFormRecord
  };
})();
