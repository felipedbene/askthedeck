-- Phase 1: shareable readings + anonymous continuity.
-- See ticket for rationale; cards_json / astrology_json kept opaque on
-- purpose, share_slug uses the column's UNIQUE-induced index (no extra
-- partial index needed).

CREATE TABLE readers (
  id            TEXT PRIMARY KEY,
  created_at    INTEGER NOT NULL,
  last_seen_at  INTEGER NOT NULL,
  locale        TEXT
);

CREATE TABLE readings (
  id             TEXT PRIMARY KEY,
  owner_id       TEXT NOT NULL REFERENCES readers(id),
  created_at     INTEGER NOT NULL,
  locale         TEXT NOT NULL,
  cards_json     TEXT NOT NULL,
  prediction     TEXT NOT NULL,
  astrology_json TEXT NOT NULL,
  visibility     TEXT NOT NULL DEFAULT 'private'
                 CHECK (visibility IN ('private', 'public')),
  share_slug     TEXT UNIQUE
);

CREATE INDEX idx_readings_owner_created
  ON readings(owner_id, created_at DESC);
