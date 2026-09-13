import {
  $cart,
  removeFromCart,
  updateLineItemQuantity,
} from "@lib/stores/cart";
import { convertToLocale } from "@lib/utils/money";
import { useStore } from "@nanostores/react";

interface CartPageProps {
  countryCode: string;
}

export const CartPage = ({ countryCode }: CartPageProps) => {
  const cart = useStore($cart);

  const handleRemoveItem = (lineItemId: string) => {
    removeFromCart(lineItemId);
  };

  const handleQuantityChange = (lineItemId: string, newQuantity: number) => {
    updateLineItemQuantity(lineItemId, newQuantity);
  };

  const itemCount = cart?.items?.length ?? 0;
  const isEmpty = itemCount === 0;
  const currencyCode = cart?.currency_code || "inr";

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {isEmpty ? (
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-bark/70 mb-6">Start adding items to your cart</p>
          <a
            href={`/${countryCode}/store`}
            className="inline-block bg-bark text-cream py-3 px-8 rounded-md hover:bg-bark/85 transition-colors"
          >
            Continue Shopping
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-6">Cart</h1>

            <div className="border border-bark/15 rounded-md overflow-hidden">
              <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-sand/40 border-b border-bark/15 text-sm font-medium text-bark">
                <div className="col-span-5">Item</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              {cart?.items?.map((item) => {
                const unitPrice = item.unit_price || 0;
                const quantity = item.quantity || 1;
                const lineTotal = unitPrice * quantity;

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-4 p-4 border-b border-bark/10 last:border-0 items-center"
                  >
                    <div className="col-span-12 md:col-span-5 flex gap-4">
                      {item.thumbnail && (
                        <img
                          src={item.thumbnail}
                          alt={item.product_title || "Product"}
                          className="w-20 h-20 object-cover rounded"
                          loading="lazy"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium mb-1">
                          {item.product_title || item.title}
                        </h3>
                        {item.variant_title && (
                          <p className="text-sm text-bark/60">
                            Variant: {item.variant_title}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="col-span-6 md:col-span-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, quantity - 1)
                          }
                          className="w-8 h-8 flex items-center justify-center border border-bark/25 rounded hover:bg-sand/50"
                          aria-label="Decrease quantity"
                        >
                          &minus;
                        </button>
                        <select
                          value={quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              parseInt(e.target.value, 10),
                            )
                          }
                          className="w-16 px-2 py-1 border border-bark/25 rounded text-center"
                          aria-label="Quantity"
                        >
                          {Array.from({ length: 10 }, (_, i) => i + 1).map(
                            (num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ),
                          )}
                        </select>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, quantity + 1)
                          }
                          className="w-8 h-8 flex items-center justify-center border border-bark/25 rounded hover:bg-sand/50"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="col-span-3 md:col-span-2 text-right text-sm">
                      {convertToLocale({ amount: unitPrice, currencyCode })}
                    </div>

                    <div className="col-span-3 md:col-span-2 text-right font-medium">
                      {convertToLocale({ amount: lineTotal, currencyCode })}
                    </div>

                    <div className="col-span-12 md:col-span-1 flex justify-end md:justify-center">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                        aria-label={`Remove ${item.product_title || item.title} from cart`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-2xl font-bold mb-6">Summary</h2>
              <div className="border border-bark/15 rounded-md p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-bark/70">Subtotal</span>
                    <span>
                      {convertToLocale({
                        amount:
                          cart?.items?.reduce(
                            (s, i) => s + i.unit_price * i.quantity,
                            0,
                          ) ?? 0,
                        currencyCode,
                      })}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-bark/15">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>
                        {convertToLocale({
                          amount:
                            cart?.items?.reduce(
                              (s, i) => s + i.unit_price * i.quantity,
                              0,
                            ) ?? 0,
                          currencyCode,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <a
                  href={`/${countryCode}/checkout`}
                  className="w-full block text-center bg-bark text-cream py-4 px-6 rounded-md hover:bg-bark/85 transition-colors mt-6"
                >
                  Go to checkout
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
