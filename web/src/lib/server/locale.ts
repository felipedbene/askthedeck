export const HOSTNAME_LOCALE: Record<string, string> = {
	'ask.debene.dev': 'en',
	'pergunte.debene.dev': 'pt-BR',
	'preguntale.debene.dev': 'es-MX'
};

export function getDefaultLocale(hostname: string): string {
	return HOSTNAME_LOCALE[hostname] || 'en';
}
