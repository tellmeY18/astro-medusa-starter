import type { RazorpayCheckoutResponse } from "./types";

const CHECKOUT_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

type RazorpayInstance = { open: () => void };

type RazorpayConstructor = new (
  options: Record<string, unknown>,
) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let scriptPromise: Promise<void> | null = null;

/** Loads checkout.js once per session and resolves when `window.Razorpay` exists. */
export function loadRazorpayCheckout(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay checkout requires a browser"));
  }
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      script.remove();
      reject(new Error("Could not load the Razorpay checkout script"));
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export type OpenCheckoutInput = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name?: string; email?: string; contact?: string };
  onSuccess: (response: RazorpayCheckoutResponse) => void;
  onDismiss: () => void;
};

export function openRazorpayCheckout({
  keyId,
  orderId,
  amount,
  currency,
  name,
  description,
  prefill,
  onSuccess,
  onDismiss,
}: OpenCheckoutInput): void {
  const Razorpay = window.Razorpay;
  if (!Razorpay) {
    throw new Error("Razorpay checkout is not loaded");
  }

  new Razorpay({
    key: keyId,
    amount,
    currency,
    name,
    description,
    order_id: orderId,
    prefill,
    theme: { color: "#000000" },
    handler: onSuccess,
    modal: {
      ondismiss: onDismiss,
      // Keep the failure silent: the handler below already surfaces errors.
      escape: true,
    },
  }).open();
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;

  if (!response.ok) {
    throw new Error(payload?.message ?? "Something went wrong. Please try again.");
  }

  return payload as T;
}

export type CheckoutOrder = {
  id: string;
  amount: number;
  currency: string;
  keyId: string;
};

export function requestCheckoutOrder(input: {
  items: { variant_id: string; quantity: number }[];
  cartId: string;
  email?: string;
  phone?: string;
}): Promise<CheckoutOrder> {
  return postJson<CheckoutOrder>("/api/razorpay/create-order", input);
}

export function requestPaymentVerification(
  response: RazorpayCheckoutResponse,
): Promise<{ ok: true }> {
  return postJson<{ ok: true }>("/api/razorpay/verify-payment", response);
}
