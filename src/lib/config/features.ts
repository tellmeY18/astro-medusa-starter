const isTruthy = (value: string | undefined): boolean =>
  value === "true" || value === "1";

/**
 * Master switch for Razorpay checkout.
 *
 * The integration ships fully built but inert: with the flag off the storefront
 * keeps its demo checkout, so flipping this on is the only step required to take
 * real payments. Flip it in the deploy environment and redeploy.
 */
export const isRazorpayEnabled =
  isTruthy(import.meta.env.PUBLIC_RAZORPAY_ENABLED) ||
  Boolean(import.meta.env.PUBLIC_RAZORPAY_KEY_ID || import.meta.env.RAZORPAY_KEY_ID);

/** Publishable key id. Safe for the browser; the key secret never leaves the server. */
export const razorpayKeyId =
  import.meta.env.PUBLIC_RAZORPAY_KEY_ID ||
  import.meta.env.RAZORPAY_KEY_ID ||
  "";

export const razorpayCurrency = "INR";

export const razorpayStoreName = "My Store";
