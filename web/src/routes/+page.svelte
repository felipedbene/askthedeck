<script lang="ts">
	import LocaleSwitcher from '$lib/components/LocaleSwitcher.svelte';
	import StackedDeck from '$lib/components/StackedDeck.svelte';
	import ShuffleButton from '$lib/components/ShuffleButton.svelte';
	import CardSlots from '$lib/components/CardSlots.svelte';
	import ReadButton from '$lib/components/ReadButton.svelte';
	import Reading from '$lib/components/Reading.svelte';
	import NewReadingButton from '$lib/components/NewReadingButton.svelte';
	import ShareControls from '$lib/components/ShareControls.svelte';
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
	<div class="header-row">
		<h1 class="page-title">{m.app_title()}</h1>
		<LocaleSwitcher />
	</div>
	<div class="title-rule" aria-hidden="true"></div>

	<div class="intro">
		<p class="intro-body">{m.app_tagline()}</p>
		<p class="intro-subtitle">{m.cosmic_timing()}</p>
	</div>

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
			<Reading cards={deck.drawn} />
			{#if reading.phase === 'success'}
				<ShareControls readingId={reading.readingId} />
			{/if}
			{#if reading.phase === 'success' || reading.phase === 'error'}
				<NewReadingButton onreset={handleNewReading} />
			{/if}
		{/if}
	</div>

	<p class="mt-12 text-center text-xs text-purple-300/40 max-w-xl mx-auto leading-relaxed">
		{m.privacy_notice()}
	</p>
</div>

<style>
	.header-row {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		text-align: center;
	}

	@media (min-width: 640px) {
		.header-row {
			flex-direction: row;
			justify-content: space-between;
			text-align: left;
		}
	}

	.page-title {
		font-family: 'Cinzel', serif;
		font-weight: 600;
		font-size: clamp(2.5rem, 6vw, 4rem);
		letter-spacing: 0.08em;
		color: var(--gold-bright);
		margin: 0;
		line-height: 1.1;
	}

	.title-rule {
		width: 80px;
		height: 1px;
		margin: 0.75rem auto 1.5rem;
		background: linear-gradient(90deg, transparent, var(--gold-dim), transparent);
	}

	.intro {
		max-width: 640px;
		margin: 0 auto 3rem;
		text-align: center;
	}

	.intro-body {
		font-family: 'Inter', system-ui, sans-serif;
		font-weight: 400;
		font-size: 1rem;
		line-height: 1.7;
		color: var(--text-soft);
		max-width: 580px;
		margin: 0 auto;
	}

	.intro-subtitle {
		font-family: 'Cormorant Garamond', serif;
		font-style: italic;
		font-weight: 400;
		font-size: 1.1rem;
		letter-spacing: 0.02em;
		color: var(--gold);
		margin: 1rem auto 0;
	}
</style>
