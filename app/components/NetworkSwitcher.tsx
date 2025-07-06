"use client";

import { Network } from "lucide-react";

interface NetworkSwitcherProps {
  network: string;
  setNetwork: (network: string) => void;
  networks: { label: string; value: string }[];
}

export default function NetworkSwitcher({ network, setNetwork, networks }: NetworkSwitcherProps) {
  const getNetworkColor = (net: string) => {
    switch (net) {
      case "mainnet": return "border-green-200 bg-green-50 text-green-800";
      case "testnet": return "border-yellow-200 bg-yellow-50 text-yellow-800";
      case "devnet": return "border-purple-200 bg-purple-50 text-purple-800";
      default: return "border-gray-200 bg-gray-50 text-gray-800";
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Network className="w-5 h-5 text-gray-600" />
        <span className="font-medium text-gray-900">Network:</span>
      </div>
      <div className="flex gap-2">
        {networks.map(n => (
          <button
            key={n.value}
            onClick={() => setNetwork(n.value)}
            className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
              network === n.value
                ? getNetworkColor(n.value)
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {n.label}
          </button>
        ))}
      </div>
    </div>
  );
} 