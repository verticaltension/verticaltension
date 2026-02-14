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

export type WishlistItem = {
  id: string;
  title: string;
  category: string;
  status: string;
  format: string;
  payhipProductKey?: string;
};

export const CURRENCIES = [
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "JPY", label: "Japanese Yen" },
  { code: "CAD", label: "Canadian Dollar" },
  { code: "AUD", label: "Australian Dollar" },
  { code: "CHF", label: "Swiss Franc" },
  { code: "CNY", label: "Chinese Yuan" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

type RateStatus = "idle" | "loading" | "ready" | "error";

type StorefrontContextValue = {
  account: AccountProfile;
  updateAccount: (updates: Partial<AccountProfile>) => void;
  wishlist: WishlistItem[];
  wishlistCount: number;
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (item: WishlistItem) => void;
  removeWishlistItem: (id: string) => void;
  ratesStatus: RateStatus;
  convertCurrency: (
    amount: number,
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode
  ) => number | null;
};

const ACCOUNT_STORAGE_KEY = "vtp-account-profile";
const WISHLIST_STORAGE_KEY = "vtp-wishlist";

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

export function StorefrontProvider({ children }: { children: ReactNode }) {
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

  const [ratesStatus, setRatesStatus] = useState<RateStatus>("idle");
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(DEFAULT_RATES);

  useEffect(() => {
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
  }, [account]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

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
      wishlist,
      wishlistCount: wishlist.length,
      isWishlisted,
      toggleWishlist,
      removeWishlistItem,
      ratesStatus,
      convertCurrency,
    }),
    [
      account,
      updateAccount,
      wishlist,
      isWishlisted,
      toggleWishlist,
      removeWishlistItem,
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
