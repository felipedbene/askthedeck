# Ask the Deck

Tarot reading web app. Three-card spread, LLM-generated readings (DeepSeek), per-reader history and continuity. Live on three locale-bound custom domains:

- https://ask.debene.dev (en)
- https://pergunte.debene.dev (pt-BR)
- https://preguntale.debene.dev (es-MX)

## Layout

Monorepo; the entire app lives in `web/` (SvelteKit + `@sveltejs/adapter-cloudflare`, deployed as the Cloudflare Worker `ask-the-deck-web`). Always run npm commands from `web/`.

## Commands

```bash
npm run paraglide   # compile i18n messages (REQUIRED before build on a fresh checkout)
npm run build       # vite build
npm run check       # svelte-kit sync + svelte-check — the quality gate; keep it at 0 errors
npm run dev         # local dev server
```

- The paraglide output (`web/src/lib/paraglide/`) is **gitignored** (it writes its own `.gitignore`); it must be compiled before `build` or `check` works on a clean clone.
- There is no test suite; `npm run check` is the only gate.

## Deploy — do NOT run `wrangler deploy` manually

CI/CD is Cloudflare **Workers Builds** (git integration, configured in the Cloudflare dashboard, not in this repo):

- Push/merge to `main` → auto build + deploy to production.
- Build settings: root directory `/web`, build command `npm run paraglide && npm run build`, deploy command `npx wrangler deploy`.
- Build status appears as a GitHub check run (`Workers Builds: ask-the-deck-web`) on each commit; failure logs are dashboard-only.
- PR branches get preview versions automatically.

## Workflow

- Never commit directly to `main`. Branch → PR → Felipe reviews and merges (squash). Merging deploys.
- Claude cannot merge PRs or run `wrangler deploy` (permission-blocked); Felipe does those.

## Architecture notes

- **Bindings** (`web/wrangler.jsonc`): `DB` = D1 database `tarot` (readers/readings/events); `READINGS_KV` = job state (1h TTL) + 24h reading cache. Secret: `DEEPSEEK_API_KEY`.
- **Reading generation** (`web/src/lib/server/reading.ts`): async job model — KV job state, client polls; prompt includes astrology (astronomy-engine) and prior-readings continuity (`continuity.ts`).
- **Card name localization** (`web/src/lib/deck/cards.ts`) — the invariant that matters:
  - D1 `cards_json`, the KV cache key, and the wire format always use **canonical English** names (`cardDisplayName`).
  - UI display: `cardDisplayNameLocalized(id, locale)`.
  - LLM prompts: localize via `cardNameLocalizedFromEnglish(name, locale)` and instruct the model to use the given names verbatim — never let the LLM translate card names itself (it invents e.g. "Varas" for Wands; pt-BR is **"Paus"**).
- Locales: `en`, `pt-BR`, `es-MX`. Locale is bound to hostname (see `web/src/app.html`). UI strings live in paraglide messages (`web/project.inlang`).

## Known debt

- 16 npm audit findings remain (cookie, devalue, deepmerge-ts, SvelteKit core); fixes require the SvelteKit 3.x and paraglide 2.x major migrations.
