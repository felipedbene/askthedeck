import { env, waitUntil } from 'cloudflare:workers';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import {
	generateJobId,
	generateReading,
	initJob,
	type CardSpread
} from '#lib/server/reading.js';
import { generateReaderId, generateReadingId } from '#lib/server/ids.js';
import { getReaderIdCookie, setReaderIdCookie } from '#lib/server/cookies.js';
import { upsertReader } from '#lib/server/db.js';
import { getDefaultLocale } from '#lib/server/locale.js';
import { logEvent } from '#lib/server/events.js';
import { cardDisplayName, cardIdFromDisplayName } from '#lib/deck/cards.js';

interface StartRequest {
	cards: CardSpread[];
	locale?: string;
}

const VALID_LOCALES = new Set(['en', 'pt-BR', 'es-MX']);
const MAX_POSITION_LENGTH = 64;

export const POST: RequestHandler = async ({ request, cookies, url }) => {
	const { READINGS_KV, DB, DEEPSEEK_API_KEY } = env;
	if (!READINGS_KV || !DB || !DEEPSEEK_API_KEY) {
		throw error(500, 'Reading service is not configured');
	}

	let body: StartRequest;
	try {
		body = (await request.json()) as StartRequest;
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	if (!Array.isArray(body.cards) || body.cards.length !== 3) {
		throw error(400, 'Request must include exactly 3 cards');
	}

	// Canonicalize the spread: card names must be known canonical English
	// display names (the form stored in D1 cards_json and used as the KV
	// cache key), and positions must be sane free-text labels. The LLM
	// prompt and the public /r/:slug page both consume these values.
	const cards: CardSpread[] = body.cards.map((card) => {
		if (!card || typeof card.name !== 'string' || typeof card.position !== 'string') {
			throw error(400, 'Invalid cards');
		}
		const id = cardIdFromDisplayName(card.name);
		const position = card.position.trim();
		if (!id || position.length === 0 || position.length > MAX_POSITION_LENGTH) {
			throw error(400, 'Invalid cards');
		}
		return { name: cardDisplayName(id), position };
	});

	const locale =
		body.locale && VALID_LOCALES.has(body.locale)
			? body.locale
			: getDefaultLocale(url.hostname);

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

	waitUntil(
		logEvent(DB, {
			event: 'reading_started',
			readerId,
			locale,
			hostname: url.hostname,
			metadata: { card_count: cards.length }
		})
	);

	waitUntil(
		generateReading(
			jobId,
			readingId,
			readerId,
			cards,
			READINGS_KV,
			DB,
			DEEPSEEK_API_KEY,
			locale,
			url.hostname
		)
	);

	return json({ jobId, readingId });
};
