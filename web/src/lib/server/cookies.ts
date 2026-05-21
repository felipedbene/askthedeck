import type { Cookies } from '@sveltejs/kit';

const COOKIE_NAME = 'reader_id';
const COOKIE_MAX_AGE_SECONDS = 90 * 24 * 60 * 60; // 90 days

export function getReaderIdCookie(cookies: Cookies): string | undefined {
	return cookies.get(COOKIE_NAME);
}

export function setReaderIdCookie(cookies: Cookies, readerId: string): void {
	cookies.set(COOKIE_NAME, readerId, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: COOKIE_MAX_AGE_SECONDS
	});
}
