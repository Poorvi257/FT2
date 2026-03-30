const localeByCurrency = {
  SGD: "en-SG",
  INR: "en-IN",
  USD: "en-US",
  EUR: "en-IE",
  GBP: "en-GB",
  AUD: "en-AU"
};

let defaultCurrency = "SGD";
let defaultLocale = localeByCurrency[defaultCurrency];

export function setCurrencyDefaults(currency = "SGD") {
  const normalizedCurrency = String(currency || "SGD").toUpperCase();
  defaultCurrency = normalizedCurrency;
  defaultLocale = localeByCurrency[normalizedCurrency] || "en-US";
}

export function formatCurrency(value, currency = defaultCurrency) {
  const normalizedCurrency = String(currency || defaultCurrency).toUpperCase();

  return new Intl.NumberFormat(localeByCurrency[normalizedCurrency] || defaultLocale || "en-US", {
    style: "currency",
    currency: normalizedCurrency,
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}
