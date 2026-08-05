/**
 * MIKAFAROZE — Auth Migration Script
 * Run: npx tsx scripts/migrate-auth.ts
 */

import postgres from 'postgres';

const sql = postgres({
  host: 'db.abaluqlwslhafelhrmuz.supabase.co',
  database: 'postgres',
  user: 'postgres',
  password: 'Abal123',
  port: 5432,
  ssl: 'require',
  connect_timeout: 10,
  debug: (str: unknown) => { if (typeof str === 'string' && str.includes('error')) console.log('DEBUG:', str.slice(0, 100)); },
});

async function migrate() {
  console.log('Running auth migrations...');

  const migrations = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE NOT NULL`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code_expires_at TIMESTAMPTZ`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_code TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_code_expires_at TIMESTAMPTZ`,
  ];

  for (const m of migrations) {
    try {
      await sql.unsafe(m);
      console.log('✓', m.substring(0, 60));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('already exists') || msg.includes('duplicate')) {
        console.log('⏭ Already exists:', m.slice(0, 60));
      } else {
        console.error('✗', msg);
      }
    }
  }

  console.log('\nDone.');
  await sql.end();
}

migrate().catch(console.error);
