<script lang="ts">
	import { renderMarkdown } from '$lib/markdown.js';
	import {
		cardImageUrl,
		cardIdFromDisplayName,
		cardDisplayNameLocalized,
		positionLabelLocalized
	} from '$lib/deck/cards.js';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import * as m from '$lib/paraglide/messages.js';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	const html = $derived(renderMarkdown(data.reading.prediction));

	function imageFor(name: string | undefined): string | null {
		if (!name) return null;
		const id = cardIdFromDisplayName(name);
		return id ? cardImageUrl(id) : null;
	}

	function localizedCardName(name: string | undefined): string {
		if (!name) return '';
		const id = cardIdFromDisplayName(name);
		return id ? cardDisplayNameLocalized(id, getLocale()) : name;
	}

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
			{#each data.reading.cards as card}
				{@const img = imageFor(card.name)}
				{@const nameLoc = localizedCardName(card.name)}
				{@const posLoc = localizedPosition(card.position)}
				<figure class="strip-card">
					{#if img}
						<img src={img} alt={nameLoc} draggable="false" />
					{/if}
					<figcaption>
						{#if posLoc}<span class="strip-position">{posLoc}</span>{/if}
						{#if nameLoc}<span class="strip-name">{nameLoc}</span>{/if}
					</figcaption>
				</figure>
			{/each}
		</div>
	{/if}

	<article class="prediction">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	</article>

	<p class="closer">
		{m.reading_closer_text()}
		<a href="/apoiar">{m.reading_closer_link()}</a>
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

	.strip-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		margin: 0;
		min-width: 0;
	}

	.strip-card img {
		width: 100%;
		max-width: 7rem;
		aspect-ratio: 1 / 1.6;
		object-fit: contain;
		border-radius: 0.4rem;
		background-color: #2a2235;
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.35),
			0 0 0 1px rgba(212, 175, 55, 0.2) inset;
	}

	.strip-card figcaption {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.1rem;
		text-align: center;
		line-height: 1.2;
	}

	.strip-position {
		font-size: 0.65rem;
		color: rgb(196 181 253);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.strip-name {
		font-size: 0.75rem;
		color: #d4af37;
		font-weight: 600;
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
