import { mockRegion } from "../data/mock-regions";

interface RegionParams {
  params: { countryCode: string };
}

export const getRegionParams = async (): Promise<RegionParams[]> => {
  return mockRegion.countries.map((c) => ({
    params: { countryCode: c.iso_2 },
  }));
};
