<script lang="ts">
	import LocaleSwitcher from '$lib/components/LocaleSwitcher.svelte';
	import StackedDeck from '$lib/components/StackedDeck.svelte';
	import ShuffleButton from '$lib/components/ShuffleButton.svelte';
	import CardSlots from '$lib/components/CardSlots.svelte';
	import ReadButton from '$lib/components/ReadButton.svelte';
	import Reading from '$lib/components/Reading.svelte';
	import NewReadingButton from '$lib/components/NewReadingButton.svelte';
	import { deck } from '$lib/deck/deck.svelte.js';
	import { reading } from '$lib/deck/reading.svelte.js';
	import { cardDisplayName } from '$lib/deck/cards.js';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import * as m from '$lib/paraglide/messages.js';

	const POSITION_LABELS = [
		() => m.position_current(),
		() => m.position_growth(),
		() => m.position_potential()
	];

	function handleRead() {
		const cards = deck.drawn.map((id, i) => ({
			position: POSITION_LABELS[i](),
			name: cardDisplayName(id)
		}));
		reading.start(cards, getLocale());
	}

	function handleNewReading() {
		reading.reset();
		deck.shuffle();
	}

	const showReading = $derived(reading.phase !== 'idle');
</script>

<div class="container mx-auto max-w-7xl px-4 py-8">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
		<h1
			class="text-4xl font-bold bg-gradient-to-r from-tarot-gold to-purple-400 bg-clip-text text-transparent"
		>
			{m.app_title()}
		</h1>

		<LocaleSwitcher />
	</div>

	<p class="text-center text-gray-300 mb-2 max-w-2xl mx-auto leading-relaxed">
		{m.app_tagline()}
	</p>

	<p class="text-center text-purple-400 text-sm mb-6 italic">
		{m.cosmic_timing()}
	</p>

	<div class="mt-10 flex flex-col items-center gap-8">
		{#if !showReading}
			<StackedDeck
				remaining={deck.remaining}
				ondraw={deck.canDraw ? () => deck.draw() : undefined}
			/>
			<CardSlots drawn={deck.drawn} />
			<ReadButton visible={deck.isComplete} onread={handleRead} />
			<ShuffleButton onshuffle={() => deck.shuffle()} />
		{:else}
			<Reading />
			{#if reading.phase === 'success' || reading.phase === 'error'}
				<NewReadingButton onreset={handleNewReading} />
			{/if}
		{/if}
	</div>
</div>
