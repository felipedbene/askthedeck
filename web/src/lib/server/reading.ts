/**
 * Reading generation — server-only.
 *
 * Async job model:
 * 1. POST /api/reading/start stores a 'pending' job in KV and returns its id
 * 2. ctx.waitUntil(generateReading(...)) fires the DeepSeek call immediately
 *    and runs the progress-message loop in parallel
 * 3. Client polls GET /api/reading/status/:jobId every 2s
 *
 * Persistence:
 * - KV holds job state (1h TTL) and a 24h reading-content cache keyed on
 *   sha256(sortedCards + UTC-date + locale)
 * - D1 holds the durable per-reader history (readers + readings tables).
 *   Cache hits still insert a D1 row for this reader so it appears in their
 *   history.
 */
import type { D1Database, KVNamespace } from '@cloudflare/workers-types';
import { MoonPhase, EclipticGeoMoon, SunPosition } from 'astronomy-engine';
import { buildPriorReadingsContext } from './continuity.js';
import { getRecentReadingsByOwner, insertReading } from './db.js';

export interface CardSpread {
	position: string;
	name: string;
}

export type ReadingJobState =
	| { status: 'pending'; message: string; progress: number }
	| { status: 'processing'; message: string; progress: number }
	| { status: 'completed'; message: string; prediction: string; readingId?: string }
	| { status: 'error'; message: string };

interface AstrologySnapshot {
	timestamp: string;
	sunLongitude: number;
	sunSign: string;
	moonLongitude: number;
	moonSign: string;
	phaseAngle: number;
	moonPhase: string;
	planetaryDay: string;
}

const JOB_TTL_SECONDS = 3600;
const CACHE_TTL_SECONDS = 24 * 60 * 60;
const PROGRESS_INTERVAL_MS = 800;

const PROGRESS_MESSAGES = [
	'Shuffling the cosmic deck...',
	'Consulting the celestial guides...',
	'Reading the astral currents...',
	'Channeling ancient wisdom...',
	'Interpreting the stars alignment...',
	'Weaving the threads of fate...',
	'Listening to the whispers of the universe...',
	'Illuminating the path forward...'
];

const LOCALE_NAMES: Record<string, string> = {
	en: 'English',
	'pt-BR': 'Brazilian Portuguese',
	'es-MX': 'Mexican Spanish'
};

const ZODIAC_SIGNS = [
	'Aries',
	'Taurus',
	'Gemini',
	'Cancer',
	'Leo',
	'Virgo',
	'Libra',
	'Scorpio',
	'Sagittarius',
	'Capricorn',
	'Aquarius',
	'Pisces'
];

const MOON_PHASES = [
	'New Moon',
	'Waxing Crescent',
	'First Quarter',
	'Waxing Gibbous',
	'Full Moon',
	'Waning Gibbous',
	'Last Quarter',
	'Waning Crescent'
];

const PLANETARY_DAYS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

