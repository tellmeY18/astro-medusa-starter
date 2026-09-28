import type { APIRoute } from "astro";
import { isRazorpayEnabled, razorpayCurrency, razorpayKeyId } from "@lib/config/features";
import { buildQuote, QuoteError } from "@lib/razorpay/quote";
import {
  createRazorpayOrder,
  RazorpayApiError,
  RazorpayConfigError,
} from "@lib/razorpay/server";

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/** Razorpay caps receipts at 40 characters. */
const buildReceipt = (cartId: string) =>
  `rcpt_${cartId.slice(0, 12)}_${Date.now().toString(36)}`;

export const POST: APIRoute = async ({ request }) => {
  if (!isRazorpayEnabled) {
    return json({ message: "Payments are not available" }, 404);
  }
  if (!razorpayKeyId) {
    return json({ message: "Payments are not configured" }, 503);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ message: "Invalid request body" }, 400);
  }

  const cartId = typeof body.cartId === "string" ? body.cartId : "";
  const email = typeof body.email === "string" ? body.email : undefined;
  const phone = typeof body.phone === "string" ? body.phone : undefined;

  // Prices come from the catalog, never from the request body.
  let quote;
  try {
    quote = buildQuote(body.items, razorpayCurrency);
  } catch (error) {
    if (error instanceof QuoteError) {
      return json({ message: error.message }, 400);
    }
    throw error;
  }

  try {
    const order = await createRazorpayOrder({
      keyId: razorpayKeyId,
      amount: quote.amount,
      receipt: buildReceipt(cartId),
      notes: {
        cart_id: cartId || "unknown",
        lines: String(quote.lines.length),
        ...(email ? { email } : {}),
        ...(phone ? { contact: phone.slice(0, 20) } : {}),
      },
    });

    return json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayKeyId,
    });
  } catch (error) {
    if (error instanceof RazorpayConfigError) {
      console.error(`[razorpay] ${error.message}`);
      return json({ message: "Payments are not configured" }, 503);
    }
    if (error instanceof RazorpayApiError) {
      console.error(`[razorpay] ${error.message}`);
      return json({ message: "Could not start the payment" }, 502);
    }
    throw error;
  }
};
