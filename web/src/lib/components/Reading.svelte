<script lang="ts">
	import { reading } from '$lib/deck/reading.svelte.js';
	import {
		cardDisplayNameLocalized,
		cardImageUrl,
		cardHighlightWord,
		type CardId
	} from '$lib/deck/cards.js';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import * as m from '$lib/paraglide/messages.js';
	import { trackEvent } from '$lib/api/events.js';
	import TarotCard from '$lib/components/TarotCard.svelte';
	import ReadingPanel from '$lib/components/ReadingPanel.svelte';

	const REVEAL_DELAYS = [0.1, 0.25, 0.4];

	function handleCloserClick() {
		trackEvent('inline_closer_clicked');
	}

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
</script>

<div class="reading">
	{#if cards.length > 0}
		<div class="strip" aria-label="Your spread">
			{#each cards as card, i}
				<TarotCard
					imageSrc={cardImageUrl(card)}
					positionLabel={POSITION_LABELS[i]?.() ?? ''}
					cardName={localizedName(card)}
					highlightWord={cardHighlightWord(card, getLocale())}
					revealDelay={REVEAL_DELAYS[i] ?? 0}
				/>
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
		<div class="ornament" aria-hidden="true">✦</div>
		<ReadingPanel prediction={reading.prediction} />
		<p class="closer">
			{m.reading_closer_text()}
			<a href="/apoiar" onclick={handleCloserClick}>{m.reading_closer_link()}</a>
		</p>
	{/if}
</div>

<style>
	.reading {
		width: 100%;
		max-width: var(--reading-max-width, 740px);
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.strip {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
		padding: 0.25rem 0;
		max-width: 36rem;
		margin: 0 auto;
		width: 100%;
	}

	@media (min-width: 480px) {
		.strip { gap: 1.25rem; }
	}

	.ornament {
		text-align: center;
		font-size: 1.5rem;
		color: var(--gold);
		margin: 1rem 0 -0.25rem;
		line-height: 1;
		user-select: none;
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
		border: 3px solid rgba(212, 168, 90, 0.2);
		border-top-color: var(--gold);
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
		background: rgba(212, 168, 90, 0.15);
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #6b46c1, var(--gold));
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

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	@media (prefers-reduced-motion: reduce) {
		.spinner { animation: none; }
		.progress-fill { transition: none; }
	}
</style>
