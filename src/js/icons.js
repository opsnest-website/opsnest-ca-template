/**
 * Inline SVG icon set (24×24, stroke-based). Icons are referenced by name from
 * site-data.js, e.g. icon: "receipt". Only names in this fixed dictionary are
 * rendered; unknown names fall back to a neutral dot, so configuration can
 * never inject markup.
 */
const PATHS = {
  "arrow-right": '<path d="M5 12h14"/><path d="m13 5 7 7-7 7"/>',
  "arrow-up-right": '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  "arrow-left": '<path d="M19 12H5"/><path d="m11 19-7-7 7-7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  phone:
    '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  whatsapp:
    '<path d="M3.5 20.5 4.8 16.4A8.5 8.5 0 1 1 8 19.4Z"/><path d="M9.2 8.6c.2-.5.5-.6.8-.6h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c-.1.2-.1.4 0 .5.6 1 1.4 1.8 2.4 2.3.2.1.4.1.5 0l.6-.6c.2-.2.4-.2.6-.1l1.5.7c.3.1.4.3.4.5v.4c0 .4-.2.8-.6 1-1.1.6-2.6.4-4.1-.5-1.6-1-2.9-2.4-3.6-4-.4-1-.4-2-.1-2.8Z"/>',
  mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 6.5 9 6 9-6"/>',
  "map-pin": '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  navigation: '<path d="M3 11 22 2l-9 19-2-8Z"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="17" rx="2"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 6.5V12l3.5 2"/>',
  linkedin:
    '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  globe:
    '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5a14.5 14.5 0 0 1 0 19M12 2.5a14.5 14.5 0 0 0 0 19"/>',
  calculator:
    '<rect x="4" y="2.5" width="16" height="19" rx="2"/><path d="M8 6.5h8M8 11h.01M12 11h.01M16 11h.01M8 14.5h.01M12 14.5h.01M16 14.5h.01M8 18h.01M12 18h.01M16 18h.01"/>',
  receipt:
    '<path d="M5 2.5v19l2-1.2 2 1.2 2-1.2 2 1.2 2-1.2 2 1.2 2-1.2v-19l-2 1.2-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2Z"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>',
  "file-text":
    '<path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8Z"/><path d="M14 2.5V8h5.5M15.5 13h-7M15.5 17h-7M10.5 9h-2"/>',
  "shield-check": '<path d="M12 21.5s8-3.8 8-9.7V5.2L12 2.5 4 5.2v6.6c0 5.9 8 9.7 8 9.7Z"/><path d="m8.8 12 2.2 2.2 4.2-4.4"/>',
  "book-open":
    '<path d="M2.5 4h6a3.5 3.5 0 0 1 3.5 3.5V20a2.6 2.6 0 0 0-2.6-2.6H2.5Z"/><path d="M21.5 4h-6A3.5 3.5 0 0 0 12 7.5V20a2.6 2.6 0 0 1 2.6-2.6h6.9Z"/>',
  briefcase: '<rect x="2.5" y="7" width="19" height="13.5" rx="2"/><path d="M16 20.5V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v15.5M2.5 13h19"/>',
  building:
    '<rect x="4" y="2.5" width="16" height="19" rx="1.5"/><path d="M9.5 21.5v-4h5v4M8.5 6.5h.01M12 6.5h.01M15.5 6.5h.01M8.5 10h.01M12 10h.01M15.5 10h.01M8.5 13.5h.01M12 13.5h.01M15.5 13.5h.01"/>',
  landmark: '<path d="M3 21.5h18M5.5 18v-7M9.8 18v-7M14.2 18v-7M18.5 18v-7M12 2.5l9 5.5H3Z"/>',
  chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-6"/><path d="M15 8h5v5"/>',
  scale:
    '<path d="M12 3v18M7 21h10M4 7h16M12 3l-1 4h2Z"/><path d="m4 7-2.5 6a3 3 0 0 0 5 0Z"/><path d="m20 7-2.5 6a3 3 0 0 0 5 0Z"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  user: '<path d="M19.5 21v-1.5a4.5 4.5 0 0 0-4.5-4.5H9a4.5 4.5 0 0 0-4.5 4.5V21"/><circle cx="12" cy="7.5" r="4"/>',
  rocket:
    '<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1Z"/><path d="m12 15-3-3a22 22 0 0 1 2-4A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2Z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/>',
  store: '<path d="M3 9.5 4.5 4h15L21 9.5"/><path d="M4.5 9.5v11h15v-11"/><path d="M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M10 20.5v-5h4v5"/>',
  factory: '<path d="M2.5 20.5V10l6 3.5V10l6 3.5V4h5v16.5Z"/><path d="M1.5 20.5h21M7 17h1M11.5 17h1"/>',
  heart:
    '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
  compass: '<circle cx="12" cy="12" r="9.5"/><path d="m16 8-2.2 5.8L8 16l2.2-5.8Z"/>',
  lock: '<rect x="4" y="11" width="16" height="10.5" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  target: '<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="1.5"/>',
  layers: '<path d="m12 2.5 9.5 5L12 12.5 2.5 7.5Z"/><path d="m2.5 12 9.5 5 9.5-5M2.5 16.5l9.5 5 9.5-5"/>',
  percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  "clipboard-check":
    '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  award: '<circle cx="12" cy="8.5" r="6"/><path d="M15.5 13.4 17 22l-5-3-5 3 1.5-8.6"/>',
  graduation: '<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 3 9 3 12 0v-5M22 10v6"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7.5L3 21V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/><path d="M8 8.5h8M8 12h5"/>',
  search: '<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.5-4.5"/>',
  info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 16.5V11M12 7.5h.01"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  home: '<path d="m3 9.5 9-7 9 7V20a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20Z"/><path d="M9 21.5v-9h6v9"/>',
  dot: '<circle cx="12" cy="12" r="3"/>',
};

const SVG_NS = "http://www.w3.org/2000/svg";

/** Create an inline SVG icon element. Decorative by default (aria-hidden). */
export function icon(name, { size = 20, className = "", label = "" } = {}) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.6");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("class", `icon ${className}`.trim());
  if (label) {
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", label);
  } else {
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
  }
  // Safe: markup comes only from the fixed PATHS dictionary above.
  svg.innerHTML = PATHS[name] || PATHS.dot;
  return svg;
}

