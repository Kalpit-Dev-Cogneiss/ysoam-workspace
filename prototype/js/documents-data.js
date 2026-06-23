window.YSOAM_DOCUMENTS = (function () {
  var FILE_TYPES = [
    { id: 'images', label: 'Images' },
    { id: 'videos', label: 'Videos' },
    { id: 'text', label: 'Text File' },
    { id: 'csv', label: 'CSV File' },
    { id: 'html', label: 'HTML File' },
    { id: 'rtf', label: 'Rich Text Format' },
    { id: 'pdf', label: 'PDF File' },
    { id: 'word', label: 'Word Document' }
  ];

  var LOCATION_TYPES = [
    { id: 'charging', label: 'Charging Entry' },
    { id: 'contact', label: 'Contact' },
    { id: 'expense', label: 'Expense Entry' },
    { id: 'fuel', label: 'Fuel Entry' },
    { id: 'issue', label: 'Issue' },
    { id: 'part', label: 'Part' },
    { id: 'vehicle', label: 'Vehicle' },
    { id: 'work-order', label: 'Work Order' }
  ];

  var CLASSIFICATIONS = [
    { id: 'insurance', label: 'Insurance' },
    { id: 'registration', label: 'Registration' },
    { id: 'invoice', label: 'Invoice' },
    { id: 'contract', label: 'Contract' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'other', label: 'Other' }
  ];

  var FOLDERS = ['YSOAM', 'Fleet Compliance', 'Vendor Records'];

  var FILES = [
    { name: 'BDPH Enterprise Platform Development Timeline Proposal.docx', ext: 'docx', fileType: 'word', sizeKb: 14.6 },
    { name: 'MH-12-AB-1234 Insurance Certificate.pdf', ext: 'pdf', fileType: 'pdf', sizeKb: 248.2 },
    { name: 'Fleet Fuel Policy 2026.pdf', ext: 'pdf', fileType: 'pdf', sizeKb: 412.8 },
    { name: 'Pune Depot Maintenance Checklist.csv', ext: 'csv', fileType: 'csv', sizeKb: 8.4 },
    { name: 'Vehicle Registration Scan MH-14-CD-5678.jpg', ext: 'jpg', fileType: 'images', sizeKb: 892.1 },
    { name: 'Driver Safety Training Notes.txt', ext: 'txt', fileType: 'text', sizeKb: 3.2 },
    { name: 'Expressway Toll Receipt Batch.html', ext: 'html', fileType: 'html', sizeKb: 18.7 },
    { name: 'Work Order WO-1042 Invoice.pdf', ext: 'pdf', fileType: 'pdf', sizeKb: 156.3 },
    { name: 'Tyre Inspection Photo Set.zip', ext: 'zip', fileType: 'images', sizeKb: 2048.5 },
    { name: 'Vendor Contract Shell Fleet Services.docx', ext: 'docx', fileType: 'word', sizeKb: 96.4 },
    { name: 'Monthly Expense Summary Jun 2026.csv', ext: 'csv', fileType: 'csv', sizeKb: 22.1 },
    { name: 'GPS Installation Guide.pdf', ext: 'pdf', fileType: 'pdf', sizeKb: 1340.0 },
    { name: 'Fleet Compliance Audit Checklist.rtf', ext: 'rtf', fileType: 'rtf', sizeKb: 44.8 },
    { name: 'Charging Station Lease Agreement.pdf', ext: 'pdf', fileType: 'pdf', sizeKb: 512.6 },
    { name: 'Parts Catalog Q2 2026.pdf', ext: 'pdf', fileType: 'pdf', sizeKb: 3204.2 },
    { name: 'Driver License Copy Rajesh K.jpg', ext: 'jpg', fileType: 'images', sizeKb: 445.3 },
    { name: 'Fuel Entry Receipt Lonavala.png', ext: 'png', fileType: 'images', sizeKb: 128.9 },
    { name: 'Issue Report Brake Wear MH-01-EF-7890.txt', ext: 'txt', fileType: 'text', sizeKb: 2.1 },
    { name: 'Training Video Onboarding.mp4', ext: 'mp4', fileType: 'videos', sizeKb: 18432.0 },
    { name: 'Annual Maintenance Contract.pdf', ext: 'pdf', fileType: 'pdf', sizeKb: 678.4 }
  ];

  function formatDateShort(iso) {
    var d = new Date(iso);
    return pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + '/' + d.getFullYear();
  }

  function mimeTypeLabel(ext) {
    var map = {
      docx: 'Microsoft Word', doc: 'Microsoft Word', rtf: 'Rich Text Format',
      pdf: 'PDF', csv: 'CSV', txt: 'Text', html: 'HTML', jpg: 'JPEG Image',
      png: 'PNG Image', mp4: 'MP4 Video', zip: 'ZIP Archive'
    };
    return map[ext] || 'File';
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function formatSize(kb) {
    if (kb >= 1024) return (kb / 1024).toFixed(1) + ' MB';
    return kb.toFixed(1) + ' KB';
  }

  function formatRelative(iso) {
    var now = new Date(2026, 5, 22, 16, 24, 0);
    var d = new Date(iso);
    var mins = Math.floor((now - d) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return 'about ' + mins + ' minute' + (mins === 1 ? '' : 's') + ' ago';
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return 'about ' + hrs + ' hour' + (hrs === 1 ? '' : 's') + ' ago';
    var days = Math.floor(hrs / 24);
    if (days < 30) return days + ' day' + (days === 1 ? '' : 's') + ' ago';
    var months = Math.floor(days / 30);
    return months + ' month' + (months === 1 ? '' : 's') + ' ago';
  }

  function buildList() {
    var list = [];
    var now = new Date(2026, 5, 22, 16, 0, 0);

    FILES.forEach(function (f, i) {
      var hoursAgo = i === 0 ? 1 : (i * 17) % 720;
      var created = new Date(now.getTime() - hoursAgo * 3600000);
      var locType = LOCATION_TYPES[i % LOCATION_TYPES.length];
      var folder = FOLDERS[i % FOLDERS.length];
      var attached = i % 4 === 0 ? null : (i % 4 === 1 ? ['MH-12-AB-1234'] : ['MH-12-AB-1234', 'MH-14-CD-5678']);
      var labels = i % 5 === 0 ? null : (i % 5 === 1 ? ['Insurance'] : ['Compliance', 'FY2026']);
      var autoDelete = i % 6 === 0 ? '30 days' : null;
      var classification = CLASSIFICATIONS[i % CLASSIFICATIONS.length];

      list.push({
        id: 'DOC-' + (i + 1),
        fileName: f.name,
        ext: f.ext,
        fileType: f.fileType,
        sizeKb: f.sizeKb,
        sizeLabel: formatSize(f.sizeKb),
        folder: folder,
        locationType: locType.id,
        locationTypeLabel: locType.label,
        classification: classification.id,
        classificationLabel: classification.label,
        createdAt: created.toISOString(),
        createdLabel: formatRelative(created.toISOString()),
        lastModified: formatDateShort(created.toISOString()),
        uploadedBy: 'Demo Manager',
        mimeTypeLabel: mimeTypeLabel(f.ext),
        autoDelete: autoDelete,
        attachedVehicles: attached ? attached.slice() : [],
        labels: labels
      });
    });

    list.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    return list;
  }

  function getById(id) {
    return list.find(function (d) { return d.id === id; }) || null;
  }

  function setAttachedVehicles(id, vehicleIds) {
    var doc = getById(id);
    if (!doc) return null;
    doc.attachedVehicles = (vehicleIds || []).slice();
    return doc;
  }

  var list = buildList();

  return {
    list: list,
    fileTypes: FILE_TYPES,
    locationTypes: LOCATION_TYPES,
    classifications: CLASSIFICATIONS,
    folders: FOLDERS,
    formatSize: formatSize,
    formatRelative: formatRelative,
    formatDateShort: formatDateShort,
    mimeTypeLabel: mimeTypeLabel,
    getById: getById,
    setAttachedVehicles: setAttachedVehicles
  };
})();
