import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import {
	generateJobId,
	generateReading,
	initJob,
	type CardSpread
} from '$lib/server/reading.js';

interface StartRequest {
	cards: CardSpread[];
	locale?: string;
}

export const POST: RequestHandler = async ({ request, platform }) => {
	if (!platform) {
		throw error(500, 'Platform bindings unavailable');
	}
	const { READINGS_KV, DEEPSEEK_API_KEY } = platform.env;
	if (!READINGS_KV || !DEEPSEEK_API_KEY) {
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

	const jobId = generateJobId();
	await initJob(READINGS_KV, jobId);

	platform.context.waitUntil(
		generateReading(jobId, body.cards, READINGS_KV, DEEPSEEK_API_KEY, body.locale)
	);

	return json({ jobId });
};
