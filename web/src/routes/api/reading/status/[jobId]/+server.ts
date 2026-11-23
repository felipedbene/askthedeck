import { env } from 'cloudflare:workers';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ params }) => {
	const { READINGS_KV } = env;
	if (!READINGS_KV) {
		throw error(500, 'Reading service is not configured');
	}

	const jobData = await READINGS_KV.get(params.jobId);
	if (!jobData) {
		throw error(404, 'Job not found');
	}

	return new Response(jobData, {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
