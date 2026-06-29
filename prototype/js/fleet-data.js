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
    { id: 'MH-12-AB-1234', shortId: 'MH-12-AB', lat: 18.92, lng: 73.28, status: 'transit', label: 'Mumbai → Pune', driver: 'Rajesh K.', speed: 62, altitude: 142, battery: 87, fuelPct: 62, fuelStatus: 'ok', chargingStatus: null, heading: 42, headingLabel: 'NE', ignition: true, updatedAt: '08 Jun 2026, 14:32:08', signal: 'Strong' },
    { id: 'MH-14-CD-5678', shortId: 'MH-14-CD', lat: 18.5204, lng: 73.8567, status: 'idle', label: 'Pune depot', driver: '—', speed: 0, altitude: 560, battery: 94, fuelPct: 45, fuelStatus: 'ok', chargingStatus: null, heading: 0, headingLabel: '—', ignition: false, updatedAt: '08 Jun 2026, 14:31:55', signal: 'Strong' },
    { id: 'MH-01-EF-7890', shortId: 'MH-01-EF', lat: 19.076, lng: 72.8777, status: 'active', label: 'Mumbai port', driver: 'Amit V.', speed: 24, altitude: 8, battery: 76, fuelPct: 28, fuelStatus: 'low', chargingStatus: 'charging', heading: 180, headingLabel: 'S', ignition: true, updatedAt: '08 Jun 2026, 14:32:01', signal: 'Good' },
    { id: 'MH-04-HI-3456', shortId: 'MH-04-HI', lat: 19.9975, lng: 73.7898, status: 'offline', label: 'Nashik route', driver: '—', speed: 0, altitude: 584, battery: 41, fuelPct: 8, fuelStatus: 'critical', chargingStatus: null, heading: 0, headingLabel: '—', ignition: false, updatedAt: '08 Jun 2026, 12:18:44', signal: 'No Signal' },
    { id: 'MH-09-FG-9012', shortId: 'MH-09-FG', lat: 19.2183, lng: 72.9781, status: 'maintenance', label: 'Workshop · Thane', driver: '—', speed: 0, altitude: 15, battery: 100, fuelPct: 72, fuelStatus: 'ok', chargingStatus: null, heading: 0, headingLabel: '—', ignition: false, updatedAt: '08 Jun 2026, 14:30:12', signal: 'Good' },
    { id: 'MH-12-JK-2345', shortId: 'MH-12-JK', lat: 18.7557, lng: 73.4091, status: 'transit', label: 'Lonavala', driver: 'Vikram S.', speed: 58, altitude: 624, battery: 82, fuelPct: 55, fuelStatus: 'ok', chargingStatus: 'idle', heading: 215, headingLabel: 'SW', ignition: true, updatedAt: '08 Jun 2026, 14:32:05', signal: 'Strong' },
    { id: 'MH-22-LM-6789', shortId: 'MH-22-LM', lat: 18.65, lng: 73.55, status: 'active', label: 'Pune → Mumbai', driver: 'Suresh P.', speed: 71, altitude: 498, battery: 79, fuelPct: 38, fuelStatus: 'ok', chargingStatus: 'low', heading: 315, headingLabel: 'NW', ignition: true, updatedAt: '08 Jun 2026, 14:32:07', signal: 'Strong' },
    { id: 'MH-43-NO-0123', shortId: 'MH-43-NO', lat: 19.2403, lng: 73.1305, status: 'idle', label: 'Kalyan yard', driver: 'Deepak M.', speed: 0, altitude: 11, battery: 91, fuelPct: 22, fuelStatus: 'low', chargingStatus: null, heading: 0, headingLabel: '—', ignition: false, updatedAt: '08 Jun 2026, 14:29:40', signal: 'Good' },
    { id: 'MH-15-PQ-4567', shortId: 'MH-15-PQ', lat: 18.82, lng: 73.42, status: 'active', label: 'Expressway', driver: '—', speed: 78, altitude: 312, battery: 73, fuelPct: 18, fuelStatus: 'low', chargingStatus: 'full', heading: 48, headingLabel: 'NE', ignition: true, updatedAt: '08 Jun 2026, 14:32:09', signal: 'Strong' },
    { id: 'MH-07-RS-8901', shortId: 'MH-07-RS', lat: 19.05, lng: 72.95, status: 'idle', label: 'Unassigned', driver: '—', speed: 0, altitude: 22, battery: 88, fuelPct: 51, fuelStatus: 'ok', chargingStatus: null, heading: 0, headingLabel: '—', ignition: false, updatedAt: '08 Jun 2026, 14:28:22', signal: 'Good' }
  ],
  statusColors: {
    active: '#16A34A',
    idle: '#F59E0B',
    offline: '#DC2626',
    transit: '#0052FF',
    maintenance: '#9333EA'
  },
  statusLabels: {
    active: 'Active',
    idle: 'Idle',
    offline: 'Offline',
    transit: 'In Transit',
    maintenance: 'Maintenance'
  },
  fuelStatusColors: {
    ok: '#16A34A',
    low: '#F59E0B',
    critical: '#DC2626'
  },
  fuelStatusLabels: {
    ok: 'OK',
    low: 'Low',
    critical: 'Critical'
  },
  chargingStatusColors: {
    charging: '#0052FF',
    idle: '#64748B',
    low: '#EA580C',
    full: '#16A34A'
  },
  chargingStatusLabels: {
    charging: 'Charging',
    idle: 'Not Charging',
    low: 'Low SOC',
    full: 'Full'
  },
  places: [
    { id: 'place-mumbai-port', name: 'Mumbai Port Yard', lat: 19.076, lng: 72.8777, type: 'Depot' },
    { id: 'place-pune-depot', name: 'Pune Logistics Depot', lat: 18.5204, lng: 73.8567, type: 'Depot' },
    { id: 'place-lonavala', name: 'Lonavala Toll Plaza', lat: 18.7557, lng: 73.4091, type: 'Checkpoint' },
    { id: 'place-kalyan', name: 'Kalyan Hub', lat: 19.2403, lng: 73.1305, type: 'Hub' },
    { id: 'place-nashik', name: 'Nashik Cross-Dock', lat: 19.9975, lng: 73.7898, type: 'Hub' }
  ],
  vendors: [
    { id: 'vendor-hp-lonavala', name: 'HP Fuel · Lonavala', lat: 18.74, lng: 73.42, type: 'Fuel' },
    { id: 'vendor-bridgestone-pune', name: 'Bridgestone Tyres · Pune', lat: 18.53, lng: 73.84, type: 'Tyres' },
    { id: 'vendor-tata-mumbai', name: 'Tata Service · Mumbai', lat: 19.09, lng: 72.91, type: 'Service' },
    { id: 'vendor-battery-thane', name: 'Exide Battery · Thane', lat: 19.22, lng: 72.98, type: 'Parts' }
  ],
  mapDefaultCenter: {
    label: 'Mumbai–Pune Corridor',
    lat: 18.85,
    lng: 73.35
  }
};
