import {
  isRazorpayEnabled,
  razorpayStoreName,
} from "@lib/config/features";
import {
  loadRazorpayCheckout,
  openRazorpayCheckout,
  requestCheckoutOrder,
  requestPaymentVerification,
  type CheckoutOrder,
} from "@lib/razorpay/checkout";
import type { RazorpayCheckoutResponse } from "@lib/razorpay/types";
import { completeCart, persistOrderSnapshot } from "@lib/stores/cart";
import type { LocalCart } from "@lib/types/global";
import { convertToLocale } from "@lib/utils/money";
import { useState } from "react";

interface PaymentStepProps {
  cart: LocalCart;
  countryCode: string;
  mode: "edit" | "inactive";
}

export const PaymentStep = ({
  cart,
  countryCode,
  mode,
}: PaymentStepProps) => {
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState("");
  // Set once Razorpay reports a payment. From that point the money has moved, so
  // we must not let the customer start a second payment for the same cart.
  const [chargedPaymentId, setChargedPaymentId] = useState<string | null>(null);

  const itemCount = cart.items.length;
  const description = `Order of ${itemCount} item${itemCount === 1 ? "" : "s"}`;

  const goToConfirmation = () => {
    window.location.href = `/${countryCode}/order/confirmed`;
  };

  const placeDemoOrder = () => {
    persistOrderSnapshot({ cart });
    completeCart();
    goToConfirmation();
  };

  /** Resolves with Razorpay's success payload, rejects if the modal is dismissed. */
  const openCheckoutForOrder = (order: CheckoutOrder) =>
    new Promise<RazorpayCheckoutResponse>((resolve, reject) => {
      let settled = false;

      openRazorpayCheckout({
        keyId: order.keyId,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        name: razorpayStoreName,
        description,
        prefill: { email: cart.email, contact: cart.phone },
        onSuccess: (response) => {
          if (settled) return;
          settled = true;
          resolve(response);
        },
        onDismiss: () => {
          if (settled) return;
          settled = true;
          reject(new Error("Checkout was closed before the payment completed"));
        },
      });
    });

  const handlePlaceOrder = async () => {
    setError("");

    if (!isRazorpayEnabled) {
      placeDemoOrder();
      return;
    }

    setIsPlacing(true);
    try {
      // Create the order first: a failure here is our own error, so the customer
      // never pays for a checkout.js download that cannot succeed.
      const order = await requestCheckoutOrder({
        items: cart.items.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
        })),
        cartId: cart.id,
        email: cart.email,
        phone: cart.phone,
      });

      await loadRazorpayCheckout();
      const payment = await openCheckoutForOrder(order);
      setChargedPaymentId(payment.razorpay_payment_id);
      await requestPaymentVerification(payment);

      persistOrderSnapshot({
        cart,
        payment: {
          provider: "razorpay",
          payment_id: payment.razorpay_payment_id,
          order_id: payment.razorpay_order_id,
        },
      });
      completeCart();
      goToConfirmation();
    } catch (caught) {
      setError(
        chargedPaymentId
          ? `We could not confirm payment ${chargedPaymentId}. Your payment was taken — we will confirm it by email shortly. Please do not pay again.`
          : caught instanceof Error
            ? caught.message
            : "Payment failed. Please try again.",
      );
      setIsPlacing(false);
    }
  };

  if (mode === "inactive") {
    return (
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h2 className="text-2xl font-bold text-gray-400">Payment</h2>
      </div>
    );
  }

  const total = cart.items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );
  const payableAmount = convertToLocale({
    amount: total,
    currencyCode: cart.currency_code || "inr",
  });

  return (
    <div className="border-t border-gray-200 pt-6 mt-6">
      <h2 className="text-2xl font-bold mb-6">Payment</h2>

      <p className="text-sm text-gray-500 mb-4">
        {isRazorpayEnabled
          ? "Pay securely by card, UPI, netbanking or wallet."
          : "This is a demo storefront. No real payment will be processed."}
      </p>

      {error && (
        <p role="alert" className="text-red-500 text-sm mb-4">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={isPlacing || chargedPaymentId !== null}
        onClick={handlePlaceOrder}
        className="bg-black text-white py-3 px-8 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPlacing
          ? "Processing..."
          : chargedPaymentId !== null
            ? "Payment submitted"
            : isRazorpayEnabled
              ? `Pay ${payableAmount}`
              : "Place order"}
      </button>
    </div>
  );
};
