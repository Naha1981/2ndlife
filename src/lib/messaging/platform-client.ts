import { signPayload } from './hmac-v2';

const OPERATOR_URL = process.env.WHATSAPP_PLATFORM_URL || process.env.WHATSAPP_SERVICE_URL;
const HMAC_SECRET = process.env.WEBHOOK_HMAC_SECRET || process.env.WEBHOOK_SECRET || '';

export interface SendMessageInput {
  accountId: string;
  to: string;
  text?: string;
  media?: Record<string, unknown>;
}

export async function sendMessage(input: SendMessageInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!OPERATOR_URL) return { ok: false, error: 'no_operator_url' };
  const body = JSON.stringify({ accountId: input.accountId, to: input.to, text: input.text, media: input.media });
  const headers: Record<string, string> = { 'content-type': 'application/json', ...signPayload(HMAC_SECRET, body) };
  try {
    const res = await fetch(`${OPERATOR_URL}/send`, { method: 'POST', headers, body });
    if (!res.ok) return { ok: false, error: `operator_${res.status}` };
    const data = (await res.json()) as { ok: boolean; id?: string; error?: string };
    return data;
  } catch (e) {
    return { ok: false, error: 'network_error' };
  }
}

export async function getAccountQr(accountId: string) {
  if (!OPERATOR_URL) return null;
  const res = await fetch(`${OPERATOR_URL}/accounts/${accountId}/qr`);
  if (!res.ok) return null;
  return (await res.json()) as { qr: string | null };
}

export async function getAccountStatus(accountId: string) {
  if (!OPERATOR_URL) return null;
  const res = await fetch(`${OPERATOR_URL}/accounts/${accountId}/status`);
  if (!res.ok) return null;
  return (await res.json()) as { state: string };
}
