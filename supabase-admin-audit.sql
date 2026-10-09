-- Admin Audit Trail
--
-- Written on the two privileged actions in the platform:
--   * suspending, demoting or deleting another administrator (step-up auth)
--   * decrypting a card CVC or PIN from the Card Vault
--
-- Until this table exists, those writes fail silently and the platform has no
-- record of who suspended an admin or who read a holder's credentials. Run this
-- before relying on either control.

CREATE TABLE IF NOT EXISTS admin_audit_log (
    id BIGSERIAL PRIMARY KEY,
    admin_uid TEXT,
    admin_email TEXT,
    action TEXT NOT NULL,
    target_id TEXT,
    target_email TEXT,
    detail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reads are almost always "what happened to this admin/holder, most recent
-- first", so index on the actor and the target.
CREATE INDEX IF NOT EXISTS admin_audit_log_admin_idx ON admin_audit_log (admin_uid, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_log_target_idx ON admin_audit_log (target_id, created_at DESC);

-- RLS: the API talks to Postgres with the service-role key, which bypasses RLS
-- by design. These policies exist so that if the table is ever reached with the
-- anon or authenticated key instead, it is not world-readable.
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON admin_audit_log FROM anon, authenticated;