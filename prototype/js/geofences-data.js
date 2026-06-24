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
      radiusM: 500,
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
      entryTypes: ['service'],
      lastEntryAt: '2026-06-10T16:20:00'
    }
  ];

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
    cities: function () { return uniqueValues('city'); },
    states: function () { return uniqueValues('state'); },
    countries: function () { return uniqueValues('country'); }
  };
})();
