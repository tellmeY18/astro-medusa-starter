import { convertToLocale } from "@lib/utils/money";
import type { LocalCart } from "@lib/types/global";
import { useEffect, useState } from "react";

interface ConfirmedFallbackPageProps {
  countryCode: string;
}

export const ConfirmedFallbackPage = ({
  countryCode,
}: ConfirmedFallbackPageProps) => {
  const [cart, setCart] = useState<LocalCart | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("store_cart_snapshot");
      if (raw) {
        setCart(JSON.parse(raw));
        sessionStorage.removeItem("store_cart_snapshot");
      }
    } catch {}
  }, []);

  const currency = cart?.currency_code ?? "inr";
  const subtotal = cart?.items?.reduce(
    (s, i) => s + i.unit_price * i.quantity,
    0,
  ) ?? 0;

  return (
    <main
      className="max-w-2xl mx-auto px-8 py-16"
      aria-label="Order confirmation"
    >
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-6"
          aria-hidden="true"
        >
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold mb-3">Thank you for your order!</h1>

        <p className="text-sm text-gray-500">
          Your order has been placed successfully.
          {cart?.email && (
            <>
              {" "}A confirmation email has been sent to{" "}
              <span className="font-medium text-gray-700">{cart.email}</span>
            </>
          )}
        </p>
      </div>

      {cart && (
        <section aria-labelledby="items-heading" className="mb-8">
          <h2 id="items-heading" className="text-lg font-semibold mb-4">
            Order Items
          </h2>
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-md overflow-hidden">
            {cart.items.map((item) => {
              const lineTotal = item.unit_price * item.quantity;
              return (
                <div key={item.id} className="flex gap-4 p-4">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded border border-gray-200 shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {item.product_title || item.title}
                    </p>
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-gray-500">
                        {item.quantity} x{" "}
                        {convertToLocale({ amount: item.unit_price, currencyCode: currency })}
                      </span>
                      <span className="font-medium">
                        {convertToLocale({ amount: lineTotal, currencyCode: currency })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {cart && (
        <section className="mb-8">
          <div className="border border-gray-200 rounded-md p-4 text-sm">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{convertToLocale({ amount: subtotal, currencyCode: currency })}</span>
            </div>
          </div>
        </section>
      )}

      <div className="text-center">
        <a
          href={`/${countryCode}/store`}
          className="inline-block bg-black text-white py-3 px-10 rounded-md hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </a>
      </div>
    </main>
  );
};
