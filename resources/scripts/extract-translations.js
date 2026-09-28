// extract-translations.js
// Scans PHP/Blade source for Laravel translation calls (__(), trans(), @lang)
// and generates resources/lang/en.json with sentence keys (gitignored *.json).
// Dotted keys are reported against committed PHP files without modifying them.
// --dry-run: preview changes only.

const fs = require('fs');
const path = require('path');

const GITIGNORED_JSON = path.join('resources', 'lang', 'en', 'en.json');
const LANG_DIR = path.join('resources', 'lang', 'en');
const SOURCE_ROOTS = [
  'app',
  'resources/views',
  'common/foundation/resources/views',
  'common/foundation/resources/lists',
];

const SKIP = /node_modules|\.git|\/vendor\//;

function *walk(dir) {
  let ents;
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (SKIP.test(p)) continue;
    if (e.isDirectory()) yield *walk(p);
    else if (/\.php$/.test(e.name)) yield p;
  }
}

function extractKeysFromSource(src) {
  const keys = { sentence: new Set(), dotted: new Set() };
  // __() and trans()
  const re1 = /(?<![\w$>])(__|trans)\s*\(\s*(['"])((?:\\.|(?!\2)[^\\])*)\2/g;
  let m;
  while ((m = re1.exec(src))) {
    const key = m[3];
    if (key.includes('.')) keys.dotted.add(key);
    else keys.sentence.add(key);
  }
  // @lang() in Blade
  const re2 = /@lang\s*\(\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g;
  let m2;
  while ((m2 = re2.exec(src))) {
    const key = m2[2];
    if (key.includes('.')) keys.dotted.add(key);
    else keys.sentence.add(key);
  }
  return keys;
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

function *walk(dir) {
  let ents;
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (SKIP.test(p)) continue;
    if (e.isDirectory()) yield *walk(p);
    else if (/\.php$/.test(e.name)) yield p;
  }
}

// locate source files
const files = [...new Set(
  ...SOURCE_ROOTS.map(root => [...walk(root)].flat())
)].filter(f => !SKIP.test(f));

console.log(`Scanning ${files.length} PHP/Blade files`);

// collect keys
let sentenceKeys = new Set(), dottedKeys = new Set();
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const k = extractKeysFromSource(src);
  sentenceKeys = new Set([...sentenceKeys, ...k.sentence]);
  dottedKeys = new Set([...dottedKeys, ...k.dotted]);
}

// load existing en.json if present (gitignored artifact)
let existingJSON = new Map();
if (!dryRun && fs.existsSync(GITIGNORED_JSON)) {
  try {
    const raw = JSON.parse(fs.readFileSync(GITIGNORED_JSON, 'utf8'));
    existingJSON = new Map(Object.entries(raw));
    console.log(`Loaded existing en.json: ${existingJSON.size} entries`);
  } catch (e) {
    console.error('Failed to parse existing en.json:', e.message);
  }
}

// ---- write sentence keys to en.json ----
const newSentenceEntries = new Map();
for (const key of sentenceKeys) {
  if (existingJSON.has(key)) continue;
  newSentenceEntries.set(key, key);
}

if (dryRun) {
  console.log(`[dry-run] Would add ${newSentenceEntries.size} new sentence keys to en.json`);
  console.log(`Found ${dottedKeys.size} dotted keys in source`);
  // simple report: which PHP files might contain which dotted keys, by basename
  const byBasename = {};
  for (const dk of [...dottedKeys].sort()) {
    const seg = dk.split('.')[0];
    if (!byBasename[seg]) byBasename[seg] = [];
    byBasename[seg].push(dk);
  }
  for (const [basename, keys] of Object.entries(byBasename).sort()) {
    const phpFile = path.join(LANG_DIR, basename + '.php');
    console.log(`  ${phpFile}: ${keys.length} dotted keys`);
  }
  process.exit(0);
}

// merge new entries into existing JSON, preserving everything
const merged = new Map(existingJSON);
for (const [k, v] of newSentenceEntries) merged.set(k, v);

const outJson = JSON.stringify([...merged.entries()], null, 2);
fs.writeFileSync(GITIGNORED_JSON, outJson + '\n');
console.log(`Wrote ${newSentenceEntries.size} new sentence keys to ${GITIGNORED_JSON}`);
console.log(`Total en.json now has ${merged.size} entries`);

console.log('\ndone. Review the generated en.json. Dotted keys reported above can be');
console.log('hand-added to the matching resources/lang/en/*.php files as needed.');