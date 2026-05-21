import type { PageServerLoad } from './$types.js';
import { getReaderIdCookie } from '$lib/server/cookies.js';
import { getDefaultLocale } from '$lib/server/locale.js';
import { logEvent } from '$lib/server/events.js';

/**
 * /apoiar is a static content page. We use a server load only to log
 * the page-view event so it's counted once per actual server render,
 * not on every client-side re-hydration. The waitUntil ensures the
 * insert doesn't add latency to the page response.
 */
export const load: PageServerLoad = async ({ platform, url, cookies }) => {
	if (platform?.env.DB) {
		const readerId = getReaderIdCookie(cookies);
		const locale = getDefaultLocale(url.hostname);
		platform.context.waitUntil(
			logEvent(platform.env.DB, {
				event: 'apoiar_page_viewed',
				readerId,
				locale,
				hostname: url.hostname
			})
		);
	}
	return {};
};
