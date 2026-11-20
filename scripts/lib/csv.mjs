/**
 * Minimal RFC 4180 CSV reader/writer, tuned for files edited in Excel and
 * Google Sheets: UTF-8 BOM, CRLF, quoted multi-line cells, and comma,
 * semicolon or tab delimiters (Excel uses ";" in some locales).
 */

export function parseCsv(text) {
  text = text.replace(/^﻿/, "");
  const delimiter = detectDelimiter(text);
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"' && cell === "") quoted = true;
    else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  // Multi-line cells come back with \r\n from Excel; normalise to \n.
  return rows.map((r) => r.map((c) => c.replace(/\r\n?/g, "\n")));
}

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] || "";
  const count = (d) => firstLine.split(d).length - 1;
  const candidates = [",", ";", "\t"].map((d) => [d, count(d)]).sort((a, b) => b[1] - a[1]);
  return candidates[0][1] > 0 ? candidates[0][0] : ",";
}

export function toCsv(rows) {
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n\r]|^\s|\s$/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  // BOM + CRLF so Excel opens UTF-8 (₹, –, “ ”) correctly.
  return "﻿" + rows.map((r) => r.map(esc).join(",")).join("\r\n") + "\r\n";
}
