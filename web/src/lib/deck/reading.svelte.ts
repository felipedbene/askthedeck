import {
	startReading,
	pollReadingStatus,
	type CardPayload,
	type ReadingJobState
} from '$lib/api/reading.js';

type Phase = 'idle' | 'pending' | 'success' | 'error';

class ReadingState {
	phase = $state<Phase>('idle');
	message = $state<string>('');
	progress = $state<number>(0);
	prediction = $state<string>('');
	error = $state<string>('');

	#controller: AbortController | null = null;

	get isActive() {
		return this.phase === 'pending';
	}

	async start(cards: CardPayload[], locale: string): Promise<void> {
		this.cancel();
		const controller = new AbortController();
		this.#controller = controller;

		this.phase = 'pending';
		this.message = '';
		this.progress = 0;
		this.prediction = '';
		this.error = '';

		try {
			const jobId = await startReading(cards, locale, controller.signal);
			const prediction = await pollReadingStatus(
				jobId,
				(state: ReadingJobState) => {
					if (controller.signal.aborted) return;
					if (state.message) this.message = state.message;
					if (typeof state.progress === 'number') this.progress = state.progress;
				},
				controller.signal
			);
			if (controller.signal.aborted) return;
			this.prediction = prediction;
			this.phase = 'success';
		} catch (err) {
			if (controller.signal.aborted) return;
			this.error = err instanceof Error ? err.message : 'Unknown error';
			this.phase = 'error';
		} finally {
			if (this.#controller === controller) this.#controller = null;
		}
	}

	cancel() {
		this.#controller?.abort();
		this.#controller = null;
	}

	reset() {
		this.cancel();
		this.phase = 'idle';
		this.message = '';
		this.progress = 0;
		this.prediction = '';
		this.error = '';
	}
}

export const reading = new ReadingState();
