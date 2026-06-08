window.YSOAM_FLEET = {
  corridor: {
    mumbai: [19.076, 72.8777],
    pune: [18.5204, 73.8567]
  },
  route: [
    [19.076, 72.8777],
    [18.98, 73.12],
    [18.7557, 73.4091],
    [18.62, 73.65],
    [18.5204, 73.8567]
  ],
  vehicles: [
    { id: 'MH-12-AB-1234', lat: 18.92, lng: 73.28, status: 'transit', label: 'Mumbai → Pune', driver: 'Rajesh K.' },
    { id: 'MH-14-CD-5678', lat: 18.5204, lng: 73.8567, status: 'idle', label: 'Pune depot', driver: '—' },
    { id: 'MH-01-EF-7890', lat: 19.076, lng: 72.8777, status: 'active', label: 'Mumbai port', driver: 'Amit V.' },
    { id: 'MH-04-HI-3456', lat: 19.9975, lng: 73.7898, status: 'offline', label: 'Nashik route', driver: '—' },
    { id: 'MH-09-FG-9012', lat: 19.2183, lng: 72.9781, status: 'maintenance', label: 'Workshop · Thane', driver: '—' },
    { id: 'MH-12-JK-2345', lat: 18.7557, lng: 73.4091, status: 'transit', label: 'Lonavala', driver: 'Vikram S.' },
    { id: 'MH-22-LM-6789', lat: 18.65, lng: 73.55, status: 'active', label: 'Pune → Mumbai', driver: 'Suresh P.' },
    { id: 'MH-43-NO-0123', lat: 19.2403, lng: 73.1305, status: 'idle', label: 'Kalyan yard', driver: 'Deepak M.' },
    { id: 'MH-15-PQ-4567', lat: 18.82, lng: 73.42, status: 'active', label: 'Expressway · 78 km/h', driver: '—' },
    { id: 'MH-07-RS-8901', lat: 19.05, lng: 72.95, status: 'idle', label: 'Unassigned', driver: '—' }
  ],
  statusColors: {
    active: '#16A34A',
    idle: '#F59E0B',
    offline: '#DC2626',
    transit: '#0052FF',
    maintenance: '#9333EA'
  }
};
