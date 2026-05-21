import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import {
	getReadingById,
	tryPublishReading,
	unpublishReading
} from '$lib/server/db.js';
import { getReaderIdCookie } from '$lib/server/cookies.js';
import { generateShareSlug } from '$lib/server/ids.js';
import { logEvent } from '$lib/server/events.js';

interface ShareRequest {
	action: 'publish' | 'unpublish';
}

const MAX_PUBLISH_ATTEMPTS = 6;

/**
 * POST /api/reading/:readingId/share
 *
 * Owner-only. Body: { action: "publish" | "unpublish" }.
 * On publish: claims a unique share_slug atomically; retries on the
 * astronomically-rare UNIQUE conflict.
 * On unpublish: clears share_slug and flips visibility back to 'private'.
 *
 * Responses are deliberately the same shape regardless of action, and
 * 404 is used for both "no such reading" and "not your reading" — same
 * leak-avoidance as GET /api/reading/:id.
 */
export const POST: RequestHandler = async ({ params, request, platform, cookies, url }) => {
	if (!platform?.env.DB) {
		throw error(500, 'Reading service is not configured');
	}

	const readerId = getReaderIdCookie(cookies);
	if (!readerId) {
		throw error(404, 'Not found');
	}

	let body: ShareRequest;
	try {
		body = (await request.json()) as ShareRequest;
	} catch {
		throw error(400, 'Invalid JSON body');
	}
	if (body.action !== 'publish' && body.action !== 'unpublish') {
		throw error(400, 'action must be "publish" or "unpublish"');
	}

	const row = await getReadingById(platform.env.DB, params.readingId);
	if (!row || row.owner_id !== readerId) {
		throw error(404, 'Not found');
	}

	if (body.action === 'unpublish') {
		await unpublishReading(platform.env.DB, params.readingId, readerId);
		return json({ shareUrl: null });
	}

	// Publish: if already public with a slug, idempotently return its URL.
	if (row.visibility === 'public' && row.share_slug) {
		return json({ shareUrl: shareUrlFor(url, row.share_slug) });
	}

	for (let attempt = 0; attempt < MAX_PUBLISH_ATTEMPTS; attempt++) {
		const slug = generateShareSlug();
		const { changed } = await tryPublishReading(
			platform.env.DB,
			params.readingId,
			readerId,
			slug
		);
		if (changed) {
			platform.context.waitUntil(
				logEvent(platform.env.DB, {
					event: 'share_published',
					readerId,
					locale: row.locale,
					hostname: url.hostname
				})
			);
			return json({ shareUrl: shareUrlFor(url, slug) });
		}
	}
	console.error(
		`[share] exhausted ${MAX_PUBLISH_ATTEMPTS} slug attempts for ${params.readingId}`
	);
	throw error(500, 'Could not generate a unique share link');
};

function shareUrlFor(requestUrl: URL, slug: string): string {
	return `${requestUrl.origin}/r/${slug}`;
}
