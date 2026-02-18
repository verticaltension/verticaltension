import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiUrl } from "../lib/api";

type AccountProfile = {
  name: string;
  email: string;
  preferredCurrency: CurrencyCode;
};

type ActionResult = { ok: true } | { ok: false; error: string };

type AuthPayload = {
  name: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type ServerUser = {
  name: string;
  email: string;
  preferredCurrency?: string;
};

export type WishlistItem = {
  id: string;
  title: string;
  category: string;
  status: string;
  format: string;
  payhipProductKey?: string;
};

export type CartItem = {
  id: string;
  title: string;
  category: string;
  status: string;
  format: string;
  payhipProductKey?: string;
};

export const CURRENCIES = [
  {
    code: "USD",
    country: "United States",
    currency: "US Dollar",
    flag: "🇺🇸",
  },
  {
    code: "EUR",
    country: "Eurozone",
    currency: "Euro",
    flag: "🇪🇺",
  },
  {
    code: "GBP",
    country: "United Kingdom",
    currency: "British Pound",
    flag: "🇬🇧",
  },
  {
    code: "JPY",
    country: "Japan",
    currency: "Japanese Yen",
    flag: "🇯🇵",
  },
  {
    code: "CAD",
    country: "Canada",
    currency: "Canadian Dollar",
    flag: "🇨🇦",
  },
  {
    code: "AUD",
    country: "Australia",
    currency: "Australian Dollar",
    flag: "🇦🇺",
  },
  {
    code: "CHF",
    country: "Switzerland",
    currency: "Swiss Franc",
    flag: "🇨🇭",
  },
  {
    code: "CNY",
    country: "China",
    currency: "Chinese Yuan",
    flag: "🇨🇳",
  },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

type RateStatus = "idle" | "loading" | "ready" | "error";

type StorefrontContextValue = {
  account: AccountProfile;
  updateAccount: (updates: Partial<AccountProfile>) => void;
  saveAccount: (updates?: Partial<AccountProfile>) => Promise<ActionResult>;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  registerUser: (payload: AuthPayload) => Promise<ActionResult>;
  loginUser: (payload: LoginPayload) => Promise<ActionResult>;
  logoutUser: () => Promise<void>;
  wishlist: WishlistItem[];
  wishlistCount: number;
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (item: WishlistItem) => void;
  removeWishlistItem: (id: string) => void;
  cart: CartItem[];
  cartCount: number;
  isInCart: (id: string) => boolean;
  addToCart: (item: CartItem) => void;
  removeCartItem: (id: string) => void;
  clearCart: () => void;
  ratesStatus: RateStatus;
  convertCurrency: (
    amount: number,
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode
  ) => number | null;
};

const ACCOUNT_STORAGE_KEY = "vtp-account-profile";
const WISHLIST_STORAGE_KEY = "vtp-wishlist";
const CART_STORAGE_KEY = "vtp-cart";
const LEGACY_AUTH_USER_STORAGE_KEY = "vtp-auth-user";
const LEGACY_AUTH_SESSION_STORAGE_KEY = "vtp-auth-session";

const DEFAULT_ACCOUNT: AccountProfile = {
  name: "",
  email: "",
  preferredCurrency: "USD",
};

const DEFAULT_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 150.22,
  CAD: 1.35,
  AUD: 1.52,
  CHF: 0.88,
  CNY: 7.18,
};

const StorefrontContext = createContext<StorefrontContextValue | null>(null);

const isCurrencyCode = (value: string): value is CurrencyCode =>
  CURRENCIES.some((currency) => currency.code === value);

const parseStoredJson = <T,>(value: string | null): T | null => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const validatePasswordStrength = (password: string): string | null => {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (!hasUpper || !hasLower || !hasDigit || !hasSymbol) {
    return "Password must include uppercase, lowercase, number, and symbol.";
  }

  return null;
};

const normalizeServerUser = (
  user: ServerUser,
  fallbackCurrency: CurrencyCode
): AccountProfile => {
  const preferredCurrency = user.preferredCurrency || fallbackCurrency;
  return {
    name: user.name || "",
    email: user.email || "",
    preferredCurrency: isCurrencyCode(preferredCurrency)
      ? preferredCurrency
      : fallbackCurrency,
  };
};

const parseApiError = async (response: Response) => {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || "Request failed.";
  } catch {
    return "Request failed.";
  }
};

