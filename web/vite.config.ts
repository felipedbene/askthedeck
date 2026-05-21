import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			// Forward /api/* to the vanilla Worker running via `wrangler dev`
			// at the repo root (default port 8787). Run both servers locally:
			//   - terminal A: `wrangler dev` from repo root
			//   - terminal B: `npm run dev` from web/
			'/api': {
				target: 'http://localhost:8787',
				changeOrigin: true
			}
		}
	}
});
