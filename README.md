# HoverMethod Junior Website

A Next.js 16 landing + enrollment application for the **HoverMethod Junior** drone technology program, with integrated **Razorpay Checkout** payment flow.

---

## 1) Project Overview

This project is a single-page, marketing-first enrollment site built with the Next.js App Router.

It includes:
- Program information, curriculum, instructors, and FAQ.
- Pricing with GST calculation.
- Multiple payment CTAs that open Razorpay Checkout.
- Server-side API routes for secure Razorpay order creation and payment signature verification.
- WhatsApp lead capture links.

---

## 2) Tech Stack

- **Framework:** Next.js `16.2.2` (App Router)
- **Language:** TypeScript
- **UI:** React `19.2.4`, CSS (global stylesheet)
- **Payments:** Razorpay (`razorpay` npm package + Razorpay Checkout script)
- **Runtime:** Node.js (for server routes)

---

## 3) Current Project Structure

```text
.
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
│       └── razorpay/
│           ├── create-order/
│           │   └── route.ts
│           └── verify-payment/
│               └── route.ts
├── public/
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## 4) Key Functional Areas

### Frontend (`app/page.tsx`)
- Renders complete landing page and enrollment UI.
- Loads Razorpay Checkout script with `next/script`:
  - `https://checkout.razorpay.com/v1/checkout.js`
- Uses a `pay(amountInRupees, description)` callback to:
  1. Call backend `POST /api/razorpay/create-order`
  2. Open Razorpay Checkout modal
  3. Send payment response to `POST /api/razorpay/verify-payment`
  4. Show success banner or alert on failure

### Server API routes

#### `POST /api/razorpay/create-order`
- File: `app/api/razorpay/create-order/route.ts`
- Creates Razorpay order using server secret key.
- Validates amount (must be numeric and >= 100 paise).
- Returns order payload (`id`, `amount`, etc.) for checkout.

#### `POST /api/razorpay/verify-payment`
- File: `app/api/razorpay/verify-payment/route.ts`
- Verifies checkout response signature using HMAC SHA256:
  - Data signed: `razorpay_order_id|razorpay_payment_id`
  - Secret: `RAZORPAY_KEY_SECRET`
- Returns `{ success: true }` if signature matches.

---

## 5) Payment Integration (Detailed)

## 5.1 Variables used

### Public (client-side)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
  - Used in checkout options (`key` field).
- `NEXT_PUBLIC_WA_NUMBER`
  - Used for WhatsApp contact links.

### Private (server-side only)
- `RAZORPAY_KEY_ID`
  - Used by Razorpay Node SDK in order creation route.
- `RAZORPAY_KEY_SECRET`
  - Used for SDK auth and signature verification.

> Never expose `RAZORPAY_KEY_SECRET` to the browser.

## 5.2 End-to-end payment flow

1. User clicks **Pay Now / Enrol** CTA.
2. Frontend computes amount (base + add-on + GST).
3. Frontend calls:
   - `POST /api/razorpay/create-order`
   - body: `{ amount: <paise> }`
4. Backend creates Razorpay order and returns order data.
5. Frontend opens Razorpay Checkout using returned `order_id`.
6. User completes payment in Razorpay modal.
7. Razorpay returns:
   - `razorpay_order_id`
   - `razorpay_payment_id`
   - `razorpay_signature`
8. Frontend sends these fields to:
   - `POST /api/razorpay/verify-payment`
9. Backend recalculates HMAC and compares signatures.
10. If match, backend returns success and frontend shows enrollment success message.

## 5.3 API contracts

### Create Order Request
```json
{
  "amount": 265382
}
```
- Amount is in **paise**.

### Create Order Response (example)
```json
{
  "id": "order_Qx...",
  "entity": "order",
  "amount": 265382,
  "currency": "INR",
  "status": "created"
}
```

### Verify Payment Request
```json
{
  "razorpay_order_id": "order_Qx...",
  "razorpay_payment_id": "pay_Qx...",
  "razorpay_signature": "xxxxxxxx"
}
```

### Verify Payment Success
```json
{
  "success": true,
  "payment_id": "pay_Qx..."
}
```

### Verify Payment Failure
```json
{
  "success": false,
  "error": "Signature mismatch"
}
```

## 5.4 Security notes (important)

Current integration correctly verifies signatures server-side, which is good.

Recommended production hardening:
- Do not trust frontend amount blindly; map a `planId` on server and compute amount server-side.
- Persist transaction status in DB (`created`, `paid`, `failed`, `verified`).
- Store `order_id`, `payment_id`, user/contact metadata, timestamp.
- Add Razorpay webhook handling for asynchronous payment confirmation.
- Add idempotency checks to avoid duplicate order processing.
- Validate phone/email/user details before payment attempt.

---

## 6) Pricing Logic in App

The UI uses:
- Base bundle amount: `2249`
- GST: `18%`
- Optional add-ons:
  - Practical Camp: `1249`
  - CoE Experience: `3249`

Computation pattern:
- `subtotal = base + addon`
- `gst = round(subtotal * 0.18)`
- `total = subtotal + gst`

---

## 7) Local Setup Instructions

1. Install dependencies:
   - `npm install`
2. Create `.env.local` in project root.
3. Add environment variables:

```env
# Client-side
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
NEXT_PUBLIC_WA_NUMBER=919999999999

# Server-side
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
```

4. Start dev server:
   - `npm run dev`
5. Open app:
   - `http://localhost:3000`

---

## 8) NPM Scripts

From `package.json`:
- `npm run dev` → Start dev server
- `npm run build` → Build for production
- `npm run start` → Run production server
- `npm run lint` → Run ESLint

---

## 9) Metadata and SEO

`app/layout.tsx` includes:
- Title + description metadata.
- Open Graph metadata.
- Google Fonts preconnect + stylesheet links.

---

## 10) Known Gaps / Next Enhancements

- Add database integration for payment and lead records.
- Add webhook route (`/api/razorpay/webhook`) for authoritative payment events.
- Add proper typed interfaces for payment request/response objects.
- Improve UX for failures with retry + support token.
- Add integration tests for create-order and verify-payment routes.

---

## 11) Quick Verification Checklist

- [ ] Razorpay key IDs and secret correctly configured.
- [ ] Checkout opens successfully.
- [ ] Payment success triggers verify API success.
- [ ] Signature mismatch returns 400.
- [ ] No secret keys exposed in browser bundle.
- [ ] WhatsApp links open with prefilled text.

---

## 12) Important Files

- Frontend page: `app/page.tsx`
- Order API: `app/api/razorpay/create-order/route.ts`
- Verify API: `app/api/razorpay/verify-payment/route.ts`
- App shell metadata: `app/layout.tsx`
- Dependencies/scripts: `package.json`

---

Maintained for: **HoverMethod Junior enrollment and payments**.