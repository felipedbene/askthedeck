<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	let {
		visible = false,
		onread
	}: {
		visible?: boolean;
		onread?: () => void;
	} = $props();
</script>

{#if visible}
	<button
		type="button"
		class="read-btn"
		onclick={onread}
		aria-label={m.read_button()}
	>
		<span class="sparkle" aria-hidden="true">✦</span>
		<span>{m.read_button()}</span>
		<span class="sparkle" aria-hidden="true">✦</span>
	</button>
{/if}

<style>
	.read-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.625rem;
		min-height: 48px;
		padding: 0.75rem 1.75rem;
		border-radius: 9999px;
		background: linear-gradient(135deg, #d4a85a 0%, #8a6d3a 100%);
		color: #1a1625;
		font-weight: 700;
		font-size: 1rem;
		letter-spacing: 0.02em;
		border: 1px solid rgba(212, 168, 90, 0.8);
		box-shadow:
			0 6px 20px rgba(212, 168, 90, 0.25),
			0 0 0 1px rgba(255, 255, 255, 0.15) inset;
		cursor: pointer;
		transition: transform 150ms ease, box-shadow 150ms ease;
		will-change: transform;
		animation: appear 350ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.read-btn:hover {
		transform: translateY(-2px);
		box-shadow:
			0 10px 28px rgba(212, 168, 90, 0.35),
			0 0 0 1px rgba(255, 255, 255, 0.25) inset;
	}

	.read-btn:active {
		transform: translateY(0);
	}

	.read-btn:focus-visible {
		outline: 2px solid #fff;
		outline-offset: 3px;
	}

	.sparkle {
		font-size: 0.85rem;
		opacity: 0.7;
	}

	@keyframes appear {
		from {
			transform: translate3d(0, 8px, 0) scale(0.85);
			opacity: 0;
		}
		to {
			transform: translate3d(0, 0, 0) scale(1);
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.read-btn { animation: none; }
	}
</style>
