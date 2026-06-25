(function () {
  'use strict';

  var initialized = false;

  var RECORD_TYPES = [
    {
      id: 'collaboration',
      label: 'Collaboration',
      icon: 'send',
      master: {
        title: 'Collaboration Notifications',
        desc: 'Enable or disable notifications when you are mentioned or collaborate on records.'
      },
      events: [
        { title: 'Mentioned in Comment', desc: 'When you are @mentioned in a comment on a record you can access.' },
        { title: 'Comment Added', desc: 'When a comment is added on records you are watching.' }
      ]
    },
    {
      id: 'vehicles',
      label: 'Vehicles',
      icon: 'car',
      watch: { count: 12, unit: 'vehicles', manageHref: 'vehicles' },
      vehicleExtras: true,
      master: {
        title: 'Vehicle Notifications',
        desc: 'Enable or disable specific notifications about your watched Vehicles'
      },
      events: [
        { title: 'Vehicle Assignment Commented', desc: 'A comment was added to a vehicle assignment you are watching.' },
        { title: 'Vehicle Assigned to Me', desc: 'You were assigned as the operator of a vehicle.' },
        { title: 'Vehicle Commented', desc: 'A comment was added to a vehicle you are watching.' },
        { title: 'Vehicle Fault', desc: 'A fault was detected on a vehicle you are watching.' },
        { title: 'Vehicle Recall', desc: 'A recall was reported for a vehicle you are watching.' },
        { title: 'Vehicle Status Changed', desc: 'The status changed on a vehicle you are watching.' },
        { title: 'Vehicle Watch', desc: 'You were added as a watcher on a vehicle.' },
        { title: 'Vehicle Unwatch', desc: 'You were removed as a watcher on a vehicle.' },
        { title: 'Voided Fuel Entries', desc: 'A fuel entry was voided on a vehicle you are watching.', pushDisabled: true }
      ]
    },
    {
      id: 'inspections',
      label: 'Inspections',
      icon: 'clipboardList',
      master: {
        title: 'Inspection Notifications',
        desc: 'Enable or disable specific notifications about your watched inspections.'
      },
      events: [
        {
          title: 'Vehicle Inspection Reminder',
          desc: 'Schedule reminders on the Inspection Form up to 7 days before the due date. Notifications will be sent to the assigned operator on the vehicle via email and/or push notification.'
        },
        {
          title: 'Due Soon Inspections',
          desc: 'Receive a summary email at 7:00 am of all Inspections due that day on vehicles you are watching.',
          pushDisabled: true
        },
        {
          title: 'Overdue Inspections',
          desc: 'Receive a summary email at 7:00 am of all overdue Inspections on vehicles you are watching.',
          pushDisabled: true
        }
      ]
    },
    {
      id: 'issues',
      label: 'Issues',
      icon: 'info',
      watch: { count: 6, unit: 'issues' },
      master: {
        title: 'Issue Notifications',
        desc: 'Enable or disable specific notifications about your watched issues.'
      },
      events: [
        { title: 'Issue Created', desc: 'When an issue is created by other users on vehicles you are watching. With this setting enabled, you do not automatically watch the issue.' },
        { title: 'Issue Assigned to Me', desc: 'When an issue is assigned to me by other users.' },
        { title: 'Issue Commented', desc: 'When issue comments are added by other users.' },
        { title: 'Issue Resolved', desc: 'When an issue is resolved by other users.' },
        { title: 'Issue Closed', desc: 'When an issue is closed by other users.' },
        { title: 'Overdue Issues Summary', desc: 'Receive a summary email of all Overdue Issues you are watching. Email will be sent out each day at 7:00 am.', pushDisabled: true }
      ]
    },
    {
      id: 'work-orders',
      label: 'Work Orders',
      icon: 'clipboardList',
      watch: { count: 0, unit: 'work orders' },
      master: {
        title: 'Work Order Notifications',
        desc: 'Enable or disable specific notifications about your watched work orders.'
      },
      events: [
        { title: 'Work Order Created', desc: 'When a work order is created by other users on vehicles you are watching. With this setting enabled, you do not automatically watch the work order.' },
        { title: 'Work Order Assigned to Me', desc: 'When a work order is assigned to me by other users.' },
        { title: 'Work Order Commented', desc: 'When work order comments are added by other users.' },
        { title: 'Work Order Status Changed', desc: 'When a work order status is changed by other users.' },
        { title: 'Work Order Scheduled At Reminder', desc: 'Receive a notification for scheduled Work Orders you were added to as a reminder recipient.' }
      ]
    },
    {
      id: 'service-entries',
      label: 'Service Entries',
      icon: 'settings',
      watch: { count: 0, unit: 'service entries' },
      master: {
        title: 'Service Entry Notifications',
        desc: 'Enable or disable specific notifications about your watched service entries.'
      },
      events: [
        { title: 'Service Entry Commented', desc: 'When service entry comments are added by other users.' }
      ]
    },
    {
      id: 'service-reminders',
      label: 'Service Reminders',
      icon: 'bell',
      watch: { count: 0, unit: 'service reminders', info: true },
      infoBanner: 'You will automatically be added as a watcher on new and existing reminders associated with your watched vehicles. Modify this rule in <a href="settings?section=notification-settings">Vehicle Notification settings</a>.',
      master: {
        title: 'Service Reminder Notifications',
        desc: 'Enable or disable specific notifications about your watched service reminders.'
      },
      events: [
        { title: 'Service Reminder Created', desc: 'When a service reminder is created by other users on vehicles you are watching. With this setting enabled, you do not automatically watch the reminder.' },
        { title: 'Service Reminder Commented', desc: 'When service reminder comments are added by other users.' },
        { title: 'Service Reminder Due Soon', desc: 'Receive one notification per Due Soon you are watching. Notifications will send at 7:00 am after a reminder becomes Due Soon and then weekly until the reminder is resolved.' },
        { title: 'Service Reminder Overdue', desc: 'Receive one notification per Overdue you are watching. Notifications will send at 7:00 am after a reminder becomes Overdue and then weekly until the reminder is resolved.' }
      ]
    },
    {
      id: 'vehicle-reminders',
      label: 'Vehicle Reminders',
      icon: 'bell',
      watch: { count: 0, unit: 'vehicle renewal reminders', info: true },
      infoBanner: 'You will automatically be added as a watcher on new and existing reminders associated with your watched vehicles. Modify this rule in <a href="settings?section=notification-settings">Vehicle Notification settings</a>.',
      master: {
        title: 'Vehicle Reminder Notifications',
        desc: 'Enable or disable specific notifications about your watched vehicle reminders.'
      },
      events: [
        { title: 'Vehicle Renewal Reminder Created', desc: 'When a vehicle renewal reminder is created by other users on vehicles you are watching.' },
        { title: 'Vehicle Renewal Reminder Commented', desc: 'When vehicle renewal reminder comments are added by other users.' },
        { title: 'Vehicle Renewal Reminder Due Soon', desc: 'Receive one notification per Due Soon you are watching. Notifications will send at 7:00 am after a reminder becomes Due Soon and then weekly until the reminder is resolved.' },
        { title: 'Vehicle Renewal Reminder Overdue', desc: 'Receive one notification per Overdue you are watching. Notifications will send at 7:00 am after a reminder becomes Overdue and then weekly until the reminder is resolved.' }
      ]
    },
    {
      id: 'contact-reminders',
      label: 'Contact Reminders',
      icon: 'bell',
      watch: { count: 0, unit: 'contact renewal reminders' },
      master: {
        title: 'Contact Reminder Notifications',
        desc: 'Enable or disable specific notifications about your watched contact reminders.'
      },
      events: [
        { title: 'Contact Renewal Reminder Created', desc: 'When a contact renewal reminder is created by other users.' },
        { title: 'Contact Renewal Reminder Commented', desc: 'When contact renewal reminder comments are added by other users.' },
        { title: 'Contact Renewal Reminder Due Soon', desc: 'Receive one notification per Due Soon you are watching. Notifications will send at 7:00 am after a reminder becomes Due Soon and then weekly until the reminder is resolved.' },
        { title: 'Contact Renewal Reminder Overdue', desc: 'Receive one notification per Overdue you are watching. Notifications will send at 7:00 am after a reminder becomes Overdue and then weekly until the reminder is resolved.' }
      ]
    },
    {
      id: 'fuel-entries',
      label: 'Fuel Entries',
      icon: 'zap',
      master: {
        title: 'Fuel Entry Notifications',
        desc: 'Enable or disable specific notifications about your watched fuel entries.'
      },
      events: [
        { title: 'Fuel Entry Alerts', desc: 'When an alert is created for fuel entries you watch. Types include Vendor Location Alert, Capacity Alert, and Missing GPS Location Alert.' },
        { title: 'Fuel Entry Commented', desc: 'When fuel entry comments are added by other users.' }
      ]
    },
    {
      id: 'charging-entries',
      label: 'Charging Entries',
      icon: 'zap',
      watch: { count: 0, unit: 'charging entries' },
      master: {
        title: 'Charging Entry Notifications',
        desc: 'Enable or disable specific notifications about your watched charging entries.'
      },
      events: [
        { title: 'Charging Entry Commented', desc: 'When charging entry comments are added by other users.' }
      ]
    },
    {
      id: 'parts',
      label: 'Parts',
      icon: 'package',
      simpleHeader: {
        title: 'Part Notifications',
        desc: 'Enable or disable specific notifications about your inventory parts'
      },
      events: [
        { title: 'Part Commented', desc: 'When part comments are added by other users.' }
      ]
    },
    {
      id: 'vendors',
      label: 'Vendors',
      icon: 'building',
      watch: { count: 0, unit: 'vendors', manageHref: 'vendors' },
      master: {
        title: 'Vendor Notifications',
        desc: 'Enable or disable specific notifications about your watched vendors.'
      },
      events: [
        { title: 'Vendor Commented', desc: 'When vendor comments are added by other users.' }
      ]
    },
    {
      id: 'expense-entries',
      label: 'Expense Entries',
      icon: 'fileText',
      watch: { count: 0, unit: 'expense entries' },
      master: {
        title: 'Expense Entry Notifications',
        desc: 'Enable or disable specific notifications about your watched expense entries.'
      },
      events: [
        { title: 'Expense Entry Commented', desc: 'When expense entry comments are added by other users.' }
      ]
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: 'globe',
      simpleHeader: {
        title: 'Integration Notifications',
        desc: 'Enable or disable specific integrations'
      },
      events: [
        { title: 'New Fuel Cards', desc: 'When a new fuel card is added to your account (available only to the Account Owner and Administrators)', email: false, pushDisabled: true },
        { title: 'Telematics Weekly Digest Email', desc: 'A snapshot of your telematics device health and usage. One email will be sent on Mondays at 7:00 am', email: false, pushDisabled: true }
      ]
    }
  ];

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function findConfig(id) {
    var found = null;
    RECORD_TYPES.some(function (cfg) {
      if (cfg.id === id) {
        found = cfg;
        return true;
      }
      return false;
    });
    return found;
  }

  function initLucide(root) {
    if (window.YSOAM_LUCIDE && window.YSOAM_LUCIDE.init) {
      window.YSOAM_LUCIDE.init(root);
    }
  }

  function renderWatchBanner(watch) {
    if (!watch) return '';
    var infoIcon = watch.info
      ? ' <span class="notif-watch-banner__info" data-lucide-icon="info" aria-label="More information"></span>'
      : '';
    var manageHref = watch.manageHref ? watch.manageHref : '#';
    return (
      '<div class="notif-watch-banner">' +
        '<span>You are watching <strong>' + esc(watch.count) + ' ' + esc(watch.unit) + '</strong>' + infoIcon + '</span>' +
        '<div class="notif-watch-banner__actions">' +
          '<button type="button" class="btn btn-text btn-sm">Unwatch All</button>' +
          '<a class="btn btn-text btn-sm" href="' + esc(manageHref) + '">Manage <span data-lucide-icon="externalLink" aria-hidden="true"></span></a>' +
        '</div>' +
      '</div>'
    );
  }

  function renderVehicleExtras() {
    return (
      '<div class="notif-rule-list">' +
        '<div class="notif-rule">' +
          '<label class="settings-toggle" title="Automatically watch new vehicles">' +
            '<input type="checkbox"><span class="settings-toggle__track" aria-hidden="true"></span>' +
          '</label>' +
          '<div class="notif-rule__body">' +
            '<strong>Automatically watch new vehicles</strong>' +
            '<p>When enabled, you will automatically be added as a watcher on new vehicles added to YSOAM (that you can access). You can always manually watch individual Vehicles by clicking the Watch button.</p>' +
          '</div>' +
        '</div>' +
        '<div class="notif-rule">' +
          '<label class="settings-toggle" title="Automatically watch new records">' +
            '<input type="checkbox" checked><span class="settings-toggle__track" aria-hidden="true"></span>' +
          '</label>' +
          '<div class="notif-rule__body">' +
            '<strong>Automatically watch new records</strong>' +
            '<p>When enabled, you will automatically watch new records like Issues and Work Orders on your watched vehicles. You can always manually watch or unwatch individual records.</p>' +
          '</div>' +
        '</div>' +
        '<div class="notif-rule">' +
          '<label class="settings-toggle" title="Automatically watch/unwatch existing reminders">' +
            '<input type="checkbox" checked><span class="settings-toggle__track" aria-hidden="true"></span>' +
          '</label>' +
          '<div class="notif-rule__body">' +
            '<strong>Automatically watch/unwatch existing reminders</strong>' +
            '<p>When enabled, you will automatically be added as a watcher on existing Service Reminders &amp; Vehicle Renewal Reminders on your watched vehicles, and removed when vehicles are un-watched.</p>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="notif-groups">' +
        '<div class="notif-groups__header">' +
          '<div><strong>Watched Vehicle Groups</strong><p>You will automatically watch or unwatch vehicles as they enter or leave these groups.</p></div>' +
          '<button type="button" class="btn btn-text btn-sm">+ Add Group</button>' +
        '</div>' +
        '<p class="notif-groups__empty">No watched vehicle groups found.</p>' +
      '</div>'
    );
  }

  function renderInfoBanner(html) {
    if (!html) return '';
    return (
      '<div class="notif-info-banner">' +
        '<span class="notif-info-banner__icon" data-lucide-icon="info" aria-hidden="true"></span>' +
        '<p>' + html + '</p>' +
      '</div>'
    );
  }

  function renderEventRow(event, paneId, index) {
    var emailChecked = event.email === false ? '' : ' checked';
    var pushCell = event.pushDisabled
      ? '<td class="notif-events-table__channel notif-events-table__na">—</td>'
      : '<td class="notif-events-table__channel"><input type="checkbox" class="notif-event-push" data-pane="' + esc(paneId) + '" data-event-index="' + index + '"' + (event.email === false ? '' : ' checked') + ' aria-label="' + esc(event.title) + ' push"></td>';
    return (
      '<tr>' +
        '<td class="notif-events-table__event">' +
          '<strong>' + esc(event.title) + '</strong>' +
          '<p>' + esc(event.desc) + '</p>' +
        '</td>' +
        '<td class="notif-events-table__channel"><input type="checkbox" class="notif-event-email" data-pane="' + esc(paneId) + '" data-event-index="' + index + '"' + emailChecked + ' aria-label="' + esc(event.title) + ' email"></td>' +
        pushCell +
      '</tr>'
    );
  }

  function renderEventsTable(cfg) {
    var rows = (cfg.events || []).map(function (event, index) {
      return renderEventRow(event, cfg.id, index);
    }).join('');

    if (cfg.simpleHeader) {
      return (
        '<div class="notif-events-card notif-events-card--simple">' +
          '<div class="notif-simple-header">' +
            '<strong>' + esc(cfg.simpleHeader.title) + '</strong>' +
            '<p>' + esc(cfg.simpleHeader.desc) + '</p>' +
          '</div>' +
          '<div class="notif-events-table-wrap">' +
            '<table class="notif-events-table">' +
              '<thead><tr><th>Notification Event</th><th class="notif-events-table__channel">Email</th><th class="notif-events-table__channel">Push</th></tr></thead>' +
              '<tbody data-events-body="' + esc(cfg.id) + '">' + rows + '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>'
      );
    }

    return (
      '<div class="notif-events-card">' +
        '<div class="notif-events-card__header">' +
          '<label class="settings-toggle" title="Enable notifications">' +
            '<input type="checkbox" class="notif-master-toggle" data-pane="' + esc(cfg.id) + '" checked>' +
            '<span class="settings-toggle__track" aria-hidden="true"></span>' +
          '</label>' +
          '<div>' +
            '<strong>' + esc(cfg.master.title) + '</strong>' +
            '<p>' + esc(cfg.master.desc) + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="notif-events-table-wrap">' +
          '<table class="notif-events-table">' +
            '<thead><tr><th>Notification Event</th><th class="notif-events-table__channel">Email</th><th class="notif-events-table__channel">Push</th></tr></thead>' +
            '<tbody data-events-body="' + esc(cfg.id) + '">' + rows + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>'
    );
  }

  function renderPane(cfg) {
    return (
      '<div class="notif-detail-pane" data-notify-pane="' + esc(cfg.id) + '">' +
        '<div class="notif-detail-pane__head">' +
          '<span data-lucide-icon="' + esc(cfg.icon) + '" aria-hidden="true"></span>' +
          '<h4>' + esc(cfg.label) + '</h4>' +
        '</div>' +
        renderWatchBanner(cfg.watch) +
        renderInfoBanner(cfg.infoBanner) +
        (cfg.vehicleExtras ? renderVehicleExtras() : '') +
        renderEventsTable(cfg) +
      '</div>'
    );
  }

  function ensurePane(type) {
    var detail = document.getElementById('notif-records-detail');
    if (!detail) return null;
    var pane = detail.querySelector('[data-notify-pane="' + type + '"]');
    if (pane) return pane;
    var cfg = findConfig(type);
    if (!cfg) return null;
    detail.insertAdjacentHTML('beforeend', renderPane(cfg));
    pane = detail.querySelector('[data-notify-pane="' + type + '"]');
    initLucide(pane);
    return pane;
  }

  function showRecordType(type) {
    var nav = document.querySelector('.notif-records-nav');
    var detail = document.getElementById('notif-records-detail');
    if (!nav || !detail) return;

    ensurePane(type);

    nav.querySelectorAll('.notif-records-nav__item').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-notify-type') === type);
    });

    detail.querySelectorAll('.notif-detail-pane').forEach(function (el) {
      el.classList.toggle('is-active', el.getAttribute('data-notify-pane') === type);
    });
  }

  function bindRecordNav() {
    var nav = document.querySelector('.notif-records-nav');
    if (!nav || nav.dataset.bound === '1') return;
    nav.dataset.bound = '1';
    nav.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-notify-type]');
      if (!btn) return;
      showRecordType(btn.getAttribute('data-notify-type'));
    });
  }

  function bindMasterToggles() {
    var detail = document.getElementById('notif-records-detail');
    if (!detail || detail.dataset.masterBound === '1') return;
    detail.dataset.masterBound = '1';
    detail.addEventListener('change', function (e) {
      var master = e.target;
      if (!master.classList.contains('notif-master-toggle')) return;
      var paneId = master.getAttribute('data-pane');
      var disabled = !master.checked;
      detail.querySelectorAll('[data-events-body="' + paneId + '"] .notif-event-email, [data-events-body="' + paneId + '"] .notif-event-push').forEach(function (input) {
        input.disabled = disabled;
        if (disabled) input.checked = false;
        else input.checked = true;
      });
    });
  }

  function init() {
    var panel = document.getElementById('settings-panel-notification-settings');
    if (!panel) return;

    showRecordType('vehicles');
    bindRecordNav();
    bindMasterToggles();
    initLucide(panel);

    if (!initialized) initialized = true;
  }

  window.YSOAM_SETTINGS_NOTIFICATIONS = { init: init };
})();
