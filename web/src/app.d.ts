// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
	}

	// Bindings are typed by the generated worker-configuration.d.ts (wrangler types);
	// secrets are not in wrangler.jsonc, so they are declared here.
	namespace Cloudflare {
		interface Env {
			DEEPSEEK_API_KEY: string;
			PURGE_SECRET?: string;
		}
	}
}

export {};
