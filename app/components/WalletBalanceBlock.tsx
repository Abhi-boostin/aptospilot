"use client";

import { useState, useEffect } from "react";
import { DollarSign, Coins, Globe } from "lucide-react";
import axios from "axios";

const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "INR", symbol: "₹" },
  { code: "JPY", symbol: "¥" },
  { code: "AUD", symbol: "A$" },
];

interface WalletBalanceBlockProps {
  aptBalance: number;
  aptPriceUsd: number;
}

export default function WalletBalanceBlock({ aptBalance, aptPriceUsd }: WalletBalanceBlockProps) {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [conversionRates, setConversionRates] = useState<{ [key: string]: number }>({ USD: 1 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true);
      try {
        const res = await axios.get("https://api.exchangerate-api.com/v4/latest/USD");
        setConversionRates(res.data.rates);
      } catch {}
      setLoading(false);
    };
    fetchRates();
  }, []);

  const usdValue = aptBalance * aptPriceUsd;
  const convertedValue = selectedCurrency === "USD"
    ? usdValue
    : usdValue * (conversionRates[selectedCurrency] || 1);
  const currencySymbol = CURRENCIES.find(c => c.code === selectedCurrency)?.symbol || selectedCurrency;

  return (
    <div className="w-full bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col md:flex-row items-center gap-6 mb-6">
      <div className="flex-1 flex flex-col gap-2 items-start">
        <div className="flex items-center gap-3">
          <Coins className="w-6 h-6 text-green-600" />
          <span className="text-lg font-semibold text-gray-900">{aptBalance.toFixed(4)} APT</span>
        </div>
        <div className="flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <span className="text-base text-gray-700 font-medium">${usdValue.toFixed(2)} USD</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 items-end">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-gray-400" />
          <select
            value={selectedCurrency}
            onChange={e => setSelectedCurrency(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code}</option>
            ))}
          </select>
        </div>
        <div className="text-xl font-bold text-gray-900 min-h-[28px]">
          {loading ? "..." : `${currencySymbol}${convertedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${selectedCurrency}`}
        </div>
      </div>
    </div>
  );
} 