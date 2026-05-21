import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';
import { getReadingBySlug } from '$lib/server/db.js';

interface CardJson {
	position?: string;
	name?: string;
}

export const load: PageServerLoad = async ({ params, platform, url }) => {
	if (!platform?.env.DB) {
		throw error(500, 'Reading service is not configured');
	}

	const row = await getReadingBySlug(platform.env.DB, params.slug);
	if (!row) {
		throw error(404, 'Not found');
	}

	let cards: CardJson[] = [];
	try {
		const parsed = JSON.parse(row.cards_json);
		if (Array.isArray(parsed)) cards = parsed as CardJson[];
	} catch {
		// Treat malformed data as empty rather than 500ing the share page.
	}

	const firstCard = cards[0]?.name?.trim() ?? 'Tarot';
	const ogTitle = `A Tarot Reading — ${firstCard} & more`;
	const ogDescription = excerpt(row.prediction, 150);
	const ogUrl = `${url.origin}/r/${params.slug}`;

	return {
		reading: {
			createdAt: row.created_at,
			locale: row.locale,
			cards,
			prediction: row.prediction
		},
		og: {
			title: ogTitle,
			description: ogDescription,
			url: ogUrl,
			image: `${url.origin}/og-default.png`
		}
	};
};

/**
 * Trim a prediction to ~maxLen visible characters for OG description.
 * Strips markdown headings/emphasis/lists so the preview is readable.
 * No HTML encoding here — Svelte does that when this string is rendered
 * via {data.og.description} in a meta tag.
 */
function excerpt(prediction: string, maxLen: number): string {
	const flat = prediction
		.replace(/^#+\s*/gm, '')
		.replace(/\*\*?/g, '')
		.replace(/^[-*]\s+/gm, '')
		.replace(/\s+/g, ' ')
		.trim();
	if (flat.length <= maxLen) return flat;
	return flat.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '…';
}
