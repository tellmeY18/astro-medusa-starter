import { $cart } from "@lib/stores/cart";
import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import { type RegionCountry } from "./AddressFields";
import { OrderSummary } from "./OrderSummary";
import { PaymentStep } from "./PaymentStep";
import { ShippingAddressStep } from "./ShippingAddressStep";

interface CheckoutPageProps {
  countryCode: string;
  countries: RegionCountry[];
}

type CheckoutStep = "address" | "payment";

const VALID_STEPS: CheckoutStep[] = ["address", "payment"];

function readStepFromUrl(): CheckoutStep {
  const params = new URLSearchParams(window.location.search);
  const s = params.get("step");
  return VALID_STEPS.includes(s as CheckoutStep) ? (s as CheckoutStep) : "address";
}

export const CheckoutPage = ({ countryCode, countries }: CheckoutPageProps) => {
  const cart = useStore($cart);
  const [, setSearch] = useState(() =>
    typeof window !== "undefined" ? window.location.search : "",
  );

  useEffect(() => {
    const onPopState = () => setSearch(window.location.search);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const goToStep = (next: CheckoutStep) => {
    const url = new URL(window.location.href);
    url.searchParams.set("step", next);
    history.pushState(null, "", url.toString());
    setSearch(url.search);
  };

  const step = cart ? readStepFromUrl() : "address";

  if (!cart || !cart.items?.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-6">Add items before checking out.</p>
        <a
          href={`/${countryCode}/store`}
          className="inline-block bg-black text-white py-3 px-8 rounded-md hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-0">
          <ShippingAddressStep
            countries={countries}
            countryCode={countryCode}
            mode={step === "address" ? "edit" : "read"}
            onContinue={() => goToStep("payment")}
            onEdit={() => goToStep("address")}
          />

          <PaymentStep
            cart={cart}
            countryCode={countryCode}
            mode={step === "address" ? "inactive" : "edit"}
          />
        </div>

        <div className="lg:col-span-1">
          <OrderSummary cart={cart} />
        </div>
      </div>
    </div>
  );
};
