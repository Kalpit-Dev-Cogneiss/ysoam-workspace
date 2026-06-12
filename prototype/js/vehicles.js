(function () {
  var data = window.YSOAM_VEHICLES;
  var fleet = window.YSOAM_FLEET;
  if (!data) return;

  var activeTab = 'all';
  var searchQuery = '';
  var filterType = '';
  var filterGroup = '';
  var filterStatus = '';

  function statusCell(status) {
    var colors = fleet && fleet.statusColors ? fleet.statusColors : {};
    var labels = fleet && fleet.statusLabels ? fleet.statusLabels : {};
    var color = colors[status] || '#64748B';
    var label = labels[status] || status;
    return '<span class="vehicle-status"><span class="vehicle-status__dot" style="background:' + color + '"></span>' + label + '</span>';
  }

  function vehiclePhoto(v) {
    var fallback = data.defaultImage || 'assets/vehicles/truck-1.jpg';
    var src = v.image || fallback;
    return '<img class="vehicle-list-photo" src="' + src + '" alt="" width="40" height="40" loading="lazy" onerror="this.onerror=null;this.src=\'' + fallback + '\'">';
  }

  function assignmentLabel(assignment) {
    if (assignment === 'assigned') return 'Assigned';
    if (assignment === 'unassigned') return 'Unassigned';
    if (assignment === 'archived') return 'Archived';
    return assignment || '—';
  }

  function filterVehicles() {
    return data.list.filter(function (v) {
      if (activeTab === 'assigned' && v.assignment !== 'assigned') return false;
      if (activeTab === 'unassigned' && v.assignment !== 'unassigned') return false;
      if (activeTab === 'archived' && v.assignment !== 'archived') return false;
      if (filterType && v.type !== filterType) return false;
      if (filterGroup && v.group !== filterGroup) return false;
      if (filterStatus && v.status !== filterStatus) return false;
      if (searchQuery) {
        var q = searchQuery.toLowerCase();
        var hay = [v.name, v.make, v.model, v.plate, v.vin, v.group, v.operator].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function rowActionIcon(key) {
    var icons = window.YSOAM_ICONS;
    return icons && icons[key] ? icons[key] : '';
  }

  function rowActionsMenu(v) {
    return (
      '<div class="row-actions" data-row-actions="' + v.id + '">' +
        '<button type="button" class="row-actions__trigger" aria-label="More actions" aria-haspopup="menu" aria-expanded="false">' +
          '<span class="row-actions__dots" aria-hidden="true"></span>' +
        '</button>' +
        '<div class="row-actions__menu" role="menu" hidden>' +
          '<a class="row-actions__item" href="vehicle-detail?id=' + encodeURIComponent(v.id) + '" role="menuitem">View <span class="row-actions__item-icon">' + rowActionIcon('actionView') + '</span></a>' +
          '<a class="row-actions__item" href="vehicle-form?id=' + encodeURIComponent(v.id) + '" role="menuitem">Edit <span class="row-actions__item-icon">' + rowActionIcon('actionEdit') + '</span></a>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" role="menuitem">Archive <span class="row-actions__item-icon">' + rowActionIcon('actionArchive') + '</span></button>' +
        '</div>' +
      '</div>'
    );
  }

  function closeAllMenus() {
    document.querySelectorAll('.row-actions__menu').forEach(function (m) {
      m.hidden = true;
    });
    document.querySelectorAll('.row-actions__trigger').forEach(function (b) {
      b.setAttribute('aria-expanded', 'false');
    });
  }

  function bindRowActions() {
    document.querySelectorAll('.row-actions').forEach(function (wrap) {
      wrap.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    });

    document.querySelectorAll('.row-actions__trigger').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var wrap = btn.closest('.row-actions');
        var menu = wrap.querySelector('.row-actions__menu');
        var willOpen = menu.hidden;
        closeAllMenus();
        if (willOpen) {
          menu.hidden = false;
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    document.querySelectorAll('.row-actions__item--btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        closeAllMenus();
        window.alert('Vehicle archived (prototype demo).');
      });
    });
  }

  function renderTable() {
    var tbody = document.getElementById('vehicles-table-body');
    var countEl = document.getElementById('vehicles-count');
    if (!tbody) return;

    var rows = filterVehicles();
    if (countEl) {
      countEl.textContent = rows.length + ' vehicle' + (rows.length === 1 ? '' : 's');
    }

    tbody.innerHTML = rows.map(function (v) {
      var detailUrl = 'vehicle-detail?id=' + encodeURIComponent(v.id);
      return (
        '<tr>' +
          '<td class="data-table__check-col"><input type="checkbox" aria-label="Select ' + v.name + '"></td>' +
          '<td class="vehicle-list-name-cell"><div class="vehicle-list-name">' + vehiclePhoto(v) + '<a href="' + detailUrl + '">' + v.name + '</a></div></td>' +
          '<td class="tabular-nums">' + v.year + '</td>' +
          '<td>' + v.make + '</td>' +
          '<td>' + v.model + '</td>' +
          '<td class="vehicle-list-vin tabular-nums">' + v.vin + '</td>' +
          '<td>' + statusCell(v.status) + '</td>' +
          '<td>' + v.type + '</td>' +
          '<td>' + v.group + '</td>' +
          '<td class="tabular-nums"><a class="vehicle-meter-link" href="' + detailUrl + '#meter">' + v.meter + '</a></td>' +
          '<td class="tabular-nums">' + v.plate + '</td>' +
          '<td class="vehicle-list-watchers tabular-nums">' + (v.watchers || 0) + '</td>' +
          '<td class="data-table__actions-col">' + rowActionsMenu(v) + '</td>' +
        '</tr>'
      );
    }).join('');

    bindRowActions();
  }

  function bindTabs() {
    document.querySelectorAll('.segment-tab[data-vehicle-tab]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        activeTab = tab.getAttribute('data-vehicle-tab');
        document.querySelectorAll('.segment-tab[data-vehicle-tab]').forEach(function (t) {
          t.classList.toggle('is-active', t === tab);
        });
        renderTable();
      });
    });
  }

  function bindSearch() {
    var input = document.getElementById('vehicles-search');
    if (!input) return;
    input.addEventListener('input', function () {
      searchQuery = input.value.trim();
      renderTable();
    });
  }

  function bindFilters() {
    var typeEl = document.getElementById('filter-type');
    var groupEl = document.getElementById('filter-group');
    var statusEl = document.getElementById('filter-status');

    if (typeEl) {
      typeEl.addEventListener('change', function () {
        filterType = typeEl.value;
        renderTable();
      });
    }
    if (groupEl) {
      groupEl.addEventListener('change', function () {
        filterGroup = groupEl.value;
        renderTable();
      });
    }
    if (statusEl) {
      statusEl.addEventListener('change', function () {
        filterStatus = statusEl.value;
        renderTable();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('vehicles-table-body')) return;
    bindTabs();
    bindSearch();
    bindFilters();
    renderTable();

    document.addEventListener('click', function () {
      closeAllMenus();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAllMenus();
    });
  });
})();
