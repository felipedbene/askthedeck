-- reading_completed events broken down by locale, last 30 days.
SELECT
  COALESCE(locale, '(unknown)') AS locale,
  COUNT(*) AS completed,
  COUNT(DISTINCT reader_id_hash) AS distinct_readers
FROM events
WHERE event = 'reading_completed'
  AND created_at > (strftime('%s','now') * 1000) - (30 * 24 * 60 * 60 * 1000)
GROUP BY locale
ORDER BY completed DESC;
