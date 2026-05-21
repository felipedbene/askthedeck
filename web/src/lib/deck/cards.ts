export type CardId = string;

const MAJOR_ARCANA: CardId[] = [
	'00-TheFool',
	'01-TheMagician',
	'02-TheHighPriestess',
	'03-TheEmpress',
	'04-TheEmperor',
	'05-TheHierophant',
	'06-TheLovers',
	'07-TheChariot',
	'08-Strength',
	'09-TheHermit',
	'10-WheelOfFortune',
	'11-Justice',
	'12-TheHangedMan',
	'13-Death',
	'14-Temperance',
	'15-TheDevil',
	'16-TheTower',
	'17-TheStar',
	'18-TheMoon',
	'19-TheSun',
	'20-Judgement',
	'21-TheWorld'
];

const SUITS = ['Cups', 'Pentacles', 'Swords', 'Wands'] as const;

const MINOR_ARCANA: CardId[] = SUITS.flatMap((suit) =>
	Array.from({ length: 14 }, (_, i) => `${suit}${String(i + 1).padStart(2, '0')}`)
);

export const ALL_CARDS: readonly CardId[] = [...MAJOR_ARCANA, ...MINOR_ARCANA];

export function cardImageUrl(id: CardId): string {
	return `/cards/${id}.png`;
}

type Locale = 'en' | 'pt-BR' | 'es-MX';

const MAJOR_NAMES: Record<Locale, Record<string, string>> = {
	en: {
		'00-TheFool': 'The Fool',
		'01-TheMagician': 'The Magician',
		'02-TheHighPriestess': 'The High Priestess',
		'03-TheEmpress': 'The Empress',
		'04-TheEmperor': 'The Emperor',
		'05-TheHierophant': 'The Hierophant',
		'06-TheLovers': 'The Lovers',
		'07-TheChariot': 'The Chariot',
		'08-Strength': 'Strength',
		'09-TheHermit': 'The Hermit',
		'10-WheelOfFortune': 'Wheel of Fortune',
		'11-Justice': 'Justice',
		'12-TheHangedMan': 'The Hanged Man',
		'13-Death': 'Death',
		'14-Temperance': 'Temperance',
		'15-TheDevil': 'The Devil',
		'16-TheTower': 'The Tower',
		'17-TheStar': 'The Star',
		'18-TheMoon': 'The Moon',
		'19-TheSun': 'The Sun',
		'20-Judgement': 'Judgement',
		'21-TheWorld': 'The World'
	},
	'pt-BR': {
		'00-TheFool': 'O Louco',
		'01-TheMagician': 'O Mago',
		'02-TheHighPriestess': 'A Sacerdotisa',
		'03-TheEmpress': 'A Imperatriz',
		'04-TheEmperor': 'O Imperador',
		'05-TheHierophant': 'O Hierofante',
		'06-TheLovers': 'Os Enamorados',
		'07-TheChariot': 'O Carro',
		'08-Strength': 'A Força',
		'09-TheHermit': 'O Eremita',
		'10-WheelOfFortune': 'A Roda da Fortuna',
		'11-Justice': 'A Justiça',
		'12-TheHangedMan': 'O Enforcado',
		'13-Death': 'A Morte',
		'14-Temperance': 'A Temperança',
		'15-TheDevil': 'O Diabo',
		'16-TheTower': 'A Torre',
		'17-TheStar': 'A Estrela',
		'18-TheMoon': 'A Lua',
		'19-TheSun': 'O Sol',
		'20-Judgement': 'O Julgamento',
		'21-TheWorld': 'O Mundo'
	},
	'es-MX': {
		'00-TheFool': 'El Loco',
		'01-TheMagician': 'El Mago',
		'02-TheHighPriestess': 'La Sacerdotisa',
		'03-TheEmpress': 'La Emperatriz',
		'04-TheEmperor': 'El Emperador',
		'05-TheHierophant': 'El Hierofante',
		'06-TheLovers': 'Los Enamorados',
		'07-TheChariot': 'El Carro',
		'08-Strength': 'La Fuerza',
		'09-TheHermit': 'El Ermitaño',
		'10-WheelOfFortune': 'La Rueda de la Fortuna',
		'11-Justice': 'La Justicia',
		'12-TheHangedMan': 'El Colgado',
		'13-Death': 'La Muerte',
		'14-Temperance': 'La Templanza',
		'15-TheDevil': 'El Diablo',
		'16-TheTower': 'La Torre',
		'17-TheStar': 'La Estrella',
		'18-TheMoon': 'La Luna',
		'19-TheSun': 'El Sol',
		'20-Judgement': 'El Juicio',
		'21-TheWorld': 'El Mundo'
	}
};

const SUIT_NAMES: Record<Locale, Record<string, string>> = {
	en:      { Cups: 'Cups',    Pentacles: 'Pentacles', Swords: 'Swords',  Wands: 'Wands'  },
	'pt-BR': { Cups: 'Copas',   Pentacles: 'Ouros',     Swords: 'Espadas', Wands: 'Paus'   },
	'es-MX': { Cups: 'Copas',   Pentacles: 'Oros',      Swords: 'Espadas', Wands: 'Bastos' }
};

