"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Wallet } from "lucide-react";

export default function ConnectPetraWallet() {
  const { connect, connected, disconnect, wallets } = useWallet();

  const petraWallet = wallets.find(wallet => wallet.name === "Petra");

  if (!petraWallet) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <Wallet className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-2">Petra Wallet not found</p>
        <a
          href="https://petra.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Install Petra Wallet
        </a>
      </div>
    );
  }

  if (connected) {
    return (
      <button
        onClick={() => disconnect()}
        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
      >
        Disconnect Petra
      </button>
    );
  }

  return (
    <button
      onClick={() => connect(petraWallet.name)}
      className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
    >
      Connect Petra Wallet
    </button>
  );
} 