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

	// Simple moon phase calculation
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

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		if (url.pathname.startsWith('/api/reading')) {
			if (request.body) {
				const data = await request.json();
				console.log('spread: ' + data);
				const cardSpread = data.cards.map((c) => `${c.position}: ${c.name}`).join(', ');

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

				//
				// DeepSeek Call here
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
				let resp = { status: 200, statusText: 'OK', prediction: predictionData.choices[0].message.content };
				return new Response(JSON.stringify(resp), { status: resp.status, statusText: resp.statusText });
			}
		}
		return env.ASSETS.fetch(request);
	},
};
