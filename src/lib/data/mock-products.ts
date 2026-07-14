export type MockVariant = {
  id: string;
  title: string;
  sku: string;
  price: number;
  inventory_quantity: number;
  options: { id: string; option_id: string; value: string }[];
};

export type MockProduct = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  images: { url: string }[];
  options: { id: string; title: string; values: { id: string; value: string }[] }[];
  variants: MockVariant[];
  material?: string;
  origin_country?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
};

export const mockProducts: MockProduct[] = [
  {
    id: "prod_01",
    title: "Classic Tee",
    description: "A comfortable cotton t-shirt for everyday wear.",
    thumbnail: "https://placehold.co/400x500/e2e8f0/1e293b?text=Tee",
    images: [{ url: "https://placehold.co/800x1000/e2e8f0/1e293b?text=Tee" }],
    options: [
      {
        id: "opt_01",
        title: "Size",
        values: [
          { id: "val_01", value: "S" },
          { id: "val_02", value: "M" },
          { id: "val_03", value: "L" },
        ],
      },
    ],
    variants: [
      { id: "var_01", title: "S", sku: "TEE-S", price: 209900, inventory_quantity: 10, options: [{ id: "ov_01", option_id: "opt_01", value: "S" }] },
      { id: "var_02", title: "M", sku: "TEE-M", price: 209900, inventory_quantity: 8, options: [{ id: "ov_02", option_id: "opt_01", value: "M" }] },
      { id: "var_03", title: "L", sku: "TEE-L", price: 209900, inventory_quantity: 5, options: [{ id: "ov_03", option_id: "opt_01", value: "L" }] },
    ],
    material: "100% Cotton",
    origin_country: "IN",
  },
  {
    id: "prod_02",
    title: "Slim Jeans",
    description: "Modern slim-fit denim jeans.",
    thumbnail: "https://placehold.co/400x500/e2e8f0/1e293b?text=Jeans",
    images: [{ url: "https://placehold.co/800x1000/e2e8f0/1e293b?text=Jeans" }],
    options: [
      {
        id: "opt_02",
        title: "Size",
        values: [
          { id: "val_04", value: "30" },
          { id: "val_05", value: "32" },
          { id: "val_06", value: "34" },
        ],
      },
    ],
    variants: [
      { id: "var_04", title: "30", sku: "JNS-30", price: 489900, inventory_quantity: 6, options: [{ id: "ov_04", option_id: "opt_02", value: "30" }] },
      { id: "var_05", title: "32", sku: "JNS-32", price: 489900, inventory_quantity: 4, options: [{ id: "ov_05", option_id: "opt_02", value: "32" }] },
      { id: "var_06", title: "34", sku: "JNS-34", price: 489900, inventory_quantity: 0, options: [{ id: "ov_06", option_id: "opt_02", value: "34" }] },
    ],
    material: "Denim",
    origin_country: "IN",
  },
  {
    id: "prod_03",
    title: "Running Shoes",
    description: "Lightweight shoes for daily runs.",
    thumbnail: "https://placehold.co/400x500/e2e8f0/1e293b?text=Shoes",
    images: [{ url: "https://placehold.co/800x1000/e2e8f0/1e293b?text=Shoes" }],
    options: [
      {
        id: "opt_03",
        title: "Size",
        values: [
          { id: "val_07", value: "9" },
          { id: "val_08", value: "10" },
          { id: "val_09", value: "11" },
        ],
      },
    ],
    variants: [
      { id: "var_07", title: "9", sku: "SHO-9", price: 739900, inventory_quantity: 12, options: [{ id: "ov_07", option_id: "opt_03", value: "9" }] },
      { id: "var_08", title: "10", sku: "SHO-10", price: 739900, inventory_quantity: 7, options: [{ id: "ov_08", option_id: "opt_03", value: "10" }] },
      { id: "var_09", title: "11", sku: "SHO-11", price: 739900, inventory_quantity: 3, options: [{ id: "ov_09", option_id: "opt_03", value: "11" }] },
    ],
    material: "Synthetic",
    origin_country: "IN",
  },
  {
    id: "prod_04",
    title: "Canvas Backpack",
    description: "Durable canvas backpack with laptop sleeve.",
    thumbnail: "https://placehold.co/400x500/e2e8f0/1e293b?text=Bag",
    images: [{ url: "https://placehold.co/800x1000/e2e8f0/1e293b?text=Bag" }],
    options: [],
    variants: [
      { id: "var_10", title: "Default", sku: "BAG-01", price: 374900, inventory_quantity: 15, options: [] },
    ],
    material: "Canvas",
    origin_country: "IN",
    weight: 600,
    length: 45,
    width: 30,
    height: 15,
  },
];
