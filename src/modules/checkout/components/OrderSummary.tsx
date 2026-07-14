import type { LocalCart } from "@lib/types/global";
import { convertToLocale } from "@lib/utils/money";

interface OrderSummaryProps {
  cart: LocalCart;
}

export const OrderSummary = ({ cart }: OrderSummaryProps) => {
  const currencyCode = cart.currency_code || "usd";
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );

  return (
    <div className="sticky top-8">
      <h2 className="text-2xl font-bold mb-6">In your Cart</h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span>{convertToLocale({ amount: subtotal, currencyCode })}</span>
        </div>
        <div className="pt-4 border-t border-gray-200 flex justify-between font-bold text-base">
          <span>Total</span>
          <span>{convertToLocale({ amount: subtotal, currencyCode })}</span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-4">
        {cart.items.map((item) => {
          const lineTotal = item.unit_price * item.quantity;
          return (
            <div key={item.id} className="flex gap-3">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.product_title || "Product"}
                  className="w-14 h-14 object-cover rounded border border-gray-200 flex-shrink-0"
                  loading="lazy"
                />
              ) : (
                <div className="w-14 h-14 bg-gray-100 rounded border border-gray-200 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {item.product_title || item.title}
                </p>
                {item.variant_title && (
                  <p className="text-xs text-gray-500">
                    Variant: {item.variant_title}
                  </p>
                )}
                <div className="flex justify-between mt-1 text-sm">
                  <span className="text-gray-500">
                    {item.quantity}x{" "}
                    {convertToLocale({ amount: item.unit_price, currencyCode })}
                  </span>
                  <span className="font-medium">
                    {convertToLocale({ amount: lineTotal, currencyCode })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
