# Job Polling Architecture

## Problem Statement

The tarot reading generation takes ~60 seconds because it calls the DeepSeek AI API. Users were experiencing a frozen page during this time, causing them to navigate away before seeing their reading.

## Solution: Async Job Polling System

Instead of blocking the user for 60 seconds, we:
1. Return a job ID immediately
2. Generate the reading in the background
3. Let the frontend poll for status updates
4. Show engaging progress messages while waiting

---

## Architecture Overview

```
┌─────────────┐                    ┌──────────────────┐                   ┌─────────────┐
│             │                    │                  │                   │             │
│   Frontend  │                    │  Cloudflare      │                   │  DeepSeek   │
│  (Browser)  │                    │  Worker + KV     │                   │    API      │
│             │                    │                  │                   │             │
└──────┬──────┘                    └────────┬─────────┘                   └──────┬──────┘
       │                                    │                                    │
       │  1. POST /api/reading/start        │                                    │
       ├───────────────────────────────────>│                                    │
       │    {cards: [...]}                  │                                    │
       │                                    │                                    │
       │  2. Response: {jobId: "job_123"}   │                                    │
       │<───────────────────────────────────┤                                    │
       │    (instant response!)             │                                    │
       │                                    │                                    │
       │                                    │  3. ctx.waitUntil(async task)      │
       │                                    ├────────────────┐                   │
       │                                    │                │                   │
       │                                    │  Store: {      │                   │
       │                                    │    status:     │                   │
       │                                    │    'pending'   │                   │
       │                                    │  }             │                   │
       │                                    │<───────────────┘                   │
       │                                    │                                    │
       │  4. GET /api/reading/status/job_123│                                    │
       ├───────────────────────────────────>│                                    │
       │    (poll every 2 seconds)          │                                    │
       │                                    │                                    │
       │  5. Response: {status: 'processing'│                                    │
       │     message: 'Shuffling cosmic...'}│                                    │
       │<───────────────────────────────────┤                                    │
       │                                    │                                    │
       │    [User sees: "Shuffling the      │                                    │
       │     cosmic deck..."]               │                                    │
       │                                    │                                    │
       │  6. GET /api/reading/status/job_123│                                    │
       ├───────────────────────────────────>│                                    │
       │                                    │                                    │
       │  7. Response: {status: 'processing'│                                    │
       │     message: 'Consulting guides...}│                                    │
       │<───────────────────────────────────┤                                    │
       │                                    │                                    │
       │    [Repeat polling...]             │   8. Generate reading              │
       │                                    ├───────────────────────────────────>│
       │                                    │                                    │
       │                                    │   9. AI Response (~60s later)      │
       │                                    │<───────────────────────────────────┤
       │                                    │                                    │
       │                                    │  10. Store: {                      │
       │                                    │       status: 'completed',         │
       │                                    │       prediction: "..."            │
       │                                    │     }                              │
       │                                    │                                    │
       │  11. GET /api/reading/status/job_123                                   │
       ├───────────────────────────────────>│                                    │
       │                                    │                                    │
       │  12. Response: {status: 'completed',                                   │
       │      prediction: "Your reading..."}│                                    │
       │<───────────────────────────────────┤                                    │
       │                                    │                                    │
       │  [Display reading to user]         │                                    │
       │                                    │                                    │
```

---

## Components Breakdown

### 1. Backend (src/index.js)

#### API Endpoints

**POST /api/reading/start**
- Creates a unique job ID
- Stores initial job state in KV (`status: 'pending'`)
- Starts async reading generation with `ctx.waitUntil()`
- Returns job ID immediately (no blocking!)

**GET /api/reading/status/:jobId**
- Retrieves current job state from KV
- Returns status and current progress message
- Called by frontend every 2 seconds

#### Key Functions

**generateJobId()**
- Creates unique identifier: `job_<timestamp>_<random>`
- Example: `job_1716172800000_a7b3c9d`

**generateReading(jobId, cards, env)**
- Runs in background (non-blocking)
- Updates KV store with progress messages
- Calls DeepSeek API (~60 seconds)
- Stores final reading in KV
- Handles errors gracefully

### 2. Frontend (public/script.js)

