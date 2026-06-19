window.YSOAM_SERVICE_TASKS = (function () {
  var sh = window.YSOAM_SERVICE_HISTORY;

  var TASK_TYPES = [
    { id: 'standard', label: 'Standard Tasks' },
    { id: 'custom', label: 'Custom Tasks' }
  ];

  var CATEGORIES = [
    { code: '0', label: 'Cab, Climate Control, Instrumentation, & Aerodynamic Devices' },
    { code: '1', label: 'Chassis' },
    { code: '2', label: 'Drive Train' },
    { code: '3', label: 'Electrical' },
    { code: '4', label: 'Engine / Motor Systems' },
    { code: '5', label: 'Accessories' },
    { code: '6', label: 'Equipment Dependent Attachments' },
    { code: '7', label: 'Bodies & Vessels' }
  ];

  var SYSTEMS = {
    '0': [
      { code: '001', label: 'Air Conditioning, Heating & Ventilating System' },
      { code: '002', label: 'Cab & Sheet Metal' },
      { code: '003', label: 'Instruments, Gauges, Warning & Shutdown Devices, & Meters' },
      { code: '004', label: 'Aerodynamic Devices' }
    ],
    '1': [
      { code: '011', label: 'Axles - Front Steering' },
      { code: '012', label: 'Axles - Non-Driven, Rear' },
      { code: '013', label: 'Brakes' },
      { code: '014', label: 'Frame Components' },
      { code: '015', label: 'Steering' },
      { code: '016', label: 'Suspension' },
      { code: '017', label: 'Tires, Tubes, Liners & Valves' },
      { code: '018', label: 'Wheels, Rims, Hubs & Bearings' }
    ],
    '2': [
      { code: '021', label: 'Clutch' },
      { code: '022', label: 'Cooling System' },
      { code: '023', label: 'Drive Shaft' },
      { code: '024', label: 'Transmission' }
    ],
    '3': [
      { code: '031', label: 'Alternator / Regulator' },
      { code: '032', label: 'Battery / Cables' },
      { code: '033', label: 'Lighting System' },
      { code: '034', label: 'Starting System' }
    ],
    '4': [
      { code: '041', label: 'Air Intake System' },
      { code: '042', label: 'Cooling System' },
      { code: '043', label: 'Exhaust System' },
      { code: '044', label: 'Fuel System' },
      { code: '045', label: 'Lubrication System' }
    ],
    '5': [
      { code: '051', label: 'Accessories' }
    ],
    '6': [
      { code: '061', label: 'Equipment Dependent Attachments' }
    ],
    '7': [
      { code: '071', label: 'Bodies & Vessels' }
    ]
  };

  var ASSEMBLIES = {
    '013': [{ code: '011', label: 'ABS, Anti-Lock System' }, { code: '012', label: 'Air Brakes' }],
    '001': [{ code: '001', label: 'A/C Accumulator' }, { code: '002', label: 'A/C Compressor' }],
    '044': [{ code: '001', label: 'Fuel Pump' }, { code: '002', label: 'Fuel Filter' }],
    '017': [{ code: '001', label: 'Tires' }, { code: '002', label: 'Valves' }],
    '045': [{ code: '001', label: 'Oil Filter' }, { code: '002', label: 'Oil Pump' }]
  };

  var REASON_CODES = [
    { code: '01', label: 'Breakdown' },
    { code: '02', label: 'Consumption, Fuel' },
    { code: '03', label: 'Consumption, Oil' },
    { code: '04', label: "Driver's Report" },
    { code: '05', label: 'Inspection, Routine' },
    { code: '06', label: 'Lubrication' },
    { code: '07', label: 'Pre-Delivery' },
    { code: '08', label: 'Preventive Maintenance' }
  ];

  var BASE_NAMES = (sh && sh.tasks) ? sh.tasks.slice() : [
    'ABS Control Module Replacement',
    'A/C Accumulator Replacement',
    'Accelerator Pedal Inspect',
    'A/C Compressor Replacement',
    'Engine Oil & Filter Replacement',
    'Tire Rotation',
    'Brake Inspection',
    'Spark Plugs Replacement',
    'Battery Inspection',
    'Wheel Alignment'
  ];

  var LIST_SIZE = 50;

  function expandNames() {
    var names = [];
    for (var i = 0; i < LIST_SIZE; i++) {
      var base = BASE_NAMES[i % BASE_NAMES.length];
      var variant = Math.floor(i / BASE_NAMES.length);
      names.push(variant === 0 ? base : base + ' - Variant ' + variant);
    }
    return names;
  }

  function pickCategory(name, idx) {
    var n = name.toLowerCase();
    if (n.indexOf('a/c') !== -1 || n.indexOf('cab') !== -1 || n.indexOf('climate') !== -1) return CATEGORIES[0];
    if (n.indexOf('brake') !== -1 || n.indexOf('tire') !== -1 || n.indexOf('wheel') !== -1 || n.indexOf('suspension') !== -1 || n.indexOf('abs') !== -1) return CATEGORIES[1];
    if (n.indexOf('transmission') !== -1 || n.indexOf('clutch') !== -1 || n.indexOf('drive') !== -1) return CATEGORIES[2];
    if (n.indexOf('battery') !== -1 || n.indexOf('electrical') !== -1 || n.indexOf('alternator') !== -1) return CATEGORIES[3];
    if (n.indexOf('engine') !== -1 || n.indexOf('oil') !== -1 || n.indexOf('fuel') !== -1 || n.indexOf('spark') !== -1) return CATEGORIES[4];
    return CATEGORIES[idx % CATEGORIES.length];
  }

  function pickSystem(catCode, name, idx) {
    var systems = SYSTEMS[catCode] || SYSTEMS['1'];
    var n = name.toLowerCase();
    if (n.indexOf('abs') !== -1 || n.indexOf('brake') !== -1) return systems.find(function (s) { return s.code === '013'; }) || systems[0];
    if (n.indexOf('a/c') !== -1 || n.indexOf('accumulator') !== -1) return systems.find(function (s) { return s.code === '001'; }) || systems[0];
    if (n.indexOf('tire') !== -1) return systems.find(function (s) { return s.code === '017'; }) || systems[0];
    if (n.indexOf('fuel') !== -1) return systems.find(function (s) { return s.code === '044'; }) || systems[0];
    return systems[idx % systems.length];
  }

  function pickAssembly(systemCode, idx) {
    var list = ASSEMBLIES[systemCode];
    if (list && list.length) return list[idx % list.length];
    return { code: '001', label: 'General' };
  }

  function buildList() {
    var names = expandNames();
    return names.map(function (name, idx) {
      var cat = pickCategory(name, idx);
      var sys = pickSystem(cat.code, name, idx);
      var asm = pickAssembly(sys.code, idx);
      var isCustom = idx >= LIST_SIZE - 2;
      var archived = false;
      return {
        id: 'ST-' + (idx + 1),
        name: name,
        alias: null,
        description: null,
        type: isCustom ? 'custom' : 'standard',
        archived: archived,
        category: cat,
        system: sys,
        assembly: asm,
        reasonCode: REASON_CODES[idx % REASON_CODES.length],
        recommended: {
          category: cat,
          system: sys,
          assembly: asm
        },
        serviceEntries: (idx * 3) % 7,
        serviceReminders: (idx * 2) % 5,
        servicePrograms: idx % 4,
        workOrders: (idx * 5) % 6,
        subtaskCount: idx % 3 === 0 ? 2 : 0,
        subtasks: []
      };
    });
  }

  function getById(id) {
    if (!id) return null;
    return list.find(function (r) { return r.id === id; }) || null;
  }

  function formatCodeLabel(item) {
    return item.code + ' ' + item.label;
  }

  function categoryOptions() {
    return CATEGORIES.map(function (c) {
      return { value: c.code, label: c.code + ' ' + c.label };
    });
  }

  function systemOptions(catCode) {
    return (SYSTEMS[catCode] || []).map(function (s) {
      return { value: s.code, label: s.code + ' ' + s.label };
    });
  }

  function assemblyOptions(systemCode) {
    var list = ASSEMBLIES[systemCode] || [{ code: '001', label: 'General' }];
    return list.map(function (a) {
      return { value: a.code, label: a.code + ' ' + a.label };
    });
  }

  function reasonOptions() {
    return REASON_CODES.map(function (r) {
      return { value: r.code, label: r.code + ' ' + r.label };
    });
  }

  var list = buildList();

  return {
    list: list,
    taskTypes: TASK_TYPES,
    categories: CATEGORIES,
    systems: SYSTEMS,
    assemblies: ASSEMBLIES,
    reasonCodes: REASON_CODES,
    getById: getById,
    formatCodeLabel: formatCodeLabel,
    categoryOptions: categoryOptions,
    systemOptions: systemOptions,
    assemblyOptions: assemblyOptions,
    reasonOptions: reasonOptions,
    selectableSubtasks: function () {
      return list.filter(function (t) { return !t.archived && t.subtaskCount === 0; }).slice(0, 40);
    }
  };
})();
