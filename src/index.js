/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		if (url.pathname.startsWith('/api/reading')) {
			// console.log("Here's the context:" + JSON.stringify(ctx));
			// console.log("Here's the env : " + JSON.stringify(env));

			if (request.body) {
				const data = await request.json();
				console.log('cards: ' + data);

				const prompt = `Provide a concise and insightful tarot reading for the following 7-day personal evolution spread: ${data.cards.map((c) => `${c.position}: ${c.name}`).join(', ')}. Explain each card's meaning in its position, how they interact, and key priorities for growth over the next 7 days. Use markdown formatting for clarity, including headers (###, ####), bullet points (-), and separators (---). Avoid greetings, introductions, or unnecessary conversational fluff.`;
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
