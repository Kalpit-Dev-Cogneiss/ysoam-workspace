(function () {
  'use strict';

  var data = window.YSOAM_DOCUMENTS;

  var POPULAR = [
    { id: 'locationType', label: 'Document Location Type' },
    { id: 'fileType', label: 'Document File Type' },
    { id: 'classification', label: 'Document Classification' }
  ];

  var state = {
    tab: 'all',
    search: '',
    page: 1,
    pageSize: 50,
    filters: {
      fileTypes: [],
      locationTypes: [],
      classifications: []
    }
  };

  var draft = null;
  var openFilter = null;

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function lucide(name, size) { return window.YSOAM_LUCIDE ? window.YSOAM_LUCIDE.icon(name, size || 16) : ''; }
  function rowIcon(key) { return window.YSOAM_ICONS && window.YSOAM_ICONS[key] ? window.YSOAM_ICONS[key] : ''; }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }

  function dashCell() { return '<span class="doc-cell-empty">—</span>'; }

  function compactColClass(hasData) { return hasData ? '' : ' doc-col-compact'; }

  function columnDataFlags(rows) {
    return {
      autoDelete: rows.some(function (r) { return r.autoDelete; }),
      labels: rows.some(function (r) { return r.labels && r.labels.length; })
    };
  }

  function filterCount() {
    var f = state.filters;
    var n = 0;
    if (f.fileTypes.length) n++;
    if (f.locationTypes.length) n++;
    if (f.classifications.length) n++;
    return n;
  }

  function filteredList() {
    var q = state.search.trim().toLowerCase();
    var f = state.filters;
    return data.list.filter(function (row) {
      if (state.tab === 'ysoam' && row.folder !== 'YSOAM') return false;
      if (f.fileTypes.length && f.fileTypes.indexOf(row.fileType) === -1) return false;
      if (f.locationTypes.length && f.locationTypes.indexOf(row.locationType) === -1) return false;
      if (f.classifications.length && f.classifications.indexOf(row.classification) === -1) return false;
      if (q) {
        var hay = [
          row.fileName, row.folder, row.locationTypeLabel, row.classificationLabel,
          row.labels && row.labels.join(' '),
          row.attachedVehicles && row.attachedVehicles.join(' ')
        ].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function fileIcon(ext) {
    var colors = {
      pdf: '#dc2626', docx: '#2563eb', doc: '#2563eb', rtf: '#2563eb',
      csv: '#16a34a', txt: '#64748b', html: '#ea580c', jpg: '#7c3aed',
      png: '#7c3aed', mp4: '#db2777', zip: '#ca8a04'
    };
    var c = colors[ext] || '#64748b';
    return '<span class="doc-file-icon" style="color:' + c + '" aria-hidden="true">' + lucide('fileText', 18) + '</span>';
  }

  function folderCell(folder) {
    return '<span class="doc-folder-cell"><span class="doc-folder-icon" aria-hidden="true">' + lucide('folder', 14) + '</span>' + esc(folder) + '</span>';
  }

  function attachedCell(row) {
    if (!row.attachedVehicles || !row.attachedVehicles.length) {
      return '<button type="button" class="table-cell-link doc-select-vehicles" data-doc-select="' + escA(row.id) + '">Select Vehicles</button>';
    }
    return row.attachedVehicles.map(function (id) {
      return '<a href="vehicles?id=' + escA(id) + '" class="table-cell-link">' + esc(id) + '</a>';
    }).join(', ') + ' <button type="button" class="table-cell-link doc-select-vehicles doc-select-vehicles--edit" data-doc-select="' + escA(row.id) + '">Edit</button>';
  }

  function labelsCell(row) {
    if (!row.labels || !row.labels.length) return dashCell();
    return row.labels.map(function (l) {
      return '<span class="doc-label-tag">' + esc(l) + '</span>';
    }).join(' ');
  }

  function rowActionsMenu(row) {
    return (
      '<div class="row-actions" data-row-actions="' + escA(row.id) + '">' +
        '<button type="button" class="row-actions__trigger" aria-label="More actions for ' + escA(row.fileName) + '" aria-haspopup="menu" aria-expanded="false">' +
          '<span class="row-actions__dots" aria-hidden="true"></span>' +
        '</button>' +
        '<div class="row-actions__menu" role="menu" hidden>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="view" role="menuitem">View <span class="row-actions__item-icon">' + rowIcon('actionView') + '</span></button>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="rename" role="menuitem">Rename <span class="row-actions__item-icon">' + rowIcon('actionEdit') + '</span></button>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="replace" role="menuitem">Replace <span class="row-actions__item-icon">' + lucide('folderInput', 16) + '</span></button>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="download" role="menuitem">Download <span class="row-actions__item-icon">' + lucide('download', 16) + '</span></button>' +
          '<div class="row-actions__divider" role="separator"></div>' +
          '<button type="button" class="row-actions__item row-actions__item--btn row-actions__item--danger" data-action="delete" role="menuitem">Delete <span class="row-actions__item-icon">' + rowIcon('actionDelete') + '</span></button>' +
        '</div>' +
      '</div>'
    );
  }

  function closeAllRowMenus() {
    document.querySelectorAll('.documents-panel .row-actions__menu').forEach(function (m) {
      m.hidden = true;
      m.style.position = '';
      m.style.top = '';
      m.style.left = '';
    });
    document.querySelectorAll('.documents-panel .row-actions__trigger').forEach(function (b) {
      b.setAttribute('aria-expanded', 'false');
    });
  }

  function positionRowMenu(trigger, menu) {
    var rect = trigger.getBoundingClientRect();
    menu.hidden = false;
    menu.style.position = 'fixed';
    menu.style.top = (rect.bottom + 4) + 'px';
    menu.style.left = Math.max(8, rect.right - 188) + 'px';
    menu.style.zIndex = '120';
  }

  function bindRowActions() {
    document.querySelectorAll('.documents-panel .row-actions').forEach(function (wrap) {
      if (wrap.getAttribute('data-bound')) return;
      wrap.setAttribute('data-bound', '1');
      wrap.addEventListener('click', function (e) { e.stopPropagation(); });
    });

    document.querySelectorAll('.documents-panel .row-actions__trigger').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var menu = btn.closest('.row-actions').querySelector('.row-actions__menu');
        var willOpen = menu.hidden;
        closeAllRowMenus();
        if (willOpen) { positionRowMenu(btn, menu); btn.setAttribute('aria-expanded', 'true'); }
      });
    });

    var actions = {
      rename: 'Rename document (prototype demo).',
      replace: 'Replace document (prototype demo).',
      download: 'Download document (prototype demo).',
      delete: 'Delete document (prototype demo).'
    };
    Object.keys(actions).forEach(function (action) {
      document.querySelectorAll('.documents-panel [data-action="' + action + '"]').forEach(function (btn) {
        if (btn.getAttribute('data-bound')) return;
        btn.setAttribute('data-bound', '1');
        btn.addEventListener('click', function () {
          closeAllRowMenus();
          window.alert(actions[action]);
        });
      });
    });

    document.querySelectorAll('.documents-panel [data-action="view"]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        var rowId = btn.closest('[data-row-actions]').getAttribute('data-row-actions');
        closeAllRowMenus();
        window.location.href = 'document-view?id=' + encodeURIComponent(rowId);
      });
    });

    document.querySelectorAll('.doc-select-vehicles').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        var docId = btn.getAttribute('data-doc-select');
        window.YSOAM_DOC_ATTACH.open(docId, function () { renderTable(); });
      });
    });
  }

  function renderTable() {
    var root = document.getElementById('documents-table');
    var countEl = document.getElementById('doc-count');
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

    var cols = columnDataFlags(all);

    var html = '<table class="data-table data-table--list data-table--documents"><thead><tr>' +
      '<th class="data-table__check-col"><input type="checkbox" aria-label="Select all"></th>' +
      '<th class="doc-col-name">File Name</th>' +
      '<th class="doc-col-size">File Size</th>' +
      '<th class="doc-col-created">Created At</th>' +
      '<th class="doc-col-folder">Location</th>' +
      '<th class="doc-col-auto' + compactColClass(cols.autoDelete) + '">Auto-Delete</th>' +
      '<th class="doc-col-attached">Attached To</th>' +
      '<th class="doc-col-labels' + compactColClass(cols.labels) + '">Labels</th>' +
      '<th class="data-table__actions-col" aria-label="Actions"></th>' +
      '</tr></thead><tbody>';

    if (!rows.length) {
      html += '<tr><td colspan="9" class="service-history-empty">No documents found</td></tr>';
    } else {
      rows.forEach(function (row) {
        html += '<tr>' +
          '<td class="data-table__check-col"><input type="checkbox" aria-label="Select row"></td>' +
          '<td class="doc-col-name"><span class="doc-file-name">' + fileIcon(row.ext) +
            '<a href="#" class="table-cell-link doc-file-link" data-doc-view="' + escA(row.id) + '">' + esc(row.fileName) + '</a></span></td>' +
          '<td class="doc-col-size tabular-nums">' + esc(row.sizeLabel) + '</td>' +
          '<td class="doc-col-created">' + esc(row.createdLabel) + '</td>' +
          '<td class="doc-col-folder">' + folderCell(row.folder) + '</td>' +
          '<td class="doc-col-auto' + compactColClass(cols.autoDelete) + '">' + (row.autoDelete ? esc(row.autoDelete) : dashCell()) + '</td>' +
          '<td class="doc-col-attached">' + attachedCell(row) + '</td>' +
          '<td class="doc-col-labels' + compactColClass(cols.labels) + '">' + labelsCell(row) + '</td>' +
          '<td class="data-table__actions-col">' + rowActionsMenu(row) + '</td>' +
          '</tr>';
      });
    }
    html += '</tbody></table>';
    root.innerHTML = html;
    bindRowActions();
    root.querySelectorAll('[data-doc-view]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = 'document-view?id=' + encodeURIComponent(link.getAttribute('data-doc-view'));
      });
    });
    updatePills();
  }

  function updatePills() {
    var f = state.filters;
    document.querySelectorAll('.documents-panel .expense-filter-pill').forEach(function (btn) {
      var k = btn.getAttribute('data-filter');
      var on = (k === 'fileType' && f.fileTypes.length) ||
        (k === 'locationType' && f.locationTypes.length);
      btn.classList.toggle('has-filter', !!on);
    });
    var btn = document.getElementById('doc-filters-btn');
    var lbl = document.getElementById('doc-filters-btn-label');
    if (btn) {
      var n = filterCount();
      var open = document.getElementById('doc-filters-drawer').classList.contains('is-open');
      btn.classList.toggle('is-active', n > 0 || open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (lbl) lbl.textContent = n > 0 ? n + ' Filter' + (n === 1 ? '' : 's') : 'Filters';
    }
  }

  function closePop() {
    var p = document.getElementById('doc-filter-popover');
    if (p) p.hidden = true;
    document.querySelectorAll('.documents-panel .expense-filter-pill').forEach(function (b) {
      b.classList.remove('is-open');
      b.setAttribute('aria-expanded', 'false');
    });
    openFilter = null;
    draft = null;
  }

  function positionPop(anchor, pop) {
    var panel = document.querySelector('.documents-panel');
    if (!panel) return;
    var pr = panel.getBoundingClientRect();
    var r = anchor.getBoundingClientRect();
    pop.style.top = (r.bottom - pr.top + 6) + 'px';
    var w = pop.offsetWidth || 360;
    pop.style.left = Math.max(8, Math.min(r.left - pr.left, pr.width - w - 8)) + 'px';
  }

  function optionsHtml(items, selected, valueKey) {
    valueKey = valueKey || 'id';
    return items.map(function (item) {
      var checked = selected.indexOf(item[valueKey]) !== -1;
      return '<label class="meter-select-item"><input type="checkbox" value="' + escA(item[valueKey]) + '"' +
        (checked ? ' checked' : '') + '><span>' + esc(item.label) + '</span></label>';
    }).join('');
  }

  function selectPopover(kind, selected) {
    var list = '';
    if (kind === 'fileType') list = optionsHtml(data.fileTypes, selected);
    else if (kind === 'locationType') list = optionsHtml(data.locationTypes, selected);
    else if (kind === 'classification') list = optionsHtml(data.classifications, selected);
    return '<div class="meter-popover meter-popover--select"><div class="meter-popover__search"><span data-lucide-icon="search" aria-hidden="true"></span>' +
      '<input type="search" class="meter-popover__search-input" placeholder="Select item(s)" data-select-search></div>' +
      '<div class="meter-popover__list" data-select-list>' + list + '</div>' +
      '<div class="meter-popover__footer"><div class="meter-popover__footer-right">' +
      '<button type="button" class="btn btn-text btn-sm" data-popover-cancel>Cancel</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-popover-apply>Apply</button></div></div></div>';
  }

  function bindPop(kind) {
    var pop = document.getElementById('doc-filter-popover');
    pop.querySelector('[data-popover-cancel]').onclick = closePop;
    pop.querySelector('[data-popover-apply]').onclick = function () {
      var vals = Array.prototype.map.call(pop.querySelectorAll('[data-select-list] input:checked'), function (el) { return el.value; });
      if (kind === 'fileType') state.filters.fileTypes = vals;
      else if (kind === 'locationType') state.filters.locationTypes = vals;
      else if (kind === 'classification') state.filters.classifications = vals;
      closePop();
      state.page = 1;
      renderTable();
      if (document.getElementById('doc-filters-drawer').classList.contains('is-open')) renderDrawer();
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

  function openPop(kind, anchor) {
    closeDrawer();
    closeTableSettings();
    var pop = document.getElementById('doc-filter-popover');
    openFilter = kind;
    if (kind === 'fileType') draft = state.filters.fileTypes.slice();
    else if (kind === 'locationType') draft = state.filters.locationTypes.slice();
    else if (kind === 'classification') draft = state.filters.classifications.slice();
    pop.innerHTML = selectPopover(kind, draft);
    pop.hidden = false;
    anchor.classList.add('is-open');
    anchor.setAttribute('aria-expanded', 'true');
    positionPop(anchor, pop);
    bindPop(kind);
    initLucide(pop);
  }

  function closeDrawer() {
    document.getElementById('doc-filters-drawer').classList.remove('is-open');
    updatePills();
  }

  function openDrawer() {
    closePop();
    document.getElementById('doc-filters-drawer').classList.add('is-open');
    renderDrawer();
    updatePills();
  }

  function renderDrawer() {
    var body = document.getElementById('doc-filters-drawer-body');
    var f = state.filters;
    var applied = '';
    if (f.fileTypes.length) applied += '<div class="expense-drawer-applied"><span>Document File Type</span><span>' + f.fileTypes.length + ' selected</span><button type="button" data-clear="fileType"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    if (f.locationTypes.length) applied += '<div class="expense-drawer-applied"><span>Document Location Type</span><span>' + f.locationTypes.length + ' selected</span><button type="button" data-clear="locationType"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    if (f.classifications.length) applied += '<div class="expense-drawer-applied"><span>Document Classification</span><span>' + f.classifications.length + ' selected</span><button type="button" data-clear="classification"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';

    body.innerHTML = (filterCount() ? applied : '<p class="expense-drawer-empty">No filters applied.</p>') +
      '<button type="button" class="btn btn-primary btn-sm expense-drawer-add" id="doc-drawer-add">Add Filter <span data-lucide-icon="chevronDown" data-lucide-icon-size="14" aria-hidden="true"></span></button>' +
      '<div class="expense-drawer-popular"><h3>Popular Filters</h3><ul class="expense-drawer-popular__list">' +
      POPULAR.map(function (p) { return '<li><button type="button" class="expense-drawer-popular__link" data-open="' + p.id + '">' + esc(p.label) + '</button></li>'; }).join('') +
      '</ul></div>';

    body.querySelectorAll('[data-clear]').forEach(function (b) {
      b.onclick = function () {
        var k = b.getAttribute('data-clear');
        if (k === 'fileType') state.filters.fileTypes = [];
        else if (k === 'locationType') state.filters.locationTypes = [];
        else if (k === 'classification') state.filters.classifications = [];
        state.page = 1;
        renderTable();
      };
    });
    body.querySelectorAll('[data-open]').forEach(function (b) {
      b.onclick = function () {
        var filter = b.getAttribute('data-open');
        var pill = document.querySelector('.documents-panel .expense-filter-pill[data-filter="' + filter + '"]') ||
          document.getElementById('doc-filters-btn');
        openPop(filter, pill);
      };
    });
    document.getElementById('doc-drawer-add').onclick = function () {
      var pill = document.querySelector('.documents-panel .expense-filter-pill[data-filter="fileType"]');
      if (pill) openPop('fileType', pill);
    };
    initLucide(body);
  }

  function closeTableSettings() {
    var el = document.getElementById('doc-table-settings');
    if (el) el.hidden = true;
  }

  function openTableSettings(anchor) {
    closePop();
    var el = document.getElementById('doc-table-settings');
    el.innerHTML = '<div class="meter-table-settings__section"><a href="#" class="meter-table-settings__manage">Manage Columns</a></div>' +
      '<div class="meter-table-settings__section"><div class="meter-table-settings__title">Items Per Page</div>' +
      [50, 100, 200].map(function (n) {
        return '<label class="meter-settings-option"><input type="radio" name="doc-page-size" value="' + n + '"' + (state.pageSize === n ? ' checked' : '') + '> ' + n + '</label>';
      }).join('') + '</div>';
    el.hidden = false;
    positionPop(anchor, el);
    el.querySelectorAll('input[name="doc-page-size"]').forEach(function (r) {
      r.onchange = function () { state.pageSize = parseInt(r.value, 10); state.page = 1; renderTable(); };
    });
  }

  function setTab(tab) {
    state.tab = tab;
    state.page = 1;
    document.querySelectorAll('.documents-tabs .st-view-tab[data-tab]').forEach(function (b) {
      var on = b.getAttribute('data-tab') === tab;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    renderTable();
  }

  function openUploadModal() {
    document.getElementById('doc-upload-modal').classList.add('is-open');
  }

  function closeUploadModal() {
    document.getElementById('doc-upload-modal').classList.remove('is-open');
    document.getElementById('doc-upload-input').value = '';
    document.getElementById('doc-upload-dropzone').classList.remove('has-files', 'is-dragover');
  }

  function bindUploadModal() {
    var modal = document.getElementById('doc-upload-modal');
    var dropzone = document.getElementById('doc-upload-dropzone');
    var input = document.getElementById('doc-upload-input');

    document.getElementById('doc-upload-btn').onclick = openUploadModal;
    document.getElementById('doc-upload-close').onclick = closeUploadModal;
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeUploadModal();
    });

    dropzone.addEventListener('dragover', function (e) {
      e.preventDefault();
      dropzone.classList.add('is-dragover');
    });
    dropzone.addEventListener('dragleave', function () {
      dropzone.classList.remove('is-dragover');
    });
    dropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropzone.classList.remove('is-dragover');
      if (e.dataTransfer && e.dataTransfer.files.length) {
        input.files = e.dataTransfer.files;
        dropzone.classList.add('has-files');
      }
    });
    input.addEventListener('change', function () {
      dropzone.classList.toggle('has-files', input.files && input.files.length > 0);
      if (input.files && input.files.length) {
        closeUploadModal();
        window.alert('Uploaded ' + input.files.length + ' file(s) (prototype demo).');
      }
    });
  }

  function init() {
    if (document.body.getAttribute('data-page') !== 'documents') return;
    initLucide();

    document.getElementById('doc-search').oninput = function (e) {
      state.search = e.target.value;
      state.page = 1;
      renderTable();
    };

    document.querySelectorAll('.documents-panel .expense-filter-pill').forEach(function (btn) {
      btn.onclick = function () {
        var k = btn.getAttribute('data-filter');
        if (openFilter === k && !document.getElementById('doc-filter-popover').hidden) closePop();
        else openPop(k, btn);
      };
    });

    document.getElementById('doc-filters-btn').onclick = function () {
      if (document.getElementById('doc-filters-drawer').classList.contains('is-open')) closeDrawer();
      else openDrawer();
    };
    document.getElementById('doc-filters-drawer-close').onclick = closeDrawer;

    document.getElementById('doc-pagination').querySelector('[data-page-prev]').onclick = function () {
      if (state.page > 1) { state.page--; renderTable(); }
    };
    document.getElementById('doc-pagination').querySelector('[data-page-next]').onclick = function () {
      var tp = Math.max(1, Math.ceil(filteredList().length / state.pageSize));
      if (state.page < tp) { state.page++; renderTable(); }
    };

    document.getElementById('doc-table-settings-btn').onclick = function (e) {
      var el = document.getElementById('doc-table-settings');
      if (!el.hidden) closeTableSettings();
      else openTableSettings(e.currentTarget);
    };

    document.querySelectorAll('.documents-tabs .st-view-tab[data-tab]').forEach(function (b) {
      b.onclick = function () { setTab(b.getAttribute('data-tab')); };
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#doc-filter-popover') && !e.target.closest('.documents-panel .expense-filter-pill')) closePop();
      if (!e.target.closest('#doc-table-settings') && !e.target.closest('#doc-table-settings-btn')) closeTableSettings();
      if (!e.target.closest('.documents-panel [data-row-actions]')) closeAllRowMenus();
    });

    bindUploadModal();
    renderTable();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
