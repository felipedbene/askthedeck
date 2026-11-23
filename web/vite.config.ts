import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Cloudflare Pages/Workers adapter
			adapter: adapter({
				// Pin the wrangler config to this directory so the adapter never
				// walks up and picks up the repo-root wrangler.jsonc (which would
				// dump build output into the vanilla app's public/).
				config: 'wrangler.jsonc',

				// All routes are dynamic since we need i18n routing
				routes: { include: ['/*'], exclude: ['<all>'] }
			})
		})
	]
});
