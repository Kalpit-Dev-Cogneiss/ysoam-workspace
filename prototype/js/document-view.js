(function () {
  'use strict';

  var data = window.YSOAM_DOCUMENTS;
  var icons = window.YSOAM_ICONS;

  function getId() {
    return new URLSearchParams(window.location.search).get('id');
  }

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function lucide(name, size) { return window.YSOAM_LUCIDE ? window.YSOAM_LUCIDE.icon(name, size || 16) : ''; }
  function rowIcon(key) { return icons && icons[key] ? icons[key] : ''; }
  function initLucide(root) { if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) window.YSOAM_LUCIDE.init(root); }

  function previewHtml(doc) {
    if (doc.ext === 'docx' || doc.ext === 'doc' || doc.ext === 'rtf') {
      return '<div class="doc-preview-page">' +
        '<h1>BDPH Enterprise Platform Development Timeline Proposal</h1>' +
        '<h2>Revision Summary</h2>' +
        '<table class="doc-preview-table"><thead><tr><th>Module</th><th>Description</th></tr></thead><tbody>' +
        '<tr><td>Share Vehicle Location</td><td>Allow fleet managers to share live vehicle location with external stakeholders.</td></tr>' +
        '<tr><td>Fleet Mobile Application</td><td>Driver-facing mobile app for inspections, fuel entries, and trip updates.</td></tr>' +
        '<tr><td>Document Vault</td><td>Centralized storage for compliance documents with vehicle attachments.</td></tr>' +
        '</tbody></table>' +
        '<p>This proposal outlines the phased delivery plan for the YSOAM enterprise fleet platform, including milestones for Mumbai–Pune corridor rollout.</p>' +
        '</div>';
    }
    if (doc.ext === 'pdf') {
      return '<div class="doc-preview-page doc-preview-page--pdf"><p>PDF preview for <strong>' + esc(doc.fileName) + '</strong></p><p class="doc-preview-muted">Document preview is simulated in this prototype.</p></div>';
    }
    return '<div class="doc-preview-page"><p>Preview for <strong>' + esc(doc.fileName) + '</strong></p><p class="doc-preview-muted">File preview is simulated in this prototype.</p></div>';
  }

  function attachedHtml(doc) {
    var inner;
    if (!doc.attachedVehicles || !doc.attachedVehicles.length) {
      inner = '<button type="button" class="table-cell-link doc-view-select-vehicles">Select Vehicles</button>';
    } else {
      inner = doc.attachedVehicles.map(function (id) {
        return '<a href="vehicles?id=' + escA(id) + '" class="table-cell-link">' + esc(id) + '</a>';
      }).join(', ');
    }
    return inner;
  }

  function labelsHtml(doc) {
    if (!doc.labels || !doc.labels.length) {
      return '<button type="button" class="btn btn-text btn-sm doc-view-edit-labels" id="doc-view-edit-labels">' +
        lucide('tag', 14) + ' Edit Labels</button>';
    }
    return doc.labels.map(function (l) {
      return '<span class="doc-label-tag">' + esc(l) + '</span>';
    }).join(' ') + ' <button type="button" class="btn btn-text btn-sm doc-view-edit-labels" id="doc-view-edit-labels">' +
      lucide('tag', 14) + ' Edit Labels</button>';
  }

  function metaRow(label, value, icon) {
    return '<div class="doc-view-meta-row">' +
      '<span class="doc-view-meta-row__label">' + esc(label) + '</span>' +
      '<span class="doc-view-meta-row__value">' + (icon ? '<span class="doc-view-meta-icon">' + icon + '</span>' : '') + value + '</span>' +
    '</div>';
  }

  function moreMenu(doc) {
    return (
      '<div class="row-actions" data-doc-view-more>' +
        '<button type="button" class="row-actions__trigger" aria-label="More actions" aria-haspopup="menu" aria-expanded="false">' +
          '<span class="row-actions__dots" aria-hidden="true"></span>' +
        '</button>' +
        '<div class="row-actions__menu" role="menu" hidden>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="rename" role="menuitem">Rename <span class="row-actions__item-icon">' + rowIcon('actionEdit') + '</span></button>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="replace" role="menuitem">Replace <span class="row-actions__item-icon">' + lucide('folderInput', 16) + '</span></button>' +
          '<button type="button" class="row-actions__item row-actions__item--btn" data-action="download" role="menuitem">Download <span class="row-actions__item-icon">' + lucide('download', 16) + '</span></button>' +
          '<div class="row-actions__divider" role="separator"></div>' +
          '<button type="button" class="row-actions__item row-actions__item--btn row-actions__item--danger" data-action="delete" role="menuitem">Delete <span class="row-actions__item-icon">' + rowIcon('actionDelete') + '</span></button>' +
        '</div>' +
      '</div>'
    );
  }

  function closeMoreMenu() {
    var menu = document.querySelector('[data-doc-view-more] .row-actions__menu');
    var trigger = document.querySelector('[data-doc-view-more] .row-actions__trigger');
    if (menu) { menu.hidden = true; menu.style.position = ''; menu.style.top = ''; menu.style.left = ''; }
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function bindHeaderActions(doc) {
    document.getElementById('doc-view-download').onclick = function () {
      window.alert('Download ' + doc.fileName + ' (prototype demo).');
    };

    var moreWrap = document.querySelector('[data-doc-view-more]');
    if (moreWrap) {
      var trigger = moreWrap.querySelector('.row-actions__trigger');
      var menu = moreWrap.querySelector('.row-actions__menu');
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = menu.hidden;
        closeMoreMenu();
        if (open) {
          var rect = trigger.getBoundingClientRect();
          menu.hidden = false;
          menu.style.position = 'fixed';
          menu.style.top = (rect.bottom + 4) + 'px';
          menu.style.left = Math.max(8, rect.right - 188) + 'px';
          menu.style.zIndex = '120';
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
      moreWrap.querySelectorAll('[data-action]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          closeMoreMenu();
          window.alert(btn.textContent.trim() + ' (prototype demo).');
        });
      });
    }

    document.addEventListener('click', function (e) {
      if (!e.target.closest('[data-doc-view-more]')) closeMoreMenu();
    });
  }

  function bindAttach(doc) {
    document.querySelectorAll('.doc-view-select-vehicles').forEach(function (btn) {
      btn.onclick = function () {
        window.YSOAM_DOC_ATTACH.open(doc.id, function () { render(); });
      };
    });
  }

  function render() {
    var root = document.getElementById('document-view-root');
    if (!root) return;

    var doc = data.getById(getId());
    if (!doc) {
      window.location.href = 'documents';
      return;
    }

    var fileColor = doc.ext === 'pdf' ? '#dc2626' : '#2563eb';

    root.innerHTML =
      '<header class="doc-view-header">' +
        '<div class="doc-view-header__left">' +
          '<a class="doc-view-breadcrumb" href="documents">Documents</a>' +
          '<div class="doc-view-title">' +
            '<span class="doc-file-icon" style="color:' + fileColor + '">' + lucide('fileText', 20) + '</span>' +
            '<h1>' + esc(doc.fileName) + '</h1>' +
          '</div>' +
        '</div>' +
        '<div class="doc-view-header__actions">' +
          moreMenu(doc) +
          '<button type="button" class="btn btn-outline btn-sm doc-view-download-btn" id="doc-view-download">' +
            lucide('download', 14) + ' Download' +
          '</button>' +
        '</div>' +
      '</header>' +
      '<div class="doc-view-layout">' +
        '<section class="doc-view-preview">' +
          '<div class="doc-view-preview__toolbar">' +
            '<span>1 / 5</span>' +
            '<span class="doc-view-preview__zoom">Automatic Zoom</span>' +
          '</div>' +
          '<div class="doc-view-preview__canvas" id="doc-view-preview-canvas">' + previewHtml(doc) + '</div>' +
        '</section>' +
        '<aside class="doc-view-sidebar">' +
          '<h2 class="doc-view-sidebar__title">' + esc(doc.fileName.length > 42 ? doc.fileName.slice(0, 42) + '…' : doc.fileName) + '</h2>' +
          '<div class="doc-view-meta">' +
            metaRow('Location', esc(doc.folder), lucide('building', 14)) +
            metaRow('Attached to', attachedHtml(doc), '') +
            metaRow('Labels', labelsHtml(doc), '') +
            metaRow('Type', esc(doc.mimeTypeLabel), '') +
            metaRow('File Size', esc(doc.sizeLabel), '') +
            metaRow('Auto-Delete', doc.autoDelete ? esc(doc.autoDelete) : '—', lucide('info', 14)) +
            metaRow('Last Modified', esc(doc.lastModified), '') +
            metaRow('Uploaded', esc(doc.lastModified) + ' by ' + esc(doc.uploadedBy), '') +
          '</div>' +
          '<button type="button" class="btn btn-text btn-sm doc-view-add-desc">Add Description</button>' +
          '<div class="doc-view-comments">' +
            '<h3>Comments</h3>' +
            '<div class="doc-view-comment-input">' +
              '<span class="expense-watcher-avatar" aria-hidden="true">DM</span>' +
              '<input type="text" class="text-input" placeholder="Add a Comment" aria-label="Add a comment">' +
            '</div>' +
          '</div>' +
        '</aside>' +
      '</div>';

    document.title = doc.fileName + ' — YSOAM';
    initLucide(root);
    bindHeaderActions(doc);
    bindAttach(doc);

    document.querySelector('.doc-view-add-desc').onclick = function () {
      window.alert('Add description (prototype demo).');
    };
    var editLabels = document.getElementById('doc-view-edit-labels');
    if (editLabels) editLabels.onclick = function () {
      window.alert('Edit labels (prototype demo).');
    };
  }

  if (document.body.getAttribute('data-subpage') === 'document-view') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
    else render();
  }
})();
