<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { trackEvent } from '$lib/api/events.js';

	const KOFI_URL = 'https://ko-fi.com/felipedebene';
	const CONTACT_EMAIL = 'felipe@debene.dev';

	function handleKofiClick() {
		trackEvent('kofi_clicked');
	}
</script>

<svelte:head>
	<title>{m.apoiar_heading()} — Ask The Deck</title>
	<meta name="description" content={m.apoiar_intro()} />
</svelte:head>

<div class="container mx-auto max-w-2xl px-4 py-10">
	<header class="mb-6">
		<h1
			class="text-3xl font-bold bg-gradient-to-r from-tarot-gold to-purple-400 bg-clip-text text-transparent"
		>
			{m.apoiar_heading()}
		</h1>
	</header>

	<article class="panel">
		<p class="intro">{m.apoiar_intro()}</p>

		<h2>{m.apoiar_cost_heading()}</h2>
		<p>{m.apoiar_cost_body()}</p>

		<h2>{m.apoiar_what_heading()}</h2>
		<p>{m.apoiar_what_do()}</p>
		<p>{m.apoiar_what_dont()}</p>

		<div class="cta">
			<a
				href={KOFI_URL}
				target="_blank"
				rel="noopener"
				class="kofi-button"
				onclick={handleKofiClick}
			>
				{m.apoiar_button()}
			</a>
		</div>

		<h2>{m.apoiar_other_heading()}</h2>
		<p class="muted">{m.apoiar_other_body()}</p>

		<h2>{m.apoiar_contact_heading()}</h2>
		<p class="muted">
			{m.apoiar_contact_body()}
			<span class="email">{CONTACT_EMAIL}</span>
		</p>
	</article>

	<footer class="back-footer">
		<a href="/" class="back-link">{m.apoiar_back()}</a>
	</footer>
</div>

<style>
	.panel {
		padding: 1.75rem 1.5rem;
		background: linear-gradient(180deg, rgba(107, 70, 193, 0.12), rgba(26, 22, 37, 0.6));
		border: 1px solid rgba(212, 175, 55, 0.25);
		border-radius: 0.75rem;
		color: rgb(229 231 235);
		line-height: 1.7;
	}

	.panel h2 {
		color: #d4af37;
		font-weight: 600;
		font-size: 1.15rem;
		margin: 1.5em 0 0.5em;
		line-height: 1.3;
	}

	.panel p {
		margin: 0 0 0.75rem;
	}

	.intro {
		font-size: 1.05rem;
		color: rgb(229 231 235);
	}

	.muted {
		color: rgb(196 181 253);
		font-size: 0.95rem;
	}

	.cta {
		display: flex;
		justify-content: center;
		margin: 1.75rem 0 1rem;
	}

	.kofi-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		padding: 0.65rem 1.5rem;
		border-radius: 9999px;
		background: linear-gradient(135deg, #6b46c1 0%, #4c1d95 100%);
		color: #f5f3ff;
		font-weight: 600;
		font-size: 0.95rem;
		border: 1px solid rgba(212, 175, 55, 0.35);
		text-decoration: none;
	}

	.kofi-button:hover,
	.kofi-button:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.5);
	}

	.email {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.9rem;
		color: #d4af37;
		user-select: all;
	}

	.back-footer {
		margin-top: 1.5rem;
		text-align: center;
	}

	.back-link {
		font-size: 0.9rem;
		color: rgb(196 181 253);
		text-decoration: none;
	}

	.back-link:hover,
	.back-link:focus-visible {
		color: #d4af37;
		outline: none;
	}
</style>
