import type { PriorReadingRow } from './db.js';

interface Card {
	position?: string;
	name?: string;
}

/**
 * Format prior readings into a one-line-per-entry context string for the
 * LLM prompt. Each line: "<relative time>: Card 1 / Card 2 / Card 3".
 * Relative time is localized using Intl.RelativeTimeFormat.
 *
 * Per ticket: cards only — no prior prediction text in the prompt.
 */
export function buildPriorReadingsContext(
	priors: PriorReadingRow[],
	locale: string,
	now: number
): string {
	if (priors.length === 0) {
		return "This is the reader's first session.";
	}
	const rtf = makeRelativeTimeFormatter(locale);
	const lines: string[] = [];
	for (const row of priors) {
		const cards = safeParseCards(row.cards_json);
		const names = cards
			.map((c) => c.name?.trim())
			.filter((n): n is string => !!n);
		if (names.length === 0) continue;
		lines.push(`${rtf(row.created_at, now)}: ${names.join(' / ')}`);
	}
	return lines.length > 0 ? lines.join('\n') : "This is the reader's first session.";
}

function safeParseCards(json: string): Card[] {
	try {
		const v = JSON.parse(json);
		return Array.isArray(v) ? (v as Card[]) : [];
	} catch {
		return [];
	}
}

function makeRelativeTimeFormatter(locale: string): (then: number, now: number) => string {
	let fmt: Intl.RelativeTimeFormat;
	try {
		fmt = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
	} catch {
		fmt = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
	}
	return (then, now) => {
		const seconds = Math.round((then - now) / 1000); // negative → past
		const abs = Math.abs(seconds);
		if (abs < 60) return fmt.format(seconds, 'second');
		const minutes = Math.round(seconds / 60);
		if (Math.abs(minutes) < 60) return fmt.format(minutes, 'minute');
		const hours = Math.round(seconds / 3600);
		if (Math.abs(hours) < 24) return fmt.format(hours, 'hour');
		const days = Math.round(seconds / 86400);
		if (Math.abs(days) < 7) return fmt.format(days, 'day');
		const weeks = Math.round(seconds / (7 * 86400));
		if (Math.abs(weeks) < 5) return fmt.format(weeks, 'week');
		const months = Math.round(seconds / (30 * 86400));
		if (Math.abs(months) < 12) return fmt.format(months, 'month');
		const years = Math.round(seconds / (365 * 86400));
		return fmt.format(years, 'year');
	};
}
