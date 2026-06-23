(function () {
  'use strict';

  var data = window.YSOAM_DOCUMENTS;
  var vehicles = window.YSOAM_VEHICLES;

  var state = {
    docId: null,
    selected: [],
    browse: 'attached',
    search: '',
    onUpdate: null
  };

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function lucide(name, size) { return window.YSOAM_LUCIDE ? window.YSOAM_LUCIDE.icon(name, size || 16) : ''; }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }

  function activeVehicles() {
    return (vehicles.list || []).filter(function (v) { return v.assignment !== 'archived'; });
  }

  function vehicleGroups() {
    var map = {};
    activeVehicles().forEach(function (v) {
      if (v.group) map[v.group] = (map[v.group] || 0) + 1;
    });
    return Object.keys(map).sort().map(function (g) { return { id: g, label: g, count: map[g] }; });
  }

  function vehicleTypes() {
    var map = {};
    activeVehicles().forEach(function (v) {
      if (v.type) map[v.type] = (map[v.type] || 0) + 1;
    });
    return Object.keys(map).sort().map(function (t) { return { id: t, label: t, count: map[t] }; });
  }

  function ensureModal() {
    if (document.getElementById('doc-attach-modal')) return;
    var html =
      '<div class="modal-overlay" id="doc-attach-modal" role="dialog" aria-labelledby="doc-attach-title" aria-modal="true">' +
        '<div class="modal modal--doc-attach">' +
          '<div class="doc-attach-header">' +
            '<div class="doc-attach-header__icon" aria-hidden="true">' + lucide('car', 18) + '</div>' +
            '<div class="doc-attach-header__text">' +
              '<h2 class="modal__title" id="doc-attach-title">Attach Document to Vehicles</h2>' +
              '<p class="doc-attach-header__subtitle" id="doc-attach-subtitle"></p>' +
            '</div>' +
            '<button type="button" class="modal__close" id="doc-attach-close" aria-label="Close">' + lucide('x', 18) + '</button>' +
          '</div>' +
          '<div class="doc-attach-search">' +
            '<span class="doc-attach-search__icon" data-lucide-icon="search" aria-hidden="true"></span>' +
            '<input type="search" class="text-input" id="doc-attach-search" placeholder="Find vehicles, types, groups, and more…" aria-label="Search vehicles">' +
          '</div>' +
          '<div class="doc-attach-body">' +
            '<nav class="doc-attach-nav" id="doc-attach-nav"></nav>' +
            '<div class="doc-attach-content" id="doc-attach-content"></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById('doc-attach-close').onclick = close;
    document.getElementById('doc-attach-modal').addEventListener('click', function (e) {
      if (e.target.id === 'doc-attach-modal') close();
    });
    document.getElementById('doc-attach-search').addEventListener('input', function (e) {
      state.search = e.target.value;
      renderContent();
    });
  }

  function saveSelection() {
    if (!state.docId) return;
    data.setAttachedVehicles(state.docId, state.selected);
    if (state.onUpdate) state.onUpdate(state.docId);
  }

  function toggleVehicle(id) {
    var idx = state.selected.indexOf(id);
    if (idx === -1) state.selected.push(id);
    else state.selected.splice(idx, 1);
    saveSelection();
    renderNav();
    renderContent();
  }

  function renderNav() {
    var nav = document.getElementById('doc-attach-nav');
    if (!nav) return;
    var all = activeVehicles();
    var groups = vehicleGroups();
    var types = vehicleTypes();
    nav.innerHTML =
      '<button type="button" class="doc-attach-nav__item' + (state.browse === 'attached' ? ' is-active' : '') + '" data-browse="attached">' +
        '<span class="doc-attach-nav__item-icon">' + lucide('paperclip', 16) + '</span>' +
        '<span>Attached Vehicles</span>' +
        '<span class="doc-attach-nav__badge">' + state.selected.length + '</span>' +
      '</button>' +
      '<div class="doc-attach-nav__section">Browse</div>' +
      '<button type="button" class="doc-attach-nav__item' + (state.browse === 'all' ? ' is-active' : '') + '" data-browse="all">' +
        '<span>All Vehicles</span><span class="doc-attach-nav__count">' + all.length + '</span>' +
      '</button>' +
      '<button type="button" class="doc-attach-nav__item' + (state.browse === 'types' ? ' is-active' : '') + '" data-browse="types">' +
        '<span>Vehicle Types</span><span class="doc-attach-nav__count">' + types.length + '</span>' +
      '</button>' +
      '<button type="button" class="doc-attach-nav__item' + (state.browse === 'groups' ? ' is-active' : '') + '" data-browse="groups">' +
        '<span>Groups</span><span class="doc-attach-nav__count">' + groups.length + '</span>' +
      '</button>';

    nav.querySelectorAll('[data-browse]').forEach(function (btn) {
      btn.onclick = function () {
        state.browse = btn.getAttribute('data-browse');
        renderNav();
        renderContent();
      };
    });
    initLucide(nav);
  }

  function vehicleRow(v) {
    var checked = state.selected.indexOf(v.id) !== -1;
    return '<label class="doc-attach-vehicle">' +
      '<input type="checkbox" data-vehicle-id="' + escA(v.id) + '"' + (checked ? ' checked' : '') + '>' +
      '<img src="' + escA(v.image) + '" alt="" class="doc-attach-vehicle__thumb">' +
      '<span class="doc-attach-vehicle__text"><strong>' + esc(v.name) + '</strong><small>' + esc(v.type) + ' · ' + esc(v.group) + '</small></span>' +
    '</label>';
  }

  function filterVehicles(list) {
    var q = state.search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(function (v) {
      return [v.id, v.name, v.type, v.group, v.make, v.model].join(' ').toLowerCase().indexOf(q) !== -1;
    });
  }

  function renderContent() {
    var root = document.getElementById('doc-attach-content');
    var doc = data.getById(state.docId);
    if (!root || !doc) return;

    var html = '';
    if (state.browse === 'attached') {
      if (!state.selected.length) {
        html = '<div class="doc-attach-empty">' +
          '<span class="doc-attach-empty__icon" aria-hidden="true">' + lucide('car', 48) + '</span>' +
          '<h3>No Vehicles Attached</h3>' +
          '<p>' + esc(doc.fileName) + ' is not currently attached to any vehicles</p>' +
          '<button type="button" class="btn btn-text btn-sm doc-attach-load-more" data-browse-all>Browse All Vehicles</button>' +
        '</div>';
      } else {
        var attached = activeVehicles().filter(function (v) { return state.selected.indexOf(v.id) !== -1; });
        attached = filterVehicles(attached);
        html = '<div class="doc-attach-list">' + attached.map(vehicleRow).join('') + '</div>';
      }
    } else if (state.browse === 'all') {
      var all = filterVehicles(activeVehicles());
      html = all.length
        ? '<div class="doc-attach-list">' + all.map(vehicleRow).join('') + '</div>'
        : '<div class="doc-attach-empty"><p>No vehicles match your search.</p></div>';
    } else if (state.browse === 'types') {
      var types = vehicleTypes().filter(function (t) {
        return !state.search.trim() || t.label.toLowerCase().indexOf(state.search.trim().toLowerCase()) !== -1;
      });
      html = '<div class="doc-attach-browse-list">' + types.map(function (t) {
        return '<button type="button" class="doc-attach-browse-item" data-type="' + escA(t.id) + '"><span>' + esc(t.label) + '</span><span>' + t.count + '</span></button>';
      }).join('') + '</div>';
    } else if (state.browse === 'groups') {
      var groups = vehicleGroups().filter(function (g) {
        return !state.search.trim() || g.label.toLowerCase().indexOf(state.search.trim().toLowerCase()) !== -1;
      });
      html = '<div class="doc-attach-browse-list">' + groups.map(function (g) {
        return '<button type="button" class="doc-attach-browse-item" data-group="' + escA(g.id) + '"><span>' + esc(g.label) + '</span><span>' + g.count + '</span></button>';
      }).join('') + '</div>';
    }

    root.innerHTML = html;

    root.querySelector('[data-browse-all]') && root.querySelector('[data-browse-all]').addEventListener('click', function () {
      state.browse = 'all';
      renderNav();
      renderContent();
    });

    root.querySelectorAll('[data-vehicle-id]').forEach(function (input) {
      input.addEventListener('change', function () {
        toggleVehicle(input.getAttribute('data-vehicle-id'));
      });
    });

    root.querySelectorAll('[data-type]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.browse = 'all';
        state.search = btn.getAttribute('data-type');
        document.getElementById('doc-attach-search').value = state.search;
        renderNav();
        renderContent();
      });
    });

    root.querySelectorAll('[data-group]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.browse = 'all';
        state.search = btn.getAttribute('data-group');
        document.getElementById('doc-attach-search').value = state.search;
        renderNav();
        renderContent();
      });
    });

    initLucide(root);
  }

  function open(docId, onUpdate) {
    ensureModal();
    var doc = data.getById(docId);
    if (!doc) return;
    state.docId = docId;
    state.selected = (doc.attachedVehicles || []).slice();
    state.browse = 'attached';
    state.search = '';
    state.onUpdate = onUpdate || null;
    document.getElementById('doc-attach-subtitle').textContent = doc.fileName;
    document.getElementById('doc-attach-search').value = '';
    renderNav();
    renderContent();
    initLucide(document.getElementById('doc-attach-modal'));
    document.getElementById('doc-attach-modal').classList.add('is-open');
  }

  function close() {
    var modal = document.getElementById('doc-attach-modal');
    if (modal) modal.classList.remove('is-open');
    state.docId = null;
    state.onUpdate = null;
  }

  window.YSOAM_DOC_ATTACH = { open: open, close: close };
})();
