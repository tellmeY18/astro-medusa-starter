import { mockProducts, type MockProduct } from "./mock-products";

export const listProducts = async (): Promise<MockProduct[]> => {
  return mockProducts;
};

export const retrieveProduct = async (
  productId: string,
): Promise<MockProduct | undefined> => {
  return mockProducts.find((p) => p.id === productId);
};
