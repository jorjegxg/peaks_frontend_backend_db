import { getPool } from "../db";

const BANNED_PHONES_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS banned_phones (
    phone VARCHAR(20) PRIMARY KEY,
    reason VARCHAR(255) NULL,
    created_at BIGINT NOT NULL
  )
`;

export type BannedPhone = {
  phone: string;
  reason: string | null;
  createdAt: string;
};

function mapRow(row: {
  phone: string;
  reason: string | null;
  created_at: number;
}): BannedPhone {
  return {
    phone: row.phone,
    reason: row.reason ?? null,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function ensureTable(): Promise<void> {
  const pool = await getPool();
  await pool.query(BANNED_PHONES_TABLE_SQL);
}

export async function isPhoneBanned(phone: string): Promise<boolean> {
  await ensureTable();
  const pool = await getPool();
  const [rows] = await pool.query(
    "SELECT phone FROM banned_phones WHERE phone = ? LIMIT 1",
    [phone],
  );
  return Array.isArray(rows) && rows.length > 0;
}

export async function getBannedPhones(): Promise<BannedPhone[]> {
  await ensureTable();
  const pool = await getPool();
  const [rows] = await pool.query(
    "SELECT phone, reason, created_at FROM banned_phones ORDER BY created_at DESC",
  );
  return (rows as { phone: string; reason: string | null; created_at: number }[]).map(
    mapRow,
  );
}

export async function banPhone(phone: string, reason?: string): Promise<void> {
  await ensureTable();
  const pool = await getPool();
  const now = Date.now();
  await pool.query(
    `INSERT INTO banned_phones (phone, reason, created_at)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE reason = VALUES(reason), created_at = VALUES(created_at)`,
    [phone, reason?.trim() || null, now],
  );
}

export async function unbanPhone(phone: string): Promise<boolean> {
  await ensureTable();
  const pool = await getPool();
  const [result] = await pool.query("DELETE FROM banned_phones WHERE phone = ?", [
    phone,
  ]);
  const affectedRows = (result as { affectedRows?: number }).affectedRows ?? 0;
  return affectedRows > 0;
}
