#!/usr/bin/env node
/**
 * Spreadsheet (CSV) ⇄ site-data.js converter.
 *
 *   node scripts/content-csv.mjs export [dir]   site-data.js → CSV files (default dir: content/)
 *   node scripts/content-csv.mjs import [dir]   CSV files → src/data/site-data.js
 *        --dry-run        validate and show what would change, don't write
 *        --json <file>    also write the result as plain JSON
 *   node scripts/content-csv.mjs check [dir]    converter round-trip test + report whether
 *                                               the CSVs and site-data.js are in sync
 *        --strict         exit 1 when they are out of sync
 *
 * Import starts from the current site-data.js and applies the spreadsheets on
 * top: a value only changes if its cell changes, and a missing CSV file leaves
 * that part of the site untouched. Requires Node 18+, no packages.
 */
import { readFile, writeFile, mkdir, readdir, mkdtemp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { parseCsv, toCsv } from "./lib/csv.mjs";
import { TABLES, TABLE_PATHS, SETTINGS_META, SETTINGS_HEADER, PHONE_KEYS } from "./lib/content-schema.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_FILE = join(ROOT, "src/data/site-data.js");
const SETTINGS_FILE = "01-settings.csv";

/* ------------------------------------------------------------ helpers */
const clone = (v) => structuredClone(v);
const getPath = (obj, path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
function setPath(obj, path, value) {
  const keys = path.split(".");
  let o = obj;
  for (const k of keys.slice(0, -1)) {
    if (o[k] == null || typeof o[k] !== "object") o[k] = {};
    o = o[k];
  }
  if (value === undefined) delete o[keys.at(-1)];
  else o[keys.at(-1)] = value;
}
const normHeader = (s) => String(s || "").toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]/g, "");

async function loadData() {
  const mod = await import(`${pathToFileURL(DATA_FILE).href}?t=${Date.now()}${Math.random()}`);
  return clone(mod.siteData || mod.default);
}

function typeOf(v) {
  if (typeof v === "boolean") return "bool";
  if (typeof v === "number") return "number";
  if (Array.isArray(v)) return "lines";
  return "text";
}

const TYPE_HINT = { lines: " (one per line)", list: " (one per line)", bool: " (yes/no)", number: " (number)", text: "" };

/* ----------------------------------------------------- value <-> cell */
function toCell(value, type, key = "") {
  if (value == null) return "";
  switch (type) {
    case "bool":
      return value === true ? "yes" : value === false ? "no" : "";
    case "lines":
    case "list":
      return (Array.isArray(value) ? value : [value]).join("\n");
    default: {
      let s = String(value);
      // Excel treats a leading "+" as a formula. The "+" is restored on import.
      if (PHONE_KEYS.has(key)) s = s.replace(/^\+/, "");
      return s;
    }
  }
}

function fromCell(raw, type, ctx) {
  const v = String(raw ?? "").trim();
  switch (type) {
    case "bool": {
      if (v === "") return undefined;
      const t = v.toLowerCase();
      if (["yes", "y", "true", "1"].includes(t)) return true;
      if (["no", "n", "false", "0"].includes(t)) return false;
      ctx.error(`expected yes or no, got "${v}"`);
      return undefined;
    }
    case "number": {
      if (v === "") return undefined;
      const n = Number(v);
      if (!Number.isFinite(n)) ctx.error(`expected a number, got "${v}"`);
      return Number.isFinite(n) ? n : undefined;
    }
    case "lines":
      return v.split("\n").map((s) => s.trim()).filter(Boolean);
    case "list":
      return v.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
    default:
      return v;
  }
}

