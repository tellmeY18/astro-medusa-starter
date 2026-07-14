import type { MockVariant } from "@lib/data/mock-products";
import { convertToLocale } from "./money";

export const getProductPrice = ({
  productVariants,
}: {
  productVariants: { price?: number }[] | null;
}) => {
  if (!productVariants?.length) {
    return { cheapestPrice: null, variantPrice: null };
  }

  const withPrice = productVariants.filter(
    (v) => v.price != null,
  );

  if (!withPrice.length) {
    return { cheapestPrice: null, variantPrice: null };
  }

  const cheapest = withPrice.reduce((min, v) =>
    (v.price ?? Infinity) < (min.price ?? Infinity) ? v : min,
  );

  return {
    cheapestPrice: {
      calculated_price: convertToLocale({
        amount: cheapest.price!,
        currencyCode: "inr",
      }),
      original_price: convertToLocale({
        amount: cheapest.price!,
        currencyCode: "inr",
      }),
      price_type: "sale" as const,
    },
    variantPrice: null,
  };
};
