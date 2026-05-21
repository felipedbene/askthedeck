-- DAU: distinct readers with ANY event in the last 24h.
SELECT COUNT(DISTINCT reader_id_hash) AS dau
FROM events
WHERE reader_id_hash IS NOT NULL
  AND created_at > (strftime('%s','now') * 1000) - (24 * 60 * 60 * 1000);
