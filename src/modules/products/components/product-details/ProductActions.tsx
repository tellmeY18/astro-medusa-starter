import { addToCart } from "@lib/stores/cart";
import { isProductInStock } from "@lib/utils/is-product-in-stock";
import clsx from "clsx";
import { useMemo, useState } from "react";

type Variant = {
  id: string;
  title: string;
  sku: string;
  price: number;
  inventory_quantity: number;
  options: { id: string; option_id?: string | null; value: string }[];
};

interface Props {
  options: {
    id: string;
    title: string;
    values?: { id: string; value: string }[];
  }[];
  variants: Variant[];
  productId: string;
}

export const ProductActions = ({
  options,
  variants,
  productId,
}: Props) => {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [isAdding, setIsAdding] = useState(false);

  const selectedVariant = useMemo(() => {
    if (
      !variants.length ||
      !options.length ||
      Object.keys(selectedOptions).length !== options.length
    ) {
      return;
    }
    return variants.find((variant) =>
      variant.options?.every(
        (opt) => opt.id === selectedOptions[opt.option_id!],
      ),
    );
  }, [selectedOptions, variants, options]);

  const handleOptionSelect = (optionId: string, valueId: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionId]: valueId }));
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || isAdding) return;
    setIsAdding(true);
    try {
      addToCart(selectedVariant.id, 1, {
        title: options.map((o) => {
          const val = o.values?.find(
            (v) => v.id === selectedOptions[o.id],
          );
          return val?.value ?? "";
        }).filter(Boolean).join(" / ") || "Item",
        variant_title: selectedVariant.title,
        thumbnail: undefined,
        price: selectedVariant.price,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const isDisabled =
    !selectedVariant ||
    !isProductInStock(selectedVariant) ||
    isAdding;

  if (options.length === 0) {
    return (
      <button
        className={clsx(
          "bg-black text-white py-4 px-8 rounded-md cursor-pointer hover:shadow-md ease-in-out duration-200",
          { "opacity-50 cursor-not-allowed": isDisabled },
        )}
        disabled={isDisabled}
        onClick={() => {
          if (variants[0]) {
            setIsAdding(true);
            addToCart(variants[0].id, 1, {
              title: variants[0].title,
              variant_title: variants[0].title,
              price: variants[0].price,
            });
            setIsAdding(false);
          }
        }}
      >
        {isAdding ? "Adding..." : "Add to Cart"}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {options.map((option) => (
        <div key={option.id} className="flex flex-col gap-2">
          <h2 className="text-lg font-bold">{option.title}</h2>
          <div className="flex flex-wrap gap-2">
            {option.values?.map((value) => (
              <button
                key={value.id}
                className={clsx(
                  "bg-gray-100 py-2 px-4 rounded-md cursor-pointer hover:shadow-md ease-in-out duration-200 w-20 h-10 box-border",
                  { border: selectedOptions[option.id] === value.id },
                )}
                onClick={() => handleOptionSelect(option.id, value.id)}
              >
                {value.value}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        className={clsx(
          "bg-black text-white py-4 px-8 rounded-md cursor-pointer hover:shadow-md ease-in-out duration-200",
          { "opacity-50 cursor-not-allowed": isDisabled },
        )}
        disabled={isDisabled}
        onClick={handleAddToCart}
      >
        {isAdding ? "Adding..." : "Add to Cart"}
      </button>
    </div>
  );
};
