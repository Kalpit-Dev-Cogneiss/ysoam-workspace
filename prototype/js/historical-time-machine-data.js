window.YSOAM_HISTORICAL_TIME_MACHINE = (function () {
  'use strict';

  var scenes = [
    {
      id: 'HTM-DUMKA-001',
      name: 'Dumka Siding Area',
      type: 'Temporary Geofence',
      date: '2026-06-15',
      time: '20:00',
      timeLabel: '08:00 PM',
      windowStart: '2026-06-15T19:30:00+05:30',
      windowEnd: '2026-06-15T20:30:00+05:30',
      center: { lat: 24.2728, lng: 87.2481 },
      radiusM: 2000,
      address: 'Dumka Siding Area, Dumka, Jharkhand, India',
      createdBy: 'Demo Manager',
      createdAt: '2026-06-15T19:58:00+05:30',
      summary: {
        vehiclesInArea: 42,
        moving: 28,
        stopped: 14,
        averageSpeedKph: 38,
        entries: 18,
        exits: 10,
        maxDwell: '1h 05m',
        alerts: 3
      },
      vehicles: [
        {
          vehicleName: 'Tata 407 Coal Carrier',
          plate: 'JH04AB7254',
          driver: 'Raju Kumar',
          route: 'Dumka Yard Gate → Siding Weighbridge',
          speedKph: 48,
          direction: 'NE',
          status: 'Moving',
          entryTime: '07:58 PM',
          exitTime: '08:14 PM',
          dwell: '17m 32s',
          firstSeen: '07:57:44 PM',
          lastSeen: '08:15:16 PM',
          distanceInsideKm: 1.8,
          lat: 24.2767,
          lng: 87.2516
        },
        {
          vehicleName: 'Ashok Leyland Tipper',
          plate: 'JH04CD5678',
          driver: 'Vijay Singh',
          route: 'Siding Parking Bay → Loading Point 2',
          speedKph: 0,
          direction: '-',
          status: 'Stopped',
          entryTime: '07:45 PM',
          exitTime: '08:15 PM',
          dwell: '30m 12s',
          firstSeen: '07:44:51 PM',
          lastSeen: '08:15:03 PM',
          distanceInsideKm: 0.4,
          lat: 24.2668,
          lng: 87.2424
        },
        {
          vehicleName: 'BharatBenz Haulage Truck',
          plate: 'JH04EF9012',
          driver: 'Maheah Oraon',
          route: 'Dumka Bypass → Siding Exit Road',
          speedKph: 42,
          direction: 'NW',
          status: 'Moving',
          entryTime: '07:59 PM',
          exitTime: '08:17 PM',
          dwell: '18m 02s',
          firstSeen: '07:59:18 PM',
          lastSeen: '08:17:20 PM',
          distanceInsideKm: 2.1,
          lat: 24.282,
          lng: 87.2392
        },
        {
          vehicleName: 'Mahindra Bolero Pickup',
          plate: 'JH04GH0359',
          driver: 'Suresh Yadav',
          route: 'Security Gate → Maintenance Shed',
          speedKph: 0,
          direction: '-',
          status: 'Stopped',
          entryTime: '08:00 PM',
          exitTime: '08:10 PM',
          dwell: '10m 16s',
          firstSeen: '08:00:02 PM',
          lastSeen: '08:10:18 PM',
          distanceInsideKm: 0.2,
          lat: 24.2692,
          lng: 87.258
        },
        {
          vehicleName: 'Eicher Pro 3015',
          plate: 'JH05KL4432',
          driver: 'Imran Ansari',
          route: 'Siding Approach Road → Coal Stack 4',
          speedKph: 36,
          direction: 'E',
          status: 'Moving',
          entryTime: '08:02 PM',
          exitTime: '08:21 PM',
          dwell: '19m 41s',
          firstSeen: '08:02:09 PM',
          lastSeen: '08:21:50 PM',
          distanceInsideKm: 1.4,
          lat: 24.2618,
          lng: 87.2496
        },
        {
          vehicleName: 'Tata Prima Trailer',
          plate: 'JH10MN7781',
          driver: 'Anita Devi',
          route: 'Loading Point 1 → Dumka Main Road',
          speedKph: 22,
          direction: 'SE',
          status: 'Moving',
          entryTime: '08:04 PM',
          exitTime: '08:19 PM',
          dwell: '15m 08s',
          firstSeen: '08:03:58 PM',
          lastSeen: '08:19:06 PM',
          distanceInsideKm: 1.1,
          lat: 24.2579,
          lng: 87.2557
        },
        {
          vehicleName: 'JCB Service Van',
          plate: 'JH04PQ1189',
          driver: 'Bikash Murmu',
          route: 'Workshop Hold Area → Siding Parking Bay',
          speedKph: 0,
          direction: '-',
          status: 'Stopped',
          entryTime: '07:36 PM',
          exitTime: '08:41 PM',
          dwell: '1h 05m',
          firstSeen: '07:35:50 PM',
          lastSeen: '08:40:52 PM',
          distanceInsideKm: 0.1,
          lat: 24.2735,
          lng: 87.2338
        },
        {
          vehicleName: 'Ashok Leyland 16T Truck',
          plate: 'JH04RS6408',
          driver: 'Kunal Tudu',
          route: 'North Entry Road → Siding Weighbridge',
          speedKph: 54,
          direction: 'N',
          status: 'Moving',
          entryTime: '08:07 PM',
          exitTime: '08:18 PM',
          dwell: '11m 22s',
          firstSeen: '08:06:49 PM',
          lastSeen: '08:18:11 PM',
          distanceInsideKm: 2.6,
          lat: 24.2861,
          lng: 87.2508
        }
      ],
      timeline: [
        { time: '07:30 PM', label: 'Scene window started', count: 18 },
        { time: '07:45 PM', label: 'Vehicle entry spike detected', count: 29 },
        { time: '08:00 PM', label: 'Reconstruction point', count: 42 },
        { time: '08:15 PM', label: 'Peak stopped vehicles', count: 14 },
        { time: '08:30 PM', label: 'Scene window closed', count: 31 }
      ]
    }
  ];

  function getScene(id) {
    return scenes.find(function (scene) { return scene.id === id; }) || scenes[0];
  }

  return {
    scenes: scenes,
    getScene: getScene
  };
})();
