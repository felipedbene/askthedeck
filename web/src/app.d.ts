import type {
	KVNamespace,
	Fetcher,
	ExecutionContext,
	D1Database
} from '@cloudflare/workers-types';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				ASSETS: Fetcher;
				READINGS_KV: KVNamespace;
				DB: D1Database;
				DEEPSEEK_API_KEY: string;
				PURGE_SECRET?: string;
			};
			context: ExecutionContext;
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};
