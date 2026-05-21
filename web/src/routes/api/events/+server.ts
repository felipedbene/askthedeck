import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getReaderIdCookie } from '$lib/server/cookies.js';
import { getDefaultLocale } from '$lib/server/locale.js';
import { isClientEvent, logEvent } from '$lib/server/events.js';

interface Body {
	event?: string;
	locale?: string;
	metadata?: Record<string, unknown>;
}

const VALID_LOCALES = new Set(['en', 'pt-BR', 'es-MX']);

/**
 * Client-side event ingestion. Server-side events use logEvent directly
 * inside their endpoints; this route exists ONLY for events that
 * originate in the browser (button clicks etc.). The allowlist in
 * events.ts gates what's acceptable here — any non-client event is
 * rejected with 400 to keep the endpoint from becoming a graffiti wall.
 *
 * Privacy: we read the reader_id cookie (hashed in logEvent) and the
 * request hostname. No IP, no UA, no referrer. The metadata blob is
 * stringified as-is; callers SHOULD send small, schema-shaped payloads.
 */
export const POST: RequestHandler = async ({ request, platform, cookies, url }) => {
	if (!platform?.env.DB) {
		throw error(500, 'Analytics not configured');
	}

	let body: Body;
	try {
		body = (await request.json()) as Body;
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	if (!body.event || !isClientEvent(body.event)) {
		throw error(400, 'Unknown event');
	}

	const readerId = getReaderIdCookie(cookies);
	const locale =
		body.locale && VALID_LOCALES.has(body.locale)
			? body.locale
			: getDefaultLocale(url.hostname);

	platform.context.waitUntil(
		logEvent(platform.env.DB, {
			event: body.event,
			readerId,
			locale,
			hostname: url.hostname,
			metadata: body.metadata ?? null
		})
	);

	return new Response(null, { status: 204 });
};
