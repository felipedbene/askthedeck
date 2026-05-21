/**
 * i18n utilities for locale detection and management
 *
 * Detection order:
 * 1. URL param ?lang=
 * 2. localStorage value
 * 3. Accept-Language header
 * 4. Default: 'en'
 */

import { setLocale, getLocale, locales } from './paraglide/runtime.js';

export type AvailableLanguageTag = typeof locales[number];

export const LOCALES = {
	en: { code: 'en', label: 'English', flag: '🇺🇸' },
	'pt-BR': { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
	'es-MX': { code: 'es-MX', label: 'Español', flag: '🇲🇽' }
} as const;

export type Locale = keyof typeof LOCALES;

const STORAGE_KEY = 'askthedeck:locale';

/**
 * Check if a language tag is valid
 */
export function isValidLocale(locale: string): locale is AvailableLanguageTag {
	return locales.includes(locale as AvailableLanguageTag);
}

/**
 * Normalize locale code (handles both 'pt-BR' and 'pt_BR' formats)
 */
export function normalizeLocale(locale: string): string {
	return locale.replace('_', '-');
}

/**
 * Detect locale from Accept-Language header
 */
export function detectLocaleFromHeader(acceptLanguage: string | null): AvailableLanguageTag {
	if (!acceptLanguage) return 'en';

	// Parse Accept-Language header (e.g., "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7")
	const languages = acceptLanguage
		.split(',')
		.map(lang => {
			const [code, qValue] = lang.trim().split(';q=');
			return {
				code: normalizeLocale(code),
				q: qValue ? parseFloat(qValue) : 1.0
			};
		})
		.sort((a, b) => b.q - a.q);

	// Find first matching locale
	for (const { code } of languages) {
		// Try exact match first
		if (isValidLocale(code)) {
			return code;
		}
		// Try base language (e.g., 'pt' from 'pt-PT')
		const baseCode = code.split('-')[0];
		const match = locales.find(tag => tag.startsWith(baseCode));
		if (match) {
			return match;
		}
	}

	return 'en';
}

/**
 * Get locale from URL search params
 */
export function getLocaleFromURL(url: URL): AvailableLanguageTag | null {
	const langParam = url.searchParams.get('lang');
	if (langParam) {
		const normalized = normalizeLocale(langParam);
		if (isValidLocale(normalized)) {
			return normalized;
		}
	}
	return null;
}

/**
 * Get locale from localStorage (browser only)
 */
export function getLocaleFromStorage(): AvailableLanguageTag | null {
	if (typeof window === 'undefined') return null;

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored && isValidLocale(stored)) {
			return stored;
		}
	} catch (e) {
		// localStorage might be blocked
		console.warn('Failed to read locale from localStorage:', e);
	}
	return null;
}

/**
 * Save locale to localStorage (browser only)
 */
export function saveLocaleToStorage(locale: AvailableLanguageTag): void {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem(STORAGE_KEY, locale);
	} catch (e) {
		console.warn('Failed to save locale to localStorage:', e);
	}
}

/**
 * Detect and set the appropriate locale
 *
 * Priority:
 * 1. URL param
 * 2. localStorage
 * 3. Accept-Language header
 * 4. Default 'en'
 */
export function initializeLocale(url: URL, acceptLanguage: string | null): AvailableLanguageTag {
	// 1. Check URL param
	const urlLocale = getLocaleFromURL(url);
	if (urlLocale) {
		setLocale(urlLocale);
		saveLocaleToStorage(urlLocale);
		return urlLocale;
	}

	// 2. Check localStorage
	const storageLocale = getLocaleFromStorage();
	if (storageLocale) {
		setLocale(storageLocale);
		return storageLocale;
	}

	// 3. Check Accept-Language header
	const headerLocale = detectLocaleFromHeader(acceptLanguage);
	setLocale(headerLocale);
	saveLocaleToStorage(headerLocale);
	return headerLocale;
}

/**
 * Switch to a new locale
 */
export function switchLocale(locale: AvailableLanguageTag): void {
	setLocale(locale);
	saveLocaleToStorage(locale);
}
