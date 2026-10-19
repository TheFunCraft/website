-- The API creates this automatically on first use, but you can run it by hand too.
CREATE TABLE IF NOT EXISTS access (
  username     TEXT PRIMARY KEY,   -- lowercased Minecraft name
  display      TEXT,               -- original casing, shown in the admin panel
  hwid         TEXT,               -- per-install id sent by the launcher
  note         TEXT,
  status       TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | denied | revoked
  requested_at TIMESTAMPTZ DEFAULT now(),
  decided_at   TIMESTAMPTZ
);
