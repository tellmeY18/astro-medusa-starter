import { mockRegion, type MockRegion } from "./mock-regions";

export const listRegions = async (): Promise<MockRegion[]> => {
  return [mockRegion];
};

export const getRegion = async (
  _countryCode: string,
): Promise<MockRegion> => {
  return mockRegion;
};
