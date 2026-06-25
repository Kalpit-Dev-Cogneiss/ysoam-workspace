window.YSOAM_VENDORS = (function () {
  var CLASSIFICATIONS = [
    { id: 'charging', label: 'Charging', description: 'Charging classification allows vendor to be listed on Charging Entries' },
    { id: 'fuel', label: 'Fuel', description: 'Fuel classification allows vendor to be listed on Fuel Entries' },
    { id: 'service', label: 'Service', description: 'Service classification allows vendor to be listed on Service Entries and Work Orders' },
    { id: 'vehicle', label: 'Vehicle', description: 'Vehicle classification allows vendor to be listed on Vehicle Acquisitions' }
  ];

  var POPULAR_FILTERS = [
    { id: 'contactName', label: 'Contact Name' },
    { id: 'contactPhone', label: 'Contact Phone' },
    { id: 'labels', label: 'Vendor Labels' }
  ];

  var COUNTRIES = [
    'United States of America',
    'United States',
    'India',
    'United Kingdom',
    'Canada'
  ];

  var list = [
    { id: 'VND-001', name: 'Chevron', sample: true, phone: '850-385-2974', website: '', addressLine1: '2751 N Monroe St', addressLine2: '', city: 'Tallahassee', state: 'FL', zip: '32303', country: 'United States of America', notes: '', contactName: 'Jamie McDonald', contactPhone: '', contactEmail: '', labels: [], classifications: ['fuel'], rating: null, archived: false, lat: 30.4518, lng: -84.2728, networkStatus: 'Invite', createdAgo: '20 hours ago', fuelEntries: [] },
    { id: 'VND-002', name: 'Discount Tire', sample: true, phone: '(623) 555-0142', website: 'https://www.discounttire.com', addressLine1: '20225 N 27th Ave', addressLine2: '', city: 'Phoenix', state: 'AZ', zip: '85027', country: 'United States', notes: '', contactName: 'Jose Valdespino', contactPhone: '', contactEmail: '', labels: [], classifications: ['service'], rating: null, archived: false },
    { id: 'VND-003', name: 'Enterprise Fleet Management', sample: true, phone: '(314) 555-0188', website: 'https://www.enterprise.com', addressLine1: '600 Corporate Park Dr', addressLine2: '', city: 'St. Louis', state: 'MO', zip: '63105', country: 'United States', notes: '', contactName: 'LeAnn Peck', contactPhone: '', contactEmail: '', labels: [], classifications: ['vehicle'], rating: null, archived: false },
    { id: 'VND-004', name: 'Enterprise Rent-A-Car', sample: true, phone: '(314) 555-0190', website: 'https://www.enterprise.com', addressLine1: '600 Corporate Park Dr', addressLine2: '', city: 'St. Louis', state: 'MO', zip: '63105', country: 'United States', notes: '', contactName: 'James Wolf', contactPhone: '', contactEmail: '', labels: [], classifications: ['vehicle'], rating: null, archived: false },
    { id: 'VND-005', name: 'Firestone Complete Auto Care', sample: true, phone: '(615) 555-0211', website: 'https://www.firestonecompleteautocare.com', addressLine1: '200 4th Ave S', addressLine2: '', city: 'Nashville', state: 'TN', zip: '37201', country: 'United States', notes: '', contactName: 'Maria Santos', contactPhone: '', contactEmail: '', labels: [], classifications: ['service'], rating: null, archived: false },
    { id: 'VND-006', name: 'Ford Pro', sample: true, phone: '(313) 555-0220', website: 'https://www.fordpro.com', addressLine1: '1 American Rd', addressLine2: '', city: 'Dearborn', state: 'MI', zip: '48126', country: 'United States', notes: '', contactName: 'David Chen', contactPhone: '', contactEmail: '', labels: [], classifications: ['vehicle'], rating: null, archived: false },
    { id: 'VND-007', name: 'Fuelman', sample: true, phone: '(602) 555-0235', website: 'https://www.fuelman.com', addressLine1: '11811 N Tatum Blvd', addressLine2: '', city: 'Phoenix', state: 'AZ', zip: '85028', country: 'United States', notes: '', contactName: 'Rachel Brooks', contactPhone: '', contactEmail: '', labels: [], classifications: ['fuel'], rating: null, archived: false },
    { id: 'VND-008', name: 'Loves', sample: true, phone: '(405) 555-0244', website: 'https://www.loves.com', addressLine1: '520 N Main St', addressLine2: '', city: 'Oklahoma City', state: 'OK', zip: '73102', country: 'United States', notes: '', contactName: 'Tom Bradley', contactPhone: '', contactEmail: '', labels: [], classifications: ['fuel'], rating: null, archived: false },
    { id: 'VND-009', name: 'Mr. Tire Auto Service Centers', sample: true, phone: '(410) 555-0255', website: 'https://www.mrtire.com', addressLine1: '9101 Guilford Rd', addressLine2: '', city: 'Columbia', state: 'MD', zip: '21046', country: 'United States', notes: '', contactName: 'Angela Price', contactPhone: '', contactEmail: '', labels: [], classifications: ['service'], rating: null, archived: false },
    { id: 'VND-010', name: "O'Reilly Auto Parts", sample: true, phone: '(417) 555-0266', website: 'https://www.oreillyauto.com', addressLine1: '233 S Patterson Ave', addressLine2: '', city: 'Springfield', state: 'MO', zip: '65802', country: 'United States', notes: '', contactName: 'Chris Nguyen', contactPhone: '', contactEmail: '', labels: [], classifications: ['service'], rating: null, archived: false },
    { id: 'VND-011', name: 'Pep Boys', sample: true, phone: '(215) 555-0277', website: 'https://www.pepboys.com', addressLine1: '3111 W Allegheny Ave', addressLine2: '', city: 'Philadelphia', state: 'PA', zip: '19132', country: 'United States', notes: '', contactName: 'Kevin Ortiz', contactPhone: '', contactEmail: '', labels: [], classifications: ['service'], rating: null, archived: false },
    { id: 'VND-012', name: 'QuikTrip', sample: true, phone: '(918) 555-0288', website: 'https://www.quiktrip.com', addressLine1: '2202 E 71st St', addressLine2: '', city: 'Tulsa', state: 'OK', zip: '74136', country: 'United States', notes: '', contactName: 'Sandra Hill', contactPhone: '', contactEmail: '', labels: [], classifications: ['fuel'], rating: null, archived: false },
    { id: 'VND-013', name: 'Ryder', sample: true, phone: '(305) 555-0299', website: 'https://www.ryder.com', addressLine1: '11690 NW 105th St', addressLine2: '', city: 'Miami', state: 'FL', zip: '33178', country: 'United States', notes: '', contactName: 'Marcus Johnson', contactPhone: '', contactEmail: '', labels: [], classifications: ['vehicle'], rating: null, archived: false },
    { id: 'VND-014', name: 'Sherwin-Williams Automotive Finishes', sample: true, phone: '(216) 555-0310', website: 'https://www.sherwin-automotive.com', addressLine1: '101 W Prospect Ave', addressLine2: '', city: 'Cleveland', state: 'OH', zip: '44115', country: 'United States', notes: '', contactName: 'Patricia Moore', contactPhone: '', contactEmail: '', labels: [], classifications: ['service'], rating: null, archived: false },
    { id: 'VND-015', name: 'Sunoco', sample: true, phone: '(215) 555-0321', website: 'https://www.sunoco.com', addressLine1: '3800 Market St', addressLine2: '', city: 'Philadelphia', state: 'PA', zip: '19104', country: 'United States', notes: '', contactName: 'Brian Adams', contactPhone: '', contactEmail: '', labels: [], classifications: ['fuel'], rating: null, archived: false },
    { id: 'VND-016', name: 'ChargePoint', sample: true, phone: '(408) 555-0330', website: 'https://www.chargepoint.com', addressLine1: '240 East Hacienda Ave', addressLine2: '', city: 'Campbell', state: 'CA', zip: '95008', country: 'United States', notes: '', contactName: 'Elena Ruiz', contactPhone: '', contactEmail: '', labels: [], classifications: ['charging'], rating: null, archived: false }
  ];

  function buildDisplayAddress(v) {
    var line2Parts = [];
    if (v.city) line2Parts.push(v.city);
    if (v.state) line2Parts.push(v.state);
    var line2 = line2Parts.join(', ');
    if (v.zip) line2 = line2 ? line2 + ' ' + v.zip : v.zip;
    if (v.country) line2 = line2 ? line2 + ', ' + v.country : v.country;
    return (v.addressLine1 || '') + (line2 ? '\n' + line2 : '');
  }

  list.forEach(function (v) {
    v.address = buildDisplayAddress(v);
    v.classification = (v.classifications && v.classifications[0]) || '';
    if (v.lat == null) v.lat = 28.6139;
    if (v.lng == null) v.lng = 77.209;
    if (!v.createdAgo) v.createdAgo = '20 hours ago';
    if (!v.networkStatus) v.networkStatus = 'Invite';
    if (!v.fuelEntries) v.fuelEntries = [];
    if (!v.chargingEntries) v.chargingEntries = [];
  });

  function classificationById(id) {
    return CLASSIFICATIONS.find(function (c) { return c.id === id; }) || null;
  }

  function hasClassification(v, id) {
    return v.classifications && v.classifications.indexOf(id) !== -1;
  }

  function getById(id) {
    return list.find(function (v) { return v.id === id; }) || null;
  }

  function getEmptyFormRecord() {
    return {
      name: '',
      phone: '',
      website: '',
      labels: [],
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States of America',
      notes: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      classifications: []
    };
  }

  function getFormRecord(id) {
    var v = getById(id);
    if (!v) return getEmptyFormRecord();
    return {
      name: v.name || '',
      phone: v.phone || '',
      website: v.website || '',
      labels: (v.labels || []).slice(),
      addressLine1: v.addressLine1 || '',
      addressLine2: v.addressLine2 || '',
      city: v.city || '',
      state: v.state || '',
      zip: v.zip || '',
      country: v.country || 'United States of America',
      notes: v.notes || '',
      contactName: v.contactName || '',
      contactPhone: v.contactPhone || '',
      contactEmail: v.contactEmail || '',
      classifications: (v.classifications || []).slice()
    };
  }

  function allLabels() {
    var seen = {};
    list.forEach(function (v) {
      (v.labels || []).forEach(function (l) { seen[l] = true; });
    });
    return Object.keys(seen).sort();
  }

  function tabsForVendor(v) {
    var tabs = [{ id: 'overview', label: 'Overview' }];
    if (hasClassification(v, 'fuel')) tabs.push({ id: 'fuel-entries', label: 'Fuel Entries' });
    if (hasClassification(v, 'charging')) tabs.push({ id: 'charging-entries', label: 'Charging Entries' });
    if (hasClassification(v, 'service')) tabs.push({ id: 'service-entries', label: 'Service Entries' });
    return tabs;
  }

  function classificationLabels(v) {
    return (v.classifications || []).map(function (id) {
      var c = classificationById(id);
      return c ? c.label : id;
    });
  }

  return {
    list: list,
    classifications: CLASSIFICATIONS,
    popularFilters: POPULAR_FILTERS,
    countries: COUNTRIES,
    classificationById: classificationById,
    hasClassification: hasClassification,
    classificationLabels: classificationLabels,
    tabsForVendor: tabsForVendor,
    getById: getById,
    getEmptyFormRecord: getEmptyFormRecord,
    getFormRecord: getFormRecord,
    buildDisplayAddress: buildDisplayAddress,
    allLabels: allLabels
  };
})();
