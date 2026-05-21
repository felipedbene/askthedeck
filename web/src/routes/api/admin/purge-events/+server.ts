import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

/**
 * Privileged endpoint: deletes events older than N days from the
 * events table. Intended to be called by an external scheduler
 * (k8s CronJob) with a bearer token.
 *
 * Auth: Authorization: Bearer ${PURGE_SECRET}. The secret is set via
 * `wrangler secret put PURGE_SECRET` (always via stdin pipe — see
 * project memory). Constant-time compare to avoid trivial timing
 * leaks even though the attacker can't really benefit from this one.
 *
 * Body: { olderThanDays?: number } — defaults to 90. Clamped to
 * [1, 3650] to prevent fat-fingered DELETEs.
 */
const DEFAULT_DAYS = 90;
const MIN_DAYS = 1;
const MAX_DAYS = 3650;

function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) {
		diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return diff === 0;
}

export const POST: RequestHandler = async ({ request, platform }) => {
	if (!platform?.env.DB) {
		throw error(500, 'DB not configured');
	}
	const expected = platform.env.PURGE_SECRET;
	if (!expected) {
		throw error(500, 'PURGE_SECRET not configured');
	}

	const header = request.headers.get('authorization') ?? '';
	const match = header.match(/^Bearer\s+(.+)$/);
	if (!match || !timingSafeEqual(match[1], expected)) {
		throw error(401, 'Unauthorized');
	}

	let olderThanDays = DEFAULT_DAYS;
	try {
		const body = (await request.json()) as { olderThanDays?: number };
		if (typeof body.olderThanDays === 'number' && Number.isFinite(body.olderThanDays)) {
			olderThanDays = body.olderThanDays;
		}
	} catch {
		/* empty body is fine */
	}
	if (olderThanDays < MIN_DAYS) olderThanDays = MIN_DAYS;
	if (olderThanDays > MAX_DAYS) olderThanDays = MAX_DAYS;

	const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
	const result = await platform.env.DB
		.prepare(`DELETE FROM events WHERE created_at < ?`)
		.bind(cutoff)
		.run();
	const deleted = result.meta?.changes ?? 0;

	console.log(`[purge] deleted ${deleted} events older than ${olderThanDays}d`);

	return json({ deleted, olderThanDays, cutoff });
};
