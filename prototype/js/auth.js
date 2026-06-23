(function () {
  'use strict';

  var AUTH_KEY = 'YSOAM_AUTH';
  var PERSIST_KEY = 'YSOAM_AUTH_PERSIST';

  function readSession(key) {
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
  }

  function readPersist(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function writeSession(key, value) {
    try { sessionStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  function writePersist(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  function removeSession(key) {
    try { sessionStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  function removePersist(key) {
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  function isLoggedIn() {
    return readSession(AUTH_KEY) === '1' || readPersist(PERSIST_KEY) === '1';
  }

  function login(remember) {
    writeSession(AUTH_KEY, '1');
    if (remember !== false) writePersist(PERSIST_KEY, '1');
    else removePersist(PERSIST_KEY);
  }

  function logout() {
    removeSession(AUTH_KEY);
    removePersist(PERSIST_KEY);
  }

  function currentEdition() {
    if (window.YSOAM_EDITION === 'full') return 'full';
    var stored = readSession('YSOAM_EDITION');
    return stored === 'full' ? 'full' : 'mvp';
  }

  function loginUrl(extraQuery) {
    return 'login?edition=' + currentEdition() + (extraQuery || '');
  }

  function pageName() {
    var path = (window.location.pathname || '').toLowerCase();
    var file = path.split('/').pop() || '';
    return file.replace(/\.html$/, '') || 'index';
  }

  function isPublicPage(name) {
    return name === 'login' || name === 'mvp' || name === 'full' || name === 'roadmap';
  }

  window.YSOAM_AUTH = {
    isLoggedIn: isLoggedIn,
    login: login,
    logout: logout,
    loginUrl: loginUrl
  };

  var name = pageName();

  if (name === 'index') {
    window.location.replace(isLoggedIn() ? 'dashboard' : loginUrl());
    return;
  }

  if (name === 'login') {
    var params = new URLSearchParams(window.location.search);
    if (params.get('signedOut') === '1') logout();
    if (isLoggedIn()) {
      var returnTo = params.get('return');
      window.location.replace(returnTo || 'dashboard');
    }
    return;
  }

  if (!isPublicPage(name) && !isLoggedIn()) {
    var returnPath = window.location.pathname + window.location.search + window.location.hash;
    window.location.replace(loginUrl('&return=' + encodeURIComponent(returnPath)));
  }
})();
