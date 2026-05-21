<script lang="ts">
	import { reading } from '$lib/deck/reading.svelte.js';
	import { renderMarkdown } from '$lib/markdown.js';
	import * as m from '$lib/paraglide/messages.js';

	const html = $derived(reading.prediction ? renderMarkdown(reading.prediction) : '');
</script>

<div class="reading">
	{#if reading.phase === 'pending'}
		<div class="loading">
			<div class="spinner" aria-hidden="true"></div>
			<p class="loading-msg">{reading.message || m.loading_preparing()}</p>
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
	{/if}
</div>

<style>
	.reading {
		width: 100%;
		max-width: 36rem;
		margin: 0 auto;
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

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	@media (prefers-reduced-motion: reduce) {
		.spinner { animation: none; }
		.progress-fill { transition: none; }
	}
</style>
