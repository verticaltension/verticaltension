export const PAYHIP_STORE_URL = "https://payhip.com/verticaltensionpress";
export const PAYHIP_CART_URL = `${PAYHIP_STORE_URL}/cart`;
export const CHECKOUT_SUCCESS_PATH = "/thank-you";
export const CHECKOUT_PENDING_KEY = "vtp-checkout-pending";

export const getPayhipHref = (productKey?: string) =>
  productKey ? `https://payhip.com/b/${productKey}` : PAYHIP_STORE_URL;

export const markCheckoutPending = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CHECKOUT_PENDING_KEY, "1");
};

export const consumeCheckoutPending = () => {
  if (typeof window === "undefined") {
    return false;
  }

  const pending = window.localStorage.getItem(CHECKOUT_PENDING_KEY) === "1";

  if (pending) {
    window.localStorage.removeItem(CHECKOUT_PENDING_KEY);
  }

  return pending;
};

export const getCheckoutSuccessUrl = () => {
  if (typeof window === "undefined") {
    return CHECKOUT_SUCCESS_PATH;
  }

  return `${window.location.origin}${CHECKOUT_SUCCESS_PATH}`;
};
