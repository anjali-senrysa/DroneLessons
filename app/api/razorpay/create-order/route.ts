import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt } = await req.json();

    if (!amount || typeof amount !== 'number' || amount < 100) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount,           // in paise (₹1 = 100 paise)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: true,
    });

    return NextResponse.json(order);
  } catch (err: any) {
    console.error('Razorpay create-order error:', err);
    return NextResponse.json(
      { error: err?.message || 'Order creation failed' },
      { status: 500 },
    );
  }
}