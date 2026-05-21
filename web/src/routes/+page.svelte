<script lang="ts">
	/**
	 * Ask The Deck - Home Page (Phase 1: Stub)
	 *
	 * This is a minimal implementation to test:
	 * - SvelteKit + Tailwind integration
	 * - i18n with Paraglide (three locales)
	 * - Locale switcher component
	 * - Mobile-first responsive design
	 *
	 * Phase 2 will add the actual card interaction logic.
	 */

	import LocaleSwitcher from '$lib/components/LocaleSwitcher.svelte';
	import StackedDeck from '$lib/components/StackedDeck.svelte';
	import ShuffleButton from '$lib/components/ShuffleButton.svelte';
	import CardSlots from '$lib/components/CardSlots.svelte';
	import ReadButton from '$lib/components/ReadButton.svelte';
	import { deck } from '$lib/deck/deck.svelte.js';
	import * as m from '$lib/paraglide/messages.js';

	function handleRead() {
		// TODO: call the reading API (/api/reading/start) and poll status.
		// For now this is a placeholder so the button is wired end-to-end.
		console.log('Read requested for cards:', deck.drawn);
	}
</script>

<div class="container mx-auto max-w-7xl px-4 py-8">
	<!-- Header with title and locale switcher -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
		<h1
			class="text-4xl font-bold bg-gradient-to-r from-tarot-gold to-purple-400 bg-clip-text text-transparent"
		>
			{m.app_title()}
		</h1>

		<LocaleSwitcher />
	</div>

	<!-- Tagline -->
	<p class="text-center text-gray-300 mb-2 max-w-2xl mx-auto leading-relaxed">
		{m.app_tagline()}
	</p>

	<!-- Cosmic timing message -->
	<p class="text-center text-purple-400 text-sm mb-6 italic">
		{m.cosmic_timing()}
	</p>

	<div class="mt-10 flex flex-col items-center gap-8">
		<StackedDeck
			remaining={deck.remaining}
			ondraw={deck.canDraw ? () => deck.draw() : undefined}
		/>
		<CardSlots drawn={deck.drawn} />
		<ReadButton visible={deck.isComplete} onread={handleRead} />
		<ShuffleButton onshuffle={() => deck.shuffle()} />
	</div>
</div>
