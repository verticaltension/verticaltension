import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AccountProfile = {
  name: string;
  email: string;
  preferredCurrency: CurrencyCode;
};

type StoredAuthUser = {
  name: string;
  email: string;
  password: string;
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
  isAuthenticated: boolean;
  registerUser: (payload: {
    name: string;
    email: string;
    password: string;
  }) => { ok: true } | { ok: false; error: string };
  loginUser: (payload: {
    email: string;
    password: string;
  }) => { ok: true } | { ok: false; error: string };
  logoutUser: () => void;
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
const AUTH_USER_STORAGE_KEY = "vtp-auth-user";
const AUTH_SESSION_STORAGE_KEY = "vtp-auth-session";
const WISHLIST_STORAGE_KEY = "vtp-wishlist";
const CART_STORAGE_KEY = "vtp-cart";

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
  if (password.length < 10) {
    return "Password must be at least 10 characters.";
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

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<StoredAuthUser | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const parsed = parseStoredJson<StoredAuthUser>(
      localStorage.getItem(AUTH_USER_STORAGE_KEY)
    );

    if (
      parsed &&
      typeof parsed.email === "string" &&
      typeof parsed.password === "string" &&
      typeof parsed.name === "string"
    ) {
      return parsed;
    }

    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const sessionEmail = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    const parsedUser = parseStoredJson<StoredAuthUser>(
      localStorage.getItem(AUTH_USER_STORAGE_KEY)
    );

    return Boolean(
      sessionEmail &&
        parsedUser &&
        parsedUser.email.toLowerCase() === sessionEmail.toLowerCase()
    );
  });

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
    if (authUser) {
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(authUser));
      return;
    }

    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  }, [authUser]);

  useEffect(() => {
    if (isAuthenticated && authUser) {
      localStorage.setItem(AUTH_SESSION_STORAGE_KEY, authUser.email);
      return;
    }

    localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  }, [isAuthenticated, authUser]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

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

  const registerUser = useCallback(
    (payload: { name: string; email: string; password: string }) => {
      const name = payload.name.trim();
      const email = payload.email.trim().toLowerCase();
      const password = payload.password;

      if (!name || !email || !password) {
        return { ok: false as const, error: "All fields are required." };
      }

      const passwordError = validatePasswordStrength(password);
      if (passwordError) {
        return {
          ok: false as const,
          error: passwordError,
        };
      }

      if (authUser && authUser.email.toLowerCase() === email) {
        return {
          ok: false as const,
          error: "An account with this email already exists.",
        };
      }

      const nextUser: StoredAuthUser = { name, email, password };
      setAuthUser(nextUser);
      setIsAuthenticated(true);
      setAccount((previous) => ({
        ...previous,
        name,
        email,
      }));

      return { ok: true as const };
    },
    [authUser]
  );

  const loginUser = useCallback(
    (payload: { email: string; password: string }) => {
      const email = payload.email.trim().toLowerCase();
      const password = payload.password;

      if (!authUser) {
        return { ok: false as const, error: "No registered account found." };
      }

      if (authUser.email.toLowerCase() !== email || authUser.password !== password) {
        return { ok: false as const, error: "Invalid email or password." };
      }

      setIsAuthenticated(true);
      setAccount((previous) => ({
        ...previous,
        name: authUser.name,
        email: authUser.email,
      }));
      return { ok: true as const };
    },
    [authUser]
  );

  const logoutUser = useCallback(() => {
    setIsAuthenticated(false);
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
      isAuthenticated,
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
      isAuthenticated,
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
