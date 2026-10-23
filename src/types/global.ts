import type { MockVariant } from "@lib/data/mock-products";

export type ProductVariant = {
  id: string;
  sku: string;
  calculated_price?: {
    calculated_amount: number | null;
    original_amount: number | null;
    currency_code: string | null;
    calculated_price?: { price_list_type: string | null };
  };
};

export type CartItem = {
  id: string;
  variant_id: string;
  title: string;
  variant_title?: string;
  quantity: number;
  unit_price: number;
  thumbnail?: string;
  product_title?: string;
};

export type CartPayment = {
  provider: "razorpay";
  payment_id: string;
  order_id: string;
};

export type LocalCart = {
  id: string;
  items: CartItem[];
  currency_code: string;
  email?: string;
  phone?: string;
  shipping_address?: Record<string, string>;
  billing_address?: Record<string, string>;
  item_subtotal?: number;
  shipping_total?: number;
  tax_total?: number;
  total?: number;
};

/** Handed to the confirmation page after a successful checkout. */
export type OrderSnapshot = {
  cart: LocalCart;
  payment?: CartPayment;
};
