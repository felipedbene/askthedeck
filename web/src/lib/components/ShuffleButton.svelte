<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	let { onshuffle }: { onshuffle?: () => void } = $props();

	let shuffling = $state(false);

	function handleClick() {
		if (shuffling) return;
		shuffling = true;
		onshuffle?.();
		// Match the keyframe duration below
		setTimeout(() => {
			shuffling = false;
		}, 600);
	}
</script>

<button
	type="button"
	class="shuffle-btn"
	class:is-shuffling={shuffling}
	onclick={handleClick}
	aria-label={m.shuffle_button()}
>
	<svg
		class="shuffle-icon"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<path d="M16 3h5v5" />
		<path d="M4 20L21 3" />
		<path d="M21 16v5h-5" />
		<path d="M15 15l6 6" />
		<path d="M4 4l5 5" />
	</svg>
	<span>{m.shuffle_button()}</span>
</button>

<style>
	.shuffle-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 44px;
		padding: 0.625rem 1.25rem;
		border-radius: 9999px;
		background: linear-gradient(135deg, #6b46c1 0%, #4c1d95 100%);
		color: #f5f3ff;
		font-weight: 600;
		font-size: 0.95rem;
		border: 1px solid rgba(212, 175, 55, 0.35);
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.35),
			0 0 0 1px rgba(255, 255, 255, 0.05) inset;
		cursor: pointer;
		transition: transform 120ms ease, box-shadow 120ms ease;
		will-change: transform;
	}

	.shuffle-btn:hover:not(.is-shuffling) {
		transform: translateY(-1px);
		box-shadow:
			0 6px 16px rgba(0, 0, 0, 0.4),
			0 0 0 1px rgba(212, 175, 55, 0.25) inset;
	}

	.shuffle-btn:active:not(.is-shuffling) {
		transform: translateY(0);
	}

	.shuffle-btn:focus-visible {
		outline: 2px solid #d4af37;
		outline-offset: 2px;
	}

	.shuffle-icon {
		width: 1.1rem;
		height: 1.1rem;
		transition: transform 120ms ease;
	}

	.is-shuffling .shuffle-icon {
		animation: spin 600ms cubic-bezier(0.4, 0.0, 0.2, 1);
	}

	.is-shuffling {
		animation: shake 600ms cubic-bezier(0.4, 0.0, 0.2, 1);
	}

	@keyframes shake {
		0%   { transform: translate3d(0, 0, 0) rotate(0); }
		15%  { transform: translate3d(-4px, 0, 0) rotate(-3deg); }
		35%  { transform: translate3d(5px, -1px, 0) rotate(3deg); }
		55%  { transform: translate3d(-4px, 1px, 0) rotate(-2deg); }
		75%  { transform: translate3d(3px, 0, 0) rotate(2deg); }
		100% { transform: translate3d(0, 0, 0) rotate(0); }
	}

	@keyframes spin {
		from { transform: rotate(0); }
		to   { transform: rotate(360deg); }
	}

	@media (prefers-reduced-motion: reduce) {
		.is-shuffling,
		.is-shuffling .shuffle-icon {
			animation: none;
		}
	}
</style>
