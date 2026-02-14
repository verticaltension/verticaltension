export const PAYHIP_STORE_URL = "https://payhip.com/verticaltensionpress";
export const PAYHIP_CART_URL = `${PAYHIP_STORE_URL}/cart`;

export const getPayhipHref = (productKey?: string) =>
  productKey ? `https://payhip.com/b/${productKey}` : PAYHIP_STORE_URL;
