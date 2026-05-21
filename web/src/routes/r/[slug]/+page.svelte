<script lang="ts">
	import { renderMarkdown } from '$lib/markdown.js';
	import {
		cardImageUrl,
		cardIdFromDisplayName,
		cardDisplayNameLocalized,
		cardHighlightWord,
		positionLabelLocalized
	} from '$lib/deck/cards.js';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import * as m from '$lib/paraglide/messages.js';
	import { trackEvent } from '$lib/api/events.js';
	import TarotCard from '$lib/components/TarotCard.svelte';
	import type { PageData } from './$types.js';

	const REVEAL_DELAYS = [0.1, 0.25, 0.4];

	function handleCloserClick() {
		trackEvent('inline_closer_clicked');
	}

	let { data }: { data: PageData } = $props();

	const html = $derived(renderMarkdown(data.reading.prediction));

	function localizedPosition(label: string | undefined): string {
		if (!label) return '';
		return positionLabelLocalized(label, getLocale());
	}
</script>

<svelte:head>
	<title>{data.og.title}</title>
	<meta name="description" content={data.og.description} />
	<link rel="canonical" href={data.og.url} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.og.title} />
	<meta property="og:description" content={data.og.description} />
	<meta property="og:url" content={data.og.url} />
	<meta property="og:image" content={data.og.image} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.og.title} />
	<meta name="twitter:description" content={data.og.description} />
	<meta name="twitter:image" content={data.og.image} />
</svelte:head>

<div class="container mx-auto max-w-2xl px-4 py-10">
	<header class="mb-6 text-center">
		<a
			href="/"
			class="text-3xl font-bold bg-gradient-to-r from-tarot-gold to-purple-400 bg-clip-text text-transparent inline-block"
		>
			Ask The Deck
		</a>
		<p class="text-sm text-purple-300/80 mt-2 italic">A reading, shared.</p>
	</header>

	{#if data.reading.cards.length > 0}
		<div class="strip" aria-label="The spread">
			{#each data.reading.cards as card, i}
				{@const id = cardIdFromDisplayName(card.name ?? '')}
				{@const nameLoc = id
					? cardDisplayNameLocalized(id, getLocale())
					: (card.name ?? '')}
				{@const posLoc = localizedPosition(card.position)}
				{#if id}
					<TarotCard
						imageSrc={cardImageUrl(id)}
						positionLabel={posLoc}
						cardName={nameLoc}
						highlightWord={cardHighlightWord(id, getLocale())}
						revealDelay={REVEAL_DELAYS[i] ?? 0}
					/>
				{:else}
					<!-- Unknown card slug fallback: render the stored name plainly,
					     no image lookup possible. Keeps the layout intact. -->
					<div class="card-fallback">
						{#if posLoc}<span>{posLoc}</span>{/if}
						{#if nameLoc}<strong>{nameLoc}</strong>{/if}
					</div>
				{/if}
			{/each}
		</div>
	{/if}

	<article class="prediction">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	</article>

	<p class="closer">
		{m.reading_closer_text()}
		<a href="/apoiar" onclick={handleCloserClick}>{m.reading_closer_link()}</a>
	</p>

	<footer class="mt-10 text-center text-sm text-purple-300/60">
		<a href="/" class="underline hover:text-purple-200">Draw your own three-card spread →</a>
	</footer>
</div>

<style>
	.strip {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
		margin-bottom: 1.75rem;
	}

	@media (min-width: 480px) {
		.strip { gap: 1.25rem; }
	}

	.card-fallback {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.85rem;
		color: var(--cream);
	}

	.prediction {
		padding: 1.75rem 1.5rem;
		background: linear-gradient(180deg, rgba(107, 70, 193, 0.12), rgba(26, 22, 37, 0.6));
		border: 1px solid rgba(212, 175, 55, 0.25);
		border-radius: 0.75rem;
		color: rgb(229 231 235);
		line-height: 1.7;
	}

	.prediction :global(h1),
	.prediction :global(h2),
	.prediction :global(h3),
	.prediction :global(h4) {
		color: #d4af37;
		font-weight: 600;
		margin: 1.25em 0 0.5em;
		line-height: 1.3;
	}

	.prediction :global(h1) { font-size: 1.5rem; }
	.prediction :global(h2) { font-size: 1.25rem; }
	.prediction :global(h3) { font-size: 1.1rem; }
	.prediction :global(h4) { font-size: 1rem; }

	.prediction :global(strong) {
		color: rgb(216 180 254);
		font-weight: 600;
	}

	.prediction :global(em) {
		color: rgb(196 181 253);
		font-style: italic;
	}

	.closer {
		margin: 1.5rem 0 0;
		text-align: center;
		font-size: 0.78rem;
		color: rgb(196 181 253 / 0.6);
		line-height: 1.5;
	}

	.closer a {
		color: rgb(216 180 254 / 0.85);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.closer a:hover,
	.closer a:focus-visible {
		color: #d4af37;
		outline: none;
	}
</style>
