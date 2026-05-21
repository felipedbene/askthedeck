<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	let { readingId }: { readingId: string | null } = $props();

	type State = 'idle' | 'publishing' | 'published' | 'error';

	let shareState = $state<State>('idle');
	let shareUrl = $state<string | null>(null);
	let copied = $state(false);

	async function share() {
		if (!readingId) return;
		shareState = 'publishing';
		try {
			const res = await fetch(`/api/reading/${encodeURIComponent(readingId)}/share`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'publish' })
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = (await res.json()) as { shareUrl: string | null };
			if (!data.shareUrl) throw new Error('no shareUrl');
			shareUrl = data.shareUrl;
			shareState = 'published';
			tryNativeShare(data.shareUrl);
		} catch (err) {
			console.error('[share] publish failed', err);
			shareState = 'error';
		}
	}

	async function unshare() {
		if (!readingId) return;
		try {
			await fetch(`/api/reading/${encodeURIComponent(readingId)}/share`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'unpublish' })
			});
		} catch (err) {
			console.error('[share] unpublish failed', err);
		}
		shareUrl = null;
		shareState = 'idle';
		copied = false;
	}

	async function copy() {
		if (!shareUrl) return;
		try {
			await navigator.clipboard.writeText(shareUrl);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			console.error('[share] copy failed', err);
		}
	}

	function tryNativeShare(url: string) {
		const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
		if (typeof nav.share === 'function') {
			nav
				.share({ url, title: 'A Tarot Reading' })
				.catch(() => {
					// User cancelled or the share sheet failed — fine, copy button is available.
				});
		}
	}
</script>

{#if readingId}
	<div class="share">
		{#if shareState === 'idle'}
			<button type="button" class="primary" onclick={share}>
				{m.share_button()}
			</button>
		{:else if shareState === 'publishing'}
			<button type="button" class="primary" disabled>{m.share_publishing()}</button>
		{:else if shareState === 'published' && shareUrl}
			<div class="share-link">
				<input type="text" readonly value={shareUrl} aria-label="Share URL" />
				<button type="button" class="primary" onclick={copy}>
					{copied ? m.share_copied() : m.share_copy()}
				</button>
			</div>
			<button type="button" class="secondary" onclick={unshare}>
				{m.share_unpublish()}
			</button>
		{:else if shareState === 'error'}
			<p class="error">{m.share_failed()}</p>
			<button type="button" class="primary" onclick={share}>{m.share_button()}</button>
		{/if}
	</div>
{/if}

<style>
	.share {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		max-width: 28rem;
	}

	.share-link {
		display: flex;
		gap: 0.5rem;
		width: 100%;
	}

	.share-link input {
		flex: 1;
		min-width: 0;
		padding: 0.5rem 0.75rem;
		font-size: 0.85rem;
		background: rgba(26, 22, 37, 0.8);
		border: 1px solid rgba(212, 175, 55, 0.3);
		border-radius: 0.5rem;
		color: rgb(229 231 235);
	}

	.primary {
		min-height: 44px;
		padding: 0.5rem 1.25rem;
		border-radius: 9999px;
		background: linear-gradient(135deg, #6b46c1 0%, #4c1d95 100%);
		color: #f5f3ff;
		font-weight: 600;
		font-size: 0.9rem;
		border: 1px solid rgba(212, 175, 55, 0.35);
		cursor: pointer;
		transition: transform 120ms ease;
	}

	.primary:hover:not([disabled]) {
		transform: translateY(-1px);
	}

	.primary[disabled] {
		opacity: 0.6;
		cursor: default;
	}

	.secondary {
		min-height: 36px;
		padding: 0.4rem 1rem;
		border-radius: 9999px;
		background: transparent;
		color: rgb(196 181 253);
		font-size: 0.8rem;
		border: 1px solid rgba(212, 175, 55, 0.25);
		cursor: pointer;
	}

	.secondary:hover {
		background: rgba(107, 70, 193, 0.15);
	}

	.error {
		color: rgb(252 165 165);
		font-size: 0.9rem;
		margin: 0;
	}
</style>
