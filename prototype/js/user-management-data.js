window.YSOAM_USER_MANAGEMENT = (function () {
  var USER_STATUSES = [
    { id: 'no-access', label: 'No Access', color: '#94A3B8' },
    { id: 'needs-invite', label: 'Needs Invite', color: '#2563EB' },
    { id: 'invited', label: 'Invited', color: '#7C3AED' },
    { id: 'active', label: 'Active', color: '#16A34A' },
    { id: 'dormant', label: 'Dormant', color: '#84CC16' },
    { id: 'deactivated', label: 'Deactivated', color: '#DC2626' }
  ];

  var USER_TYPES = [
    { id: 'administrator', label: 'Administrator' },
    { id: 'regular', label: 'Regular User' },
    { id: 'owner', label: 'Account Owner' }
  ];

  var GROUPS = [
    { id: 'expressway', label: 'Expressway', parent: 'Maharashtra', sample: true },
    { id: 'pune-depot', label: 'Pune Depot', parent: 'Maharashtra', sample: false },
    { id: 'mumbai-port', label: 'Mumbai Port', parent: 'Maharashtra', sample: true },
    { id: 'nashik-route', label: 'Nashik Route', parent: 'Maharashtra', sample: false },
    { id: 'thane-workshop', label: 'Thane Workshop', parent: 'Maharashtra', sample: true },
    { id: 'kalyan-yard', label: 'Kalyan Yard', parent: 'Maharashtra', sample: false }
  ];

  var POPULAR_FILTERS = [
    { id: 'role', label: 'Role' },
    { id: 'unconfirmed', label: 'Unconfirmed Email' },
    { id: 'classification', label: 'Classification' },
    { id: 'group', label: 'Group' },
    { id: 'name', label: 'Full Name' },
    { id: 'email', label: 'Email' },
    { id: 'city', label: 'City' },
    { id: 'region', label: 'State/Province/Region' },
    { id: 'vehicle', label: 'Currently Assigned Vehicle' }
  ];

  var AVATAR_COLORS = ['#6366F1', '#0EA5E9', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#EF4444', '#14B8A6'];

  function initials(name) {
    return String(name || '').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
  }

  function buildList() {
    return [
      {
        id: 'USR-001',
        name: 'Demo Manager',
        email: 'demo.manager@ysoam.in',
        userStatus: 'active',
        userType: 'owner',
        userRole: null,
        loginCount: 24,
        classifications: [],
        group: null,
        assignedVehicles: [],
        hasUserAccess: true,
        unconfirmedEmail: false,
        archived: false,
        city: 'Mumbai',
        region: 'Maharashtra'
      },
      {
        id: 'USR-002',
        name: 'Kalpit Parmar',
        email: 'kalpitp888@gmail.com',
        userStatus: 'active',
        userType: 'owner',
        userRole: null,
        loginCount: 2,
        classifications: [],
        group: null,
        assignedVehicles: [],
        hasUserAccess: true,
        unconfirmedEmail: false,
        archived: false,
        city: 'Pune',
        region: 'Maharashtra'
      },
      {
        id: 'USR-003',
        name: 'Priya Desai',
        email: 'priya.desai@ysoam.in',
        userStatus: 'active',
        userType: 'administrator',
        userRole: 'Fleet Admin',
        loginCount: 18,
        classifications: ['Manager'],
        group: 'expressway',
        assignedVehicles: ['MH-12-AB-1234', 'MH-22-LM-6789'],
        hasUserAccess: true,
        unconfirmedEmail: false,
        archived: false,
        city: 'Lonavala',
        region: 'Maharashtra'
      },
      {
        id: 'USR-004',
        name: 'Rahul Mehta',
        email: 'rahul.mehta@ysoam.in',
        userStatus: 'invited',
        userType: 'regular',
        userRole: 'Dispatcher',
        loginCount: 0,
        classifications: ['Operations'],
        group: 'pune-depot',
        assignedVehicles: [],
        hasUserAccess: true,
        unconfirmedEmail: true,
        archived: false,
        city: 'Pune',
        region: 'Maharashtra'
      },
      {
        id: 'USR-005',
        name: 'Sneha Kulkarni',
        email: 'sneha.k@ysoam.in',
        userStatus: 'needs-invite',
        userType: 'regular',
        userRole: 'Analyst',
        loginCount: 0,
        classifications: ['Finance'],
        group: 'mumbai-port',
        assignedVehicles: [],
        hasUserAccess: true,
        unconfirmedEmail: false,
        archived: false,
        city: 'Mumbai',
        region: 'Maharashtra'
      },
      {
        id: 'USR-006',
        name: 'Amit Joshi',
        email: 'amit.joshi@ysoam.in',
        userStatus: 'dormant',
        userType: 'regular',
        userRole: 'Viewer',
        loginCount: 6,
        classifications: [],
        group: 'nashik-route',
        assignedVehicles: ['MH-04-HI-3456'],
        hasUserAccess: true,
        unconfirmedEmail: false,
        archived: false,
        city: 'Nashik',
        region: 'Maharashtra'
      },
      {
        id: 'USR-007',
        name: 'Vikram Patil',
        email: 'vikram.patil@fleet.local',
        userStatus: 'no-access',
        userType: 'regular',
        userRole: null,
        loginCount: 0,
        classifications: ['Driver'],
        group: null,
        assignedVehicles: ['MH-01-EF-7890'],
        hasUserAccess: false,
        unconfirmedEmail: false,
        archived: false,
        city: 'Mumbai',
        region: 'Maharashtra'
      },
      {
        id: 'USR-008',
        name: 'Neha Singh',
        email: 'neha.singh@ysoam.in',
        userStatus: 'deactivated',
        userType: 'regular',
        userRole: 'Technician',
        loginCount: 11,
        classifications: ['Maintenance'],
        group: 'thane-workshop',
        assignedVehicles: [],
        hasUserAccess: true,
        unconfirmedEmail: false,
        archived: true,
        city: 'Thane',
        region: 'Maharashtra'
      },
      {
        id: 'USR-009',
        name: 'Suresh Iyer',
        email: 'suresh.iyer@ysoam.in',
        userStatus: 'active',
        userType: 'regular',
        userRole: 'Supervisor',
        loginCount: 9,
        classifications: ['Operations', 'Driver'],
        group: 'kalyan-yard',
        assignedVehicles: ['MH-09-FG-9012'],
        hasUserAccess: true,
        unconfirmedEmail: true,
        archived: false,
        city: 'Kalyan',
        region: 'Maharashtra'
      },
      {
        id: 'USR-010',
        name: 'Meera Nair',
        email: 'meera.nair@ysoam.in',
        userStatus: 'no-access',
        userType: 'regular',
        userRole: null,
        loginCount: 0,
        classifications: ['Vendor'],
        group: null,
        assignedVehicles: [],
        hasUserAccess: false,
        unconfirmedEmail: false,
        archived: false,
        city: 'Pune',
        region: 'Maharashtra'
      }
    ];
  }

  function statusById(id) {
    return USER_STATUSES.find(function (s) { return s.id === id; }) || USER_STATUSES[0];
  }

  function typeById(id) {
    return USER_TYPES.find(function (t) { return t.id === id; }) || USER_TYPES[1];
  }

  function groupById(id) {
    return GROUPS.find(function (g) { return g.id === id; }) || null;
  }

  function avatarColor(index) {
    return AVATAR_COLORS[index % AVATAR_COLORS.length];
  }

  function getById(id) {
    return list.find(function (row) { return row.id === id; }) || null;
  }

  var list = buildList();

  return {
    list: list,
    getById: getById,
    userStatuses: USER_STATUSES,
    userTypes: USER_TYPES,
    groups: GROUPS,
    popularFilters: POPULAR_FILTERS,
    statusById: statusById,
    typeById: typeById,
    groupById: groupById,
    initials: initials,
    avatarColor: avatarColor
  };
})();
