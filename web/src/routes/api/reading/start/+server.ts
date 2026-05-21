import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import {
	generateJobId,
	generateReading,
	initJob,
	type CardSpread
} from '$lib/server/reading.js';
import { generateReaderId, generateReadingId } from '$lib/server/ids.js';
import { getReaderIdCookie, setReaderIdCookie } from '$lib/server/cookies.js';
import { upsertReader } from '$lib/server/db.js';
import { getDefaultLocale } from '$lib/server/locale.js';
import { logEvent } from '$lib/server/events.js';

interface StartRequest {
	cards: CardSpread[];
	locale?: string;
}

export const POST: RequestHandler = async ({ request, platform, cookies }) => {
	if (!platform) {
		throw error(500, 'Platform bindings unavailable');
	}
	const { READINGS_KV, DB, DEEPSEEK_API_KEY } = platform.env;
	if (!READINGS_KV || !DB || !DEEPSEEK_API_KEY) {
		throw error(500, 'Reading service is not configured');
	}

	let body: StartRequest;
	try {
		body = (await request.json()) as StartRequest;
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	if (!Array.isArray(body.cards) || body.cards.length === 0) {
		throw error(400, 'Request must include a non-empty `cards` array');
	}

	const hostLocale = getDefaultLocale(new URL(request.url).hostname);
	const locale = body.locale || hostLocale;

	// Identify the reader. Accept a pre-existing cookie value; if no row
	// exists for it (data wiped, fresh worker, etc.) just upsert under it.
	let readerId = getReaderIdCookie(cookies);
	if (!readerId) {
		readerId = generateReaderId();
	}
	const now = Date.now();
	try {
		await upsertReader(DB, readerId, locale, now);
	} catch (err) {
		// Don't fail the whole request — the reading can still be generated
		// and served via KV polling. Continuity for this reader is just
		// lost for this call.
		console.error(
			'[d1] failed to upsert reader',
			readerId,
			err instanceof Error ? err.message : err
		);
	}
	setReaderIdCookie(cookies, readerId);

	const jobId = generateJobId();
	const readingId = generateReadingId();
	await initJob(READINGS_KV, jobId);

	const url = new URL(request.url);
	platform.context.waitUntil(
		logEvent(DB, {
			event: 'reading_started',
			readerId,
			locale,
			hostname: url.hostname,
			metadata: { card_count: body.cards.length }
		})
	);

	platform.context.waitUntil(
		generateReading(
			jobId,
			readingId,
			readerId,
			body.cards,
			READINGS_KV,
			DB,
			DEEPSEEK_API_KEY,
			locale,
			url.hostname
		)
	);

	return json({ jobId, readingId });
};
