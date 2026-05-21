<script lang="ts">
	let {
		imageSrc,
		positionLabel,
		cardName,
		highlightWord,
		revealDelay = 0
	}: {
		imageSrc: string;
		positionLabel: string;
		cardName: string;
		highlightWord: string;
		revealDelay?: number;
	} = $props();

	/**
	 * Split the card name around the highlight word, as plain text spans —
	 * avoids the {@html} + naive replace combo from the spec, which would
	 * mis-highlight if the highlight string appears inside another word.
	 *
	 * Falls back to highlighting nothing if the word isn't found (e.g.
	 * locale mismatch). The name still renders, just without the gold em.
	 */
	const segments = $derived.by(() => {
		if (!highlightWord) return { before: cardName, hl: '', after: '' };
		const idx = cardName.indexOf(highlightWord);
		if (idx < 0) return { before: cardName, hl: '', after: '' };
		return {
			before: cardName.slice(0, idx),
			hl: cardName.slice(idx, idx + highlightWord.length),
			after: cardName.slice(idx + highlightWord.length)
		};
	});
</script>

<div class="tarot-card" style:--reveal-delay="{revealDelay}s">
	<div class="card-frame">
		<div class="card-image-wrap">
			<img src={imageSrc} alt={cardName} draggable="false" />
		</div>
	</div>
	<div class="position-label">{positionLabel}</div>
	<div class="position-divider" aria-hidden="true"></div>
	<div class="card-name">
		{#if segments.hl}{segments.before}<em>{segments.hl}</em>{segments.after}{:else}{cardName}{/if}
	</div>
</div>

<style>
	.tarot-card {
		position: relative;
		text-align: center;
		cursor: pointer;
		transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
		animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) backwards;
		animation-delay: var(--reveal-delay, 0s);
		min-width: 0;
	}

	.tarot-card:hover,
	.tarot-card:active {
		transform: translateY(-8px);
	}

	.card-frame {
		position: relative;
		padding: 14px 14px 16px;
		background: linear-gradient(
			155deg,
			rgba(212, 168, 90, 0.18) 0%,
			rgba(122, 92, 199, 0.12) 40%,
			rgba(26, 15, 51, 0.6) 100%
		);
		border: 1px solid rgba(212, 168, 90, 0.35);
		border-radius: 8px;
		margin-bottom: 1rem;
		overflow: hidden;
		transition: all 0.4s ease;
	}

	.card-frame::before,
	.card-frame::after {
		content: '';
		position: absolute;
		width: 14px;
		height: 14px;
		border: 1px solid var(--gold);
		opacity: 0.6;
		transition: opacity 0.3s ease;
		animation: shimmer 4s ease-in-out infinite;
	}

	.card-frame::before {
		top: 6px;
		left: 6px;
		border-right: none;
		border-bottom: none;
	}

	.card-frame::after {
		bottom: 6px;
		right: 6px;
		border-left: none;
		border-top: none;
		animation-delay: 2s;
	}

	.tarot-card:hover .card-frame,
	.tarot-card:active .card-frame {
		border-color: var(--gold-bright);
		box-shadow:
			0 0 30px rgba(212, 168, 90, 0.25),
			0 0 60px rgba(122, 92, 199, 0.15),
			inset 0 0 20px rgba(212, 168, 90, 0.08);
	}

	.tarot-card:hover .card-frame::before,
	.tarot-card:hover .card-frame::after,
	.tarot-card:active .card-frame::before,
	.tarot-card:active .card-frame::after {
		opacity: 1;
	}

	.card-image-wrap {
		position: relative;
		border-radius: 4px;
		overflow: hidden;
		/* Reserve the slot before the image loads so we don't shift layout. */
		aspect-ratio: 1 / 1.6;
		background-color: #2a2235;
	}

	.card-image-wrap::after {
		content: '';
		position: absolute;
		inset: 0;
		box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.4);
		pointer-events: none;
		border-radius: 4px;
	}

	.tarot-card img {
		width: 100%;
		height: 100%;
		display: block;
		border-radius: 4px;
		object-fit: contain;
		filter: contrast(1.05) saturate(1.05);
		transition: filter 0.4s ease;
		user-select: none;
		-webkit-user-drag: none;
	}

	.tarot-card:hover img,
	.tarot-card:active img {
		filter: contrast(1.1) saturate(1.15) brightness(1.05);
	}

	.position-label {
		font-family: 'Cinzel', serif;
		font-size: 0.7rem;
		font-weight: 500;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: var(--gold);
		margin-bottom: 0.4rem;
		opacity: 0.85;
	}

	.position-divider {
		width: 24px;
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--gold-dim), transparent);
		margin: 0 auto 0.6rem;
	}

	.card-name {
		font-family: 'Cormorant Garamond', serif;
		font-weight: 500;
		font-size: 1.35rem;
		color: var(--cream);
		line-height: 1.2;
		letter-spacing: 0.02em;
	}

	.card-name em {
		font-style: italic;
		color: var(--gold-bright);
	}

	@keyframes fade-up {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes shimmer {
		0%, 100% { opacity: 0.6; }
		50% { opacity: 1; }
	}

	@media (max-width: 600px) {
		.card-name {
			font-size: 1.1rem;
		}
		.position-label {
			font-size: 0.6rem;
			letter-spacing: 0.25em;
		}
		.card-frame {
			padding: 10px 10px 12px;
		}
		.card-frame::before,
		.card-frame::after {
			width: 10px;
			height: 10px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.tarot-card {
			/* Fade only — no translate, no stagger, no shimmer. */
			animation: fade-in 0.4s ease both;
			animation-delay: 0s;
			transition: none;
		}
		.tarot-card:hover,
		.tarot-card:active {
			transform: none;
		}
		.tarot-card:hover .card-frame,
		.tarot-card:active .card-frame {
			/* Still acknowledge interaction via the border/glow, just no motion. */
			transition: none;
		}
		.card-frame::before,
		.card-frame::after {
			animation: none;
			opacity: 0.6;
		}
		.tarot-card:hover img,
		.tarot-card:active img {
			transition: none;
		}
	}

	@keyframes fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}
</style>
