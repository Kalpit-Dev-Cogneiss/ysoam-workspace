(function () {
  'use strict';

  if (document.body.getAttribute('data-subpage') !== 'part-outward-form') return;

  var data = window.YSOAM_PART_OUTWARD;
  var parts = window.YSOAM_PARTS;

  function getId() {
    return new URLSearchParams(window.location.search).get('id');
  }

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function lucide(name, size) { return window.YSOAM_LUCIDE ? window.YSOAM_LUCIDE.icon(name, size || 16) : ''; }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }

  function updateSaveState() {
    var partId = document.getElementById('po-part').value;
    var vehicleId = document.getElementById('po-vehicle').value;
    var qty = parseInt(document.getElementById('po-qty').value, 10);
    var valid = !!(partId && vehicleId && qty > 0);
    ['po-form-save-top', 'po-form-save-bottom', 'po-form-save-another'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.disabled = !valid;
    });
  }

  function fillSelect(el, options, placeholder) {
    if (!el) return;
    el.innerHTML = '<option value="">' + esc(placeholder || 'Please select') + '</option>' +
      options.map(function (o) {
        return '<option value="' + esc(o.id) + '">' + esc(o.label) + '</option>';
      }).join('');
  }

  function renderPartSummary(partId) {
    var card = document.getElementById('po-part-summary');
    var body = document.getElementById('po-part-summary-body');
    if (!partId) {
      card.hidden = true;
      return;
    }
    var part = parts.getById(partId);
    if (!part) {
      card.hidden = true;
      return;
    }
    card.hidden = false;
    body.innerHTML =
      '<div class="po-part-summary__row">' +
        '<span class="parts-thumb" style="--parts-thumb-color:' + esc(part.thumbColor) + '">' + lucide('package', 20) + '</span>' +
        '<div><strong>' + esc(part.partNumber) + '</strong>' +
        '<p>' + esc(part.description || '—') + '</p></div>' +
      '</div>' +
      '<dl class="po-part-summary__meta">' +
        '<div><dt>Category</dt><dd>' + esc(part.categoryLabel) + '</dd></div>' +
        '<div><dt>Manufacturer</dt><dd>' + esc(part.manufacturerLabel) + '</dd></div>' +
        '<div><dt>Unit Cost</dt><dd>' + esc(part.unitCostLabel) + '</dd></div>' +
        '<div><dt>Unit</dt><dd>' + esc(part.unitLabel) + '</dd></div>' +
      '</dl>';
    initLucide(body);
  }

  function renderPartHistory(partId) {
    var wrap = document.getElementById('po-part-history');
    var hint = document.getElementById('po-history-hint');
    var editId = getId();

    if (!partId) {
      hint.textContent = 'Select a part to see issuance history.';
      wrap.innerHTML = '<p class="po-history-empty">No part selected.</p>';
      return;
    }

    var history = data.getHistoryForPart(partId, editId);
    hint.textContent = history.length
      ? history.length + ' prior issuance' + (history.length === 1 ? '' : 's') + ' for this part'
      : 'No prior issuances for this part.';

    if (!history.length) {
      wrap.innerHTML = '<p class="po-history-empty">This part has not been issued to any vehicle yet.</p>';
      return;
    }

    var html =
      '<table class="data-table data-table--list data-table--po-history">' +
      '<thead><tr><th>Vehicle</th><th>Date</th><th class="tabular-nums">Qty</th><th class="tabular-nums">Total</th><th>Issued By</th></tr></thead><tbody>';

    history.slice(0, 20).forEach(function (row) {
      html +=
        '<tr data-history-row="' + esc(row.id) + '">' +
        '<td><a href="vehicle-detail.html?id=' + esc(row.vehicleId) + '" class="table-cell-link">' + esc(row.vehicleName) + '</a></td>' +
        '<td>' + esc(data.formatDateDisplay(row.issuedOn)) + '</td>' +
        '<td class="tabular-nums">' + esc(row.quantity) + '</td>' +
        '<td class="tabular-nums">' + esc(row.totalCostLabel) + '</td>' +
        '<td>' + esc(row.issuedBy) + '</td>' +
        '</tr>';
    });

    html += '</tbody></table>';
    wrap.innerHTML = html;

    wrap.querySelectorAll('[data-history-row]').forEach(function (tr) {
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;
        window.location.href = 'part-outward-view?id=' + encodeURIComponent(tr.getAttribute('data-history-row'));
      });
    });
  }

  function onPartChange() {
    var partId = document.getElementById('po-part').value;
    renderPartSummary(partId);
    renderPartHistory(partId);
    updateSaveState();
  }

  function populateForm(record) {
    document.getElementById('po-part').value = record.partId || '';
    document.getElementById('po-vehicle').value = record.vehicleId || '';
    document.getElementById('po-qty').value = record.quantity || 1;
    document.getElementById('po-date').value = record.issuedOn || '2026-06-15';
    document.getElementById('po-wo').value = record.workOrder || '';
    document.getElementById('po-issuer').value = record.issuedBy || 'Rajesh Kumar';
    document.getElementById('po-notes').value = record.notes || '';
    onPartChange();
  }

  function handleSubmit(e, addAnother) {
    e.preventDefault();
    var partId = document.getElementById('po-part').value;
    var vehicleId = document.getElementById('po-vehicle').value;
    if (!partId || !vehicleId) return;

    if (addAnother) {
      window.alert('Part outward saved (prototype). Issue another part.');
      document.getElementById('po-form').reset();
      document.getElementById('po-date').value = '2026-06-15';
      document.getElementById('po-qty').value = '1';
      onPartChange();
      return;
    }

    var editId = getId();
    var targetId = editId || 'PO-80001';
    window.location.href = 'part-outward-view?id=' + encodeURIComponent(targetId);
  }

  function init() {
    var editId = getId();
    var isEdit = !!editId;

    document.getElementById('po-form-title').textContent = isEdit ? 'Edit Part Outward' : 'Issue Part to Vehicle';
    document.title = (isEdit ? 'Edit ' : 'Issue ') + 'Part Outward — YSOAM';

    fillSelect(document.getElementById('po-part'), data.partOptions(), 'Select part…');
    fillSelect(document.getElementById('po-vehicle'), data.vehicleOptions(), 'Select vehicle…');

    var issuerSel = document.getElementById('po-issuer');
    issuerSel.innerHTML = data.ISSUERS.map(function (name) {
      return '<option value="' + esc(name) + '"' + (name === 'Rajesh Kumar' ? ' selected' : '') + '>' + esc(name) + '</option>';
    }).join('');

    if (isEdit) {
      var record = data.getFormRecord(editId);
      if (!record) {
        window.location.href = 'part-outward';
        return;
      }
      populateForm(record);
      document.getElementById('po-form-save-another').style.display = 'none';
    } else {
      document.getElementById('po-date').value = '2026-06-15';
      onPartChange();
    }

    document.getElementById('po-part').addEventListener('change', onPartChange);
    document.getElementById('po-vehicle').addEventListener('change', updateSaveState);
    document.getElementById('po-qty').addEventListener('input', updateSaveState);

    document.getElementById('po-form').addEventListener('submit', function (e) { handleSubmit(e, false); });
    document.getElementById('po-form-save-another').addEventListener('click', function (e) { handleSubmit(e, true); });

    initLucide(document.body);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
