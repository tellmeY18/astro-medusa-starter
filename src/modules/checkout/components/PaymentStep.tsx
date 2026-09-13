import { completeCart } from "@lib/stores/cart";
import type { LocalCart } from "@lib/types/global";
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

  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    setError("");
    try {
      sessionStorage.setItem("store_cart_snapshot", JSON.stringify(cart));
      completeCart();
      window.location.href = `/${countryCode}/order/confirmed`;
    } catch {
      setError("Failed to place order. Please try again.");
    } finally {
      setIsPlacing(false);
    }
  };

  if (mode === "inactive") {
    return (
      <div className="border-t border-bark/15 pt-6 mt-6">
        <h2 className="text-2xl font-bold text-bark/40">Payment</h2>
      </div>
    );
  }

  return (
    <div className="border-t border-bark/15 pt-6 mt-6">
      <h2 className="text-2xl font-bold mb-6">Payment</h2>
      <p className="text-sm text-bark/60 mb-4">
        This is a demo storefront. No real payment will be processed.
      </p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        type="button"
        disabled={isPlacing}
        onClick={handlePlaceOrder}
        className="bg-bark text-cream py-3 px-8 rounded-md hover:bg-bark/85 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPlacing ? "Placing order..." : "Place order"}
      </button>
    </div>
  );
};
