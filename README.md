# Ask The Deck

A tarot reading app that weaves together card wisdom with real astronomical context. Tap the deck three times, get a narrative reading anchored to the actual moon phase, moon sign, and zodiac season at the moment you draw.

**Live:** https://ask-the-deck-web.felipe-debene.workers.dev

## Features

- **Three-card spread** — Current State, Focus for Growth, Potential in 7 Days
- **Real astrology** — moon phase, moon sign, and sun sign computed live with `astronomy-engine`, not approximated
- **Three languages** — English, Brazilian Portuguese (pt-BR), Mexican Spanish (es-MX); the reading comes back in the language you pick
- **Mobile-first deck UI** — tap to draw, cards flip face-up in their slots, full 78-card deck (22 Major + 56 Minor Arcana)
- **Same-day caching** — identical draws on the same UTC day reuse the cached reading instead of paying for DeepSeek twice

## Tech stack

- **SvelteKit** on **Cloudflare Workers** (`@sveltejs/adapter-cloudflare`)
- **Tailwind CSS** + **Paraglide** i18n
- **DeepSeek** for reading generation
- **Cloudflare KV** for job state and the reading cache
- **`astronomy-engine`** for real ephemerides

## Local development

```bash
cd web
npm install
echo "DEEPSEEK_API_KEY=sk-..." > .dev.vars
npm run dev          # http://localhost:5173
```

KV and other Cloudflare bindings are wired up automatically from `web/wrangler.jsonc`.

## Deployment

```bash
cd web
npm run build
wrangler deploy --config wrangler.jsonc
```

The `DEEPSEEK_API_KEY` secret must be set on the worker:

```bash
echo "$DEEPSEEK_API_KEY" | wrangler secret put DEEPSEEK_API_KEY --config web/wrangler.jsonc
```

(Pipe the value in via stdin — the interactive prompt can silently upload an empty secret.)

## How it works

1. You tap the face-down deck three times. Each tap fills the next slot and flips face-up.
2. Hit **Read** — the client POSTs the spread to `/api/reading/start`, gets a `jobId`, and polls `/api/reading/status/:jobId` every two seconds.
3. The server computes the current astrological weather, builds a structured prompt anchored to each spread position, and asks DeepSeek for a reading in your locale.
4. The reading streams back as markdown and renders below the deck.
5. Tap **New Reading** to clear the slots and reshuffle.
