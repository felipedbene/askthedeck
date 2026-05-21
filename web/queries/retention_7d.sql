-- 7-day retention: of readers whose FIRST event was 7+ days ago,
-- what fraction came back at least once between day 1 and day 7
-- after that first event.
--
-- Output columns:
--   cohort_size            number of readers whose first event was ≥7d ago
--   returned_within_7d     number of those who had another event in the 1–7d window
--   retention_pct          returned_within_7d / cohort_size * 100, two decimals

WITH first_seen AS (
  SELECT reader_id_hash, MIN(created_at) AS first_at
  FROM events
  WHERE reader_id_hash IS NOT NULL
  GROUP BY reader_id_hash
),
cohort AS (
  SELECT reader_id_hash, first_at
  FROM first_seen
  WHERE first_at < (strftime('%s','now') * 1000) - (7 * 24 * 60 * 60 * 1000)
),
returned AS (
  SELECT DISTINCT c.reader_id_hash
  FROM cohort c
  JOIN events e
    ON e.reader_id_hash = c.reader_id_hash
   AND e.created_at > c.first_at
   AND e.created_at <= c.first_at + (7 * 24 * 60 * 60 * 1000)
)
SELECT
  (SELECT COUNT(*) FROM cohort) AS cohort_size,
  (SELECT COUNT(*) FROM returned) AS returned_within_7d,
  ROUND(
    100.0 * (SELECT COUNT(*) FROM returned)
    / NULLIF((SELECT COUNT(*) FROM cohort), 0),
    2
  ) AS retention_pct;
