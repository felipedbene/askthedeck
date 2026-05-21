<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	let { onreset }: { onreset?: () => void } = $props();
</script>

<button
	type="button"
	class="new-reading-btn"
	onclick={onreset}
	aria-label={m.new_reading_button()}
>
	{m.new_reading_button()}
</button>

<style>
	.new-reading-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		padding: 0.625rem 1.25rem;
		border-radius: 9999px;
		background: transparent;
		color: rgb(216 180 254);
		font-weight: 600;
		font-size: 0.95rem;
		border: 1px solid rgba(212, 168, 90, 0.4);
		cursor: pointer;
		transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
	}

	.new-reading-btn:hover {
		background: rgba(107, 70, 193, 0.2);
		color: #f5f3ff;
		border-color: rgba(212, 168, 90, 0.7);
	}

	.new-reading-btn:focus-visible {
		outline: 2px solid var(--gold);
		outline-offset: 2px;
	}
</style>
