import { atom, computed } from "nanostores";
import type { CartItem, LocalCart } from "@lib/types/global";

const CART_STORAGE_KEY = "store_cart";

export const $cart = atom<LocalCart | null>(null);
export const $isCartSidebarOpen = atom<boolean>(false);
export const $regionId = atom<string | null>(null);

export const $cartItemCount = computed($cart, (cart) => {
  if (!cart?.items) return 0;
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
});

function loadCart(): LocalCart | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCart(cart: LocalCart): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function recalcTotals(cart: LocalCart): LocalCart {
  const item_subtotal = cart.items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );
  return { ...cart, item_subtotal, shipping_total: 0, tax_total: 0, total: item_subtotal };
}

export function initCart(): void {
  const existing = loadCart();
  if (existing) {
    $cart.set(recalcTotals(existing));
    return;
  }
  const cart: LocalCart = {
    id: generateId(),
    items: [],
    currency_code: "inr",
  };
  saveCart(cart);
  $cart.set(cart);
}

export function addToCart(
  variantId: string,
  quantity: number,
  product?: { title: string; variant_title?: string; thumbnail?: string; price: number },
): void {
  let cart = $cart.get();
  if (!cart) {
    initCart();
    cart = $cart.get()!;
  }

  const existing = cart.items.find((i) => i.variant_id === variantId);
  let items: CartItem[];

  if (existing) {
    items = cart.items.map((i) =>
      i.variant_id === variantId ? { ...i, quantity: i.quantity + quantity } : i,
    );
  } else {
    items = [
      ...cart.items,
      {
        id: generateId(),
        variant_id: variantId,
        title: product?.title ?? "Product",
        variant_title: product?.variant_title,
        quantity,
        unit_price: product?.price ?? 0,
        thumbnail: product?.thumbnail,
        product_title: product?.title,
      },
    ];
  }

  const updated = recalcTotals({ ...cart, items });
  saveCart(updated);
  $cart.set(updated);
  $isCartSidebarOpen.set(true);
}

export function removeFromCart(lineItemId: string): void {
  const cart = $cart.get();
  if (!cart) return;
  const items = cart.items.filter((i) => i.id !== lineItemId);
  const updated = recalcTotals({ ...cart, items });
  saveCart(updated);
  $cart.set(updated);
}

export function updateLineItemQuantity(
  lineItemId: string,
  quantity: number,
): void {
  if (quantity <= 0) {
    removeFromCart(lineItemId);
    return;
  }
  const cart = $cart.get();
  if (!cart) return;
  const items = cart.items.map((i) =>
    i.id === lineItemId ? { ...i, quantity } : i,
  );
  const updated = recalcTotals({ ...cart, items });
  saveCart(updated);
  $cart.set(updated);
}

export function updateCartAddress(data: {
  email?: string;
  shipping_address?: Record<string, string>;
  billing_address?: Record<string, string>;
}): void {
  const cart = $cart.get();
  if (!cart) return;
  const updated = { ...cart, ...data };
  saveCart(updated);
  $cart.set(updated);
}

export function completeCart(): void {
  localStorage.removeItem(CART_STORAGE_KEY);
  $cart.set(null);
}

export function toggleCartSidebar(): void {
  $isCartSidebarOpen.set(!$isCartSidebarOpen.get());
}

export function closeCartSidebar(): void {
  $isCartSidebarOpen.set(false);
}

export function openCartSidebar(): void {
  $isCartSidebarOpen.set(true);
}
