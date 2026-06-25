(function () {
  'use strict';

  var data = window.YSOAM_GEOFENCES;
  var dateFilter = window.YSOAM_DATE_FILTER;

  var state = {
    search: '',
    page: 1,
    pageSize: 50,
    sortDir: 'asc',
    filters: {
      entryTypes: [],
      entryDate: { active: false, start: null, end: null, preset: null },
      minRadius: null,
      cities: [],
      states: [],
      countries: []
    }
  };

  var openFilter = null;
  var draft = null;
  var dateDraft = null;
  var dateUi = null;
  var radiusDraft = '';

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function lucide(name, size) { return window.YSOAM_LUCIDE ? window.YSOAM_LUCIDE.icon(name, size || 16) : ''; }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }

  function dashCell() { return '<span class="geofences-cell-empty">—</span>'; }

  function filterCount() {
    var f = state.filters;
    var n = 0;
    if (f.entryTypes.length) n++;
    if (f.entryDate.active) n++;
    if (f.minRadius != null) n++;
    if (f.cities.length) n++;
    if (f.states.length) n++;
    if (f.countries.length) n++;
    return n;
  }

  function filteredList() {
    var q = state.search.trim().toLowerCase();
    var f = state.filters;
    var rows = data.list.filter(function (g) {
      if (f.entryTypes.length) {
        var match = f.entryTypes.some(function (t) { return g.entryTypes.indexOf(t) !== -1; });
        if (!match) return false;
      }
      if (f.entryDate.active && g.lastEntryAt && !dateFilter.matchesRange(g.lastEntryAt, f.entryDate)) return false;
      if (f.minRadius != null && g.radiusM < f.minRadius) return false;
      if (f.cities.length && f.cities.indexOf(g.city) === -1) return false;
      if (f.states.length && f.states.indexOf(g.state) === -1) return false;
      if (f.countries.length && f.countries.indexOf(g.country) === -1) return false;
      if (q) {
        var hay = [g.name, g.description, g.address, g.city, g.state, g.country].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });

    rows.sort(function (a, b) {
      var cmp = a.name.localeCompare(b.name);
      return state.sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }

  function geofenceThumb() {
    return '<span class="geofence-thumb" aria-hidden="true">' +
      '<span class="geofence-thumb__map"></span>' +
      '<span class="geofence-thumb__pin">' + lucide('mapPin', 12) + '</span>' +
    '</span>';
  }

  function nameCell(g) {
    var href = 'geofence-view?id=' + encodeURIComponent(g.id);
    return '<span class="geofence-name-cell">' + geofenceThumb() +
      '<a href="' + href + '" class="table-cell-link geofence-name-link">' + esc(g.name) + '</a></span>';
  }

  function renderTable() {
    var root = document.getElementById('geofences-table');
    var countEl = document.getElementById('geofences-count');
    if (!root) return;

    var all = filteredList();
    var total = all.length;
    var totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    if (state.page > totalPages) state.page = totalPages;
    var start = (state.page - 1) * state.pageSize;
    var rows = all.slice(start, start + state.pageSize);
    var from = total ? start + 1 : 0;
    var to = Math.min(state.page * state.pageSize, total);
    if (countEl) countEl.textContent = from + ' – ' + to + ' of ' + total;

    var sortIcon = state.sortDir === 'asc' ? ' ↑' : ' ↓';
    var html = '<table class="data-table data-table--list data-table--geofences"><thead><tr>' +
      '<th class="geofence-col-name"><button type="button" class="geofence-th-sort" id="geofences-sort-name">Name' + sortIcon + '</button></th>' +
      '<th class="geofence-col-desc">Description</th>' +
      '<th class="geofence-col-address">Address</th>' +
      '</tr></thead><tbody>';

    if (!rows.length) {
      html += '<tr><td colspan="3" class="geofences-empty">' +
        '<span class="fh-empty-state"><span class="fh-empty-state__icon" data-lucide-icon="search" data-lucide-icon-size="32" aria-hidden="true"></span>No results to show.</span></td></tr>';
    } else {
      rows.forEach(function (g) {
        html += '<tr class="geofence-row" data-geofence-id="' + escA(g.id) + '" tabindex="0" role="link" aria-label="View ' + escA(g.name) + '">' +
          '<td class="geofence-col-name">' + nameCell(g) + '</td>' +
          '<td class="geofence-col-desc">' + (g.description ? esc(g.description) : dashCell()) + '</td>' +
          '<td class="geofence-col-address">' + esc(g.address) + '</td>' +
          '</tr>';
      });
    }
    html += '</tbody></table>';
    root.innerHTML = html;
    initLucide(root);
    updatePills();

    var sortBtn = document.getElementById('geofences-sort-name');
    if (sortBtn) {
      sortBtn.onclick = function () {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
        renderTable();
      };
    }

    root.querySelectorAll('.geofence-row').forEach(function (row) {
      function go() {
        window.location.href = 'geofence-view?id=' + encodeURIComponent(row.getAttribute('data-geofence-id'));
      }
      row.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;
        go();
      });
      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          go();
        }
      });
    });
  }

  function updatePills() {
    var f = state.filters;
    document.querySelectorAll('.geofences-panel .expense-filter-pill').forEach(function (btn) {
      var k = btn.getAttribute('data-filter');
      var on = (k === 'entryType' && f.entryTypes.length) ||
        (k === 'entryDate' && f.entryDate.active) ||
        (k === 'radius' && f.minRadius != null);
      btn.classList.toggle('has-filter', !!on);
    });
    var btn = document.getElementById('geofences-filters-btn');
    var lbl = document.getElementById('geofences-filters-btn-label');
    if (btn) {
      var n = filterCount();
      var open = document.getElementById('geofences-filters-drawer').classList.contains('is-open');
      btn.classList.toggle('is-active', n > 0 || open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (lbl) lbl.textContent = n > 0 ? n + ' Filter' + (n === 1 ? '' : 's') : 'Filters';
    }
  }

  function closePop() {
    var p = document.getElementById('geofences-filter-popover');
    if (p) {
      p.hidden = true;
      p.classList.remove('is-date-popover', 'is-number-popover');
    }
    document.querySelectorAll('.geofences-panel .expense-filter-pill').forEach(function (b) {
      b.classList.remove('is-open');
      b.setAttribute('aria-expanded', 'false');
    });
    openFilter = null;
    draft = null;
    dateDraft = null;
    dateUi = null;
    radiusDraft = '';
  }

  function positionPop(anchor, pop) {
    var panel = document.querySelector('.geofences-panel');
    if (!panel) return;
    var pr = panel.getBoundingClientRect();
    var r = anchor.getBoundingClientRect();
    pop.style.top = (r.bottom - pr.top + 6) + 'px';
    var w = pop.offsetWidth || (openFilter === 'entryDate' ? 620 : 340);
    pop.style.left = Math.max(8, Math.min(r.left - pr.left, pr.width - w - 8)) + 'px';
  }

  function entryTypePopover(selected) {
    var list = data.entryTypes.map(function (t) {
      var checked = selected.indexOf(t.id) !== -1;
      return '<label class="meter-select-item"><input type="checkbox" value="' + escA(t.id) + '"' + (checked ? ' checked' : '') + '><span>' + esc(t.label) + '</span></label>';
    }).join('');
    return '<div class="meter-popover meter-popover--select">' +
      '<div class="meter-popover__search"><span data-lucide-icon="search" aria-hidden="true"></span>' +
      '<input type="search" class="meter-popover__search-input" placeholder="Select item(s)" data-select-search></div>' +
      '<div class="meter-popover__list" data-select-list>' + list + '</div>' +
      '<div class="meter-popover__footer"><div class="meter-popover__footer-right">' +
      '<button type="button" class="btn btn-text btn-sm" data-popover-cancel>Cancel</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-popover-apply>Apply</button></div></div></div>';
  }

  function radiusPopover(value) {
    return '<div class="meter-popover meter-popover--number">' +
      '<div class="meter-popover__number-body">' +
        '<input type="number" class="meter-popover__number-input" data-radius-input min="0" step="1" placeholder="Search number" value="' + escA(value || '') + '">' +
      '</div>' +
      '<div class="meter-popover__footer"><div class="meter-popover__footer-right">' +
      '<button type="button" class="btn btn-text btn-sm" data-popover-cancel>Cancel</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-popover-apply-radius' + (value === '' || value == null ? ' disabled' : '') + '>Apply</button></div></div></div>';
  }

  function listPopover(kind, selected) {
    var items = kind === 'city' ? data.cities() : kind === 'state' ? data.states() : data.countries();
    var list = items.map(function (v) {
      var checked = selected.indexOf(v) !== -1;
      return '<label class="meter-select-item"><input type="checkbox" value="' + escA(v) + '"' + (checked ? ' checked' : '') + '><span>' + esc(v) + '</span></label>';
    }).join('');
    return '<div class="meter-popover meter-popover--select"><div class="meter-popover__search"><span data-lucide-icon="search" aria-hidden="true"></span>' +
      '<input type="search" class="meter-popover__search-input" placeholder="Select item(s)" data-select-search></div>' +
      '<div class="meter-popover__list" data-select-list>' + list + '</div>' +
      '<div class="meter-popover__footer"><div class="meter-popover__footer-right">' +
      '<button type="button" class="btn btn-text btn-sm" data-popover-cancel>Cancel</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-popover-apply>Apply</button></div></div></div>';
  }

  function bindSelectPop(kind) {
    var pop = document.getElementById('geofences-filter-popover');
    pop.querySelector('[data-popover-cancel]').onclick = closePop;
    pop.querySelector('[data-popover-apply]').onclick = function () {
      var vals = Array.prototype.map.call(pop.querySelectorAll('[data-select-list] input:checked'), function (el) { return el.value; });
      if (kind === 'entryType') state.filters.entryTypes = vals;
      else if (kind === 'city') state.filters.cities = vals;
      else if (kind === 'state') state.filters.states = vals;
      else if (kind === 'country') state.filters.countries = vals;
      closePop();
      state.page = 1;
      renderTable();
      if (document.getElementById('geofences-filters-drawer').classList.contains('is-open')) renderDrawer();
    };
    var input = pop.querySelector('[data-select-search]');
    var list = pop.querySelector('[data-select-list]');
    if (input && list) {
      input.oninput = function () {
        var q = input.value.trim().toLowerCase();
        list.querySelectorAll('.meter-select-item').forEach(function (item) {
          item.hidden = q && item.textContent.toLowerCase().indexOf(q) === -1;
        });
      };
      input.focus();
    }
  }

  function bindRadiusPop() {
    var pop = document.getElementById('geofences-filter-popover');
    var input = pop.querySelector('[data-radius-input]');
    var applyBtn = pop.querySelector('[data-popover-apply-radius]');
    pop.querySelector('[data-popover-cancel]').onclick = closePop;
    if (input && applyBtn) {
      input.oninput = function () {
        radiusDraft = input.value;
        applyBtn.disabled = input.value === '';
      };
      applyBtn.onclick = function () {
        if (applyBtn.disabled) return;
        state.filters.minRadius = parseInt(input.value, 10);
        closePop();
        state.page = 1;
        renderTable();
        if (document.getElementById('geofences-filters-drawer').classList.contains('is-open')) renderDrawer();
      };
      input.focus();
    }
  }

  function openPop(kind, anchor) {
    closeDrawer();
    closeTableSettings();
    var pop = document.getElementById('geofences-filter-popover');
    openFilter = kind;
    pop.classList.remove('is-date-popover', 'is-number-popover');

    if (kind === 'entryDate') {
      dateDraft = dateFilter.createDraftFromFilter(state.filters.entryDate);
      dateUi = { calMonth: dateFilter.parseIso(dateDraft.start), calPick: 'start' };
      pop.innerHTML = dateFilter.renderPopover(dateDraft, dateUi);
      pop.classList.add('is-date-popover');
      pop.hidden = false;
      anchor.classList.add('is-open');
      anchor.setAttribute('aria-expanded', 'true');
      positionPop(anchor, pop);
      dateFilter.bindPopover(pop, dateDraft, dateUi, {
        onCancel: closePop,
        onClear: function () {
          state.filters.entryDate = { active: false, start: null, end: null, preset: null };
          closePop();
          state.page = 1;
          renderTable();
          if (document.getElementById('geofences-filters-drawer').classList.contains('is-open')) renderDrawer();
        },
        onApply: function (applied) {
          state.filters.entryDate = { active: true, start: applied.start, end: applied.end, preset: applied.preset };
          closePop();
          state.page = 1;
          renderTable();
          if (document.getElementById('geofences-filters-drawer').classList.contains('is-open')) renderDrawer();
        }
      });
      return;
    }

    if (kind === 'radius') {
      radiusDraft = state.filters.minRadius != null ? String(state.filters.minRadius) : '';
      pop.innerHTML = radiusPopover(radiusDraft);
      pop.classList.add('is-number-popover');
      pop.hidden = false;
      anchor.classList.add('is-open');
      anchor.setAttribute('aria-expanded', 'true');
      positionPop(anchor, pop);
      bindRadiusPop();
      return;
    }

    if (kind === 'entryType') draft = state.filters.entryTypes.slice();
    else if (kind === 'city') draft = state.filters.cities.slice();
    else if (kind === 'state') draft = state.filters.states.slice();
    else if (kind === 'country') draft = state.filters.countries.slice();

    pop.innerHTML = kind === 'entryType' ? entryTypePopover(draft) : listPopover(kind, draft);
    pop.hidden = false;
    anchor.classList.add('is-open');
    anchor.setAttribute('aria-expanded', 'true');
    positionPop(anchor, pop);
    bindSelectPop(kind);
    initLucide(pop);
  }

  function openPopFromDrawer(kind) {
    var pill = document.querySelector('.geofences-panel .expense-filter-pill[data-filter="' + kind + '"]');
    if (pill) {
      openPop(kind, pill);
      return;
    }
    var fake = document.getElementById('geofences-filters-btn');
    if (fake) openPop(kind, fake);
  }

  function closeDrawer() {
    document.getElementById('geofences-filters-drawer').classList.remove('is-open');
    updatePills();
  }

  function openDrawer() {
    closePop();
    document.getElementById('geofences-filters-drawer').classList.add('is-open');
    renderDrawer();
    updatePills();
  }

  function renderDrawer() {
    var body = document.getElementById('geofences-filters-drawer-body');
    var f = state.filters;
    var applied = '';
    if (f.entryTypes.length) {
      applied += '<div class="expense-drawer-applied"><span>Location Entry Type</span><span>' + f.entryTypes.length + ' selected</span><button type="button" data-clear="entryType"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    }
    if (f.entryDate.active) {
      var dateLabel = f.entryDate.preset ? dateFilter.presetLabel(f.entryDate.preset) : (dateFilter.formatDate(f.entryDate.start) + ' – ' + dateFilter.formatDate(f.entryDate.end));
      applied += '<div class="expense-drawer-applied"><span>Location Entry Date</span><span>' + esc(dateLabel) + '</span><button type="button" data-clear="entryDate"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    }
    if (f.minRadius != null) {
      applied += '<div class="expense-drawer-applied"><span>Geofence Radius</span><span>≥ ' + esc(String(f.minRadius)) + ' m</span><button type="button" data-clear="radius"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    }
    if (f.cities.length) applied += '<div class="expense-drawer-applied"><span>Geofence City</span><span>' + f.cities.length + ' selected</span><button type="button" data-clear="city"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    if (f.states.length) applied += '<div class="expense-drawer-applied"><span>Geofence State/Province/Region</span><span>' + f.states.length + ' selected</span><button type="button" data-clear="state"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    if (f.countries.length) applied += '<div class="expense-drawer-applied"><span>Geofence Country</span><span>' + f.countries.length + ' selected</span><button type="button" data-clear="country"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';

    body.innerHTML = (filterCount() ? applied : '<p class="expense-drawer-empty">No filters applied.</p>') +
      '<button type="button" class="btn btn-primary btn-sm expense-drawer-add" id="geofences-drawer-add">Add Filter <span data-lucide-icon="chevronDown" data-lucide-icon-size="14" aria-hidden="true"></span></button>' +
      '<div class="expense-drawer-popular"><h3>Popular Filters</h3><ul class="expense-drawer-popular__list">' +
      data.popularFilters.map(function (p) {
        return '<li><button type="button" class="expense-drawer-popular__link" data-open="' + p.id + '">' + esc(p.label) + '</button></li>';
      }).join('') +
      '</ul></div>';

    body.querySelectorAll('[data-clear]').forEach(function (b) {
      b.onclick = function () {
        var k = b.getAttribute('data-clear');
        if (k === 'entryType') state.filters.entryTypes = [];
        else if (k === 'entryDate') state.filters.entryDate = { active: false, start: null, end: null, preset: null };
        else if (k === 'radius') state.filters.minRadius = null;
        else if (k === 'city') state.filters.cities = [];
        else if (k === 'state') state.filters.states = [];
        else if (k === 'country') state.filters.countries = [];
        state.page = 1;
        renderTable();
        renderDrawer();
      };
    });
    body.querySelectorAll('[data-open]').forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute('data-open');
        if (id === 'city' || id === 'state' || id === 'region') {
          openPopFromDrawer(id === 'region' ? 'state' : id);
        }
      };
    });
    document.getElementById('geofences-drawer-add').onclick = function () {
      openPopFromDrawer('entryType');
    };
    initLucide(body);
  }

  function closeTableSettings() {
    var el = document.getElementById('geofences-table-settings');
    if (el) el.hidden = true;
  }

  function openTableSettings(anchor) {
    closePop();
    var el = document.getElementById('geofences-table-settings');
    el.innerHTML = '<div class="meter-table-settings__section"><a href="#" class="meter-table-settings__manage">Manage Columns</a></div>';
    el.hidden = false;
    var rect = anchor.getBoundingClientRect();
    el.style.position = 'fixed';
    el.style.top = (rect.bottom + 4) + 'px';
    el.style.left = Math.max(8, rect.right - 200) + 'px';
    el.style.zIndex = '120';
  }

  function init() {
    if (document.body.getAttribute('data-page') !== 'geofences') return;
    if (!data) return;

    document.getElementById('geofences-search').addEventListener('input', function (e) {
      state.search = e.target.value;
      state.page = 1;
      renderTable();
    });

    document.querySelectorAll('.geofences-panel .expense-filter-pill').forEach(function (pill) {
      pill.addEventListener('click', function () {
        var kind = pill.getAttribute('data-filter');
        if (openFilter === kind && !document.getElementById('geofences-filter-popover').hidden) closePop();
        else openPop(kind, pill);
      });
    });

    document.getElementById('geofences-filters-btn').addEventListener('click', function () {
      var drawer = document.getElementById('geofences-filters-drawer');
      if (drawer.classList.contains('is-open')) closeDrawer();
      else openDrawer();
    });
    document.getElementById('geofences-filters-drawer-close').onclick = closeDrawer;

    document.querySelector('[data-page-prev]').addEventListener('click', function () {
      if (state.page > 1) { state.page--; renderTable(); }
    });
    document.querySelector('[data-page-next]').addEventListener('click', function () {
      var totalPages = Math.max(1, Math.ceil(filteredList().length / state.pageSize));
      if (state.page < totalPages) { state.page++; renderTable(); }
    });

    document.getElementById('geofences-table-settings-btn').addEventListener('click', function (e) {
      var el = document.getElementById('geofences-table-settings');
      if (!el.hidden) closeTableSettings();
      else openTableSettings(e.currentTarget);
    });

    document.getElementById('geofences-add-btn').addEventListener('click', function () {
      window.location.href = 'geofence-form';
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#geofences-filter-popover') && !e.target.closest('.geofences-panel .expense-filter-pill')) closePop();
      if (!e.target.closest('#geofences-table-settings') && !e.target.closest('#geofences-table-settings-btn')) closeTableSettings();
      if (!e.target.closest('#geofences-filters-drawer') &&
          !e.target.closest('#geofences-filters-btn') &&
          !e.target.closest('.geofences-panel .expense-filter-pill') &&
          !e.target.closest('#geofences-filter-popover')) {
        if (document.getElementById('geofences-filters-drawer').classList.contains('is-open')) closeDrawer();
      }
    });

    renderTable();
    initLucide(document.querySelector('.content--geofences'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
