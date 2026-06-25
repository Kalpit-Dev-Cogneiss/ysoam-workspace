(function () {
  'use strict';

  var keys = [];
  var searchQuery = '';

  var API_VERSIONS = ['2025-05-05', '2024-06-30', '2024-03-15', '2024-01-01', '2023-03-01'];

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function initLucide(root) {
    if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) {
      window.YSOAM_LUCIDE.init(root || document);
    }
  }

  function maskToken(token) {
    if (!token || token.length < 8) return token;
    return token.slice(0, 4) + '••••••••' + token.slice(-4);
  }

  function generateToken() {
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var out = '';
    for (var i = 0; i < 32; i++) {
      out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return out;
  }

  function formatDate(d) {
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function filteredKeys() {
    if (!searchQuery) return keys.slice();
    var q = searchQuery.toLowerCase();
    return keys.filter(function (key) {
      return key.label.toLowerCase().indexOf(q) !== -1 ||
        key.token.toLowerCase().indexOf(q) !== -1 ||
        key.apiVersion.indexOf(q) !== -1;
    });
  }

  function renderTable() {
    var body = document.getElementById('api-keys-table-body');
    var empty = document.getElementById('api-keys-empty');
    if (!body || !empty) return;

    var rows = filteredKeys();
    if (!rows.length) {
      body.innerHTML = '';
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    body.innerHTML = rows.map(function (key) {
      var statusClass = key.status === 'Active' ? 'badge-active' : 'badge-idle';
      return (
        '<tr>' +
          '<td>' + esc(key.label) + '</td>' +
          '<td><code class="api-keys-code">' + esc(maskToken(key.token)) + '</code></td>' +
          '<td>' + esc(key.apiVersion) + '</td>' +
          '<td>' + esc(key.dateAdded) + '</td>' +
          '<td><span class="badge ' + statusClass + '">' + esc(key.status) + '</span></td>' +
        '</tr>'
      );
    }).join('');

    renderCurlExample();
  }

  function renderCurlExample() {
    var curl = document.getElementById('api-keys-curl');
    if (!curl) return;

    var active = keys.find(function (k) { return k.status === 'Active'; });
    if (!active) {
      curl.innerHTML = '<p class="api-keys-curl__empty">No active API key. Create a new API key to see a request example.</p>';
      return;
    }

    curl.innerHTML =
      '<pre class="api-keys-curl__code"><code>curl -X GET "https://api.ysoam.demo/v1/vehicles" \\\n' +
      '  -H "Authorization: Token ' + esc(active.token) + '" \\\n' +
      '  -H "Account-Token: ysoam-demo-001"</code></pre>';
  }

  function openModal() {
    var overlay = document.getElementById('api-key-modal');
    var form = document.getElementById('api-key-form');
    if (!overlay || !form) return;
    form.reset();
    overlay.classList.add('is-open');
    document.getElementById('api-key-label').focus();
    initLucide(overlay);
  }

  function closeModal() {
    var overlay = document.getElementById('api-key-modal');
    if (overlay) overlay.classList.remove('is-open');
  }

  function bindModal() {
    var addBtn = document.getElementById('api-keys-add-btn');
    var overlay = document.getElementById('api-key-modal');
    var closeBtn = document.getElementById('api-key-modal-close');
    var cancelBtn = document.getElementById('api-key-modal-cancel');
    var form = document.getElementById('api-key-form');

    if (addBtn && !addBtn.dataset.bound) {
      addBtn.dataset.bound = '1';
      addBtn.addEventListener('click', openModal);
    }

    if (closeBtn && !closeBtn.dataset.bound) {
      closeBtn.dataset.bound = '1';
      closeBtn.addEventListener('click', closeModal);
    }

    if (cancelBtn && !cancelBtn.dataset.bound) {
      cancelBtn.dataset.bound = '1';
      cancelBtn.addEventListener('click', closeModal);
    }

    if (overlay && !overlay.dataset.bound) {
      overlay.dataset.bound = '1';
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeModal();
      });
    }

    if (form && !form.dataset.bound) {
      form.dataset.bound = '1';
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var label = document.getElementById('api-key-label').value.trim();
        var version = document.getElementById('api-key-version').value;
        if (!label || !version) return;

        keys.unshift({
          id: 'key-' + Date.now(),
          label: label,
          token: generateToken(),
          apiVersion: version,
          dateAdded: formatDate(new Date()),
          status: 'Active'
        });

        closeModal();
        renderTable();
      });
    }
  }

  function bindSearch() {
    var input = document.getElementById('api-keys-search');
    if (!input || input.dataset.bound === '1') return;
    input.dataset.bound = '1';
    input.addEventListener('input', function () {
      searchQuery = input.value.trim();
      renderTable();
    });
  }

  function init() {
    if (!document.getElementById('settings-panel-api-keys')) return;
    bindModal();
    bindSearch();
    renderTable();
    initLucide(document.getElementById('settings-panel-api-keys'));
  }

  window.YSOAM_SETTINGS_API_KEYS = { init: init };
})();
