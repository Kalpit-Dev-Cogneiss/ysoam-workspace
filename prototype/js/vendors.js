(function () {
  'use strict';

  var data = window.YSOAM_VENDORS;

  var state = {
    tab: 'all',
    search: '',
    page: 1,
    pageSize: 15,
    sortName: 'asc',
    filters: {
      classifications: [],
      contactName: '',
      contactPhone: '',
      labels: []
    }
  };

  var openFilter = null;
  var textDraft = '';

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function lucide(name, size) { return window.YSOAM_LUCIDE ? window.YSOAM_LUCIDE.icon(name, size || 16) : ''; }
  function rowIcon(key) { return window.YSOAM_ICONS && window.YSOAM_ICONS[key] ? window.YSOAM_ICONS[key] : ''; }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }

  function dashCell() { return '<span class="vendors-cell-empty">—</span>'; }

  function filterCount() {
    var f = state.filters;
    var n = 0;
    if (f.classifications.length) n++;
    if (f.contactName) n++;
    if (f.contactPhone) n++;
    if (f.labels.length) n++;
    return n;
  }

  function filteredList() {
    var q = state.search.trim().toLowerCase();
    var f = state.filters;
    return data.list.filter(function (row) {
      if (state.tab === 'archived') {
        if (!row.archived) return false;
      } else {
        if (row.archived) return false;
        if (state.tab !== 'all' && !data.hasClassification(row, state.tab)) return false;
      }
      if (f.classifications.length && !f.classifications.some(function (c) { return data.hasClassification(row, c); })) return false;
      if (f.contactName && row.contactName.toLowerCase().indexOf(f.contactName.toLowerCase()) === -1) return false;
      if (f.contactPhone && row.phone.indexOf(f.contactPhone) === -1) return false;
      if (f.labels.length) {
        var has = f.labels.some(function (l) { return row.labels.indexOf(l) !== -1; });
        if (!has) return false;
      }
      if (q) {
        var hay = [
          row.name, row.address, row.phone, row.website, row.contactName, row.contactEmail
        ].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    }).sort(function (a, b) {
      var cmp = a.name.localeCompare(b.name);
      return state.sortName === 'asc' ? cmp : -cmp;
    });
  }

  function addressHtml(addr) {
    if (!addr) return dashCell();
    var parts = String(addr).split('\n').map(function (p) { return p.trim(); }).filter(Boolean);
    var line1 = parts[0] || '';
    var line2 = parts.slice(1).join(', ');
    if (!line1 && line2) {
      line1 = line2;
      line2 = '';
    }
    return '<span class="vendors-address">' +
      '<span class="vendors-address__line1">' + esc(line1) + '</span>' +
      (line2 ? '<span class="vendors-address__line2">' + esc(line2) + '</span>' : '') +
      '</span>';
  }

  function nameCell(row) {
    var badge = row.sample ? ' <span class="vendors-sample-badge">Sample</span>' : '';
    return '<span class="vendors-name-cell"><span class="vendors-name">' + esc(row.name) + '</span>' + badge + '</span>';
  }

  function linkCell(href, text) {
    if (!text) return dashCell();
    return '<a href="' + escA(href) + '" class="table-cell-link vendors-link" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">' + esc(text) + '</a>';
  }

  function labelsCell(labels) {
    if (!labels || !labels.length) return dashCell();
    return labels.map(function (l) { return '<span class="vendors-label-tag">' + esc(l) + '</span>'; }).join(' ');
  }

  function rowActionsMenu(row) {
    var editUrl = 'vendor-form?id=' + encodeURIComponent(row.id);
    return (
      '<div class="row-actions" data-row-actions="' + escA(row.id) + '">' +
        '<button type="button" class="row-actions__trigger" aria-label="More actions for ' + escA(row.name) + '" aria-haspopup="menu" aria-expanded="false">' +
          '<span class="row-actions__dots" aria-hidden="true"></span>' +
        '</button>' +
        '<div class="row-actions__menu" role="menu" hidden>' +
          '<a class="row-actions__item" href="vendor-view?id=' + encodeURIComponent(row.id) + '" role="menuitem">View <span class="row-actions__item-icon">' + rowIcon('actionView') + '</span></a>' +
          '<a class="row-actions__item" href="' + editUrl + '" role="menuitem">Edit <span class="row-actions__item-icon">' + rowIcon('actionEdit') + '</span></a>' +
          '<span class="row-actions__item row-actions__item--disabled" role="menuitem" aria-disabled="true">Merge <span class="row-actions__item-icon">' + lucide('lock', 16) + '</span></span>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="archive" role="menuitem">Archive <span class="row-actions__item-icon">' + lucide('archive', 16) + '</span></button>' +
        '</div>' +
      '</div>'
    );
  }

  function closeAllRowMenus() {
    document.querySelectorAll('.vendors-panel .row-actions__menu').forEach(function (m) {
      m.hidden = true;
      m.style.position = '';
      m.style.top = '';
      m.style.left = '';
    });
    document.querySelectorAll('.vendors-panel .row-actions__trigger').forEach(function (b) {
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
    document.querySelectorAll('.vendors-panel .row-actions').forEach(function (wrap) {
      if (wrap.getAttribute('data-bound')) return;
      wrap.setAttribute('data-bound', '1');
      wrap.addEventListener('click', function (e) { e.stopPropagation(); });
    });

    document.querySelectorAll('.vendors-panel .row-actions__trigger').forEach(function (btn) {
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

    document.querySelectorAll('.vendors-panel [data-action]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        closeAllRowMenus();
        var action = btn.getAttribute('data-action');
        if (action === 'archive') {
          window.alert('Archive vendor (prototype demo).');
        }
      });
    });
  }

  function renderTable() {
    var root = document.getElementById('vendors-table');
    var countEl = document.getElementById('vendors-count');
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

    var sortIcon = state.sortName === 'asc' ? 'arrowUp' : 'arrowDown';

    var html = '<table class="data-table data-table--list data-table--vendors"><thead><tr>' +
      '<th class="data-table__check-col"><input type="checkbox" aria-label="Select all"></th>' +
      '<th class="vendors-col-name">Name <span class="vendors-sort-icon" data-lucide-icon="' + sortIcon + '" data-lucide-icon-size="12" aria-hidden="true"></span></th>' +
      '<th class="vendors-col-address">Full Address</th>' +
      '<th class="vendors-col-phone">Phone</th>' +
      '<th class="vendors-col-website">Website</th>' +
      '<th class="vendors-col-contact">Contact Name</th>' +
      '<th class="vendors-col-email">Contact Email</th>' +
      '<th class="vendors-col-labels">Labels</th>' +
      '<th class="vendors-col-rating">Rating</th>' +
      '<th class="vendors-col-archived">Archived At</th>' +
      '<th class="data-table__actions-col" aria-label="Actions"></th>' +
      '</tr></thead><tbody>';

    if (!rows.length) {
      html += '<tr><td colspan="11" class="service-history-empty">No vendors found</td></tr>';
    } else {
      rows.forEach(function (row) {
        html += '<tr class="vendors-row" data-vendor-id="' + escA(row.id) + '">' +
          '<td class="data-table__check-col"><input type="checkbox" aria-label="Select row" onclick="event.stopPropagation()"></td>' +
          '<td class="vendors-col-name">' + nameCell(row) + '</td>' +
          '<td class="vendors-col-address">' + addressHtml(row.address) + '</td>' +
          '<td class="vendors-col-phone">' + linkCell('tel:' + row.phone.replace(/[^\d+]/g, ''), row.phone) + '</td>' +
          '<td class="vendors-col-website">' + linkCell(row.website, row.website) + '</td>' +
          '<td class="vendors-col-contact">' + (row.contactName ? esc(row.contactName) : dashCell()) + '</td>' +
          '<td class="vendors-col-email">' + (row.contactEmail ? esc(row.contactEmail) : dashCell()) + '</td>' +
          '<td class="vendors-col-labels">' + labelsCell(row.labels) + '</td>' +
          '<td class="vendors-col-rating">' + (row.rating != null ? esc(row.rating) : dashCell()) + '</td>' +
          '<td class="vendors-col-archived">' + dashCell() + '</td>' +
          '<td class="data-table__actions-col">' + rowActionsMenu(row) + '</td>' +
          '</tr>';
      });
    }
    html += '</tbody></table>';
    root.innerHTML = html;
    bindRowActions();
    root.querySelectorAll('.vendors-row').forEach(function (tr) {
      tr.addEventListener('click', function (e) {
        if (e.target.closest('a, button, input, .row-actions')) return;
        var id = tr.getAttribute('data-vendor-id');
        if (id) window.location.href = 'vendor-view?id=' + encodeURIComponent(id);
      });
    });
    var nameTh = root.querySelector('thead .vendors-col-name');
    if (nameTh) {
      nameTh.style.cursor = 'pointer';
      nameTh.addEventListener('click', function () {
        state.sortName = state.sortName === 'asc' ? 'desc' : 'asc';
        renderTable();
      });
    }
    updatePills();
    updatePaginationButtons(totalPages);
    initLucide(root);
  }

  function updatePaginationButtons(totalPages) {
    var prev = document.querySelector('#vendors-pagination [data-page-prev]');
    var next = document.querySelector('#vendors-pagination [data-page-next]');
    if (prev) prev.disabled = state.page <= 1;
    if (next) next.disabled = state.page >= totalPages;
  }

  function updatePills() {
    var f = state.filters;
    document.querySelectorAll('.vendors-panel .expense-filter-pill').forEach(function (btn) {
      var k = btn.getAttribute('data-filter');
      var on = (k === 'classification' && f.classifications.length) ||
        (k === 'contactName' && f.contactName) ||
        (k === 'contactPhone' && f.contactPhone) ||
        (k === 'labels' && f.labels.length);
      btn.classList.toggle('has-filter', !!on);
    });
    var btn = document.getElementById('vendors-filters-btn');
    var lbl = document.getElementById('vendors-filters-btn-label');
    if (btn) {
      var n = filterCount();
      var open = document.getElementById('vendors-filters-drawer').classList.contains('is-open');
      btn.classList.toggle('is-active', n > 0 || open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (lbl) lbl.textContent = n > 0 ? n + ' Filter' + (n === 1 ? '' : 's') : 'Filters';
    }
  }

  function closePop() {
    var p = document.getElementById('vendors-filter-popover');
    if (p) {
      p.hidden = true;
      p.classList.remove('is-text-popover');
    }
    document.querySelectorAll('.vendors-panel .expense-filter-pill').forEach(function (b) {
      b.classList.remove('is-open');
      b.setAttribute('aria-expanded', 'false');
    });
    openFilter = null;
    textDraft = '';
  }

  function positionPop(anchor, pop) {
    var panel = document.querySelector('.vendors-panel');
    if (!panel) return;
    var pr = panel.getBoundingClientRect();
    var r = anchor.getBoundingClientRect();
    pop.style.top = (r.bottom - pr.top + 6) + 'px';
    var w = pop.offsetWidth || 360;
    pop.style.left = Math.max(8, Math.min(r.left - pr.left, pr.width - w - 8)) + 'px';
  }

  function optionsHtml(items, selected, valueKey) {
    valueKey = valueKey || 'id';
    if (!items.length) {
      return '<p class="meter-popover__empty">No options</p>';
    }
    return items.map(function (item) {
      var val = typeof item === 'string' ? item : item[valueKey];
      var label = typeof item === 'string' ? item : item.label;
      var checked = selected.indexOf(val) !== -1;
      return '<label class="meter-select-item"><input type="checkbox" value="' + escA(val) + '"' +
        (checked ? ' checked' : '') + '><span>' + esc(label) + '</span></label>';
    }).join('');
  }

  function selectPopover(kind, selected) {
    var items = kind === 'classification' ? data.classifications : data.allLabels();
    return '<div class="meter-popover meter-popover--select"><div class="meter-popover__search"><span data-lucide-icon="search" aria-hidden="true"></span>' +
      '<input type="search" class="meter-popover__search-input" placeholder="Select item(s)" data-select-search></div>' +
      '<div class="meter-popover__list" data-select-list>' + optionsHtml(items, selected) + '</div>' +
      '<div class="meter-popover__footer"><div class="meter-popover__footer-right">' +
      '<button type="button" class="btn btn-text btn-sm" data-popover-cancel>Cancel</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-popover-apply' + (selected.length ? '' : ' disabled') + '>Apply</button></div></div></div>';
  }

  function textPopover(value) {
    var hasVal = !!(value && String(value).trim());
    return '<div class="meter-popover meter-popover--text">' +
      '<div class="meter-popover__text-body">' +
        '<input type="text" class="meter-popover__text-input" data-text-input placeholder="Search text" value="' + escA(value || '') + '">' +
      '</div>' +
      '<div class="meter-popover__footer"><div class="meter-popover__footer-right">' +
      '<button type="button" class="btn btn-text btn-sm" data-popover-cancel>Cancel</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-popover-apply-text' + (hasVal ? '' : ' disabled') + '>Apply</button></div></div></div>';
  }

  function bindSelectPop(kind) {
    var pop = document.getElementById('vendors-filter-popover');
    var applyBtn = pop.querySelector('[data-popover-apply]');
    pop.querySelector('[data-popover-cancel]').onclick = closePop;
    function syncApply() {
      if (!applyBtn) return;
      var vals = Array.prototype.map.call(pop.querySelectorAll('[data-select-list] input:checked'), function (el) { return el.value; });
      applyBtn.disabled = !vals.length;
    }
    pop.querySelectorAll('[data-select-list] input').forEach(function (cb) {
      cb.onchange = syncApply;
    });
    if (applyBtn) {
      applyBtn.onclick = function () {
        if (applyBtn.disabled) return;
        var vals = Array.prototype.map.call(pop.querySelectorAll('[data-select-list] input:checked'), function (el) { return el.value; });
        if (kind === 'classification') state.filters.classifications = vals;
        else if (kind === 'labels') state.filters.labels = vals;
        closePop();
        state.page = 1;
        renderTable();
        if (document.getElementById('vendors-filters-drawer').classList.contains('is-open')) renderDrawer();
      };
    }
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

  function bindTextPop(kind) {
    var pop = document.getElementById('vendors-filter-popover');
    var input = pop.querySelector('[data-text-input]');
    var applyBtn = pop.querySelector('[data-popover-apply-text]');
    pop.querySelector('[data-popover-cancel]').onclick = closePop;
    if (input && applyBtn) {
      input.oninput = function () {
        textDraft = input.value;
        applyBtn.disabled = !input.value.trim();
      };
      applyBtn.onclick = function () {
        if (applyBtn.disabled) return;
        if (kind === 'contactName') state.filters.contactName = input.value.trim();
        else if (kind === 'contactPhone') state.filters.contactPhone = input.value.trim();
        closePop();
        state.page = 1;
        renderTable();
        if (document.getElementById('vendors-filters-drawer').classList.contains('is-open')) renderDrawer();
      };
      input.focus();
    }
  }

  function openPop(kind, anchor) {
    closeDrawer();
    closeTableSettings();
    var pop = document.getElementById('vendors-filter-popover');
    openFilter = kind;
    pop.classList.remove('is-text-popover');

    if (kind === 'contactName' || kind === 'contactPhone') {
      textDraft = kind === 'contactName' ? state.filters.contactName : state.filters.contactPhone;
      pop.innerHTML = textPopover(textDraft);
      pop.classList.add('is-text-popover');
      pop.hidden = false;
      anchor.classList.add('is-open');
      anchor.setAttribute('aria-expanded', 'true');
      positionPop(anchor, pop);
      bindTextPop(kind);
      initLucide(pop);
      return;
    }

    var selected = kind === 'classification' ? state.filters.classifications.slice() : state.filters.labels.slice();
    pop.innerHTML = selectPopover(kind, selected);
    pop.hidden = false;
    anchor.classList.add('is-open');
    anchor.setAttribute('aria-expanded', 'true');
    positionPop(anchor, pop);
    bindSelectPop(kind);
    initLucide(pop);
  }

  function closeDrawer() {
    document.getElementById('vendors-filters-drawer').classList.remove('is-open');
    updatePills();
  }

  function openDrawer() {
    closePop();
    document.getElementById('vendors-filters-drawer').classList.add('is-open');
    renderDrawer();
    updatePills();
  }

  function clearFilter(kind) {
    if (kind === 'classification') state.filters.classifications = [];
    else if (kind === 'contactName') state.filters.contactName = '';
    else if (kind === 'contactPhone') state.filters.contactPhone = '';
    else if (kind === 'labels') state.filters.labels = [];
    state.page = 1;
    renderTable();
  }

  function renderDrawer() {
    var body = document.getElementById('vendors-filters-drawer-body');
    var f = state.filters;
    var applied = '';
    if (f.classifications.length) {
      applied += '<div class="expense-drawer-applied"><span>Classification</span><span>' + f.classifications.length + ' selected</span><button type="button" data-clear="classification"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    }
    if (f.contactName) {
      applied += '<div class="expense-drawer-applied"><span>Contact Name</span><span>' + esc(f.contactName) + '</span><button type="button" data-clear="contactName"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    }
    if (f.contactPhone) {
      applied += '<div class="expense-drawer-applied"><span>Contact Phone</span><span>' + esc(f.contactPhone) + '</span><button type="button" data-clear="contactPhone"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    }
    if (f.labels.length) {
      applied += '<div class="expense-drawer-applied"><span>Vendor Labels</span><span>' + f.labels.length + ' selected</span><button type="button" data-clear="labels"><span data-lucide-icon="x" data-lucide-icon-size="14"></span></button></div>';
    }

    body.innerHTML = (filterCount() ? applied : '<p class="expense-drawer-empty">No filters applied.</p>') +
      '<button type="button" class="btn btn-primary btn-sm expense-drawer-add" id="vendors-drawer-add">Add Filter <span data-lucide-icon="chevronDown" data-lucide-icon-size="14" aria-hidden="true"></span></button>' +
      '<div class="expense-drawer-popular"><h3>Popular Filters</h3><ul class="expense-drawer-popular__list">' +
      data.popularFilters.map(function (p) {
        return '<li><button type="button" class="expense-drawer-popular__link" data-open="' + p.id + '">' + esc(p.label) + '</button></li>';
      }).join('') +
      '</ul></div>';

    body.querySelectorAll('[data-clear]').forEach(function (b) {
      b.onclick = function () {
        clearFilter(b.getAttribute('data-clear'));
        renderDrawer();
      };
    });
    body.querySelectorAll('[data-open]').forEach(function (b) {
      b.onclick = function () {
        var filter = b.getAttribute('data-open');
        var pill = document.querySelector('.vendors-panel .expense-filter-pill[data-filter="' + filter + '"]');
        if (pill) openPop(filter, pill);
      };
    });
    document.getElementById('vendors-drawer-add').onclick = function () {
      var pill = document.querySelector('.vendors-panel .expense-filter-pill[data-filter="classification"]');
      if (pill) openPop('classification', pill);
    };
    initLucide(body);
  }

  function closeTableSettings() {
    var el = document.getElementById('vendors-table-settings');
    if (el) el.hidden = true;
  }

  function openTableSettings(anchor) {
    closePop();
    var el = document.getElementById('vendors-table-settings');
    el.innerHTML = '<div class="meter-table-settings__section"><a href="#" class="meter-table-settings__manage">Manage Columns</a></div>' +
      '<div class="meter-table-settings__section"><div class="meter-table-settings__title">Items Per Page</div>' +
      [15, 50, 100].map(function (n) {
        return '<label class="meter-settings-option"><input type="radio" name="vendors-page-size" value="' + n + '"' + (state.pageSize === n ? ' checked' : '') + '> ' + n + '</label>';
      }).join('') + '</div>';
    el.hidden = false;
    positionPop(anchor, el);
    el.querySelectorAll('input[name="vendors-page-size"]').forEach(function (r) {
      r.onchange = function () { state.pageSize = parseInt(r.value, 10); state.page = 1; renderTable(); };
    });
  }

  function setTab(tab) {
    if (tab === 'add') return;
    state.tab = tab;
    state.page = 1;
    document.querySelectorAll('.content--vendors .segment-tab[data-tab]').forEach(function (b) {
      var on = b.getAttribute('data-tab') === tab;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    renderTable();
  }

  function init() {
    if (document.body.getAttribute('data-page') !== 'vendors') return;
    initLucide();

    document.getElementById('vendors-search').oninput = function (e) {
      state.search = e.target.value;
      state.page = 1;
      renderTable();
    };

    document.querySelectorAll('.vendors-panel .expense-filter-pill').forEach(function (btn) {
      btn.onclick = function () {
        var k = btn.getAttribute('data-filter');
        if (openFilter === k && !document.getElementById('vendors-filter-popover').hidden) closePop();
        else openPop(k, btn);
      };
    });

    document.getElementById('vendors-filters-btn').onclick = function () {
      if (document.getElementById('vendors-filters-drawer').classList.contains('is-open')) closeDrawer();
      else openDrawer();
    };
    document.getElementById('vendors-filters-drawer-close').onclick = closeDrawer;

    document.getElementById('vendors-pagination').querySelector('[data-page-prev]').onclick = function () {
      if (state.page > 1) { state.page--; renderTable(); }
    };
    document.getElementById('vendors-pagination').querySelector('[data-page-next]').onclick = function () {
      var tp = Math.max(1, Math.ceil(filteredList().length / state.pageSize));
      if (state.page < tp) { state.page++; renderTable(); }
    };

    document.getElementById('vendors-table-settings-btn').onclick = function (e) {
      var el = document.getElementById('vendors-table-settings');
      if (!el.hidden) closeTableSettings();
      else openTableSettings(e.currentTarget);
    };

    document.getElementById('vendors-save-view-btn').onclick = function () {
      window.alert('Save view (prototype demo).');
    };

    document.getElementById('vendors-more-btn').onclick = function () {
      window.alert('More actions (prototype demo).');
    };

    document.getElementById('vendors-add-btn').onclick = function () {
      window.location.href = 'vendor-form';
    };

    document.getElementById('vendors-find-shops').onclick = function (e) {
      e.preventDefault();
      window.alert('Find shops (prototype demo).');
    };

    document.querySelectorAll('.content--vendors .segment-tab[data-tab]').forEach(function (b) {
      b.onclick = function () { setTab(b.getAttribute('data-tab')); };
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#vendors-filter-popover') && !e.target.closest('.vendors-panel .expense-filter-pill')) closePop();
      if (!e.target.closest('#vendors-table-settings') && !e.target.closest('#vendors-table-settings-btn')) closeTableSettings();
      if (!e.target.closest('.vendors-panel [data-row-actions]')) closeAllRowMenus();
    });

    renderTable();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
