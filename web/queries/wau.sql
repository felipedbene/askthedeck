-- WAU: distinct readers with ANY event in the last 7 days.
SELECT COUNT(DISTINCT reader_id_hash) AS wau
FROM events
WHERE reader_id_hash IS NOT NULL
  AND created_at > (strftime('%s','now') * 1000) - (7 * 24 * 60 * 60 * 1000);
