import type { APIRoute } from "astro";
import { isRazorpayEnabled } from "@lib/config/features";
import {
  RazorpayConfigError,
  verifyPaymentSignature,
} from "@lib/razorpay/server";

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/**
 * Confirms a checkout.js success payload really came from Razorpay. The order id
 * is bound to the amount this server priced, so a valid signature is enough to
 * treat the payment as settled.
 */
export const POST: APIRoute = async ({ request }) => {
  if (!isRazorpayEnabled) {
    return json({ message: "Payments are not available" }, 404);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ message: "Invalid request body" }, 400);
  }

  const orderId = body.razorpay_order_id;
  const paymentId = body.razorpay_payment_id;
  const signature = body.razorpay_signature;

  if (
    typeof orderId !== "string" ||
    typeof paymentId !== "string" ||
    typeof signature !== "string"
  ) {
    return json({ message: "Incomplete payment response" }, 400);
  }

  try {
    const verified = await verifyPaymentSignature({ orderId, paymentId, signature });

    if (!verified) {
      console.warn(`[razorpay] signature mismatch for payment ${paymentId}`);
      return json({ message: "Payment verification failed" }, 400);
    }

    return json({ ok: true });
  } catch (error) {
    if (error instanceof RazorpayConfigError) {
      console.error(`[razorpay] ${error.message}`);
      return json({ message: "Payments are not configured" }, 503);
    }
    throw error;
  }
};
