<script lang="ts">
	let {
		width = 160,
		remaining = 78,
		ondraw
	}: {
		width?: number;
		/** How many cards are still in the deck — controls visual layering */
		remaining?: number;
		/** If provided, the deck is tappable */
		ondraw?: () => void;
	} = $props();

	const aspect = 1.6;
	const height = $derived(Math.round(width * aspect));

	// Show fewer shadow layers as the deck depletes
	const showBack2 = $derived(remaining > 26);
	const showBack1 = $derived(remaining > 13);

	const interactive = $derived(typeof ondraw === 'function');
	const disabled = $derived(remaining <= 0);

	function handleClick() {
		if (!disabled && interactive) ondraw!();
	}
</script>

<svelte:element
	this={interactive ? 'button' : 'div'}
	class="deck"
	class:is-interactive={interactive && !disabled}
	class:is-empty={disabled}
	style:--w="{width}px"
	style:--h="{height}px"
	type={interactive ? 'button' : undefined}
	role={interactive ? undefined : 'img'}
	aria-label="Tarot deck"
	disabled={interactive ? disabled : undefined}
	onclick={interactive ? handleClick : undefined}
>
	{#if showBack2}
		<div class="card card--back-2"></div>
	{/if}
	{#if showBack1}
		<div class="card card--back-1"></div>
	{/if}
	{#if remaining > 0}
		<div class="card card--top">
			<img src="/card-back.png" alt="" draggable="false" />
		</div>
	{:else}
		<div class="card card--empty" aria-hidden="true"></div>
	{/if}
</svelte:element>

<style>
	.deck {
		position: relative;
		width: var(--w);
		height: var(--h);
		margin: 0 auto;
		min-width: 44px;
		min-height: 44px;
		border-radius: 0.5rem;
		/* Reset button defaults when rendered as <button> */
		padding: 0;
		background: transparent;
		border: none;
		color: inherit;
		font: inherit;
	}

	.is-interactive {
		cursor: pointer;
	}

	.is-interactive:focus-visible {
		outline: 2px solid var(--gold);
		outline-offset: 4px;
	}

	.card {
		position: absolute;
		inset: 0;
		border-radius: 0.5rem;
		background-color: #2a2235;
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.4),
			0 0 0 1px rgba(212, 168, 90, 0.15) inset;
		will-change: transform;
		transition: transform 200ms ease;
	}

	.card--back-2 {
		transform: translate3d(6px, 8px, 0) rotate(2.5deg);
		opacity: 0.7;
	}

	.card--back-1 {
		transform: translate3d(3px, 4px, 0) rotate(1.25deg);
		opacity: 0.85;
	}

	.card--top {
		overflow: hidden;
		animation: breathe 3.6s ease-in-out infinite;
	}

	.is-interactive:hover .card--top {
		transform: translate3d(0, -6px, 0);
		animation-play-state: paused;
	}

	.is-interactive:active .card--top {
		transform: translate3d(0, -2px, 0);
		animation-play-state: paused;
	}

	.card--top img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		display: block;
		user-select: none;
		-webkit-user-drag: none;
	}

	.card--empty {
		background-color: transparent;
		border: 2px dashed rgba(212, 168, 90, 0.25);
		box-shadow: none;
	}

	.is-empty {
		cursor: default;
		opacity: 0.6;
	}

	@keyframes breathe {
		0%, 100% { transform: translate3d(0, 0, 0); }
		50%      { transform: translate3d(0, -4px, 0); }
	}

	@media (prefers-reduced-motion: reduce) {
		.card--top { animation: none; }
		.card { transition: none; }
	}
</style>
