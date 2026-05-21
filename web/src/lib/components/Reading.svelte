<script lang="ts">
	import { reading } from '$lib/deck/reading.svelte.js';
	import { renderMarkdown } from '$lib/markdown.js';
	import {
		cardDisplayNameLocalized,
		cardImageUrl,
		type CardId
	} from '$lib/deck/cards.js';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import * as m from '$lib/paraglide/messages.js';

	let { cards = [] }: { cards?: CardId[] } = $props();

	const POSITION_LABELS = [
		() => m.position_current(),
		() => m.position_growth(),
		() => m.position_potential()
	];

	const PROGRESS_MESSAGES = [
		() => m.progress_msg_1(),
		() => m.progress_msg_2(),
		() => m.progress_msg_3(),
		() => m.progress_msg_4(),
		() => m.progress_msg_5(),
		() => m.progress_msg_6(),
		() => m.progress_msg_7(),
		() => m.progress_msg_8()
	];

	const localizedName = (card: CardId) => cardDisplayNameLocalized(card, getLocale());

	const progressMessage = $derived.by(() => {
		const idx = reading.messageIndex;
		if (idx !== null && idx >= 0 && idx < PROGRESS_MESSAGES.length) {
			return PROGRESS_MESSAGES[idx]();
		}
		return reading.message || m.loading_preparing();
	});

	const html = $derived(reading.prediction ? renderMarkdown(reading.prediction) : '');
</script>

<div class="reading">
	{#if cards.length > 0}
		<div class="strip" aria-label="Your spread">
			{#each cards as card, i}
				<figure class="strip-card">
					<img src={cardImageUrl(card)} alt={localizedName(card)} draggable="false" />
					<figcaption>
						<span class="strip-position">{POSITION_LABELS[i]?.() ?? ''}</span>
						<span class="strip-name">{localizedName(card)}</span>
					</figcaption>
				</figure>
			{/each}
		</div>
	{/if}

	{#if reading.phase === 'pending'}
		<div class="loading">
			<div class="spinner" aria-hidden="true"></div>
			<p class="loading-msg">{progressMessage}</p>
			{#if reading.progress > 0}
				<div class="progress-track" aria-hidden="true">
					<div class="progress-fill" style:width="{reading.progress}%"></div>
				</div>
			{/if}
		</div>
	{:else if reading.phase === 'error'}
		<div class="error" role="alert">
			<p>{m.loading_error({ error: reading.error })}</p>
		</div>
	{:else if reading.phase === 'success'}
		<article class="prediction">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html html}
		</article>
		<p class="closer">
			{m.reading_closer_text()}
			<a href="/apoiar">{m.reading_closer_link()}</a>
		</p>
	{/if}
</div>

<style>
	.reading {
		width: 100%;
		max-width: 36rem;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.strip {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
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
		max-width: 6.5rem;
		aspect-ratio: 1 / 1.6;
		object-fit: contain;
		border-radius: 0.4rem;
		background-color: #2a2235;
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.35),
			0 0 0 1px rgba(212, 175, 55, 0.2) inset;
		user-select: none;
		-webkit-user-drag: none;
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

	@media (min-width: 480px) {
		.strip { gap: 1rem; }
		.strip-position { font-size: 0.7rem; }
		.strip-name { font-size: 0.85rem; }
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 2rem 1rem;
	}

	.spinner {
		width: 2.5rem;
		height: 2.5rem;
		border: 3px solid rgba(212, 175, 55, 0.2);
		border-top-color: #d4af37;
		border-radius: 50%;
		animation: spin 900ms linear infinite;
	}

	.loading-msg {
		color: rgb(216 180 254);
		font-style: italic;
		text-align: center;
	}

	.progress-track {
		width: 100%;
		max-width: 16rem;
		height: 4px;
		background: rgba(212, 175, 55, 0.15);
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #6b46c1, #d4af37);
		transition: width 400ms ease;
	}

	.error {
		padding: 1.25rem 1rem;
		background: rgba(127, 29, 29, 0.25);
		border: 1px solid rgba(248, 113, 113, 0.4);
		border-radius: 0.5rem;
		color: rgb(252 165 165);
		text-align: center;
	}

	.prediction {
		padding: 1.5rem 1.25rem;
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

	.prediction :global(hr) {
		border: none;
		border-top: 1px solid rgba(212, 175, 55, 0.2);
		margin: 1.5rem 0;
	}

	.prediction :global(li) {
		display: list-item;
		margin-left: 1.5rem;
		list-style: disc;
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

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	@media (prefers-reduced-motion: reduce) {
		.spinner { animation: none; }
		.progress-fill { transition: none; }
	}
</style>
