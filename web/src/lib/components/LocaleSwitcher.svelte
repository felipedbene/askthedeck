<script lang="ts">
	/**
	 * LocaleSwitcher component
	 *
	 * Displays a dropdown to switch between available locales
	 * Saves selection to localStorage and updates the UI immediately
	 */

	import { LOCALES, switchLocale, type Locale, type AvailableLanguageTag } from '$lib/i18n.js';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import * as m from '$lib/paraglide/messages.js';

	let isOpen = $state(false);

	function handleLocaleChange(newLocale: AvailableLanguageTag) {
		switchLocale(newLocale);
		isOpen = false;
		// Force page reload to apply new locale throughout the app
		// In a more sophisticated setup, we'd use SvelteKit's invalidation
		if (typeof window !== 'undefined') {
			window.location.reload();
		}
	}

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		if (isOpen) {
			const target = event.target as HTMLElement;
			if (!target.closest('.locale-switcher')) {
				isOpen = false;
			}
		}
	}

	$effect(() => {
		if (typeof window !== 'undefined') {
			if (isOpen) {
				window.addEventListener('click', handleClickOutside);
			}
			return () => {
				window.removeEventListener('click', handleClickOutside);
			};
		}
	});

	const currentLocale = $derived(getLocale() as Locale);
	const currentLocaleInfo = $derived(LOCALES[currentLocale]);
</script>

<div class="locale-switcher">
	<button
		type="button"
		class="pill"
		onclick={toggleDropdown}
		aria-label={m.locale_switcher_label()}
		aria-expanded={isOpen}
	>
		<span class="flag" role="img" aria-label={currentLocaleInfo.label}>
			{currentLocaleInfo.flag}
		</span>
		<span class="label">{currentLocaleInfo.label}</span>
		<svg
			class="chevron"
			class:open={isOpen}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if isOpen}
		<div class="dropdown" role="menu">
			{#each Object.entries(LOCALES) as [code, locale]}
				<button
					type="button"
					class="item"
					class:active={code === currentLocale}
					onclick={() => handleLocaleChange(code as AvailableLanguageTag)}
					role="menuitemradio"
					aria-checked={code === currentLocale}
				>
					<span class="flag" role="img" aria-label={locale.label}>
						{locale.flag}
					</span>
					<span class="label">{locale.label}</span>
					{#if code === currentLocale}
						<svg class="check" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
							<path
								fill-rule="evenodd"
								d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
								clip-rule="evenodd"
							/>
						</svg>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.locale-switcher {
		position: relative;
		font-family: 'Inter', system-ui, sans-serif;
	}

	.pill {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.9rem;
		background: rgba(122, 92, 199, 0.08);
		border: 1px solid rgba(212, 168, 90, 0.2);
		border-radius: 999px;
		color: var(--text-soft);
		font-size: 0.85rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			border-color 0.3s ease,
			color 0.3s ease,
			background 0.3s ease;
	}

	.pill:hover,
	.pill:focus-visible {
		border-color: rgba(212, 168, 90, 0.4);
		color: var(--cream);
		outline: none;
	}

	.flag {
		font-size: 1.05rem;
		line-height: 1;
	}

	.chevron {
		width: 0.9rem;
		height: 0.9rem;
		opacity: 0.8;
		transition: transform 0.3s ease;
	}

	.chevron.open {
		transform: rotate(180deg);
	}

	.dropdown {
		position: absolute;
		right: 0;
		top: calc(100% + 0.4rem);
		min-width: 11rem;
		background: linear-gradient(
			180deg,
			rgba(20, 9, 42, 0.95) 0%,
			rgba(26, 15, 51, 0.95) 100%
		);
		border: 1px solid rgba(212, 168, 90, 0.25);
		border-radius: 8px;
		box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45);
		overflow: hidden;
		z-index: 50;
	}

	.item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.6rem 0.9rem;
		background: transparent;
		border: none;
		color: var(--text-soft);
		font-size: 0.9rem;
		font-weight: 500;
		text-align: left;
		cursor: pointer;
		transition: background 0.2s ease, color 0.2s ease;
	}

	.item:hover,
	.item:focus-visible {
		background: rgba(212, 168, 90, 0.08);
		color: var(--cream);
		outline: none;
	}

	.item.active {
		background: rgba(212, 168, 90, 0.05);
		color: var(--cream);
	}

	.check {
		width: 0.9rem;
		height: 0.9rem;
		margin-left: auto;
		color: var(--gold);
	}

	@media (prefers-reduced-motion: reduce) {
		.pill,
		.chevron,
		.item {
			transition: none;
		}
		.chevron.open {
			/* Still indicate open state, just without animating to it. */
			transform: rotate(180deg);
		}
	}
</style>
