'use strict';
const { Pool } = require('pg');
const { BufferJSON, initAuthCreds } = require('@whiskeysockets/baileys');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

const DDL = [
  `CREATE TABLE IF NOT EXISTS wa_accounts (
     id TEXT PRIMARY KEY,
     channel TEXT NOT NULL DEFAULT 'whatsapp',
     transport TEXT NOT NULL DEFAULT 'baileys',
     display_phone TEXT,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   )`,
  `CREATE TABLE IF NOT EXISTS wa_account_bindings (
     wa_account_id TEXT NOT NULL REFERENCES wa_accounts(id),
     app_id TEXT NOT NULL,
     tenant_id TEXT NOT NULL,
     active BOOLEAN NOT NULL DEFAULT TRUE,
     PRIMARY KEY (wa_account_id, app_id, tenant_id)
   )`,
  `CREATE TABLE IF NOT EXISTS wa_sessions (
     wa_account_id TEXT NOT NULL REFERENCES wa_accounts(id),
     key TEXT NOT NULL,
     value JSONB NOT NULL,
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     PRIMARY KEY (wa_account_id, key)
   )`,
  `CREATE TABLE IF NOT EXISTS wa_connections (
     wa_account_id TEXT PRIMARY KEY REFERENCES wa_accounts(id),
     state TEXT NOT NULL DEFAULT 'DISCONNECTED',
     operator_id TEXT,
     last_heartbeat TIMESTAMPTZ,
     qr_expires_at TIMESTAMPTZ
   )`,
  `CREATE TABLE IF NOT EXISTS platform_events (
     id TEXT PRIMARY KEY,
     wa_account_id TEXT,
     payload JSONB NOT NULL,
     received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   )`,
  `CREATE TABLE IF NOT EXISTS inbound_deliveries (
     id TEXT PRIMARY KEY,
     platform_event_id TEXT NOT NULL REFERENCES platform_events(id),
     app_id TEXT NOT NULL,
     tenant_id TEXT NOT NULL,
     status TEXT NOT NULL DEFAULT 'pending',
     attempts INT NOT NULL DEFAULT 0,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     delivered_at TIMESTAMPTZ
   )`,
];

async function ensureSchema() {
  for (const sql of DDL) await pool.query(sql);
}

const fixKey = (type, id) => `${type}-${id}`;

async function usePostgresAuthState(waAccountId) {
  const readValue = async (key) => {
    const { rows } = await pool.query(
      'SELECT value FROM wa_sessions WHERE wa_account_id=$1 AND key=$2',
      [waAccountId, key]
    );
    if (!rows.length) return null;
    return JSON.parse(JSON.stringify(rows[0].value), BufferJSON.reviver);
  };
  const writeValue = async (key, value) => {
    if (value === undefined || value === null) {
      await pool.query('DELETE FROM wa_sessions WHERE wa_account_id=$1 AND key=$2', [waAccountId, key]);
      return;
    }
    const json = JSON.stringify(value, BufferJSON.replacer);
    await pool.query(
      `INSERT INTO wa_sessions (wa_account_id, key, value, updated_at)
       VALUES ($1,$2,$3,NOW())
       ON CONFLICT (wa_account_id, key) DO UPDATE SET value=$3, updated_at=NOW()`,
      [waAccountId, key, json]
    );
  };

  let creds = await readValue('creds');
  if (!creds) creds = initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const out = {};
          for (const id of ids) {
            const v = await readValue(fixKey(type, id));
            if (v) out[id] = v;
          }
          return out;
        },
        set: async (data) => {
          const tasks = [];
          for (const cat in data) {
            for (const id in data[cat]) tasks.push(writeValue(fixKey(cat, id), data[cat][id]));
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: () => writeValue('creds', creds),
  };
}

async function ensureAccount(id, displayPhone) {
  await pool.query(
    `INSERT INTO wa_accounts (id, display_phone) VALUES ($1,$2)
     ON CONFLICT (id) DO NOTHING`,
    [id, displayPhone || null]
  );
}
async function addBinding(accountId, appId, tenantId) {
  await pool.query(
    `INSERT INTO wa_account_bindings (wa_account_id, app_id, tenant_id) VALUES ($1,$2,$3)
     ON CONFLICT (wa_account_id, app_id, tenant_id) DO UPDATE SET active=TRUE`,
    [accountId, appId, tenantId]
  );
}
async function listActiveBindings(accountId) {
  const { rows } = await pool.query(
    'SELECT app_id, tenant_id FROM wa_account_bindings WHERE wa_account_id=$1 AND active=TRUE',
    [accountId]
  );
  return rows;
}
async function setConnectionState(accountId, state, operatorId, qrExpiresAt) {
  await pool.query(
    `INSERT INTO wa_connections (wa_account_id, state, operator_id, last_heartbeat, qr_expires_at)
     VALUES ($1,$2,$3,NOW(),$4)
     ON CONFLICT (wa_account_id) DO UPDATE
       SET state=$2, operator_id=$3, last_heartbeat=NOW(), qr_expires_at=$4`,
    [accountId, state, operatorId, qrExpiresAt || null]
  );
}
async function getConnection(accountId) {
  const { rows } = await pool.query('SELECT * FROM wa_connections WHERE wa_account_id=$1', [accountId]);
  return rows[0] || null;
}
async function recordPlatformEvent(id, accountId, payload) {
  await pool.query(
    `INSERT INTO platform_events (id, wa_account_id, payload) VALUES ($1,$2,$3)
     ON CONFLICT (id) DO NOTHING`,
    [id, accountId, JSON.stringify(payload)]
  );
}
async function recordDelivery(id, eventId, appId, tenantId) {
  await pool.query(
    `INSERT INTO inbound_deliveries (id, platform_event_id, app_id, tenant_id) VALUES ($1,$2,$3,$4)
     ON CONFLICT (id) DO NOTHING`,
    [id, eventId, appId, tenantId]
  );
}
async function markDelivery(id, status) {
  await pool.query(
    `UPDATE inbound_deliveries SET status=$2, attempts=attempts+1,
       delivered_at=CASE WHEN $2='delivered' THEN NOW() ELSE delivered_at END
     WHERE id=$1`,
    [id, status]
  );
}

module.exports = {
  pool, ensureSchema, usePostgresAuthState, ensureAccount, addBinding,
  listActiveBindings, setConnectionState, getConnection, recordPlatformEvent,
  recordDelivery, markDelivery,
};
