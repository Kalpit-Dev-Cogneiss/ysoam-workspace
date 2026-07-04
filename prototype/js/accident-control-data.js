window.YSOAM_ACCIDENT_CONTROL = (function () {
  'use strict';

  var historical = window.YSOAM_HISTORICAL_TIME_MACHINE;
  var scene = historical ? historical.getScene('HTM-DUMKA-001') : null;

  var accidents = [
    {
      id: 'ACC-2026-0007',
      title: 'Collision risk near Dumka Siding Gate',
      caseType: 'Accident',
      priority: 'High',
      severity: 'critical',
      severityLabel: 'Critical',
      status: 'Active Investigation',
      geofenceName: 'Dumka Siding Area',
      location: 'Dumka Siding Area, Jharkhand',
      reportedAt: '15 Jun 2026, 08:08 PM',
      sceneTime: '08:00 PM',
      sceneDate: '2026-06-15',
      historicalSceneId: 'HTM-DUMKA-001',
      involvedVehicle: 'JH04RS6408',
      involvedVehicleName: 'Ashok Leyland 16T Truck',
      route: 'North Entry Road -> Siding Weighbridge',
      speedKph: 54,
      entryTime: '08:07 PM',
      exitTime: '08:18 PM',
      duration: '11m 22s',
      vehiclesPassed: 42,
      averageSpeedKph: 38,
      maxSpeedKph: 54,
      responseStatus: 'Control room notified dispatch and nearest supervisor.',
      evidence: 'Historical geofence replay, route trail, entry/exit logs',
      vehiclesInvolved: 2,
      movingNearby: 6,
      witnessVehicles: 4,
      cctvAvailable: 2,
      breakdown: 'No breakdown confirmed; collision risk triggered by harsh braking and stopped vehicle nearby.',
      emergencyServices: [
        { name: 'Dumka Highway Patrol', type: 'Police', eta: '8 min', status: 'Available' },
        { name: 'Sadar Hospital Ambulance', type: 'Ambulance', eta: '12 min', status: 'Dispatched' },
        { name: 'Tata Authorized Tow', type: 'Tow Truck', eta: '18 min', status: 'Available' }
      ],
      nearbyVehicles: [
        { plate: 'JH04CD5678', vehicleName: 'Ashok Leyland Tipper', driver: 'Vijay Singh', distance: '0.4 km', speedKph: 0, role: 'Witness / stopped nearby' },
        { plate: 'JH04AB7254', vehicleName: 'Tata 407 Coal Carrier', driver: 'Raju Kumar', distance: '0.8 km', speedKph: 48, role: 'Witness vehicle' },
        { plate: 'JH05KL4432', vehicleName: 'Eicher Pro 3015', driver: 'Imran Ansari', distance: '1.1 km', speedKph: 36, role: 'Nearby moving vehicle' }
      ],
      timeline: [
        { time: '08:02 PM', level: 'info', label: 'Vehicle entered accident geofence' },
        { time: '08:07 PM', level: 'warning', label: 'Overspeed approach detected (54 km/h)' },
        { time: '08:10 PM', level: 'critical', label: 'Harsh braking / collision risk triggered' },
        { time: '08:11 PM', level: 'warning', label: 'Nearby vehicle stopped inside geofence' },
        { time: '08:12 PM', level: 'info', label: 'Control room notified emergency services' }
      ],
      quickActions: ['Replay Incident', 'Find Witness Vehicles', 'View CCTV', 'Dispatch Ambulance', 'Download Report', 'Add Note / Evidence']
    },
    {
      id: 'ACC-2026-0006',
      title: 'Stopped vehicle obstruction near Loading Point 2',
      caseType: 'Breakdown',
      priority: 'High',
      severity: 'high',
      severityLabel: 'High',
      status: 'Response In Progress',
      geofenceName: 'Dumka Siding Area',
      location: 'Loading Point 2, Dumka Siding',
      reportedAt: '15 Jun 2026, 07:52 PM',
      sceneTime: '07:45 PM',
      sceneDate: '2026-06-15',
      historicalSceneId: 'HTM-DUMKA-001',
      involvedVehicle: 'JH04CD5678',
      involvedVehicleName: 'Ashok Leyland Tipper',
      route: 'Siding Parking Bay -> Loading Point 2',
      speedKph: 0,
      entryTime: '07:45 PM',
      exitTime: '08:15 PM',
      duration: '30m 12s',
      vehiclesPassed: 29,
      averageSpeedKph: 31,
      maxSpeedKph: 48,
      responseStatus: 'Yard marshal assigned; route hold marked for review.',
      evidence: 'Stopped vehicle dwell time and nearby vehicle movement',
      vehiclesInvolved: 1,
      movingNearby: 5,
      witnessVehicles: 3,
      cctvAvailable: 1,
      breakdown: 'Vehicle stopped for 30m inside loading route; possible mechanical breakdown or obstruction.',
      emergencyServices: [
        { name: 'Dumka Mobile Mechanic Unit', type: 'Breakdown Service', eta: '9 min', status: 'Available' },
        { name: 'Yard Tow Tractor', type: 'Tow Support', eta: '6 min', status: 'Ready' },
        { name: 'Site Supervisor Team', type: 'On-site response', eta: '4 min', status: 'Dispatched' }
      ],
      nearbyVehicles: [
        { plate: 'JH04GH0359', vehicleName: 'Mahindra Bolero Pickup', driver: 'Suresh Yadav', distance: '0.3 km', speedKph: 0, role: 'Stopped nearby' },
        { plate: 'JH04AB7254', vehicleName: 'Tata 407 Coal Carrier', driver: 'Raju Kumar', distance: '0.7 km', speedKph: 48, role: 'Possible witness' },
        { plate: 'JH10MN7781', vehicleName: 'Tata Prima Trailer', driver: 'Anita Devi', distance: '1.0 km', speedKph: 22, role: 'Nearby moving vehicle' }
      ],
      timeline: [
        { time: '07:45 PM', level: 'info', label: 'Vehicle entered geofence' },
        { time: '07:52 PM', level: 'warning', label: 'Vehicle stopped beyond threshold' },
        { time: '08:00 PM', level: 'warning', label: 'Queue forming near Loading Point 2' },
        { time: '08:05 PM', level: 'info', label: 'Breakdown service identified nearby' },
        { time: '08:15 PM', level: 'info', label: 'Vehicle exited / obstruction cleared' }
      ],
      quickActions: ['Replay Incident', 'Find Nearby Mechanic', 'Dispatch Tow Vehicle', 'Notify Supervisor', 'Download Report', 'Add Note / Evidence']
    },
    {
      id: 'ACC-2026-0005',
      title: 'Overspeed approach inside temporary geofence',
      caseType: 'Overspeed',
      priority: 'Medium',
      severity: 'medium',
      severityLabel: 'Medium',
      status: 'Under Review',
      geofenceName: 'Dumka Siding Area',
      location: 'North Entry Road, Dumka Siding',
      reportedAt: '15 Jun 2026, 08:11 PM',
      sceneTime: '08:07 PM',
      sceneDate: '2026-06-15',
      historicalSceneId: 'HTM-DUMKA-001',
      involvedVehicle: 'JH04AB7254',
      involvedVehicleName: 'Tata 407 Coal Carrier',
      route: 'Dumka Yard Gate -> Siding Weighbridge',
      speedKph: 48,
      entryTime: '07:58 PM',
      exitTime: '08:14 PM',
      duration: '17m 32s',
      vehiclesPassed: 35,
      averageSpeedKph: 36,
      maxSpeedKph: 48,
      responseStatus: 'Driver coaching ticket ready for supervisor approval.',
      evidence: 'Speed trail and geofence entry log',
      vehiclesInvolved: 1,
      movingNearby: 4,
      witnessVehicles: 2,
      cctvAvailable: 0,
      breakdown: 'No breakdown; overspeed and route-risk incident generated from historical geofence replay.',
      emergencyServices: [
        { name: 'Nearest Patrol Team', type: 'Safety Patrol', eta: '10 min', status: 'Available' },
        { name: 'Dumka Dispatch Desk', type: 'Dispatcher', eta: 'Immediate', status: 'Online' }
      ],
      nearbyVehicles: [
        { plate: 'JH04RS6408', vehicleName: 'Ashok Leyland 16T Truck', driver: 'Kunal Tudu', distance: '0.6 km', speedKph: 54, role: 'Nearby fast vehicle' },
        { plate: 'JH05KL4432', vehicleName: 'Eicher Pro 3015', driver: 'Imran Ansari', distance: '1.2 km', speedKph: 36, role: 'Possible witness' }
      ],
      timeline: [
        { time: '07:58 PM', level: 'info', label: 'Vehicle entered geofence' },
        { time: '08:00 PM', level: 'warning', label: 'Speed threshold crossed' },
        { time: '08:08 PM', level: 'info', label: 'Nearby vehicle routes checked' },
        { time: '08:14 PM', level: 'info', label: 'Vehicle exited geofence' }
      ],
      quickActions: ['Replay Incident', 'Find Witness Vehicles', 'Create Driver Coaching', 'Download Report', 'Add Note / Evidence']
    }
  ];

  function getById(id) {
    return accidents.find(function (row) { return row.id === id; }) || accidents[0];
  }

  function stats() {
    return {
      total: accidents.length,
      critical: accidents.filter(function (row) { return row.severity === 'critical'; }).length,
      active: accidents.filter(function (row) { return row.status !== 'Closed'; }).length,
      vehiclesPassed: accidents.reduce(function (sum, row) { return Math.max(sum, row.vehiclesPassed); }, 0),
      emergencyAvailable: accidents.reduce(function (sum, row) { return Math.max(sum, row.emergencyServices.length); }, 0)
    };
  }

  return {
    accidents: accidents,
    scene: scene,
    getById: getById,
    stats: stats
  };
})();
