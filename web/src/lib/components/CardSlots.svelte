<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { cardImageUrl, type CardId } from '$lib/deck/cards.js';
	import { untrack } from 'svelte';

	let { drawn = [] }: { drawn?: CardId[] } = $props();

	const positions = [
		{ label: () => m.position_current() },
		{ label: () => m.position_growth() },
		{ label: () => m.position_potential() }
	];

	const REVEAL_DELAY_MS = 150;

	// Tracks which slot indices have flipped to face-up.
	let revealed = $state<boolean[]>([false, false, false]);
	let timers: ReturnType<typeof setTimeout>[] = [];

	function clearTimers() {
		for (const t of timers) clearTimeout(t);
		timers = [];
	}

	$effect(() => {
		// Re-run whenever the drawn array changes length.
		const count = drawn.length;

		untrack(() => {
			// Reset: deck was shuffled / cleared.
			if (count === 0) {
				clearTimers();
				revealed = [false, false, false];
				return;
			}

			// New card(s) landed. Schedule flips for any unrevealed indices.
			for (let i = 0; i < count; i++) {
				if (revealed[i]) continue;
				const idx = i;
				const t = setTimeout(() => {
					revealed[idx] = true;
				}, REVEAL_DELAY_MS);
				timers.push(t);
			}
		});

		return () => {
			// Cleanup on unmount only — we want timers to keep running on re-runs.
		};
	});
</script>

<div class="slots">
	{#each positions as position, i}
		{@const card = drawn[i]}
		{@const isRevealed = card && revealed[i]}
		<div class="slot">
			<div class="slot-frame" class:is-filled={!!card}>
				{#if card}
					<div class="flipper" class:is-revealed={isRevealed}>
						<div class="face face--back">
							<img src="/card-back.png" alt="" draggable="false" />
						</div>
						<div class="face face--front">
							<img src={cardImageUrl(card)} alt={card} draggable="false" />
						</div>
					</div>
				{/if}
			</div>
			<p class="slot-label">{position.label()}</p>
		</div>
	{/each}
</div>

<style>
	.slots {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
		width: 100%;
		max-width: 28rem;
		margin: 0 auto;
	}

	.slot {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
	}

	.slot-frame {
		width: 100%;
		aspect-ratio: 1 / 1.6;
		border-radius: 0.5rem;
		border: 2px dashed rgba(212, 168, 90, 0.3);
		background-color: rgba(42, 34, 53, 0.3);
		overflow: hidden;
		transition: border-color 200ms ease, background-color 200ms ease;
		perspective: 1000px;
	}

	.slot-frame.is-filled {
		border-style: solid;
		border-color: rgba(212, 168, 90, 0.55);
		background-color: #2a2235;
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.4),
			0 0 0 1px rgba(212, 168, 90, 0.15) inset;
	}

	.flipper {
		position: relative;
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
		transition: transform 600ms cubic-bezier(0.4, 0.0, 0.2, 1);
		will-change: transform;
	}

	.flipper.is-revealed {
		transform: rotateY(180deg);
	}

	.face {
		position: absolute;
		inset: 0;
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
		border-radius: 0.4rem;
		overflow: hidden;
	}

	.face--front {
		transform: rotateY(180deg);
	}

	.face img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		display: block;
		user-select: none;
		-webkit-user-drag: none;
	}

	.slot-label {
		font-size: 0.7rem;
		color: rgb(216 180 254);
		text-align: center;
		line-height: 1.2;
		min-height: 1.7em;
	}

	@media (min-width: 480px) {
		.slots { gap: 1rem; }
		.slot-label { font-size: 0.8rem; }
	}

	@media (prefers-reduced-motion: reduce) {
		.flipper { transition: none; }
	}
</style>
