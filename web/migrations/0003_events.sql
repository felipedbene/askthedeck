-- Anonymous behavioral analytics. The reader_id is HASHED (SHA-256 hex)
-- so events cannot be joined back to a specific reader cookie or to a
-- specific reading row. We can still count distinct hashes for unique-user
-- metrics. No IP, no UA, no referrer is ever stored — see privacy notice
-- in messages/*.json. A daily cron purges rows older than 90 days.

CREATE TABLE events (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  event           TEXT NOT NULL,
  reader_id_hash  TEXT,
  locale          TEXT,
  hostname        TEXT,
  metadata_json   TEXT,
  created_at      INTEGER NOT NULL
);

CREATE INDEX idx_events_type_created ON events(event, created_at DESC);
CREATE INDEX idx_events_reader ON events(reader_id_hash, created_at DESC);