/** Fix values that spreadsheets commonly mangle. */
function cleanSetting(key, value, ctx) {
  if (typeof value !== "string" || !value) return value;
  if (PHONE_KEYS.has(key)) {
    if (/^\d(\.\d+)?E\+\d+$/i.test(value)) {
      ctx.error(`the spreadsheet turned the phone number into "${value}". Type it with spaces, e.g. 91 98765 43210`);
      return value;
    }
    const digits = value.replace(/\D/g, "");
    if (value.startsWith("+")) return value;
    if (digits.length === 10 && !value.startsWith("0")) {
      ctx.warn(`assuming India (+91) for "${value}"`);
      return `+91 ${value}`;
    }
    if (!value.startsWith("0") && digits.length >= 11) return `+${value}`;
    return value;
  }
  if (key.endsWith("lastUpdated")) {
    // Excel/Sheets turn 2026-11-12 into 12/11/2026 or 12-11-2026 (day first for en-IN).
    const m = value.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
    if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  return value;
}

/* ------------------------------------------------------------ settings */
function settingsRows(data) {
  const rows = [SETTINGS_HEADER];
  const done = new Set();
  const push = (key, section, label, help) => {
    const value = getPath(data, key);
    if (value === undefined || (value && typeof value === "object" && !Array.isArray(value))) return;
    const type = typeOf(value);
    rows.push([section, label, toCell(value, type, key), help + (help && TYPE_HINT[type] ? "" : TYPE_HINT[type].trim()), key, type]);
    done.add(key);
  };
  for (const [key, section, label, help] of SETTINGS_META) push(key, section, label, help);

  // Everything else, so the spreadsheet always covers the whole site.
  const walk = (obj, prefix) => {
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (TABLE_PATHS.has(key) || done.has(key)) continue;
      if (v && typeof v === "object" && !Array.isArray(v)) walk(v, key);
      else if (!Array.isArray(v) || v.every((x) => typeof x === "string")) {
        const parts = key.split(".");
        const section = parts[0] === "pages" ? `11. Page text: ${parts[1]}` : `12. Advanced: ${parts[0]}`;
        push(key, section, parts.slice(parts[0] === "pages" ? 2 : 1).join(" › "), "");
      } else {
        console.warn(`  ! ${key}: list of records not mapped to any CSV; it is kept from site-data.js`);
      }
    }
  };
  walk(data, "");
  return rows;
}

function applySettings(data, rows, ctxFor) {
  const [header, ...body] = rows;
  const col = (name) => header.findIndex((h) => normHeader(h) === normHeader(name));
  const iKey = col("key"), iType = col("type"), iVal = col("Value");
  if (iKey < 0 || iVal < 0) throw new Error(`${SETTINGS_FILE}: the "Value" and "key (do not edit)" columns are required.`);
  body.forEach((r, i) => {
    const key = (r[iKey] || "").trim();
    if (!key) return;
    const ctx = ctxFor(SETTINGS_FILE, i + 2, key);
    const current = getPath(data, key);
    if (current === undefined) ctx.warn("not a known setting; added anyway");
    const type = (r[iType] || "").trim() || typeOf(current);
    let value = fromCell(r[iVal], type, ctx);
    if (value === undefined && type !== "number") return; // blank yes/no keeps the current value
    value = cleanSetting(key, value, ctx);
    setPath(data, key, value);
  });
}

/* -------------------------------------------------------------- tables */
function headerFor(table) {
  const cols = table.columns.map(([, label, type]) => label + TYPE_HINT[type]);
  if (table.multi) return [table.multi.field[1], ...cols];
  if (table.keyed) return [table.keyed.field[1], ...cols];
  return cols;
}

function itemToRow(item, table) {
  return table.columns.map(([field, , type]) => toCell(getPath(item, field), type));
}

function tableRows(data, table) {
  const rows = [headerFor(table)];
  if (table.multi) {
    for (const [label, path] of Object.entries(table.multi.targets)) {
      for (const item of getPath(data, path) || []) rows.push([label, ...itemToRow(item, table)]);
    }
  } else if (table.keyed) {
    for (const [key, item] of Object.entries(getPath(data, table.keyed.path) || {})) rows.push([key, ...itemToRow(item, table)]);
  } else {
    for (const item of getPath(data, table.path) || []) rows.push(itemToRow(item, table));
  }
  return rows;
}

function applyTable(data, table, rows, ctxFor) {
  const [header, ...body] = rows;
  const lead = table.multi?.field || table.keyed?.field;
  const fields = [...(lead ? [[lead[0], lead[1], "text"]] : []), ...table.columns];
  const index = new Map();
  header.forEach((h, i) => {
    const n = normHeader(h);
    const f = fields.find(([field, label]) => normHeader(label) === n || normHeader(field) === n);
    if (f) index.set(f[0], i);
    else if (n) ctxFor(table.file, 1).warn(`unknown column "${h}" ignored`);
  });
  for (const [field, label] of fields) {
    if (!index.has(field)) ctxFor(table.file, 1).warn(`column "${label}" is missing`);
  }

  const items = [];
  body.forEach((r, i) => {
    if (r.every((c) => !String(c).trim())) return; // blank row
    const ctx = ctxFor(table.file, i + 2);
    const item = {};
    for (const [field, , type] of table.columns) {
      if (!index.has(field)) continue;
      const v = fromCell(r[index.get(field)], type, ctx);
      if (v === undefined || v === "" || (Array.isArray(v) && !v.length)) continue;
      setPath(item, field, v);
    }
    const lv = lead ? String(r[index.get(lead[0])] ?? "").trim() : null;
    items.push({ item, lead: lv, ctx });
  });

  if (table.multi) {
    const targets = table.multi.targets;
    const byPath = Object.fromEntries(Object.values(targets).map((p) => [p, []]));
    for (const { item, lead: lv, ctx } of items) {
      const path = targets[Object.keys(targets).find((k) => normHeader(k) === normHeader(lv))] || (lv in byPath ? lv : null);
      if (!path) ctx.error(`"${lv}" is not a valid ${lead[1]}. Use one of: ${Object.keys(targets).join(", ")}`);
      else byPath[path].push(item);
    }
    for (const [path, list] of Object.entries(byPath)) setPath(data, path, list);
  } else if (table.keyed) {
    const obj = getPath(data, table.keyed.path) || {};
    for (const { item, lead: lv, ctx } of items) {
      if (!lv) ctx.error(`${lead[1]} is empty`);
      else obj[lv] = { ...item };
    }
    setPath(data, table.keyed.path, obj);
  } else {
    setPath(data, table.path, items.map((x) => x.item));
  }
}

