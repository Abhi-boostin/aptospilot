"use client";

import { Wallet, Network, Coins, Key, Shield, DollarSign } from "lucide-react";

interface WalletStatusProps {
  network: string;
  balance: string;
  walletType: "keyless" | "petra" | null;
  address?: string;
  publicKey?: string;
  aptPrice?: number;
  usdBalance?: number;
}

export default function WalletStatus({ 
  network, 
  balance, 
  walletType, 
  address, 
  publicKey, 
  aptPrice = 0, 
  usdBalance = 0 
}: WalletStatusProps) {
  const getNetworkColor = (net: string) => {
    switch (net) {
      case "mainnet": return "bg-green-100 text-green-800 border-green-200";
      case "testnet": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "devnet": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getWalletIcon = () => {
    return walletType === "keyless" ? <Key className="w-5 h-5" /> : <Wallet className="w-5 h-5" />;
  };

  const getWalletLabel = () => {
    return walletType === "keyless" ? "Keyless Account" : "Petra Wallet";
  };

  const formatAddress = (addr: string) => {
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Network Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Network className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Network</h3>
            <p className="text-sm text-gray-500">Current connection</p>
          </div>
        </div>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getNetworkColor(network)}`}>
          {network.charAt(0).toUpperCase() + network.slice(1)}
        </div>
      </div>

      {/* APT Balance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">APT Balance</h3>
            <p className="text-sm text-gray-500">Available tokens</p>
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {(parseFloat(balance) / 100000000).toFixed(4)} APT
        </div>
        {aptPrice > 0 && (
          <div className="text-sm text-gray-500 mt-1">
            ${aptPrice.toFixed(2)} per APT
          </div>
        )}
      </div>

      {/* USD Balance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">USD Value</h3>
            <p className="text-sm text-gray-500">Current worth</p>
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          ${usdBalance.toFixed(2)}
        </div>
        {usdBalance > 0 && (
          <div className="text-sm text-gray-500 mt-1">
            Live price
          </div>
        )}
      </div>

      {/* Wallet Type */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            {getWalletIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Wallet</h3>
            <p className="text-sm text-gray-500">Connection type</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{getWalletLabel()}</span>
          {walletType === "keyless" && (
            <Shield className="w-4 h-4 text-green-600" />
          )}
        </div>
        {address && (
          <p className="text-xs text-gray-500 mt-1 font-mono">
            {formatAddress(address)}
          </p>
        )}
      </div>
    </div>
  );
} 