-- Share funnel: of completed readings in the last 30d, what fraction
-- of those readers also published a share link in the same window.
-- Reader-level, not reading-level — a reader who completed 3 readings
-- and shared 1 counts once on each side.

WITH window_start AS (
  SELECT (strftime('%s','now') * 1000) - (30 * 24 * 60 * 60 * 1000) AS ts
),
completed AS (
  SELECT DISTINCT reader_id_hash
  FROM events, window_start
  WHERE event = 'reading_completed'
    AND reader_id_hash IS NOT NULL
    AND created_at >= window_start.ts
),
shared AS (
  SELECT DISTINCT reader_id_hash
  FROM events, window_start
  WHERE event = 'share_published'
    AND reader_id_hash IS NOT NULL
    AND created_at >= window_start.ts
)
SELECT
  (SELECT COUNT(*) FROM completed) AS completed_readers,
  (SELECT COUNT(*) FROM shared) AS shared_readers,
  ROUND(
    100.0 * (SELECT COUNT(*) FROM shared)
    / NULLIF((SELECT COUNT(*) FROM completed), 0),
    2
  ) AS share_rate_pct;
