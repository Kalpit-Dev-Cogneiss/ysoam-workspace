(function () {
  'use strict';

  window.YSOAM_SETTINGS_SERVICE_DATA = {
    workOrderStatuses: [
      { id: 'open', name: 'Open', description: 'Active and in progress', color: '#3B82F6', type: 'incomplete', count: 0, isDefault: true, locked: true },
      { id: 'pending', name: 'Pending', description: 'Active but waiting on parts or something else preventing completion', color: '#F59E0B', type: 'incomplete', count: 0, locked: true },
      { id: 'completed', name: 'Completed', description: 'Finished — corresponding service reminders updated and issues resolved', color: '#22C55E', type: 'completed', count: 0, locked: true }
    ],

    repairCodes: [
      { code: '01', name: 'Breakdown', alias: '—', standard: true, enabled: true },
      { code: '02', name: 'Consumption - Fuel', alias: '—', standard: true, enabled: true },
      { code: '03', name: 'Consumption - Oil', alias: '—', standard: true, enabled: true },
      { code: '04', name: "Driver's Report", alias: '—', standard: true, enabled: true },
      { code: '05', name: 'Inspection', alias: '—', standard: true, enabled: true },
      { code: '06', name: 'Lubrication', alias: '—', standard: true, enabled: true },
      { code: '07', name: 'Pre-Delivery', alias: '—', standard: true, enabled: true },
      { code: '08', name: 'Preventive Maintenance', alias: '—', standard: true, enabled: true },
      { code: '09', name: 'Rework', alias: '—', standard: true, enabled: true },
      { code: '10', name: 'Road Call', alias: '—', standard: true, enabled: true },
      { code: '11', name: 'Routine', alias: '—', standard: true, enabled: true },
      { code: '12', name: 'Scheduled', alias: '—', standard: true, enabled: true }
    ],

    repairPriorityCodes: [
      { code: '1', name: 'Scheduled', description: 'Work is planned, neither other work in the maintenance facility nor fleet operations will be interrupted.', color: '#22C55E', serviceEntries: 128, workOrders: 128, enabled: true },
      { code: '2', name: 'Non-Scheduled', description: 'Maintenance facility routine is disrupted to perform work at hand. It usually indicates that a mechanic was taken off one job and put on this job.', color: '#F59E0B', serviceEntries: 12, workOrders: 12, enabled: true },
      { code: '3', name: 'Emergency', description: 'Fleet operations are disrupted due to maintenance. In many cases, a driver may be standing by while the repair is performed.', color: '#EF4444', serviceEntries: 14, workOrders: 14, enabled: true }
    ],

    vmrsCategories: [
      {
        code: '0',
        name: 'Cab, Climate Control, Instrumentation, & Aerodynamic Devices',
        systems: [
          {
            code: '001',
            name: 'Air Conditioning, Heating & Ventilating System',
            locked: true,
            hasChevron: true,
            assemblies: [
              { code: '001', name: 'Air Conditioning Assembly - Complete', locked: true, hasChevron: true },
              { code: '002', name: 'Compressor - Air Conditioning', locked: true },
              { code: '003', name: 'Condenser - Air Conditioning', locked: false, checked: true },
              { code: '004', name: 'Evaporator - Air Conditioning', locked: true },
              { code: '005', name: 'Lines & Hoses - Air Conditioning', locked: true },
              { code: '006', name: 'Receiver/Dryer - Air Conditioning', locked: true }
            ]
          },
          { code: '002', name: 'Cab & Sheet Metal', locked: true, assemblies: [] },
          { code: '003', name: 'Instruments, Gauges, Warning & Shutdown Devices', locked: true, editable: true, assemblies: [] },
          { code: '004', name: 'Aerodynamic Devices', locked: false, checked: true, hasChevron: true, assemblies: [] }
        ]
      },
      { code: '1', name: 'Chassis, Frame, & Related Components', systems: [] },
      { code: '2', name: 'Engine & Related Components', systems: [] },
      { code: '3', name: 'Drivetrain & Related Components', systems: [] },
      { code: '4', name: 'Brakes & Related Components', systems: [] },
      { code: '5', name: 'Suspension & Related Components', systems: [] },
      { code: '6', name: 'Steering & Related Components', systems: [] },
      { code: '7', name: 'Electrical & Related Components', systems: [] },
      { code: '8', name: 'Accessories & Related Components', systems: [] },
      { code: '9', name: 'Tires, Wheels, & Related Components', systems: [] }
    ],

    vmrsComponents: [
      { code: '001', name: 'Air Conditioning Assembly', locked: false, checked: true },
      { code: '002', name: 'Compressor - Air Conditioning', locked: true },
      { code: '003', name: 'Condenser - Air Conditioning', locked: true },
      { code: '004', name: 'Evaporator - Air Conditioning', locked: true },
      { code: '005', name: 'Lines & Hoses - Air Conditioning', locked: true }
    ],

    excludedVehicleTypes: ['Golf Cart', 'Boat', 'ATV']
  };
})();
