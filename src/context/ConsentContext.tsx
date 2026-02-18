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
  decidedAt: string;
  mode: "essential_only" | "decline_non_essential";
};

type ConsentContextValue = {
  hasDecision: boolean;
  bannerOpen: boolean;
  acceptEssential: () => void;
  declineNonEssential: () => void;
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
    const parsed = JSON.parse(value) as Partial<StoredConsent> & {
      acceptedAt?: string;
    };

    if (typeof parsed.version !== "string") {
      return null;
    }

    if (parsed.version !== CONSENT_VERSION) {
      return null;
    }

    if (
      parsed.mode === "essential_only" ||
      parsed.mode === "decline_non_essential"
    ) {
      if (typeof parsed.decidedAt !== "string") {
        return null;
      }

      return parsed as StoredConsent;
    }

    // Backward compatibility for older consent payload shape.
    if (typeof parsed.acceptedAt === "string") {
      return {
        version: parsed.version,
        decidedAt: parsed.acceptedAt,
        mode: "essential_only",
      };
    }

    return null;
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
          decidedAt: new Date().toISOString(),
          mode: "essential_only",
        });
        setBannerOpen(false);
      },
      declineNonEssential: () => {
        setStoredConsent({
          version: CONSENT_VERSION,
          decidedAt: new Date().toISOString(),
          mode: "decline_non_essential",
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
