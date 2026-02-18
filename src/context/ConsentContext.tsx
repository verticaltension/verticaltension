import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type StoredConsent = {
  version: string;
  acceptedAt: string;
};

type ConsentContextValue = {
  hasDecision: boolean;
  bannerOpen: boolean;
  acceptEssential: () => void;
  openConsentSettings: () => void;
  closeConsentSettings: () => void;
};

const CONSENT_STORAGE_KEY = "vtp-essential-consent-v1";
const CONSENT_VERSION = "2026-02-18";

const parseStoredConsent = (value: string | null): StoredConsent | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<StoredConsent>;

    if (
      typeof parsed.version !== "string" ||
      typeof parsed.acceptedAt !== "string"
    ) {
      return null;
    }

    if (parsed.version !== CONSENT_VERSION) {
      return null;
    }

    return parsed as StoredConsent;
  } catch {
    return null;
  }
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [storedConsent, setStoredConsent] = useState<StoredConsent | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return parseStoredConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  });
  const [bannerOpen, setBannerOpen] = useState<boolean>(() => !storedConsent);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!storedConsent) {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(storedConsent));
  }, [storedConsent]);

  const value = useMemo<ConsentContextValue>(
    () => ({
      hasDecision: Boolean(storedConsent),
      bannerOpen,
      acceptEssential: () => {
        setStoredConsent({
          version: CONSENT_VERSION,
          acceptedAt: new Date().toISOString(),
        });
        setBannerOpen(false);
      },
      openConsentSettings: () => setBannerOpen(true),
      closeConsentSettings: () => {
        if (storedConsent) {
          setBannerOpen(false);
        }
      },
    }),
    [bannerOpen, storedConsent],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export const useConsent = () => {
  const context = useContext(ConsentContext);

  if (!context) {
    throw new Error("useConsent must be used within ConsentProvider");
  }

  return context;
};