const NUMBER_NAMES: Record<Locale, string[]> = {
	en: ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'],
	'pt-BR': ['Ás', 'Dois', 'Três', 'Quatro', 'Cinco', 'Seis', 'Sete', 'Oito', 'Nove', 'Dez'],
	'es-MX': ['As', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve', 'Diez']
};

const COURT_NAMES: Record<Locale, Record<number, string>> = {
	en:      { 11: 'Page',   12: 'Knight',     13: 'Queen', 14: 'King' },
	'pt-BR': { 11: 'Pajem',  12: 'Cavaleiro',  13: 'Rainha', 14: 'Rei'  },
	'es-MX': { 11: 'Sota',   12: 'Caballero',  13: 'Reina',  14: 'Rey'  }
};

// Connector word for "X of Y": "Seven of Cups", "Sete de Copas", "Siete de Copas"
const OF_CONNECTOR: Record<Locale, string> = { en: 'of', 'pt-BR': 'de', 'es-MX': 'de' };

function normalizeLocale(locale: string): Locale {
	return locale === 'pt-BR' || locale === 'es-MX' ? locale : 'en';
}

/**
 * Convert an internal card id into a human-readable name suitable for
 * prompt / UI text. Always English — this is the canonical form sent to
 * the LLM and stored in D1. For locale-aware display, use
 * cardDisplayNameLocalized().
 */
export function cardDisplayName(id: CardId): string {
	return cardDisplayNameLocalized(id, 'en');
}

/**
 * Locale-aware card display name. Falls back to English for any locale
 * we don't recognize, and to the raw id for any card slug we don't know.
 */
export function cardDisplayNameLocalized(id: CardId, locale: string): string {
	const loc = normalizeLocale(locale);
	const major = MAJOR_NAMES[loc][id];
	if (major) return major;
	const minor = id.match(/^([A-Za-z]+)(\d+)$/);
	if (minor) {
		const suitKey = minor[1];
		const n = parseInt(minor[2], 10);
		const suit = SUIT_NAMES[loc][suitKey] ?? suitKey;
		const court = COURT_NAMES[loc][n];
		if (court) return `${court} ${OF_CONNECTOR[loc]} ${suit}`;
		const num = NUMBER_NAMES[loc][n - 1] ?? String(n);
		return `${num} ${OF_CONNECTOR[loc]} ${suit}`;
	}
	return id;
}

/**
 * Inverse of cardDisplayName — find the canonical CardId for a given
 * display name. Returns null if the name doesn't match any known card.
 * Used to recover the image slug for stored readings (cards_json holds
 * display names, not ids).
 */
let _displayNameToId: Map<string, CardId> | null = null;
export function cardIdFromDisplayName(name: string): CardId | null {
	if (!_displayNameToId) {
		_displayNameToId = new Map();
		for (const id of ALL_CARDS) {
			_displayNameToId.set(cardDisplayName(id).toLowerCase(), id);
		}
	}
	return _displayNameToId.get(name.trim().toLowerCase()) ?? null;
}

/**
 * For SCRUM-5's typographic hierarchy: the "singing" portion of a card
 * name, italicized in gold-bright by TarotCard.svelte.
 *
 * Default rule: the LAST whitespace-delimited token of the localized
 * display name. That gets minors right ("Ten of Swords" → "Swords",
 * "Sete de Copas" → "Copas"), and most majors with a one-word noun
 * ("The Fool" → "Fool", "A Sacerdotisa" → "Sacerdotisa", "La Rueda de
 * la Fortuna" → "Fortuna").
 *
 * Overrides handle compound nouns where italicizing just the last word
 * reads oddly ("The Hanged Man" → italicize "Hanged Man" not "Man";
 * "The High Priestess" → italicize "High Priestess" not "Priestess").
 * In pt-BR / es-MX the equivalents are single nouns so they need no
 * override.
 */
const HIGHLIGHT_OVERRIDES: Partial<Record<Locale, Partial<Record<CardId, string>>>> = {
	en: {
		'02-TheHighPriestess': 'High Priestess',
		'12-TheHangedMan': 'Hanged Man'
	}
};

export function cardHighlightWord(id: CardId, locale: string): string {
	const loc = normalizeLocale(locale);
	const override = HIGHLIGHT_OVERRIDES[loc]?.[id];
	if (override) return override;
	const name = cardDisplayNameLocalized(id, loc);
	const parts = name.split(/\s+/);
	return parts[parts.length - 1];
}

type PositionKey = 'current' | 'growth' | 'potential';

const POSITION_LABELS: Record<Locale, Record<PositionKey, string>> = {
	en:      { current: 'Current State',  growth: 'Focus for Growth',  potential: 'Potential in 7 Days' },
	'pt-BR': { current: 'Estado Atual',   growth: 'Foco para Crescimento', potential: 'Potencial em 7 Dias' },
	'es-MX': { current: 'Estado Actual',  growth: 'Enfoque para Crecer', potential: 'Potencial en 7 Días' }
};

let _positionKeyFromLabel: Map<string, PositionKey> | null = null;

/**
 * Given a position label in ANY supported locale, re-emit it in the
 * requested locale. Used on /r/:slug where the stored position string
 * is in the reading's original locale but should render in the
 * visitor's locale.
 */
export function positionLabelLocalized(label: string, locale: string): string {
	if (!_positionKeyFromLabel) {
		_positionKeyFromLabel = new Map();
		for (const loc of ['en', 'pt-BR', 'es-MX'] as Locale[]) {
			for (const key of ['current', 'growth', 'potential'] as PositionKey[]) {
				_positionKeyFromLabel.set(POSITION_LABELS[loc][key].toLowerCase(), key);
			}
		}
	}
	const key = _positionKeyFromLabel.get(label.trim().toLowerCase());
	if (!key) return label;
	return POSITION_LABELS[normalizeLocale(locale)][key];
}

export function fisherYatesShuffle<T>(items: readonly T[]): T[] {
	const arr = [...items];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}
