/**
 * Reading generation — server-only.
 *
 * Async job model:
 * 1. POST /api/reading/start stores a 'pending' job in KV and returns its id
 * 2. ctx.waitUntil(generateReading(...)) updates KV with progress messages,
 *    then calls DeepSeek, then writes 'completed' (or 'error')
 * 3. Client polls GET /api/reading/status/:jobId every 2s
 *
 * Jobs auto-expire from KV after 1 hour.
 */
import type { KVNamespace } from '@cloudflare/workers-types';

export interface CardSpread {
	position: string;
	name: string;
}

export type ReadingJobState =
	| { status: 'pending'; message: string; progress: number }
	| { status: 'processing'; message: string; progress: number }
	| { status: 'completed'; message: string; prediction: string }
	| { status: 'error'; message: string };

const JOB_TTL_SECONDS = 3600;

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

export function generateJobId(): string {
	return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getAstrologyContext(): string {
	const now = new Date();

	// Moon phase via simple Julian-day approximation
	const year = now.getFullYear();
	const month = now.getMonth() + 1;
	const day = now.getDate();

	let adjustedYear = year;
	let adjustedMonth = month;
	if (adjustedMonth < 3) {
		adjustedYear--;
		adjustedMonth += 12;
	}
	++adjustedMonth;
	const c = 365.25 * adjustedYear;
	const e = 30.6 * adjustedMonth;
	let jd = c + e + day - 694039.09;
	jd /= 29.5305882;
	const intPart = Math.trunc(jd);
	jd -= intPart;
	const phaseIndex = Math.round(jd * 8) & 7;

	const moonPhases = [
		'New Moon',
		'Waxing Crescent',
		'First Quarter',
		'Waxing Gibbous',
		'Full Moon',
		'Waning Gibbous',
		'Last Quarter',
		'Waning Crescent'
	];
	const moonPhaseName = moonPhases[phaseIndex];

	// Sun's zodiac position (approximate)
	const dayOfYear = Math.floor(
		(now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
	);
	const sunLongitude = (280.46 + 0.9856474 * dayOfYear) % 360;
	const zodiacSigns = [
		'Capricorn',
		'Aquarius',
		'Pisces',
		'Aries',
		'Taurus',
		'Gemini',
		'Cancer',
		'Leo',
		'Virgo',
		'Libra',
		'Scorpio',
		'Sagittarius'
	];
	const zodiacIndex = Math.floor(((sunLongitude + 10) % 360) / 30);
	const zodiacSeason = zodiacSigns[zodiacIndex];

	// Moon sign (~13 day offset from sun position)
	const moonDayOffset = dayOfYear + 13;
	const moonLongitude = (280.46 + 0.9856474 * moonDayOffset) % 360;
	const moonSignIndex = Math.floor(((moonLongitude + 10) % 360) / 30);
	const moonSign = zodiacSigns[moonSignIndex];

	const dayOfWeek = now.getDay();
	const planetaryDays = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
	const planetaryDay = planetaryDays[dayOfWeek];

	return `**CONTEXTUAL FRAMEWORK:**
- **Current Moon Phase:** ${moonPhaseName} in ${moonSign}
- **Zodiac Season:** ${zodiacSeason} Season
- **Planetary Day:** ${planetaryDay}
- **Date:** ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
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

export async function generateReading(
	jobId: string,
	cards: CardSpread[],
	kv: KVNamespace,
	deepseekApiKey: string,
	locale?: string
): Promise<void> {
	const responseLanguage = (locale && LOCALE_NAMES[locale]) || 'English';

	try {
		for (let i = 0; i < PROGRESS_MESSAGES.length; i++) {
			await putJobState(kv, jobId, {
				status: 'processing',
				message: PROGRESS_MESSAGES[i],
				progress: Math.floor((i / PROGRESS_MESSAGES.length) * 100)
			});
			if (i < PROGRESS_MESSAGES.length - 1) {
				await new Promise((resolve) => setTimeout(resolve, 500));
			}
		}

		const cardSpread = cards.map((c) => `${c.position}: ${c.name}`).join(', ');
		const astrologyContext = getAstrologyContext();

		const prompt = `Act as an intuitive, esoteric guide blending Tarot wisdom with astrological insights. You are a wise seer who speaks in a flowing, narrative style that connects cosmic patterns to personal transformation.
**READING STYLE GUIDELINES:**
1. **Cosmic Weaving:** Blend the card meanings with the current astrological weather. How does the moon phase color the energy? What does the zodiac season emphasize?
2. **Intuitive Narrative:** Create a flowing story, not a report. Use phrases like "The cards speak through the [Moon Phase] moon's energy..." or "In this [Zodiac] season, I see..."
3. **Shadow & Light Integration:** Frame challenges as sacred invitations for growth, especially considering any difficult astrological aspects.
4. **Practical Magic:** Offer soul-level guidance that feels actionable and resonant with the cosmic timing.

** Tarot Card Spread:** ${cardSpread}
** Contextual Framework:** ${astrologyContext}

**RESPONSE LANGUAGE:** Write your entire reading in ${responseLanguage}. Preserve the intuitive, esoteric tone in that language.

Begin the interpretation now.`;

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
			choices: { message: { content: string } }[];
		};
		const prediction = predictionData.choices[0].message.content;

		await putJobState(kv, jobId, {
			status: 'completed',
			message: 'Your reading is ready',
			prediction
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error('Error generating reading:', message);
		await putJobState(kv, jobId, {
			status: 'error',
			message: `Error generating reading: ${message}`
		});
	}
}