const authFetch = async (path: string, init?: RequestInit) => {
  const headers = new Headers(init?.headers || undefined);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(apiUrl(path), {
    ...init,
    headers,
    credentials: "include",
  });
};

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [account, setAccount] = useState<AccountProfile>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_ACCOUNT;
    }

    const parsed = parseStoredJson<Partial<AccountProfile>>(
      localStorage.getItem(ACCOUNT_STORAGE_KEY)
    );

    if (!parsed) {
      return DEFAULT_ACCOUNT;
    }

    const preferred =
      parsed.preferredCurrency && isCurrencyCode(parsed.preferredCurrency)
        ? parsed.preferredCurrency
        : DEFAULT_ACCOUNT.preferredCurrency;

    return {
      name: parsed.name || "",
      email: parsed.email || "",
      preferredCurrency: preferred,
    };
  });

  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const parsed = parseStoredJson<WishlistItem[]>(
      localStorage.getItem(WISHLIST_STORAGE_KEY)
    );

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => typeof item?.id === "string");
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const parsed = parseStoredJson<CartItem[]>(localStorage.getItem(CART_STORAGE_KEY));

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => typeof item?.id === "string");
  });

  const [ratesStatus, setRatesStatus] = useState<RateStatus>("idle");
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(DEFAULT_RATES);

  useEffect(() => {
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
  }, [account]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.removeItem(LEGACY_AUTH_USER_STORAGE_KEY);
    localStorage.removeItem(LEGACY_AUTH_SESSION_STORAGE_KEY);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      setIsAuthLoading(true);
      try {
        const response = await authFetch("/api/auth/me", { method: "GET" });
        if (!response.ok) {
          if (!cancelled) {
            setIsAuthenticated(false);
          }
          return;
        }

        const data = (await response.json()) as { user?: ServerUser };
        if (!data.user || cancelled) {
          return;
        }

        setAccount((previous) =>
          normalizeServerUser(data.user as ServerUser, previous.preferredCurrency)
        );
        setIsAuthenticated(true);
      } catch {
        if (!cancelled) {
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) {
          setIsAuthLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);

    const loadRates = async () => {
      setRatesStatus("loading");
      try {
        const response = await fetch(
          "https://api.frankfurter.app/latest?from=USD",
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to load exchange rates");
        }

        const data = (await response.json()) as {
          rates?: Record<string, number>;
        };
        const nextRates: Record<CurrencyCode, number> = { ...DEFAULT_RATES };

        if (data.rates) {
          for (const currency of CURRENCIES) {
            if (currency.code === "USD") {
              nextRates.USD = 1;
              continue;
            }

            const value = data.rates[currency.code];
            if (typeof value === "number" && value > 0) {
              nextRates[currency.code] = value;
            }
          }
        }

        setRates(nextRates);
        setRatesStatus("ready");
      } catch {
        setRatesStatus("error");
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    loadRates();

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const updateAccount = useCallback((updates: Partial<AccountProfile>) => {
    setAccount((previous) => {
      const preferredCurrency =
        updates.preferredCurrency && isCurrencyCode(updates.preferredCurrency)
          ? updates.preferredCurrency
          : previous.preferredCurrency;

      return {
        ...previous,
        ...updates,
        preferredCurrency,
      };
    });
  }, []);

  const saveAccount = useCallback(
    async (updates?: Partial<AccountProfile>): Promise<ActionResult> => {
      const base = {
        ...account,
        ...updates,
      };
      const payload = {
        name: base.name.trim(),
        email: base.email.trim(),
        preferredCurrency: base.preferredCurrency,
      };

      if (!isAuthenticated) {
        return { ok: false, error: "Login required." };
      }

      if (!payload.name || !payload.email) {
        return { ok: false, error: "Name and email are required." };
      }

      try {
        const response = await authFetch("/api/auth/account", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          return { ok: false, error: await parseApiError(response) };
        }

        const data = (await response.json()) as { user?: ServerUser };
        if (data.user) {
          setAccount((previous) =>
            normalizeServerUser(data.user as ServerUser, previous.preferredCurrency)
          );
        }
        return { ok: true };
      } catch {
        return {
          ok: false,
          error: "Unable to save account. Please try again.",
        };
      }
    },
    [account, isAuthenticated]
  );

  const registerUser = useCallback(
    async (payload: AuthPayload): Promise<ActionResult> => {
      const name = payload.name.trim();
      const email = payload.email.trim().toLowerCase();
      const password = payload.password;

      if (!name || !email || !password) {
        return { ok: false, error: "All fields are required." };
      }

      const passwordError = validatePasswordStrength(password);
      if (passwordError) {
        return { ok: false, error: passwordError };
      }

      try {
        const response = await authFetch("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name,
            email,
            password,
            preferredCurrency: account.preferredCurrency,
          }),
        });

        if (!response.ok) {
          return { ok: false, error: await parseApiError(response) };
        }

        const data = (await response.json()) as { user?: ServerUser };
        if (data.user) {
          setAccount((previous) =>
            normalizeServerUser(data.user as ServerUser, previous.preferredCurrency)
          );
        }
        setIsAuthenticated(true);
        return { ok: true };
      } catch {
        return { ok: false, error: "Unable to register account right now." };
      }
    },
    [account.preferredCurrency]
  );

  const loginUser = useCallback(
    async (payload: LoginPayload): Promise<ActionResult> => {
      const email = payload.email.trim().toLowerCase();
      const password = payload.password;

      if (!email || !password) {
        return { ok: false, error: "Email and password are required." };
      }

      try {
        const response = await authFetch("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          return { ok: false, error: await parseApiError(response) };
        }

        const data = (await response.json()) as { user?: ServerUser };
        if (data.user) {
          setAccount((previous) =>
            normalizeServerUser(data.user as ServerUser, previous.preferredCurrency)
          );
        }
        setIsAuthenticated(true);
        return { ok: true };
      } catch {
        return { ok: false, error: "Unable to login right now." };
      }
    },
    []
  );

  const logoutUser = useCallback(async () => {
    try {
      await authFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network failures and clear local state anyway.
    }

    setIsAuthenticated(false);
    setAccount((previous) => ({
      ...previous,
      name: "",
      email: "",
    }));
  }, []);

  const isWishlisted = useCallback(
    (id: string) => wishlist.some((item) => item.id === id),
    [wishlist]
  );

  const toggleWishlist = useCallback((item: WishlistItem) => {
    setWishlist((previous) => {
      if (previous.some((entry) => entry.id === item.id)) {
        return previous.filter((entry) => entry.id !== item.id);
      }

      return [item, ...previous];
    });
  }, []);

  const removeWishlistItem = useCallback((id: string) => {
    setWishlist((previous) => previous.filter((entry) => entry.id !== id));
  }, []);

  const isInCart = useCallback(
    (id: string) => cart.some((item) => item.id === id),
    [cart]
  );

  const addToCart = useCallback((item: CartItem) => {
    setCart((previous) => {
      if (previous.some((entry) => entry.id === item.id)) {
        return previous;
      }

      return [item, ...previous];
    });
  }, []);

  const removeCartItem = useCallback((id: string) => {
    setCart((previous) => previous.filter((entry) => entry.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const convertCurrency = useCallback(
    (amount: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode) => {
      if (!Number.isFinite(amount)) {
        return null;
      }

      const fromRate = rates[fromCurrency];
      const toRate = rates[toCurrency];

      if (!fromRate || !toRate) {
        return null;
      }

      return (amount / fromRate) * toRate;
    },
    [rates]
  );

  const value = useMemo<StorefrontContextValue>(
    () => ({
      account,
      updateAccount,
      saveAccount,
      isAuthenticated,
      isAuthLoading,
      registerUser,
      loginUser,
      logoutUser,
      wishlist,
      wishlistCount: wishlist.length,
      isWishlisted,
      toggleWishlist,
      removeWishlistItem,
      cart,
      cartCount: cart.length,
      isInCart,
      addToCart,
      removeCartItem,
      clearCart,
      ratesStatus,
      convertCurrency,
    }),
    [
      account,
      updateAccount,
      saveAccount,
      isAuthenticated,
      isAuthLoading,
      registerUser,
      loginUser,
      logoutUser,
      wishlist,
      isWishlisted,
      toggleWishlist,
      removeWishlistItem,
      cart,
      isInCart,
      addToCart,
      removeCartItem,
      clearCart,
      ratesStatus,
      convertCurrency,
    ]
  );

  return (
    <StorefrontContext.Provider value={value}>
      {children}
    </StorefrontContext.Provider>
  );
}

export const useStorefront = () => {
  const context = useContext(StorefrontContext);

  if (!context) {
    throw new Error("useStorefront must be used within StorefrontProvider");
  }

  return context;
};
