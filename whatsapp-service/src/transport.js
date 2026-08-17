'use strict';
const { default: makeWASocket, DisconnectReason, Browsers } = require('@whiskeysockets/baileys');
const { usePostgresAuthState, setConnectionState, getConnection } = require('./store');

const CONNECT_STATES = {
  QR_PENDING: 'QR_PENDING', CONNECTED: 'CONNECTED', DISCONNECTED: 'DISCONNECTED',
  RECONNECTING: 'RECONNECTING', LOGGED_OUT: 'LOGGED_OUT',
};

const qrCache = new Map();
const QR_TTL_MS = 45000;
const qrGet = (a) => { const e = qrCache.get(a); if (!e) return null; if (Date.now() > e.exp) { qrCache.delete(a); return null; } return e.qr; };
const qrSet = (a, qr) => qrCache.set(a, { qr, exp: Date.now() + QR_TTL_MS });
const qrDel = (a) => qrCache.delete(a);

class BaileysTransport {
  constructor({ logger, operatorId } = {}) {
    this.sockets = new Map();
    this.locks = new Map();
    this.logger = logger || console;
    this.operatorId = operatorId || `op-${process.pid}`;
    this.messageHandler = null;
  }

  onMessage(handler) { this.messageHandler = handler; }

  async connect(accountId) {
    if (this.sockets.has(accountId)) return;
    if (this.locks.has(accountId) && this.locks.get(accountId) !== this.operatorId) return;
    this.locks.set(accountId, this.operatorId);
    await setConnectionState(accountId, CONNECT_STATES.RECONNECTING, this.operatorId);

    const { state, saveCreds } = await usePostgresAuthState(accountId);
    const sock = makeWASocket({ auth: state, printQRInTerminal: false, browser: Browsers.macOS('NahaLabs') });
    this.sockets.set(accountId, sock);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      if (qr) {
        qrSet(accountId, qr);
        await setConnectionState(accountId, CONNECT_STATES.QR_PENDING, this.operatorId, new Date(Date.now() + QR_TTL_MS));
      }
      if (connection === 'open') {
        qrDel(accountId);
        await setConnectionState(accountId, CONNECT_STATES.CONNECTED, this.operatorId);
      }
      if (connection === 'close') {
        const code = (lastDisconnect && lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode) || 0;
        const loggedOut = code === DisconnectReason.loggedOut;
        this.sockets.delete(accountId);
        this.locks.delete(accountId);
        if (loggedOut) {
          await setConnectionState(accountId, CONNECT_STATES.LOGGED_OUT, this.operatorId);
        } else {
          await setConnectionState(accountId, CONNECT_STATES.RECONNECTING, this.operatorId);
          setTimeout(() => this.connect(accountId).catch(() => {}), 2000);
        }
      }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
      if (!this.messageHandler) return;
      for (const msg of messages) {
        if (msg.key && msg.key.fromMe) continue;
        try { await this.messageHandler({ accountId, raw: msg }); }
        catch (e) { this.logger.error('message handler error', e); }
      }
    });
  }

  async disconnect(accountId) {
    const sock = this.sockets.get(accountId);
    if (sock) { try { sock.end(); } catch (_) {} }
    this.sockets.delete(accountId);
    this.locks.delete(accountId);
    qrDel(accountId);
    await setConnectionState(accountId, CONNECT_STATES.DISCONNECTED, this.operatorId);
  }

  async getStatus(accountId) { return getConnection(accountId); }
  async getQr(accountId) { return qrGet(accountId); }

  _jid(phone) { return `${String(phone).replace(/[^\d]/g, '')}@s.whatsapp.net`; }

  async sendText(accountId, to, text) {
    const sock = this.sockets.get(accountId);
    if (!sock) return { ok: false, error: 'not_connected' };
    const res = await sock.sendMessage(this._jid(to), { text });
    return { ok: true, id: res && res.key && res.key.id };
  }

  async sendMedia(accountId, to, media) {
    const sock = this.sockets.get(accountId);
    if (!sock) return { ok: false, error: 'not_connected' };
    const res = await sock.sendMessage(this._jid(to), media);
    return { ok: true, id: res && res.key && res.key.id };
  }

  async releaseAll() {
    for (const accountId of Array.from(this.sockets.keys())) await this.disconnect(accountId);
  }
}

module.exports = { BaileysTransport, CONNECT_STATES };
