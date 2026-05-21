-- Aggregate-only donation prompt analytics. No user id, no IP, no fingerprint —
-- intentionally so. We only want CTR-style totals by event/locale over time.

CREATE TABLE donation_prompt_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  event       TEXT NOT NULL
              CHECK (event IN ('shown', 'clicked_support', 'clicked_dismiss')),
  locale      TEXT,
  created_at  INTEGER NOT NULL
);

CREATE INDEX idx_donation_events_created ON donation_prompt_events(created_at DESC);
