(function () {
  'use strict';

  var KEY = 'YSOAM_EDITION';
  var params = new URLSearchParams(window.location.search);
  var path = (window.location.pathname || '').toLowerCase();
  var edition = params.get('edition');

  if (path.indexOf('/mvp') !== -1 || path.endsWith('mvp.html')) edition = 'mvp';
  if (path.indexOf('/full') !== -1 || path.endsWith('full.html')) edition = 'full';

  if (edition === 'mvp' || edition === 'full') {
    try { sessionStorage.setItem(KEY, edition); } catch (e) { /* ignore */ }
  }

  if (!edition) {
    try { edition = sessionStorage.getItem(KEY); } catch (e) { /* ignore */ }
  }

  window.YSOAM_EDITION = edition === 'full' ? 'full' : 'mvp';

  window.YSOAM_EDITION_LABELS = {
    mvp: 'MVP',
    full: 'Full Platform'
  };

  window.YSOAM_EDITION_LOGIN = function () {
    return 'login?edition=' + window.YSOAM_EDITION;
  };

  window.YSOAM_EDITION_LOGOUT = function () {
    return 'login?signedOut=1&edition=' + window.YSOAM_EDITION;
  };
})();
