<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { initializeLocale } from '$lib/i18n.js';
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types.js';
	import * as m from '$lib/paraglide/messages.js';

	let { data, children }: { data: LayoutData; children: any } = $props();

	// Initialize locale on mount (client-side)
	onMount(() => {
		const url = new URL(data.url);
		initializeLocale(url, data.acceptLanguage);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="site-nav" aria-label="Site">
	<a href="/apoiar" class="nav-link">{m.nav_support()}</a>
</nav>

{@render children()}

<style>
	.site-nav {
		display: flex;
		justify-content: flex-end;
		padding: 0.75rem 1rem 0;
		max-width: 80rem;
		margin: 0 auto;
	}

	.nav-link {
		font-family: 'Inter', system-ui, sans-serif;
		font-size: 0.85rem;
		font-weight: 400;
		color: var(--text-muted);
		text-decoration: none;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		border-bottom: 1px solid transparent;
		transition: color 0.3s ease, border-color 0.3s ease;
	}

	.nav-link:hover,
	.nav-link:focus-visible {
		color: var(--gold);
		border-bottom-color: var(--gold);
		outline: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.nav-link {
			transition: none;
		}
	}
</style>
