window.YSOAM_GEOFENCES = (function () {
  var ENTRY_TYPES = [
    { id: 'fuel', label: 'Fuel Entry' },
    { id: 'service', label: 'Service Entry' },
    { id: 'inspection', label: 'Inspection' }
  ];

  var POPULAR_FILTERS = [
    { id: 'city', label: 'Geofence City' },
    { id: 'country', label: 'Geofence Country' },
    { id: 'region', label: 'Geofence State/Province/Region' }
  ];

  var list = [
    {
      id: 'GEO-001',
      name: 'Gorwa Geofence',
      description: '',
      address: '15, Ashok Vatika Society, Gorwa, Vadodara, Gujarat 390016, India',
      city: 'Vadodara',
      state: 'Gujarat',
      country: 'India',
      radiusM: 1000,
      lat: 22.3222,
      lng: 73.1586,
      shape: 'circle',
      entryTypes: ['fuel', 'service', 'inspection'],
      lastEntryAt: '2026-06-12T10:30:00'
    },
    {
      id: 'GEO-002',
      name: 'Pune Depot Yard',
      description: 'Primary loading bay and overnight parking',
      address: 'Pune–Satara Road, Katraj, Pune, Maharashtra 411046, India',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      radiusM: 750,
      lat: 18.4521,
      lng: 73.8562,
      shape: 'circle',
      entryTypes: ['fuel', 'service'],
      lastEntryAt: '2026-06-20T06:15:00'
    },
    {
      id: 'GEO-003',
      name: 'Lonavala Expressway Hub',
      description: 'Toll plaza approach monitoring zone',
      address: 'Mumbai–Pune Expressway, Lonavala, Maharashtra 410401, India',
      city: 'Lonavala',
      state: 'Maharashtra',
      country: 'India',
      radiusM: 1200,
      lat: 18.7546,
      lng: 73.4062,
      shape: 'circle',
      entryTypes: ['inspection'],
      lastEntryAt: '2026-06-18T14:40:00'
    },
    {
      id: 'GEO-004',
      name: 'Mumbai Port Gate 2',
      description: '',
      address: 'Indira Dock, Mumbai Port Trust, Mumbai, Maharashtra 400001, India',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      radiusM: 300,
      lat: 18.9388,
      lng: 72.8354,
      shape: 'circle',
      entryTypes: ['fuel', 'inspection'],
      lastEntryAt: '2026-06-22T09:05:00'
    },
    {
      id: 'GEO-005',
      name: 'Kalyan Workshop',
      description: 'Service bay entry detection',
      address: 'Kalyan–Shilphata Road, Kalyan East, Maharashtra 421306, India',
      city: 'Kalyan',
      state: 'Maharashtra',
      country: 'India',
      radiusM: 400,
      lat: 19.2437,
      lng: 73.1355,
      shape: 'circle',
      entryTypes: ['service'],
      lastEntryAt: '2026-06-10T16:20:00'
    }
  ];

  var locationEntries = {
    'GEO-002': [
      { asset: 'MH-12-AB-4521', assetType: 'Vehicle', contact: 'Rahul Mehta', date: '2026-06-20T06:15:00', entryType: 'fuel' },
      { asset: 'MH-14-CD-8832', assetType: 'Vehicle', contact: 'Priya Shah', date: '2026-06-19T14:22:00', entryType: 'service' }
    ],
    'GEO-003': [
      { asset: 'MH-01-EF-1102', assetType: 'Vehicle', contact: 'Amit Desai', date: '2026-06-18T14:40:00', entryType: 'inspection' }
    ],
    'GEO-004': [
      { asset: 'MH-43-GH-2290', assetType: 'Vehicle', contact: 'Sneha Kulkarni', date: '2026-06-22T09:05:00', entryType: 'fuel' },
      { asset: 'MH-43-IJ-7711', assetType: 'Vehicle', contact: 'Vikram Rao', date: '2026-06-21T11:30:00', entryType: 'inspection' }
    ],
    'GEO-005': [
      { asset: 'MH-05-KL-3344', assetType: 'Vehicle', contact: 'Karan Patel', date: '2026-06-10T16:20:00', entryType: 'service' }
    ]
  };

  function getById(id) {
    return list.find(function (g) { return g.id === id; }) || null;
  }

  function getLocationEntries(id) {
    return (locationEntries[id] || []).slice();
  }

  function latestLocationEntries(id, limit) {
    return getLocationEntries(id)
      .sort(function (a, b) { return b.date.localeCompare(a.date); })
      .slice(0, limit || 5);
  }

  function entryTypeById(id) {
    return ENTRY_TYPES.find(function (t) { return t.id === id; }) || null;
  }

  function uniqueValues(key) {
    var seen = {};
    return list.map(function (g) { return g[key]; }).filter(function (v) {
      if (!v || seen[v]) return false;
      seen[v] = true;
      return true;
    }).sort();
  }

  return {
    list: list,
    entryTypes: ENTRY_TYPES,
    popularFilters: POPULAR_FILTERS,
    entryTypeById: entryTypeById,
    getById: getById,
    getLocationEntries: getLocationEntries,
    latestLocationEntries: latestLocationEntries,
    cities: function () { return uniqueValues('city'); },
    states: function () { return uniqueValues('state'); },
    countries: function () { return uniqueValues('country'); }
  };
})();
