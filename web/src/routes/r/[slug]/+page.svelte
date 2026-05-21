<script lang="ts">
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
	import ReadingPanel from '$lib/components/ReadingPanel.svelte';
	import type { PageData } from './$types.js';

	const REVEAL_DELAYS = [0.1, 0.25, 0.4];

	function handleCloserClick() {
		trackEvent('inline_closer_clicked');
	}

	let { data }: { data: PageData } = $props();

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

<div class="container mx-auto max-w-3xl px-4 py-10">
	<header class="page-header">
		<a href="/" class="page-title">Ask The Deck</a>
		<div class="title-rule" aria-hidden="true"></div>
		<p class="subtitle">A reading, shared.</p>
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

	<div class="ornament" aria-hidden="true">✦</div>
	<ReadingPanel prediction={data.reading.prediction} />

	<p class="closer">
		{m.reading_closer_text()}
		<a href="/apoiar" onclick={handleCloserClick}>{m.reading_closer_link()}</a>
	</p>

	<footer class="mt-10 text-center text-sm text-purple-300/60">
		<a href="/" class="underline hover:text-purple-200">Draw your own three-card spread →</a>
	</footer>
</div>

<style>
	.page-header {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.page-title {
		display: inline-block;
		font-family: 'Cormorant Garamond', serif;
		font-weight: 500;
		font-size: clamp(2rem, 4.5vw, 2.75rem);
		letter-spacing: 0.02em;
		color: var(--cream);
		text-decoration: none;
		line-height: 1.1;
	}

	.title-rule {
		width: 80px;
		height: 1px;
		margin: 0.75rem auto 0.5rem;
		background: linear-gradient(90deg, transparent, var(--gold-dim), transparent);
	}

	.subtitle {
		font-family: 'Cormorant Garamond', serif;
		font-style: italic;
		font-weight: 400;
		font-size: 1rem;
		color: var(--gold);
		letter-spacing: 0.02em;
		margin-top: 0.5rem;
	}

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

	.ornament {
		text-align: center;
		font-size: 1.5rem;
		color: var(--gold);
		margin: 1rem 0 0.5rem;
		line-height: 1;
		user-select: none;
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
		color: var(--gold);
		outline: none;
	}
</style>
