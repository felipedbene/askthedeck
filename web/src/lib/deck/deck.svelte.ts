import { ALL_CARDS, fisherYatesShuffle, type CardId } from './cards.js';

export const MAX_DRAWS = 3;

class DeckState {
	#deck = $state<CardId[]>(fisherYatesShuffle(ALL_CARDS));
	drawn = $state<CardId[]>([]);

	get remaining() {
		return this.#deck.length;
	}

	get canDraw() {
		return this.drawn.length < MAX_DRAWS && this.#deck.length > 0;
	}

	get isComplete() {
		return this.drawn.length >= MAX_DRAWS;
	}

	draw(): CardId | null {
		if (!this.canDraw) return null;
		const card = this.#deck.shift()!;
		this.drawn.push(card);
		return card;
	}

	shuffle() {
		this.#deck = fisherYatesShuffle(ALL_CARDS);
		this.drawn = [];
	}
}

export const deck = new DeckState();
