export type MockRegion = {
  id: string;
  name: string;
  countries: { iso_2: string; display_name: string }[];
};

export const mockRegion: MockRegion = {
  id: "reg_us",
  name: "United States",
  countries: [
    { iso_2: "us", display_name: "United States" },
    { iso_2: "ca", display_name: "Canada" },
    { iso_2: "gb", display_name: "United Kingdom" },
  ],
};

export const supportedCountryCodes = mockRegion.countries.map((c) => c.iso_2);
