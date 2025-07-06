"use client";

import { Key, Wallet, ArrowRight } from "lucide-react";
import ConnectPetraWallet from "./ConnectPetraWallet";

interface WalletOptionsProps {
  onCreateKeyless: () => void;
}

export default function WalletOptions({ onCreateKeyless }: WalletOptionsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Wallet</h2>
        <p className="text-gray-600">Select how you want to interact with the Aptos blockchain</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Keyless Account Option */}
        <div className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group" onClick={onCreateKeyless}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Keyless Account</h3>
              <p className="text-sm text-gray-500">No seed phrase needed</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Secured by Google account</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>No private key management</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Easy recovery process</span>
            </li>
          </ul>
        </div>

        {/* Petra Wallet Option */}
        <div className="border border-gray-200 rounded-xl p-6 hover:border-orange-300 hover:shadow-md transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Petra Wallet</h3>
              <p className="text-sm text-gray-500">Browser extension</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-600 mb-4">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
              <span>Full wallet control</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
              <span>Multiple networks support</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
              <span>Advanced features</span>
            </li>
          </ul>
          <ConnectPetraWallet />
        </div>
      </div>
    </div>
  );
} 