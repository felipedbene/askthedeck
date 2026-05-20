/**
 * JOB POLLING ARCHITECTURE
 *
 * Problem: Reading generation takes ~60 seconds, causing users to navigate away
 * Solution: Async job system with immediate response + progress polling
 *
 * Flow:
 * 1. Frontend calls POST /api/reading/start → receives job_id immediately
 * 2. Backend starts async reading generation (no blocking!)
 * 3. Frontend polls GET /api/reading/status/:job_id every 2 seconds
 * 4. Backend updates job state in KV store with progress messages
 * 5. When complete, frontend retrieves final reading from job state
 *
 * Storage: Cloudflare Workers KV (key-value store)
 * - Key: job_id (e.g., "job_1234567890_abc123")
 * - Value: JSON object with { status, message, progress, prediction }
 * - TTL: 1 hour (auto-cleanup)
 */

/**
 * Generates a unique job ID for tracking async reading generation
 * Format: job_<timestamp>_<random_string>
 * Example: job_1716172800000_a7b3c9d
 *
 * @returns {string} Unique job identifier
 */
function generateJobId() {
	return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Progress messages shown to user while reading generates
 * These rotate through as the job progresses, keeping users engaged
 * Each message appears for ~500ms during the generation process
 */
const PROGRESS_MESSAGES = [
	'Shuffling the cosmic deck...',
	'Consulting the celestial guides...',
	'Reading the astral currents...',
	'Channeling ancient wisdom...',
	'Interpreting the stars alignment...',
	'Weaving the threads of fate...',
	'Listening to the whispers of the universe...',
	'Illuminating the path forward...',
];

// Helper function to get zodiac sign from ecliptic longitude
function getZodiacSign(longitude) {
	const signs = [
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
		'Pisces',
	];
	const index = Math.floor(longitude / 30);
	return signs[index];
}

// Helper function to get moon phase name
function getMoonPhaseName(phase) {
	// phase is 0-360 degrees
	if (phase < 45) return 'New Moon';
	if (phase < 90) return 'Waxing Crescent';
	if (phase < 135) return 'First Quarter';
	if (phase < 180) return 'Waxing Gibbous';
	if (phase < 225) return 'Full Moon';
	if (phase < 270) return 'Waning Gibbous';
	if (phase < 315) return 'Last Quarter';
	return 'Waning Crescent';
}

// Helper function to get zodiac sign the moon is in
function getMoonSign(moonLongitude) {
	return getZodiacSign(moonLongitude);
}

// Generate astrology context
function getAstrologyContext() {
	const now = new Date();

	// Simple moon phase calculation because it's a quick approximation;
	const year = now.getFullYear();
	const month = now.getMonth() + 1;
	const day = now.getDate();

	let c = 0,
		e = 0,
		jd = 0,
		b = 0;
	let adjustedYear = year;
	let adjustedMonth = month;

	if (adjustedMonth < 3) {
		adjustedYear--;
		adjustedMonth += 12;
	}

	++adjustedMonth;
	c = 365.25 * adjustedYear;
	e = 30.6 * adjustedMonth;
	jd = c + e + day - 694039.09;
	jd /= 29.5305882;
	b = parseInt(jd);
	jd -= b;
	b = Math.round(jd * 8);

	const moonPhases = [
		'New Moon',
		'Waxing Crescent',
		'First Quarter',
		'Waxing Gibbous',
		'Full Moon',
		'Waning Gibbous',
		'Last Quarter',
		'Waning Crescent',
	];
	const moonPhaseName = moonPhases[b & 7];

	// Calculate sun's zodiac position (approximate)
	const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
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
		'Sagittarius',
	];
	const zodiacIndex = Math.floor(((sunLongitude + 10) % 360) / 30);
	const zodiacSeason = zodiacSigns[zodiacIndex];

	// Moon sign (approximate - using same algorithm offset by ~13 days)
	const moonDayOffset = dayOfYear + 13;
	const moonLongitude = (280.46 + 0.9856474 * moonDayOffset) % 360;
	const moonSignIndex = Math.floor(((moonLongitude + 10) % 360) / 30);
	const moonSign = zodiacSigns[moonSignIndex];

	// Planetary day
	const dayOfWeek = now.getDay();
	const planetaryDays = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
	const planetaryDay = planetaryDays[dayOfWeek];

	return `**CONTEXTUAL FRAMEWORK:**
- **Current Moon Phase:** ${moonPhaseName} in ${moonSign}
- **Zodiac Season:** ${zodiacSeason} Season
- **Planetary Day:** ${planetaryDay}
- **Date:** ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
}

/**
 * Generates a tarot reading asynchronously with progress updates
 *
 * This function runs in the background (via ctx.waitUntil) without blocking the response.
 * It updates job status in KV store multiple times so the frontend can show progress.
 *
 * Job State Progression:
 * 1. 'pending' → Initial state (set in /api/reading/start endpoint)
 * 2. 'processing' → Cycling through progress messages (this function)
 * 3. 'completed' → Reading generated successfully
 * 4. 'error' → Something went wrong
 *
 * @param {string} jobId - Unique identifier for this reading job
 * @param {Array} cards - Array of {position: string, name: string} objects
 * @param {Object} env - Worker environment bindings (READINGS_KV, DEEPSEEK_API_KEY)
 */
async function generateReading(jobId, cards, env) {
	try {
		// PHASE 1: Show progress messages to keep user engaged
		// Each message updates the KV store, which frontend polls every 2 seconds
		for (let i = 0; i < PROGRESS_MESSAGES.length; i++) {
			await env.READINGS_KV.put(
				jobId,
				JSON.stringify({
					status: 'processing',
					message: PROGRESS_MESSAGES[i],
					progress: Math.floor((i / PROGRESS_MESSAGES.length) * 100),
				}),
				{ expirationTtl: 3600 } // Expire after 1 hour (auto-cleanup old jobs)
			);

			// Small delay between progress updates for pacing
			// This makes the UI feel responsive rather than instant
			if (i < PROGRESS_MESSAGES.length - 1) {
				await new Promise(resolve => setTimeout(resolve, 500));
			}
		}

		// PHASE 2: Prepare the reading request
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
Begin the interpretation now.`;

		console.log(prompt);

		// PHASE 3: Call DeepSeek API (this is the slow part - takes ~30-60 seconds)
		let response = await fetch('https://api.deepseek.com/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
			},
			body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'user', content: prompt }], max_tokens: 2000 }),
		});

		if (!response.ok) {
			throw new Error('API request failed: ' + response.status);
		}

		const predictionData = await response.json();
		const prediction = predictionData.choices[0].message.content;

		// PHASE 4: Store the completed reading in KV
		// Frontend polling will detect status='completed' and display the prediction
		await env.READINGS_KV.put(
			jobId,
			JSON.stringify({
				status: 'completed',
				message: 'Your reading is ready',
				prediction: prediction,
			}),
			{ expirationTtl: 3600 }
		);
	} catch (error) {
		console.error('Error generating reading:', error);
		// If anything fails, store error state so frontend can show error message
		await env.READINGS_KV.put(
			jobId,
			JSON.stringify({
				status: 'error',
				message: 'Error generating reading: ' + error.message,
			}),
			{ expirationTtl: 3600 }
		);
	}
}

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		/**
		 * ENDPOINT 1: POST /api/reading/start
		 *
		 * Initiates an async reading job and returns immediately with job_id
		 * This prevents blocking the user for 60 seconds!
		 *
		 * Request body: { cards: [{position: string, name: string}, ...] }
		 * Response: { jobId: string }
		 *
		 * Key concept: ctx.waitUntil() tells Workers to keep running generateReading()
		 * in the background even after this response is sent to the client
		 */
		if (url.pathname === '/api/reading/start' && request.method === 'POST') {
			const data = await request.json();
			const jobId = generateJobId();

			// Store initial job state in KV so frontend can start polling
			await env.READINGS_KV.put(
				jobId,
				JSON.stringify({
					status: 'pending',
					message: 'Preparing your reading...',
					progress: 0,
				}),
				{ expirationTtl: 3600 }
			);

			// Start async reading generation (runs in background, doesn't block response)
			// ctx.waitUntil() is the magic that makes this non-blocking!
			ctx.waitUntil(generateReading(jobId, data.cards, env));

			// Return immediately with jobId - frontend can now start polling
			return new Response(JSON.stringify({ jobId }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		/**
		 * ENDPOINT 2: GET /api/reading/status/:jobId
		 *
		 * Checks the current status of a reading job
		 * Frontend calls this every 2 seconds until status is 'completed' or 'error'
		 *
		 * Response states:
		 * - { status: 'pending', message: '...', progress: 0 }
		 * - { status: 'processing', message: '...', progress: 25-100 }
		 * - { status: 'completed', message: '...', prediction: '...' }
		 * - { status: 'error', message: 'Error details...' }
		 */
		if (url.pathname.startsWith('/api/reading/status/')) {
			const jobId = url.pathname.split('/').pop();
			const jobData = await env.READINGS_KV.get(jobId);

			if (!jobData) {
				return new Response(JSON.stringify({ error: 'Job not found' }), {
					status: 404,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			// Return current job state (already in JSON format from KV)
			return new Response(jobData, {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Serve static files (HTML, CSS, JS, images)
		return env.ASSETS.fetch(request);
	},
};