export function generateJobId(): string {
	return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getZodiacSign(longitude: number): string {
	const normalized = ((longitude % 360) + 360) % 360;
	return ZODIAC_SIGNS[Math.floor(normalized / 30)];
}

function getMoonPhaseName(phaseAngle: number): string {
	const shifted = (phaseAngle + 22.5 + 360) % 360;
	return MOON_PHASES[Math.floor(shifted / 45)];
}

/**
 * See feedback in commit history: `MoonPhase(date)` is library-defined as
 * `(moonLon − sunLon) mod 360`, so this comparison is partly tautological
 * when both sides come from the same library. It still catches (a) bucket
 * mis-mapping in our phase-name code, and (b) a future library version
 * silently changing MoonPhase's convention.
 */
function checkAstrologyConsistency(
	sunLongitude: number,
	moonLongitude: number,
	phaseAngle: number,
	phaseName: string
): void {
	const computedAngle = (((moonLongitude - sunLongitude) % 360) + 360) % 360;
	const diff = Math.min(
		Math.abs(computedAngle - phaseAngle),
		360 - Math.abs(computedAngle - phaseAngle)
	);
	if (diff > 1) {
		console.warn(
			`[astrology] phase angle mismatch: MoonPhase=${phaseAngle.toFixed(2)}°, ` +
				`(moon−sun)=${computedAngle.toFixed(2)}°, diff=${diff.toFixed(2)}°`
		);
	}
	const expectedName = getMoonPhaseName(computedAngle);
	if (expectedName !== phaseName) {
		console.warn(
			`[astrology] phase name mismatch: angle=${computedAngle.toFixed(2)}° ` +
				`maps to "${expectedName}" but we said "${phaseName}"`
		);
	}
}

function getAstrology(now: Date): { snapshot: AstrologySnapshot; promptBlock: string } {
	const sunPos = SunPosition(now);
	const moonPos = EclipticGeoMoon(now);
	const phaseAngle = MoonPhase(now);

	const sunLongitude = sunPos.elon;
	const moonLongitude = moonPos.lon;
	const sunSign = getZodiacSign(sunLongitude);
	const moonSign = getZodiacSign(moonLongitude);
	const moonPhaseName = getMoonPhaseName(phaseAngle);
	const planetaryDay = PLANETARY_DAYS[now.getDay()];

	console.log(
		`[astrology] ${now.toISOString()} | ` +
			`Sun ${sunLongitude.toFixed(2)}° (${sunSign}) | ` +
			`Moon ${moonLongitude.toFixed(2)}° (${moonSign}) | ` +
			`Phase ${phaseAngle.toFixed(2)}° (${moonPhaseName}) | ` +
			`${planetaryDay}'s day`
	);

	checkAstrologyConsistency(sunLongitude, moonLongitude, phaseAngle, moonPhaseName);

	const snapshot: AstrologySnapshot = {
		timestamp: now.toISOString(),
		sunLongitude,
		sunSign,
		moonLongitude,
		moonSign,
		phaseAngle,
		moonPhase: moonPhaseName,
		planetaryDay
	};

	const promptBlock = `**CONTEXTUAL FRAMEWORK:**
- **Current Moon Phase:** ${moonPhaseName} in ${moonSign}
- **Zodiac Season:** ${sunSign} Season
- **Planetary Day:** ${planetaryDay}
- **Date:** ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

	return { snapshot, promptBlock };
}

function buildPrompt(args: {
	cards: CardSpread[];
	responseLanguage: string;
	astrologyBlock: string;
	priorReadings: string;
}): string {
	const cardSpread = args.cards.map((c) => `${c.position}: ${c.name}`).join(', ');

	return `You are an experienced tarot reader who speaks plainly and with conviction. The seeker has drawn a three-card spread. Each card sits in a specific position; read each card AS THAT POSITION, not as a generic card meaning.

THE SPREAD POSITIONS

Position 1 — Current State: what is actually happening in the seeker's life right now. The texture of their present moment. Not where they "are coming from", not what they "want" — what *is*.

Position 2 — Focus for Growth: where their attention should land in the coming days. The work in front of them. Not a destination — a verb.

Position 3 — Potential in 7 Days: a quality of energy that could become available to them within the week, IF they engage with Position 2. Frame this as an atmosphere or invitation, NEVER as a guaranteed outcome or specific event ("you will receive money", "someone will appear").

THE CARDS

${cardSpread}

THE ASTROLOGICAL WEATHER

${args.astrologyBlock}

Use the moon phase and moon sign to color how Position 2's work will FEEL — waxing energy builds, waning energy releases; fire signs push, water signs absorb. Use the zodiac season as the broad terrain. The planetary day is a minor accent, not a headline.

PRIOR READINGS (most recent first, up to 5)

${args.priorReadings}

CONTINUITY GUIDANCE

If there is a clear narrative thread between the prior cards and today's spread, you may weave it in subtly — for example, "the Three of Pentacles you carried last week has matured into..." Do not force continuity if there isn't a natural one. Do not invent details about the reader's life that weren't in the prior readings above.

STRUCTURE

Use three subheadings, one per card, in this exact format:

## {Position label}: {Card name}

Then one or two paragraphs of prose for that card. After the third card, add a short closing paragraph (no header) that names the through-line. No bullet lists. No additional headers beyond the three card headers.

HOW TO WRITE THIS READING

- Commit to one interpretation per card. Do not hedge with "this could mean X, or perhaps Y, or possibly Z." Pick the reading that fits this spread in this astrological moment and say it.
- When two cards pull in different directions, name the tension. Do not smooth it over with "these energies combine to..." Tension is information.
- Use concrete sensory imagery. "A door left ajar." "The smell of rain on hot pavement." "The weight of a key in your palm." Avoid abstract spiritual vocabulary when a physical image will do.

BANNED PHRASES — DO NOT USE THESE

English:
"dark night of the soul", "spiritual download", "download", "trust the process", "the universe is conspiring", "sacred invitation", "divine timing", "high vibration", "low vibration", "shadow work", "manifesting", "manifestation", "cosmic weaving", "soul-level", "energetic shift", "alignment" (as in "in alignment"), "ancient wisdom", "the veil is thin", "dear one", "beloved", "sweet soul"

Portuguese (pt-BR):
"noite escura da alma", "download espiritual", "confie no processo", "confia no processo", "o universo está conspirando", "o universo conspira", "convite sagrado", "sagrado convite", "tempo divino", "alta vibração", "baixa vibração", "vibrar alto", "manifestar", "manifestação" (no sentido New Age), "trabalho de sombra", "tecelagem cósmica", "nível da alma", "mudança energética", "alinhamento" (no sentido "em alinhamento"), "sabedoria ancestral", "o véu está fino", "querido buscador", "querida buscadora", "amada alma", "alma querida"

Spanish (es-MX):
"noche oscura del alma", "descarga espiritual", "confía en el proceso", "el universo conspira", "el universo está conspirando", "sagrada invitación", "tiempo divino", "alta vibración", "baja vibración", "vibrar alto", "manifestar", "manifestación" (en sentido New Age), "trabajo de sombra", "tejido cósmico", "a nivel del alma", "cambio energético", "alineación", "sabiduría ancestral", "el velo se hace delgado", "querido buscador", "alma amada"

WHAT YOU MUST NOT DO

- Do not promise specific outcomes. The Potential card is an atmosphere, not a forecast.
- Do not resolve every card's challenge with a tidy spiritual lesson.
- Do not address the seeker with "dear one", "beloved", "querido buscador", "alma amada" or any equivalent. Address them as "you" / "você" / "tú", directly.
- Do not begin with "Ah," "I see...", "Behold," or any throat-clearing opener. Start with the first card's heading.
- NEVER mention donations, payment, supporting the project, Ko-fi, Buy Me a Coffee, tips, or any commercial aspect of this service. The reading is the reading.
- NEVER reference information you weren't explicitly given:
  - The reader's location, city, country, or timezone
  - The current time of day or day of week beyond what's in the astrological weather above
  - The reader's device, browser, or language preferences beyond the requested output language
  - Anything implying you "see" or "sense" the reader personally
  The ONLY legitimate personal context is what appears in PRIOR READINGS above.

RESPONSE LANGUAGE

Write the entire reading in ${args.responseLanguage}. The English banned list above applies to natural translations in that language even if not explicitly listed.

Begin.`;
}

async function putJobState(
	kv: KVNamespace,
	jobId: string,
	state: ReadingJobState
): Promise<void> {
	await kv.put(jobId, JSON.stringify(state), { expirationTtl: JOB_TTL_SECONDS });
}

export async function initJob(kv: KVNamespace, jobId: string): Promise<void> {
	await putJobState(kv, jobId, {
		status: 'pending',
		message: 'Preparing your reading...',
		progress: 0
	});
}

async function sha256Hex(input: string): Promise<string> {
	const data = new TextEncoder().encode(input);
	const buf = await crypto.subtle.digest('SHA-256', data);
	return Array.from(new Uint8Array(buf))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

async function readingCacheKey(cards: CardSpread[], locale: string): Promise<string> {
	const sortedCards = [...cards]
		.map((c) => `${c.position}|${c.name}`)
		.sort()
		.join(';');
	const today = new Date().toISOString().slice(0, 10);
	const hash = await sha256Hex(`${sortedCards}__${today}__${locale}`);
	return `reading-cache:${hash}`;
}

async function runProgressLoop(
	kv: KVNamespace,
	jobId: string,
	stopFlag: { done: boolean }
): Promise<void> {
	for (let i = 0; i < PROGRESS_MESSAGES.length; i++) {
		if (stopFlag.done) return;
		await putJobState(kv, jobId, {
			status: 'processing',
			message: PROGRESS_MESSAGES[i],
			progress: Math.floor((i / PROGRESS_MESSAGES.length) * 100)
		});
		await new Promise((resolve) => setTimeout(resolve, PROGRESS_INTERVAL_MS));
	}
	while (!stopFlag.done) {
		await new Promise((resolve) => setTimeout(resolve, PROGRESS_INTERVAL_MS));
	}
}

/**
 * Persist a completed reading to D1. Errors are logged and swallowed —
 * the user still sees the reading via the KV job, per ticket constraint.
 */
async function persistReading(
	db: D1Database,
	args: {
		readingId: string;
		readerId: string;
		now: number;
		locale: string;
		cards: CardSpread[];
		prediction: string;
		astrology: AstrologySnapshot;
	}
): Promise<void> {
	try {
		await insertReading(db, {
			id: args.readingId,
			ownerId: args.readerId,
			createdAt: args.now,
			locale: args.locale,
			cards: args.cards,
			prediction: args.prediction,
			astrology: args.astrology
		});
	} catch (err) {
		console.error(
			'[d1] failed to persist reading',
			args.readingId,
			err instanceof Error ? err.message : err
		);
	}
}

export async function generateReading(
	jobId: string,
	readingId: string,
	readerId: string,
	cards: CardSpread[],
	kv: KVNamespace,
	db: D1Database,
	deepseekApiKey: string,
	locale: string
): Promise<void> {
	const normalizedLocale = locale || 'en';
	const responseLanguage = LOCALE_NAMES[normalizedLocale] || 'English';
	const now = Date.now();
	const nowDate = new Date(now);

	const stopFlag = { done: false };
	const progressTask = runProgressLoop(kv, jobId, stopFlag);

	try {
		const { snapshot: astrology, promptBlock: astrologyBlock } = getAstrology(nowDate);

		const cacheKey = await readingCacheKey(cards, normalizedLocale);
		const cached = await kv.get(cacheKey);
		if (cached) {
			console.log(`[cache hit] ${cacheKey}`);
			await persistReading(db, {
				readingId,
				readerId,
				now,
				locale: normalizedLocale,
				cards,
				prediction: cached,
				astrology
			});
			stopFlag.done = true;
			await progressTask;
			await putJobState(kv, jobId, {
				status: 'completed',
				message: 'Your reading is ready',
				prediction: cached,
				readingId
			});
			return;
		}

		// Prior readings for continuity (excluding the one we're about to write)
		let priorContext = "This is the reader's first session.";
		try {
			const priors = await getRecentReadingsByOwner(db, readerId, readingId, 5);
			priorContext = buildPriorReadingsContext(priors, normalizedLocale, now);
		} catch (err) {
			console.error(
				'[d1] failed to load priors for continuity',
				err instanceof Error ? err.message : err
			);
		}

		const prompt = buildPrompt({
			cards,
			responseLanguage,
			astrologyBlock,
			priorReadings: priorContext
		});

		const response = await fetch('https://api.deepseek.com/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${deepseekApiKey}`
			},
			body: JSON.stringify({
				model: 'deepseek-chat',
				messages: [{ role: 'user', content: prompt }],
				max_tokens: 2000
			})
		});

		if (!response.ok) {
			throw new Error(`API request failed: ${response.status}`);
		}

		const predictionData = (await response.json()) as {
			choices: { message: { content: string }; finish_reason?: string }[];
		};
		const choice = predictionData.choices[0];
		const prediction = choice.message.content;
		const finishReason = choice.finish_reason ?? 'unknown';
		console.log(`[deepseek] finish_reason=${finishReason}, length=${prediction.length}`);
		if (finishReason === 'length') {
			console.warn('[deepseek] response truncated by max_tokens — consider raising the limit');
		}

		await kv.put(cacheKey, prediction, { expirationTtl: CACHE_TTL_SECONDS });

		await persistReading(db, {
			readingId,
			readerId,
			now,
			locale: normalizedLocale,
			cards,
			prediction,
			astrology
		});

		stopFlag.done = true;
		await progressTask;

		await putJobState(kv, jobId, {
			status: 'completed',
			message: 'Your reading is ready',
			prediction,
			readingId
		});
	} catch (error) {
		stopFlag.done = true;
		await progressTask.catch(() => undefined);
		const message = error instanceof Error ? error.message : String(error);
		console.error('Error generating reading:', message);
		await putJobState(kv, jobId, {
			status: 'error',
			message: `Error generating reading: ${message}`
		});
	}
}
