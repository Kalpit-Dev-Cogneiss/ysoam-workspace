(function () {
  'use strict';

  const STATUS_CONFIG = {
    active:    { label: 'Active',    dot: '#16A34A' },
    idle:      { label: 'Idle',      dot: '#F59E0B' },
    'on-leave':{ label: 'On Leave',  dot: '#6366F1' },
    inactive:  { label: 'Inactive',  dot: '#94A3B8' }
  };

  let allDrivers = window.YSOAM_DRIVERS || [];
  let filtered   = [...allDrivers];
  let activeTab  = 'all';

  const tbody      = document.getElementById('drivers-table-body');
  const countEl   = document.getElementById('drivers-count');
  const searchEl  = document.getElementById('drivers-search');
  const groupEl   = document.getElementById('filter-group');
  const statusEl  = document.getElementById('filter-status');
  const tabBtns   = document.querySelectorAll('[data-driver-tab]');

  function statusDot(status) {
    const cfg = STATUS_CONFIG[status] || { label: status, dot: '#94A3B8' };
    return `<span class="vehicle-status">
      <span class="vehicle-status__dot" style="background:${cfg.dot}"></span>
      ${cfg.label}
    </span>`;
  }

  function stars(rating) {
    const full  = Math.floor(rating);
    const half  = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  function initials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  function avatarCell(driver) {
    return `<span class="driver-avatar">${initials(driver.name)}</span>`;
  }

  function renderRow(d) {
    const vehicle = d.assignedVehicle
      ? `<a href="vehicles.html" class="table-cell-link">${d.assignedVehicle}</a>`
      : '<span style="color:var(--color-steel)">—</span>';
    const expiry = d.licenseExpiry ? new Date(d.licenseExpiry).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';
    const joined = d.joined ? new Date(d.joined).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';

    return `<tr data-driver-id="${d.id}">
      <td class="data-table__check-col"><input type="checkbox" aria-label="Select ${d.name}"></td>
      <td class="driver-name-cell">
        <div class="vehicle-list-name">
          ${avatarCell(d)}
          <div>
            <a href="driver.html" class="table-cell-link">${d.name}</a>
            <span class="vehicle-list-vin">${d.id}</span>
          </div>
        </div>
      </td>
      <td>${d.phone}</td>
      <td>${d.group}</td>
      <td>${vehicle}</td>
      <td>${statusDot(d.status)}</td>
      <td class="tabular-nums">${d.trips}</td>
      <td class="tabular-nums">${d.kmThisMonth.toLocaleString()} km</td>
      <td class="tabular-nums">${d.hoursThisMonth} h</td>
      <td><span class="driver-rating" title="${d.rating}/5">${stars(d.rating)} <span class="driver-rating__num">${d.rating}</span></span></td>
      <td>${expiry}</td>
      <td>${joined}</td>
      <td class="data-table__actions-col">
        <div class="row-actions" data-row-actions>
          <button class="row-actions__trigger" type="button" aria-label="Actions for ${d.name}">
            <span class="row-actions__dots"></span>
          </button>
          <div class="row-actions__menu" hidden>
            <a href="driver.html" class="row-actions__item">View Profile</a>
            <button class="row-actions__item row-actions__item--btn" type="button">Edit</button>
            <button class="row-actions__item row-actions__item--btn" type="button">Assign Vehicle</button>
            <button class="row-actions__item row-actions__item--btn" type="button" style="color:var(--color-error)">Deactivate</button>
          </div>
        </div>
      </td>
    </tr>`;
  }

  function applyFilters() {
    const q      = (searchEl.value || '').toLowerCase().trim();
    const group  = groupEl.value;
    const status = statusEl.value;

    filtered = allDrivers.filter(d => {
      if (activeTab === 'active'   && d.status !== 'active')    return false;
      if (activeTab === 'on-leave' && d.status !== 'on-leave')  return false;
      if (activeTab === 'inactive' && d.status !== 'inactive')  return false;
      if (group  && d.group  !== group)                          return false;
      if (status && d.status !== status)                         return false;
      if (q) {
        const hay = [d.name, d.id, d.phone, d.assignedVehicle || '', d.group, d.license].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    tbody.innerHTML = filtered.length
      ? filtered.map(renderRow).join('')
      : `<tr><td colspan="13" style="text-align:center;padding:40px;color:var(--color-graphite);">No drivers found</td></tr>`;

    countEl.textContent = `${filtered.length} driver${filtered.length !== 1 ? 's' : ''}`;
  }

  // Tabs
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeTab = btn.dataset.driverTab;
      applyFilters();
    });
  });

  // Search & filters
  searchEl.addEventListener('input', applyFilters);
  groupEl.addEventListener('change', applyFilters);
  statusEl.addEventListener('change', applyFilters);

  // Row action menus
  document.addEventListener('click', e => {
    // Close all menus if clicking outside
    if (!e.target.closest('[data-row-actions]')) {
      document.querySelectorAll('.row-actions__menu').forEach(m => m.hidden = true);
      return;
    }
    const wrapper = e.target.closest('[data-row-actions]');
    const trigger = wrapper.querySelector('.row-actions__trigger');
    const menu    = wrapper.querySelector('.row-actions__menu');
    if (e.target.closest('.row-actions__trigger')) {
      const isOpen = !menu.hidden;
      document.querySelectorAll('.row-actions__menu').forEach(m => m.hidden = true);
      menu.hidden = isOpen;
    }
  });

  applyFilters();
})();
