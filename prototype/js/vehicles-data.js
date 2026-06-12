window.YSOAM_VEHICLES = {
  defaultImage: 'assets/vehicles/truck-1.jpg',

  thumbForIndex: function (index) {
    return 'assets/vehicles/truck-' + ((index % 10) + 1) + '.jpg';
  },

  formDefaults: {
    ownership: 'Owned',
    labels: '',
    maintenanceSchedule: 'none',
    inServiceDate: '2022-06-01',
    inServiceOdometer: '',
    serviceLifeMonths: '',
    serviceLifeMeter: '',
    resaleValue: '',
    outServiceDate: '',
    outServiceOdometer: '',
    purchaseVendor: '',
    purchaseDate: '',
    purchasePrice: '',
    purchaseOdometer: '',
    purchaseNotes: '',
    financeType: 'none',
    primaryMeter: 'kilometers',
    currentReading: '',
    avgUsagePerDay: '',
    autoCalcUsage: true,
    fuelUnit: 'liters',
    measurementUnits: 'metric'
  },

  getById: function (id) {
    return this.list.find(function (v) { return v.id === id; }) || null;
  },

  getFormRecord: function (id) {
    var v = this.getById(id);
    var defaults = this.formDefaults;
    if (!v) {
      return Object.assign({}, defaults, { vehicleName: '', vin: '', type: 'Truck', status: 'active', group: '' });
    }
    var meterNum = (v.meter || '').replace(/[^\d]/g, '');
    return Object.assign({}, defaults, {
      vehicleName: v.name,
      vin: v.vin,
      type: v.type,
      status: v.status,
      group: v.group,
      year: v.year,
      make: v.make,
      model: v.model,
      plate: v.plate,
      labels: v.group,
      currentReading: meterNum,
      inServiceOdometer: meterNum ? String(Math.max(0, parseInt(meterNum, 10) - 15000)) : '',
      purchaseVendor: v.make + ' Dealer',
      purchaseDate: String(v.year) + '-01-15',
      purchasePrice: String(1200000 + v.year * 10000),
      inServiceDate: String(v.year) + '-03-01'
    });
  },

  list: [
    { id: 'MH-12-AB-1234', name: 'MH-12-AB-1234', year: 2022, make: 'Tata', model: 'LPT 1613', vin: 'MAT81234567890123', status: 'transit', type: 'Truck', group: 'Expressway', meter: '48,220 km', plate: 'MH-12-AB-1234', assignment: 'assigned', watchers: 2, operator: 'Rajesh K.', image: 'assets/vehicles/truck-1.jpg' },
    { id: 'MH-14-CD-5678', name: 'MH-14-CD-5678', year: 2021, make: 'Ashok Leyland', model: 'Boss 1616', vin: 'MAL56789012345678', status: 'idle', type: 'Truck', group: 'Pune Depot', meter: '62,105 km', plate: 'MH-14-CD-5678', assignment: 'assigned', watchers: 1, operator: 'Amit V.', image: 'assets/vehicles/truck-2.jpg' },
    { id: 'MH-01-EF-7890', name: 'MH-01-EF-7890', year: 2023, make: 'Mahindra', model: 'Blazo X 28', vin: 'MAH78901234567890', status: 'active', type: 'Truck', group: 'Mumbai Port', meter: '21,880 km', plate: 'MH-01-EF-7890', assignment: 'assigned', watchers: 3, operator: 'Vikram S.', image: 'assets/vehicles/truck-3.jpg' },
    { id: 'MH-04-HI-3456', name: 'MH-04-HI-3456', year: 2019, make: 'Eicher', model: 'Pro 3015', vin: 'EIC34567890123456', status: 'offline', type: 'Truck', group: 'Nashik Route', meter: '91,440 km', plate: 'MH-04-HI-3456', assignment: 'unassigned', watchers: 0, operator: '—', image: 'assets/vehicles/truck-4.jpg' },
    { id: 'MH-09-FG-9012', name: 'MH-09-FG-9012', year: 2020, make: 'Tata', model: 'Ultra T.7', vin: 'MAT90123456789012', status: 'maintenance', type: 'Truck', group: 'Thane Workshop', meter: '55,300 km', plate: 'MH-09-FG-9012', assignment: 'assigned', watchers: 1, operator: '—', image: 'assets/vehicles/truck-5.jpg' },
    { id: 'MH-12-JK-2345', name: 'MH-12-JK-2345', year: 2022, make: 'Volvo', model: 'FM 420', vin: 'VOL23456789012345', status: 'transit', type: 'Truck', group: 'Expressway', meter: '39,760 km', plate: 'MH-12-JK-2345', assignment: 'assigned', watchers: 2, operator: 'Suresh P.', image: 'assets/vehicles/truck-6.jpg' },
    { id: 'MH-22-LM-6789', name: 'MH-22-LM-6789', year: 2023, make: 'Scania', model: 'G410', vin: 'SCA67890123456789', status: 'active', type: 'Truck', group: 'Expressway', meter: '18,920 km', plate: 'MH-22-LM-6789', assignment: 'assigned', watchers: 2, operator: 'Deepak M.', image: 'assets/vehicles/truck-7.jpg' },
    { id: 'MH-43-NO-0123', name: 'MH-43-NO-0123', year: 2018, make: 'Ashok Leyland', model: 'U-Truck 2820', vin: 'MAL01234567890123', status: 'idle', type: 'Truck', group: 'Kalyan Yard', meter: '104,550 km', plate: 'MH-43-NO-0123', assignment: 'unassigned', watchers: 0, operator: '—', image: 'assets/vehicles/truck-8.jpg' },
    { id: 'MH-15-PQ-4567', name: 'MH-15-PQ-4567', year: 2021, make: 'Tata', model: 'Signa 4225', vin: 'MAT45678901234567', status: 'active', type: 'Truck', group: 'Expressway', meter: '57,110 km', plate: 'MH-15-PQ-4567', assignment: 'assigned', watchers: 1, operator: '—', image: 'assets/vehicles/truck-9.jpg' },
    { id: 'MH-07-RS-8901', name: 'MH-07-RS-8901', year: 2020, make: 'Eicher', model: 'Pro 2049', vin: 'EIC89012345678901', status: 'idle', type: 'Truck', group: 'Mumbai Port', meter: '73,680 km', plate: 'MH-07-RS-8901', assignment: 'archived', watchers: 0, operator: '—', image: 'assets/vehicles/truck-10.jpg' }
  ]
};
