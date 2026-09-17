import { mockProducts } from "../data/mock-products";
import { mockRegion } from "../data/mock-regions";

interface ProductParams {
  params: { countryCode: string; productId: string };
}

export const getProductParams = async (): Promise<ProductParams[]> => {
  const paths: ProductParams[] = [];
  for (const country of mockRegion.countries) {
    for (const product of mockProducts) {
      paths.push({
        params: { countryCode: country.iso_2, productId: product.id },
      });
    }
  }
  return paths;
};