/* --------------------------------------------------------- validation */
function validateContent(data, ctxFor) {
  const ids = new Set();
  const cats = new Set((data.categories || []).map((c) => c.id));
  (data.services || []).forEach((s, i) => {
    const ctx = ctxFor("02-services.csv", i + 2);
    if (!s.id) ctx.error("Service ID is empty");
    else if (!/^[a-z0-9-]+$/.test(s.id)) ctx.error(`Service ID "${s.id}" may only contain lowercase letters, numbers and hyphens`);
    if (ids.has(s.id)) ctx.error(`Service ID "${s.id}" is used twice`);
    ids.add(s.id);
    if (!s.name) ctx.error("Service name is empty");
    if (!cats.has(s.category)) ctx.error(`Category ID "${s.category}" is not in 03-service-categories.csv`);
  });
}

/* ------------------------------------------------------------ export */
async function exportCsv(dir, data) {
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, SETTINGS_FILE), toCsv(settingsRows(data)));
  for (const t of TABLES) await writeFile(join(dir, t.file), toCsv(tableRows(data, t)));
  return [SETTINGS_FILE, ...TABLES.map((t) => t.file)];
}

/* ------------------------------------------------------------ import */
async function importCsv(dir, base) {
  const data = clone(base);
  const problems = { errors: [], warnings: [] };
  const ctxFor = (file, row, key) => ({
    error: (m) => problems.errors.push(`${file} row ${row}${key ? ` (${key})` : ""}: ${m}`),
    warn: (m) => problems.warnings.push(`${file} row ${row}${key ? ` (${key})` : ""}: ${m}`),
  });
  const files = new Set(await readdir(dir));
  const read = async (f) => parseCsv(await readFile(join(dir, f), "utf8"));

  if (files.has(SETTINGS_FILE)) applySettings(data, await read(SETTINGS_FILE), ctxFor);
  else problems.warnings.push(`${SETTINGS_FILE} not found; settings unchanged`);
  for (const t of TABLES) {
    if (files.has(t.file)) applyTable(data, t, await read(t.file), ctxFor);
    else problems.warnings.push(`${t.file} not found; that part of the site is unchanged`);
  }
  validateContent(data, ctxFor);
  return { data, ...problems };
}

/* ------------------------------------------------------- write site-data */
function serialize(data) {
  const body = JSON.stringify(data, null, 2).replace(/^(\s*)"([A-Za-z_$][\w$]*)":/gm, "$1$2:");
  return `/**
 * ============================================================================
 *  SITE DATA: the single source of truth for this website
 * ============================================================================
 *
 *  Generated from the spreadsheets in content/ by:
 *      node scripts/content-csv.mjs import
 *
 *  You can edit this file directly, but then run
 *      node scripts/content-csv.mjs export
 *  so the spreadsheets stay in sync (CI warns when they differ).
 *
 *  TOKENS: {firm} {firmLegal} {ca} {caName} {designation} {city} {email}
 *          {phone} {website} {year} are filled in automatically.
 *  VERIFICATION: items with verified: false are hidden when draftMode is false.
 *  Field-by-field documentation: README.md §3 and content/HOW-TO-FILL.md.
 * ============================================================================
 */

export const siteData = ${body};

export default siteData;
`;
}

/** Drop empty values so semantically identical data compares equal. */
function normalize(v) {
  if (Array.isArray(v)) {
    const a = v.map(normalize).filter((x) => x !== undefined);
    return a.length ? a : undefined;
  }
  if (v && typeof v === "object") {
    const o = {};
    for (const [k, x] of Object.entries(v)) {
      const n = normalize(x);
      if (n !== undefined) o[k] = n;
    }
    return Object.keys(o).length ? o : undefined;
  }
  return v === "" || v == null ? undefined : v;
}

