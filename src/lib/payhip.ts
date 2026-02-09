export const PAYHIP_STORE_URL = "https://payhip.com/verticaltensionpress";

export const getPayhipHref = (productKey?: string) =>
  productKey ? `https://payhip.com/b/${productKey}` : PAYHIP_STORE_URL;
