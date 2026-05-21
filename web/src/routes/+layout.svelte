<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { initializeLocale } from '$lib/i18n.js';
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types.js';

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

{@render children()}
