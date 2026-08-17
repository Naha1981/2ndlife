'use strict';
const express = require('express');
const helmet = require('helmet');
const crypto = require('crypto');
const {
  ensureSchema, ensureAccount, addBinding, listActiveBindings,
  recordPlatformEvent, recordDelivery, markDelivery,
} = require('./store');
const { BaileysTransport } = require('./transport');

const PORT = process.env.PORT || 3001;
const APP_WEBHOOK_URL = process.env.APP_WEBHOOK_URL;
const HMAC_SECRET = process.env.WEBHOOK_HMAC_SECRET;
const METRICS_TOKEN = process.env.METRICS_BEARER_TOKEN;

const transport = new BaileysTransport({ logger: console });
const app = express();
app.use(helmet());
app.use(express.json());

const buckets = new Map();
function takeToken(accountId) {
  const now = Date.now();
  const b = buckets.get(accountId) || { tokens: 60, last: now };
  b.tokens = Math.min(60, b.tokens + ((now - b.last) / 1000) * 1);
  b.last = now;
  if (b.tokens >= 1) { b.tokens -= 1; buckets.set(accountId, b); return true; }
  buckets.set(accountId, b);
  return false;
}

function signPayload(bodyObj) {
  const ts = String(Date.now());
  const nonce = crypto.randomUUID();
  const raw = JSON.stringify(bodyObj);
  const sig = crypto.createHmac('sha256', HMAC_SECRET || 'unset').update(`${ts}.${nonce}.${raw}`).digest('hex');
  return { 'x-wa-timestamp': ts, 'x-wa-nonce': nonce, 'x-wa-signature': sig, 'content-type': 'application/json' };
}

async function deliverToApp(deliveryId, payload) {
  if (!APP_WEBHOOK_URL) return;
  const headers = signPayload(payload);
  try {
    const res = await fetch(APP_WEBHOOK_URL, { method: 'POST', headers, body: JSON.stringify(payload) });
    await markDelivery(deliveryId, res.ok ? 'delivered' : 'failed');
  } catch (e) {
    await markDelivery(deliveryId, 'failed');
  }
}

transport.onMessage(async ({ accountId, raw }) => {
  const messageId = (raw.key && raw.key.id) || crypto.randomUUID();
  const payloadBase = {
    messageId,
    accountId,
    from: raw.key && raw.key.remoteJid,
    text: (raw.message && (raw.message.conversation || (raw.message.extendedTextMessage && raw.message.extendedTextMessage.text))) || '',
    ts: raw.messageTimestamp,
  };
  await recordPlatformEvent(messageId, accountId, payloadBase);
  const bindings = await listActiveBindings(accountId);
  for (const b of bindings) {
    const deliveryId = crypto.createHash('sha256').update(`${messageId}:${b.app_id}:${b.tenant_id}`).digest('hex').slice(0, 32);
    await recordDelivery(deliveryId, messageId, b.app_id, b.tenant_id);
    await deliverToApp(deliveryId, Object.assign({}, payloadBase, { appId: b.app_id, tenantId: b.tenant_id, deliveryId }));
  }
});

app.post('/accounts', async (req, res) => {
  const { id, displayPhone } = req.body || {};
  if (!id) return res.status(400).json({ error: 'id required' });
  await ensureAccount(id, displayPhone);
  res.status(201).json({ id });
});

app.post('/accounts/:id/bind', async (req, res) => {
  const { appId, tenantId } = req.body || {};
  if (!appId || !tenantId) return res.status(400).json({ error: 'appId & tenantId required' });
  await addBinding(req.params.id, appId, tenantId);
  transport.connect(req.params.id).catch(() => {});
  res.json({ bound: true });
});

app.get('/accounts/:id/qr', async (req, res) => {
  res.json({ qr: await transport.getQr(req.params.id) });
});

app.get('/accounts/:id/status', async (req, res) => {
  res.json((await transport.getStatus(req.params.id)) || { state: 'DISCONNECTED' });
});

app.post('/send', async (req, res) => {
  const { accountId, to, text, media } = req.body || {};
  if (!accountId || !to) return res.status(400).json({ error: 'accountId & to required' });
  if (!takeToken(accountId)) return res.status(429).set('Retry-After', '5').json({ error: 'rate_limited' });
  const result = media ? await transport.sendMedia(accountId, to, media) : await transport.sendText(accountId, to, text || '');
  if (!result.ok) return res.status(502).json(result);
  res.json(result);
});

app.get('/health', (req, res) => res.json({ ok: true, service: 'naha-wa-operator' }));

app.get('/metrics', (req, res) => {
  const auth = req.headers.authorization || '';
  if (!METRICS_TOKEN || auth !== `Bearer ${METRICS_TOKEN}`) return res.status(401).json({ error: 'unauthorized' });
  res.json({ sockets: transport.sockets.size, uptime: process.uptime(), memory: process.memoryUsage().rss });
});

(async () => {
  await ensureSchema();
  app.listen(PORT, () => console.log(`naha-wa-operator listening on ${PORT}`));
})();

process.on('SIGTERM', async () => { await transport.releaseAll(); process.exit(0); });
process.on('SIGINT', async () => { await transport.releaseAll(); process.exit(0); });
