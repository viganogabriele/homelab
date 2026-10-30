#!/usr/bin/env node
/*
  Sanitization check for the PUBLIC homelab site. Zero dependencies.

    node check.mjs              scan every file of the project (exit 1 on any finding)
    node check.mjs <dir>        scan another directory
    node check.mjs --self-test  prove the check works: a clean copy must pass and
                                every injected leak must be caught

  What fails the check: IPv4/IPv6 addresses (private ones too), last-octet hints,
  port numbers tied to a protocol or a host, any related domain name other than the
  public site, internal-looking host names, e-mail addresses, MAC
  addresses, keys and tokens, high-entropy strings, Proxmox guest IDs, local user
  paths and chat handles, and a private deny-list (people, hosts, containers, ISP,
  hardware, share names, service ports).

  An optional CHECK_DENY_FILE may point to a private JSON list outside this project.
  Each entry is a term string or an object with term and category fields. Never
  publish the list or hashes of its terms: predictable values can be recovered.
  The default checks use general patterns; unknown names need manual review.

  A false positive is fixed by rewording the content, not by weakening a rule.
*/
import { readdirSync, readFileSync, statSync, realpathSync, mkdtempSync, cpSync, writeFileSync, rmSync } from "node:fs";
import { join, relative, extname, dirname, resolve, sep } from "node:path";
import { createHash, randomBytes } from "node:crypto";
import { inflateSync, deflateSync, crc32 } from "node:zlib";
import { isIP } from "node:net";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SKIP_DIRS = new Set(["node_modules", ".git", ".vercel", ".cache"]);
const BINARY_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico", ".avif", ".woff", ".woff2", ".ttf", ".otf", ".pdf"]);
const TEXTY_EXT = new Set([".md", ".txt", ".xml", ".html", ".svg"]);
const ALLOWED_DOMAINS = new Set(["homelab.vigab.cc"]);
const CSS_AT_RULES = new Set(["media", "keyframes", "supports", "import", "font-face", "layer", "container", "page", "property", "charset", "scope", "starting-style", "namespace", "counter-style", "font-feature-values"]);

/* ---------- private deny-list (hashed) ---------- */
const SALT = "homelab-site:";
const norm = (s) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const h16 = (s) => createHash("sha256").update(SALT + norm(s)).digest("hex").slice(0, 16);
const DENY = new Map();
if (process.env.CHECK_DENY_FILE) {
  const path = realpathSync(resolve(process.env.CHECK_DENY_FILE));
  const rel = relative(realpathSync(ROOT), path);
  if (rel !== ".." && !rel.startsWith(".." + sep)) throw new Error("Keep the private deny-list outside the project.");
  const entries = JSON.parse(readFileSync(path, "utf8"));
  for (const entry of entries) {
    const term = typeof entry === "string" ? entry : entry.term;
    if (typeof term !== "string" || !term.trim()) throw new Error("Invalid private deny-list entry.");
    DENY.set(h16(term), typeof entry === "string" ? "term" : entry.category || "term");
  }
}


