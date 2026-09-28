import type { APIRoute } from "astro";
import { isRazorpayEnabled } from "@lib/config/features";
import {
  RazorpayConfigError,
  verifyWebhookSignature,
} from "@lib/razorpay/server";

export const prerender = false;

type RazorpayWebhookEvent = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        amount?: number;
        currency?: string;
        method?: string;
        email?: string;
        contact?: string;
        captured?: boolean;
      };
    };
  };
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/**
 * Safety net for payments that settle after the customer leaves the page. The
 * signature check is the authoritative one — the browser-side check can be
 * skipped entirely if the tab is closed mid-checkout.
 */
export const POST: APIRoute = async ({ request }) => {
  if (!isRazorpayEnabled) {
    return json({ message: "Payments are not available" }, 404);
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  try {
    if (!(await verifyWebhookSignature(rawBody, signature))) {
      console.warn("[razorpay] webhook signature mismatch");
      return json({ message: "Invalid signature" }, 400);
    }
  } catch (error) {
    if (error instanceof RazorpayConfigError) {
      console.error(`[razorpay] ${error.message}`);
      return json({ message: "Webhooks are not configured" }, 503);
    }
    throw error;
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    return json({ message: "Invalid payload" }, 400);
  }

  const entity = event.payload?.payment?.entity;

  if (event.event === "payment.captured" && entity?.captured) {
    console.log(
      `[razorpay] captured payment=${entity.id} order=${entity.order_id} amount=${entity.amount} ${entity.currency ?? ""} method=${entity.method ?? "unknown"} email=${entity.email ?? "unknown"}`.trim(),
    );
  } else if (event.event === "payment.failed") {
    console.warn(
      `[razorpay] failed payment=${entity?.id} order=${entity?.order_id} method=${entity?.method ?? "unknown"}`,
    );
  } else {
    console.log(`[razorpay] webhook ${event.event ?? "unknown"}`);
  }

  return json({ received: true });
};
