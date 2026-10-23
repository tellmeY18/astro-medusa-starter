import type { APIRoute } from "astro";
import { isRazorpayEnabled, razorpayCurrency, razorpayKeyId } from "@lib/config/features";
import { buildQuote, QuoteError } from "@lib/razorpay/quote";
import {
  createRazorpayOrder,
  getRazorpayKeyId,
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
  const activeKeyId = razorpayKeyId || getRazorpayKeyId();

  if (!isRazorpayEnabled && !activeKeyId) {
    return json({ message: "Payments are not available" }, 404);
  }
  if (!activeKeyId) {
    return json({ message: "Payments are not configured" }, 503);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ message: "Invalid request body" }, 400);
  }

  const cartId =
    (typeof body.cart_id === "string" ? body.cart_id : "") ||
    (typeof body.cartId === "string" ? body.cartId : "");
  const email = typeof body.email === "string" ? body.email : undefined;
  const phone = typeof body.phone === "string" ? body.phone : undefined;

  let amount: number;
  let linesCount = "0";

  if (Array.isArray(body.items) && body.items.length > 0) {
    try {
      const quote = buildQuote(body.items, razorpayCurrency);
      amount = quote.amount;
      linesCount = String(quote.lines.length);
    } catch (error) {
      if (error instanceof QuoteError) {
        return json({ message: error.message }, 400);
      }
      throw error;
    }
  } else if (typeof body.amount === "number" && body.amount > 0) {
    amount = Math.round(body.amount);
  } else {
    return json({ message: "Cart is empty or invalid amount provided" }, 400);
  }

  try {
    const order = await createRazorpayOrder({
      keyId: activeKeyId,
      amount,
      receipt: buildReceipt(cartId),
      notes: {
        cart_id: cartId || "unknown",
        lines: linesCount,
        ...(email ? { email } : {}),
        ...(phone ? { contact: phone.slice(0, 20) } : {}),
      },
    });

    return json({
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: activeKeyId,
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
