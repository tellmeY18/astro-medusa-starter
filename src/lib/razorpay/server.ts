import { getSecret } from "astro:env/server";

const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

export class RazorpayConfigError extends Error {}

export class RazorpayApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "RazorpayApiError";
    this.status = status;
  }
}

/**
 * Secrets are read from the Cloudflare runtime (wrangler secret / .dev.vars),
 * never from build-time env, so the key secret is not baked into the bundle.
 */
function requireSecret(name: string): string {
  const value = getSecret(name);
  if (!value) {
    throw new RazorpayConfigError(`${name} is not configured`);
  }
  return value;
}

export const getRazorpayKeySecret = (): string =>
  requireSecret("RAZORPAY_KEY_SECRET");

export const getRazorpayWebhookSecret = (): string =>
  requireSecret("RAZORPAY_WEBHOOK_SECRET");

export type CreatedRazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt: string;
};

export type CreateRazorpayOrderInput = {
  keyId: string;
  amount: number;
  receipt: string;
  notes?: Record<string, string>;
};

function basicAuthHeader(keyId: string, keySecret: string): string {
  return `Basic ${btoa(`${keyId}:${keySecret}`)}`;
}

export async function createRazorpayOrder({
  keyId,
  amount,
  receipt,
  notes,
}: CreateRazorpayOrderInput): Promise<CreatedRazorpayOrder> {
  const keySecret = getRazorpayKeySecret();

  const response = await fetch(`${RAZORPAY_API_BASE}/orders`, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(keyId, keySecret),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount, currency: "INR", receipt, notes }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new RazorpayApiError(
      `Razorpay order creation failed (${response.status}): ${detail}`,
      response.status,
    );
  }

  return (await response.json()) as CreatedRazorpayOrder;
}

export type PaymentVerificationInput = {
  orderId: string;
  paymentId: string;
  signature: string;
};

/**
 * Razorpay signs `order_id|payment_id` with the key secret. A valid signature
 * proves the payment came from an order this server created, at the amount the
 * catalog priced — so the browser cannot tamper with the total.
 */
export async function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: PaymentVerificationInput): Promise<boolean> {
  if (!orderId.startsWith("order_") || !paymentId.startsWith("pay_")) {
    return false;
  }

  const expected = await hmacSha256Hex(
    getRazorpayKeySecret(),
    `${orderId}|${paymentId}`,
  );
  return timingSafeEqual(expected, signature.toLowerCase());
}

/** Webhooks are signed over the exact raw request body with a separate secret. */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): Promise<boolean> {
  if (!signature) return false;

  const expected = await hmacSha256Hex(getRazorpayWebhookSecret(), rawBody);
  return timingSafeEqual(expected, signature.toLowerCase());
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
