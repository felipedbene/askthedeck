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

export function fisherYatesShuffle<T>(items: readonly T[]): T[] {
	const arr = [...items];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}
