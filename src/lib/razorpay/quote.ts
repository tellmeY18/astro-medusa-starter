import { mockProducts } from "@lib/data/mock-products";

/** Upper bound on a single cart line, independent of stock. */
export const MAX_QUANTITY_PER_LINE = 10;

/** Upper bound on distinct lines in one order. */
export const MAX_LINES_PER_ORDER = 50;

export type QuoteRequestItem = {
  variant_id: string;
  quantity: number;
};

export type QuoteLine = {
  variant_id: string;
  sku: string;
  title: string;
  quantity: number;
  /** Smallest currency unit (paise), straight from the catalog. */
  unit_amount: number;
};

export type Quote = {
  /** Smallest currency unit (paise). */
  amount: number;
  currency: string;
  lines: QuoteLine[];
};

export class QuoteError extends Error {}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Rebuilds an order total from the product catalog instead of trusting prices
 * sent by the browser. Returns the amount to charge, in paise.
 */
export function buildQuote(items: unknown, currency = "INR"): Quote {
  if (!Array.isArray(items) || items.length === 0) {
    throw new QuoteError("Cart is empty");
  }
  if (items.length > MAX_LINES_PER_ORDER) {
    throw new QuoteError("Too many distinct items in one order");
  }

  const lines: QuoteLine[] = [];

  for (const item of items) {
    if (!isRecord(item)) {
      throw new QuoteError("Malformed cart item");
    }

    const variantId = item.variant_id;
    const quantity = item.quantity;

    if (typeof variantId !== "string" || variantId.length === 0) {
      throw new QuoteError("Cart item is missing a variant id");
    }
    if (typeof quantity !== "number" || !Number.isInteger(quantity)) {
      throw new QuoteError("Cart item has an invalid quantity");
    }
    if (quantity < 1 || quantity > MAX_QUANTITY_PER_LINE) {
      throw new QuoteError(`Quantity must be between 1 and ${MAX_QUANTITY_PER_LINE}`);
    }

    const product = mockProducts.find((candidate) =>
      candidate.variants.some((variant) => variant.id === variantId),
    );
    const variant = product?.variants.find(
      (candidate) => candidate.id === variantId,
    );

    if (!product || !variant) {
      throw new QuoteError(`Unknown variant: ${variantId}`);
    }
    if (variant.inventory_quantity < quantity) {
      throw new QuoteError(`Not enough stock for ${product.title} (${variant.title})`);
    }

    lines.push({
      variant_id: variant.id,
      sku: variant.sku,
      title: `${product.title} — ${variant.title}`,
      quantity,
      unit_amount: variant.price,
    });
  }

  const amount = lines.reduce(
    (sum, line) => sum + line.unit_amount * line.quantity,
    0,
  );

  return { amount, currency, lines };
}
