import {
  $cartItemCount,
  initCart,
  toggleCartSidebar,
} from "@lib/stores/cart";
import { useStore } from "@nanostores/react";
import { useEffect } from "react";

interface NavProps {
  countryCode: string;
}

export const Nav = ({ countryCode }: NavProps) => {
  const cartItemCount = useStore($cartItemCount);

  useEffect(() => {
    initCart();
  }, []);

  return (
    <header className="flex items-center w-full px-4 sm:px-8 h-20 md:h-24">
      <div className="flex items-center gap-3 sm:gap-6 flex-1">
        <a
          href={`/${countryCode}/store`}
          className="text-sm hover:underline whitespace-nowrap"
        >
          Products
        </a>
      </div>

      <a
        href={`/${countryCode}`}
        className="text-sm font-bold uppercase tracking-wide whitespace-nowrap"
      >
        My Store
      </a>

      <div className="flex items-center gap-3 sm:gap-6 flex-1 justify-end">
        <button
          onClick={toggleCartSidebar}
          className="text-sm hover:underline relative whitespace-nowrap"
          aria-label={`Shopping cart with ${cartItemCount} item${cartItemCount !== 1 ? "s" : ""}`}
        >
          <span aria-live="polite" aria-atomic="true">
            Cart ({cartItemCount})
          </span>
        </button>
      </div>
    </header>
  );
};
