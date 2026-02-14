import { useMemo, useState } from "react";
import {
  CURRENCIES,
  type CurrencyCode,
  useStorefront,
} from "../context/StorefrontContext";

const formatCurrency = (value: number, currency: CurrencyCode) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);

export default function CurrencyConverter() {
  const { account, convertCurrency, ratesStatus } = useStorefront();
  const [amount, setAmount] = useState("25");
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>("USD");
  const [toCurrency, setToCurrency] = useState<CurrencyCode>(
    account.preferredCurrency
  );

  const parsed = Number(amount);
  const converted = useMemo(() => {
    return convertCurrency(parsed, fromCurrency, toCurrency);
  }, [convertCurrency, parsed, fromCurrency, toCurrency]);

  return (
    <div className="card converter-card">
      <h3>Currency Converter</h3>
      <p className="muted">
        Checkout is handled by Payhip. Use this for quick currency estimates.
      </p>
      <div className="converter-grid">
        <label>
          Amount
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </label>
        <label>
          From
          <select
            value={fromCurrency}
            onChange={(event) =>
              setFromCurrency(event.target.value as CurrencyCode)
            }
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          To
          <select
            value={toCurrency}
            onChange={(event) => setToCurrency(event.target.value as CurrencyCode)}
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="converter-output">
        {Number.isFinite(parsed) && converted !== null
          ? `${formatCurrency(parsed, fromCurrency)} = ${formatCurrency(
              converted,
              toCurrency
            )}`
          : "Enter a valid amount to convert."}
      </p>
      {ratesStatus === "error" && (
        <p className="muted">
          Live rates unavailable. Showing fallback conversion values.
        </p>
      )}
    </div>
  );
}
