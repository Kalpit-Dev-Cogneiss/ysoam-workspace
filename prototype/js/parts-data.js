window.YSOAM_PARTS = (function () {
  'use strict';

  var CATEGORIES = [
    { id: 'belts', label: 'Belts' },
    { id: 'brakes', label: 'Brakes' },
    { id: 'electrical', label: 'Electrical' },
    { id: 'filters', label: 'Filters' },
    { id: 'fluids', label: 'Fluids' },
    { id: 'misc', label: 'Miscellaneous' }
  ];

  var MANUFACTURERS = [
    { id: 'yamaha', label: 'Yamaha' },
    { id: 'bosch', label: 'Bosch' },
    { id: 'tata', label: 'Tata' },
    { id: 'mahindra', label: 'Mahindra' },
    { id: 'castrol', label: 'Castrol' },
    { id: 'mann', label: 'MANN-FILTER' },
    { id: 'exide', label: 'Exide' },
    { id: 'mrf', label: 'MRF' }
  ];

  var VENDORS = [
    { id: 'pune-parts', label: 'Pune Depot Parts' },
    { id: 'mumbai-auto', label: 'Mumbai Auto Supply' },
    { id: 'lonavala-fleet', label: 'Lonavala Fleet Services' },
    { id: 'expressway-spares', label: 'Expressway Spares Co.' }
  ];

  var UNITS = [
    { id: 'ea', label: 'Each' },
    { id: 'box', label: 'Box' },
    { id: 'liter', label: 'Liter' },
    { id: 'kg', label: 'Kilogram' },
    { id: 'set', label: 'Set' }
  ];

  var THUMB_COLORS = ['#f97316', '#0ea5e9', '#8b5cf6', '#22c55e', '#eab308', '#ef4444'];

  var SEED = [
    { partNumber: '1', description: '', category: 'belts', manufacturer: 'yamaha', mfrPartNumber: '200', upc: '800', unitCost: 20000, unit: 'ea', aisleRowBin: '', vendor: 'pune-parts', archived: false, createdDaysAgo: 3 },
    { partNumber: 'BRK-1042', description: 'Front brake pad set for Tata Prima', category: 'brakes', manufacturer: 'tata', mfrPartNumber: 'TP-BRK-42', upc: '8901234567001', unitCost: 4850, unit: 'set', aisleRowBin: 'A-02-14', vendor: 'mumbai-auto', archived: false, createdDaysAgo: 12 },
    { partNumber: 'FLT-2201', description: 'Engine oil filter — 10W-40 compatible', category: 'filters', manufacturer: 'mann', mfrPartNumber: 'W712/95', upc: '4011558703705', unitCost: 620, unit: 'ea', aisleRowBin: 'B-01-03', vendor: 'pune-parts', archived: false, createdDaysAgo: 8 },
    { partNumber: 'ELC-330', description: '12V relay switch', category: 'electrical', manufacturer: 'bosch', mfrPartNumber: '0332209150', upc: '3165142607890', unitCost: 340, unit: 'ea', aisleRowBin: 'C-04-08', vendor: 'expressway-spares', archived: false, createdDaysAgo: 21 },
    { partNumber: 'FLD-900', description: 'Coolant concentrate 5L', category: 'fluids', manufacturer: 'castrol', mfrPartNumber: 'RAD-COOL-5L', upc: '5010224021234', unitCost: 1280, unit: 'liter', aisleRowBin: 'D-01-01', vendor: 'lonavala-fleet', archived: false, createdDaysAgo: 5 },
    { partNumber: 'BLT-778', description: 'Serpentine belt 1120mm', category: 'belts', manufacturer: 'mahindra', mfrPartNumber: 'MB-BLT-778', upc: '', unitCost: 890, unit: 'ea', aisleRowBin: 'A-03-02', vendor: 'pune-parts', archived: false, createdDaysAgo: 18 },
    { partNumber: 'MSC-001', description: 'Assorted hose clamps kit', category: 'misc', manufacturer: 'bosch', mfrPartNumber: 'HC-KIT-12', upc: '3165149990001', unitCost: 450, unit: 'box', aisleRowBin: 'E-02-11', vendor: 'mumbai-auto', archived: false, createdDaysAgo: 30 },
    { partNumber: 'BRK-2200', description: 'Rear drum brake shoes', category: 'brakes', manufacturer: 'mrf', mfrPartNumber: 'MRF-DR-220', upc: '8907654321002', unitCost: 2100, unit: 'set', aisleRowBin: 'A-02-18', vendor: 'expressway-spares', archived: false, createdDaysAgo: 14 },
    { partNumber: 'FLT-8810', description: 'Cabin air filter', category: 'filters', manufacturer: 'mann', mfrPartNumber: 'CU2545', upc: '4011558012345', unitCost: 780, unit: 'ea', aisleRowBin: 'B-01-09', vendor: 'pune-parts', archived: false, createdDaysAgo: 9 },
    { partNumber: 'ELC-512', description: 'Alternator belt tensioner', category: 'electrical', manufacturer: 'yamaha', mfrPartNumber: 'YAM-TEN-512', upc: '', unitCost: 1650, unit: 'ea', aisleRowBin: 'C-02-04', vendor: 'lonavala-fleet', archived: false, createdDaysAgo: 25 },
    { partNumber: 'FLD-120', description: 'DOT 4 brake fluid 500ml', category: 'fluids', manufacturer: 'castrol', mfrPartNumber: 'BF-DOT4-500', upc: '5010224998877', unitCost: 290, unit: 'ea', aisleRowBin: 'D-01-06', vendor: 'mumbai-auto', archived: false, createdDaysAgo: 6 },
    { partNumber: 'BLT-990', description: 'Timing belt kit', category: 'belts', manufacturer: 'tata', mfrPartNumber: 'TP-TIM-990', upc: '8901234567890', unitCost: 4200, unit: 'set', aisleRowBin: 'A-01-01', vendor: 'pune-parts', archived: false, createdDaysAgo: 40 },
    { partNumber: 'BRK-550', description: 'Brake disc rotor front', category: 'brakes', manufacturer: 'bosch', mfrPartNumber: '0986479A01', upc: '3165141234567', unitCost: 3200, unit: 'ea', aisleRowBin: 'A-02-05', vendor: 'expressway-spares', archived: false, createdDaysAgo: 16 },
    { partNumber: 'FLT-4400', description: 'Fuel filter inline', category: 'filters', manufacturer: 'mahindra', mfrPartNumber: 'MB-FF-440', upc: '', unitCost: 540, unit: 'ea', aisleRowBin: 'B-02-02', vendor: 'lonavala-fleet', archived: false, createdDaysAgo: 11 },
    { partNumber: 'ELC-880', description: 'Starter motor assembly', category: 'electrical', manufacturer: 'exide', mfrPartNumber: 'EX-ST-880', upc: '8901030598765', unitCost: 8900, unit: 'ea', aisleRowBin: 'C-01-01', vendor: 'mumbai-auto', archived: false, createdDaysAgo: 55 },
    { partNumber: 'FLD-330', description: 'Transmission fluid ATF 1L', category: 'fluids', manufacturer: 'castrol', mfrPartNumber: 'ATF-1L', upc: '5010224112233', unitCost: 520, unit: 'liter', aisleRowBin: 'D-02-03', vendor: 'pune-parts', archived: false, createdDaysAgo: 7 },
    { partNumber: 'MSC-220', description: 'Fuse assortment box', category: 'misc', manufacturer: 'bosch', mfrPartNumber: 'FUSE-BOX-32', upc: '3165148880002', unitCost: 380, unit: 'box', aisleRowBin: 'E-01-04', vendor: 'expressway-spares', archived: false, createdDaysAgo: 22 },
    { partNumber: 'BRK-OLD-88', description: 'Discontinued brake lining', category: 'brakes', manufacturer: 'mrf', mfrPartNumber: 'MRF-OLD-88', upc: '', unitCost: 950, unit: 'set', aisleRowBin: '', vendor: 'pune-parts', archived: true, createdDaysAgo: 120 },
    { partNumber: 'FLT-OLD-12', description: 'Legacy air filter model', category: 'filters', manufacturer: 'mann', mfrPartNumber: 'C25114-OLD', upc: '', unitCost: 410, unit: 'ea', aisleRowBin: '', vendor: 'lonavala-fleet', archived: true, createdDaysAgo: 200 },
    { partNumber: 'ELC-OLD-01', description: 'Obsolete voltage regulator', category: 'electrical', manufacturer: 'yamaha', mfrPartNumber: 'YAM-VR-01', upc: '', unitCost: 1200, unit: 'ea', aisleRowBin: '', vendor: 'mumbai-auto', archived: true, createdDaysAgo: 180 },
    { partNumber: 'BLT-445', description: 'Fan belt V-ribbed', category: 'belts', manufacturer: 'bosch', mfrPartNumber: '1987948495', upc: '3165144450001', unitCost: 720, unit: 'ea', aisleRowBin: 'A-03-08', vendor: 'pune-parts', archived: false, createdDaysAgo: 10 },
    { partNumber: 'FLD-775', description: 'Power steering fluid 1L', category: 'fluids', manufacturer: 'castrol', mfrPartNumber: 'PSF-1L', upc: '5010224778899', unitCost: 480, unit: 'liter', aisleRowBin: 'D-01-09', vendor: 'expressway-spares', archived: false, createdDaysAgo: 13 },
    { partNumber: 'MSC-550', description: 'Wheel nut cover set', category: 'misc', manufacturer: 'tata', mfrPartNumber: 'TP-WNC-16', upc: '', unitCost: 180, unit: 'set', aisleRowBin: 'E-03-02', vendor: 'mumbai-auto', archived: false, createdDaysAgo: 28 },
    { partNumber: 'BRK-9901', description: 'ABS wheel speed sensor', category: 'brakes', manufacturer: 'bosch', mfrPartNumber: '0265006765', upc: '3165149901001', unitCost: 2450, unit: 'ea', aisleRowBin: 'A-04-01', vendor: 'lonavala-fleet', archived: false, createdDaysAgo: 19 },
    { partNumber: 'FLT-5500', description: 'Hydraulic filter element', category: 'filters', manufacturer: 'mann', mfrPartNumber: 'HD45', upc: '4011558555000', unitCost: 1100, unit: 'ea', aisleRowBin: 'B-03-05', vendor: 'pune-parts', archived: false, createdDaysAgo: 15 }
  ];

  function labelFor(list, id) {
    var item = list.filter(function (x) { return x.id === id; })[0];
    return item ? item.label : id;
  }

  function formatMoney(amount) {
    return '₹ ' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatUnit(id) {
    var u = UNITS.filter(function (x) { return x.id === id; })[0];
    return u ? u.label : id;
  }

  function formatUnitShort(id) {
    if (id === 'ea') return 'ea';
    if (id === 'liter') return 'L';
    if (id === 'kg') return 'kg';
    if (id === 'box') return 'box';
    if (id === 'set') return 'set';
    return id;
  }

  function formatRelativeMeta(createdDaysAgo) {
    if (createdDaysAgo === 1) return 'Created 1 day ago';
    if (createdDaysAgo < 30) return 'Created ' + createdDaysAgo + ' days ago';
    var months = Math.floor(createdDaysAgo / 30);
    return 'Created ' + months + ' month' + (months === 1 ? '' : 's') + ' ago';
  }

  function thumbColor(index) {
    return THUMB_COLORS[index % THUMB_COLORS.length];
  }

  var LIST = SEED.map(function (row, index) {
    return {
      id: 'PART-' + (index + 1),
      partNumber: row.partNumber,
      description: row.description,
      category: row.category,
      categoryLabel: labelFor(CATEGORIES, row.category),
      manufacturer: row.manufacturer,
      manufacturerLabel: labelFor(MANUFACTURERS, row.manufacturer),
      mfrPartNumber: row.mfrPartNumber,
      upc: row.upc,
      unitCost: row.unitCost,
      unitCostLabel: formatMoney(row.unitCost),
      unit: row.unit,
      unitLabel: formatUnit(row.unit),
      unitShort: formatUnitShort(row.unit),
      aisleRowBin: row.aisleRowBin,
      vendor: row.vendor,
      vendorLabel: labelFor(VENDORS, row.vendor),
      archived: row.archived,
      createdDaysAgo: row.createdDaysAgo,
      createdMeta: formatRelativeMeta(row.createdDaysAgo),
      thumbColor: thumbColor(index)
    };
  });

  function getById(id) {
    return LIST.filter(function (p) { return p.id === id; })[0] || null;
  }

  function getByPartNumber(num) {
    return LIST.filter(function (p) { return p.partNumber === num; })[0] || null;
  }

  return {
    categories: CATEGORIES,
    manufacturers: MANUFACTURERS,
    vendors: VENDORS,
    units: UNITS,
    list: LIST,
    getById: getById,
    getByPartNumber: getByPartNumber,
    formatMoney: formatMoney,
    formatUnit: formatUnit,
    formatRelativeMeta: formatRelativeMeta
  };
})();
