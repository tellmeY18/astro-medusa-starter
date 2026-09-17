export type MockRegion = {
  id: string;
  name: string;
  countries: { iso_2: string; display_name: string }[];
};

export const mockRegion: MockRegion = {
  id: "reg_in",
  name: "India",
  countries: [{ iso_2: "in", display_name: "India" }],
};

export const supportedCountryCodes = mockRegion.countries.map((c) => c.iso_2);
