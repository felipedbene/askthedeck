// Tarot glossary regression guard. Fails the build when:
//  1. any locale is missing a name for any of the 78 cards or 3 positions;
//  2. the 78 card names are not unique within a locale;
//  3. the three message files do not share an identical key set;
//  4. a card name or forbidden synonym is hardcoded outside the glossary.
// Runs under plain `node` (Node >=22 strips TS types natively).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const cards = await import(join(webRoot, 'src/lib/deck/cards.ts'));

const LOCALES = ['en', 'pt-BR', 'es-MX'];
const errors = [];

// 1 + 2: completeness and uniqueness of all 78 names per locale.
for (const locale of LOCALES) {
	const names = new Map();
	for (const id of cards.ALL_CARDS) {
		const name = cards.cardDisplayNameLocalized(id, locale);
		if (!name || name === id) {
			errors.push(`[${locale}] card ${id} has no localized name`);
			continue;
		}
		if (names.has(name)) {
			errors.push(`[${locale}] duplicate card name "${name}" (${names.get(name)} and ${id})`);
		}
		names.set(name, id);
	}
	if (names.size !== 78 && cards.ALL_CARDS.length === 78) {
		errors.push(`[${locale}] expected 78 unique card names, got ${names.size}`);
	}
	const labels = new Set();
	for (const key of cards.SPREAD_POSITIONS) {
		const label = cards.positionLabel(key, locale);
		if (!label) errors.push(`[${locale}] missing position label for "${key}"`);
		if (labels.has(label)) errors.push(`[${locale}] duplicate position label "${label}"`);
		labels.add(label);
	}
}

// 3: message files must have identical key sets.
const keySets = LOCALES.map((locale) => {
	const file = join(webRoot, 'messages', `${locale}.json`);
	return { locale, keys: Object.keys(JSON.parse(readFileSync(file, 'utf8'))).sort() };
});
const reference = JSON.stringify(keySets[0].keys);
for (const { locale, keys } of keySets.slice(1)) {
	if (JSON.stringify(keys) !== reference) {
		const a = new Set(keySets[0].keys);
		const b = new Set(keys);
		const missing = [...a].filter((k) => !b.has(k));
		const extra = [...b].filter((k) => !a.has(k));
		errors.push(
			`messages/${locale}.json key set differs from en.json` +
				(missing.length ? ` (missing: ${missing.join(', ')})` : '') +
				(extra.length ? ` (extra: ${extra.join(', ')})` : '')
		);
	}
}

// 4: no hardcoded card names / forbidden synonyms outside the glossary.
// reading.ts is allowed: its prompt text deliberately names the synonyms
// it forbids, and its continuity example cites a card in English.
const ALLOWED = new Set(['src/lib/deck/cards.ts', 'src/lib/server/reading.ts']);
const allNames = new Set();
for (const locale of LOCALES) {
	for (const id of cards.ALL_CARDS) {
		allNames.add(cards.cardDisplayNameLocalized(id, locale));
	}
}
const FORBIDDEN_SYNONYMS = ['Valete', 'Sota', 'Varas'];
const namePattern = new RegExp(
	`['"\`](${[...allNames, ...FORBIDDEN_SYNONYMS]
		.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
		.join('|')})['"\`]`,
	'u'
);

function* walk(dir) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			if (entry === 'paraglide' || entry === 'node_modules') continue;
			yield* walk(full);
		} else if (/\.(ts|svelte|js)$/.test(entry)) {
			yield full;
		}
	}
}

for (const file of walk(join(webRoot, 'src'))) {
	const rel = relative(webRoot, file);
	if (ALLOWED.has(rel.split('\\').join('/'))) continue;
	const lines = readFileSync(file, 'utf8').split('\n');
	lines.forEach((line, i) => {
		const match = line.match(namePattern);
		if (match) {
			errors.push(`hardcoded card term ${match[0]} at ${rel}:${i + 1} — use the glossary (src/lib/deck/cards.ts)`);
		}
	});
}

if (errors.length > 0) {
	console.error(`check-glossary: ${errors.length} error(s)`);
	for (const e of errors) console.error(`  - ${e}`);
	process.exit(1);
}
console.log('check-glossary: OK (78 cards × 3 locales, positions, message keys, no hardcoded names)');
