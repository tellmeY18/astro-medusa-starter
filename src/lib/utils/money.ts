import { isEmpty } from "./is-empty";

type ConvertToLocaleParams = {
  /** Amount in the currency's smallest unit (paise), as stored in the catalog and cart. */
  amount: number;
  currencyCode: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  locale?: string;
};

export const convertToLocale = ({
  amount,
  currencyCode,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-IN",
}: ConvertToLocaleParams) => {
  // Amounts are stored in paise, but Intl.NumberFormat expects major units.
  const majorAmount = amount / 100;

  return currencyCode && !isEmpty(currencyCode)
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(majorAmount)
    : majorAmount.toString();
};
