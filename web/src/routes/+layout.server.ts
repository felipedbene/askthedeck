/**
 * Server-side layout load function
 * Detects locale from request headers
 */

import { detectLocaleFromHeader } from '$lib/i18n.js';
import type { LayoutServerLoad } from './$types.js';

export const load: LayoutServerLoad = ({ request, url }) => {
	const acceptLanguage = request.headers.get('accept-language');
	const detectedLocale = detectLocaleFromHeader(acceptLanguage);

	return {
		url: url.toString(),
		acceptLanguage,
		detectedLocale
	};
};