#### Key Functions

**startReading(cards)**
- Calls POST /api/reading/start
- Returns job ID immediately
- No waiting for AI generation

**pollReadingStatus(jobId, onProgress)**
- Polls GET /api/reading/status/:jobId every 2 seconds
- Calls onProgress callback with each update
- Resolves when status is 'completed'
- Rejects if error or timeout (2 minutes)

#### Event Handler

**"Read Cards" button click**
- Gets job ID from startReading()
- Starts polling with progress callback
- Updates UI with mystical messages
- Displays reading when complete

### 3. Storage (Cloudflare KV)

**Key**: `job_<timestamp>_<random>`

**Value**: JSON object with these states:

```javascript
// Initial state
{
  status: 'pending',
  message: 'Preparing your reading...',
  progress: 0
}

// Processing state (updated 8 times with different messages)
{
  status: 'processing',
  message: 'Shuffling the cosmic deck...',
  progress: 12  // 0-100
}

// Completed state
{
  status: 'completed',
  message: 'Your reading is ready',
  prediction: 'The cards speak through the Full Moon...'
}

// Error state
{
  status: 'error',
  message: 'Error generating reading: API timeout'
}
```

**TTL**: 1 hour (auto-cleanup)

---

## Progress Messages

8 mystical messages cycle during generation:

1. "Shuffling the cosmic deck..."
2. "Consulting the celestial guides..."
3. "Reading the astral currents..."
4. "Channeling ancient wisdom..."
5. "Interpreting the stars alignment..."
6. "Weaving the threads of fate..."
7. "Listening to the whispers of the universe..."
8. "Illuminating the path forward..."

Each message shows for ~500ms, creating engaging feedback.

---

## Key Technologies

### ctx.waitUntil()
The magic that makes non-blocking work in Cloudflare Workers:

```javascript
// This doesn't block the response!
ctx.waitUntil(generateReading(jobId, cards, env));

// Response sent immediately
return new Response(JSON.stringify({ jobId }));

// generateReading() keeps running in background
```

### Cloudflare Workers KV
Simple key-value store for job state:
- Fast global distribution
- Automatic expiration (TTL)
- Perfect for temporary job state

---

## Benefits

### User Experience
✅ Immediate feedback (no frozen page)
✅ Engaging progress messages
✅ No more users navigating away
✅ Professional feel with real-time updates

### Technical
✅ Non-blocking architecture
✅ Scalable (Workers can handle many concurrent jobs)
✅ Automatic cleanup (1-hour TTL)
✅ Graceful error handling

---

## Configuration

### wrangler.jsonc
```jsonc
{
  "kv_namespaces": [
    {
      "binding": "READINGS_KV",
      "id": "ed027d2465464528a5a3463c9a6f6c9a",
      "remote": true
    }
  ]
}
```

### Environment Variables
- `DEEPSEEK_API_KEY` - Set via `wrangler secret put`

---

## Testing

1. Start dev server: `wrangler dev --port 8787`
2. Open http://localhost:8787
3. Select 3 cards
4. Click "Read Cards"
5. Watch progress messages cycle
6. See reading appear after ~60 seconds

---

## Future Enhancements

1. **Resume capability**: Store jobId in localStorage, allow users to check back later
2. **Progress bar**: Add visual progress indicator (0-100%)
3. **Websockets**: Replace polling with real-time push updates
4. **Job history**: Store completed readings for retrieval
5. **Cancellation**: Allow users to cancel in-progress readings

---

## Troubleshooting

### Job not found (404)
- Job expired (>1 hour old)
- Invalid job ID
- KV namespace not configured

### Timeout error
- DeepSeek API is slow (>2 minutes)
- Increase `maxAttempts` in pollReadingStatus()

### No progress updates
- Check KV binding in wrangler.jsonc
- Verify backend is updating job state
- Check browser console for polling errors

---

## Deployment

```bash
# Create production KV namespace (if not done)
wrangler kv namespace create READINGS_KV

# Deploy to Cloudflare
wrangler deploy

# Set DeepSeek API key (if not done)
wrangler secret put DEEPSEEK_API_KEY
```

---

**Last Updated**: 2026-05-19
**Version**: 1.0
