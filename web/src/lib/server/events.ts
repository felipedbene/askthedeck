/**
 * Anonymous event logging into the `events` D1 table.
 *
 * Two layers of safety:
 * - reader_id is SHA-256 hashed before insert; the raw cookie value never
 *   reaches the events table. This is one-way: we can count distinct
 *   hashes but cannot rejoin events to specific readings or cookies.
 * - logEvent ALWAYS catches and swallows errors. Analytics failures must
 *   never propagate into the user-facing flow.
 *
 * The event name allowlist lives here so callers can't drift the schema
 * silently — anything not in the allowlist is rejected with a warning.
 */
import type { D1Database } from '@cloudflare/workers-types';

export const SERVER_EVENT_TYPES = [
	'reading_started',
	'reading_completed',
	'reading_errored',
	'reading_viewed',
	'share_published',
	'apoiar_page_viewed'
] as const;

export const CLIENT_EVENT_TYPES = [
	'share_link_copied',
	'kofi_clicked',
	'inline_closer_clicked'
] as const;

export const ALL_EVENT_TYPES = [...SERVER_EVENT_TYPES, ...CLIENT_EVENT_TYPES] as const;

export type ServerEventType = (typeof SERVER_EVENT_TYPES)[number];
export type ClientEventType = (typeof CLIENT_EVENT_TYPES)[number];
export type EventType = ServerEventType | ClientEventType;

const SERVER_SET: ReadonlySet<EventType> = new Set(SERVER_EVENT_TYPES);
const CLIENT_SET: ReadonlySet<EventType> = new Set(CLIENT_EVENT_TYPES);
const ALL_SET: ReadonlySet<string> = new Set(ALL_EVENT_TYPES);

export function isClientEvent(event: string): event is ClientEventType {
	return CLIENT_SET.has(event as EventType);
}

export function isServerEvent(event: string): event is ServerEventType {
	return SERVER_SET.has(event as EventType);
}

export function isKnownEvent(event: string): event is EventType {
	return ALL_SET.has(event);
}

export async function hashReaderId(readerId: string): Promise<string> {
	const data = new TextEncoder().encode(readerId);
	const buf = await crypto.subtle.digest('SHA-256', data);
	return Array.from(new Uint8Array(buf))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

export interface LogEventArgs {
	event: EventType;
	readerId?: string | null;
	locale?: string | null;
	hostname?: string | null;
	metadata?: Record<string, unknown> | null;
}

/**
 * Insert one event row. Never throws — analytics failures are logged
 * and swallowed so the user-facing flow continues.
 */
export async function logEvent(db: D1Database, args: LogEventArgs): Promise<void> {
	try {
		if (!isKnownEvent(args.event)) {
			console.warn(`[events] dropping unknown event "${args.event}"`);
			return;
		}
		const hash = args.readerId ? await hashReaderId(args.readerId) : null;
		await db
			.prepare(
				`INSERT INTO events
				   (event, reader_id_hash, locale, hostname, metadata_json, created_at)
				 VALUES (?, ?, ?, ?, ?, ?)`
			)
			.bind(
				args.event,
				hash,
				args.locale ?? null,
				args.hostname ?? null,
				args.metadata ? JSON.stringify(args.metadata) : null,
				Date.now()
			)
			.run();
	} catch (err) {
		console.error(
			'[events] insert failed',
			args.event,
			err instanceof Error ? err.message : err
		);
	}
}
