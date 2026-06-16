window.YSOAM_ASSIGNMENTS = {
  operators: [
    { id: 'op-1', name: 'Rajesh K.', email: 'rajesh.k@ysoam.demo', initials: 'RK', role: 'Operator' },
    { id: 'op-2', name: 'Amit V.', email: 'amit.v@ysoam.demo', initials: 'AV', role: 'Operator' },
    { id: 'op-3', name: 'Vikram S.', email: 'vikram.s@ysoam.demo', initials: 'VS', role: 'Operator' },
    { id: 'op-4', name: 'Suresh P.', email: 'suresh.p@ysoam.demo', initials: 'SP', role: 'Operator' },
    { id: 'op-5', name: 'Deepak M.', email: 'deepak.m@ysoam.demo', initials: 'DM', role: 'Operator' },
    { id: 'op-6', name: 'Priya N.', email: 'priya.n@ysoam.demo', initials: 'PN', role: 'Operator' }
  ],

  list: [
    {
      id: 'ASN-10984171',
      vehicleId: 'MH-14-CD-5678',
      operatorId: 'op-1',
      start: '2026-06-15T12:08:00',
      end: '2026-06-15T18:00:00',
      comment: 'Expressway run — Pune return leg.'
    },
    {
      id: 'ASN-10984180',
      vehicleId: 'MH-12-AB-1234',
      operatorId: 'op-2',
      start: '2026-06-15T08:00:00',
      end: '2026-06-15T14:30:00',
      comment: ''
    },
    {
      id: 'ASN-10984190',
      vehicleId: 'MH-22-LM-6789',
      operatorId: 'op-4',
      start: '2026-06-15T06:30:00',
      end: '2026-06-15T12:00:00',
      comment: 'Morning depot shuttle.'
    },
    {
      id: 'ASN-10984200',
      vehicleId: 'MH-01-EF-7890',
      operatorId: 'op-3',
      start: '2026-06-15T09:00:00',
      end: '2026-06-15T17:00:00',
      comment: ''
    },
    {
      id: 'ASN-10984210',
      vehicleId: 'MH-12-JK-2345',
      operatorId: 'op-5',
      start: '2026-06-13T08:00:00',
      end: '2026-06-17T18:00:00',
      comment: 'Multi-day Mumbai–Pune corridor assignment.'
    },
    {
      id: 'ASN-10984220',
      vehicleId: 'MH-15-PQ-4567',
      operatorId: 'op-6',
      start: '2026-06-10T07:00:00',
      end: '2026-06-12T19:00:00',
      comment: ''
    },
    {
      id: 'ASN-10984230',
      vehicleId: 'MH-09-FG-9012',
      operatorId: 'op-2',
      start: '2026-06-20T10:00:00',
      end: '2026-06-20T16:00:00',
      comment: 'Post-maintenance test drive.'
    },
    {
      id: 'ASN-10984240',
      vehicleId: 'MH-04-HI-3456',
      operatorId: 'op-3',
      start: '2026-06-15T13:00:00',
      end: '2026-06-15T19:30:00',
      comment: 'Nashik route afternoon shift.'
    },
    {
      id: 'ASN-10984250',
      vehicleId: 'MH-43-NO-0123',
      operatorId: 'op-6',
      start: '2026-06-15T05:30:00',
      end: '2026-06-15T11:00:00',
      comment: 'Kalyan yard pickup run.'
    },
    {
      id: 'ASN-10984260',
      vehicleId: 'MH-15-PQ-4567',
      operatorId: 'op-1',
      start: '2026-06-15T10:30:00',
      end: '2026-06-15T16:00:00',
      comment: 'Expressway corridor — southbound.'
    },
    {
      id: 'ASN-10984270',
      vehicleId: 'MH-09-FG-9012',
      operatorId: 'op-5',
      start: '2026-06-15T07:00:00',
      end: '2026-06-15T10:00:00',
      comment: 'Workshop release — short validation run.'
    }
  ],

  getOperator: function (id) {
    return this.operators.find(function (o) { return o.id === id; }) || null;
  },

  getById: function (id) {
    return this.list.find(function (a) { return a.id === id; }) || null;
  },

  nextId: function () {
    var n = 10984300 + this.list.length;
    return 'ASN-' + n;
  }
};
