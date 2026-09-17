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
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h2 className="text-2xl font-bold text-gray-400">Payment</h2>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 pt-6 mt-6">
      <h2 className="text-2xl font-bold mb-6">Payment</h2>
      <p className="text-sm text-gray-500 mb-4">
        This is a demo storefront. No real payment will be processed.
      </p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        type="button"
        disabled={isPlacing}
        onClick={handlePlaceOrder}
        className="bg-black text-white py-3 px-8 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPlacing ? "Placing order..." : "Place order"}
      </button>
    </div>
  );
};
