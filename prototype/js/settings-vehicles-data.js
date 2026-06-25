(function () {
  'use strict';

  window.YSOAM_SETTINGS_VEHICLES_DATA = {
    STATUS_COLORS: [
      { id: 'none', label: 'No color', value: '' },
      { id: 'blue', value: '#3B82F6' },
      { id: 'cyan', value: '#06B6D4' },
      { id: 'teal', value: '#14B8A6' },
      { id: 'green', value: '#22C55E' },
      { id: 'lime', value: '#84CC16' },
      { id: 'yellow', value: '#EAB308' },
      { id: 'amber', value: '#F59E0B' },
      { id: 'orange', value: '#F97316' },
      { id: 'red', value: '#EF4444' },
      { id: 'rose', value: '#F43F5E' },
      { id: 'pink', value: '#EC4899' },
      { id: 'purple', value: '#A855F7' },
      { id: 'indigo', value: '#6366F1' },
      { id: 'slate', value: '#94A3B8' },
      { id: 'gray', value: '#6B7280' },
      { id: 'black', value: '#1F2937' }
    ],

    statuses: [
      { id: 'active', name: 'Active', color: '#22C55E', usage: 12, isDefault: true, locked: true },
      { id: 'in-shop', name: 'In Shop', color: '#F59E0B', usage: 3, locked: true },
      { id: 'inactive', name: 'Inactive', color: '#3B82F6', usage: 2, locked: true },
      { id: 'out-of-service', name: 'Out of Service', color: '#EF4444', usage: 1, locked: true },
      { id: 'sold', name: 'Sold', color: '#94A3B8', usage: 1, locked: true }
    ],

    types: [
      { name: 'Wheel Loader', usage: 0, locked: false },
      { name: 'Van', usage: 2, locked: true },
      { name: 'Trailer', usage: 1, locked: true },
      { name: 'Tractor', usage: 0, locked: true },
      { name: 'Track Loader', usage: 0, locked: false },
      { name: 'SUV', usage: 3, locked: false },
      { name: 'Semi Truck', usage: 1, locked: false },
      { name: 'Refrigerated Trailer', usage: 0, locked: false },
      { name: 'Pickup Truck', usage: 2, locked: false },
      { name: 'Motorcycle', usage: 0, locked: false },
      { name: 'Golf Cart', usage: 0, locked: false },
      { name: 'Car', usage: 4, isDefault: true, locked: false },
      { name: 'Wheel Tractor Scraper', usage: 0, locked: false },
      { name: 'Bucket Truck', usage: 0, locked: false },
      { name: 'Boat', usage: 0, locked: false },
      { name: 'Backhoe Loader', usage: 0, locked: false },
      { name: 'Ambulance', usage: 0, locked: false },
      { name: 'ATV', usage: 0, locked: false },
      { name: 'Bus', usage: 1, locked: false },
      { name: 'Concrete Mixer', usage: 0, locked: false },
      { name: 'Crane', usage: 0, locked: false },
      { name: 'Dump Truck', usage: 0, locked: false },
      { name: 'Flatbed Truck', usage: 0, locked: false },
      { name: 'Forklift', usage: 0, locked: false },
      { name: 'Fuel Tanker', usage: 0, locked: false },
      { name: 'Generator', usage: 0, locked: false },
      { name: 'Limousine', usage: 0, locked: false },
      { name: 'Mini Van', usage: 0, locked: false },
      { name: 'Off-road Vehicle', usage: 0, locked: false },
      { name: 'Passenger Van', usage: 0, locked: false }
    ],

    externalIds: [],

    expenseTypes: [
      { name: 'Annual Inspection Fees', usage: 0, locked: false },
      { name: 'Depreciation', usage: 2, locked: false },
      { name: 'Down Payment', usage: 1, locked: false },
      { name: 'Fines', usage: 0, locked: true },
      { name: 'Insurance', usage: 8, locked: true },
      { name: 'Lease', usage: 1, locked: false },
      { name: 'Legal/Court Costs', usage: 0, locked: false },
      { name: 'Loan', usage: 2, locked: false },
      { name: 'Loan Payment', usage: 4, locked: false },
      { name: 'Miscellaneous', usage: 3, locked: false },
      { name: 'Moving Violations', usage: 0, locked: false },
      { name: 'Safety Technology', usage: 0, locked: true },
      { name: 'Telematics Device', usage: 2, locked: true },
      { name: 'Tolls', usage: 6, locked: true },
      { name: 'Tool', usage: 0, locked: false },
      { name: 'Vehicle Disposal Costs', usage: 0, locked: false },
      { name: 'Vehicle Registration and Taxes', usage: 5, locked: true }
    ]
  };
})();
