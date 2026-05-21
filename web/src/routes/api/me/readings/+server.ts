import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getReadingsListForOwner } from '$lib/server/db.js';
import { getReaderIdCookie } from '$lib/server/cookies.js';

const HISTORY_LIMIT = 20;

/**
 * GET /api/me/readings — auth via reader_id cookie.
 * Returns the last 20 readings owned by the requester, with a 200-char
 * preview of each prediction. Frontend history view will consume this
 * later; for now it's curl-testable.
 */
export const GET: RequestHandler = async ({ platform, cookies }) => {
	if (!platform?.env.DB) {
		throw error(500, 'Reading service is not configured');
	}

	const readerId = getReaderIdCookie(cookies);
	if (!readerId) {
		// Match the same leak-avoidance pattern: an unauthenticated client
		// just sees an empty list, not a 401. This is fine because nothing
		// belongs to "no reader".
		return json({ readings: [] });
	}

	const rows = await getReadingsListForOwner(platform.env.DB, readerId, HISTORY_LIMIT);

	const readings = rows.map((row) => {
		let cards: unknown = [];
		try {
			cards = JSON.parse(row.cards_json);
		} catch {
			cards = [];
		}
		return {
			id: row.id,
			createdAt: row.created_at,
			cards,
			preview: row.preview,
			visibility: row.visibility,
			shareSlug: row.share_slug
		};
	});

	return json({ readings });
};
