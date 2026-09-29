// extract-translations.js
//
// Regenerates the CLIENT half of the translation catalog:
//   resources/client-translations.json
//
// That file is committed, and Common\Localizations\LocalizationsRepository
// merges it with server-translations.json (DEFAULT_TRANS_PATHS) to seed every
// new locale. So this is the manifest of every user-facing string in the React
// app, and anything missing here silently falls back to English at runtime --
// see use-trans.ts, where an unmissed key resolves to itself.
//
// This script scans TypeScript and JavaScript only, for `message('...')` and
// `<Trans message="..." />`. Server-side strings are somebody else's job:
//   php artisan translations:export
// which writes resources/server-translations.json and additionally covers
// `Lang::get`, custom FormRequest validation messages, default menu labels and
// permission names. That command is the authority for PHP; do not duplicate it
// here, because it already scans app/, common/, resources/views,
// resources/lang/en, resources/defaults and vendor/laravel.
//
// Usage:
//   node resources/scripts/extract-translations.js            refresh the catalog
//   node resources/scripts/extract-translations.js --dry-run  report only
//   node resources/scripts/extract-translations.js --prune     also drop orphans
//   node resources/scripts/extract-translations.js --check     exit 1 if stale (CI)

const fs = require('fs');
const path = require('path');

const CATALOG = path.join('resources', 'client-translations.json');

const SOURCE_ROOTS = [
  path.join('resources', 'client'),
  path.join('common', 'foundation', 'resources', 'client'),
];

const EXTENSIONS = /\.(tsx|ts|jsx|js)$/;

// `gen/` holds Orval-generated API schemas. It is excluded because it is
// machine-written and can never contain a translatable literal, and because it
// is large enough to dominate the scan.
const SKIP = /node_modules|\.git|[\\/]gen[\\/]|\.storybook|[\\/]dist[\\/]/;

// A leading boundary so `foo.message('x')` and `errorMessage('x')` are not
// mistaken for the i18n helper.
const MESSAGE_CALL =
  /(?<![\w$.])message\(\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g;

// `[^>]*?` rather than `[\s\S]*?` so the match cannot run past the end of the
// tag and pair a message attribute with a string from some later element.
const TRANS_TAG = /<Trans\b[^>]*?\bmessage=(['"])((?:\\.|(?!\1)[^\\])*)\1/g;

// Same test `ExportTranslations` applies, so a dotted key dropped here is also
// dropped on the server side and the two catalogs stay consistent.
const DOTTED_KEY = /^[^.\s]\S*\.\S*[^.\s]$/;

function* walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, {withFileTypes: true});
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (SKIP.test(full)) continue;
    if (entry.isDirectory()) yield* walk(full);
    else if (EXTENSIONS.test(entry.name)) yield full;
  }
}

function extractFromSource(source) {
  const sentences = new Set();
  const dotted = new Set();
  for (const match of source.matchAll(MESSAGE_CALL)) {
    addKey(sentences, dotted, match[2]);
  }
  for (const match of source.matchAll(TRANS_TAG)) {
    addKey(sentences, dotted, match[2]);
  }
  return {sentences, dotted};
}

function addKey(sentences, dotted, key) {
  if (!key) return;
  if (DOTTED_KEY.test(key)) dotted.add(key);
  else sentences.add(key);
}

function readCatalog() {
  if (!fs.existsSync(CATALOG)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  } catch (error) {
    console.error(`Could not parse ${CATALOG}: ${error.message}`);
    console.error('Fix or delete the file, then re-run. Refusing to overwrite it.');
    process.exit(1);
  }
}

function format(catalog) {
  // Minified and newline-free, matching how the committed file is already
  // written. Pretty-printing here would reformat all 2000-odd existing keys
  // and bury the handful of real changes in the diff.
  return JSON.stringify(catalog);
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const prune = args.includes('--prune');
const check = args.includes('--check');

const files = SOURCE_ROOTS.filter(root => fs.existsSync(root)).flatMap(root => [
  ...walk(root),
]);

const found = new Set();
const dotted = new Set();
for (const file of files) {
  const extracted = extractFromSource(fs.readFileSync(file, 'utf8'));
  for (const key of extracted.sentences) found.add(key);
  for (const key of extracted.dotted) dotted.add(key);
}

const existing = readCatalog();

// Existing values win. The catalog is the seed for every locale, and a value
// that differs from its key is a real translation somebody has written, so
// regenerating it to `key => key` would discard work that is not ours to lose.
const catalog = {...existing};
const added = [];
for (const key of [...found].sort()) {
  if (!(key in catalog)) {
    catalog[key] = key;
    added.push(key);
  }
}

const orphans = Object.keys(existing).filter(key => !found.has(key));
if (prune) {
  for (const key of orphans) {
    delete catalog[key];
  }
}

const changed = added.length > 0 || (prune && orphans.length > 0);

console.log(`Scanned ${files.length} files under ${SOURCE_ROOTS.length} roots`);
console.log(`Distinct client strings in source: ${found.size}`);
console.log(`Keys already in catalog:          ${Object.keys(existing).length}`);
console.log(`Added:                             ${added.length}`);
console.log(`Orphans (in catalog, not in source): ${orphans.length}`);

if (dotted.size) {
  console.log(
    `\n${dotted.size} dotted key(s) skipped -- these look like translation ` +
      'keys rather than sentences and belong in a per-locale PHP file:',
  );
  for (const key of [...dotted].sort()) {
    console.log(`  - ${key}`);
  }
}

if (orphans.length) {
  const verb = prune ? 'Removed' : 'Kept';
  console.log(
    `\n${orphans.length} orphan(s) ${verb}. These are in the catalog but no ` +
      'longer in source, so they may be dead or may live in a directory this ' +
      'script does not scan:',
  );
  for (const key of orphans.slice(0, 20)) {
    console.log(`  - ${key}`);
  }
  if (orphans.length > 20) {
    console.log(`  ... and ${orphans.length - 20} more`);
  }
  if (!prune) {
    console.log('  Re-run with --prune to remove them.');
  }
}

if (added.length) {
  console.log(`\nAdded ${added.length} key(s), first 20:`);
  for (const key of added.slice(0, 20)) {
    console.log(`  + ${key}`);
  }
  if (added.length > 20) {
    console.log(`  ... and ${added.length - 20} more`);
  }
}

if (check) {
  if (changed) {
    console.error(
      '\nCatalog is out of date. Run: node resources/scripts/extract-translations.js',
    );
    process.exit(1);
  }
  console.log('\nCatalog is up to date.');
  process.exit(0);
}

if (dryRun) {
  console.log('\n[dry-run] Nothing written.');
  process.exit(0);
}

if (!changed) {
  console.log('\nCatalog already up to date. Nothing written.');
  process.exit(0);
}

fs.writeFileSync(CATALOG, format(catalog));
console.log(`\nWrote ${CATALOG} (${Object.keys(catalog).length} keys)`);
