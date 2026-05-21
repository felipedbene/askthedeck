type ClientEvent = 'share_link_copied' | 'kofi_clicked' | 'inline_closer_clicked';

/**
 * Fire-and-forget client analytics. Uses keepalive so events queued just
 * before a navigation (e.g. kofi_clicked → window.open) still get sent.
 * Failures are silently swallowed — analytics must never break UX.
 */
export function trackEvent(event: ClientEvent, metadata?: Record<string, unknown>): void {
	try {
		fetch('/api/events', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ event, metadata }),
			keepalive: true
		}).catch(() => undefined);
	} catch {
		/* ignore */
	}
}
