window.YSOAM_VEHICLE_ICON = {
  viewBoxWidth: 36,
  viewBoxHeight: 74,
  aspectRatio: 74 / 36,

  topView: function (color, options) {
    options = options || {};
    var vbW = this.viewBoxWidth;
    var vbH = this.viewBoxHeight;
    var width = options.size || 26;
    var height = Math.round(width * (vbH / vbW));
    var heading = typeof options.heading === "number" ? options.heading : 0;
    var selected = options.selected === true;
    var selectedClass = selected ? " vehicle-marker__icon--selected" : "";

    return (
      '<div class="vehicle-marker__icon' +
      selectedClass +
      '" style="transform:rotate(' +
      heading +
      'deg)" title="Vehicle">' +
      '<svg class="vehicle-top-icon" width="' +
      width +
      '" height="' +
      height +
      '" viewBox="0 0 ' + vbW + ' ' + vbH + '" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid meet">' +
      '<ellipse cx="18" cy="70.8" rx="8.2" ry="1.7" fill="rgba(15,23,42,0.18)"/>' +
      '<path d="M18 2.8C14.8 2.8 12.2 4 10.9 6.4L9.2 9.8C8.1 11.9 7.5 14.3 7.3 16.8L7 24L6.8 31.6L6.8 43.6C6.8 48.5 8 52.8 10.5 56C12.3 58.3 14.9 59.9 18 60.8C21.1 59.9 23.7 58.3 25.5 56C28 52.8 29.2 48.5 29.2 43.6L29.2 31.6L29 24L28.7 16.8C28.5 14.3 27.9 11.9 26.8 9.8L25.1 6.4C23.8 4 21.2 2.8 18 2.8Z" fill="' +
      color +
      '" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M12.5 8.1C13.8 6.8 15.6 6.1 18 6.1C20.4 6.1 22.2 6.8 23.5 8.1L24.2 11C22.2 12 20.1 12.4 18 12.4C15.9 12.4 13.8 12 11.8 11L12.5 8.1Z" fill="#111827"/>' +
      '<path d="M11.9 13.1C13.8 14 15.9 14.4 18 14.4C20.1 14.4 22.2 14 24.1 13.1L24.6 18.2L11.4 18.2L11.9 13.1Z" fill="#1f2937"/>' +
      '<rect x="11.7" y="19.2" width="12.6" height="29.4" rx="2.4" fill="#111827" opacity="0.9"/>' +
      '<rect x="13.2" y="20.5" width="9.6" height="9.2" rx="1.4" fill="#374151"/>' +
      '<rect x="13.2" y="31.1" width="9.6" height="7.4" rx="1.2" fill="#1f2937"/>' +
      '<rect x="13.2" y="40" width="9.6" height="7.2" rx="1.2" fill="#374151"/>' +
      '<path d="M12 49.5C13.6 51.3 15.5 52.2 18 52.2C20.5 52.2 22.4 51.3 24 49.5L23.2 56.6C21.7 58.1 20 58.9 18 58.9C16 58.9 14.3 58.1 12.8 56.6L12 49.5Z" fill="#111827"/>' +
      '<path d="M13 55.8C14.4 57 16 57.6 18 57.6C20 57.6 21.6 57 23 55.8" stroke="#fff" stroke-width="0.8" opacity="0.45" stroke-linecap="round"/>' +
      '<path d="M10 16.7L9.4 26.2L9.2 46.5" stroke="#111827" stroke-width="1.15" stroke-linecap="round" opacity="0.95"/>' +
      '<path d="M26 16.7L26.6 26.2L26.8 46.5" stroke="#111827" stroke-width="1.15" stroke-linecap="round" opacity="0.95"/>' +
      '<rect x="4.6" y="18" width="3" height="5.2" rx="1.2" fill="' +
      color +
      '" stroke="#fff" stroke-width="0.8"/>' +
      '<rect x="28.4" y="18" width="3" height="5.2" rx="1.2" fill="' +
      color +
      '" stroke="#fff" stroke-width="0.8"/>' +
      '<rect x="4.8" y="46.6" width="2.8" height="5" rx="1.2" fill="' +
      color +
      '" stroke="#fff" stroke-width="0.8"/>' +
      '<rect x="28.4" y="46.6" width="2.8" height="5" rx="1.2" fill="' +
      color +
      '" stroke="#fff" stroke-width="0.8"/>' +
      '<ellipse cx="9" cy="26.2" rx="1.3" ry="2" fill="#0f172a" opacity="0.55"/>' +
      '<ellipse cx="27" cy="26.2" rx="1.3" ry="2" fill="#0f172a" opacity="0.55"/>' +
      '<ellipse cx="9" cy="43.8" rx="1.3" ry="2" fill="#0f172a" opacity="0.55"/>' +
      '<ellipse cx="27" cy="43.8" rx="1.3" ry="2" fill="#0f172a" opacity="0.55"/>' +
      '<path d="M11.8 11.9C13.8 12.7 15.9 13.1 18 13.1C20.1 13.1 22.2 12.7 24.2 11.9" stroke="#fff" stroke-width="0.8" opacity="0.42" stroke-linecap="round"/>' +
      '<path d="M14.8 24.4H21.2" stroke="#9ca3af" stroke-width="0.7" stroke-linecap="round" opacity="0.75"/>' +
      '<path d="M14.8 34.8H21.2" stroke="#6b7280" stroke-width="0.7" stroke-linecap="round" opacity="0.7"/>' +
      '<path d="M14.8 43.6H21.2" stroke="#9ca3af" stroke-width="0.7" stroke-linecap="round" opacity="0.75"/>' +
      "</svg>" +
      "</div>"
    );
  },
};
