import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@libsql/client';

// Remove googleapis import - no longer needed

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customer_name,
      customer_email,
      amount,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Signature mismatch' }, { status: 400 });
    }

    // ✅ Create table if not exists
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

    // ✅ Insert payment record
    await db.execute({
      sql: `INSERT INTO payments 
            (order_id, payment_id, customer_name, customer_email, amount, paid_at) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        razorpay_order_id,
        razorpay_payment_id,
        customer_name || 'N/A',
        customer_email || 'N/A',
        amount ? `₹${amount}` : 'N/A',
        new Date().toISOString(),
      ],
    });

    return NextResponse.json({ success: true, payment_id: razorpay_payment_id });

  } catch (err: any) {
    console.error('Verify payment error:', err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}