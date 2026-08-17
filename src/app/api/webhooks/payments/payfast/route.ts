import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const data: Record<string, string> = {};
  formData.forEach((value, key) => { data[key] = String(value); });

  // 1. Extract signature and remove it from the payload for hashing
  const signature = data['signature'];
  delete data['signature'];

  // 2. Sort keys alphabetically and build the query string
  const sortedKeys = Object.keys(data).sort();
  let paramString = '';
  for (const key of sortedKeys) {
    if (data[key] !== '') {
      paramString += `${key}=${encodeURIComponent(data[key])}&`;
    }
  }
  
  // 3. Append passphrase if set
  const passphrase = process.env.PAYFAST_PASSPHRASE || '';
  if (passphrase) paramString += `passphrase=${encodeURIComponent(passphrase)}`;
  else paramString = paramString.slice(0, -1); // remove trailing '&' if no passphrase

  // 4. Generate MD5 hash (PayFast standard)
  const calculatedSignature = createHash('md5').update(paramString).digest('hex');

  if (calculatedSignature !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // 5. Verify amount (prevent tampering)
  const mPaymentId = data['m_payment_id']; // Our internal opportunity/booking ID
  const amountGross = parseFloat(data['amount_gross']);
  const paymentStatus = data['payment_status'];

  if (paymentStatus === 'COMPLETE') {
    // TODO: Look up the opportunity by mPaymentId, verify the amount matches exactly,
    // and mark it as 'recovered'.
    console.log(`Payment verified for ${mPaymentId}: R${amountGross}`);
  }

  return NextResponse.json({ status: 'ok' });
}
