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

const COURT_RANKS: Record<number, string> = {
	11: 'Page',
	12: 'Knight',
	13: 'Queen',
	14: 'King'
};

/**
 * Convert an internal card id into a human-readable name suitable for
 * prompt / UI text. Examples:
 *   "00-TheFool"   -> "The Fool"
 *   "Cups07"       -> "Seven of Cups"
 *   "Wands13"      -> "Queen of Wands"
 */
export function cardDisplayName(id: CardId): string {
	const major = id.match(/^\d{2}-(.+)$/);
	if (major) {
		return major[1].replace(/([a-z])([A-Z])/g, '$1 $2');
	}
	const minor = id.match(/^([A-Za-z]+)(\d+)$/);
	if (minor) {
		const suit = minor[1];
		const n = parseInt(minor[2], 10);
		const court = COURT_RANKS[n];
		if (court) return `${court} of ${suit}`;
		const NUMBERS = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
		return `${NUMBERS[n - 1] ?? n} of ${suit}`;
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

export function fisherYatesShuffle<T>(items: readonly T[]): T[] {
	const arr = [...items];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}
