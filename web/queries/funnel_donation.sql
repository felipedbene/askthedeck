-- Donation funnel: in the last 30d, of distinct readers who viewed
-- /apoiar, what fraction also clicked the Ko-fi button. Reader-level.

WITH window_start AS (
  SELECT (strftime('%s','now') * 1000) - (30 * 24 * 60 * 60 * 1000) AS ts
),
viewed AS (
  SELECT DISTINCT reader_id_hash
  FROM events, window_start
  WHERE event = 'apoiar_page_viewed'
    AND reader_id_hash IS NOT NULL
    AND created_at >= window_start.ts
),
clicked AS (
  SELECT DISTINCT reader_id_hash
  FROM events, window_start
  WHERE event = 'kofi_clicked'
    AND reader_id_hash IS NOT NULL
    AND created_at >= window_start.ts
)
SELECT
  (SELECT COUNT(*) FROM viewed) AS apoiar_viewers,
  (SELECT COUNT(*) FROM clicked) AS kofi_clickers,
  ROUND(
    100.0 * (SELECT COUNT(*) FROM clicked)
    / NULLIF((SELECT COUNT(*) FROM viewed), 0),
    2
  ) AS ctr_pct;
