import type { D1Database } from '@cloudflare/workers-types';
import type { CardSpread } from './reading.js';

export interface ReadingRow {
	id: string;
	owner_id: string;
	created_at: number;
	locale: string;
	cards_json: string;
	prediction: string;
	astrology_json: string;
	visibility: 'private' | 'public';
	share_slug: string | null;
}

export interface PriorReadingRow {
	created_at: number;
	cards_json: string;
}

/**
 * Insert a reader if missing; otherwise bump last_seen_at. Idempotent.
 */
export async function upsertReader(
	db: D1Database,
	readerId: string,
	locale: string,
	now: number
): Promise<void> {
	await db
		.prepare(
			`INSERT INTO readers (id, created_at, last_seen_at, locale)
			 VALUES (?, ?, ?, ?)
			 ON CONFLICT(id) DO UPDATE SET
			   last_seen_at = excluded.last_seen_at,
			   locale = excluded.locale`
		)
		.bind(readerId, now, now, locale)
		.run();
}

export async function insertReading(
	db: D1Database,
	row: {
		id: string;
		ownerId: string;
		createdAt: number;
		locale: string;
		cards: CardSpread[];
		prediction: string;
		astrology: unknown;
	}
): Promise<void> {
	await db
		.prepare(
			`INSERT INTO readings
			   (id, owner_id, created_at, locale, cards_json, prediction,
			    astrology_json, visibility, share_slug)
			 VALUES (?, ?, ?, ?, ?, ?, ?, 'private', NULL)`
		)
		.bind(
			row.id,
			row.ownerId,
			row.createdAt,
			row.locale,
			JSON.stringify(row.cards),
			row.prediction,
			JSON.stringify(row.astrology)
		)
		.run();
}

export async function getReadingById(
	db: D1Database,
	readingId: string
): Promise<ReadingRow | null> {
	const row = await db
		.prepare(`SELECT * FROM readings WHERE id = ?`)
		.bind(readingId)
		.first<ReadingRow>();
	return row ?? null;
}

export async function getReadingBySlug(
	db: D1Database,
	slug: string
): Promise<ReadingRow | null> {
	const row = await db
		.prepare(
			`SELECT * FROM readings WHERE share_slug = ? AND visibility = 'public'`
		)
		.bind(slug)
		.first<ReadingRow>();
	return row ?? null;
}

/**
 * Atomically claim a share slug for a reading owned by ownerId. Returns the
 * resulting slug, or null if the slug is already taken (caller should retry).
 */
export async function tryPublishReading(
	db: D1Database,
	readingId: string,
	ownerId: string,
	slug: string
): Promise<{ changed: boolean }> {
	const result = await db
		.prepare(
			`UPDATE readings
			 SET visibility = 'public', share_slug = ?
			 WHERE id = ? AND owner_id = ?
			   AND NOT EXISTS (SELECT 1 FROM readings WHERE share_slug = ?)`
		)
		.bind(slug, readingId, ownerId, slug)
		.run();
	const changes = result.meta?.changes ?? 0;
	return { changed: changes > 0 };
}

export async function unpublishReading(
	db: D1Database,
	readingId: string,
	ownerId: string
): Promise<{ changed: boolean }> {
	const result = await db
		.prepare(
			`UPDATE readings
			 SET visibility = 'private', share_slug = NULL
			 WHERE id = ? AND owner_id = ?`
		)
		.bind(readingId, ownerId)
		.run();
	const changes = result.meta?.changes ?? 0;
	return { changed: changes > 0 };
}

export async function getRecentReadingsByOwner(
	db: D1Database,
	ownerId: string,
	excludeId: string | null,
	limit: number
): Promise<PriorReadingRow[]> {
	const stmt = excludeId
		? db
				.prepare(
					`SELECT created_at, cards_json FROM readings
					 WHERE owner_id = ? AND id != ?
					 ORDER BY created_at DESC LIMIT ?`
				)
				.bind(ownerId, excludeId, limit)
		: db
				.prepare(
					`SELECT created_at, cards_json FROM readings
					 WHERE owner_id = ?
					 ORDER BY created_at DESC LIMIT ?`
				)
				.bind(ownerId, limit);
	const result = await stmt.all<PriorReadingRow>();
	return result.results ?? [];
}

export async function getReadingsListForOwner(
	db: D1Database,
	ownerId: string,
	limit: number
): Promise<
	Array<{
		id: string;
		created_at: number;
		cards_json: string;
		preview: string;
		visibility: 'private' | 'public';
		share_slug: string | null;
	}>
> {
	const result = await db
		.prepare(
			`SELECT id, created_at, cards_json, substr(prediction, 1, 200) AS preview,
			        visibility, share_slug
			 FROM readings
			 WHERE owner_id = ?
			 ORDER BY created_at DESC LIMIT ?`
		)
		.bind(ownerId, limit)
		.all<{
			id: string;
			created_at: number;
			cards_json: string;
			preview: string;
			visibility: 'private' | 'public';
			share_slug: string | null;
		}>();
	return result.results ?? [];
}
