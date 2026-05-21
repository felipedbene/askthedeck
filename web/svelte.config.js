import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		// Cloudflare Pages/Workers adapter
		adapter: adapter({
			// Pin the wrangler config to this directory so the adapter never
			// walks up and picks up the repo-root wrangler.jsonc (which would
			// dump build output into the vanilla app's public/).
			config: 'wrangler.jsonc',
			// All routes are dynamic since we need i18n routing
			routes: {
				include: ['/*'],
				exclude: ['<all>']
			}
		})
	}
};

export default config;
