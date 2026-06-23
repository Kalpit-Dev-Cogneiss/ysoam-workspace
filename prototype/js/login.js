(function () {
  'use strict';

  var NEWS = [
    {
      badge: 'Improvement',
      badgeType: 'improvement',
      date: '5 days ago',
      title: 'Parts & Inventory module',
      excerpt: 'Manage parts lists, add new parts, and track unit costs across your Mumbai–Pune fleet from a single inventory view.'
    },
    {
      badge: 'Vendor',
      badgeType: 'vendor',
      date: '12 days ago',
      title: 'Fuel History comparisons',
      excerpt: 'Compare volume, price, and fuel economy against previous entries to spot anomalies on expressway routes faster.'
    },
    {
      badge: 'Improvement',
      badgeType: 'improvement',
      date: '18 days ago',
      title: 'Document vault attachments',
      excerpt: 'Upload compliance documents and attach them to vehicles directly from the Documents module.'
    },
    {
      badge: 'Improvement',
      badgeType: 'improvement',
      date: '1 month ago',
      title: 'Work order line items',
      excerpt: 'Create work orders with service tasks, labor, and parts in one flow — built for depot maintenance teams.'
    }
  ];

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderNews() {
    var list = document.getElementById('login-news-list');
    if (!list) return;

    list.innerHTML = NEWS.map(function (item) {
      return (
        '<li class="login-news-item">' +
          '<div class="login-news-item__meta">' +
            '<span class="login-news-badge login-news-badge--' + esc(item.badgeType) + '">' + esc(item.badge) + '</span>' +
            '<span class="login-news-item__date">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>' +
              esc(item.date) +
            '</span>' +
          '</div>' +
          '<a href="roadmap.html" class="login-news-item__title">' + esc(item.title) + '</a>' +
          '<p class="login-news-item__excerpt">' + esc(item.excerpt) + '</p>' +
        '</li>'
      );
    }).join('');
  }

  function getEdition() {
    if (window.YSOAM_EDITION) return window.YSOAM_EDITION;
    var params = new URLSearchParams(window.location.search);
    var edition = params.get('edition');
    if (edition === 'full') return 'full';
    return 'mvp';
  }

  function initEditionBadge() {
    var edition = getEdition();
    try { sessionStorage.setItem('YSOAM_EDITION', edition); } catch (e) { /* ignore */ }
    window.YSOAM_EDITION = edition;

    var badge = document.getElementById('login-edition-badge');
    if (!badge) return;

    var isFull = edition === 'full';
    badge.textContent = isFull ? 'Full Platform prototype' : 'MVP prototype';
    badge.classList.add(isFull ? 'login-edition-badge--full' : 'login-edition-badge--mvp');
    badge.hidden = false;

    var switchLink = document.getElementById('login-edition-switch');
    if (switchLink) {
      switchLink.href = isFull ? 'mvp' : 'full';
      switchLink.textContent = isFull ? 'Switch to MVP prototype' : 'Switch to full platform prototype';
    }
  }

  function initSignedOutAlert() {
    var params = new URLSearchParams(window.location.search);
    var alert = document.getElementById('login-signed-out-alert');
    if (alert && params.get('signedOut') === '1') {
      alert.hidden = false;
    }
  }

  function bindPasswordToggle() {
    var btn = document.getElementById('login-show-password');
    var input = document.getElementById('login-password');
    if (!btn || !input) return;

    btn.addEventListener('click', function () {
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.textContent = show ? 'Hide password' : 'Show password';
      btn.setAttribute('aria-pressed', show ? 'true' : 'false');
    });
  }

  function bindForm() {
    var form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var remember = document.getElementById('login-remember');
      if (window.YSOAM_AUTH && window.YSOAM_AUTH.login) {
        window.YSOAM_AUTH.login(remember && remember.checked);
      }
      var params = new URLSearchParams(window.location.search);
      var returnTo = params.get('return');
      window.location.href = returnTo || 'dashboard';
    });

    document.getElementById('login-google').addEventListener('click', function () {
      window.alert('Google sign-in (prototype demo).');
    });

    document.getElementById('login-sso').addEventListener('click', function () {
      window.alert('SSO sign-in (prototype demo).');
    });
  }

  function init() {
    if (!document.body.classList.contains('login-page')) return;
    initEditionBadge();
    renderNews();
    initSignedOutAlert();
    bindPasswordToggle();
    bindForm();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
