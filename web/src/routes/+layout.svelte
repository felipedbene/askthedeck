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
		font-size: 0.85rem;
		color: rgb(196 181 253);
		text-decoration: none;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
	}

	.nav-link:hover,
	.nav-link:focus-visible {
		color: #d4af37;
		outline: none;
	}
</style>
