import type { CardId } from '$lib/deck/cards.js';

export type ReadingStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface ReadingJobState {
	status: ReadingStatus;
	message?: string;
	progress?: number;
	prediction?: string;
}

export interface CardPayload {
	position: string;
	name: string;
}

interface StartResponse {
	jobId: string;
	readingId: string;
}

const POLL_INTERVAL_MS = 2000;

export async function startReading(
	cards: CardPayload[],
	locale: string,
	signal?: AbortSignal
): Promise<StartResponse> {
	const res = await fetch('/api/reading/start', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ cards, locale }),
		signal
	});
	if (!res.ok) {
		throw new Error(`Failed to start reading (${res.status})`);
	}
	const data = (await res.json()) as StartResponse;
	if (!data.jobId) throw new Error('Reading start response missing jobId');
	return data;
}

async function fetchStatus(jobId: string, signal?: AbortSignal): Promise<ReadingJobState> {
	const res = await fetch(`/api/reading/status/${encodeURIComponent(jobId)}`, { signal });
	if (!res.ok) {
		throw new Error(`Reading status request failed (${res.status})`);
	}
	return (await res.json()) as ReadingJobState;
}

/**
 * Poll the reading status endpoint until it completes or errors.
 * Calls `onProgress` on every poll while the job is still running.
 * Resolves with the final prediction string on completion.
 * Rejects if the backend returns status='error' or if the signal aborts.
 */
export async function pollReadingStatus(
	jobId: string,
	onProgress: (state: ReadingJobState) => void,
	signal?: AbortSignal
): Promise<string> {
	while (true) {
		if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
		const state = await fetchStatus(jobId, signal);
		onProgress(state);

		if (state.status === 'completed') {
			if (!state.prediction) throw new Error('Reading completed with no prediction');
			return state.prediction;
		}
		if (state.status === 'error') {
			throw new Error(state.message || 'Reading generation failed');
		}

		await new Promise<void>((resolve, reject) => {
			const t = setTimeout(resolve, POLL_INTERVAL_MS);
			signal?.addEventListener(
				'abort',
				() => {
					clearTimeout(t);
					reject(new DOMException('Aborted', 'AbortError'));
				},
				{ once: true }
			);
		});
	}
}