/* ---------- regex rules ---------- */
const O = "(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)";
const RULES = [
  { id: "ipv4", re: new RegExp(`(?<![\\d.])${O}(?:\\.${O}){3}(?![\\d.]*\\d)`, "g") },
  { id: "ipv4 alternate", re: /(?<![\w.])(?:0x[\da-f]+|\d{1,3})(?:\.(?:0x[\da-f]+|\d{1,3})){3}(?![\w.])/gi },
  { id: "short loopback", re: /(?<![\w.])127\.\d{1,3}(?:\.\d{1,3})?(?![\w.])/g },
  { id: "ipv4-prefix", re: /(?<![\d.])(?:192\.168|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}(?![\d])/g },
  { id: "ipv6", re: /(?<![\w:])(?:[0-9a-f]{1,4}:){3,7}[0-9a-f]{1,4}(?![\w:])|\b(?:fe80|fd[0-9a-f]{2}|fc[0-9a-f]{2}):[0-9a-f:]*:/gi },
  { id: "port", re: /\b(?:tcp|udp)\s*\/?\s*\d{1,5}\b|\b\d{1,5}\s*\/\s*(?:tcp|udp)\b|\bports?\s*(?:number\s*)?[:#=]?\s*\d{1,5}\b/gi },
  { id: "host:port", re: /\b(?:localhost|(?:[a-z0-9-]+\.)+[a-z]{2,}|(?:\d{1,3}\.){3}\d{1,3}):\d{1,5}\b/gi },
  { id: "bare :port", re: /(?:^|[\s"'`=]):\d{1,5}\b(?![.\d])/gm },
  { id: "domain", re: /\b(?:[a-z0-9-]+\.)*vigab\.cc\b/gi, allow: (m) => ALLOWED_DOMAINS.has(m.toLowerCase()) },
  { id: "named host", re: /\b(?:hostname|container[_ -]?name|server[_ -]?name)\s*[:=]\s*["']?[a-z][a-z0-9_.-]{2,}/gi },
  { id: "container id", re: /\b(?:container|docker|podman)\s+(?:id\s*[:=#]?\s*)?[a-f0-9]{12,64}\b/gi },
  { id: "internal hostname", re: /\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:lan|local|localdomain|internal|intranet|home\.arpa|ts\.net)\b/gi },
  { id: "email", re: /\b[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}\b/gi },
  { id: "mac", re: /\b[0-9a-f]{2}(?:[:-][0-9a-f]{2}){5}\b/gi },
  { id: "mac dotted", re: /\b[\da-f]{4}(?:\.[\da-f]{4}){2}\b/gi },
  { id: "github token", re: /\bgh[pousr]_[A-Za-z0-9]{30,}\b|\bgithub_pat_\w{20,}/g },
  { id: "slack token", re: /\bxox[abprs]-[A-Za-z0-9-]{10,}/g },
  { id: "aws key", re: /\bAKIA[0-9A-Z]{16}\b/g },
  { id: "google key", re: /\bAIza[0-9A-Za-z_-]{35}\b/g },
  { id: "bot token", re: /\b\d{8,10}:[A-Za-z0-9_-]{35}\b/g },
  { id: "jwt", re: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\./g },
  { id: "private key", re: new RegExp("-{5}BEGIN [A-Z ]*PRIVATE KEY-{5}", "g") },
  { id: "wireguard key", re: /(?<![A-Za-z0-9+/])[A-Za-z0-9+/]{42}[AEIMQUYcgkosw480]=(?![A-Za-z0-9+/=])/g },
  { id: "credential", re: /\b(?:password|passwd|passphrase|secret|token|api[_-]?key|client[_-]?secret)\s*[:=]\s*["']?[^\s"'`,;)]{6,}/gi },
  { id: "url credentials", re: /\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]+:[^\s/@]+@/gi },
  { id: "proxmox id", re: /\b(?:lxc|ct|vm|vmid|guest|container)\s*[#-]?\s*\d{3,4}\b|\b(?:pct|qm)\s+[a-z]+\s+\d{2,4}\b/gi },
  { id: "user path", re: /\/(?:home|Users)\/[a-z_][a-z0-9_.-]*/g },
  { id: "handle", re: /(?<![\w.])@([a-z0-9_-]{3,})\b/gi, allow: (m, g) => CSS_AT_RULES.has(g[1].toLowerCase()) }
];
/* only in prose (html/md/txt/xml/svg) and JS string literals: a dot plus a lone last octet, CIDR suffixes */
const TEXT_RULES = [
  { id: "ipv6 unspecified", re: /(?<![\w:])[:]{2}(?![\w:])/g },
  { id: "last octet", re: /(?:^|[\s(→>«])\.\d{1,3}(?::\d{2,5})?(?=$|[\s),;»"'])/gm },
  { id: "cidr", re: /(?<![\w.])\/(?:8|1[6-9]|2\d|3[0-2])\b(?![\w./-])/g }
];

function entropy(s) {
  const f = {};
  for (const c of s) f[c] = (f[c] || 0) + 1;
  let e = 0;
  for (const k in f) { const p = f[k] / s.length; e -= p * Math.log2(p); }
  return e;
}
const LONG_RUN = /[A-Za-z0-9_+/=-]{32,}/g;

/* ---------- scanning ---------- */
function lineCol(text, idx) {
  let line = 1, last = -1;
  for (let i = 0; i < idx; i++) if (text.charCodeAt(i) === 10) { line++; last = i; }
  return [line, idx - last];
}
function mask(s) {
  s = s.replace(/\s+/g, " ").trim();
  if (s.length <= 4) return s[0] + "***";
  return s.slice(0, 2) + "*".repeat(Math.min(12, s.length - 4)) + s.slice(-2);
}

function scanText(text, file, opts) {
  const out = [];
  const add = (rule, idx, m) => { const [l, c] = lineCol(text, idx); out.push({ file, line: l, col: c, rule, sample: mask(m) }); };

  for (const r of RULES) {
    r.re.lastIndex = 0;
    let m;
    while ((m = r.re.exec(text))) {
      if (m[0] === "") { r.re.lastIndex++; continue; }
      if (r.allow && r.allow(m[0], m)) continue;
      add(r.id, m.index, m[0]);
    }
  }

  // Validate complete and compressed IPv6, including mapped addresses and zone suffixes.
  const candidates = /(?<![\w:])[a-f0-9:.]*:[a-f0-9:.]+(?:%[a-z0-9_-]+)?(?![\w:])/gi;
  for (const m of text.matchAll(candidates)) {
    const address = m[0].split("%")[0].replace(/\.$/, "");
    if (/[a-f0-9]/i.test(address) && isIP(address) === 6) add("ipv6", m.index, m[0]);
  }
  // Alternate numeric address forms are meaningful when used as a host or URL.
  const numericHost = /(?:\b(?:ip|address|host)\s*[:=]\s*["']?|:\/\/)(0x[a-f0-9]+|[0-9]+(?:\.[0-9xa-f]+){0,3})(?=[\s/:'"<>]|$)/gi;
  for (const m of text.matchAll(numericHost)) {
    try { new URL("https://" + m[1]); add("numeric address", m.index, m[1]); } catch {}
  }
  const prose = [];
  if (opts.texty) prose.push([0, text]);
  if (opts.js) {
    const strRe = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g;
    let m;
    while ((m = strRe.exec(text))) prose.push([m.index + 1, m[0].slice(1, -1)]);
  }
  for (const [off, s] of prose) {
    for (const r of TEXT_RULES) {
      r.re.lastIndex = 0;
      let m;
      while ((m = r.re.exec(s))) { if (m[0] === "") { r.re.lastIndex++; continue; } add(r.id, off + m.index, m[0]); }
    }
  }

  if (!opts.binary) {
    LONG_RUN.lastIndex = 0;
    let m;
    while ((m = LONG_RUN.exec(text))) {
      const s = m[0];
      const classes = [/[a-z]/, /[A-Z]/, /\d/].filter((re) => re.test(s)).length;
      if (classes >= 3 && entropy(s) > 4.2) add("high-entropy string", m.index, s);
    }
  }

  /* hashed deny-list: words, 2- and 3-word sequences, hyphenated tokens */
  const low = norm(text);
  const words = [];
  const wre = /[a-z0-9]+/g;
  let w;
  while ((w = wre.exec(low))) words.push([w.index, w[0]]);
  for (let i = 0; i < words.length; i++) {
    let phrase = "";
    for (let n = 0; n < 3 && i + n < words.length; n++) {
      phrase = n ? phrase + " " + words[i + n][1] : words[i][1];
      const cat = DENY.get(h16(phrase));
      if (cat) add("private " + cat, words[i][0], text.slice(words[i][0], words[i + n][0] + words[i + n][1].length));
    }
  }
  const tre = /[a-z0-9]+(?:[-_.][a-z0-9]+)+/g;
  while ((w = tre.exec(low))) {
    const cat = DENY.get(h16(w[0]));
    if (cat) add("private " + cat, w.index, text.slice(w.index, w.index + w[0].length));
  }
  if (!opts.decoded) {
    // Also inspect common textual encodings; do not execute source files.
    const decoded = text.normalize("NFKC")
      .replace(/&#(?:x([0-9a-f]{1,6})|([0-9]{1,7}));/gi, (m, hex, dec) => {
        const n = parseInt(hex || dec, hex ? 16 : 10);
        return n <= 0x10ffff ? String.fromCodePoint(n) : m;
      })
      .replace(/\\(?:u\{([0-9a-f]{1,6})\}|u([0-9a-f]{4})|x([0-9a-f]{2}))/gi, (m, a, b, c) => {
        const n = parseInt(a || b || c, 16);
        return n <= 0x10ffff ? String.fromCodePoint(n) : m;
      })
      .replace(/(?:%[0-9a-f]{2})+/gi, (m) => { try { return decodeURIComponent(m); } catch { return m; } });
    if (decoded !== text) out.push(...scanText(decoded, file, { ...opts, decoded: true }));
  }
  return out;
}

function printable(buf, min = 16) {
  /* runs of printable ASCII, so metadata inside binary files is checked too */
  let s = "", run = "";
  for (const b of buf) {
    if (b >= 32 && b < 127) run += String.fromCharCode(b);
    else { if (run.length >= min) s += run + "\n"; run = ""; }
  }
  if (run.length >= min) s += run;
  return s;
}

function binaryText(buf, ext) {
  /* PNG: read only the metadata chunks (text, EXIF), never the compressed pixels */
  if (ext === ".png" && buf.length > 8 && buf.readUInt32BE(0) === 0x89504e47) {
    let out = "", i = 8;
    while (i + 8 <= buf.length) {
      const len = buf.readUInt32BE(i), type = buf.toString("latin1", i + 4, i + 8), data = buf.subarray(i + 8, i + 8 + len);
      if (type === "tEXt") out += data.toString("latin1").replace(/\0/g, ": ") + "\n";
      else if (type === "zTXt") { const z = data.indexOf(0); try { out += data.toString("latin1", 0, z) + ": " + inflateSync(data.subarray(z + 2)).toString("latin1") + "\n"; } catch { out += "unreadable zTXt chunk\n"; } }
      else if (type === "iTXt") { const z = data.indexOf(0); const compressed = data[z + 1] === 1; let rest = data.subarray(z + 3); const a = rest.indexOf(0); rest = rest.subarray(a + 1); const b = rest.indexOf(0); rest = rest.subarray(b + 1);
        try { out += data.toString("latin1", 0, z) + ": " + (compressed ? inflateSync(rest) : rest).toString("utf8") + "\n"; } catch { out += "unreadable iTXt chunk\n"; } }
      else if (type === "eXIf") out += printable(data, 4) + "\n";
      i += 12 + len;
    }
    return out;
  }
  return printable(buf);
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) { if (!SKIP_DIRS.has(name)) walk(p, files); }
    else if (st.isFile()) files.push(p);
  }
  return files;
}

export function scan(dir) {
  const findings = [];
  const files = walk(dir);
  for (const f of files) {
    const ext = extname(f).toLowerCase();
    const rel = relative(dir, f) || f;
    const buf = readFileSync(f);
    const binary = BINARY_EXT.has(ext) || buf.includes(0);
    const text = binary ? binaryText(buf, ext) : buf.toString("utf8");
    findings.push(...scanText(text, rel, { binary, texty: TEXTY_EXT.has(ext), js: ext === ".js" || ext === ".mjs" }));
  }
  findings.push(...scanText(relative(dir, dir) + "\n" + files.map((f) => relative(dir, f)).join("\n"), "(file names)", { binary: true }));
  return { files: files.length, findings };
}

function report(dir, { quiet = false } = {}) {
  const { files, findings } = scan(dir);
  if (!quiet) {
    if (!findings.length) console.log(`check: OK, ${files} files scanned, nothing private found.`);
    else {
      console.error(`check: FAILED, ${findings.length} finding(s) in ${files} files:\n`);
      for (const f of findings) console.error(`  ${f.file}:${f.line}:${f.col}  ${f.rule}  (${f.sample})`);
      console.error("\nRemove or reword these before publishing. Do not weaken the rules.");
    }
  }
  return findings;
}

/* ---------- self-test ---------- */
function selfTest() {
  const base = mkdtempSync(join(process.env.CHECK_TMPDIR || tmpdir(), "homelab-site-check-"));
  const copy = join(base, "site");
  let failed = 0;
  try {
    cpSync(ROOT, copy, { recursive: true, filter: (src) => !SKIP_DIRS.has(src.split(/[\\/]/).pop()) });
    const clean = report(copy, { quiet: true });
    console.log(`${clean.length ? "FAIL" : "ok  "}  clean copy passes (${clean.length} findings)`);
    if (clean.length) { failed++; for (const f of clean) console.log(`        ${f.file}:${f.line} ${f.rule} (${f.sample})`); }

    DENY.set(h16(["syntheticprivacy", "alias"].join("")), "person");
    DENY.set(h16(["reserved", "hostfixture"].join("")), "internal host");
    DENY.set(h16(["nonexistent", "portfixture"].join("")), "service port");
    const j = (...a) => a.join("");
    const samples = [
      ["ipv4", j("192", ".", "168", ".", "1", ".", "5")],
      ["ipv4", ["8", "8", "4", "4"].join(".")],
      ["ipv4-prefix", ["the 192", "168", "1 subnet"].join(".")],
      ["ipv6", ["fe80", "", "1c2", "3ff", "fe44", "5566"].join(":")],
      ["ipv6", ["", "", "1"].join(":")],
      ["ipv6", ["2001", "db8", "", "7"].join(":")],
      ["ipv6", ["", "", "ffff", ["192", "0", "2", "1"].join(".")].join(":")],
      ["ipv6 unspecified", ["", "", ""].join(":")],
      ["ipv4 alternate", ["010", "000", "000", "001"].join(".")],
      ["ipv4 alternate", ["0x7f", "0", "0", "1"].join(".")],
      ["short loopback", ["127", "1"].join(".")],
      ["mac dotted", ["aabb", "ccdd", "eeff"].join(".")],
      ["numeric address", "host=" + "0x" + "7f000001"],
      ["numeric address", "address=" + ["0177", "0", "0", "1"].join(".")],
      ["numeric address", "host=" + (2 ** 31 + 1)],
      ["domain", ["vigab", "cc"].join(".")],
      ["named host", ["container", "name=private-service"].join("_")],
      ["container id", "container id " + "a1b2c3".repeat(2)],
      ["port", "port " + 7],
      ["host:port", ["example.org", 7].join(":")],
      ["bare :port", "service on :" + 53],
      ["last octet", j("forwarded to .", "15 on the LAN")],
      ["cidr", j("subnet /", "24 at home")],
      ["port", j("open UDP ", "4444 on the router")],
      ["host:port", j("photos", ".example.org", ":", "2345")],
      ["bare :port", j("dashboard on ", ":", "8081")],
      ["domain", j("auth", ".vigab", ".cc")],
      ["internal hostname", j("nas", ".lan")],
      ["email", j("someone", "@", "example.org")],
      ["mac", ["aa", "bb", "cc", "dd", "ee", "ff"].join(":")],
      ["github token", "ghp_" + Array.from({ length: 18 }, (_, i) => String.fromCharCode(65 + i) + (i % 10)).join("")],
      ["slack token", "xoxb-" + "a1b2c3d4e5f6"],
      ["aws key", "AKIA" + "A1".repeat(8)],
      ["google key", "AIza" + "aB7".repeat(11) + "xy"],
      ["bot token", "12345678" + ":" + "aB7".repeat(11) + "xy"],
      ["jwt", "eyJ" + "abcDEF12345" + "." + "eyJ" + "abcDEF12345" + "."],
      ["url credentials", "https://" + "example:credential" + String.fromCharCode(64) + "example.org"],
      ["ipv4", [192, 168, 2, 9].map(n => String(n).split("").map(c => "&#" + c.charCodeAt(0) + ";").join("")).join(".")],
      ["domain", ["hidden", "vigab", "cc"].join(".").split("").map(c => "%" + c.charCodeAt(0).toString(16)).join("")],
      ["internal hostname", ["hidden", "local"].join(".").split("").map(c => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")).join("")],
      ["private key", j("-----BEGIN ", "OPENSSH PRIVATE KEY-----")],
      ["wireguard key", randomBytes(32).toString("base64")],
      ["credential", j("pass", "word = hunter2hunter2")],
      ["proxmox id", j("LXC ", "105")],
      ["user path", j("/ho", "me/someuser/notes")],
      ["handle", j("ping @", "someuser on chat")],
      ["high-entropy string", ["Ab3D", "eF6g", "H9jK", "Lm2N", "pQ5r", "St8U", "vW1x", "Yz4A"].join("")],
      ["private person", j("SyntheticPrivacy", "Alias")],
      ["private internal host", j("reserved", "hostfixture")],
      ["private service port", j("nonexistent", "portfixture")]
    ];
    for (const [rule, s] of samples) {
      for (const [where, file] of [["text file", "public/leak.txt"], ["inside DATA", "public/assets/app.js"]]) {
        const target = join(copy, file);
        const orig = where === "text file" ? null : readFileSync(target, "utf8");
        if (orig === null) writeFileSync(target, "Notes: " + s + "\n");
        else writeFileSync(target, orig.replace("const DATA = {", "const DATA = {\n  leak: \"" + s + "\","));
        const hits = report(copy, { quiet: true }).filter((f) => f.file === file && (f.rule === rule || f.rule.startsWith(rule)));
        const ok = hits.length > 0;
        if (!ok) failed++;
        console.log(`${ok ? "ok  " : "FAIL"}  ${rule.padEnd(22)} caught in ${where}`);
        if (orig === null) rmSync(target); else writeFileSync(target, orig);
      }
    }
    /* image metadata: a PNG whose text chunks carry an e-mail and an address */
    const chunk = (type, data) => {
      const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
      const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
      const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body) >>> 0);
      return Buffer.concat([len, body, crc]);
    };
    const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(1, 0); ihdr.writeUInt32BE(1, 4); ihdr[8] = 8; ihdr[9] = 0;
    for (const [rule, type, payload] of [
      ["email", "tEXt", Buffer.from("Author\0" + ["someone", "example.org"].join("@"), "latin1")],
      ["ipv4", "zTXt", Buffer.concat([Buffer.from("Comment\0\0", "latin1"), deflateSync(Buffer.from("taken on " + ["10", "0", "0", "7"].join(".")))])]
    ]) {
      const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr), chunk(type, payload),
        chunk("IDAT", deflateSync(Buffer.from([0, 0]))), chunk("IEND", Buffer.alloc(0))]);
      const target = join(copy, "public", "leak.png");
      writeFileSync(target, png);
      const ok = report(copy, { quiet: true }).some((f) => f.rule === rule && f.file.endsWith("leak.png"));
      if (!ok) failed++;
      console.log(`${ok ? "ok  " : "FAIL"}  ${rule.padEnd(22)} caught in PNG ${type} metadata`);
      rmSync(target);
    }
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
  console.log(failed ? `\nself-test: ${failed} expectation(s) failed` : "\nself-test: all expectations met");
  return failed;
}

/* ---------- CLI ---------- */
const arg = process.argv[2];
if (arg === "--self-test") process.exit(selfTest() ? 1 : 0);
const target = arg ? resolve(arg) : ROOT;
process.exit(report(target).length ? 1 : 0);
