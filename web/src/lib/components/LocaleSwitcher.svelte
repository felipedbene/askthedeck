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

<div class="locale-switcher relative">
	<button
		type="button"
		onclick={toggleDropdown}
		class="flex items-center gap-2 px-4 py-2 bg-purple-900/30 hover:bg-purple-900/50 rounded-lg border border-purple-700/30 transition-colors"
		aria-label={m.locale_switcher_label()}
		aria-expanded={isOpen}
	>
		<span class="text-xl" role="img" aria-label={currentLocaleInfo.label}>
			{currentLocaleInfo.flag}
		</span>
		<span class="text-sm font-medium text-purple-200">
			{currentLocaleInfo.label}
		</span>
		<svg
			class="w-4 h-4 text-purple-300 transition-transform {isOpen ? 'rotate-180' : ''}"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if isOpen}
		<div
			class="absolute right-0 mt-2 w-48 bg-gray-900 border border-purple-700/30 rounded-lg shadow-lg z-50"
		>
			{#each Object.entries(LOCALES) as [code, locale]}
				<button
					type="button"
					onclick={() => handleLocaleChange(code as AvailableLanguageTag)}
					class="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-900/30 transition-colors first:rounded-t-lg last:rounded-b-lg {code === currentLocale ? 'bg-purple-900/20' : ''}"
				>
					<span class="text-xl" role="img" aria-label={locale.label}>
						{locale.flag}
					</span>
					<span class="text-sm font-medium text-purple-200">
						{locale.label}
					</span>
					{#if code === currentLocale}
						<svg
							class="w-4 h-4 ml-auto text-tarot-gold"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
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