function diffPaths(a, b, path = "", out = []) {
  if (out.length > 15) return out;
  if (JSON.stringify(a) === JSON.stringify(b)) return out;
  if (a && b && typeof a === "object" && typeof b === "object") {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) diffPaths(a[k], b[k], path ? `${path}.${k}` : k, out);
  } else out.push(path || "(root)");
  return out;
}

function runConfigCheck() {
  const r = spawnSync(process.execPath, [join(ROOT, "scripts/generate-seo.mjs")], { encoding: "utf8" });
  const warnings = (r.stderr + r.stdout).split("\n").filter((l) => l.trim().startsWith("- "));
  return { ok: r.status === 0, warnings };
}

/* --------------------------------------------------------------- CLI */
const [cmd, ...rest] = process.argv.slice(2);
const flags = new Set(rest.filter((a) => a.startsWith("--")));
const jsonIdx = rest.indexOf("--json");
const jsonOut = jsonIdx >= 0 ? rest[jsonIdx + 1] : null;
const dirArg = rest.find((a, i) => !a.startsWith("--") && rest[i - 1] !== "--json");
const dir = join(process.cwd(), dirArg || relative(process.cwd(), join(ROOT, "content")));

const print = ({ errors, warnings }) => {
  warnings.forEach((w) => console.log(`  ! ${w}`));
  errors.forEach((e) => console.log(`  ✗ ${e}`));
};

if (cmd === "export") {
  const files = await exportCsv(dir, await loadData());
  console.log(`Wrote ${files.length} files to ${relative(process.cwd(), dir) || "."}/`);
} else if (cmd === "import") {
  if (!existsSync(dir)) throw new Error(`Folder not found: ${dir}`);
  const base = await loadData();
  const res = await importCsv(dir, base);
  print(res);
  if (res.errors.length) {
    console.log(`\n${res.errors.length} error(s): nothing was written. Fix the rows above and run again.`);
    process.exit(1);
  }
  const changed = diffPaths(normalize(base), normalize(res.data));
  console.log(changed.length ? `\nChanged: ${changed.join(", ")}${changed.length > 15 ? " …" : ""}` : "\nNo changes.");
  if (flags.has("--dry-run")) {
    console.log("(dry run: nothing written)");
  } else {
    const previous = await readFile(DATA_FILE, "utf8");
    await writeFile(DATA_FILE, serialize(res.data));
    if (jsonOut) await writeFile(join(process.cwd(), jsonOut), JSON.stringify(res.data, null, 2) + "\n");
    const check = runConfigCheck();
    if (!check.ok) {
      await writeFile(DATA_FILE, previous);
      console.log("\nThe imported content has configuration problems; site-data.js was NOT changed:");
      check.warnings.forEach((w) => console.log(`  ✗ ${w.trim().slice(2)}`));
      process.exit(1);
    }
    console.log(`Updated ${relative(process.cwd(), DATA_FILE)}${jsonOut ? ` and ${jsonOut}` : ""}.`);
  }
} else if (cmd === "check") {
  const data = await loadData();
  // 1. Round trip: export → import must reproduce site-data.js exactly.
  const tmp = await mkdtemp(join(tmpdir(), "content-csv-"));
  await exportCsv(tmp, data);
  const rt = await importCsv(tmp, {}); // empty base: everything must come from the CSVs
  await rm(tmp, { recursive: true, force: true });
  const lost = diffPaths(normalize(data), normalize(rt.data));
  if (rt.errors.length || lost.length) {
    print(rt);
    console.log(`✗ Converter round trip failed. Differences at: ${lost.join(", ")}`);
    process.exit(1);
  }
  console.log("✓ Converter round trip: every value in site-data.js survives export → import.");
  // 2. Are the committed spreadsheets in sync with site-data.js?
  if (existsSync(dir)) {
    const res = await importCsv(dir, data);
    const drift = diffPaths(normalize(data), normalize(res.data));
    if (res.errors.length) print(res);
    if (drift.length || res.errors.length) {
      const msg = `content/ spreadsheets and site-data.js differ at: ${drift.join(", ") || "(see errors)"}. Run "node scripts/content-csv.mjs import" (spreadsheets → site) or "export" (site → spreadsheets).`;
      console.log(process.env.GITHUB_ACTIONS ? `::warning title=Content spreadsheets out of sync::${msg}` : `! ${msg}`);
      if (flags.has("--strict")) process.exit(1);
    } else console.log("✓ content/ spreadsheets match site-data.js.");
  }
} else {
  console.log("Usage: node scripts/content-csv.mjs <export|import|check> [dir] [--dry-run] [--json file] [--strict]");
  process.exit(cmd ? 1 : 0);
}
