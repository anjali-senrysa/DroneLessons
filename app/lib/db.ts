// lib/db.ts
import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Create table on first run
await db.execute(`
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT,
    payment_id TEXT,
    customer_name TEXT,
    customer_email TEXT,
    amount TEXT,
    paid_at TEXT
  )
`);

export default db;