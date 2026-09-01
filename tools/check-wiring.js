/* Checks the wiring between files that the level checker cannot see:
   translations that exist in one language but not the other, keys the markup
   or the scripts ask for that nobody defined, and components a level names
   that the knowledge base has never heard of.

   Node only, no dependencies — the browser code is read as text so that this
   never needs a DOM.                                                       */

const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = f => fs.readFileSync(path.join(root, f), "utf8");

const { I18N } = require("../js/i18n.js");
const { KNOWLEDGE, QUIZ_KINDS } = require("../js/knowledge.js");
const { LEVELS } = require("../js/levels.js");

const problems = [];
const note = msg => problems.push(msg);

/* ------------------------------------------------- the two dictionaries -- */
const en = Object.keys(I18N.en), zh = Object.keys(I18N.zh);
for (const k of en) if (!zh.includes(k)) note(`i18n: "${k}" is missing from the Mandarin dictionary`);
for (const k of zh) if (!en.includes(k)) note(`i18n: "${k}" is missing from the English dictionary`);
for (const [lang, dict] of Object.entries(I18N)) {
  for (const [k, v] of Object.entries(dict)) {
    if (typeof v !== "string" || !v.trim()) note(`i18n: ${lang}."${k}" is empty`);
  }
}

/* ---------------------------------------- keys the markup and code ask for */
const has = k => Object.prototype.hasOwnProperty.call(I18N.en, k);

for (const file of ["index.html", "editor.html"]) {
  const html = read(file);
  for (const m of html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)) {
    if (!has(m[1])) note(`${file}: data-i18n="${m[1]}" has no translation`);
  }
}

const scripts = ["js/main.js", "js/editor.js"];
for (const file of scripts) {
  const src = read(file);
  for (const m of src.matchAll(/\bt\("([^"]+)"(\s*\+)?/g)) {
    if (m[2]) continue;                      // t("death." + key) — checked below
    if (!has(m[1])) note(`${file}: t("${m[1]}") has no translation`);
  }
  /* families built by concatenation — t("death." + key) and friends */
  for (const m of src.matchAll(/\bt\("([a-zA-Z.]+\.)"\s*\+/g)) {
    const prefix = m[1];
    if (!en.some(k => k.startsWith(prefix))) note(`${file}: nothing defined under "${prefix}*"`);
  }
}

/* the editor names its brushes and groups as bare string literals */
for (const m of read("js/editor.js").matchAll(/"(ed\.[a-zA-Z.]+)"/g)) {
  if (!has(m[1])) note(`js/editor.js: brush label "${m[1]}" has no translation`);
}

/* every way the engine can kill you needs a message */
for (const m of read("js/engine.js").matchAll(/this\.die\("([a-z]+)"\)/g)) {
  if (!has("death." + m[1])) note(`engine: death reason "${m[1]}" has no message`);
}

/* --------------------------------------------------------- knowledge base */
for (const [id, entry] of Object.entries(KNOWLEDGE)) {
  for (const lang of ["en", "zh"]) {
    if (!entry[lang] || !entry[lang].name || !entry[lang].note) note(`knowledge: ${id} is incomplete in ${lang}`);
  }
  if (!["hardware", "software", "tool", "malware"].includes(entry.group)) {
    note(`knowledge: ${id} has an unknown group "${entry.group}"`);
  }
}
if (QUIZ_KINDS.length < 3) note("knowledge: the quiz needs at least three components to choose between");

for (const level of LEVELS) {
  for (const [ch, list] of Object.entries(level.kinds || {})) {
    for (const kind of list) {
      if (!KNOWLEDGE[kind]) note(`${level.name}: kinds.${ch} names "${kind}", which the knowledge base does not define`);
    }
  }
  if (!level.par) note(`${level.name}: no par move count (run: node tools/solve.js <n>)`);
}

/* ------------------------------------------------------------------ done */
if (problems.length) {
  console.log("FAIL  wiring check");
  problems.forEach(p => console.log("      - " + p));
  process.exit(1);
}
console.log(`ok    wiring check — ${en.length} strings in both languages, ` +
  `${Object.keys(KNOWLEDGE).length} knowledge entries, ${LEVELS.length} levels`);
