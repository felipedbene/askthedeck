import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getReadingById } from '$lib/server/db.js';
import { getReaderIdCookie } from '$lib/server/cookies.js';

/**
 * GET /api/reading/:readingId
 *
 * Returns the reading if either:
 *   - the requester's reader_id cookie matches owner_id, OR
 *   - visibility is 'public'.
 *
 * In every other case (no row, wrong owner on a private reading, etc.)
 * we return 404 — never 403. We don't want to leak that an id exists
 * but belongs to someone else.
 */
export const GET: RequestHandler = async ({ params, platform, cookies }) => {
	if (!platform?.env.DB) {
		throw error(500, 'Reading service is not configured');
	}

	const readerId = getReaderIdCookie(cookies);
	const row = await getReadingById(platform.env.DB, params.readingId);

	const isOwner = !!row && !!readerId && row.owner_id === readerId;
	const isPublic = !!row && row.visibility === 'public';
	if (!row || (!isOwner && !isPublic)) {
		throw error(404, 'Not found');
	}

	let cards: unknown = [];
	try {
		cards = JSON.parse(row.cards_json);
	} catch {
		cards = [];
	}

	return json({
		id: row.id,
		createdAt: row.created_at,
		locale: row.locale,
		cards,
		prediction: row.prediction,
		visibility: row.visibility,
		shareSlug: row.share_slug,
		isOwner
	});
};
