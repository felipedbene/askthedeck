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
	<header class="page-header">
		<h1 class="page-title">{m.apoiar_heading()}</h1>
		<div class="title-rule" aria-hidden="true"></div>
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

		<h2>{m.apoiar_about_heading()}</h2>
		<p>{m.apoiar_about_body()}</p>
		
		<p class="muted">
			{m.apoiar_blog_intro()}
			<br/>
			<a 
				href="https://debene.dev/posts/askthedeck-adhd/" 
				target="_blank" 
				rel="noopener"
				class="blog-link"
			>
				{m.apoiar_blog_link_text()} →
			</a>
		</p>

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
	.page-header {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.page-title {
		font-family: 'Cinzel', serif;
		font-weight: 600;
		font-size: clamp(2rem, 4.5vw, 2.75rem);
		letter-spacing: 0.08em;
		color: var(--gold-bright);
		margin: 0;
		line-height: 1.1;
	}

	.title-rule {
		width: 80px;
		height: 1px;
		margin: 0.75rem auto 0;
		background: linear-gradient(90deg, transparent, var(--gold-dim), transparent);
	}

	.panel {
		padding: 1.75rem 1.5rem;
		background: linear-gradient(180deg, rgba(107, 70, 193, 0.12), rgba(26, 22, 37, 0.6));
		border: 1px solid rgba(212, 168, 90, 0.25);
		border-radius: 0.75rem;
		color: var(--cream);
		line-height: 1.7;
	}

	.panel h2 {
		font-family: 'Cinzel', serif;
		color: var(--gold);
		font-weight: 500;
		font-size: 1rem;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		margin: 1.75em 0 0.75em;
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
		border: 1px solid rgba(212, 168, 90, 0.4);
		text-decoration: none;
	}

	.kofi-button:hover,
	.kofi-button:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px rgba(212, 168, 90, 0.5);
	}

	.email {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.9rem;
		color: var(--gold);
		user-select: all;
	}

	.blog-link {
		color: var(--gold);
		text-decoration: none;
		font-weight: 500;
	}

	.blog-link:hover,
	.blog-link:focus-visible {
		text-decoration: underline;
		outline: none;
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
		color: var(--gold);
		outline: none;
	}
</style>
