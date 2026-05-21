<script lang="ts">
	import { renderMarkdown } from '$lib/markdown.js';

	let { prediction }: { prediction: string } = $props();

	const html = $derived(prediction ? renderMarkdown(prediction) : '');
</script>

<article class="reading-panel">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html html}
</article>

<style>
	.reading-panel {
		max-width: var(--reading-max-width, 740px);
		margin: 0 auto;
		padding: 2.5rem 2.5rem 3rem;
		background: linear-gradient(
			180deg,
			rgba(20, 9, 42, 0.6) 0%,
			rgba(26, 15, 51, 0.4) 100%
		);
		border: 1px solid rgba(212, 168, 90, 0.2);
		border-radius: 12px;
		color: var(--cream);
		font-family: 'Cormorant Garamond', serif;
		font-weight: 400;
		font-size: var(--reading-body-size, 1.15rem);
		line-height: var(--reading-line-height, 1.75);
	}

	.reading-panel :global(h1),
	.reading-panel :global(h2),
	.reading-panel :global(h3),
	.reading-panel :global(h4) {
		font-family: 'Cinzel', serif;
		font-weight: 500;
		color: var(--gold);
		letter-spacing: 0.15em;
		text-transform: uppercase;
		line-height: 1.3;
		margin: 2em 0 0.4em;
		position: relative;
	}

	/* Gradient divider under each section heading, same as the cards. */
	.reading-panel :global(h1)::after,
	.reading-panel :global(h2)::after,
	.reading-panel :global(h3)::after,
	.reading-panel :global(h4)::after {
		content: '';
		display: block;
		width: 24px;
		height: 1px;
		margin-top: 0.6rem;
		background: linear-gradient(90deg, transparent, var(--gold-dim), transparent);
	}

	.reading-panel :global(h1) { font-size: 1.25rem; }
	.reading-panel :global(h2) { font-size: 1.1rem; }
	.reading-panel :global(h3) { font-size: 1rem; }
	.reading-panel :global(h4) { font-size: 0.95rem; }

	.reading-panel :global(p) {
		margin: 0 0 1.25rem;
	}

	/*
	 * Drop-cap on the FIRST paragraph of the reading. The LLM's prompt
	 * structure produces an <h2> first, then a <p>. Both selectors below
	 * cover (a) prediction starts with a heading (normal case) and
	 * (b) prediction starts with prose (defensive fallback).
	 */
	.reading-panel :global(h2 + p::first-letter),
	.reading-panel :global(> p:first-child::first-letter) {
		font-family: 'Cormorant Garamond', serif;
		font-weight: 500;
		font-size: 4.5rem;
		line-height: 1;
		color: var(--gold-bright);
		float: left;
		margin: 0.1em 0.15em -0.1em 0;
	}

	.reading-panel :global(strong) {
		font-weight: 600;
		color: var(--text-soft);
	}

	.reading-panel :global(em) {
		font-style: italic;
		color: var(--gold);
	}

	.reading-panel :global(blockquote) {
		border-left: 2px solid var(--gold);
		padding-left: 1.5rem;
		margin: 1.25rem 0;
		font-style: italic;
		color: var(--text-soft);
	}

	.reading-panel :global(hr) {
		border: none;
		border-top: 1px solid rgba(212, 168, 90, 0.2);
		margin: 1.75rem 0;
	}

	.reading-panel :global(li) {
		display: list-item;
		margin-left: 1.5rem;
		list-style: disc;
	}

	.reading-panel :global(ul),
	.reading-panel :global(ol) {
		margin: 0 0 1.25rem;
	}

	@media (max-width: 600px) {
		.reading-panel {
			padding: 1.5rem 1.25rem 2rem;
			font-size: 1.05rem;
		}
		.reading-panel :global(h2 + p::first-letter),
		.reading-panel :global(> p:first-child::first-letter) {
			font-size: 3.5rem;
		}
	}
</style>
