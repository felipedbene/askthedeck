/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				'tarot-dark': '#1a1625',
				'tarot-purple': '#6b46c1',
				'tarot-gold': '#d4af37',
				'cosmic-blue': '#4a5568',
			}
		}
	},
	plugins: []
};
